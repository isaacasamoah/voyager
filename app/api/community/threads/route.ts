import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logApi } from '@/lib/logger'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    logApi('GET /api/community/threads', {
      userId: session.user.id,
      email: session.user.email
    })

    // Get the Careersy community
    const community = await prisma.community.findUnique({
      where: { slug: 'careersy-career-coaching' }
    })

    if (!community) {
      return NextResponse.json({ threads: [] })
    }

    // Fetch public conversations from the community
    const threads = await prisma.conversation.findMany({
      where: {
        isPublic: true,
        communityId: community.id
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
