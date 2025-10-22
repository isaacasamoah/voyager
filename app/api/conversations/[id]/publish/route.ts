import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logApi, logError } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * Publish a curated draft conversation as a public community post
 *
 * Flow:
 * 1. Verify draft belongs to user and is in curate mode
 * 2. Find the final polished message (last message or marked with isPost)
 * 3. Create NEW public conversation with just that message
 * 4. Link draft to published post via publishedPostId
 * 5. Return the published post
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

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

    // Find the final polished message
    // Priority: 1) Message marked with isPost, 2) Last user message
    const polishedMessage = draft.messages.find(m => m.isPost)
      || draft.messages.filter(m => m.role === 'user').pop()

    if (!polishedMessage) {
      return NextResponse.json(
        { error: 'No message to publish' },
        { status: 400 }
      )
    }

    // Generate title from polished message content
    const title = polishedMessage.content.length > 60
      ? polishedMessage.content.substring(0, 60) + '...'
      : polishedMessage.content

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
            content: polishedMessage.content,
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
