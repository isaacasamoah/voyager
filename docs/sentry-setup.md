# Sentry Error Tracking Setup

## Overview

Sentry provides real-time error tracking and performance monitoring for the Voyager platform.

## What Sentry Gives You

### 1. **Real-Time Error Alerts**
- Instant notifications when errors occur in production
- Email/Slack alerts for critical issues
- See errors before users report them

### 2. **Rich Error Context**
Every error includes:
- User information (email, ID)
- Community/voyage context
- Browser and device info
- Full stack trace with source maps
- Request details (URL, body, headers)
- Last 10 user actions (breadcrumbs)
- Environment (production, staging, etc.)

### 3. **Error Aggregation**
- Groups identical errors together
- Shows impact: "47 users affected in last hour"
- Tracks error trends over time
- Identifies which errors are most critical

### 4. **Release Tracking**
- Links errors to specific git commits
- Shows errors introduced by each deployment
- Easy rollback decisions

### 5. **Performance Monitoring**
- Slow API route detection
- Database query performance
- Page load times
- AI model response tracking

## Setup Instructions

### 1. Create Sentry Account

1. Go to [sentry.io](https://sentry.io)
2. Sign up (free tier: 5K errors/month)
3. Create new project → Select "Next.js"
4. Get your DSN (looks like: `https://abc123@o123.ingest.sentry.io/456`)

### 2. Add Environment Variables

Add to `.env.local`:
```bash
NEXT_PUBLIC_SENTRY_DSN="your-dsn-here"
SENTRY_ORG="your-org-slug"
SENTRY_PROJECT="your-project-slug"
SENTRY_AUTH_TOKEN="your-auth-token"  # Optional: for source maps
```

Add to Vercel:
1. Go to Project Settings → Environment Variables
2. Add `NEXT_PUBLIC_SENTRY_DSN` for all environments
3. Add `SENTRY_AUTH_TOKEN` for Production (optional)

### 3. Verify Installation

The Sentry SDK is already configured:
- ✅ Client-side tracking: `sentry.client.config.ts`
- ✅ Server-side tracking: `sentry.server.config.ts`
- ✅ Edge runtime tracking: `sentry.edge.config.ts`
- ✅ Next.js integration: `next.config.js`

### 4. Test Error Tracking

Add a test error route:
```typescript
// app/api/sentry-test/route.ts
export async function GET() {
  throw new Error('Test Sentry error tracking')
}
```

Visit `/api/sentry-test` and check Sentry dashboard.

## Usage

### Automatic Error Capture

Sentry automatically captures:
- Unhandled exceptions
- Promise rejections
- API route errors
- React component errors

### Manual Error Tracking

```typescript
import * as Sentry from '@sentry/nextjs'

// Capture error with context
try {
  await riskyOperation()
} catch (error) {
  Sentry.captureException(error, {
    extra: {
      communityId: 'careersy',
      userId: session.user.id,
      operation: 'chat-message',
    },
  })
  throw error
}

// Add breadcrumbs for context
Sentry.addBreadcrumb({
  category: 'chat',
  message: 'User sent message',
  level: 'info',
})

// Set user context
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
})

// Set tags for filtering
Sentry.setTag('community', communityId)
Sentry.setTag('feature', 'chat')
```

## Dashboard Features

### Error Dashboard
- **Issues:** All errors grouped by type
- **Releases:** Errors per deployment
- **Discover:** Custom queries (e.g., "errors in careersy community")
- **Alerts:** Configure notification rules

### Performance Dashboard
- **Transactions:** API route performance
- **Web Vitals:** Page load metrics
- **Database:** Query performance

## Best Practices

### 1. **Add Context to Errors**
```typescript
// In API routes
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  // Set user context for all subsequent errors
  Sentry.setUser({
    id: session?.user?.id,
    email: session?.user?.email,
  })

  // Add tags for filtering
  Sentry.setTag('api_route', '/api/chat')
  Sentry.setTag('community', communityId)

  // Your logic here
}
```

### 2. **Ignore Expected Errors**
Already configured in `sentry.client.config.ts`:
```typescript
ignoreErrors: [
  'ResizeObserver loop limit exceeded',  // Browser quirk
  'Non-Error promise rejection captured', // React dev mode
]
```

### 3. **Sample Rates**
Adjust in production based on traffic:
```typescript
tracesSampleRate: 0.1,  // 10% of transactions (reduce costs)
replaysSessionSampleRate: 0.01,  // 1% of sessions
```

### 4. **Create Alerts**
In Sentry dashboard:
1. Alerts → New Alert Rule
2. Configure: "When error count > 10 in 5 minutes"
3. Send to: Email, Slack, PagerDuty

## Cost Management

**Free Tier Limits:**
- 5K errors/month
- 10K performance transactions/month
- 50 replay sessions/month

**Tips:**
- Use sample rates to control volume
- Set up alert quotas to avoid surprise bills
- Filter out noisy errors with `ignoreErrors`

## Integration with Existing Logging

Sentry complements our current logging:
- **`lib/logger.ts`**: Console logs for debugging
- **Sentry**: Production error tracking with full context
- **Vercel logs**: Runtime logs for deployment issues

Use both:
```typescript
import { logError } from '@/lib/logger'
import * as Sentry from '@sentry/nextjs'

try {
  // risky operation
} catch (error) {
  logError('Operation failed', error)  // Console log
  Sentry.captureException(error)       // Track in Sentry
}
```

## Troubleshooting

### Source Maps Not Working
1. Verify `SENTRY_AUTH_TOKEN` in Vercel
2. Check build logs for "Uploading source maps to Sentry"
3. Ensure `hideSourceMaps: true` in `next.config.js`

### Too Many Errors
1. Check `ignoreErrors` list
2. Reduce `tracesSampleRate`
3. Add filters in Sentry dashboard

### Errors Not Appearing
1. Verify `NEXT_PUBLIC_SENTRY_DSN` is set
2. Check browser console for Sentry init errors
3. Test with `/api/sentry-test` route

## Next Steps

1. **Set up Sentry account** and get DSN
2. **Add environment variables** to `.env.local` and Vercel
3. **Deploy** and monitor dashboard
4. **Configure alerts** for critical errors
5. **Review weekly** to identify patterns

---

**Cost:** Free for 5K errors/month
**Setup Time:** 10 minutes
**Maintenance:** Check dashboard weekly
**ROI:** Catch issues before users report them
