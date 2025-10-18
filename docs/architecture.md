# Voyager Platform Architecture

System design, decisions, and principles.

---

## Vision

**Voyager is a platform, not a product.**

Communities are tenants that run on shared infrastructure with zero deployment friction.

### Core Principle
> "Everything you need, nothing you don't."

Lean, config-driven architecture that scales horizontally without complexity.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Voyager Platform                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Community   │  │  Community   │  │  Community   │     │
│  │   Careersy   │  │   Rosarians  │  │   ACME Corp  │     │
│  │              │  │              │  │              │     │
│  │ (Public)     │  │ (Public)     │  │ (Private)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  All communities share:                                      │
│  • Database                                                  │
│  • Auth system                                               │
│  • AI models                                                 │
│  • Hosting                                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Architecture Layers

### 1. Routing Layer (Middleware)

**Purpose:** Map domains to communities

```typescript
// middleware.ts
community.acme.com      → /acme-corp
careersy.voyager.ai     → /careersy
voyager.ai/careersy     → /careersy
```

**Implementation:**
- Next.js middleware
- Domain matching from JSON configs
- URL rewriting (not redirects)
- ~1ms overhead

### 2. Community Layer (JSON Configs)

**Purpose:** Zero-code community deployment

```
communities/
├── careersy.json      # Public community
├── voyager.json       # Platform navigator
└── acme-corp.json     # Private white-label
```

**Benefits:**
- Git-versioned configuration
- Instant deployment (no database writes)
- Type-safe validation
- Easy rollback

### 3. Application Layer (Next.js)

**Purpose:** Serve UI and API

```
app/
├── page.tsx                    # Voyager landing
├── [communityId]/page.tsx      # Community chat page
├── api/chat/route.ts           # Chat API
└── api/auth/[...nextauth]/     # Authentication
```

**Pattern:** Server Components + API Routes

### 4. Data Layer (PostgreSQL + Prisma)

**Purpose:** Persist user data & conversations

**Schema Design:**
```
User (1) ──┬── (*) Conversation ── (*) Message
           │
           └── communities: String[]  # Simple array
```

**Why array instead of junction table?**
- MVP: <10K users per community
- Faster queries (no JOIN)
- Simpler code
- Easy to migrate later

### 5. AI Layer (Multi-Provider)

**Purpose:** Abstract AI providers

```typescript
// Unified interface
interface ChatCompletionResponse {
  content: string
  usage?: TokenUsage
}

// Supports:
callAIModel(config, messages) → Response
// config.provider: 'anthropic' | 'openai'
```

**Benefits:**
- Switch providers without code changes
- Cost optimization
- Redundancy

---

## Key Design Decisions

### ADR-001: JSON-Based Communities

**Decision:** Communities defined by JSON files, not database records

**Rationale:**
- Instant deployment (no migrations)
- Git version control
- Developer-friendly
- Zero database queries for metadata

**Trade-offs:**
- Must redeploy to add community
- File system reads (negligible)

**Scalability:**
- Works until 1000+ communities
- Add Redis cache if needed (one line)

### ADR-002: Custom Domains via Middleware

**Decision:** Use Next.js middleware for domain routing

**Rationale:**
- Zero-config on Vercel
- SSL handled automatically
- Works with subdomains + custom domains
- No reverse proxy needed

**Trade-offs:**
- Slight latency (~1ms)
- Couples routing to deployment

**Scalability:**
- Unlimited domains
- Multi-region support built-in

### ADR-003: Database Session Strategy

**Decision:** Store sessions in database (not JWT)

**Rationale:**
- Instant revocation
- More secure (no token exposure)
- Simpler permission checks

**Trade-offs:**
- Requires database query per request
- Slightly slower than JWT

**Scalability:**
- Add Redis session store if needed
- Current: handles 10K+ concurrent users

### ADR-004: Community Permissions via Array

**Decision:** Store user communities as `String[]` in User table

**Rationale:**
- Simpler queries (no JOIN)
- Faster for MVP
- Easy permission checks
- Sufficient for <10K users/community

**Migration Path:**
```sql
-- When scale demands it:
CREATE TABLE CommunityMember (
  userId TEXT,
  communityId TEXT,
  role TEXT,
  PRIMARY KEY (userId, communityId)
);
```

### ADR-005: Multi-Provider AI

**Decision:** Abstract AI providers behind unified interface

**Rationale:**
- Cost optimization (switch based on price)
- Redundancy (fallback if provider down)
- Feature access (use best model for task)

**Trade-offs:**
- Slightly more complex than single provider
- Must handle provider-specific quirks

**Scalability:**
- Add caching layer for common prompts
- Batch requests when possible

---

## Data Flow

### User Chat Journey

```
1. User visits voyager.ai
   ↓
2. Middleware: hostname = voyager.ai → No rewrite
   ↓
3. Render app/page.tsx (Voyager landing)
   ↓
4. User enters message
   ↓
5. POST /api/chat { communityId: 'voyager' }
   ↓
6. Load communities/voyager.json
   ↓
7. Call AI provider (Anthropic/OpenAI)
   ↓
8. Return response
   ↓
9. Render markdown in UI
```

### Custom Domain Flow

```
1. User visits community.acme.com
   ↓
2. DNS → Vercel (CNAME)
   ↓
3. Middleware: hostname = community.acme.com
   ↓
4. Load all communities, find match
   ↓
5. Rewrite URL: / → /acme-corp
   ↓
6. Render app/[communityId]/page.tsx
   ↓
7. Check auth & community membership
   ↓
8. Render chat interface
```

---

## Security Architecture

### Authentication Flow

```
1. User clicks "Sign in with Google"
   ↓
2. Redirect to Google OAuth
   ↓
3. Google returns with code
   ↓
4. NextAuth exchanges code for tokens
   ↓
5. Create/update User in database
   ↓
6. Auto-join public communities
   ↓
7. Create session in database
   ↓
8. Return session cookie
```

### Authorization Checks

```typescript
// Server-side only
const session = await getServerSession()
if (!session) redirect('/login')

const user = await prisma.user.findUnique({
  where: { id: session.user.id }
})

if (!user.communities.includes(communityId)) {
  return 403 Forbidden
}
```

**Key Principles:**
- All auth checks server-side
- Never trust client
- Validate on every request
- Use TypeScript for type safety

---

## Performance Considerations

### Current Bottlenecks (None Critical)

1. **Community config loading:** File system reads
   - **Impact:** ~2ms per request
   - **Solution:** Add `unstable_cache` when >1000 communities

2. **Database queries:** 2-3 per page load
   - **Impact:** ~50ms per request
   - **Solution:** Add Prisma query optimization, read replicas

3. **AI API calls:** 500ms - 3s response time
   - **Impact:** User-facing
   - **Solution:** Streaming responses (future)

### Optimization Strategy

**Phase 1:** (Now - 1K users)
- No optimization needed
- Monitor with Vercel Analytics

**Phase 2:** (1K - 10K users)
- Add Redis for community configs
- Implement prompt caching
- Connection pooling

**Phase 3:** (10K+ users)
- Read replicas for database
- CDN for static assets
- Edge functions for middleware

---

## Deployment Architecture

### Current: Vercel + Neon

```
┌─────────────────────────────────────────┐
│           Vercel (Hosting)              │
│  ┌──────────────────────────────────┐  │
│  │  Next.js (Serverless Functions)  │  │
│  │  - SSR Pages                      │  │
│  │  - API Routes                     │  │
│  │  - Middleware                     │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
                   │
                   ↓ (SQL over HTTP)
┌─────────────────────────────────────────┐
│      Neon (Serverless PostgreSQL)       │
│  - Auto-scaling                          │
│  - Branching for dev                     │
│  - Backups                               │
└─────────────────────────────────────────┘
```

**Benefits:**
- Zero DevOps
- Auto-scaling
- Global CDN
- Preview deployments

**Cost:**
- ~$20/month (Vercel Pro)
- ~$20/month (Neon Scale)
- **$0.50 per community** in practice

---

## Scalability Roadmap

| Users | Communities | Changes Needed |
|-------|-------------|----------------|
| <1K | <10 | **None** (current) |
| 1K-10K | 10-100 | Redis cache for configs |
| 10K-100K | 100-1K | Read replicas, CDN |
| 100K+ | 1K+ | Microservices, Kubernetes |

**Current Target:** 1K-10K users across 10-100 communities

**Refactoring Needed:** Minimal (add caching, no architecture changes)

---

## Future Enhancements

### Planned
- [ ] Streaming AI responses
- [ ] Prompt caching
- [ ] Redis session store
- [ ] Webhook system for integrations

### Under Consideration
- [ ] Multi-region deployment
- [ ] Dedicated databases per enterprise
- [ ] GraphQL API
- [ ] Mobile apps (React Native)

---

## Principles

1. **Config over code** - JSON configs for communities
2. **Lean by default** - No feature until proven needed
3. **Type-safe** - TypeScript strict mode
4. **Server-first** - Server components, API routes
5. **Git as source of truth** - Infrastructure as code
6. **Developer experience** - Simple, logical, documented

---

## References

- [Codebase Review](./../.claude/CODEBASE_REVIEW.md)
- [Community System](./communities.md)
- [Custom Domains](./custom-domains.md)
- [Getting Started](./getting-started.md)

---

**Last Updated:** 2025-10-19
**Version:** 1.0.0
