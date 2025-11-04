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

## Customization

Feel free to:
- **Edit cofounder profiles** to match your team's personality
- **Add new commands** for your workflow
- **Modify modes** to fit your style
- **Extend the team** with new domain experts

## Credits

Created with Claude Code during Voyager development.
Refined through hundreds of sessions building a real product.

---

**Remember:** This system works because it respects you as the creative genius while providing expert execution support. The best code is the code we don't write. The best feature is the one that feels inevitable.

Let's build something amazing. 🚀
