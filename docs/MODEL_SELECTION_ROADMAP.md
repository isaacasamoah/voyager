# Model Selection Feature Roadmap

## Current State (MVP)
**Status:** Backend-only, single default model
**Model:** Claude Sonnet 4.5 (`claude-sonnet`)
**Rationale:** Best balance of intelligence, speed, and cost. No user-facing options to reduce cognitive load.

---

## Why Not in MVP?

### Designer Perspective
- ❌ Adds cognitive load (users must choose before chatting)
- ❌ Creates analysis paralysis (technical names confuse users)
- ❌ Dilutes core value prop (career coaching, not AI tech demo)
- ❌ No clear UX benefit without user testing first

### Engineer Perspective
- ❌ No usage data yet to inform which model fits which use case
- ❌ Cost optimization premature without conversation metrics
- ❌ Backend switching sufficient for A/B testing
- ❌ Maintains simpler codebase during early iteration

---

## Post-MVP Roadmap

### Phase 1: Data Collection (Weeks 1-4)
**Goal:** Understand model performance across conversation types

**Track:**
- Average tokens per conversation type (resume review, interview prep, etc.)
- Response quality (user satisfaction, follow-up rate)
- Cost per conversation
- Response latency

**Action:**
- Keep Sonnet 4.5 as default
- Backend A/B test: route 10% to Haiku, compare metrics
- No UI changes

**Success Criteria:**
- 100+ conversations analyzed
- Clear cost/quality tradeoffs identified
- Conversation types mapped to optimal models

---

### Phase 2: Smart Backend Routing (Week 5+)
**Goal:** Optimize cost without user-facing complexity

**Implementation:**
```typescript
// Automatic model selection based on conversation context
function selectModel(conversationType: string, userTier: string) {
  if (conversationType === 'quick-question') return 'claude-haiku'
  if (conversationType === 'resume-deep-dive') return 'claude-opus'
  if (userTier === 'premium') return 'claude-opus'
  return 'claude-sonnet' // Default
}
```

**Rules:**
- Quick questions → Haiku (fast, cheap)
- Resume reviews, interview prep → Sonnet (balanced)
- Premium users OR complex analysis → Opus (powerful)

**UI:**
- Still no selector
- Users automatically get best model for task
- Optional: Show subtle indicator ("Powered by Claude Sonnet")

**Success Criteria:**
- 20-30% cost reduction
- Maintained or improved satisfaction scores
- No user complaints about quality

---

### Phase 3: User-Facing Controls (Optional, Week 8+)
**Goal:** Give power users control when they explicitly request it

**Trigger Conditions (need at least one):**
- Users explicitly request faster/deeper responses
- Premium tier justifies model selection as feature
- Clear use cases emerge from data (e.g., "fast mode for brainstorming")

**UX Design (Non-Technical Labels):**

#### Option A: Settings Toggle
Location: User Settings (not main chat)
```
Response Quality
○ ⚡ Fast        - Quick answers, lower cost
● ⚖️ Balanced    - Best for most conversations (recommended)
○ 🧠 Deep        - Maximum analysis and detail
```

#### Option B: Per-Conversation Mode
Location: Chat interface (subtle, collapsible)
```
[Advanced]
Mode: Balanced ▼
  ⚡ Fast Mode    - Great for quick questions
  ⚖️ Balanced     - Recommended for most tasks
  🧠 Deep Dive    - Complex resume analysis
```

#### Option C: Adaptive Suggestion
System detects intent, suggests mode:
```
💡 This looks like a complex resume review.
   Switch to Deep Dive mode for best results? [Yes] [No]
```

**Implementation:**
```typescript
// In ChatInterface.tsx
const [selectedModel, setSelectedModel] = useState('claude-sonnet')

// In sendMessage()
body: JSON.stringify({
  message: userMessage,
  conversationId,
  mode,
  model: selectedModel, // Pass user choice
})

// API already supports this - just add:
const { message, conversationId, mode, model } = await req.json()
const modelConfig = getModelConfig(model || DEFAULT_MODEL)
```

**Success Criteria:**
- <10% of users change default (confirms good default choice)
- Power users report positive feedback
- No increase in support questions

---

## Model Specifications

### Claude Haiku 4.5 (Fast)
- **Use Cases:** Quick questions, follow-ups, simple edits
- **Speed:** Fastest responses (~1-2s)
- **Cost:** Lowest (est. 1/3 of Sonnet)
- **Quality:** Near-frontier intelligence, great for most tasks

### Claude Sonnet 4.5 (Balanced) ⭐ DEFAULT
- **Use Cases:** Resume reviews, interview prep, cover letters
- **Speed:** Fast (~2-4s)
- **Cost:** Medium
- **Quality:** Best balance, recommended by Anthropic

### Claude Opus 4.1 (Deep)
- **Use Cases:** Complex career strategy, multi-stage plans, premium tier
- **Speed:** Slower (~4-8s)
- **Cost:** Highest (est. 3x Sonnet)
- **Quality:** Maximum reasoning capability

---

## Decision Framework

### Add Model Selection When:
1. ✅ Data shows clear cost/quality tradeoffs per conversation type
2. ✅ Users explicitly request speed/quality control
3. ✅ Premium tier justifies it as differentiator
4. ✅ Engineering team has capacity to maintain feature
5. ✅ Support docs ready to explain options

### Skip Model Selection If:
1. ❌ <5% cost savings from optimization
2. ❌ Users don't notice quality differences
3. ❌ Backend routing achieves same results
4. ❌ Adds support burden without clear value

---

## Monitoring & Rollback

### Metrics to Track Post-Launch
- **Model distribution:** % of conversations per model
- **User satisfaction:** Rating per model (if selection enabled)
- **Cost efficiency:** Cost per conversation over time
- **Support tickets:** Questions about model selection
- **Engagement:** Do users experiment or stick with default?

### Rollback Triggers
- >15% increase in support questions about models
- Users report confusion about differences
- No measurable quality improvement from Opus
- Cost savings <5% from optimization

---

## Current Architecture (Already Built ✅)

The system is **100% ready** for model selection:

```typescript
// lib/ai-models.ts - Model configs
export const AVAILABLE_MODELS = {
  'claude-sonnet': { ... },
  'claude-haiku': { ... },
  'claude-opus': { ... },
}

// lib/ai-providers.ts - Unified interface
export async function callAIModel(config, messages) {
  // Works with any model
}

// app/api/chat/route.ts - Model parameter ready
const modelConfig = getModelConfig(model) // Just add 'model' param
```

**To enable UI:**
1. Add dropdown/toggle to ChatInterface.tsx (5 mins)
2. Pass `model` in API request (1 line)
3. Extract from request params (1 line)
4. Done! ✅

---

## Recommendation

**Now (MVP):** Keep hidden, use Sonnet 4.5 for all
**Week 4:** Review data, decide on Phase 2
**Week 8+:** Add UI only if data/users demand it

**Let user needs drive features, not technical capabilities.**

---

**Architecture:** ✅ Built and future-proof
**Feature flag:** Ready to flip when needed
**Default strategy:** Smart single option, optimize later
