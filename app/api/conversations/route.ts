import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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

    // Verify user is member of this community
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { communities: true }
    })

    if (!user?.communities.includes(communityId)) {
      return NextResponse.json({ error: 'Not a member of this community' }, { status: 403 })
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        userId: session.user.id,
        communityId: communityId,
        isPublic: false, // Only show private conversations
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}
