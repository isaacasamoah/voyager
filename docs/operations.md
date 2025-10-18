# Operations Guide

Production deployment, monitoring, and maintenance for Voyager.

---

## Deployment

### Vercel Deployment

**Production Environment:**
- Branch: `main`
- URL: https://careersy-wingman.vercel.app
- Auto-deploy: Enabled

**Staging Environment:**
- Branch: `develop`
- URL: https://careersy-wingman-git-develop.vercel.app
- Auto-deploy: Enabled

**Preview Deployments:**
- All feature branches get automatic preview URLs
- Format: `https://careersy-wingman-git-{branch-name}.vercel.app`

### Environment Variables

Required environment variables in Vercel:

```bash
# Database (Neon)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="[production secret - rotate periodically]"

# OAuth - Google
GOOGLE_CLIENT_ID="production-google-id"
GOOGLE_CLIENT_SECRET="production-google-secret"

# OAuth - LinkedIn
LINKEDIN_CLIENT_ID="production-linkedin-id"
LINKEDIN_CLIENT_SECRET="production-linkedin-secret"

# AI - Anthropic (Primary)
ANTHROPIC_API_KEY="sk-ant-..."

# AI - OpenAI (Fallback)
OPENAI_API_KEY="sk-..."

# Stripe (Optional)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID="price_..."
```

**Setting Environment Variables:**

1. Via Vercel Dashboard:
   - Project Settings → Environment Variables
   - Set for Production, Preview, Development

2. Via Vercel CLI:
```bash
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
```

### Database Migrations

**Automatic Migrations (Recommended):**

Vercel runs migrations automatically via `prisma generate` in build step.

**Manual Migration:**

```bash
# Connect to production database
export DATABASE_URL="postgresql://..."

# Run migrations
npx prisma migrate deploy

# Verify
npx prisma studio
```

**Rollback Strategy:**

```bash
# Revert to previous migration
npx prisma migrate resolve --rolled-back {migration-name}

# Deploy previous state
git revert {commit-hash}
git push origin main
```

### Deployment Checklist

**Pre-Deployment:**
- [ ] All tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Environment variables updated
- [ ] Database migrations tested on staging

**Post-Deployment:**
- [ ] Verify deployment URL loads
- [ ] Test authentication flow
- [ ] Test chat functionality
- [ ] Check error logs in Vercel
- [ ] Monitor database connections

---

## Monitoring

### Vercel Analytics

**Access:**
- Dashboard: https://vercel.com/{your-team}/analytics
- Real-time metrics, Web Vitals, traffic

**Key Metrics:**
- Page load time
- Time to First Byte (TTFB)
- Core Web Vitals (LCP, FID, CLS)
- Error rate

### Database Monitoring (Neon)

**Dashboard:** https://console.neon.tech

**Monitor:**
- Connection count
- Query performance
- Storage usage
- Compute time

**Alerts:**
- Set up email alerts for:
  - Connection pool exhaustion (>80%)
  - Slow queries (>500ms)
  - Storage >80% capacity

### Error Tracking (Recommended: Sentry)

**Setup:**

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

**Configuration:**

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
})
```

**What to Monitor:**
- API route errors
- Authentication failures
- AI provider errors
- Database connection issues

### Logging Best Practices

**Structured Logging:**

```typescript
// lib/logger.ts
export function logError(context: string, error: Error, metadata?: any) {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    context,
    error: {
      message: error.message,
      stack: error.stack,
    },
    metadata,
  }))
}
```

**What to Log:**
- Authentication events (success/failure)
- API errors
- AI provider responses (without PII)
- Community access violations
- Rate limit hits

**What NOT to Log:**
- User passwords
- API keys
- Session tokens
- Personal information

---

## Database Operations

### Backup Strategy

**Neon Automatic Backups:**
- Daily backups retained for 7 days (Scale plan)
- Point-in-time recovery available

**Manual Backup:**

```bash
# Export database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup-20250119.sql
```

### Database Maintenance

**Weekly Tasks:**
- Review slow query log
- Check index usage
- Monitor storage growth

**Monthly Tasks:**
- Review and optimize query patterns
- Update connection pool settings if needed
- Audit user data for GDPR compliance

**Quarterly Tasks:**
- Review migration history
- Consider archiving old conversations
- Optimize database schema if needed

### Connection Pooling

**Current Setup:**
Prisma uses connection pooling by default.

**Optimize for Scale:**

```typescript
// lib/db.ts
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['warn', 'error'],
})

// Connection pool settings (in DATABASE_URL)
// ?connection_limit=10&pool_timeout=10
```

---

## Troubleshooting

### Common Issues

#### Build Failures

**Symptom:** Vercel build fails

**Diagnosis:**
```bash
# Locally reproduce
npm run build

# Check TypeScript errors
npx tsc --noEmit
```

**Solutions:**
- Fix TypeScript errors
- Ensure all environment variables are set
- Check for missing dependencies

#### Authentication Not Working

**Symptom:** Users can't log in

**Check:**
1. Environment variables set correctly?
2. OAuth redirect URIs match deployed URL?
3. NextAuth session strategy configured?

**Solution:**
```bash
# Verify NextAuth config
# app/api/auth/[...nextauth]/route.ts

# Check redirect URIs in:
# - Google Cloud Console
# - LinkedIn Developer Portal

# Ensure NEXTAUTH_URL matches deployment
```

#### Database Connection Issues

**Symptom:** "Too many connections" or timeout errors

**Diagnosis:**
```bash
# Check connection count in Neon dashboard
# Max connections: 100 (Scale plan)
```

**Solutions:**
1. Reduce connection pool size
2. Implement connection pooling with PgBouncer
3. Upgrade Neon plan
4. Review and close idle connections

#### Slow AI Responses

**Symptom:** Chat takes >5 seconds to respond

**Diagnosis:**
- Check AI provider status page
- Review API response times in logs
- Check token usage

**Solutions:**
- Switch to faster model (gpt-3.5-turbo)
- Implement streaming responses
- Add response caching for common queries
- Use prompt caching (Anthropic)

#### Custom Domain Not Working

**Symptom:** Custom domain shows 404 or doesn't route correctly

**Check:**
1. DNS CNAME record added?
2. Domain added to Vercel project?
3. SSL certificate provisioned?
4. Community config has domain listed?

**Debug:**
```bash
# Check DNS
dig community.acme.com

# Should show CNAME to cname.vercel-dns.com

# Check middleware
# middleware.ts logs hostname matching
```

**Solution:**
1. Wait 24-48 hours for DNS propagation
2. Verify CNAME record
3. Check Vercel domain settings
4. Ensure community JSON has domain in branding.domains array

---

## Performance Optimization

### Current Performance Baseline

**Landing Page:**
- Bundle size: 107 KB
- First Load JS: 85 KB
- Time to Interactive: <2s

**Community Pages:**
- Bundle size: 145 KB
- Database queries: 2-3 per load
- API response time: 200-500ms

### Optimization Strategies

#### 1. Implement Caching (High Impact)

```typescript
// lib/cache.ts
import { unstable_cache } from 'next/cache'

export const getCommunityConfig = unstable_cache(
  async (id: string) => {
    return getCommunity(id)
  },
  ['community-config'],
  {
    revalidate: 3600, // 1 hour
    tags: ['community'],
  }
)
```

#### 2. Add Rate Limiting (Security)

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function middleware(req: NextRequest) {
  const ip = req.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return new Response('Too Many Requests', { status: 429 })
  }

  // ... rest of middleware
}
```

#### 3. Database Query Optimization

```typescript
// Batch queries
const [user, communities, conversations] = await Promise.all([
  prisma.user.findUnique({ where: { id } }),
  prisma.community.findMany(),
  prisma.conversation.findMany({ where: { userId: id }, take: 10 })
])

// Use select to limit fields
const messages = await prisma.message.findMany({
  select: {
    id: true,
    content: true,
    role: true,
    createdAt: true,
  },
  take: 20,
})
```

#### 4. Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/logos/community.svg"
  alt="Community Logo"
  width={200}
  height={200}
  priority
/>
```

---

## Security

### Security Checklist

**Authentication:**
- [x] OAuth providers configured
- [x] Session tokens in database
- [ ] Rate limiting on auth endpoints
- [ ] Session refresh strategy
- [ ] CSRF protection on mutations

**Authorization:**
- [x] Community membership checks
- [x] Server-side validation
- [ ] Role-based access control
- [ ] Audit logging for sensitive actions

**Data Protection:**
- [x] SQL injection prevented (Prisma)
- [x] Secrets in environment variables
- [ ] Input sanitization for XSS
- [ ] Output encoding
- [ ] Content Security Policy

### Security Incident Response

**Suspected Breach:**

1. **Immediate Actions:**
   - Rotate all API keys
   - Revoke all sessions: `DELETE FROM Session`
   - Review access logs
   - Notify affected users

2. **Investigation:**
   - Check Vercel logs for suspicious activity
   - Review database audit logs
   - Identify attack vector

3. **Remediation:**
   - Patch vulnerability
   - Deploy fix immediately
   - Monitor for further attempts

4. **Post-Incident:**
   - Document incident
   - Update security measures
   - Communicate to stakeholders

---

## Cost Management

### Current Costs (Estimated)

**Vercel:**
- Hobby: $0/month (development)
- Pro: $20/month (production)

**Neon Database:**
- Free: $0/month (development)
- Scale: $20/month (production)

**AI Providers:**
- Anthropic Claude: ~$0.01 per 1K tokens
- OpenAI GPT-4: ~$0.03 per 1K tokens

**Total Monthly:** ~$40 + AI usage

### Per-Community Cost Model

**Shared Infrastructure:**
- $40/month base (Vercel + Neon)
- $0.50/community/month (negligible overhead)

**Custom Domain Cost:**
- DNS: $0 (included)
- SSL: $0 (Vercel auto)
- Deployment: $0 (same infrastructure)

**Pricing Strategy:**
- Platform communities: Free (subsidized)
- Private communities: $50/month
- White-label enterprise: $500/month

### Cost Optimization

1. **Use Anthropic for most queries** (3x cheaper than GPT-4)
2. **Implement prompt caching** (50% cost reduction)
3. **Limit conversation history** (max 20 messages context)
4. **Monitor and set usage alerts**

---

## Scaling Triggers

### When to Upgrade Infrastructure

| Metric | Current | Action At | Upgrade |
|--------|---------|-----------|---------|
| Communities | 1 | 1000+ | Add Redis cache |
| Users/community | <100 | 10K+ | Junction table |
| Concurrent users | <100 | 5K+ | Read replicas |
| Database size | <1GB | 100GB+ | Archive old data |
| API requests | <1K/day | 100K/day | CDN + edge |

### Scaling Roadmap

**Phase 1: 1K-10K users**
- Add Redis for community configs
- Implement response caching
- Database connection pooling

**Phase 2: 10K-100K users**
- Read replicas for database
- CDN for static assets
- Edge functions for middleware

**Phase 3: 100K+ users**
- Microservices architecture
- Dedicated databases per enterprise
- Multi-region deployment

---

## Maintenance Schedule

### Daily
- [ ] Monitor error logs
- [ ] Check deployment status
- [ ] Review user feedback

### Weekly
- [ ] Review performance metrics
- [ ] Check database usage
- [ ] Update dependencies (minor versions)

### Monthly
- [ ] Security audit
- [ ] Cost analysis
- [ ] Performance review
- [ ] Update documentation

### Quarterly
- [ ] Major dependency updates
- [ ] Architecture review
- [ ] Disaster recovery test
- [ ] User satisfaction survey

---

## Support Procedures

### User Issues

**Tier 1 (Self-Service):**
- Documentation: docs/
- FAQ: website
- Status page: Vercel

**Tier 2 (Email Support):**
- Response time: <24 hours
- Escalate to: Technical team

**Tier 3 (Critical):**
- Response time: <2 hours
- Examples: Data loss, security breach, service down

### Community Requests

**New Community Setup:**
1. Create community JSON file
2. Add logo (if provided)
3. Deploy to staging
4. Test authentication
5. Deploy to production
6. Configure custom domain (if applicable)

**Community Modifications:**
1. Update JSON config
2. Test on staging
3. Deploy to production
4. Verify changes

---

## References

- [Getting Started](./getting-started.md)
- [Architecture](./architecture.md)
- [Communities](./communities.md)
- [Custom Domains](./CUSTOM_DOMAINS.md)
- [Codebase Review](./CODEBASE_REVIEW.md)

---

**Last Updated:** 2025-10-19
**Version:** 1.0.0
