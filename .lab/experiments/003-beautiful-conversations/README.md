# Experiment 003: Beautiful Conversations

**Status:** 🚧 IN PROGRESS
**Start Date:** 2025-11-05
**Target Completion:** 2025-12-17 (6 weeks)
**Owner:** Kai (lead) + Zara (evaluation) + Marcus (infrastructure)

---

## Hypothesis

**Core Belief:**
> "Conversation flow quality IS the product. If we make every conversation feel beautiful (effortless, elevating, personal), Voyager becomes differentiated in a way competitors can't easily copy."

**Success = When:**
- Flow score consistently > 4.0/5
- 70%+ conversations rated "beautiful" (4+)
- Users describe Voyager as "feeling different from ChatGPT"
- Measurable improvement after each refinement

---

## The Problem

Current state:
- Conversations are helpful but not memorable
- Flow quality is inconsistent
- No measurement of conversation UX
- Can't prove "beautiful" - just vibes

**Without this:**
- Can't measure if improvements work
- Can't demonstrate AI learning
- Miss core differentiator (everyone has RAG, few have beautiful flow)

---

## The Solution

Build a **modular prompt system** with **automated evaluation** that makes every conversation beautiful.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    SYSTEM PROMPT                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  CONSTITUTIONAL LAYER (immutable)                │  │
│  │  - Elevation over replacement                     │  │
│  │  - Preservation of agency                         │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  BEAUTY LAYER (new - shared across communities)  │  │
│  │  - Echo-expand pattern                            │  │
│  │  - Depth matching                                 │  │
│  │  - Question rhythm                                │  │
│  │  - Energy mirroring                               │  │
│  │  - Smooth transitions                             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  DOMAIN EXPERTISE (per community)                │  │
│  │  - Career coaching knowledge                      │  │
│  │  - Frameworks & best practices                    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  PROFILE LAYER (per user - new)                  │  │
│  │  - Background, personality, preferences           │  │
│  │  - Recent conversation context                    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
                              ↓
                    Every conversation
                              ↓
                    10% sampled for eval
                              ↓
                ┌──────────────────────────┐
                │   LLM-as-Judge           │
                │   Scores flow quality    │
                └──────────────────────────┘
                              ↓
                    Logged to database
                              ↓
                ┌──────────────────────────┐
                │   Flow Dashboard         │
                │   Track quality trends   │
                └──────────────────────────┘
```

---

## Implementation Plan (6 Weeks)

### Week 1: Foundation (Nov 5-11)
**Goal:** Define what "beautiful" means

**Tasks:**
- ✅ Create `docs/beautiful-conversations.md` (framework)
- ✅ Create evaluation rubric
- ⬜ Manually evaluate 20 existing conversations
- ⬜ Build intuition for flow quality

**Deliverables:**
- Documentation of beautiful flow principles
- Baseline understanding of current quality
- Rubric for evaluation (1-5 scale, 5 dimensions)

**Success:** Can consistently identify beautiful vs broken conversations

**Owner:** Zara (rubric) + Isaac (manual eval) + Kai (docs)

---

### Week 2: Modular Prompt System (Nov 12-18)
**Goal:** Inject beauty principles into all modes

**Tasks:**
- Create `lib/prompts/beauty.ts`
- Refactor `lib/communities.ts` to layered assembly
- Update all modes (Navigator, Cartographer, Shipwright)
- Test with sample conversations

**Deliverables:**
- Modular prompt architecture shipped
- All modes using beauty principles
- No regressions

**Success:** Prompts are modular, beauty layer applies to all communities

**Owner:** Kai (implementation) + Zara (content review) + Marcus (architecture review)

---

### Week 3: LLM-as-Judge Evaluation (Nov 19-25)
**Goal:** Automatically measure flow quality

**Tasks:**
- Database schema: `ConversationFlowEvaluation`
- Evaluation service: `lib/evaluation/flow-evaluator.ts`
- Background job: Sample & evaluate 10% hourly
- API endpoint: `/api/evaluate/flow`

**Deliverables:**
- Evaluation pipeline running in production
- 10% of conversations auto-evaluated
- Data flowing into database

**Success:** Can see flow scores in database, eval running automatically

**Owner:** Marcus (schema, jobs) + Zara (eval prompt) + Kai (API)

**Cost:** ~$0.006 per eval, ~$6 per 1000 conversations (negligible)

---

### Week 4: Flow Dashboard (Nov 26-Dec 2)
**Goal:** Visualize flow quality, spot issues

**Tasks:**
- Design dashboard UI/UX
- Build `/admin/flow` page
- Show: Overall scores, trends, outliers
- Alert when flow drops below threshold

**Deliverables:**
- Dashboard at `/admin/flow`
- Visual overview of flow quality
- Ability to investigate poor-flow conversations

**Success:** Can see flow trends at a glance, investigate issues

**Owner:** Jordan (design) + Alex (frontend) + Kai (queries)

---

### Week 5-6: Profile Integration (Dec 3-16)
**Goal:** Personalize using user profiles

**Tasks:**
- Create `UserProfile` schema
- Extract profiles from Cartographer sessions
- Inject profiles into system prompts
- Evaluate profile match scores

**Deliverables:**
- UserProfile schema in production
- Auto-extraction from Cartographer
- Profile-aware Navigator responses
- Profile match tracked in evals

**Success:** Navigator references user background/personality, profile match score > 4.0

**Owner:** Marcus (schema) + Zara (extraction) + Kai (injection)

---

## Success Criteria

### Week 1 Success
- ✅ 20 conversations manually evaluated
- ✅ Rubric feels reliable (consistent scoring)
- ✅ Can articulate what makes flow beautiful

### Week 2 Success
- ✅ All modes have beauty layer
- ✅ No regressions (existing functionality works)
- ✅ Sample conversations show improvement

### Week 3 Success
- ✅ 10% of conversations auto-evaluated
- ✅ Data in database
- ✅ LLM scores align with manual scores (80%+ agreement)

### Week 4 Success
- ✅ Dashboard shows meaningful insights
- ✅ Can identify poor-flow conversations
- ✅ Trends visible over time

### Week 5-6 Success
- ✅ User profiles extracting automatically
- ✅ Navigator references profiles naturally
- ✅ Profile match score > 4.0

### Overall MVP Success (End of Week 6)
- ✅ **Flow score > 4.0/5** average
- ✅ **70%+ conversations rated "beautiful"** (4+)
- ✅ **User feedback:** "feels different from ChatGPT"
- ✅ **Measurable:** Can demonstrate improvement over baseline

---

## Metrics & Tracking

### Key Metrics

**Flow Health Score (0-100):**
```
(echoExpand * 0.25 + depthMatch * 0.20 + questionRhythm * 0.20 +
 energyMirror * 0.15 + transitions * 0.20) * 20
```

**Target:** 80+ (corresponds to 4.0/5 average)

**Flow Quality Distribution:**
- Beautiful (5): 40%+
- Good (4): 30%+
- Adequate (3): 20%
- Poor (2): <8%
- Broken (1): <2%

**By Mode:**
- Navigator flow score
- Cartographer flow score
- Shipwright flow score

**By Dimension:**
- Echo-expand average
- Depth match average
- Question rhythm average
- Energy mirror average
- Transitions average

---

## Risks & Mitigations

### Risk 1: LLM-as-Judge unreliable
**Impact:** Can't trust automated scores
**Mitigation:**
- Week 1: Build strong manual baseline
- Week 3: Calibrate LLM against manual scores
- Ongoing: Spot-check 10 evals/week

### Risk 2: Beauty principles don't improve flow
**Impact:** Scores don't improve after Week 2
**Mitigation:**
- Manual eval in Week 1 shows principles work
- A/B test: with beauty layer vs without
- Iterate based on what works

### Risk 3: Evaluation costs scale badly
**Impact:** Expensive as conversations grow
**Mitigation:**
- Sample 10% (not 100%)
- $6 per 1000 conversations = negligible
- Can reduce to 5% if needed

### Risk 4: Profile extraction inaccurate
**Impact:** Profiles reference wrong info
**Mitigation:**
- Human review before applying (Week 5)
- Users can edit profiles (future UI)
- Start conservative (only extract explicit info)

---

## Dependencies

**None.** This experiment is self-contained:
- ✅ Uses existing codebase
- ✅ Uses existing database (Postgres)
- ✅ Uses existing AI (Claude API)
- ❌ No new external services
- ❌ No blocked dependencies

---

## What Success Unlocks

Once Beautiful Conversations ships:

### Immediate Unlocks
- **RAG with measurement** - Can evaluate if RAG improves flow
- **Prompt refinement** - Know what prompts work
- **User feedback** - Quantify "feels different"

### Future Unlocks
- **Fine-tuning dataset** - Use eval data for training
- **A/B testing** - Test prompt variations with metrics
- **Product storytelling** - "87/100 flow score, up from 62"
- **Community learning** - Track flow improvement over time

---

## Progress Tracking

### Week 1 (Nov 5-11)
- [x] Create experiment folder
- [x] Write beautiful-conversations.md
- [x] Create evaluation rubric
- [ ] Manually evaluate 20 conversations
- [ ] Document patterns & insights

### Week 2 (Nov 12-18)
- [ ] Create lib/prompts/beauty.ts
- [ ] Refactor lib/communities.ts
- [ ] Test all modes
- [ ] Ship to develop

### Week 3 (Nov 19-25)
- [ ] Database schema migration
- [ ] Evaluation service implementation
- [ ] Background job setup
- [ ] API endpoint creation

### Week 4 (Nov 26-Dec 2)
- [ ] Dashboard design
- [ ] Dashboard implementation
- [ ] Query optimization
- [ ] Ship to develop

### Week 5-6 (Dec 3-16)
- [ ] UserProfile schema
- [ ] Profile extraction pipeline
- [ ] Prompt injection
- [ ] Profile match evaluation
- [ ] Ship to develop

---

## Files Created

```
.lab/experiments/003-beautiful-conversations/
├── README.md (this file)
├── EVALUATION_RUBRIC.md
├── manual-evaluations/ (created in Week 1)
│   ├── eval-001.md
│   ├── eval-002.md
│   └── ... (20 total)
├── WEEK_1_INSIGHTS.md (created end of Week 1)
├── WEEK_2_IMPLEMENTATION.md (created Week 2)
├── WEEK_3_CALIBRATION.md (created Week 3)
└── FINAL_RESULTS.md (created end of Week 6)

docs/
└── beautiful-conversations.md (framework documentation)

lib/prompts/ (created Week 2)
└── beauty.ts

lib/evaluation/ (created Week 3)
├── flow-evaluator.ts
└── prompts/
    └── flow-evaluation.ts

prisma/schema.prisma (updated Week 3)
└── model ConversationFlowEvaluation { ... }

app/admin/flow/ (created Week 4)
└── page.tsx
```

---

## Team Assignments

**Kai (Lead):**
- Overall orchestration
- Week 2: Modular prompts implementation
- Week 3: API endpoints
- Week 4: Backend queries
- Week 5-6: Profile injection

**Zara:**
- Week 1: Evaluation rubric design
- Week 2: Beauty principles content review
- Week 3: LLM-as-Judge prompt design
- Week 5-6: Profile extraction prompts

**Marcus:**
- Week 2: Architecture review
- Week 3: Database schema, background jobs
- Week 5-6: UserProfile schema, extraction pipeline

**Jordan:**
- Week 4: Dashboard UI/UX design

**Alex:**
- Week 4: Dashboard frontend implementation

**Isaac:**
- Week 1: Manual evaluation of 20 conversations
- All weeks: Product direction, feedback
- Riding along on all implementation (learn everything)

---

## Next Actions

**Immediate (Week 1):**
1. Isaac: Select 20 conversations to evaluate
2. Isaac: Evaluate using EVALUATION_RUBRIC.md
3. Kai: Set up manual-evaluations/ folder
4. All: Review completed evals, build intuition

**Week 2 Prep:**
1. Review manual eval insights
2. Refine beauty principles based on learnings
3. Design modular prompt structure

---

**Status:** Week 1 in progress (documentation phase complete)
**Next Milestone:** 20 conversations manually evaluated by Nov 11
