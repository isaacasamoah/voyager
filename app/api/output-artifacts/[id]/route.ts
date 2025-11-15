import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { del } from '@vercel/blob'

export async function GET(
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

    // Get the artifact with full content
    const artifact = await prisma.outputArtifact.findUnique({
      where: { id: params.id },
    })

    if (!artifact) {
      return NextResponse.json({ error: 'Artifact not found' }, { status: 404 })
    }

    // Verify ownership
    if (artifact.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ artifact }, { status: 200 })
  } catch (error) {
    console.error('Get artifact error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Get the artifact
    const artifact = await prisma.outputArtifact.findUnique({
      where: { id: params.id },
    })

    if (!artifact) {
      return NextResponse.json({ error: 'Artifact not found' }, { status: 404 })
    }

    // Verify ownership
    if (artifact.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete from Vercel Blob if URL exists
    if (artifact.outputUrl) {
      try {
        await del(artifact.outputUrl)
      } catch (blobError) {
        console.error('Blob deletion error:', blobError)
        // Continue anyway - we'll delete the DB record
      }
    }

    // Delete from database
    await prisma.outputArtifact.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Delete artifact error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
