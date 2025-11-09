import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { del } from '@vercel/blob'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const anchorId = params.id

    // Find the anchor to verify ownership
    const anchor = await prisma.contextAnchor.findUnique({
      where: { id: anchorId },
    })

    if (!anchor) {
      return NextResponse.json({ error: 'Anchor not found' }, { status: 404 })
    }

    // Verify ownership
    if (anchor.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete from Vercel Blob if exists
    if (anchor.originalUrl) {
      try {
        await del(anchor.originalUrl)
      } catch (blobError) {
        console.error('Blob deletion error:', blobError)
        // Continue anyway - we'll delete from DB
      }
    }

    // Delete from database
    await prisma.contextAnchor.delete({
      where: { id: anchorId },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Delete context anchor error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
