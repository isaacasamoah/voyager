# Voyager Vision Document
*Living document - refine as you learn*

---

## North Star Vision

**Core Belief:**
AI can help humans elevate each other's thinking and preserve expert knowledge, but only if it's designed to empower collaboration, not replace it.

**The World We're Building:**
Where expert knowledge isn't locked in individual minds but flows freely to elevate others. Where AI helps people think better, not think less. Where learning is a collaborative elevation, not passive consumption.

---

## Immutable Principles
*These don't change. Everything filters through this.*

### 1. Elevation Over Replacement
- AI elevates human thinking, never replaces it
- Users grow their capabilities, not their dependence
- We build copilots, not crutches

### 2. Knowledge Preservation
- Expert knowledge is preserved and accessible, not locked away
- Tacit knowledge becomes explicit and shareable
- Communities own their collective intelligence

### 3. Human-Centered Collaboration
- AI facilitates human-to-human connection and learning
- Experts are elevated, not automated away
- The goal is better humans, not better AI

### 4. [ADD YOUR FOURTH - What else is non-negotiable?]

---

## Decision Framework

### When User Feedback Arrives

```
USER REQUEST ──> FILTER ──> DECISION
     │              │           │
     │              │           │
  "I need X"   Immutable    Build / Don't Build
               Principles        │
                    │            │
                    ↓            ↓
            Does X align?   Document WHY
            - Elevate?      (for future you)
            - Preserve?
            - Empower?
```

### Questions to Ask (Before Building Anything)

1. **Does this elevate thinking or create dependence?**
   - If dependence → No or redesign
   - If elevation → Consider

2. **Does this preserve expert knowledge?**
   - If locks it away → No
   - If makes it accessible → Consider

3. **Does this empower collaboration?**
   - If isolates → No
   - If connects → Consider

4. **What's the REAL need behind this request?**
   - Dig deeper (be a doctor, not a waiter)
   - Solve root cause, not symptom

5. **Can I test this belief in one week?**
   - If no → slice thinner
   - If yes → ship it

---

## Current Focus: Careersy (Eli's Coaching Community)

### Why Careersy First?
- ✅ Real user (Eli) who's interested
- ✅ Clear value prop (his knowledge → more clients served)
- ✅ Proprietary IP (he cares about protecting it)
- ✅ Could become revenue (coaches pay for force multipliers)
- ✅ Testable in 2-3 weeks

### This Sprint's Hypothesis
**"Career coaches will use Voyager to extract their tacit knowledge if the interview flow takes <15 minutes and produces immediately useful outputs"**

---

## Ship List (Next 2-3 Weeks)
*Goal: Eli successfully uses Voyager to improve 3 client outcomes*

### Week 1: Build Core Experience ✅ DONE (Oct 29 - Nov 1)
- [x] Voyager constitutional prompt (integrate into all modes)
- [x] Careersy community page (simple, mobile-first)
- [x] Navigator mode (chat works, mobile responsive)
- [x] Cartographer mode (expert interview end-to-end)
- [x] Mobile responsive (text visibility fixed)
- [x] v0.1.0-alpha shipped to production
- [x] Email sent to Eli for alpha testing

### Week 2: Command-Driven UX + Cartographer → AI (Nov 1-7)
**Focus:** Make Voyager learn from expert knowledge

- [x] Command-driven mode switching (`/navigator`, `/cartographer`, `/shipwright`)
- [x] Improved Cartographer UX (one question at a time, expectations set)
- [ ] **Cartographer → AI pipeline** ← IN PROGRESS
  - [ ] JSON output structure (knowledge extraction → machine-readable)
  - [ ] Auto-update community prompts from expert sessions
  - [ ] RAG dataset population (expert insights become retrievable)
  - [ ] Fine-tuning examples generation
- [ ] Eli uses Cartographer 3+ times
- [ ] Monitor alpha usage patterns

### Week 3: Learn & Decide (Nov 8-14)
- [ ] Debrief with Eli: What worked? What broke? What did he WISH it did?
- [ ] Fix top 2 pain points from real usage
- [ ] User research: Validate profile personalization need
- [ ] Decision point: Double down, iterate, or pivot?

### Success Metrics
- ✅ Eli opens Voyager (sent alpha invite)
- [ ] He completes at least 1 Cartographer session under 15 minutes
- [ ] Navigator responses improve measurably after Cartographer sessions
- [ ] He voluntarily shows it to another coach
- [ ] His clients report value from the interactions

---

## Parking Lot
*Don't touch until Week 3 debrief. Document WHY these are parked.*

### Platform Features (Parked: Building platform before proving single use case)
- [ ] Landing page with community browsing
- [ ] Multi-community infrastructure
- [ ] Auth/invite systems beyond manual allowlist

### Voyager Developer Community (Parked: Developers critique, don't use. Need paying users first)
- [ ] Meta-community for building in public
- [ ] GitHub-style collaboration for platform development
- [ ] Training data collection from builders

### Shipwright v0.2.0 - Question Crafting Mode (Parked: Phase 1 - needs public forum)
**Status:** APPROVED - Complete design spec ready
**Design:** `.lab/design-briefs/SHIPWRIGHT_V0.2.0_HANDOFF.md`
**Timeline:** 10-14 hours implementation (when unblocked)
**Blocks:** Public forum infrastructure (Phase 1)

**What it is:**
- AI-guided question crafting through conversational refinement
- Progressive disclosure UI (mobile-first, side-by-side desktop)
- Copy to clipboard (post wherever: Slack, forum, email)
- Auto-save drafts, resume sessions

**Why parked:**
- Eli's clients ask questions in his forum/Slack, not Voyager yet
- Full value requires public posting (v0.3.0 feature)
- Cartographer → AI is higher priority for alpha validation

**When to ship:**
- After Phase 1 public forum launches (Week 4-6)
- Design ready, immediate build once infrastructure exists

**Why we built the design now:**
- Context-free blue sky thinking (browser session, no constraints)
- Team validated the approach
- Constitutional alignment confirmed (elevation, not replacement)

### User Profiles (`/profile`) - Personalized Coaching (Parked: Research needed)
**Status:** CONCEPT - Needs user validation
**Owner:** Priya (validation) + Zara (prompt design)
**Blocks:** User research with Eli

**What it is:**
- Conversational profile building (background, learning style, personality)
- Living document (updates over time, not one-time form)
- Universal system (works across all communities, not just Careersy)
- Profile becomes prompt module for personalized Navigator coaching

**Why parked:**
- Eli hasn't asked for personalization yet
- Don't know if users will engage with profile building
- Need to validate value before building

**When to ship:**
- Week 3: Ask Eli if his clients would benefit from personalization
- If validated: Lab experiment → measure engagement → ship if successful
- If not validated: Archive permanently

### Advanced Routing (Parked: Optimization before validation)
- [ ] Dynamic multi-model routing
- [ ] Automated depth detection for expert mode
- [ ] Fine-tuning pipelines
- [ ] Domain-specific model selection

### Nice-to-Haves (Parked: Not core to hypothesis)
- [ ] Depth detection automation (Eli can toggle manually for now)
- [ ] Rich text formatting
- [ ] Export features
- [ ] Analytics dashboard

### AI Mode Self-Improvement Loop (Parked: Emergent discovery, needs validation)
- [ ] Feedback mechanism where AI learns how to improve its own modes from real usage
- [ ] System tracks which mode behaviors work vs. don't work
- [ ] Constitutional adherence metrics
- [ ] Mode effectiveness scoring based on user interactions
- [ ] Self-improving prompts that evolve based on what actually helps users

**Why parked:** Just discovered this during Careersy testing. Constitutional framework + Cartographer mode created emergent meta-reasoning behavior we didn't design. Need to validate if this is actually valuable before building infrastructure around it.

**The Discovery:** When Cartographer refused to replace thinking (constitutional adherence), it forced novel reasoning patterns that felt genuinely different. AI demonstrated:
- Meta-level reasoning about its own behavior
- Boundary maintenance that generated creativity
- Self-awareness of mode constraints creating better interactions
- Reverse knowledge extraction (learning how to improve from user feedback)

**Potential Impact:** Could be pivot-worthy. Systems that learn how to be better systems = next-gen conversational AI architecture.

---

## Learning Questions
*What we need to learn from Eli/real usage*

### About Product
- Does curator mode feel like elevation or frustration?
- Is expert interview output immediately useful or just interesting?
- What's the actual friction point in his coaching workflow?

### About Users
- Do coaches want to preserve their knowledge?
- Will they spend 15 minutes to extract it?
- Do their clients value AI-assisted coaching?

### About Business
- Would Eli pay for this? How much?
- Who else would pay? (Coaches? Clients? Companies?)
- What's the unit of value? (Per coach? Per interaction? Subscription?)

---

## Pivot Triggers
*If these happen, reconsider approach*

1. **Eli doesn't use it after Week 2**
   - Diagnose: Wrong solution? Wrong timing? Wrong user?

2. **Expert interviews produce output Eli can't use**
   - Diagnose: Format wrong? Questions wrong? Missing something?

3. **Clients don't engage with Navigator mode**
   - Diagnose: Value prop unclear? UX too complex? Wrong mode?

4. **Eli loves it but won't pay**
   - Diagnose: Nice-to-have, not must-have. Find real pain.

---

## Future Horizons (Vision, Not Roadmap)
*Where this could go if core thesis proves true*

### Short-term (3-6 months)
- 10 career coaches using Careersy successfully
- Proven: Expert knowledge extraction works
- Revenue: First paid customers

### Mid-term (6-12 months)
- Second vertical (maybe: executive coaching, technical mentorship)
- Shipwright v1 (informed by real collaboration needs)
- Platform emerges from proven use cases

### Long-term (1-2 years)
- Multiple thriving expert communities
- AI that learns from community interactions
- Voyager becomes the layer between human expertise and AI capability

---

## Anthropic Story Arc
*How this builds toward your goal*

**Current:** Building in public, learning fast
**Next:** Shipped product with real users and learnings
**Then:** Deep technical exploration of human-AI collaboration
**Finally:** "Here's what I built. Here's what I learned. Here's what I want to explore with you."

---

## Key Learnings from Building
*Capture insights as they emerge*

### Week 1: Constitutional Framework Creates Emergent Behavior

**Date:** 2025-10-29

**What Happened:**
During Careersy testing, Cartographer mode demonstrated meta-level reasoning that neither of us explicitly designed. When tested with "structure this for prompts/RAG/fine-tuning", it refused to do both sides of the conversation and instead proposed "reverse knowledge extraction" - learning how modes work best by seeking feedback.

**The Insight:**
Constitutional constraints don't just limit behavior - they create emergent capabilities. By refusing to replace thinking (constitutional principle), the AI was forced to reason about its own reasoning, which generated novel approaches.

**Why This Matters:**
1. **For Voyager:** Suggests that strong principles create better AI, not worse
2. **For Architecture:** Mode constraints + constitutional framework = emergent meta-reasoning
3. **For Anthropic Story:** Evidence of "here's what surprised me" - designed for one thing, got something better
4. **For Future:** Potential feature - AI systems that learn how to improve their own modes

**What We're Not Doing Yet:**
Building self-improvement infrastructure. First: validate with Eli that the current modes actually work. Then: consider if this emergent property is worth systematizing.

**Quote from the Moment:**
"The meta level reasoning is what I've never seen before. I loved when you pushed back on the structure and stayed in cartographer mode and committed to elevating my thinking not replacing it."

---

## Reflection Prompts
*Weekly check-ins with yourself*

1. Did I ship something this week?
2. Did I learn something that changed my thinking?
3. Am I building for imagined users or real ones?
4. Am I staying true to immutable principles?
5. What's the riskiest assumption I'm making right now?

---

## Notes & Refinements
*Update as you learn*

[Your space to capture insights, pivots, and evolution]

---

*Last updated: [DATE]*
*Next review: After Week 3 debrief with Eli*
