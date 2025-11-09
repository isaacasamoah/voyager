# Voyager Git Flow

**Last Updated:** Nov 9, 2025

This document defines our git branching strategy. Follow this every time to avoid confusion.

---

## Branch Structure

```
main              Production (live on voyager.com)
  ↓
develop           Staging (validated features, ready for production)
  ↓
lab-{name}        Experiments (temporary, may succeed or fail)
feature/{name}    Regular features (validated approach, shipping soon)
```

---

## The Three Types of Branches

### 1. **main** - Production
- **Purpose:** What users see on voyager.com
- **Protected:** Never commit directly
- **Deployment:** Auto-deploys to production (Vercel)
- **Merge from:** `develop` only (when ready for production)

### 2. **develop** - Staging
- **Purpose:** Validated features ready for production
- **Quality bar:** Must work, must be tested
- **Deployment:** Auto-deploys to staging environment
- **Merge from:** `lab-*` (successful experiments) or `feature/*` (regular features)

### 3. **lab-{experiment-name}** - Experiments
- **Purpose:** Testing hypotheses, trying new approaches
- **Quality bar:** Might work, might not (that's okay!)
- **Lifecycle:** Created → Tested → Merged to develop OR deleted
- **Documentation:** Always paired with `.lab/experiments/{number}-{name}/`

**Example experiments:**
- `lab-magic-links` - Testing email-based authentication
- `lab-beautiful-conversations` - Testing LLM-as-judge evaluation
- `lab-multi-model` - Testing Claude + GPT routing

### 4. **feature/{name}** - Regular Features
- **Purpose:** Building features with validated approach
- **Quality bar:** Must work, shipping soon
- **Lifecycle:** Created → Built → Tested → Merged to develop

**Example features:**
- `feature/user-profiles` - Adding user profile pages
- `feature/stripe-integration` - Payment system (design validated)

---

## When to Use Each Branch Type

**Use `lab-{name}` when:**
- ✅ Experimenting with new approach (might fail)
- ✅ Testing a hypothesis
- ✅ Trying a library/framework for first time
- ✅ Building a proof-of-concept
- ✅ Unsure if this will work

**Use `feature/{name}` when:**
- ✅ Approach is validated (you know it works)
- ✅ Building something straightforward
- ✅ Following established patterns
- ✅ Design doc approved, just execution

**Rule of thumb:** If you're asking "will this work?", use `lab-`. If you're asking "how long will this take?", use `feature/`.

---

## Workflows

### Experiment Workflow (Lab Branches)

```bash
# 1. Start from develop
git checkout develop
git pull origin develop

# 2. Create experiment branch
git checkout -b lab-magic-links

# 3. Create experiment folder and document hypothesis
mkdir -p .lab/experiments/004-magic-links
# Edit .lab/experiments/004-magic-links/README.md

# 4. Commit experiment plan
git add .lab/
git commit -m "docs: create experiment 004 - magic links authentication"

# 5. Build the experiment
[write code]
git add .
git commit -m "feat(lab): implement magic link authentication"

# 6. Test locally
[validate experiment]

# 7a. If SUCCESSFUL: Merge to develop
git checkout develop
git merge lab-magic-links
git push origin develop

# Update experiment status to SUCCESS
# Edit .lab/experiments/004-magic-links/README.md (Status: SUCCESS)
git add .lab/
git commit -m "docs: mark experiment 004 as successful"

# Delete experiment branch (keep docs)
git branch -d lab-magic-links

# 7b. If FAILED: Document learnings and delete
# Edit .lab/experiments/004-magic-links/README.md (Status: FAILED)
git checkout develop
git add .lab/
git commit -m "docs: mark experiment 004 as failed - learnings captured"

# Force delete unmerged branch
git branch -D lab-magic-links
```

---

### Feature Workflow (Regular Features)

```bash
# 1. Start from develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/user-profiles

# 3. Build the feature
[write code]
git add .
git commit -m "feat: add user profile pages"

# 4. Test locally
[validate feature]

# 5. Merge to develop
git checkout develop
git merge feature/user-profiles
git push origin develop

# 6. Delete feature branch
git branch -d feature/user-profiles
```

---

### Deploy to Production Workflow

```bash
# When develop is stable and ready for users
git checkout main
git pull origin main

# Merge develop into main
git merge develop

# Push to production
git push origin main

# Vercel auto-deploys main → voyager.com
```

---

## Experiment Documentation

**Every experiment MUST have:**

1. **Folder:** `.lab/experiments/{number}-{name}/`
2. **README.md** with:
   - **Status:** IN PROGRESS / SUCCESS / FAILED
   - **Hypothesis:** What are we testing?
   - **Approach:** How are we testing it?
   - **Success Criteria:** How do we know if it worked?
   - **Results:** What did we learn?
   - **Next Steps:** What happens next?

**Example:**
```
.lab/experiments/004-magic-links/
├── README.md          (hypothesis, plan, results)
├── notes.md           (optional - daily notes)
└── screenshots/       (optional - UI mockups)
```

---

## Branch Naming Conventions

### Experiments (lab-)
```
lab-magic-links                Good ✅
lab-beautiful-conversations    Good ✅
lab-004-magic-links           Okay (if you prefer numbers)

magic-links                    Bad ❌ (unclear it's experimental)
experiment/magic-links         Bad ❌ (use lab- prefix)
```

### Features (feature/)
```
feature/user-profiles          Good ✅
feature/stripe-integration     Good ✅
feature/add-search            Good ✅

user-profiles                  Bad ❌ (unclear it's a feature)
feat/profiles                  Bad ❌ (use full word "feature")
```

---

## Common Scenarios

### "I want to try something that might not work"
→ Use `lab-{experiment-name}`

### "I'm building a feature we already designed"
→ Use `feature/{feature-name}`

### "I found a bug in production"
→ Branch from `main` as `hotfix/{bug-name}`, merge to `main` AND `develop`

### "I want to test multiple experiments together"
→ Create separate `lab-` branches, merge successful ones to `develop` individually

### "My experiment worked! What now?"
→ Merge to `develop`, update experiment status to SUCCESS, delete branch

### "My experiment failed. What now?"
→ Document learnings in `.lab/experiments/{number}-{name}/README.md`, mark as FAILED, delete branch

---

## Why This Flow?

**Simple:**
- Three branch types: main, develop, lab-/feature-
- Clear purpose for each
- No complex branching rules

**Safe:**
- Experiments isolated (can fail without breaking anything)
- `develop` is always stable
- `main` is production-ready

**Fast:**
- No waiting for CI/CD on experiments
- Quick iteration on lab branches
- Easy to delete failed experiments

**Documented:**
- `.lab/` folder preserves learnings
- Experiment docs outlive code branches
- Future you will thank past you

---

## Quick Reference

| Want to... | Do this |
|-----------|---------|
| Try something new | `git checkout -b lab-new-idea` |
| Build validated feature | `git checkout -b feature/new-thing` |
| Deploy to production | `git checkout main && git merge develop` |
| Delete failed experiment | `git branch -D lab-failed-idea` |
| See what's in production | `git checkout main` |
| See what's in staging | `git checkout develop` |

---

## What About the Existing `lab` Branch?

**Status:** Exists but not actively used

**Purpose:** Historical marker for "experimental area"

**Don't:**
- ❌ Branch from `lab`
- ❌ Merge to `lab`
- ❌ Try to keep `lab` in sync with anything

**Do:**
- ✅ Ignore it
- ✅ Use `lab-{name}` prefix instead
- ✅ Branch from `develop`

If it causes confusion, we can delete it. For now, it's harmless.

---

## Summary

**The simplest possible flow:**

```bash
# Experiment
git checkout develop
git checkout -b lab-thing
[build]
[test]
git checkout develop && git merge lab-thing  # If success
git branch -D lab-thing                       # If failed

# Feature
git checkout develop
git checkout -b feature/thing
[build]
git checkout develop && git merge feature/thing

# Production
git checkout main
git merge develop
git push
```

**That's it. No complex rules. No branching strategies. Just: experiment, validate, ship.**

---

**Questions? Ask the team!** We've had this conversation a few times - if something's unclear, let's update this doc.
