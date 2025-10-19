import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

// Force dynamic rendering (don't pre-render during build)
export const dynamic = 'force-dynamic'

export async function GET() {
  // Test manual error capture
  Sentry.captureMessage('Sentry test message - manual capture works!', 'info')

  // Test automatic error capture
  throw new Error('Sentry test error - automatic capture works!')
}
