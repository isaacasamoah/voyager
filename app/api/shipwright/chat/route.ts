/**
 * Shipwright Chat API - Clean Conversation Only
 *
 * Purpose: Handle conversation between user and AI about document editing
 * Scope: ONLY chat - no document updates, no surgical updates
 *
 * Document updates happen via /api/shipwright/update when user types /update command
 */

import { NextRequest, NextResponse } from 'next/server'
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

    const { anchorId, message, conversationHistory } = await req.json()

    if (!anchorId || !message) {
      return new Response(JSON.stringify({ error: 'Missing anchorId or message' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check for /update command
    if (message.trim() === '/update') {
      // Return a special response telling frontend to trigger update
      return new Response(JSON.stringify({
        type: 'command',
        command: 'update',
        message: 'Updating document...'
      }), {
        status: 200,
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
          // === MODULAR PROMPT COMPOSITION (Voyager Pattern) ===

          // 1. Get base community system prompt with Shipwright mode
          let systemPrompt = getCommunitySystemPrompt(communityConfig, { mode: 'shipwright' })

          // 2. Add CRITICAL instruction about which document to edit
          systemPrompt += `\n\n## 🎯 YOUR TASK: Discuss Document Edits

**DOCUMENT YOU ARE DISCUSSING:** ${anchor.filename}

**CURRENT DOCUMENT:**
\`\`\`markdown
${anchor.contentMarkdown}
\`\`\`

**YOUR ROLE:**
You are discussing potential changes to this document with the user. Your job is to:
1. Understand what they want to change
2. Propose specific improvements
3. Explain WHY changes will make the document better
4. Get their approval before making changes

**IMPORTANT - DO NOT MAKE CHANGES YET:**
- This is CONVERSATION ONLY - you're discussing what to change
- When user approves changes, tell them to type: /update
- The /update command will apply the changes we've discussed
- DO NOT include UPDATED_SECTION or UPDATED_DOCUMENT markers
- Just have a natural conversation about improvements`

          // Add other context anchors if they exist
          const otherAnchors = allAnchors.filter(a => a.id !== anchor.id)
          if (otherAnchors.length > 0) {
            systemPrompt += `\n\n## 📚 Other Available Documents (Reference Only)

The user has uploaded other documents you can reference for context (but NOT edit):

`
            otherAnchors.forEach((otherAnchor, index) => {
              systemPrompt += `### Document ${index + 1}: ${otherAnchor.filename}
\`\`\`markdown
${otherAnchor.contentMarkdown.substring(0, 500)}...
\`\`\`

`
            })
            systemPrompt += `\nRemember: You can ONLY edit "${anchor.filename}". Other documents are for reference.`
          }

          // 3. Add Shipwright interaction guidelines
          systemPrompt += `\n\n## 💬 Conversation Style

**Propose, Don't Preach:**
- "I'd suggest adding metrics to your Atlassian role - hiring managers respond well to quantified impact."
- "Your education section could highlight your thesis work - it's relevant to ML roles."
- NOT: "You should definitely add this..." or "Here's what I think..."

**Get Approval:**
- After proposing changes, ALWAYS ask: "Does this sound good? If yes, type /update to apply these changes."
- IMPORTANT: You MUST tell users to type /update when they agree
- If they want modifications, revise your proposal
- When user says "yes", "sounds good", "go ahead", etc., respond: "Perfect! Type /update to apply these changes."

**Stay Focused:**
- One proposal at a time
- Clear explanation of WHY it helps
- Wait for feedback before proposing more changes

**When User Agrees:**
Your EXACT response should be: "Great! Type /update to apply these changes to your document."

**REMEMBER:** You CANNOT make changes directly. Users MUST type /update command.`

          console.log(`🤖 Shipwright Chat Mode: ${anchor.filename}`)

          // Build messages array with conversation history
          const messages: ChatMessage[] = [
            { role: 'system', content: systemPrompt }
          ]

          // Add conversation history if provided (maintains context across turns)
          if (conversationHistory && Array.isArray(conversationHistory)) {
            conversationHistory.forEach((msg: any) => {
              // Only include user and assistant messages (system prompt is already added)
              if (msg.role === 'user' || msg.role === 'assistant') {
                messages.push({
                  role: msg.role,
                  content: msg.content
                })
              }
            })
          }

          // Add current user message
          messages.push({ role: 'user', content: message })

          // Stream AI response (just conversation - no document updates)
          const aiStream = streamAIModel(modelConfig, messages)

          for await (const textChunk of aiStream) {
            // Stream chat content directly to client
            const data = JSON.stringify({
              type: 'message',
              content: textChunk
            })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          }

          // Send done signal
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
          controller.close()

        } catch (error) {
          console.error('Shipwright chat streaming error:', error)
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
    console.error('❌ Shipwright Chat API Error:', error)

    return NextResponse.json(
      {
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
