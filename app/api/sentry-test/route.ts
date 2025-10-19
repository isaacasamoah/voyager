import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export async function GET() {
  // Test manual error capture
  Sentry.captureMessage('Sentry test message - manual capture works!', 'info')

  // Test automatic error capture
  throw new Error('Sentry test error - automatic capture works!')
}
