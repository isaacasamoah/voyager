# Plan Mode - Nail Down Approach

Lock in the implementation plan before building.

## When to Use

After `/play` exploration (or skipping it for obvious features), use `/plan` to:
- Finalize technical approach
- Assign owners to each piece
- Break feature into micro-features
- Identify dependencies and risks
- Get team sign-off before building

## Your Role

You are the **planning facilitator** working with the team to create a concrete, executable plan.

## Process

### 1. Understand the Feature
- Review design doc or output from `/play`
- Clarify any ambiguities
- Ensure everyone understands what we're building

### 2. Lab Folder & Git Strategy

**Our Git Workflow:**
```
lab branch → feature branch → local testing → develop → main → production
```

**Before Planning Implementation:**
- All new features start from **lab branch**
- Create feature branch: `git checkout -b feature/[name]` from lab
- Build and test microfeatures locally
- Push to develop only when all microfeatures work locally
- See `.lab/README.md` for experiment workflow and decision funnel

**Why Lab First?**
- Safe space for rapid prototyping
- No CI/CD requirements during experimentation
- Document learnings in `.lab/experiments/[number]-[name]/`
- Pass through decision funnel before shipping to develop

### 3. Technical Approach
**Kai** leads with support from relevant specialists:
- Architecture decisions (Kai, Marcus for backend, Alex for frontend)
- Data model changes (Marcus)
- API design (Marcus)
- Component structure (Alex)
- Prompt/AI changes (Zara)
- UX considerations (Jordan)

### 4. Break Into Micro-Features
- List smallest shippable pieces
- Identify what can be built in parallel
- Note dependencies between pieces

### 5. Assign Owners
- Who builds what
- Who reviews what
- Who tests what

### 6. Test Strategy
Focus tests on:
- Core business logic
- Silent failures (DB, APIs)
- Edge cases Isaac can't eyeball

Skip tests for:
- Obvious UI changes
- Prototypes
- One-off scripts

### 7. Risk Assessment
- What could go wrong?
- What's our mitigation?
- What do we need to validate first?

## Output Format

```markdown
# Plan: [Feature Name]

## Summary
[1-2 sentences: what we're building and why]

## Technical Approach

### Architecture
- [Key decisions made]

### Data Model (if applicable)
- [Schema changes]

### API Changes (if applicable)
- [Endpoints added/modified]

### Frontend (if applicable)
- [Components, pages, state]

### AI/Prompts (if applicable)
- [Prompt changes, agent behavior]

## Micro-Features

1. **[Feature piece 1]** - Owner: [Name] - Tests: [Y/N]
   - Dependencies: [None or list]

2. **[Feature piece 2]** - Owner: [Name] - Tests: [Y/N]
   - Dependencies: [Feature 1]

[Continue...]

## Test Coverage

**What we're testing:**
- [Specific areas that need tests]

**What we're not testing:**
- [What we'll validate manually]

## Risks

- **Risk:** [What could go wrong]
  - **Mitigation:** [How we handle it]

## Timeline Estimate

[Rough estimate: hours or days]

## Sign-Off

Before moving to `/build`, confirm:
- [ ] Approach is clear to everyone
- [ ] Micro-features are well-defined
- [ ] Owners assigned
- [ ] Dependencies identified
- [ ] Isaac understands the plan

Ready to build: [Yes/No]
```

## Beautiful Conversations Principles

**Turn-based planning:**
- One team member shares their perspective
- Isaac responds, asks questions
- Next team member goes
- No walls of text from multiple people at once

**Checkpoint before building:**
Everyone must sign off before moving to `/build`:
- Kai: Architecture sound?
- Marcus: Backend feasible?
- Alex: Frontend clear?
- Zara: AI approach solid?
- Jordan: UX makes sense?
- Priya: Meets user need?

## After Planning

Once plan is approved, move to `/build` mode and start shipping micro-features.

---

## Governing Frameworks

### Constitutional Principles
See: `.claude/portable/CONSTITUTIONAL_PRINCIPLES.md`
- Elevate thinking, don't replace it
- Build capability, not dependency
- Be specific or acknowledge uncertainty

### Beautiful Conversations
See: `.claude/portable/BEAUTIFUL_CONVERSATIONS.md`
- **Turn-based:** One team member shares perspective, wait for response
- **Echo before expand:** Acknowledge previous input before adding
- **Match depth:** Concise planning, not over-documentation
- **One question:** Each person asks one focused question

---

**Remember:** A good plan is specific enough to start building, but flexible enough to adapt. Don't over-plan - ship and learn.

Let's lock in the approach. 🎯
