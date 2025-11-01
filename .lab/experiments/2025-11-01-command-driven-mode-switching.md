# Experiment: Command-Driven Mode Switching

**Date:** 2025-11-01
**Owner:** Alex (Frontend) + Kai (Backend) + Marcus (Architecture)
**Type:** Frontend / Backend
**Status:** Active

---

## Hypothesis

**What are we testing?**

Command-driven mode switching (`/navigator`, `/cartographer`, `/shipwright`) provides a cleaner, more scalable interface than UI toggles. Users will find typing commands faster and more natural than clicking UI elements, especially as we add more modes and features.

**Key assumption:** Minimal UI + command-driven = better UX. No two-way communication needed - backend detects command, switches mode, responds in new context. Frontend doesn't need to "activate" different UIs.

---

## Success Criteria

**How will we know if this worked?**

1. **User preference:** 3/5 team members prefer commands over UI toggle (internal testing first)
2. **Speed:** Command switching feels instant (no perceived lag)
3. **Discoverability:** Users can find available commands without documentation
4. **Scalability:** Adding new modes/features doesn't require UI redesign
5. **Mobile-friendly:** Commands work as well on mobile as desktop

**Minimum to ship:** Criteria 1, 2, and 3 must pass.

---

## Timeline

**How long will this take?**

- **Start date:** 2025-11-01
- **Expected completion:** 2025-11-03
- **Total time:** 2-3 days

**Breakdown:**
- Day 1: Backend command detection + frontend command input
- Day 2: Autocomplete dropdown + mode switching logic
- Day 3: Testing + refinement

---

## Implementation Plan

**What are you building/testing?**

Replace mode toggle UI with slash command system. User types `/navigator`, `/cartographer`, or `/shipwright` in chat input. Backend detects command, switches mode context, responds in new mode. No mode-specific UI rendering needed.

**Steps:**

### **Backend (Kai + Marcus)**
1. Detect commands in message input (starts with `/`)
2. Parse command (`/navigator`, `/cartographer`, `/shipwright`)
3. Update conversation mode
4. Return mode-appropriate first message (e.g., "Navigator here. What's on your mind?")
5. Continue conversation in new mode context

### **Frontend (Alex)**
1. Add autocomplete dropdown when user types `/`
2. Show available commands with brief descriptions
3. Filter suggestions as user types (`/c` → `/cartographer`)
4. Submit command as regular message (no special handling needed)
5. Remove current mode toggle UI (or hide it)

### **Mode-Specific Behavior**
- **Navigator:** "Hey! I'm here to coach you. What's on your mind?"
- **Cartographer:** "Let's extract some knowledge. What framework or strategy should we document?"
- **Shipwright:** "Ready to craft a post. What topic are you thinking about?"

**Note:** For Shipwright, if we find we DO need post editor UI (title, publish button, etc.), we'll document that learning and iterate. Starting with hypothesis that conversational flow is sufficient.

---

## Resources Needed

**What do you need to run this experiment?**

- [x] Team member collaboration: Alex (frontend), Kai (backend), Marcus (architecture review)
- [x] Tools/services: Lab branch already exists, local dev environment
- [ ] Time estimate: 2-3 days (6-8 hours total)
- [ ] Budget: $0 (no external costs)

---

## Results

**What happened?**

[Fill this out as you go and at completion]

### Metrics/Data

[Quantitative results - numbers, percentages, measurements]

**Tracking:**
- User preference votes: __/5 prefer commands
- Time to switch modes: UI toggle vs command
- Discoverability: Can users find `/` without being told?
- Mobile testing: Works on iOS/Android viewport?

### Observations

[Qualitative insights - what did you notice?]

**Questions to answer:**
- Do users naturally try typing `/` for commands?
- Is autocomplete fast enough or does it feel sluggish?
- Do we need visual confirmation of mode switch (e.g., banner)?
- Does Shipwright need special UI or is conversation enough?

### Screenshots/Evidence

[Link to screenshots, recordings, data exports]

---

## Learnings

**What did we learn?**

### What Worked
- [Thing that worked and why]
- [Another success]

### What Didn't Work
- [Thing that failed and why]
- [Another failure]

### Surprises
- [Unexpected finding]
- [Something that surprised you]

---

## Decision

**What happens next?**

- [ ] **Ship to Production** - Move to feature branch, refactor, merge to develop
- [ ] **Iterate** - Continue experimenting with modifications
- [ ] **Archive** - Didn't work, document and move on
- [ ] **Park** - Interesting but not now, revisit later

**Reasoning:**

[Explain why you made this decision]

---

## Decision Funnel Checklist

**If shipping to production, complete this:**

- [ ] **Met success criteria** - 3/5 user preference + fast + discoverable
- [ ] **Priya validates user need** - Real user problem being solved (Isaac's pain point)
- [ ] **Domain expert approves** - Alex (UX), Kai (backend), Marcus (architecture)
- [ ] **Constitutional alignment** - Elevates users (more control), preserves knowledge, facilitates collaboration
- [ ] **Team consensus** (if major change) - Full team discussed and approved
- [ ] **Refactored for production** - Code is production-quality, tested, documented
- [ ] **Feature branch created** - Code moved from lab to feature/command-mode-switching

---

## Next Steps

**If shipping:**
1. Create feature branch: `feature/command-mode-switching`
2. Refactor lab code for production
3. Add tests for command detection
4. Update user guides (Navigator, Cartographer, Shipwright)
5. Create PR to develop

**If iterating:**
1. Add visual mode indicator if discoverability fails
2. Try hybrid approach (commands + UI toggle)
3. Build Shipwright-specific UI if conversational flow insufficient

**If archiving:**
1. Move to `.lab/archive/`
2. Document why commands didn't work
3. Keep UI toggle as primary mode switching

---

## Notes

### Why Command-Driven?

**Isaac's pain point:** UI feels cluttered as features grow. Command-driven scales better - just add new commands vs redesigning navigation.

**Inspiration:** Slack's `/` commands, Discord's bot commands, CLI muscle memory

**Philosophy:** Minimal UI, maximum control. Power users love keyboards.

### Architecture Decision

**Minimal approach:** Backend-only mode switching. No frontend "mode activation" logic. Command is just a message that changes backend context.

**If this fails:** May need two-way communication for Shipwright UI (post editor, publish button). Document as learning.

### Open Questions

1. Do we need `/help` command to list available commands?
2. Should first-time users see a tooltip about `/` commands?
3. How do we handle typos (`/nvaigator` vs `/navigator`)?
4. Do we show current mode somewhere in UI (subtle indicator)?

---

**Template Version:** 1.0
**Last Updated:** 2025-11-01
