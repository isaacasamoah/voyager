import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logApi, logError } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * Create a public post directly from ephemeral draft
 *
 * This endpoint is called from collaborate mode to publish
 * an ephemeral draft (that was never saved to DB) as a public post.
 */
export async function POST(req: NextRequest) {
  let session = null

  try {
    session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content, communityId } = await req.json()

    logApi('POST /api/conversations/create-public', {
      userId: session.user.id,
      communityId,
      titleLength: title?.length || 0,
      contentLength: content?.length || 0
    })

    // Validate input
    if (!title || !content || !communityId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, communityId' },
        { status: 400 }
      )
    }

    // Verify user is member of community
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { communities: true }
    })

    if (!user?.communities.includes(communityId)) {
      return NextResponse.json(
        { error: 'Not a member of this community' },
        { status: 403 }
      )
    }

    // Create the public conversation with the post content
    const publicPost = await prisma.conversation.create({
      data: {
        userId: session.user.id,
        title,
        isPublic: true,
        communityId,
        curateMode: false,
        contentType: 'message',
        messages: {
          create: {
            role: 'user',
            content,
            isPost: true,
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

    logApi('POST /api/conversations/create-public - success', {
      conversationId: publicPost.id,
      communityId
    })

    return NextResponse.json({
      success: true,
      conversation: {
        id: publicPost.id,
        title: publicPost.title,
        communityId: publicPost.communityId,
        createdAt: publicPost.createdAt,
        updatedAt: publicPost.updatedAt,
        isPublic: publicPost.isPublic,
        curateMode: publicPost.curateMode
      },
      message: publicPost.messages[0],
      user: publicPost.user
    })

  } catch (error) {
    console.error('❌ Create Public Post Error:', error)
    logError('POST /api/conversations/create-public', error, {
      hasSession: !!session,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      {
        error: 'Failed to create public post',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
