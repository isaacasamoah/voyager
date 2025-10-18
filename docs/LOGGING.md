# Logging Architecture

## Current Setup

### Console Logs (Vercel-Specific)
```typescript
console.log('🔍 Anthropic API Check:', { ... })
console.error('❌ Chat API Error:', error)
```

**Location:** Vercel Runtime Logs
**Access:** Vercel Dashboard → Deployments → Runtime Logs
**Portability:** ❌ **Lost if you migrate away from Vercel**
**Retention:** 7 days on free tier, 30 days on Pro

### Custom In-Memory Logs (lib/logger.ts)
```typescript
logApi('POST /api/chat', { ... })
logError('POST /api/chat', error, { ... })
```

**Location:** In-memory array (server RAM)
**Access:** GET /api/logs endpoint
**Portability:** ❌ **Lost on server restart**
**Retention:** Until deployment/restart

## Making Logs Portable

To preserve logs when moving platforms, you need **persistent storage**. Here are your options:

### Option 1: Database Logs (Recommended for Self-Hosting)

Add a Log model to Prisma and store all logs in PostgreSQL:

```prisma
model Log {
  id        String   @id @default(cuid())
  level     String   // 'info', 'error', 'warn', 'debug'
  message   String
  metadata  Json?    // Flexible JSON for any data
  userId    String?
  createdAt DateTime @default(now())

  @@index([level])
  @@index([userId])
  @@index([createdAt])
}
```

**Benefits:**
- ✅ Survives restarts and migrations
- ✅ Query logs with SQL
- ✅ Export anytime
- ❌ Adds DB storage costs

### Option 2: Third-Party Logging Service (Recommended for Production)

Use a dedicated logging platform that works anywhere:

#### **Logtail** (Easy, affordable)
```bash
npm install @logtail/node
```
- Free tier: 1GB/month
- Works on Vercel, AWS, anywhere
- Web dashboard for viewing logs
- Automatic retention policies

#### **Axiom** (Great for analytics)
```bash
npm install next-axiom
```
- Free tier: 500MB/month
- Built for Next.js
- Fast search and analytics
- Works on any platform

#### **Sentry** (Best for errors)
```bash
npm install @sentry/nextjs
```
- Free tier: 5K errors/month
- Error tracking + performance monitoring
- Stack traces and user context
- Platform-agnostic

### Option 3: File-Based Logs (For Self-Hosting)

Use Winston or Pino to write logs to files:

```typescript
import winston from 'winston'

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
})
```

**Benefits:**
- ✅ Simple and free
- ✅ Full control
- ❌ Only works on persistent file systems (not Vercel)
- ❌ Need log rotation setup

## Current Logging Coverage

Our debug logs track:

### API Key Validation
```
🔍 Anthropic API Check: {
  hasApiKey: true,
  apiKeyPrefix: 'sk-ant-api03-O...',
  modelId: 'claude-3-5-sonnet-20250110'
}
```

### API Calls
```
🤖 Calling Anthropic API: {
  model: 'claude-3-5-sonnet-20250110',
  messageCount: 3,
  systemPromptLength: 1234
}
```

### Responses
```
✅ Anthropic response received: {
  tokensUsed: 450
}
```

### Errors
```
❌ Chat API Error: {
  errorMessage: 'ANTHROPIC_API_KEY is not set',
  errorStack: '...',
  hasSession: true
}
```

## Recommendation for Careersy Wingman

**Short-term (MVP):**
- Keep current console.log setup
- Use Vercel Runtime Logs for debugging
- Access via Vercel Dashboard

**Medium-term (Post-Launch):**
- Add **Axiom** or **Logtail** for 30-90 day retention
- Set up error alerting via Sentry
- Track token usage and costs

**Long-term (If Self-Hosting):**
- Migrate to database logs
- Add log analysis dashboard
- Set up custom alerts

## Viewing Logs on Vercel

1. Go to https://vercel.com/dashboard
2. Click your project (careersy-wingman)
3. Click latest deployment
4. Click "Runtime Logs" tab
5. Logs appear in real-time as users interact

**Pro Tip:** Use the search filter to find specific emojis:
- Search `🔍` for API checks
- Search `❌` for errors
- Search `✅` for successful calls

## Export Current Logs

To export logs from Vercel before they expire:

```bash
# Install Vercel CLI
npm install -g vercel

# Export logs (last 24 hours)
vercel logs careersy-wingman.vercel.app > logs.txt

# Export with time range
vercel logs careersy-wingman.vercel.app --since 2025-01-15 > logs.txt
```

---

**Need help setting up persistent logging?** Let me know which option you prefer and I can implement it!
