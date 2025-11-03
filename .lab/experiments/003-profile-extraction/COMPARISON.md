# Profile Extraction vs Cartographer Extraction

**Status:** 📋 DOCUMENTED (Parked for Week 3+)
**Reference:** Extends `002-cartographer-ai-pipeline`
**Validation needed:** User research with Eli

---

## Philosophy

Both use the same **extraction engine**. Only the schema and focus differ.

| Aspect | Cartographer | Profile |
|--------|--------------|---------|
| **Who** | Verified experts only | All users |
| **Topic** | Domain expertise (shareable) | Personal context (private) |
| **Privacy** | Community knowledge (shared) | User profile (private, per-user) |
| **Output** | Insights, RAG entries, prompt updates | Background, learning style, goals, preferences |
| **Storage** | `CartographerSession` table | `UserProfile` table |
| **Injection** | Updates community prompts globally | Injects into per-user Navigator context |

---

## Extraction Schema Differences

### Cartographer Output:
```typescript
{
  insights: Insight[]              // Domain knowledge
  promptUpdates: PromptUpdate[]    // Community-wide improvements
  ragEntries: RAGEntry[]           // Shared knowledge chunks
  finetuningExamples: FineTuningExample[]
}
```

### Profile Output:
```typescript
{
  background: {
    experience: string              // "5 years in tech"
    industries: string[]            // ["SaaS", "Fintech"]
    currentRole?: string            // "Senior Engineer"
    yearsOfExperience?: number      // 5
    location?: string               // "Sydney"
  },

  learningStyle: {
    preferredFormat: 'examples' | 'frameworks' | 'step-by-step'
    detailLevel: 'concise' | 'comprehensive'
    thinkingStyle: 'visual' | 'analytical' | 'narrative'
  },

  goals: {
    shortTerm: string[]             // ["Get promoted to Staff"]
    longTerm: string[]              // ["Start own company"]
    currentFocus?: string           // "Interview prep"
  },

  preferences: {
    tonePreference: 'direct' | 'supportive' | 'socratic'
    questioningStyle: 'guided' | 'open-ended'
    feedbackStyle: 'gentle' | 'direct'
  },

  context: {
    challenges?: string[]           // ["Imposter syndrome", "Work-life balance"]
    strengths?: string[]            // ["Technical depth", "Communication"]
    learningGaps?: string[]         // ["System design", "Leadership"]
  }
}
```

---

## Database Schema

### New Table: `UserProfile`

```prisma
model UserProfile {
  id         String   @id @default(cuid())
  userId     String
  communityId String?           // Optional: community-specific profiles

  // Extracted profile data (JSONB)
  background      Json
  learningStyle   Json
  goals           Json
  preferences     Json
  context         Json

  // Last conversation
  sessionMessages Json  // For iterative updates

  lastUpdated DateTime @updatedAt
  createdAt   DateTime @default(now())

  @@unique([userId, communityId])
  @@index([userId])
}
```

**Key differences from CartographerSession:**
- `userId` instead of `expertEmail` (any user can have profile)
- `@@unique([userId, communityId])` - one profile per user per community
- No `processed` flag (profiles are immediately usable)
- `sessionMessages` stored for iterative updates ("living document")

---

## Extraction Prompt Differences

### Cartographer Extraction Focus:
```
- Extract DOMAIN KNOWLEDGE (best practices, frameworks, tools)
- What can OTHER USERS learn from this expert?
- Create SHAREABLE knowledge chunks
- Update COMMUNITY prompts
```

### Profile Extraction Focus:
```
- Extract PERSONAL CONTEXT (background, style, goals)
- How should AI coach THIS SPECIFIC USER?
- Create PRIVATE personalization data
- Inject into PER-USER Navigator context
```

### Shared Extraction Patterns:
- ✅ Analyze conversation → structured JSON
- ✅ Quality checks (specificity, completeness)
- ✅ JSON validation
- ✅ Background extraction (user doesn't see it)

---

## Prompt Injection Differences

### Cartographer (Community-wide):
```typescript
// Updates communities/careersy.json globally
const communityPrompt = getCommunitySystemPrompt(config, { mode: 'navigator' })
// All users see improved prompt
```

### Profile (Per-user):
```typescript
// Injects into specific user's Navigator context
const userProfile = await getUserProfile(userId, communityId)
const personalizedPrompt = `
${communityPrompt}

USER CONTEXT (personalize your coaching):
- Background: ${userProfile.background.experience}
- Learning style: ${userProfile.learningStyle.preferredFormat}
- Current goal: ${userProfile.goals.currentFocus}
- Preferences: ${userProfile.preferences.tonePreference} tone

Adapt your coaching to match their style and context.
`
```

---

## User Flow Differences

### Cartographer:
1. Expert uses `/cartographer` (mode switch)
2. AI interviews expert on specific topic (5-10 min)
3. Expert says "that's enough" or AI offers to structure
4. **Background:** Extract insights, update community knowledge
5. User sees: "✅ Knowledge documented and added to community"

### Profile:
1. User uses `/profile` (mode switch)
2. AI asks about background, goals, learning style (5-10 min)
3. User completes profile or says "save for now"
4. **Background:** Extract profile data, store privately
5. User sees: "✅ Profile saved. Navigator will personalize coaching for you."
6. **Later:** User can update profile anytime (`/profile update`)

---

## Implementation Reuse

### What we reuse (70%):
```typescript
// Core extraction engine (same for both)
async function extractKnowledge(
  sessionType: 'cartographer' | 'profile',
  messages: Message[],
  context: ExtractionContext
): Promise<ExtractionResult> {
  const prompt = buildExtractionPrompt(sessionType, context)
  const extracted = await llm.complete(prompt)
  const validated = validateExtraction(sessionType, extracted)
  return validated
}

// Extraction prompt builder (parameterized)
function buildExtractionPrompt(
  sessionType: 'cartographer' | 'profile',
  context: ExtractionContext
): string {
  const coreTemplate = CORE_EXTRACTION_TEMPLATE  // ← Shared
  const config = EXTRACTION_CONFIG[sessionType]   // ← Different

  return coreTemplate
    .replace('{instructions}', config.instructions)
    .replace('{schema}', config.schema)
    .replace('{qualityChecks}', config.qualityChecks)
}
```

### What's different (30%):
- Extraction schema (Cartographer vs Profile)
- Extraction instructions (domain knowledge vs personal context)
- Storage destination (CartographerSession vs UserProfile)
- Privacy model (shared vs private)

---

## Success Criteria (When to Build)

**Don't build until validated:**
- [ ] Week 3: Ask Eli if clients would benefit from personalization
- [ ] 3+ users request personalized coaching
- [ ] Clear signal that generic Navigator isn't sufficient

**If validated, lab experiment:**
- [ ] Build profile extraction in 2-3 days (reuse Cartographer engine)
- [ ] Test with 5-10 users
- [ ] Measure: Does personalization improve Navigator quality?
- [ ] Ship if users prefer personalized version

---

## Open Questions (Need User Research)

1. **Engagement:** Will users complete a 5-10 min profile?
2. **Value:** Does personalization noticeably improve coaching?
3. **Maintenance:** Do users update profiles as goals change?
4. **Privacy:** Are users comfortable sharing personal context?
5. **Scope:** Per-community profiles or universal profile?

---

## Technical Effort Estimate

**Given Cartographer extraction exists:**
- Database migration: 1 hour (add UserProfile table)
- Profile extraction schema: 2 hours (define fields, validation)
- Profile extraction prompt: 3 hours (adapt Cartographer prompt)
- Profile injection logic: 2 hours (inject into Navigator)
- Testing: 2 hours (validate extraction quality)

**Total: ~2-3 days** (vs 6-7 days if built from scratch)

---

**Next Steps:** Park until Week 3 user research validates need.
