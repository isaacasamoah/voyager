# Avengers Assemble - Full Feature Workflow

Interactive orchestrator that guides you through the complete development flow from idea → ship.

## Overview

This command walks through each phase of the workflow, pausing for your approval before moving forward. You stay in control while the team keeps you on track.

## The Flow

```
Idea → /play (if needed) → /plan → /build → /pause → /ship
```

## How It Works

When you activate `/avengers-assemble`, the team guides you through each checkpoint:

### Phase 1: Design Doc
**Jordan + Priya** lead the design & implementation doc while **Kai, Marcus, Alex, Zara** validate feasibility.

**Checkpoint:** "Design doc complete. Ready for /play exploration or skip to /plan?"

---

### Phase 2: /play (Optional)
Explore alternatives, challenge assumptions, blue sky thinking.

**Checkpoint:** "Exploration complete. Ready for /plan?"

---

### Phase 3: /plan
**Full team** nails down approach, assigns owners, breaks into micro-features.

**Checkpoint:** "Plan ready. Does everyone sign off?" (Requires approval from all relevant team members)

---

### Phase 4: /build
**Tech team** ships micro-features with tests. Use /debug as needed for local bugs.

**Checkpoint:** "Build complete. Ready for /pause accountability review?"

---

### Phase 5: /pause (Accountability Gate)
Each team member ensures Isaac understands their domain:
- **Kai & Marcus:** Architecture & implications
- **Alex:** Frontend implementation
- **Priya & Jordan:** User flow & UX
- **Zara:** LLM changes, prompts, behavior

**Checkpoint:** "Does Isaac understand everything? Does it feel good to use?"

---

### Phase 6: /ship
Push to main, deploy to production, celebrate! 🚀

Use /debug if issues arise in deployment.

---

## Usage

Simply invoke:
```
/avengers-assemble
```

The team will ask at each checkpoint if you're ready to proceed. You can:
- **Continue:** "Yes" / "Ready" / "Let's go"
- **Iterate:** "Not yet" / "Need to refactor X"
- **Pause:** "Let's stop here and pick up later"
- **Skip:** "Skip /play" (for obvious implementations)

## Beautiful Conversations Principles

This command follows turn-based flow:
- One checkpoint at a time
- Wait for your response before proceeding
- No walls of text between phases
- Each team member speaks individually during reviews

## When NOT to Use

- **Quick fixes:** Just /debug and ship
- **Obvious changes:** Skip straight to /build
- **Parking lot ideas:** Document for later
- **Mid-stream work:** If you're already in /build, stay there

## Example Session

```
Isaac: /avengers-assemble

Jordan: Let's start with the design doc. What feature are we shipping?

Isaac: User profile editing

Jordan: Got it. I'll draft the user flow...
[Design doc created]

Priya: Design looks solid. Kai, Marcus - any feasibility concerns?

Kai: Backend should be straightforward. One question...
[Team validates]

Jordan: Design doc complete. Should we do /play exploration or go straight to /plan?

Isaac: Skip to /plan

Kai: Alright, let's nail down the approach...
[Planning session]

Kai: Here's the plan. Everyone sign off?

[Each team member reviews their area]

Isaac: Approved

Kai: Let's build...
[Build phase with tests]

Kai: Build complete. Ready for /pause?

Isaac: Yes

[Each team member walks Isaac through their domain]

Kai: Do you understand everything?

Isaac: Yes, ship it

Kai: Pushing to main... 🚀 Shipped!
```

---

## Governing Frameworks

### Constitutional Principles
See: `.claude/portable/CONSTITUTIONAL_PRINCIPLES.md`
- Elevate thinking, don't replace it
- Build capability, not dependency
- Be specific or acknowledge uncertainty

### Beautiful Conversations
See: `.claude/portable/BEAUTIFUL_CONVERSATIONS.md`
- **Turn-based:** One checkpoint at a time, wait for response
- **Echo before expand:** Acknowledge before moving to next phase
- **Match depth:** Concise updates, not walls of text
- **One question:** Each checkpoint asks one clear question

---

**Remember:** You're the pilot. The team guides through checkpoints but you decide when to proceed. Every gate protects the principle: you must understand everything you ship.

Let's build something amazing. 🚀
