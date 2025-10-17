import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Simple in-memory log store (MVP - replace with real logging service later)
const logs: any[] = []
const MAX_LOGS = 1000

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    logs.push({
      timestamp: new Date().toISOString(),
      ...body
    })

    // Keep only last 1000 logs
    if (logs.length > MAX_LOGS) {
      logs.shift()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    // TEMP: Disable auth check for debugging login issues
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '100')

    return NextResponse.json({
      logs: logs.slice(-limit).reverse(),
      total: logs.length
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}
