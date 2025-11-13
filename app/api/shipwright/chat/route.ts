import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getModelConfig } from '@/lib/ai-models'
import { streamAIModel, ChatMessage } from '@/lib/ai-providers'
import { getCommunityConfig, getCommunitySystemPrompt } from '@/lib/communities'

export const dynamic = 'force-dynamic'

/**
 * Merge a section update into the full document (NEW APPROACH - Header-Based Matching)
 *
 * Strategy:
 * 1. AI provides the COMPLETE section including the header (e.g., "## Work Experience\n...")
 * 2. We extract the header from the AI's content
 * 3. Find that exact header in the document
 * 4. Replace everything from that header until the next ## (or end of document)
 * 5. Much more robust - no keyword guessing, just direct header matching
 */
function mergeSectionIntoDocument(
  currentDocument: string,
  sectionId: string,
  sectionContent: string
): { success: boolean; content: string; availableHeaders?: string[] } {
  console.log('🔍 SURGICAL UPDATE DEBUG:', {
    sectionId,
    contentPreview: sectionContent.substring(0, 100) + '...',
    contentIncludesHeader: sectionContent.trim().startsWith('#')
  })

  // Special case: header section (content before first ##)
  if (sectionId === 'header') {
    const firstHeaderMatch = currentDocument.match(/\n##/)
    if (firstHeaderMatch && firstHeaderMatch.index !== undefined) {
      const restOfDocument = currentDocument.substring(firstHeaderMatch.index)
      // Strip any # markers from the content
      const cleanContent = sectionContent.replace(/^#+\s*.*\n/, '').trim()
      return { success: true, content: `${cleanContent}${restOfDocument}` }
    }
    return { success: true, content: sectionContent }
  }

  // Full document replacement
  if (sectionId === 'full_document') {
    return { success: true, content: sectionContent }
  }

  // Extract header from AI's content (if present)
  const headerMatch = sectionContent.match(/^##\s*([^\n]+)/)

  if (!headerMatch) {
    // AI didn't include a header - this shouldn't happen with new approach
    console.warn('❌ AI content missing header. Expected format: "## Section Name\\ncontent..."')
    const available = currentDocument.match(/##\s*[^\n]+/g) || []
    return {
      success: false,
      content: currentDocument,
      availableHeaders: available
    }
  }

  const aiHeaderText = headerMatch[1].trim() // e.g., "Work Experience"
  console.log('📝 AI provided header:', aiHeaderText)

  // Find this exact header in the document (case-insensitive)
  const escapedHeader = aiHeaderText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const headerRegex = new RegExp(
    `^##\\s*${escapedHeader}\\s*$`,
    'im' // case-insensitive, multiline
  )

  // Split document into lines to find the header
  const lines = currentDocument.split('\n')
  let headerLineIndex = -1

  for (let i = 0; i < lines.length; i++) {
    if (headerRegex.test(lines[i])) {
      headerLineIndex = i
      break
    }
  }

  if (headerLineIndex === -1) {
    // Header not found in document
    console.warn(`❌ Header "${aiHeaderText}" not found in document`)
    const available = currentDocument.match(/##\s*[^\n]+/g) || []
    console.warn('Available headers:', available)
    return {
      success: false,
      content: currentDocument,
      availableHeaders: available
    }
  }

  console.log(`✅ Found header at line ${headerLineIndex + 1}`)

  // Find the end of this section (next ## or end of document)
  let sectionEndIndex = lines.length
  for (let i = headerLineIndex + 1; i < lines.length; i++) {
    if (lines[i].match(/^##\s/)) {
      sectionEndIndex = i
      break
    }
  }

  console.log(`📍 Section spans lines ${headerLineIndex + 1} to ${sectionEndIndex}`)

  // Build the new document:
  // - Everything before the section
  // - The new section content (includes header)
  // - Everything after the section
  const beforeSection = lines.slice(0, headerLineIndex).join('\n')
  const afterSection = lines.slice(sectionEndIndex).join('\n')

  const newDocument = [
    beforeSection,
    sectionContent.trim(),
    afterSection
  ].filter(part => part.length > 0).join('\n\n')

  console.log('✅ Surgical update successful')
  return { success: true, content: newDocument }
}

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

          // 4. Add Shipwright-specific editing instructions (SURGICAL UPDATES)
          systemPrompt += `\n\n## ✏️ Editing Protocol (MANDATORY - Surgical Updates with Confirmation)

**CRITICAL: ALWAYS get user confirmation before making changes.**

When the user asks you to edit "${anchor.filename}":

1. **Propose the change** - Explain what you'll do and why (2-3 sentences)
2. **Ask for confirmation** - "Does this sound good? I can make this change for you."
3. **Wait for user approval** - DO NOT provide UPDATED_SECTION until user says yes
4. **After approval** - Provide the surgical update

**Two-Step Response Flow:**

**First Response - Proposal (NO UPDATE YET):**
- Explain what you propose to change and why it's better (2-3 sentences with your domain expertise)
- End with: "Does this sound good? I can make this change for you."
- DO NOT include UPDATED_SECTION yet

**Second Response - After User Confirms:**
- Provide ONLY the UPDATED_SECTION marker with the new content
- No additional explanation needed (you already explained in the proposal)
- Format:
\`\`\`
UPDATED_SECTION: <section_identifier>
\`\`\`markdown
## Exact Section Header From Document
[updated content here]
\`\`\`
\`\`\`

**CRITICAL - NEW APPROACH:**
You MUST include the COMPLETE section with its header. Copy the exact header from the document (e.g., "## Work Experience", "## Who I Am") and include it at the start of your markdown block. This ensures we match the right section.

**Section Identifiers:**
- \`header\` - Name, contact info, title/headline at top of document (don't include ## for this one)
- \`experience\` - Work experience section (include the ## header)
- \`education\` - Education section (include the ## header)
- \`skills\` - Skills section (include the ## header)
- \`projects\` - Projects section (include the ## header)
- For ANY other section: Just use any identifier and include the exact ## header from the document
- \`full_document\` - Use ONLY when user explicitly asks to rewrite entire document

**How to find the header:**
1. Look at the document in context
2. Find the section you're editing
3. Copy its ## header EXACTLY (including any emojis, special characters, etc.)
4. Include that header at the start of your UPDATED_SECTION content

**If you can't find the section:**
ASK THE USER: "I see these sections in your document: [list]. Which one should I update?"

**Examples:**

Example 1 (Header section - no ## marker):
User: "Change my title to Senior Product Manager"
You: "I'll update your title to 'Senior Product Manager' which signals increased seniority and responsibility - this is particularly important for roles requiring 5+ years of experience. Does this sound good? I can make this change for you."

User: "yes"
You:
UPDATED_SECTION: header
\`\`\`markdown
# Sarah Chen
Senior Product Manager | Melbourne, AU
sarah.chen@email.com | linkedin.com/in/sarahchen
\`\`\`

---

Example 2 (Regular section - INCLUDE the ## header):
User: "Add metrics to my Atlassian role"
You: "I'll add a quantified achievement to your Atlassian experience - something like '15% conversion lift' with dollar impact. Hiring managers in ANZ tech prioritize metrics that show business impact. Does this sound good? I can make this change for you."

User: "sounds great"
You:
UPDATED_SECTION: experience
\`\`\`markdown
## Work Experience

### Product Manager | Atlassian
*Jan 2022 - Present | Sydney, AU*
- Led checkout redesign → 15% conversion lift ($500K impact)
- Shipped 3 major features used by 10M+ users
\`\`\`

---

Example 3 (Custom section name - INCLUDE the exact ## header):
User: "Update my Who I Am section to be more compelling"
You: "I'll strengthen your 'Who I Am' section with more specific value props and personality. I'll lead with your unique edge and close with what drives you. Does this sound good?"

User: "yes"
You:
UPDATED_SECTION: any
\`\`\`markdown
## Who I Am

A product leader who turns messy problems into elegant solutions. I've spent the last 5 years at Atlassian shipping features that 10M+ people use daily - but what really drives me is the moment when complexity clicks into simplicity for users. Outside of work, you'll find me debugging terrible code in open source projects or attempting to grow tomatoes in Melbourne's unpredictable weather.
\`\`\`"

**Rules:**
- ✅ ALWAYS propose changes first - NEVER make edits without confirmation
- ✅ Use surgical updates (section-only) for targeted changes
- ✅ Only use \`full_document\` if user says "rewrite" or "start over"
- ✅ Teach through proposals - explain WHY changes work better
- ✅ Apply your ANZ tech career expertise to every proposal
- ✅ Wait for user approval ("yes", "sounds good", "go ahead", etc.) before providing UPDATED_SECTION
- ❌ DO NOT provide UPDATED_SECTION in your first response
- ❌ DO NOT regenerate sections that weren't changed
- ❌ DO NOT edit reference documents (other anchors)

**If the request is unclear:** Ask ONE clarifying question, then wait for response.

**If user wants changes after your proposal:** Revise the proposal based on their feedback, confirm again, then update.`

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

          // Stream AI response using configurable model
          const aiStream = streamAIModel(modelConfig, messages)

          // State machine for filtering UPDATED_SECTION/UPDATED_DOCUMENT from chat
          let streamState: 'BEFORE_MARKER' | 'IN_DOCUMENT' | 'AFTER_MARKER' = 'BEFORE_MARKER'
          let documentBuffer = ''
          let chatBuffer = ''  // Buffer chat content until we're sure there's no marker

          for await (const textChunk of aiStream) {
            fullResponse += textChunk

            if (streamState === 'BEFORE_MARKER') {
              chatBuffer += textChunk

              // Check if we've hit UPDATED_SECTION or UPDATED_DOCUMENT marker
              const sectionMatch = chatBuffer.match(/UPDATED_SECTION:\s*\w+/)
              const documentMatch = chatBuffer.match(/UPDATED_DOCUMENT:/)

              if (sectionMatch || documentMatch) {
                streamState = 'IN_DOCUMENT'

                // Send only the text BEFORE the marker to chat
                const markerIndex = sectionMatch ? sectionMatch.index! : documentMatch!.index!
                const beforeMarker = chatBuffer.substring(0, markerIndex)

                if (beforeMarker) {
                  const data = JSON.stringify({
                    type: 'message',
                    content: beforeMarker
                  })
                  controller.enqueue(encoder.encode(`data: ${data}\n\n`))
                }

                // Start buffering the document section
                documentBuffer = chatBuffer.substring(markerIndex)
                chatBuffer = ''
                continue
              }

              // Safe to stream if we have enough content and no partial marker detected
              // Keep last 20 chars in buffer in case marker is split across chunks
              if (chatBuffer.length > 20) {
                const safeToSend = chatBuffer.substring(0, chatBuffer.length - 20)
                chatBuffer = chatBuffer.substring(chatBuffer.length - 20)

                const data = JSON.stringify({
                  type: 'message',
                  content: safeToSend
                })
                controller.enqueue(encoder.encode(`data: ${data}\n\n`))
              }
            } else if (streamState === 'IN_DOCUMENT') {
              // Buffer document content instead of streaming to chat
              documentBuffer += textChunk
            }
          }

          // Flush any remaining chat buffer (if we never hit a marker)
          if (streamState === 'BEFORE_MARKER' && chatBuffer) {
            const data = JSON.stringify({
              type: 'message',
              content: chatBuffer
            })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          }

          // Check if response contains surgical section update
          // Support both standard keywords (e.g., "summary") and custom headers (e.g., "custom:Who I Am")
          const sectionMarkerMatch = fullResponse.match(/UPDATED_SECTION:\s*([^\s\n]+(?:\s+[^\n]+)?)/i)
          if (sectionMarkerMatch) {
            let sectionId = sectionMarkerMatch[1].trim()
            const afterMarker = fullResponse.split(sectionMarkerMatch[0])[1]
            const codeBlockMatch = afterMarker.match(/```markdown\n([\s\S]*?)```/)

            if (codeBlockMatch && codeBlockMatch[1]) {
              const sectionContent = codeBlockMatch[1].trim()

              // If full_document, replace entire document
              if (sectionId === 'full_document') {
                updatedMarkdown = sectionContent

                // Save and send update
                await prisma.contextAnchor.update({
                  where: { id: anchorId },
                  data: { contentMarkdown: updatedMarkdown }
                })

                const data = JSON.stringify({
                  type: 'markdown_update',
                  content: updatedMarkdown,
                  anchorId: anchorId,
                  version: version,
                  sectionId: sectionId
                })
                controller.enqueue(encoder.encode(`data: ${data}\n\n`))
              } else {
                // Surgical update: merge section into existing document
                const result = mergeSectionIntoDocument(
                  anchor.contentMarkdown,
                  sectionId,
                  sectionContent
                )

                if (result.success) {
                  // Success - save and send update
                  updatedMarkdown = result.content

                  await prisma.contextAnchor.update({
                    where: { id: anchorId },
                    data: { contentMarkdown: updatedMarkdown }
                  })

                  const data = JSON.stringify({
                    type: 'markdown_update',
                    content: updatedMarkdown,
                    anchorId: anchorId,
                    version: version,
                    sectionId: sectionId
                  })
                  controller.enqueue(encoder.encode(`data: ${data}\n\n`))
                } else {
                  // Failed to find section - log for debugging but don't update
                  // The AI should ask the user for clarification before trying again
                  console.warn('❌ Section update failed - section not found')
                  console.warn('Available headers:', result.availableHeaders)
                  console.warn('This should not happen - AI should verify section exists before providing UPDATED_SECTION')
                }
              }
            }
          } else if (fullResponse.includes('UPDATED_DOCUMENT:')) {
            // Fallback: Legacy full document update (backwards compatibility)
            const afterMarker = fullResponse.split('UPDATED_DOCUMENT:')[1]
            const codeBlockMatch = afterMarker.match(/```markdown\n([\s\S]*?)```/)

            if (codeBlockMatch && codeBlockMatch[1]) {
              updatedMarkdown = codeBlockMatch[1].trim()

              // Save updated markdown to database
              await prisma.contextAnchor.update({
                where: { id: anchorId },
                data: { contentMarkdown: updatedMarkdown }
              })

              // Send markdown update to client (no sectionId for full document updates)
              const data = JSON.stringify({
                type: 'markdown_update',
                content: updatedMarkdown,
                anchorId: anchorId,
                version: version,
                sectionId: 'full_document'  // Full document update (no specific section)
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
