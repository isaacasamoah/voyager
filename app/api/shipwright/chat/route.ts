import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Anthropic from '@anthropic-ai/sdk'

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

    // Initialize Anthropic client
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured')
    }

    const anthropic = new Anthropic({ apiKey })

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let version = 1
          let fullResponse = ''
          let updatedMarkdown = anchor.contentMarkdown

          // System prompt for Shipwright editing
          const systemPrompt = `You are Shipwright, an AI document editor. You help users refine their documents through conversation.

Current document content:
\`\`\`markdown
${anchor.contentMarkdown}
\`\`\`

When the user asks you to edit the document:
1. Respond conversationally to acknowledge their request
2. Make the requested changes to the document
3. Return the FULL updated document in a code block with the marker UPDATED_DOCUMENT

Format your response like this:
[Your conversational response explaining what you did]

UPDATED_DOCUMENT:
\`\`\`markdown
[The complete updated document content]
\`\`\`

Important:
- Always return the FULL document, not just the changed parts
- Make precise, thoughtful edits based on the user's request
- If the request is unclear, ask for clarification instead of guessing`

          // Call Anthropic streaming API
          const anthropicStream = await anthropic.messages.stream({
            model: 'claude-3-5-sonnet-20240620',
            max_tokens: 4096,
            temperature: 0.7,
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: message
              }
            ]
          })

          // Stream response chunks
          for await (const chunk of anthropicStream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const text = chunk.delta.text
              fullResponse += text

              // Send message chunk to client
              const data = JSON.stringify({
                type: 'message',
                content: text
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
