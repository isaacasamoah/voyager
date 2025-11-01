# The Lab - Voyager Playground

**Purpose:** Safe space for rapid experimentation without production consequences.

## Philosophy

> "Fail fast, learn fast, ship smart."

The Lab is where we try wild ideas, break things, and discover what works. Nothing here affects production until it passes through our decision funnel.

## Rules

1. **Anything goes** - Break things, try crazy ideas, move fast
2. **Document learnings** - What worked, what didn't, and why
3. **Nothing ships without approval** - Lab → Decision Funnel → Production
4. **Clean up after yourself** - Archive or delete failed experiments
5. **Respect tokens** - Be mindful of team context usage

## Structure

```
.lab/
├── experiments/        # Active experiment logs
├── archive/           # Failed/completed experiments
└── README.md          # This file
```

## How to Run an Experiment

### 1. Start with a Question

**Good questions:**
- "What if we animated mode transitions?"
- "Can we improve prompt quality by 20%?"
- "Would users prefer visual wireframes in Cartographer output?"

**Bad questions:**
- "Let's add this feature" (no hypothesis)
- "Make it better" (not measurable)

### 2. Create Experiment Log

Copy `.lab/experiments/template.md` and fill it out:
- What are you testing?
- What's the hypothesis?
- How will you measure success?
- Timeline: How long to test?

### 3. Build/Test in Lab Branch

**Freedom:**
- No CI/CD requirements
- No test coverage needed
- Can break things
- Can be messy

**Discipline:**
- Document as you go
- Note what worked and what didn't
- Measure against success criteria

### 4. Document Results

Update your experiment log:
- What did you learn?
- What were the results?
- Screenshots/metrics/evidence

### 5. Decision Funnel

See "Decision Funnel" section below.

## Decision Funnel (Lab → Production)

```
Lab Experiment
    ↓
Did it work? (measured against success criteria)
    ↓ YES
Priya validates user need
    ↓ YES
Domain expert reviews (Kai/Zara/Jordan/Alex/Marcus/Nadia)
    ↓ APPROVED
Constitutional alignment check
    ↓ ALIGNED
Refactor for production (if code)
    ↓
Create feature branch from lab
    ↓
Merge to develop
    ↓
PRODUCTION
```

**If NO at any step:** Archive experiment, document learnings, move on.

## Types of Experiments

### **Frontend (Alex + Jordan)**
- New UI patterns
- Animations and interactions
- Component variations
- Performance optimizations

**Success criteria examples:**
- Lighthouse score improved by X
- User testing shows preference
- Reduces cognitive load (measured)

### **Backend (Marcus)**
- API architecture variations
- Caching strategies
- Database schema experiments
- Infrastructure tests

**Success criteria examples:**
- Response time improved by X%
- Cost reduced by $Y
- Scales to Z concurrent users

### **ML/AI (Zara)**
- Prompt architecture variations
- Model comparisons
- RAG strategies
- Eval experiments

**Success criteria examples:**
- Eval score improved by X%
- Constitutional alignment maintained
- Cost per request reduced

### **Design (Jordan)**
- Wireframes and mockups
- Design token experiments
- Accessibility variations
- Mobile-first prototypes

**Success criteria examples:**
- User testing preference
- WCAG compliance maintained
- Mobile viewport improved

### **Product (Priya)**
- User research
- Feature validation
- Pricing experiments
- Messaging tests

**Success criteria examples:**
- User interviews validate need
- Conversion improves
- Clear user benefit

### **Operations (Nadia)**
- Legal templates
- Financial models
- Payment flow variations
- Infrastructure staging

**Success criteria examples:**
- Cost reduction
- Risk mitigation
- Faster time to market

## Experiment Lifecycle

### **Active** (in .lab/experiments/)
- Currently running
- Results not yet known
- Team can collaborate

### **Completed - Success** (moved to feature branch)
- Passed decision funnel
- Being refactored for production
- Will merge to develop

### **Completed - Failed** (in .lab/archive/)
- Didn't meet success criteria
- Learnings documented
- Available for future reference

### **Abandoned** (in .lab/archive/)
- Experiment stopped early
- Reason documented
- Learnings captured

## Constitutional Alignment

**Before any experiment ships to production:**

✅ **Elevation over Replacement**
- Does this make users more capable?
- Or does it create dependency?

✅ **Knowledge Preservation**
- Does this help preserve/share knowledge?
- Or does it hoard information?

✅ **Human-Centered Collaboration**
- Does this facilitate human connection?
- Or does it replace it?

**If answer is unclear:** Use `/team` to discuss.

## Best Practices

### **DO:**
- ✅ Start with clear hypothesis
- ✅ Define success criteria upfront
- ✅ Document as you go
- ✅ Share learnings with team
- ✅ Archive failed experiments (they're valuable)
- ✅ Keep experiments focused (one question at a time)

### **DON'T:**
- ❌ Ship lab code directly to production
- ❌ Let experiments accumulate without decision
- ❌ Forget to document learnings
- ❌ Experiment without success criteria
- ❌ Skip the decision funnel

## Quick Commands

**Start experiment:**
```bash
cp .lab/experiments/template.md .lab/experiments/$(date +%Y-%m-%d)-[name].md
```

**Archive experiment:**
```bash
mv .lab/experiments/[name].md .lab/archive/
```

**List active experiments:**
```bash
ls -la .lab/experiments/
```

## Examples of Good Experiments

### **Example 1: Animated Mode Transitions**
- **Hypothesis:** Smooth animations reduce cognitive load when switching modes
- **Success criteria:** User testing shows 80%+ prefer animated version
- **Timeline:** 3 days to prototype, 1 day user testing
- **Owner:** Alex + Jordan
- **Result:** TBD

### **Example 2: RAG Chunking Strategy**
- **Hypothesis:** Smaller chunks (200 tokens) improve retrieval accuracy vs current (500 tokens)
- **Success criteria:** Eval score improves by 10%+
- **Timeline:** 2 days to implement, 1 day to run evals
- **Owner:** Zara
- **Result:** TBD

### **Example 3: Pricing Model Test**
- **Hypothesis:** Per-seat pricing ($29/user) converts better than coach license ($99/unlimited)
- **Success criteria:** 10 customer conversations show preference
- **Timeline:** 1 week customer research
- **Owner:** Priya + Nadia
- **Result:** TBD

## Team Coordination

**For small experiments:**
- Work solo, share results

**For cross-functional experiments:**
- Use `/[person1] + /[person2]` to collaborate

**For major decisions:**
- Use `/team` for full team discussion

## Lab Maintenance

**Monthly cleanup:**
- Review active experiments (still relevant?)
- Archive completed experiments
- Extract patterns/learnings
- Update this README with insights

---

**Remember:** The Lab is about learning, not shipping. Ship only what earns its way to production.

**Let's experiment boldly and ship thoughtfully.** 🧪🗺️
