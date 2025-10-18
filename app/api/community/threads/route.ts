import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logApi } from '@/lib/logger'

// Force dynamic rendering for auth routes
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get communityId from query params (defaults to 'careersy')
    const { searchParams } = new URL(req.url)
    const communityId = searchParams.get('communityId') || 'careersy'

    logApi('GET /api/community/threads', {
      userId: session.user.id,
      email: session.user.email,
      communityId
    })

    // Verify user is member of this community
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { communities: true }
    })

    if (!user?.communities.includes(communityId)) {
      return NextResponse.json({ error: 'Not a member of this community' }, { status: 403 })
    }

    // Fetch public conversations from the community
    const threads = await prisma.conversation.findMany({
      where: {
        isPublic: true,
        communityId
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 50,
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        viewCount: true,
        user: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      }
    })

    logApi('GET /api/community/threads - success', {
      threadCount: threads.length
    })

    return NextResponse.json({ threads })
  } catch (error) {
    logApi('GET /api/community/threads - error', { error })
    return NextResponse.json({ error: 'Failed to fetch threads' }, { status: 500 })
  }
}
