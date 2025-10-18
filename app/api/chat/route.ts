import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logApi, logError } from '@/lib/logger'
import { getModelConfig } from '@/lib/ai-models'
import { callAIModel, ChatMessage } from '@/lib/ai-providers'
import { getCommunityConfig, getCommunitySystemPrompt } from '@/lib/communities'

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

    const { message, conversationId, mode = 'private', title, communityId = 'careersy' } = await req.json()

    logApi('POST /api/chat - params', {
      hasMessage: !!message,
      hasConversationId: !!conversationId,
      mode,
      hasTitle: !!title,
      communityId
    })

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
    }

    // Get community config
    const communityConfig = getCommunityConfig(communityId)
    if (!communityConfig) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    // Special handling for voyager - allow without auth
    if (communityId === 'voyager') {
      // For voyager, we don't require auth or save conversations
      // Just provide AI responses for navigation help
      let systemPrompt = getCommunitySystemPrompt(communityConfig)

      const aiMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ]

      const modelConfig = getModelConfig()
      const completion = await callAIModel(modelConfig, aiMessages)
      const assistantMessage = completion || 'I apologize, I could not generate a response.'

      return NextResponse.json({
        message: assistantMessage,
        conversationId: null,
      })
    }

    // For other communities, require authentication
    if (!session?.user) {
      logApi('POST /api/chat - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a member of this community
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { communities: true, resumeText: true },
    })

    if (!user?.communities.includes(communityId)) {
      return NextResponse.json({ error: 'Not a member of this community' }, { status: 403 })
    }

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
      // Verify conversation belongs to same community
      if (conversation.communityId !== communityId) {
        return NextResponse.json({ error: 'Conversation belongs to different community' }, { status: 403 })
      }
    } else {
      const conversationTitle = title || (message.length > 50 ? message.substring(0, 50) + '...' : message)
      conversation = await prisma.conversation.create({
        data: {
          userId: session.user.id,
          title: conversationTitle,
          isPublic: mode === 'public',
          communityId,
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

    // Get model configuration (defaults to Claude via env or hardcoded)
    const modelConfig = getModelConfig()

    // Build system prompt from community config with resume context
    let systemPrompt = getCommunitySystemPrompt(communityConfig)
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
    console.error('❌ Chat API Error:', error)
    logError('POST /api/chat', error, {
      hasSession: !!await getServerSession(authOptions),
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined
    })

    // Return more detailed error in development
    const isDev = process.env.NODE_ENV === 'development'
    return NextResponse.json(
      {
        error: 'Failed to process message',
        ...(isDev && { details: error instanceof Error ? error.message : String(error) })
      },
      { status: 500 }
    )
  }
}
