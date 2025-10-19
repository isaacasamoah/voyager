import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1.0,

  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,

  // Enhanced error tracking
  beforeSend(event, hint) {
    // Add custom context for debugging
    if (event.exception) {
      console.error('Sentry captured error:', hint.originalException)
    }
    return event
  },
})
