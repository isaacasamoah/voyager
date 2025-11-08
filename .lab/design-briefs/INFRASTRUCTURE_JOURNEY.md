# INFRASTRUCTURE JOURNEY: 0 → 100K USERS

**Project:** Voyager
**Goal:** Scale infrastructure cost-effectively from 0 → 100K users
**Strategy:** Serverless-first, optimize incrementally, migrate only when necessary
**Date:** 2025-11-08

---

## EXECUTIVE SUMMARY

**The Good News:** Our current stack (Next.js + Vercel + Neon + Claude API) scales to 100K users with minimal changes.

**The Strategy:** Start simple, add complexity only when metrics prove we need it.

**Key Principle:** **Measure before migrating.** Don't over-engineer for scale we haven't reached yet.

---

## CURRENT STACK (0-5K Users)

### What We Have Today

**Frontend:**
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Hosted on Vercel (serverless)

**Backend:**
- Next.js API routes (serverless functions)
- NextAuth (authentication)
- Prisma ORM

**Database:**
- Neon Postgres (serverless)
- Auto-scaling compute
- Auto-scaling storage
- Built-in connection pooling

**AI:**
- Anthropic Claude API (Haiku, Sonnet)
- Pay-per-token pricing

**Payments:**
- Stripe (subscriptions, webhooks)

**Monitoring:**
- Sentry (error tracking)
- Vercel Analytics (basic)

---

### Why This Stack Works to 5K Users

**✅ Serverless = Auto-Scaling**
- No manual capacity planning
- Pay only for what we use
- Scales to zero when idle (cost savings)

**✅ Neon = Perfect for Serverless**
- Designed for Next.js serverless functions
- Connection pooling built-in (no PgBouncer needed)
- Separates compute from storage (optimal pricing)

**✅ Low Operational Burden**
- No servers to manage
- No database instances to size
- No infrastructure engineers needed (yet)

**✅ Cost-Effective at Small Scale**
- Vercel: $20/month (Hobby tier fine for dev/preview)
- Neon: $20-50/month (Free tier → Launch tier)
- Claude API: Pay per use (~$100-500/month at 1K users)
- **Total: ~$150-600/month**

---

### What to Monitor (0-5K Users)

**Database Metrics (Neon Dashboard):**
- Active connections (watch for connection pool limits)
- Query performance (P95 latency)
- Storage growth rate
- Compute hours used

**Application Metrics (Vercel + Sentry):**
- Function execution time (serverless timeout = 10 sec default)
- Error rate (4xx, 5xx responses)
- API route latency
- Build times (watch for slowdowns)

**Cost Metrics:**
- Vercel bill (track function invocations, bandwidth)
- Neon bill (compute hours, storage GB)
- Claude API bill (tokens per user, cost per conversation)

**Set Alerts:**
- Database connections > 80% of pool limit
- API error rate > 1%
- Monthly costs spike > 50% unexpectedly
- Slow queries > 500ms

---

## PHASE 1: 5K-10K USERS (Months 6-9)

### What Changes

**Infrastructure:**
- ✅ Stay on Neon (no migration needed)
- ✅ Stay on Vercel (still scales fine)
- ⬜ **Add Redis caching** (session cache, rate limiting)
- ⬜ **Upgrade Neon tier** (Launch → Scale tier)

**Why Redis:**
- Reduce database load (cache frequent queries)
- Rate limiting for API endpoints
- Session management (faster than DB lookups)

**Where to Add Redis:**
- **Option A:** Upstash Redis (serverless, pairs well with Vercel)
  - Cost: ~$10-50/month
  - No connection pooling issues
  - Global edge caching
- **Option B:** Railway Redis
  - Cost: ~$5-20/month
  - Traditional Redis instance
  - Good for standard caching

**Recommendation:** Upstash Redis (serverless-native, plays well with Vercel)

---

### Monitoring Upgrades (5K-10K Users)

**Add:**
- ⬜ **Database query logging** (identify slow queries)
- ⬜ **Cost dashboard** (track spend per user, per community)
- ⬜ **Performance budgets** (alert if P95 latency > threshold)

**Tools:**
- Datadog (full observability) - $31/host/month
  - OR Grafana Cloud (cheaper) - $8-50/month
  - OR stick with Vercel Analytics + Sentry (free/low cost)

**Recommendation:** Start with Vercel Analytics + Sentry, add Datadog only if we need deeper insights.

---

### Database Optimization (5K-10K Users)

**Add Indexes (Prisma Schema):**
```prisma
// Already have these (good!)
@@index([userId])
@@index([conversationId])
@@index([communityId])

// Add compound indexes for common queries:
@@index([userId, createdAt])
@@index([communityId, isPublic])
@@index([communityId, createdAt])
```

**Query Optimization:**
- Paginate message lists (don't load all messages at once)
- Use cursor-based pagination (not offset)
- Add `take` and `skip` limits to all queries

**Database Maintenance:**
- Enable auto-vacuum (Neon does this automatically)
- Monitor table bloat (old deleted rows)
- Archive old conversations (move to S3 after 6 months inactive)

---

### Cost at 5K-10K Users

**Infrastructure:**
- Vercel: $20-100/month (still Hobby or Pro tier)
- Neon: $100-200/month (Scale tier)
- Upstash Redis: $20-50/month
- Claude API: $1,000-3,000/month (with intelligent routing)
- Stripe: 2.9% of revenue
- **Total: ~$1,200-3,500/month**

**Revenue (at 5% conversion, 10K users):**
- 500 Pro users × $18.99 = $9,495/month
- After rev share (~70/30 blended): $6,647/month to Voyager
- **Margin: Still profitable (~50%+ margin)**

---

## PHASE 2: 10K-50K USERS (Months 9-15)

### What Changes

**Infrastructure:**
- ✅ Stay on Neon (still auto-scales)
- ✅ Stay on Vercel (still scales fine)
- ✅ Redis caching expanded
- ⬜ **Add read replicas** (Neon one-click)
- ⬜ **Implement archival strategy** (old conversations → S3)
- ⬜ **Background job processing** (move heavy tasks off API routes)

---

### Read Replicas (Why & When)

**When to Add:**
- When read query load > 70% of database capacity
- When you see slow SELECT queries during peak traffic
- **Likely at: 20K-30K users**

**How Neon Read Replicas Work:**
- Primary database (writes)
- Read replica(s) (read-only queries)
- Prisma can route automatically:

```typescript
// Write queries go to primary
await prisma.message.create({ ... })

// Read queries can go to replica
await prisma.message.findMany({
  // Neon automatically routes to replica
})
```

**Cost:**
- Additional compute for replica (~$50-100/month per replica)
- Start with 1 replica, add more if needed

---

### Archival Strategy (Cost Optimization)

**The Problem:**
- Old conversations (6+ months inactive) still in hot database
- Taking up space, slowing down queries
- Expensive to keep in Postgres vs S3

**The Solution:**

**Step 1: Identify Archive Candidates**
```typescript
// Conversations inactive > 6 months
const archiveCandidates = await prisma.conversation.findMany({
  where: {
    updatedAt: {
      lt: sixMonthsAgo
    },
    // And not recently viewed
    viewCount: {
      lt: 5 // Rarely accessed
    }
  }
})
```

**Step 2: Move to S3**
- Export conversation + messages to JSON
- Upload to S3 bucket
- Keep metadata in Postgres (id, title, userId, archived: true)
- Delete full message content from Postgres

**Step 3: Lazy Load from Archive**
- User requests old conversation
- Check if archived = true
- Fetch from S3, display to user
- Optionally: restore to hot DB if accessed frequently

**Cost Savings:**
- Postgres storage: ~$0.12/GB/month (Neon)
- S3 storage: ~$0.02/GB/month (S3 Standard)
- **6x cheaper for archived data**

**Implementation:**
- Background job (runs nightly)
- Archives conversations > 6 months inactive
- Keeps hot DB lean and fast

---

### Background Jobs (Move Heavy Work Off API Routes)

**Why:**
- API routes have 10-second timeout (Vercel serverless limit)
- Heavy tasks (archival, analytics, exports) can't finish in time
- Need dedicated job processor

**Options:**

**Option A: Vercel Cron + Serverless Functions**
- Built into Vercel
- Cron jobs trigger serverless functions
- Good for: Scheduled tasks (nightly archival)
- Limit: Still 10-second timeout (need to batch work)

**Option B: Inngest (Serverless Background Jobs)**
- Purpose-built for Next.js + Vercel
- No timeout limits
- Retries, observability built-in
- Cost: ~$20-200/month
- **Recommendation: Use this**

**Option C: BullMQ + Redis (Traditional Queue)**
- More complex setup
- Need always-on worker process
- Overkill for our scale
- **Don't use yet**

**What to Move to Background Jobs:**
- Archival jobs (nightly)
- Analytics aggregation (hourly)
- LLM-as-judge evaluations (Beautiful Conversations)
- Email sending (welcome emails, notifications)
- Export generation (large data exports)

---

### Cost at 10K-50K Users

**Infrastructure:**
- Vercel: $100-300/month (Pro tier, higher traffic)
- Neon: $300-800/month (Scale tier + read replica)
- Upstash Redis: $50-150/month
- Inngest: $50-200/month (background jobs)
- S3: $10-50/month (archived conversations)
- Claude API: $5K-20K/month (intelligent routing critical here)
- Monitoring: $50-200/month (Sentry + basic dashboards)
- **Total: ~$6K-22K/month**

**Revenue (at 5% conversion, 50K users):**
- 2,500 Pro users × $18.99 = $47,475/month
- After rev share (~70/30 blended): $33,233/month to Voyager
- **Margin: ~40-60% (depending on AI usage)**

---

## PHASE 3: 50K-100K USERS (Months 15-24)

### What Changes

**Infrastructure:**
- ✅ Stay on Neon (still works, but monitoring closely)
- ✅ Stay on Vercel (still scales)
- ⬜ **Consider database sharding** (if single DB is bottleneck)
- ⬜ **Dedicated search infrastructure** (Algolia or Meilisearch)
- ⬜ **Multi-region caching** (Cloudflare KV or similar)
- ⬜ **Real-time infrastructure for Collab Spaces** (SSE or WebSockets)

---

### Database: To Shard or Not to Shard?

**Decision Point: 75K-100K users**

**Signs You Need Sharding:**
- Primary database CPU consistently > 80%
- Write query latency > 200ms P95
- Connection pool hitting limits despite read replicas
- Database costs > $2K/month and growing fast

**If These Don't Happen:** Stay on single Neon instance. Don't add complexity unnecessarily.

**If Sharding Needed:**

**Option A: Shard by Community**
- Each large community gets own database shard
- Smaller communities share shards
- Makes sense for our B2B2C model (communities are natural boundaries)

```
Shard 1: Community A (50K users)
Shard 2: Community B (30K users)
Shard 3: Communities C-J (20K users total)
```

**Pros:**
- Natural boundary (no cross-shard queries for most operations)
- Scales with business model (add shard per big community)
- Collab Spaces don't cross shards (all in one DB)

**Cons:**
- Cross-community features are hard
- Rebalancing if community shrinks

**Option B: Shard by User ID**
- Hash userId to determine shard
- More traditional approach

**Pros:**
- Even distribution of load
- Standard sharding pattern

**Cons:**
- Cross-user queries are hard (Collab Spaces with users from different shards)
- Not aligned with business model

**Recommendation: Shard by Community (Option A)**

**How to Implement:**
```typescript
// Prisma doesn't support sharding natively
// Add sharding logic in application layer

const getDbClient = (communityId: string) => {
  const shardId = determineShardId(communityId)
  return dbClients[shardId] // Return correct Prisma client
}

// Usage:
const db = getDbClient(conversation.communityId)
await db.message.create({ ... })
```

**Timeline:**
- Month 18: Plan sharding strategy (if metrics indicate need)
- Month 20: Implement sharding for largest community (test)
- Month 22: Roll out to all large communities
- Month 24: Full sharding operational

---

### Search Infrastructure (Archive Search at Scale)

**Current: Postgres Full-Text Search**
- Works fine: 0-10K users
- Gets slow: 50K+ users (lots of archived conversations)

**When to Upgrade: 50K users OR when archive search is slow**

**Options:**

**Option A: Algolia**
- Hosted search service
- Fast, scales infinitely
- Cost: ~$1/1,000 searches
- Easy integration (REST API)
- **Pros:** Zero ops burden, just works
- **Cons:** Can get expensive at scale

**Option B: Meilisearch (Self-Hosted)**
- Open-source search engine
- Deploy on Railway, Fly.io, or DigitalOcean
- Cost: ~$20-100/month (server costs)
- **Pros:** Cheap, full control
- **Cons:** Need to manage infrastructure

**Option C: Typesense**
- Open-source, similar to Meilisearch
- Slightly easier to manage
- Cloud option available

**Recommendation:**
- **Start:** Postgres full-text (already have)
- **At 30K users:** Add pg_trgm extension for better fuzzy search (still Postgres)
- **At 50K users:** Evaluate Meilisearch or Algolia based on archive usage patterns
  - If archive search is heavily used → invest in Algolia
  - If moderate usage → Meilisearch self-hosted

---

### Real-Time for Collab Spaces

**When Needed: v0.6.0 (Collab Spaces launch, Month 10)**

**Options:**

**Option A: Polling (Start Here)**
```typescript
// Simple, no new infrastructure
setInterval(() => {
  fetchNewMessages(spaceId)
}, 5000) // Poll every 5 seconds
```

**Pros:**
- Zero new infrastructure
- Works fine for small groups (3-10 people)
- Easy to implement

**Cons:**
- Not instant (5-second delay)
- More API calls (costs)
- Not "truly" real-time

**When to Use:** v0.6.0 launch (private Collab Spaces, small groups)

---

**Option B: Server-Sent Events (SSE)**
```typescript
// Next.js supports this natively
export async function GET(req: Request) {
  const stream = new ReadableStream({
    start(controller) {
      // Send updates as they happen
      controller.enqueue(`data: ${JSON.stringify(newMessage)}\n\n`)
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    }
  })
}
```

**Pros:**
- Built into Next.js (no external service)
- True real-time (instant updates)
- One-way server → client (perfect for message updates)

**Cons:**
- Keeps serverless function alive (costs)
- Limited to server → client (no client → server)

**When to Use:** v0.7.0 (public Collab Spaces) if polling feels too slow

---

**Option C: WebSockets (Only if Necessary)**

**Why Vercel Doesn't Support WebSockets:**
- Serverless functions are stateless
- WebSockets need persistent connections
- Vercel can't maintain long-lived connections

**If You Need WebSockets:**
- Deploy separate WebSocket server (Fly.io, Railway)
- Use service like Pusher or Ably (~$50-500/month)
- **Only if SSE isn't good enough**

**When to Use:** Only at 100K+ users if SSE performance is insufficient

**Recommendation for Collab Spaces:**
```
v0.6.0 (private spaces): Polling (5 sec)
v0.7.0 (public spaces): Upgrade to SSE if user feedback demands it
100K+ users: WebSockets only if SSE bottlenecks
```

---

### Cost at 50K-100K Users

**Infrastructure:**
- Vercel: $300-500/month (higher traffic, more functions)
- Neon: $800-2,000/month (multiple read replicas, possibly sharding prep)
- Upstash Redis: $150-300/month (more caching)
- Inngest: $200-500/month (more background jobs)
- S3: $50-200/month (growing archive)
- Search (if added): $100-1,000/month (Meilisearch or Algolia)
- Claude API: $20K-40K/month (intelligent routing critical, volume growing)
- Monitoring: $200-500/month (Datadog or Grafana)
- **Total: ~$22K-45K/month**

**Revenue (at 5% conversion, 100K users):**
- 5,000 Pro users × $18.99 = $94,950/month
- 100 Max users × $99 = $9,900/month
- **Total: $104,850/month**
- After rev share (~70/30 blended): $73,395/month to Voyager
- **Margin: ~40-60%** (depending on actual infrastructure needs)

---

## INFRASTRUCTURE MILESTONES BY USER COUNT

### 0-1K Users (Months 0-4)
**Status:** ✅ Current stack is perfect
**Action:** Build features, monitor costs, don't optimize yet
**Cost:** ~$150-600/month

---

### 1K-5K Users (Months 4-6)
**Action:**
- ⬜ Set up proper monitoring (Sentry, Vercel Analytics)
- ⬜ Create cost dashboard (track spend per user)
- ⬜ Optimize database indexes (add compound indexes)
**Cost:** ~$600-1,200/month

---

### 5K-10K Users (Months 6-9)
**Action:**
- ⬜ Add Redis caching (Upstash)
- ⬜ Upgrade Neon tier (Launch → Scale)
- ⬜ Implement usage tracking (for message limits)
**Cost:** ~$1,200-3,500/month

---

### 10K-30K Users (Months 9-12)
**Action:**
- ⬜ Add Neon read replica (one-click)
- ⬜ Implement archival strategy (old conversations → S3)
- ⬜ Set up background jobs (Inngest)
- ⬜ Load test (simulate 30K concurrent users)
**Cost:** ~$3,500-15K/month

---

### 30K-50K Users (Months 12-15)
**Action:**
- ⬜ Evaluate search infrastructure (pg_trgm or Meilisearch)
- ⬜ Add SSE for Collab Spaces (if polling insufficient)
- ⬜ Monitor database metrics (watch for sharding signals)
**Cost:** ~$15K-25K/month

---

### 50K-75K Users (Months 15-20)
**Action:**
- ⬜ Add dedicated search (Algolia or Meilisearch)
- ⬜ Multi-region caching (Cloudflare KV)
- ⬜ Plan database sharding (if metrics indicate need)
**Cost:** ~$25K-35K/month

---

### 75K-100K Users (Months 20-24)
**Action:**
- ⬜ Implement database sharding (if needed)
- ⬜ Add more read replicas (3-5 total)
- ⬜ Negotiate Anthropic volume discount (if possible at this scale)
- ⬜ Hire infrastructure engineer (first dedicated ops hire)
**Cost:** ~$35K-45K/month

---

## DECISION FRAMEWORK: WHEN TO MIGRATE

**Use this framework to decide when to add infrastructure complexity:**

### 1. Measure First
- Is current solution actually slow? (P95 latency > 500ms?)
- Is current solution expensive? (Cost per user growing?)
- Is current solution unreliable? (Error rate > 1%?)

**If NO to all three:** Don't change anything. Keep building features.

---

### 2. Optimize Before Migrating
- Can we cache this query? (Redis)
- Can we add an index? (Postgres)
- Can we paginate? (Load less data)
- Can we archive old data? (S3)

**Try optimization first. Migration is last resort.**

---

### 3. Validate with Users
- Are users complaining about speed?
- Are users asking for real-time features?
- Are users hitting limits (message counts, etc)?

**If NO:** Don't add complexity yet. Users are happy.

---

### 4. Calculate ROI
- Migration cost: Engineering time + new service cost
- Benefit: Speed improvement + cost savings + user satisfaction
- **ROI = Benefit ÷ Cost**

**If ROI < 2x:** Don't migrate. Not worth the complexity.

---

## TEAM EVOLUTION

### 0-50K Users (Months 0-15)
**Team Size:** 8-15 people
**Infrastructure:** Kai handles it (CTO wearing ops hat)
**No dedicated ops hire yet**

---

### 50K-100K Users (Months 15-24)
**Team Size:** 15-30 people
**First Ops Hire:** Infrastructure Engineer (Month 18-20)
  - Manages databases, caching, monitoring
  - Works with Kai on architecture decisions
  - Frees up Kai to focus on features

---

### 100K+ Users (Beyond Roadmap)
**Team Size:** 30-100 people
**Ops Team:** 3-5 people
  - Senior Infrastructure Engineer (lead)
  - Database Engineer
  - DevOps Engineer (CI/CD, deployments)
  - Site Reliability Engineer (monitoring, incidents)

---

## COST PROJECTION SUMMARY

| Users | Monthly Infra Cost | Monthly Revenue | Margin |
|-------|-------------------|-----------------|--------|
| 1K    | $600              | $950            | 37%    |
| 5K    | $1,200            | $4,750          | 55%    |
| 10K   | $3,500            | $9,500          | 60%    |
| 30K   | $15,000           | $28,500         | 58%    |
| 50K   | $25,000           | $47,500         | 55%    |
| 75K   | $35,000           | $71,250         | 56%    |
| 100K  | $45,000           | $95,000         | 57%    |

**Notes:**
- Revenue assumes 5% Pro conversion @ $18.99/month + 0.1% Max @ $99
- Revenue shown is BEFORE revenue share (after = ~70% of shown)
- Margins stay healthy (50-60%) throughout journey
- Costs scale sub-linearly (economies of scale kick in)

---

## KEY TAKEAWAYS

**1. Current Stack Scales to 100K**
- Next.js + Vercel + Neon + Claude API is solid foundation
- No major rewrites needed
- Just incremental improvements along the way

**2. Neon Was the Right Choice**
- Serverless Postgres eliminates manual scaling
- Auto-scales compute + storage
- Connection pooling built-in
- Read replicas are one-click
- **No database migration needed from 0 → 100K users**

**3. Measure Before Migrating**
- Don't add complexity prematurely
- Most "scale problems" are actually index problems
- Caching solves 80% of performance issues
- Only migrate when metrics prove it's necessary

**4. Costs Scale Sub-Linearly**
- Per-user costs decrease as we grow
- Economies of scale (shared infrastructure)
- Bulk pricing kicks in (Anthropic, Vercel, Neon)
- Margins stay healthy (50-60%) throughout

**5. Team Stays Lean**
- No dedicated ops hire until 50K+ users
- Kai (CTO) can manage infrastructure until then
- Serverless stack = low operational burden
- Team focuses on features, not infrastructure firefighting

---

## NEXT ACTIONS

**This Month (Month 4):**
- ⬜ Set up monitoring (Sentry + Vercel Analytics)
- ⬜ Document current database indexes
- ⬜ Create cost tracking dashboard (Vercel + Neon + Claude)

**Month 5-6 (As We Approach 5K Users):**
- ⬜ Add Redis caching (Upstash)
- ⬜ Implement usage tracking (message limits)
- ⬜ Optimize slow queries (add indexes where needed)

**Month 9 (Economy Launch with Eli):**
- ⬜ Load test before launch (simulate 10K users)
- ⬜ Set up alerts (cost spikes, errors, slow queries)
- ⬜ Ensure monitoring is robust (can't go dark during launch)

**Month 12 (Collab Spaces Public):**
- ⬜ Implement archival strategy (S3 for old conversations)
- ⬜ Add read replica (if query load high)
- ⬜ Evaluate real-time strategy (polling vs SSE)

**Month 18-20 (Approaching 100K):**
- ⬜ Hire infrastructure engineer (first ops hire)
- ⬜ Evaluate database sharding (if metrics indicate need)
- ⬜ Add dedicated search (Algolia or Meilisearch)

---

**Created by:** Kai (CTO) + Marcus (Infrastructure)
**Date:** 2025-11-08
**Status:** Living document (update as we learn)
**Next Review:** Month 6 (after 5K users milestone)
