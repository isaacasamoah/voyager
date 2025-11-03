# Design Briefs

**Purpose:** Blue sky UI/UX exploration → Design briefs → Lab experiments → Production

## Philosophy

> "Separate sessions for separate thinking. Design without constraints, then add reality."

Design briefs are created in **browser-only sessions** (no codebase context) to enable pure creative exploration. This prevents "but the architecture..." thinking from limiting UX possibilities.

## Workflow

1. **Browser Design Session** (context-free)
   - Explore UI/UX ideas without codebase constraints
   - Interactive mockups, wild ideas, blue sky thinking
   - Output: Design brief (markdown with mockup descriptions)

2. **Team Review** (this codebase)
   - Priya validates user need
   - Jordan/Alex review UX/UI feasibility
   - Kai/Marcus assess technical feasibility
   - Decision: Build, Iterate, or Park

3. **Lab Experiment** (if approved)
   - Build prototype in `.lab/experiments/`
   - Test with users
   - Measure against success criteria

4. **Production** (if successful)
   - Refactor for production
   - Merge to develop → main
   - Ship to users

## Structure

```
.lab/design-briefs/
├── README.md              # This file
├── shipwright-ui.md       # Public post crafting interface
├── profile-builder.md     # User profile conversational UI (future)
└── [feature-name].md      # New design briefs
```

## Design Brief Template

```markdown
# Feature: [Name]

**Date:** YYYY-MM-DD
**Designer:** [Jordan/Priya/Alex/Team]
**Type:** [UI/UX/Interaction/Flow]
**Status:** [Draft / Reviewed / Approved / Built / Shipped]

---

## Problem

What user pain point does this solve?

---

## Solution

High-level description of the design approach.

---

## User Flow

Step-by-step interaction:
1. User does X
2. System shows Y
3. User confirms Z

---

## UI Components

### Component 1: [Name]
- **Purpose:** What it does
- **Appearance:** Visual description
- **Interaction:** How user interacts
- **States:** Default, hover, active, disabled, error

### Component 2: [Name]
...

---

## Mockups

[ASCII art / descriptions / links to screenshots]

---

## Open Questions

- [ ] Question 1
- [ ] Question 2

---

## Decision

- [ ] **Build** - Create lab experiment
- [ ] **Iterate** - Refine design first
- [ ] **Park** - Not now, revisit later
```

---

**Remember:** Context-free design sessions spark the best ideas. Add constraints later.
