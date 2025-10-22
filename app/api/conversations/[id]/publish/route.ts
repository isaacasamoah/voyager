import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logApi, logError } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * Parse structured post format from curator AI
 * Expected format:
 * TITLE: [title text]
 * POST: [post content]
 * [READY_TO_POST]
 */
function parseStructuredPost(content: string): { title: string; post: string } | null {
  const titleMatch = content.match(/TITLE:\s*(.+?)(?:\n|$)/i)
  const postMatch = content.match(/POST:\s*([\s\S]+?)(?:\[READY_TO_POST\]|$)/i)

  if (titleMatch && postMatch) {
    return {
      title: titleMatch[1].trim(),
      post: postMatch[1].trim().replace(/\[READY_TO_POST\]/g, '').trim()
    }
  }

  return null
}

/**
 * Publish a curated draft conversation as a public community post
 *
 * Flow:
 * 1. Verify draft belongs to user and is in curate mode
 * 2. Find the final polished message (last AI message with structured format)
 * 3. Parse TITLE and POST from structured format
 * 4. Create NEW public conversation with clean title and post content
 * 5. Link draft to published post via publishedPostId
 * 6. Return the published post
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let session = null

  try {
    session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const draftId = params.id

    logApi('POST /api/conversations/:id/publish', {
      userId: session.user.id,
      draftId
    })

    // Get the draft conversation
    const draft = await prisma.conversation.findUnique({
      where: {
        id: draftId,
        userId: session.user.id // Ensure it belongs to the user
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!draft) {
      return NextResponse.json(
        { error: 'Draft conversation not found' },
        { status: 404 }
      )
    }

    // Verify this is actually a curated draft
    if (!draft.curateMode) {
      return NextResponse.json(
        { error: 'Conversation is not in curate mode' },
        { status: 400 }
      )
    }

    // Check if already published
    if (draft.publishedPostId) {
      return NextResponse.json(
        {
          error: 'Draft already published',
          publishedPostId: draft.publishedPostId
        },
        { status: 400 }
      )
    }

    // Find the last assistant message (should contain structured post)
    const lastAiMessage = draft.messages.filter(m => m.role === 'assistant').pop()

    if (!lastAiMessage) {
      return NextResponse.json(
        { error: 'No AI message found to publish' },
        { status: 400 }
      )
    }

    logApi('POST /api/conversations/:id/publish - parsing AI message', {
      messageLength: lastAiMessage.content.length,
      preview: lastAiMessage.content.substring(0, 200)
    })

    // Parse the structured format
    const parsed = parseStructuredPost(lastAiMessage.content)

    if (!parsed) {
      logError('POST /api/conversations/:id/publish - parse failed', new Error('Parse failed'), {
        contentPreview: lastAiMessage.content.substring(0, 500),
        hasTitleMarker: lastAiMessage.content.includes('TITLE:'),
        hasPostMarker: lastAiMessage.content.includes('POST:'),
        hasReadyMarker: lastAiMessage.content.includes('[READY_TO_POST]')
      })
      return NextResponse.json(
        { error: 'Could not parse post format. Expected TITLE: and POST: format.' },
        { status: 400 }
      )
    }

    const { title, post } = parsed

    // Create NEW public conversation with ONLY the polished message
    const publishedPost = await prisma.conversation.create({
      data: {
        userId: session.user.id,
        title,
        isPublic: true,
        curateMode: false, // Published posts are not in curate mode
        communityId: draft.communityId,
        contentType: draft.contentType,
        messages: {
          create: {
            role: 'user',
            content: post, // Clean post content without AI preamble
            isPost: true, // Mark as the post (vs comments)
            userId: session.user.id,
            isAiGenerated: false
          }
        }
      },
      include: {
        messages: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true
          }
        }
      }
    })

    // Link draft to published post
    await prisma.conversation.update({
      where: { id: draftId },
      data: { publishedPostId: publishedPost.id }
    })

    logApi('POST /api/conversations/:id/publish - success', {
      draftId,
      publishedPostId: publishedPost.id,
      communityId: draft.communityId
    })

    return NextResponse.json({
      success: true,
      publishedPost: {
        id: publishedPost.id,
        title: publishedPost.title,
        communityId: publishedPost.communityId,
        createdAt: publishedPost.createdAt,
        message: publishedPost.messages[0],
        user: publishedPost.user
      }
    })

  } catch (error) {
    console.error('❌ Publish API Error:', error)
    logError('POST /api/conversations/:id/publish', error, {
      hasSession: !!session,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      {
        error: 'Failed to publish conversation',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
