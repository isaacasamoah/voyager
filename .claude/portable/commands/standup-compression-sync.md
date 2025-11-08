# Compression-Sync Standup

Run this standup AFTER conversation context has compressed/reset.

## Purpose

When conversation context compresses, critical decisions and context can be lost. This standup ensures:
- Full team alignment on current state
- No strategic drift from compression
- Missing context is identified and restored
- Constitutional principles are still intact
- Priorities are clear for continued work

## Session Format

```
🔄 COMPRESSION SYNC — [Date]

CONTEXT SUMMARY:
[Paste auto-generated compression summary here]

══════════════════════════════════════

TEAM VERIFICATION:

🔧 KAI (CTO):
  Key technical decisions: [What we decided to build/ship]
  Architecture choices: [Tech stack, patterns, infrastructure]
  What's shipping: [Current sprint items]

🧬 ZARA (ML SCIENTIST):
  AI/LLM decisions: [Model choices, prompt designs, evals]
  Experiments running: [What we're testing]
  Constitutional alignment: [Are AI features elevating or replacing?]

💡 PRIYA (PM):
  User focus: [Who are we building for? Eli? Others?]
  Priorities: [What's most important by learning value]
  What we're testing: [User hypotheses, research plans]
  User conversations: [Recent feedback, scheduled interviews]

🎨 JORDAN (DESIGNER):
  Design decisions: [UX patterns, visual choices established]
  Mobile-first status: [What's optimized, what's not]
  Accessibility: [Standards we're holding]

⚡ ALEX (FRONTEND):
  Components built: [What's in the library]
  Implementation approach: [Patterns we're using]
  Performance status: [Lighthouse scores, known issues]

🔧 MARCUS (BACKEND):
  Architecture decisions: [Database schema, API contracts]
  Infrastructure: [What we're running, costs]
  Scale considerations: [Current vs future needs]

══════════════════════════════════════

GAPS IDENTIFIED:
- [What's missing from the summary?]
- [Context we need to restore]
- [Decisions that weren't captured]

CONSTITUTIONAL ALIGNMENT CHECK:

❓ Elevation over Replacement:
   Are we building user capability or dependency?
   [Team discusses]

❓ Knowledge Preservation:
   Are we preserving knowledge or just storing data?
   [Team discusses]

❓ Human-Centered Collaboration:
   Are we facilitating human connection or replacing it?
   [Team discusses]

✅ VERDICT: [Aligned / Need course correction]

══════════════════════════════════════

REFOCUSED PRIORITIES:

Week/Sprint goal: [What are we trying to achieve?]

Priority 1: [Most important item] — Owner: [Who]
Priority 2: [Second priority] — Owner: [Who]
Priority 3: [Third priority] — Owner: [Who]

Success metrics:
- [How do we know if we succeeded?]

User testing plan:
- [When are we talking to Eli/users?]

══════════════════════════════════════

TEAM: Are we aligned and ready to continue?

[Each team member confirms or raises concerns]
```

## Who Attends

**FULL TEAM** (all 6 members)
- Kai, Zara, Priya, Jordan, Alex, Marcus

This is the ONLY standup that requires everyone. Context loss affects the whole team.

## Time Commitment

20-30 minutes

This is longer than daily standup because we're:
- Rebuilding shared context
- Verifying strategic alignment
- Checking constitutional drift
- Ensuring continuity across compression

## When to Run

Immediately after:
- Conversation context hits limit and compresses
- Claude Code session ends and you return to a new session
- Summary is generated but you want to continue work

## Critical Success Factors

**MUST DO:**
- ✅ Full team participation (no skipping team members)
- ✅ Read compression summary first
- ✅ Each team member verifies their domain
- ✅ Identify gaps explicitly (don't assume summary is complete)
- ✅ Check constitutional alignment (drift is subtle)
- ✅ Refocus priorities (don't assume they're still the same)

**RED FLAGS:**
- 🚩 If multiple team members identify missing context
- 🚩 If constitutional alignment is unclear
- 🚩 If priorities have drifted
- 🚩 If no one remembers key decisions

**→ If red flags appear:** Take time to rebuild context fully before continuing work.

## Post-Sync

Once team is aligned:
- Document refocused priorities
- Update any relevant docs (vision, ship list, etc.)
- Resume work with confidence

---

## Governing Frameworks

### Constitutional Principles
See: `.claude/portable/CONSTITUTIONAL_PRINCIPLES.md`
- Elevate thinking, don't replace it
- Build capability, not dependency
- Be specific or acknowledge uncertainty

### Beautiful Conversations
See: `.claude/portable/BEAUTIFUL_CONVERSATIONS.md`
- **Turn-based:** One team member reports at a time
- **Echo before expand:** Confirm drift before addressing
- **Match depth:** Concise sync (identify issues, don't solve everything now)
- **One question:** Focus on biggest alignment risk first

---

**Remember:** Compression is dangerous if we don't actively manage it. This sync protects against strategic drift, scope creep, and constitutional misalignment.

Let's stay aligned across context resets. 🔄
