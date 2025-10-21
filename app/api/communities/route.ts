import { NextResponse } from 'next/server'
import { getPublicCommunities } from '@/lib/communities'

export const dynamic = 'force-dynamic'

/**
 * GET /api/communities
 * Returns list of public communities formatted as sidebar items
 */
export async function GET() {
  try {
    const communities = getPublicCommunities()

    // Format as sidebar items (same shape as conversations)
    const sidebarItems = communities.map(community => ({
      id: community.id,
      title: community.name,
      description: community.description || '',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }))

    return NextResponse.json({ communities: sidebarItems })
  } catch (error) {
    console.error('Error fetching communities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch communities' },
      { status: 500 }
    )
  }
}
