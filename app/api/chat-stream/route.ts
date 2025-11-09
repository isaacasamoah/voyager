/**
 * Streaming Chat API - Elegant Implementation
 *
 * Design Philosophy (from /play):
 * - Use Vercel AI SDK for ONE thing: streaming bytes from AI model
 * - Keep all our business logic: auth, community config, resume context
 * - Separate streaming (fast UX) from database saves (don't block user)
 *
 * This endpoint ONLY streams. Database saves happen client-side after.
 */

import { NextRequest, NextResponse } from 'next/server'
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getCommunityConfig, getCommunitySystemPrompt } from '@/lib/communities'
import { FEATURE_FLAGS } from '@/lib/features'
import { parseCommand } from '@/lib/commands'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId, communityId = 'careersy', mode = 'navigator', previousMode, incomingHistory, abTestMode } = await req.json()

    // Validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
    }

    // Check for commands (mode switching, help, etc.)
    const commandResult = parseCommand(message)
    if (commandResult.isCommand && commandResult.responseMessage) {
      // Return command response with mode change metadata
      return NextResponse.json({
        message: commandResult.responseMessage,
        modeChanged: !!commandResult.mode,
        newMode: commandResult.mode,
        isCommandResponse: true
      })
    }

    // Get community config
    const communityConfig = getCommunityConfig(communityId)
    if (!communityConfig) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    // Select model based on community and A/B test mode (runtime toggle)
    // Use runtime abTestMode from request, fallback to static flag if not provided
    const effectiveMode = abTestMode || (communityId === 'careersy' ? FEATURE_FLAGS.CAREERSY_MODE : 'full')
    const isBasicMode = communityId === 'careersy' && effectiveMode === 'basic'
    const model = isBasicMode
      ? openai('gpt-4o')  // Basic mode: GPT + domain expertise only
      : anthropic('claude-sonnet-4-20250514')  // Full Voyager mode

    // Build system prompt from community config (pass abTestMode for constitutional layer control)
    let systemPrompt = getCommunitySystemPrompt(communityConfig, { mode, communityId, abTestMode: effectiveMode })

    // Voyager: No auth required, no conversation history
    if (communityId === 'voyager') {
      const result = streamText({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
      })

      return result.toTextStreamResponse()
    }

    // For other communities: Require authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check community membership
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { communities: true, resumeText: true },
    })

    if (!user?.communities.includes(communityId)) {
      return NextResponse.json({ error: 'Not a member of this community' }, { status: 403 })
    }

    // Add resume context if available (all modes benefit from context)
    if (user?.resumeText) {
      systemPrompt += `\n\nUser's Resume:\n${user.resumeText}\n\nUse this resume to provide personalized advice based on their actual experience, skills, and background.`
    }

    // Add context anchors (uploaded documents)
    const contextAnchors = await prisma.contextAnchor.findMany({
      where: {
        userId: session.user.id,
        communityId: communityId,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        filename: true,
        fileType: true,
        contentMarkdown: true,
      },
    })

    if (contextAnchors.length > 0) {
      systemPrompt += '\n\n## Reference Documents\n\nThe user has provided the following documents for context:\n\n'
      contextAnchors.forEach((anchor, index) => {
        systemPrompt += `### Document ${index + 1}: ${anchor.filename}\n\n${anchor.contentMarkdown}\n\n`
      })
      systemPrompt += 'Use these documents to provide personalized, context-aware guidance. Reference specific details from these documents when relevant.'
    }

    // Get conversation history
    // If incoming history provided (e.g., ephemeral draft mode), use it
    // Otherwise, load from database
    let conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []

    if (incomingHistory && Array.isArray(incomingHistory)) {
      // Use ephemeral messages passed from frontend
      conversationHistory = incomingHistory
    } else if (conversationId) {
      // Load from database
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId, userId: session.user.id },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 20 // Limit context window
          }
        }
      })

      if (conversation && conversation.communityId === communityId) {
        conversationHistory = conversation.messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      }
    }

    // Handle mode switching - add transition context if mode just changed
    if (previousMode && previousMode !== mode) {
      // Add a system message explaining the mode transition
      conversationHistory.push({
        role: 'assistant',
        content: `[Mode Switch: You just switched from ${previousMode} mode to ${mode} mode. Continue the conversation naturally while maintaining awareness of everything we've discussed. Adapt to your new role in ${mode} mode while preserving context from our previous conversation.]`
      })
    }

    // Stream response using Vercel AI SDK
    const result = streamText({
      model, // Uses model selected earlier (GPT for basic mode, Claude for full Voyager)
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: message }
      ],
    })

    return result.toTextStreamResponse()

  } catch (error) {
    console.error('❌ Chat Stream API Error:', error)

    return NextResponse.json(
      {
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
