# ROADMAP TO 100K USERS

**Project:** Voyager
**Goal:** Scale from 0 → 100,000 users with sustainable economics
**Philosophy:** Think big, start small, move fast
**Approach:** Kanban - ship when ready, not when calendar says

---

## THE SEQUENCE

```
Beautiful Conversations → Economy Setup → Collab Spaces → Shipwright →
Profile/Realms → Pilot Launch → Max Tier → Multi-Community → 100K Users
```

**No timelines. Just: What's next? Ship it. Move to next.**

---

## CORE PHILOSOPHY

**Ship List vs Parking Lot:**
- **Ship List:** Features required to reach next milestone
- **Parking Lot:** Validated ideas for future (not now)

**Lean Startup Approach:**
- Build → Measure → Learn → Iterate
- Ship small, validate fast, scale what works
- Kill what doesn't work (be ruthless)

**Constitutional Foundation:**
- Every feature honors Elevation, Preservation, Collaboration
- Beautiful Conversations at every interaction
- Quality over quantity always

---

## NOW: CONTEXT ANCHORS + SHIPWRIGHT 🚧

**What:** Context Anchors v1.0 (Document Upload & Shipwright Editing)
**Status:** IN PROGRESS (Experiment 006)
**Milestone:** Users can upload docs, edit with AI, export polished artifacts

### What We're Building

**Context Anchors (Inputs):**
- Drag-and-drop document upload (PDF, DOCX, TXT, MD)
- Parse to markdown, store voyage-specific
- Display in sidebar with preview
- Persist across conversations

**Shipwright Integration (Process):**
- Collaborative editing of Context Anchors
- Live markdown preview
- Conversational refinement with AI
- Version tracking

**Output Artifacts (Exports):**
- Export edited docs as PDF
- Save artifact history
- Link to Shipwright sessions

### Why This Matters

- **Core user need:** "Upload my resume and JD, get real help preparing for my interview"
- Makes AI conversations deeply personalized
- Creates tangible outputs (polished resume, cover letter, LinkedIn posts)
- Foundation for Shipwright mode value

### Success Metrics

- ✅ Users can upload documents via drag-and-drop
- ✅ Documents parse and display correctly (95%+ accuracy)
- ✅ Shipwright can edit and export as PDF
- ✅ User feedback: "This actually helped me ship something"

### Team

**Owner:** Kai (implementation) + Jordan (UX) + Marcus (backend)

### Reference

`.lab/design-briefs/CONTEXT_ANCHORS_V1.md`
`.lab/experiments/006-context-anchors/`

---

## RECENTLY SHIPPED: BEAUTIFUL CONVERSATIONS ✅

**What:** Beautiful Conversations System (v0.2.0)
**Status:** SHIPPED - Frameworks integrated into all commands
**Milestone:** Conversations consistently rated 4+/5 flow quality

### What We Shipped

- Constitutional Principles framework (WHO we are)
- Beautiful Conversations framework (HOW we communicate)
- 6 flow principles: Echo-Expand, Depth Match, Question Rhythm, Energy Mirror, Smooth Transitions, Conversational Space
- All commands reference both frameworks
- Turn-based team interactions
- `/how-beautiful` evaluation command

### Reference

`.claude/portable/CONSTITUTIONAL_PRINCIPLES.md`
`.claude/portable/BEAUTIFUL_CONVERSATIONS.md`
`.lab/experiments/003-beautiful-conversations/`

### Infrastructure (Current: ~0-1K Users)

**Stack:** Vercel + Neon + Claude API (works perfectly)

**Actions:**
- Set up monitoring (Sentry + Vercel Analytics)
- Optimize database indexes
- Track costs per user

**Reference:** `INFRASTRUCTURE_JOURNEY.md` - "0-1K Users"

---

## NEXT: ENABLE REVENUE 📋

**What:** Economy Infrastructure (v0.3.0)
**Status:** DESIGN COMPLETE, ready after Beautiful Conversations ships
**Milestone:** Payment system ready, can collect money

### What We're Building

**Stripe Integration:**
- Subscriptions (monthly billing)
- Webhooks (payment events)
- Upgrade/downgrade flows

**Three-Tier System:**
- Free: 100 AI messages/month
- Pro: 500 AI messages/month @ $18.99
- Max: 5,000 AI messages/month @ $99

**Usage Tracking:**
- Count AI messages per user
- Enforce limits (soft caps, upgrade prompts)
- Track costs per user/community

**Intelligent Model Routing:**
- Classify query complexity (simple vs complex)
- Route simple → Haiku ($3/1M tokens)
- Route complex → Sonnet ($15/1M tokens)
- Free tier: 70% Haiku, 30% Llama (open source)
- Pro tier: 70% Haiku, 30% Sonnet

**Growth-Aligned Revenue Share:**
- Calculate community builder revenue share (5% → 50% tiers)
- Automated monthly payouts
- Transparent reporting dashboard

### Why This Matters

- **Must have BEFORE we offer paid features**
- Enables revenue when users want Pro tier
- Validates pricing ($18.99 feels right?)
- Foundation for sustainable business

### What We're NOT Doing Yet

- ❌ Not launching pilot (product not complete)
- ❌ Not selling Pro tier (no Pro features yet)
- ✅ Just infrastructure ready to go

### Success Metrics

- ✅ Stripe integration works (test payments successful)
- ✅ Usage tracking accurate (AI message counts correct)
- ✅ Intelligent routing saves costs (70% Haiku usage)
- ✅ Revenue share calculation verified

### Team

**Owner:** Marcus (economy lead) + Kai (infrastructure)

### Reference

`.lab/design-briefs/VOYAGER_ECONOMY.md`

### Infrastructure (~1K-5K Users)

**New:**
- Add Redis caching (Upstash) for session management
- Upgrade Neon tier (Free → Launch tier)
- Implement usage tracking infrastructure

**Reference:** `INFRASTRUCTURE_JOURNEY.md` - "1K-5K Users"

---

## NEXT+1: UNLOCK FREE TIER 📋

**What:** Collab Spaces (v0.4.0)
**Status:** DESIGN COMPLETE
**Milestone:** 1,000+ active collaborators, free tier feels generous

### What We're Building

**Private Collab Spaces (Ship First):**
- Invite-only collaborative workshop spaces
- Commitment gate UI (psychological quality filter)
- Linear conversation (not nested threads)
- Finite lifecycle (open → active → closed)
- Basic archiving (closed spaces = view-only)

**Public Collab Spaces (Ship After Private Validates):**
- Public opt-in spaces (any community member can join)
- Discovery & search (find relevant active spaces)
- Commitment gate for joiners (maintain quality at scale)
- Full-text search across spaces

### Why This Matters

- **Free tier becomes generous:** 100 AI messages + unlimited human collab
- Human-to-human messages cost $0 (only AI uses tokens)
- When AI messages run out → "Join a Collab Space!"
- Network effects begin (archives compound knowledge)
- Tests if commitment gate maintains quality at scale

### Success Metrics

- ✅ 30%+ create a private space
- ✅ 60%+ spaces close with resolution
- ✅ 40%+ join a public space
- ✅ <10% spaces need moderation (commitment gate works!)
- ✅ 4+/5 collaborator satisfaction

### Team

**Owner:** Jordan (UX lead) + Kai (backend) + Marcus (infrastructure)

### Reference

`.lab/design-briefs/COLLAB_SPACES_CONCEPT.md`

### Infrastructure (~5K-10K Users)

**Same as Economy phase** - Redis + upgraded Neon tier

**Monitor:**
- Query load (watch for need to add read replica)
- Collab Spaces message volume (human-to-human should be $0 cost)

**Reference:** `INFRASTRUCTURE_JOURNEY.md` - "5K-10K Users"

---

## NEXT+2: AI-GUIDED COLLABORATION 📋

**What:** Shipwright (v0.5.0)
**Status:** PLANNING PHASE
**Milestone:** AI-guided crafting validates, users love it

### What We're Building

**Question Crafting Mode:**
- AI guides user to craft clear opening question for Collab Space
- Asks clarifying questions (context, goal, success criteria)
- Helps structure thinking (Elevation, not replacement)

**Response Crafting Mode:**
- AI helps user craft thoughtful response to Collab Space
- Sees full conversation context
- Guides toward helpful, constructive contributions

**Draft System:**
- Save drafts
- Refine with Shipwright
- Post when ready

**Works Everywhere:**
- Navigator (solo conversations)
- Collab Spaces (collaborative conversations)

### Why This Matters

- Shipwright makes sense WITH Collab Spaces (tool for collaboration, not standalone)
- Teaches users to ask better questions (Elevation)
- Teaches users to craft thoughtful responses (Elevation)
- Validates AI-guided creation (foundation for custom tools later)

### Success Metrics

- ✅ 40%+ try Shipwright for questions/responses
- ✅ 70%+ find it helpful (survey)
- ✅ Question quality improves (LLM-as-judge)
- ✅ Users learn over time (need Shipwright less as they improve)

### Team

**Owner:** Jordan (UX) + Kai (backend) + Zara (prompts)

### Infrastructure (~10K Users)

**New:**
- Add Neon read replica (if query load high)
- Implement archival strategy (old conversations → S3)
- Set up background jobs (Inngest) for archival

**Reference:** `INFRASTRUCTURE_JOURNEY.md` - "10K-30K Users"

---

## NEXT+3: PERSONALIZATION 📋

**What:** Profile & Realm (v0.6.0)
**Status:** DESIGN PHASE (will /play before building)
**Milestone:** Pro tier feels magical, worth $18.99/month

### What We're Building

**Part 1: /profile Interview**
- Cartographer-led profile building conversation
- Extract: Background, personality, communication style, goals, context
- Store in UserProfile schema
- Inject into Navigator system prompts

**Part 2: Realm Customization**
- Visual customization (themes, colors, avatar)
- Tone customization (communication style preferences)
- Domain customization (career focus, frameworks, expertise areas)
- Preview realm before committing

**Part 3: Realm Experience**
- Navigator references user context naturally
- Responses feel personalized (not generic)
- Users can update realm settings anytime
- A/B test: generic vs personalized (validate value)

### Why This Matters

- **THIS IS THE PRO TIER VALUE** ($18.99/month)
- "Like finally getting your custom Fortnite skin"
- Differentiation from generic AI chatbots
- Retention driver (personalized experience sticks)

### Success Metrics

- ✅ 60%+ complete /profile interview
- ✅ 40%+ customize realm settings
- ✅ 25%+ conversion free → Pro (in pilot)
- ✅ Profile match score > 4.0 (Beautiful Conversations eval)
- ✅ Users say "feels like it knows me"

### Team

**Owner:** Priya (product lead) + Jordan (UX) + Alex (frontend) + Kai (backend)

### Reference

TBD - will create design doc during /play session

### Infrastructure (~10K-30K Users)

**Actions Before Pilot Launch:**
- Load test (simulate 30K concurrent users)
- Ensure monitoring robust (can't go dark during launch)
- Archive strategy operational (keep DB lean)

**Reference:** `INFRASTRUCTURE_JOURNEY.md` - "10K-30K Users"

---

## NEXT+4: PILOT LAUNCH 🎯

**What:** Launch with Eli - Careersy Pilot (v0.7.0)
**Status:** READY TO EXECUTE (after v0.6.0 ships)
**Milestone:** First real users, first real revenue

### What We're Launching

**Complete Product:**
- ✅ Navigator (AI coaching)
- ✅ Beautiful Conversations (quality everywhere)
- ✅ Collab Spaces (free tier = generous)
- ✅ Shipwright (AI-guided crafting)
- ✅ Profile/Realms (Pro tier personalization)
- ✅ Payment system (Stripe subscriptions)

**Onboarding:**
- Eli as first community builder
- 10,000 Careersy members invited
- Free tier for everyone (100 AI msgs + unlimited collab)
- Pro tier available ($18.99/month)
- Revenue share live (growth-aligned 5% → 50%)

### Why This Matters

- **First real users, first real revenue**
- Validates complete product vision
- Tests all systems under load
- Proves business model works
- Foundation for scaling to more communities

### Success Metrics

- ✅ 5% conversion to Pro (500 paid users from 10K)
- ✅ $9,495/month revenue (before revenue share)
- ✅ 68%+ margin maintained
- ✅ Eli happy with revenue share (~$475/month at launch)
- ✅ User satisfaction > 4/5

### Team

**Owner:** Full team + Nadia (community builder success)

### Infrastructure (~10K-30K Users)

**Monitor Closely:**
- Database performance (P95 latency, connection pool)
- AI costs (intelligent routing working?)
- Error rates (catch issues fast)
- Community builder dashboard (Eli sees transparent metrics)

**Reference:** `INFRASTRUCTURE_JOURNEY.md` - "10K-30K Users"

---

## SOON: POWER USERS 📋

**What:** Max Tier & Custom Tools (v0.8.0)
**Status:** DESIGN COMPLETE
**Milestone:** Max tier users building custom tools that extend Voyager

### What We're Building

**Sandbox Environment:**
- Isolated Docker containers for tool execution
- 30-second timeout, 512MB memory limits
- Network restrictions (whitelisted APIs only)
- No database access, no file system writes

**Shipwright Tool Creation Mode:**
- Pair-programming with Shipwright to write TypeScript tools
- Constitutional check (Elevation, Preservation, Collaboration)
- Code quality check (read-only, error handling, rate limiting)
- Generate tool code, explain to user

**Tool Testing & Review:**
- Staging environment (`.tools/staging/user-{userId}/`)
- User tests tool in sandbox
- Submit for review (creates GitHub PR)
- Claude Code automated review (security, quality)

**Approval & Credit System:**
- Isaac approves platform-wide tools
- Community leaders approve community tools
- Credit system:
  - Share with community → 3 months free Max tier
  - Share platform-wide → 12 months free Max tier
- Tool library (browse, search, activate)

### Why This Matters

- **Max tier differentiation** ($99/month = limitless creation)
- Extends Voyager into real world (API calls, data fetching, integrations)
- Community-driven innovation (users build what they need)
- Competitive moat (guided open-source contribution is hard to copy)

### Success Metrics

- ✅ 10+ custom tools created (first 3 months after launch)
- ✅ 80%+ pass automated review
- ✅ 50%+ approved for community use
- ✅ 3+ approved platform-wide
- ✅ 0 security incidents

### Team

**Owner:** Kai (lead) + Zara (constitutional review) + Marcus (sandbox infrastructure)

### Reference

`.lab/design-briefs/MAX_TIER_CUSTOM_TOOLS.md`

### Infrastructure (~30K-50K Users)

**New:**
- Evaluate search infrastructure (Algolia or Meilisearch for archive search)
- Add SSE for Collab Spaces (if polling feels too slow)
- Monitor for database sharding signals (unlikely yet, but watch)

**Reference:** `INFRASTRUCTURE_JOURNEY.md` - "30K-50K Users"

---

## LATER: MULTI-COMMUNITY SCALE 📋

**What:** Multi-Community Infrastructure (v0.9.0)
**Status:** CONCEPT PHASE
**Milestone:** Scale beyond Eli to multiple communities

### What We're Building

**Community Builder Onboarding:**
- Self-service onboarding flow (can't manually onboard 20 communities)
- Community customization (branding, domain expertise, frameworks)
- Revenue share automation (growth-aligned tiers)
- Community analytics dashboard (growth, engagement, revenue)

**Cross-Community Features (Optional):**
- Cross-community discovery (users can explore other communities)
- Shared tool library (platform-wide custom tools)
- Best practices sharing (community builders learn from each other)

### Why This Matters

- Scales beyond Eli's pilot to multiple communities
- Tests if model works across different domains (not just career coaching)
- Revenue diversification (not dependent on single community)
- Network effects accelerate

### Success Metrics

- ✅ 5+ communities live on Voyager
- ✅ 50K+ total users across communities
- ✅ Each community has 5%+ Pro conversion
- ✅ Community builders rate platform 4+/5

### Team

**Owner:** Nadia (community ops lead) + Priya (product) + Marcus (infrastructure)

### Infrastructure (~50K-75K Users)

**New:**
- Hire infrastructure engineer (first dedicated ops hire)
- Evaluate database sharding (if metrics indicate need)
- Add dedicated search (if archive search heavily used)
- Multi-region caching (Cloudflare KV)

**Reference:** `INFRASTRUCTURE_JOURNEY.md` - "50K-75K Users"

---

## VISION: PLATFORM LAUNCH 🚀

**What:** Voyager Platform (v1.0.0)
**Status:** NORTH STAR
**Milestone:** 100,000 users, thriving ecosystem, sustainable business

### What We're Launching

**Public Platform:**
- Anyone can start a community (self-service)
- Marketing website (voyager.ai or similar)
- Case studies & testimonials (Eli + other builders)
- API access (for advanced integrations)
- White-label option (enterprise communities)

### Why This Matters

- **THIS IS THE 100K MILESTONE**
- Platform play (not just product)
- Sustainable business with healthy margins
- Community builders thriving (earning $700-$35K/month)
- Competitive moat established

### Success Metrics

- ✅ 100,000+ total users
- ✅ 20+ communities live
- ✅ $95K+ MRR (after revenue share to builders)
- ✅ 55%+ margin maintained
- ✅ Community builders earning sustainable income

### Team

**Owner:** Full team + Isaac (vision & strategy)

### Infrastructure (~100K Users)

**Scale Checkpoints:**
- Database sharding (if needed based on metrics)
- Read replicas (3-5 total)
- Dedicated search (Algolia or Meilisearch)
- Multi-region caching
- Negotiate Anthropic volume discount (if possible)

**Reference:** `INFRASTRUCTURE_JOURNEY.md` - "75K-100K Users"

---

## USER COUNT MILESTONES

**How we'll know we're progressing:**

```
0 users      → Foundation shipped (v0.1.0) ✅
1K users     → Beautiful Conversations live, quality measurable
5K users     → Economy ready, Collab Spaces launching
10K users    → Pilot with Eli, first revenue flowing
30K users    → Max tier live, custom tools emerging
50K users    → Multi-community scaling begins
100K users   → Platform launch, vision achieved 🎯
```

**No timeline. Just milestones. We get there when we get there.**

---

## REVENUE PROJECTION

**Pre-Pilot (Building Product):**
- No revenue yet
- Costs: ~$150-5,000/month (infrastructure scales with users)
- Investment phase (need runway)

**Pilot Launch (~10K Users):**
- 500 Pro @ $18.99 = $9,495/month
- After rev share: ~$6,647/month to Voyager
- Costs: ~$3,000/month
- **Margin: ~55%** (profitable!)

**Max Tier Added (~30K Users):**
- 1,500 Pro + 30 Max = $31,485/month
- After rev share: ~$22,040/month to Voyager
- Costs: ~$10,000/month
- **Margin: ~54%**

**Multi-Community (~50K Users):**
- 2,500 Pro + 50 Max = $52,400/month
- After rev share: ~$36,680/month to Voyager
- Costs: ~$18,000/month
- **Margin: ~51%**

**Platform Launch (~100K Users):**
- 5,000 Pro + 100 Max = $104,850/month
- After rev share: ~$73,395/month to Voyager
- Costs: ~$35,000/month
- **Margin: ~52%**
- **Annual profit: ~$460K/year**

**Margins stay healthy (50-55%) throughout journey.**

---

## SHIP LIST (In Order)

**NOW:**
- 🚧 v0.2.0: Beautiful Conversations

**NEXT:**
- 📋 v0.3.0: Economy infrastructure
- 📋 v0.4.0: Collab Spaces (private → public)
- 📋 v0.5.0: Shipwright
- 📋 v0.6.0: Profile & Realms
- 🎯 v0.7.0: Pilot launch with Eli

**SOON:**
- 📋 v0.8.0: Max tier & custom tools

**LATER:**
- 📋 v0.9.0: Multi-community infrastructure
- 🚀 v1.0.0: Platform launch (100K users)

---

## PARKING LOT (Beyond 100K)

**Validated but not required for first 100K:**

**Product Ideas:**
- Cross-community collaboration (spaces spanning communities)
- Artifact Shipwrighting (co-write documents, proposals, whiteboards)
- Enterprise features (SSO, advanced permissions, custom integrations)
- Mobile apps (iOS, Android native)
- Advanced AI features (fine-tuned models per community, voice interaction)
- Tool marketplace monetization (users can charge for custom tools)
- Educational integrations (LMS plugins, course creation)

**Elinya's Strategic Questions (To Explore):**
- Sister app for entrepreneurs (vision → reality)
- Marketing strategy for rapid + stable growth
- Corporate vs personal customer differences
- Plugin revenue models

**Move from Parking Lot to Ship List when:**
- User research proves demand
- Current features validate
- Team has capacity

---

## INFRASTRUCTURE STRATEGY

**Philosophy:** Measure before migrating. Don't over-engineer for scale we haven't reached.

### By User Count (Not Time)

**0-1K Users:**
- Current stack (Vercel + Neon + Claude API)
- Set up monitoring
- Optimize indexes

**1K-5K Users:**
- Add Redis caching (Upstash)
- Upgrade Neon tier
- Track costs per user

**5K-10K Users:**
- Implement usage tracking (message limits)
- Monitor for read replica need

**10K-30K Users:**
- Add read replica (Neon one-click)
- Implement archival (S3 for old conversations)
- Background jobs (Inngest)
- Load test before pilot

**30K-50K Users:**
- Evaluate search (Algolia or Meilisearch)
- Add SSE for real-time (if polling insufficient)
- Monitor for sharding signals

**50K-100K Users:**
- Hire infrastructure engineer (first ops hire)
- Add dedicated search (if archive search heavily used)
- Database sharding (only if metrics prove need)
- Multi-region caching

**100K+ Users:**
- See `INFRASTRUCTURE_JOURNEY.md` for path to 1M and beyond

**Reference:** `.lab/design-briefs/INFRASTRUCTURE_JOURNEY.md`

---

## TEAM RESPONSIBILITIES

### Kai (CTO)
- Technical architecture (all phases)
- Beautiful Conversations backend (v0.2.0)
- Economy infrastructure (v0.3.0)
- Collab Spaces backend (v0.4.0)
- Shipwright implementation (v0.5.0)
- Custom tools & sandbox (v0.8.0)
- Infrastructure monitoring & optimization
- **Reference:** `INFRASTRUCTURE_JOURNEY.md`

### Priya (Product)
- Product roadmap owner (this document)
- Feature prioritization (Ship List vs Parking Lot)
- Profile/Realm product lead (v0.6.0)
- User research & validation
- Metrics & KPIs tracking

### Jordan (Design)
- UX/UI for all features
- Beautiful Conversations UX (v0.2.0)
- Collab Spaces UX lead (v0.4.0)
- Shipwright UX (v0.5.0)
- Profile/Realm customization UX (v0.6.0)
- Flow dashboard design

### Alex (Frontend)
- Frontend implementation (all features)
- Beautiful Conversations UI (v0.2.0)
- Collab Spaces frontend (v0.4.0)
- Profile/Realm UI (v0.6.0)
- Dashboard implementations
- Performance optimization

### Marcus (Economics/Infrastructure)
- Economy design & implementation (v0.3.0)
- Database architecture (all phases)
- Intelligent routing implementation (v0.3.0)
- Revenue share automation (v0.3.0)
- Real-time infrastructure (Collab Spaces)
- Sandbox infrastructure (v0.8.0)
- Infrastructure monitoring

### Zara (Ethics/AI)
- Constitutional alignment validation (all features)
- Beautiful Conversations evaluation (v0.2.0)
- Prompt engineering (all AI interactions)
- Profile extraction prompts (v0.6.0)
- Custom tools constitutional review (v0.8.0)

### Nadia (Operations)
- Community builder onboarding (v0.7.0+)
- Revenue share operations (v0.7.0+)
- Multi-community scaling (v0.9.0)
- Support & success programs
- Operational excellence

### Isaac (Founder/Vision)
- Overall vision & strategy
- Ride along on all implementation (learn everything)
- User feedback & iteration
- Community builder relationships
- Strategic decisions

---

## RISKS & MITIGATIONS

### Risk 1: Takes Longer Than Expected to Ship
**Reality:** Building complete product before revenue takes time
**Mitigation:**
- Ship incrementally (celebrate small wins)
- Tight iteration loops (week-based experiments)
- Could launch pilot earlier if needed (after Collab Spaces + basic personalization)
- Lean team = low burn rate

### Risk 2: Eli's Pilot Doesn't Convert
**Impact:** Business model fails, need to pivot
**Mitigation:**
- Deep user research before launch (validate Pro tier value)
- A/B test features (prove what drives conversion)
- Generous free tier (build trust first)
- Iterate based on feedback (ship fast, learn fast)
- Could find different pilot community if needed

### Risk 3: AI Costs Spiral
**Impact:** Margins collapse, can't scale profitably
**Mitigation:**
- Monitor costs obsessively (real-time dashboards)
- Tune intelligent routing classifier aggressively
- Hard limits per user (prevent runaway usage)
- Could add self-hosted Llama earlier if needed

### Risk 4: Collab Spaces Quality Degrades
**Impact:** Commitment gate fails, becomes like forums
**Mitigation:**
- A/B test commitment language (find what works)
- Monitor quality metrics (LLM-as-judge for spaces)
- Community flagging system (surface issues early)
- Iterate commitment gate (make it aspirational, not scary)

### Risk 5: Team Burns Out
**Impact:** Quality suffers, people leave
**Mitigation:**
- Ship incrementally (avoid death marches)
- Week-based experiments (tight feedback loops)
- Hire sooner if needed (reduce individual burden)
- Practice Beautiful Conversations as team too

---

## NEXT IMMEDIATE ACTIONS

**This Week:**
- ✅ Roadmap documented (this file)
- ✅ Infrastructure journey documented
- ⬜ Team review & alignment
- ⬜ Beautiful Conversations experiment Week 1 (20 manual evaluations)

**When Beautiful Conversations Ships:**
- ⬜ Start Economy infrastructure (v0.3.0)
- ⬜ Parallel: Design Collab Spaces in detail (use /play)

**When Economy Infrastructure Ships:**
- ⬜ Start Collab Spaces (v0.4.0 - private first)
- ⬜ Test payments with internal team (validate Stripe works)

**One thing at a time. Ship when ready. Move to next.**

---

## THE VISION

**By 100K users, Voyager will be:**

- A thriving platform with 100,000+ users
- 20+ communities building rich worlds
- Community builders earning sustainable income ($700-$35K/month)
- High-quality conversations everywhere (Beautiful Conversations working)
- Collaborative knowledge creation (Collab Spaces archives compounding)
- Limitless creative extension (Max tier users building custom tools)
- Sustainable business (52%+ margins, $460K+/year profit)
- Constitutional principles embedded in every interaction

**This is not just a product. This is a new way for communities to collaborate, learn, and grow together.**

**Think big. Start small. Move fast.** 🚀

---

**Created by:** Full Voyager Team
**Date:** 2025-11-08
**Status:** Active roadmap (living document)
**Philosophy:** Ship when ready, not when calendar says
**Next Review:** After each ship (validate, iterate, adjust)
