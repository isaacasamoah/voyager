import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { openai, SYSTEM_PROMPT } from '@/lib/openai'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, conversationId, mode = 'private', title } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
    }

    // Get the Careersy community ID
    const community = await prisma.community.findUnique({
      where: { slug: 'careersy-career-coaching' }
    })

    let conversation
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId, userId: session.user.id },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 20 // Limit context window
          }
        }
      })
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }
    } else {
      const conversationTitle = title || (message.length > 50 ? message.substring(0, 50) + '...' : message)
      conversation = await prisma.conversation.create({
        data: {
          userId: session.user.id,
          title: conversationTitle,
          isPublic: mode === 'public',
          communityId: mode === 'public' && community ? community.id : null,
        },
        include: { messages: true }
      })
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        userId: session.user.id,
        role: 'user',
        content: message,
        isAiGenerated: false,
      },
    })

    // Get user's resume if available
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { resumeText: true },
    })

    // Build system prompt with resume context
    let systemPrompt = SYSTEM_PROMPT
    if (user?.resumeText) {
      systemPrompt += `\n\nUser's Resume:\n${user.resumeText}\n\nUse this resume to provide personalized career advice based on their actual experience, skills, and background.`
    }

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversation.messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
      { role: 'user' as const, content: message }
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    })

    const assistantMessage = completion.choices[0].message.content || 'I apologize, I could not generate a response.'

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: assistantMessage,
        isAiGenerated: true,
      },
    })

    return NextResponse.json({
      message: assistantMessage,
      conversationId: conversation.id,
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
