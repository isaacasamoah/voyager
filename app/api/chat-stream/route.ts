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
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getCommunityConfig, getCommunitySystemPrompt } from '@/lib/communities'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId, communityId = 'careersy', mode = 'navigator', previousMode, incomingHistory } = await req.json()

    // Validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
    }

    // Get community config
    const communityConfig = getCommunityConfig(communityId)
    if (!communityConfig) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    // Build system prompt from community config
    let systemPrompt = getCommunitySystemPrompt(communityConfig, { mode })

    // Voyager: No auth required, no conversation history
    if (communityId === 'voyager') {
      const result = streamText({
        model: anthropic('claude-sonnet-4-20250514'),
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
      model: anthropic('claude-sonnet-4-20250514'),
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
