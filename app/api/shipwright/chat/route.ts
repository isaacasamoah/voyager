import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getModelConfig } from '@/lib/ai-models'
import { streamAIModel, ChatMessage } from '@/lib/ai-providers'
import { getCommunityConfig, getCommunitySystemPrompt } from '@/lib/communities'

export const dynamic = 'force-dynamic'

/**
 * Merge a section update into the full document (Surgical Updates)
 *
 * Strategy: Use markdown section headers to identify boundaries
 * - header: Everything before first ## or ### header
 * - summary/experience/education/skills/projects: Section between matching headers
 *
 * Falls back to appending if section not found (graceful degradation)
 */
function mergeSectionIntoDocument(
  currentDocument: string,
  sectionId: string,
  sectionContent: string
): string {
  // Section header patterns for resume/document structure
  const sectionPatterns: Record<string, RegExp> = {
    header: /^([\s\S]*?)(?=\n##)/m, // Everything before first ## header
    summary: /##\s*(Professional Summary|Summary|About|Objective)([\s\S]*?)(?=\n##|$)/i,
    experience: /##\s*(Experience|Work History|Employment)([\s\S]*?)(?=\n##|$)/i,
    education: /##\s*(Education|Certifications|Qualifications)([\s\S]*?)(?=\n##|$)/i,
    skills: /##\s*(Skills|Technical Skills|Technologies)([\s\S]*?)(?=\n##|$)/i,
    projects: /##\s*(Projects|Portfolio|Personal Projects)([\s\S]*?)(?=\n##|$)/i,
  }

  const pattern = sectionPatterns[sectionId]

  if (!pattern) {
    // Unknown section - append to end (graceful fallback)
    console.warn(`Unknown section ID: ${sectionId}, appending to end`)
    return `${currentDocument}\n\n${sectionContent}`
  }

  // Special case: header section (content before first ##)
  if (sectionId === 'header') {
    const firstHeaderMatch = currentDocument.match(/\n##/)
    if (firstHeaderMatch && firstHeaderMatch.index !== undefined) {
      const restOfDocument = currentDocument.substring(firstHeaderMatch.index)
      return `${sectionContent}${restOfDocument}`
    }
    // No headers found - replace entire document
    return sectionContent
  }

  // Standard sections: find and replace section content
  const match = currentDocument.match(pattern)

  if (match && match.index !== undefined) {
    // Extract the section header from the match
    const sectionHeader = match[1] ? `## ${match[1].trim()}` : ''

    // Build the replacement: header + new content
    const replacement = sectionHeader ? `${sectionHeader}\n${sectionContent}` : sectionContent

    // Replace the entire matched section
    const before = currentDocument.substring(0, match.index)
    const after = currentDocument.substring(match.index + match[0].length)

    return `${before}${replacement}${after}`
  }

  // Section not found - append to end with appropriate header
  console.warn(`Section ${sectionId} not found, appending to end`)
  const sectionHeader = sectionId.charAt(0).toUpperCase() + sectionId.slice(1)
  return `${currentDocument}\n\n## ${sectionHeader}\n${sectionContent}`
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

          // 4. Add Shipwright-specific editing instructions (SURGICAL UPDATES)
          systemPrompt += `\n\n## ✏️ Editing Protocol (MANDATORY - Surgical Updates)

**CRITICAL: Use SURGICAL UPDATES for fast, targeted editing.**

When the user asks you to edit "${anchor.filename}":

1. **Briefly** acknowledge what you're changing (1-2 sentences max)
2. **Identify which section** needs updating
3. **Immediately** provide ONLY the updated section (not the full document)

**Response Format (REQUIRED):**

[1-2 sentence explanation of what you changed]

UPDATED_SECTION: <section_identifier>
\`\`\`markdown
[ONLY the updated section content]
\`\`\`

**Section Identifiers:**
- \`header\` - Name, contact info, title/headline at top of document
- \`summary\` - Professional summary, about me, objective section
- \`experience\` - Work experience, job history section
- \`education\` - Education, certifications, courses section
- \`skills\` - Technical skills, tools, technologies section
- \`projects\` - Personal projects, portfolio items section
- \`full_document\` - Use ONLY when user explicitly asks to rewrite entire document

**Examples:**

User: "Change my title to Senior Product Manager"
You: "Updating your title in the header.

UPDATED_SECTION: header
\`\`\`markdown
# Sarah Chen
Senior Product Manager | Melbourne, AU
sarah.chen@email.com | linkedin.com/in/sarahchen
\`\`\`"

User: "Add metrics to my Atlassian role"
You: "Adding conversion and revenue metrics to your Atlassian experience.

UPDATED_SECTION: experience
\`\`\`markdown
### Product Manager | Atlassian
*Jan 2022 - Present | Sydney, AU*
- Led checkout redesign → 15% conversion lift ($500K impact)
- Shipped 3 major features used by 10M+ users
\`\`\`"

**Rules:**
- ✅ Use surgical updates (section-only) for targeted changes
- ✅ Only use \`full_document\` if user says "rewrite" or "start over"
- ✅ Preserve your teaching approach - explain WHY changes work better
- ✅ Apply your ANZ tech career expertise to every edit
- ❌ DO NOT regenerate sections that weren't changed
- ❌ DO NOT edit reference documents (other anchors)
- ❌ DO NOT ask permission - make the improvement and explain

**If the request is unclear:** Ask ONE clarifying question, then wait for response.`

          // Build messages array
          const messages: ChatMessage[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ]

          // Stream AI response using configurable model
          const aiStream = streamAIModel(modelConfig, messages)

          // State machine for filtering UPDATED_SECTION/UPDATED_DOCUMENT from chat
          let streamState: 'BEFORE_MARKER' | 'IN_DOCUMENT' | 'AFTER_MARKER' = 'BEFORE_MARKER'
          let documentBuffer = ''

          for await (const textChunk of aiStream) {
            fullResponse += textChunk

            // Check if we've hit UPDATED_SECTION or UPDATED_DOCUMENT marker
            const hasSectionMarker = /UPDATED_SECTION:\s*\w+/.test(fullResponse)
            const hasDocumentMarker = fullResponse.includes('UPDATED_DOCUMENT:')

            if (streamState === 'BEFORE_MARKER' && (hasSectionMarker || hasDocumentMarker)) {
              streamState = 'IN_DOCUMENT'

              // Send only the text BEFORE the marker to chat
              let beforeMarker: string
              if (hasSectionMarker) {
                const match = fullResponse.match(/UPDATED_SECTION:\s*\w+/)
                beforeMarker = fullResponse.substring(0, match!.index)
              } else {
                beforeMarker = fullResponse.split('UPDATED_DOCUMENT:')[0]
              }

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

          // Check if response contains surgical section update
          const sectionMarkerMatch = fullResponse.match(/UPDATED_SECTION:\s*(\w+)/)
          if (sectionMarkerMatch) {
            const sectionId = sectionMarkerMatch[1]
            const afterMarker = fullResponse.split(sectionMarkerMatch[0])[1]
            const codeBlockMatch = afterMarker.match(/```markdown\n([\s\S]*?)```/)

            if (codeBlockMatch && codeBlockMatch[1]) {
              const sectionContent = codeBlockMatch[1].trim()

              // If full_document, replace entire document
              if (sectionId === 'full_document') {
                updatedMarkdown = sectionContent
              } else {
                // Surgical update: merge section into existing document
                updatedMarkdown = mergeSectionIntoDocument(
                  anchor.contentMarkdown,
                  sectionId,
                  sectionContent
                )
              }

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
