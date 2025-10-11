import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { resumeText } = await req.json()

    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json({ error: 'Invalid resume text' }, { status: 400 })
    }

    // Update user with resume text
    await prisma.user.update({
      where: { id: session.user.id },
      data: { resumeText },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resume API error:', error)
    return NextResponse.json(
      { error: 'Failed to save resume' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { resumeText: true },
    })

    return NextResponse.json({ resumeText: user?.resumeText || null })
  } catch (error) {
    console.error('Resume API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resume' },
      { status: 500 }
    )
  }
}
