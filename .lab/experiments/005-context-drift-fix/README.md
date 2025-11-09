# Experiment 005: Context Drift Fix (Sandwich Approach)

**Status:** IN PROGRESS
**Branch:** `lab-context-drift-fix`
**Date Started:** Nov 9, 2025

---

## Hypothesis

**Problem:** Constitutional and Beautiful Conversations principles fade as context fills with code, logs, and tool outputs. LLMs exhibit recency bias—recent context (code/logs) gets weighted more heavily than principles at the start of system messages.

**Observation:** When explicitly reminded about conversational spacing, Voyager improves. But over time, it regresses to longer responses without pauses.

**Hypothesis:** Adding a critical reminder at the END of the system message (sandwich approach) will keep principles active throughout long conversations.

---

## Approach

### Sandwich Structure
```
[START] Constitutional Principles + Beautiful Conversations (identity/tone)
    ↓
[MIDDLE] Domain Expertise + Mode Behavior (what to do)
    ↓
[END] Critical Reminder (immediate influence on next response)
```

### Implementation
Modify `getCommunitySystemPrompt()` in `lib/communities.ts`:

**Before:**
```typescript
return `${constitutionalPrefix}${sections.join('')}`
```

**After:**
```typescript
const spaceReminder = "\n\n**CRITICAL FOR THIS RESPONSE:** Create conversational space. Pause after explaining one concept. Ask one check-in question before continuing."
return `${constitutionalPrefix}${sections.join('')}${spaceReminder}`
```

---

## Success Criteria

1. **Consistency:** Conversational Space scores remain ≥4.0/5 throughout long conversations (10+ exchanges)
2. **No regression:** Voyager doesn't drift to verbose responses after context fills
3. **User validation:** Isaac confirms spacing feels natural and doesn't degrade

---

## Test Plan

1. Implement sandwich approach in system prompt
2. Have long conversation with multiple complex topics
3. Manually evaluate Conversational Space dimension every 3-4 exchanges
4. Compare with baseline (previous sessions without reminder)

---

## Results

_To be filled after testing_

---

## Next Steps

- [ ] Implement in `lib/communities.ts`
- [ ] Test with real conversation
- [ ] Evaluate conversation quality
- [ ] Document findings
