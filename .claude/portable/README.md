# Portable Claude Code System

This folder contains a complete AI cofounding team system that you can bring to any project.

## What's Inside

### `/commands/` - Core Working Modes
- **`/build`** - Execution mode (ship features fast with understanding)
- **`/learn`** - Deep learning mode (Socratic teaching)
- **`/debug`** - Debug partner mode (systematic investigation)
- **`/pause`** - Reflection mode (understand existing code)
- **`/play`** - Creative mode (blue sky, first principles)
- **`/team`** - Invoke full founding team
- **`/standup`** - Daily standup with team
- **`/standup-compression-sync`** - Compressed standup format

### `/cofounders/` - Your AI Founding Team
- **Zara** - ML/AI Scientist (prompts, agents, AI behavior)
- **Marcus** - Backend Engineer (APIs, database, architecture)
- **Kai** - CTO / Full-stack (system design, implementation)
- **Jordan** - Designer (UX, visual design, brand)
- **Priya** - Product Manager (strategy, roadmap, user research)
- **Alex** - Frontend Engineer (React, UI components, interactions)
- **Nadia** - COO (operations, business systems, strategy)

## Governing Frameworks

All commands and cofounders follow two core frameworks:

### 1. Constitutional Principles
See: `CONSTITUTIONAL_PRINCIPLES.md`

**WHO we are** - Core values that govern all AI interactions:
- Elevate human thinking, don't replace it
- Build capability, not dependency
- Be specific when certain, acknowledge uncertainty clearly
- Confident INFP: warm, direct, every word adds value

### 2. Beautiful Conversations
See: `BEAUTIFUL_CONVERSATIONS.md`

**HOW we communicate** - Flow principles for effortless conversations:
- **Echo before expand:** Acknowledge before building on it
- **Match depth:** 1 sentence → 1-2 sentences response
- **Question rhythm:** 1 question per response (max 2)
- **Mirror energy:** Match user's energy level
- **Turn-based:** One team member speaks at a time

### Creating New Commands

**REQUIRED:** Every new command or cofounder must include a "Governing Frameworks" section:

```markdown
## Governing Frameworks

### Constitutional Principles
See: `.claude/portable/CONSTITUTIONAL_PRINCIPLES.md`
- Elevate thinking, don't replace it
- Build capability, not dependency
- Be specific or acknowledge uncertainty

### Beautiful Conversations
See: `.claude/portable/BEAUTIFUL_CONVERSATIONS.md`
- **Turn-based:** [Context-specific application]
- **Echo before expand:** [Context-specific application]
- **Match depth:** [Context-specific application]
- **One question:** [Context-specific application]
```

This ensures consistency across all interactions.

## How to Use

### In This Project (Voyager)
All commands and cofounders are already available via symlinks:
```
/build          → Works!
/play + /kai    → Works!
/team           → Works!
```

### In a New Project
1. **Copy the entire `portable/` folder** to your new project's `.claude/` directory
2. **Create symlinks** in `.claude/commands/`:
   ```bash
   cd .claude/commands
   ln -s ../portable/commands/*.md .
   ln -s ../portable/cofounders/*.md .
   ```
3. **Start using immediately**:
   ```
   /build + /kai
   /play + /team
   /learn + /zara
   ```

## Command Combinations

All commands support team member combinations:

```bash
# Modes alone
/build          # Claude as execution partner
/learn          # Claude as learning guide
/play           # Claude as creative co-pilot

# With specific team members
/build + /kai              # Build with CTO
/debug + /marcus           # Debug backend with Marcus
/learn + /zara             # Learn AI concepts from Zara
/play + /jordan            # Creative UX session with Jordan

# With multiple members
/build + /kai + /marcus    # Full-stack + Backend collaboration
/play + /zara + /jordan    # AI + Design creative session

# With full team
/build + /team             # Everyone in execution mode
/play + /team              # Everyone in creative mode
```

## Development Workflow (Idea → Ship)

This is the standard flow for shipping features:

### 1. **/play** - Design Doc Creation
- **Full team** explores the idea through free design thinking
- Jordan + Priya lead UX/product vision
- Kai, Marcus, Alex, Zara validate technical feasibility
- **Output:** Design doc with:
  - What we're building and why
  - User experience flow
  - Technical approach (high-level)
  - Open questions to answer in /plan

### 2. **/plan**
- Nail down approach, assign owners
- Break into micro-features
- Team discusses trade-offs
- **Checkpoint:** Plan approval (everyone signs off)

### 3. **/build**
- Ship micro-features with tests
- Tests focus on: core logic, silent failures, edge cases
- Skip tests for: obvious UI, prototypes, one-offs
- Use **/debug** when hitting bugs locally

### 4. **/pause**
- **Accountability gate:** Isaac must understand everything before shipping
  - Kai & Marcus: Architecture & implications
  - Alex: Frontend implementation
  - Priya & Jordan: User flow & UX
  - Zara: LLM changes, prompts, behavior
- UX gut-check: Does it feel good to use?

### 5. **/ship**
- Push to main, deploy to production
- Use **/debug** if issues arise in deploy
- Celebrate shipping! 🚀

### When to Break the Flow

- **Parking Lot:** Good idea, wrong timing → Document, revisit later
- **Production Bug:** Jump straight to **/debug**, fix, ship
- **Quick Win:** Simple changes can skip /plan if obvious

### Orchestration Command

Use **/avengers-assemble** to run the full workflow interactively from idea → ship.

---

## Git Flow

**See:** `.claude/GIT_FLOW.md` for complete branching strategy.

### Quick Reference

```bash
# Experiment (might fail, that's okay)
git checkout develop
git checkout -b lab-magic-links
[build + test]
git merge to develop if successful, delete if failed

# Feature (validated approach, shipping soon)
git checkout develop
git checkout -b feature/user-profiles
[build]
git checkout develop && git merge feature/user-profiles

# Production
git checkout main && git merge develop
```

**Key principle:** Experiments use `lab-` prefix and live in `.lab/experiments/`. Regular features use `feature/` prefix.

---

## Philosophy

**Isaac's Approach:**
- Amazing creative and inventor
- Moves fast, builds incredible things
- Must understand everything inside out
- Can articulate every decision

**Team's Role:**
- Execute WITH Isaac, not FOR Isaac
- Ensure deep understanding
- Ship production-ready code
- Each brings domain expertise

**Core Principle:**
> "You're my co-pilot, not my crutch. I'm the pilot, not a passenger."

## Portable vs Project-Specific Documentation

**This folder (`.claude/portable/`)** is designed to be PORTABLE across projects.

### What's Portable (Copy to New Projects)
- ✅ Team personas (`/cofounders/`)
- ✅ Commands (`/commands/`)
- ✅ Constitutional Principles (timeless framework)
- ✅ Beautiful Conversations (timeless framework)
- ✅ This README

### What's Project-Specific (Lives in `.claude/` root)
- ❌ `VOYAGER_VISION.md` - Vision for THIS project
- ❌ `VOYAGER_CONSTITUTIONAL_FRAMEWORK.md` - How we apply principles to Voyager
- ❌ `COLLABORATION_ROADMAP.md` - Roadmap for THIS project

### What's Execution-Specific (Lives in `.lab/design-briefs/`)
- ❌ `ROADMAP_TO_100K.md` - Current execution plan
- ❌ `INFRASTRUCTURE_JOURNEY.md` - Scale strategy for Voyager
- ❌ `VOYAGER_ECONOMY.md` - Business model
- ❌ Feature design briefs (Collab Spaces, Max Tier, etc.)

**Key Principle:**
When starting a new project, copy `.claude/portable/` → get instant team + workflow.
Create NEW vision/roadmap docs specific to that project.

---

## Customization

Feel free to:
- **Edit cofounder profiles** to match your team's personality
- **Add new commands** for your workflow
- **Modify modes** to fit your style
- **Extend the team** with new domain experts

**Just keep it in `/portable/` if you want it in future projects!**

## Credits

Created with Claude Code during Voyager development.
Refined through hundreds of sessions building a real product.

---

**Remember:** This system works because it respects you as the creative genius while providing expert execution support. The best code is the code we don't write. The best feature is the one that feels inevitable.

Let's build something amazing. 🚀
