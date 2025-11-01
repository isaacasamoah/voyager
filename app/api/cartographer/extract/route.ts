/**
 * Cartographer Knowledge Extraction API
 *
 * Extracts structured knowledge from completed Cartographer sessions
 * and stores it in the database for AI enhancement pipeline.
 *
 * Trigger: Automatically when AI includes [SESSION_COMPLETE] marker
 * Or: Manual POST for testing/debugging
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getCommunityConfig } from '@/lib/communities'
import { buildCartographerExtractionPrompt } from '@/../../.lab/experiments/002-cartographer-ai-pipeline/extraction-prompt'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
})

interface ExtractionRequest {
  conversationId: string
  expertEmail?: string
  communityId?: string
}

/**
 * POST /api/cartographer/extract
 *
 * Extract knowledge from a Cartographer conversation
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ExtractionRequest = await request.json()
    const { conversationId, expertEmail, communityId } = body

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId required' },
        { status: 400 }
      )
    }

    // Get conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        user: true
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Use provided values or infer from conversation
    const extractExpertEmail = expertEmail || conversation.user.email || session.user.email
    const extractCommunityId = communityId || conversation.communityId

    // Get community config
    const config = getCommunityConfig(extractCommunityId)
    if (!config) {
      return NextResponse.json(
        { error: `Community ${extractCommunityId} not found` },
        { status: 404 }
      )
    }

    // Check if expert is authorized
    if (!config.experts.includes(extractExpertEmail)) {
      return NextResponse.json(
        { error: 'User is not a verified expert for this community' },
        { status: 403 }
      )
    }

    // Format messages for extraction
    const messages = conversation.messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
      timestamp: m.createdAt.toISOString()
    }))

    if (messages.length < 3) {
      return NextResponse.json(
        { error: 'Conversation too short for extraction (need at least 3 messages)' },
        { status: 400 }
      )
    }

    // Build extraction prompt
    const extractionPrompt = buildCartographerExtractionPrompt(config, messages)

    console.log(`🧬 Extracting knowledge from conversation ${conversationId}...`)

    // Call LLM to extract
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.3, // Lower temperature for structured output
      messages: [
        {
          role: 'user',
          content: extractionPrompt
        }
      ]
    })

    const extractedContent = response.content[0]?.type === 'text'
      ? response.content[0].text
      : ''

    if (!extractedContent) {
      throw new Error('No content in extraction response')
    }

    // Parse JSON
    let extracted
    try {
      extracted = JSON.parse(extractedContent)
    } catch (parseError) {
      console.error('Failed to parse extraction JSON:', extractedContent)
      throw new Error('Extraction produced invalid JSON')
    }

    // Validate required fields
    if (!extracted.topic || !Array.isArray(extracted.insights)) {
      throw new Error('Extraction missing required fields (topic, insights)')
    }

    // Generate session ID
    const sessionId = crypto.randomUUID()

    // Save to database
    const cartographerSession = await prisma.cartographerSession.create({
      data: {
        sessionId,
        expertEmail: extractExpertEmail,
        communityId: extractCommunityId,
        timestamp: new Date(),
        topic: extracted.topic,
        messages: messages,
        insights: extracted.insights || [],
        promptUpdates: extracted.promptUpdates || [],
        ragEntries: extracted.ragEntries || [],
        finetuningExamples: extracted.finetuningExamples || [],
        processed: false // Manual review needed before applying
      }
    })

    console.log(`✅ Extracted knowledge: ${extracted.topic}`)
    console.log(`   - ${extracted.insights?.length || 0} insights`)
    console.log(`   - ${extracted.promptUpdates?.length || 0} prompt updates`)
    console.log(`   - ${extracted.ragEntries?.length || 0} RAG entries`)
    console.log(`   - ${extracted.finetuningExamples?.length || 0} fine-tuning examples`)

    return NextResponse.json({
      success: true,
      sessionId: cartographerSession.id,
      topic: extracted.topic,
      counts: {
        insights: extracted.insights?.length || 0,
        promptUpdates: extracted.promptUpdates?.length || 0,
        ragEntries: extracted.ragEntries?.length || 0,
        finetuningExamples: extracted.finetuningExamples?.length || 0
      }
    })

  } catch (error) {
    console.error('Cartographer extraction error:', error)
    return NextResponse.json(
      {
        error: 'Extraction failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
