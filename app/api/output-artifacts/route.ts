import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const {
      contentMarkdown,
      filename,
      artifactType = 'document',
      communityId = 'careersy',
      conversationId,
    } = body

    // Validate inputs
    if (!contentMarkdown) {
      return NextResponse.json(
        { error: 'No content provided' },
        { status: 400 }
      )
    }

    if (!filename) {
      return NextResponse.json(
        { error: 'No filename provided' },
        { status: 400 }
      )
    }

    // Ensure filename has .md extension
    const sanitizedFilename = filename.endsWith('.md')
      ? filename
      : `${filename}.md`

    // Create OutputArtifact in database (no Blob upload for MVP)
    const artifact = await prisma.outputArtifact.create({
      data: {
        userId: user.id,
        communityId,
        artifactType,
        filename: sanitizedFilename,
        contentMarkdown,
        outputUrl: null, // No Blob upload
        conversationId,
      },
    })

    return NextResponse.json({ artifact }, { status: 201 })
  } catch (error) {
    console.error('Save to outputs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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

    // Get communityId from query params
    const { searchParams } = new URL(request.url)
    const communityId = searchParams.get('communityId') || 'careersy'

    // Fetch output artifacts for user in this community
    const artifacts = await prisma.outputArtifact.findMany({
      where: {
        userId: user.id,
        communityId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ artifacts }, { status: 200 })
  } catch (error) {
    console.error('Fetch artifacts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
