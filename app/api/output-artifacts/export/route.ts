import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { put } from '@vercel/blob'

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

    // Upload markdown file to Vercel Blob
    let outputUrl: string | null = null
    try {
      const blob = await put(
        `output-artifacts/${user.id}/${Date.now()}-${sanitizedFilename}`,
        contentMarkdown,
        {
          access: 'public',
          contentType: 'text/markdown',
        }
      )
      outputUrl = blob.url
    } catch (blobError) {
      console.error('Blob upload error:', blobError)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Create OutputArtifact in database
    const artifact = await prisma.outputArtifact.create({
      data: {
        userId: user.id,
        communityId,
        artifactType,
        filename: sanitizedFilename,
        contentMarkdown,
        outputUrl,
        conversationId,
      },
    })

    return NextResponse.json({ artifact }, { status: 201 })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
