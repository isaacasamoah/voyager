import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getModelConfig } from '@/lib/ai-models'
import { streamAIModel, ChatMessage } from '@/lib/ai-providers'
import { getCommunityConfig, getCommunitySystemPrompt } from '@/lib/communities'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { anchorId, message } = await req.json()

    if (!anchorId || !message) {
      return new Response(JSON.stringify({ error: 'Missing anchorId or message' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Fetch the context anchor
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

    // Get community configuration for modular prompt composition
    const communityConfig = getCommunityConfig(anchor.communityId)
    if (!communityConfig) {
      return new Response(JSON.stringify({ error: 'Community not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Fetch ALL context anchors for this user/community (to give Shipwright full context)
    const allAnchors = await prisma.contextAnchor.findMany({
      where: {
        userId: user.id,
        communityId: anchor.communityId
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get model configuration (uses env DEFAULT_AI_MODEL or defaults to claude-sonnet)
    const modelConfig = getModelConfig()

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let version = 1
          let fullResponse = ''
          let updatedMarkdown = anchor.contentMarkdown

          // === MODULAR PROMPT COMPOSITION (Voyager Pattern) ===

          // 1. Get base community system prompt with Shipwright mode
          let systemPrompt = getCommunitySystemPrompt(communityConfig, { mode: 'shipwright' })

          // 2. Add CRITICAL instruction about which document to edit
          systemPrompt += `\n\n## 🎯 YOUR TASK: Edit This Specific Document

**DOCUMENT YOU ARE EDITING:** ${anchor.filename}

This is the ONLY document you should modify. DO NOT edit any other documents shown below.

\`\`\`markdown
${anchor.contentMarkdown}
\`\`\``

          // Add other context anchors if they exist
          const otherAnchors = allAnchors.filter(a => a.id !== anchor.id)
          if (otherAnchors.length > 0) {
            systemPrompt += `\n\n## 📚 Reference Documents (DO NOT EDIT THESE)

These are for context only. Use them to understand the user's background, but NEVER modify them:
`
            otherAnchors.forEach((otherAnchor, index) => {
              systemPrompt += `\n### ${index + 1}. ${otherAnchor.filename} (Reference Only)\n\`\`\`markdown\n${otherAnchor.contentMarkdown}\n\`\`\`\n`
            })
          }

          // 3. Add dual-channel explanation
          systemPrompt += `\n\n## 📺 DUAL-CHANNEL OUTPUT (Context Anchor Editing)

You are editing a document in a modal with TWO output channels:

**LEFT PANE (Chat):**
- Brief explanations (1-2 sentences)
- Questions for clarification
- Rationale when it teaches

**RIGHT PANE (Preview - UPDATED_DOCUMENT marker):**
- The full updated document
- Updates live as you make changes
- MANDATORY for every edit

**CRITICAL:**
- NEVER paste the full document in chat - that's what preview is for
- Chat = conversation. Preview = artifact.
- Use BOTH channels on every edit.
`

          // 4. Add Shipwright-specific editing instructions
          systemPrompt += `\n\n## ✏️ Editing Protocol (MANDATORY)

**CRITICAL: Every response that makes changes MUST include the UPDATED_DOCUMENT section.**

When the user asks you to edit "${anchor.filename}":

1. **Briefly** acknowledge what you're changing (1-2 sentences max)
2. **Immediately** provide the UPDATED_DOCUMENT section with the full updated content

**Response Format (REQUIRED):**

[1-2 sentence explanation of what you changed]

UPDATED_DOCUMENT:
\`\`\`markdown
[The COMPLETE updated content of ${anchor.filename}]
\`\`\`

**Rules:**
- ✅ ALWAYS include the UPDATED_DOCUMENT section when making changes
- ✅ Return the FULL document, not just changed parts
- ✅ Only edit "${anchor.filename}" - NEVER modify reference documents
- ❌ DO NOT just describe changes - you MUST provide the updated document
- ❌ DO NOT ask permission to make changes - just make them
- ❌ DO NOT edit or mention other documents unless specifically asked

**If the request is unclear:** Ask ONE clarifying question, then wait for response.`

          // Build messages array
          const messages: ChatMessage[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ]

          // Stream AI response using configurable model
          const aiStream = streamAIModel(modelConfig, messages)

          // State machine for filtering UPDATED_DOCUMENT from chat
          let streamState: 'BEFORE_MARKER' | 'IN_DOCUMENT' | 'AFTER_MARKER' = 'BEFORE_MARKER'
          let documentBuffer = ''

          for await (const textChunk of aiStream) {
            fullResponse += textChunk

            // Check if we've hit the UPDATED_DOCUMENT marker
            if (streamState === 'BEFORE_MARKER' && fullResponse.includes('UPDATED_DOCUMENT:')) {
              streamState = 'IN_DOCUMENT'

              // Send only the text BEFORE the marker to chat
              const beforeMarker = fullResponse.split('UPDATED_DOCUMENT:')[0]
              const alreadySent = fullResponse.length - textChunk.length
              const newChatContent = beforeMarker.substring(alreadySent)

              if (newChatContent) {
                const data = JSON.stringify({
                  type: 'message',
                  content: newChatContent
                })
                controller.enqueue(encoder.encode(`data: ${data}\n\n`))
              }
              continue
            }

            // If we're in document mode, buffer instead of streaming to chat
            if (streamState === 'IN_DOCUMENT') {
              documentBuffer += textChunk
              continue
            }

            // Otherwise, stream to chat normally
            if (streamState === 'BEFORE_MARKER') {
              const data = JSON.stringify({
                type: 'message',
                content: textChunk
              })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          // Check if response contains updated document
          const updateMarker = 'UPDATED_DOCUMENT:'
          if (fullResponse.includes(updateMarker)) {
            // Extract updated markdown
            const afterMarker = fullResponse.split(updateMarker)[1]
            const codeBlockMatch = afterMarker.match(/```markdown\n([\s\S]*?)```/)

            if (codeBlockMatch && codeBlockMatch[1]) {
              updatedMarkdown = codeBlockMatch[1].trim()

              // Save updated markdown to database
              await prisma.contextAnchor.update({
                where: { id: anchorId },
                data: { contentMarkdown: updatedMarkdown }
              })

              // Send markdown update to client
              const data = JSON.stringify({
                type: 'markdown_update',
                content: updatedMarkdown,
                anchorId: anchorId,
                version: version
              })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          // Send done signal
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
          controller.close()

        } catch (error) {
          console.error('Shipwright streaming error:', error)
          const errorData = JSON.stringify({
            type: 'error',
            message: error instanceof Error ? error.message : 'Streaming failed'
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
    console.error('Shipwright chat error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
