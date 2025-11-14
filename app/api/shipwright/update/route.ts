/**
 * Shipwright Update API - Clean Separation Pattern
 *
 * Purpose: Generate updated document based on conversation context
 * Flow:
 *   1. Receive conversation history + current document
 *   2. Stream progress events (0-100%)
 *   3. Generate full updated document
 *   4. Return complete document with change metadata
 *
 * No surgical updates. No parsing chat mid-stream. Just clean document generation.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getCommunityConfig, getCommunitySystemPrompt } from '@/lib/communities'
import { getModelConfig } from '@/lib/ai-models'
import { streamAIModel } from '@/lib/ai-providers'

export const dynamic = 'force-dynamic'

interface UpdateRequest {
  anchorId: string
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
}

export async function POST(req: NextRequest) {
  try {
    // Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { anchorId, conversationHistory }: UpdateRequest = await req.json()

    if (!anchorId || !conversationHistory) {
      return new Response(JSON.stringify({ error: 'Missing anchorId or conversationHistory' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Fetch the context anchor (document)
    const anchor = await prisma.contextAnchor.findUnique({
      where: { id: anchorId },
    })

    if (!anchor) {
      return new Response(JSON.stringify({ error: 'Context anchor not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Verify ownership
    if (anchor.userId !== user.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get community configuration
    const communityConfig = getCommunityConfig(anchor.communityId)
    if (!communityConfig) {
      return new Response(JSON.stringify({ error: 'Community not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get model configuration
    const modelConfig = getModelConfig()

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Build system prompt
          let systemPrompt = getCommunitySystemPrompt(communityConfig, { mode: 'shipwright' })

          // Add document context
          systemPrompt += `\n\n## 🎯 YOUR TASK: Update This Document

**DOCUMENT YOU ARE EDITING:** ${anchor.filename}

**CURRENT DOCUMENT:**
\`\`\`markdown
${anchor.contentMarkdown}
\`\`\`

**INSTRUCTIONS:**
Based on the conversation history, generate the COMPLETE updated document incorporating all agreed-upon changes.

- Output the FULL document (not just changed sections)
- Maintain all formatting and structure
- Apply ALL changes discussed in the conversation
- Do NOT explain your changes (just output the document)
- Start your response with: UPDATED_DOCUMENT_START
- End your response with: UPDATED_DOCUMENT_END

**FORMAT:**
\`\`\`
UPDATED_DOCUMENT_START
[your complete updated markdown document]
UPDATED_DOCUMENT_END
\`\`\`
`

          // Build messages array
          const messages = [
            { role: 'system' as const, content: systemPrompt },
            ...conversationHistory,
            {
              role: 'user' as const,
              content: 'Generate the updated document now. Remember to wrap it in UPDATED_DOCUMENT_START and UPDATED_DOCUMENT_END markers.'
            }
          ]

          // Stream AI response
          let fullResponse = ''
          let tokensGenerated = 0
          const estimatedTokens = 1000 // Rough estimate for progress
          let lastProgressSent = 0

          console.log('🔄 Starting document update generation...')

          // Send initial progress
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'progress',
            percent: 0,
            status: 'Analyzing conversation context...'
          })}\n\n`))

          const aiStream = streamAIModel(modelConfig, messages)

          for await (const chunk of aiStream) {
            fullResponse += chunk
            tokensGenerated += chunk.length

            // Calculate progress (cap at 90% until complete)
            const rawProgress = Math.min(0.9, tokensGenerated / estimatedTokens)
            const progress = Math.floor(rawProgress * 100) / 100

            // Send progress update every 10% or significant status change
            if (progress - lastProgressSent >= 0.1) {
              const status = getProgressStatus(progress)
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'progress',
                percent: progress,
                status
              })}\n\n`))
              lastProgressSent = progress
              console.log(`📊 Progress: ${Math.round(progress * 100)}% - ${status}`)
            }
          }

          // Extract the document from markers
          const docMatch = fullResponse.match(/UPDATED_DOCUMENT_START\s*([\s\S]*?)\s*UPDATED_DOCUMENT_END/)

          if (!docMatch || !docMatch[1]) {
            throw new Error('AI did not return document in expected format')
          }

          const updatedDocument = docMatch[1].trim()

          // Save to database
          await prisma.contextAnchor.update({
            where: { id: anchorId },
            data: { contentMarkdown: updatedDocument }
          })

          console.log('✅ Document updated and saved')

          // Send completion with document
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'complete',
            percent: 1.0,
            status: 'Update complete!',
            document: updatedDocument,
            anchorId: anchorId
          })}\n\n`))

          controller.close()

        } catch (error) {
          console.error('❌ Update API Error:', error)
          const errorData = JSON.stringify({
            type: 'error',
            message: error instanceof Error ? error.message : 'Update failed'
          })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('❌ Shipwright Update API Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to update document',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * Get status message based on progress percentage
 */
function getProgressStatus(progress: number): string {
  if (progress < 0.2) return 'Analyzing conversation context...'
  if (progress < 0.4) return 'Identifying changes to apply...'
  if (progress < 0.6) return 'Generating updated content...'
  if (progress < 0.8) return 'Refining document structure...'
  if (progress < 0.95) return 'Finalizing updates...'
  return 'Almost done...'
}
