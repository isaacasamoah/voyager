import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logApi, logError } from '@/lib/logger'
import { getModelConfig } from '@/lib/ai-models'
import { callAIModel, ChatMessage } from '@/lib/ai-providers'

// Force dynamic rendering for auth routes
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    logApi('POST /api/chat', {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email
    })

    if (!session?.user) {
      logApi('POST /api/chat - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, conversationId, mode = 'private', title } = await req.json()

    logApi('POST /api/chat - params', {
      hasMessage: !!message,
      hasConversationId: !!conversationId,
      mode,
      hasTitle: !!title
    })

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
    }

    // Get the Careersy community ID
    const community = await prisma.community.findUnique({
      where: { slug: 'careersy-career-coaching' }
    })

    logApi('POST /api/chat - community lookup', {
      foundCommunity: !!community,
      communityId: community?.id
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

    // Get model configuration (defaults to Claude via env or hardcoded)
    const modelConfig = getModelConfig()

    // Build system prompt with resume context
    let systemPrompt = modelConfig.systemPrompt
    if (user?.resumeText) {
      systemPrompt += `\n\nUser's Resume:\n${user.resumeText}\n\nUse this resume to provide personalized career advice based on their actual experience, skills, and background.`
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversation.messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
      { role: 'user', content: message }
    ]

    // Call AI model through unified interface
    const response = await callAIModel(modelConfig, messages)
    const assistantMessage = response.content

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
    logError('POST /api/chat', error, {
      hasSession: !!await getServerSession(authOptions)
    })
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
