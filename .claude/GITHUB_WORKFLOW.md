# GitHub Workflow - Multi-Environment Development

**Branch Strategy:** `develop` as single source of truth with ephemeral feature branches

---

## Branch Structure

```
main (production, protected)
  ↑
  └─ merge from develop when releasing

develop (source of truth for active development)
  ↑
  ├─ claude/session-* (ephemeral, created by Claude Code)
  ├─ feature/* (short-lived features)
  └─ fix/* (bug fixes)
```

---

## Standard Session Workflow

### 1. **Start Session** (Mobile/Laptop/Any Environment)

```bash
# Switch to develop
git checkout develop

# Get latest changes
git pull origin develop

# Verify you're on develop and up to date
git status
git log --oneline -5
```

**Claude Code will create a feature branch automatically** (e.g., `claude/session-xyz`)
This is fine! Just remember to merge back to develop when done.

---

### 2. **During Session**

Work normally. Commit frequently:

```bash
git add -A
git commit -m "feat: description of what you built"
```

Push to your feature branch to save work:
```bash
git push -u origin <your-feature-branch>
```

---

### 3. **End Session** (CRITICAL: Sync back to develop)

```bash
# Make sure all work is committed
git status

# Switch to develop
git checkout develop

# Get any updates that happened while you were working
git pull origin develop

# Merge your feature branch into develop
git merge <your-feature-branch>

# Resolve any conflicts if needed
# Then:
git add -A
git commit -m "merge: <feature-branch> into develop"

# Push to develop (source of truth)
git push origin develop
```

**Optional:** Keep feature branch as backup
```bash
git push origin <your-feature-branch>
```

---

## Common Scenarios

### **Scenario 1: Switching Environments**

**From Mobile → Laptop:**
```bash
# On laptop
git checkout develop
git pull origin develop

# You now have all the work you did on mobile!
```

### **Scenario 2: Multiple People Working**

**Isaac pushed to develop while you were working:**
```bash
# You're on feature branch
git checkout develop
git pull origin develop  # Get Isaac's changes

# Merge develop into your feature branch
git checkout <your-feature-branch>
git merge develop  # Brings Isaac's changes into your branch

# Resolve conflicts if any, then continue working
```

### **Scenario 3: Long-Running Feature**

**Feature will take multiple sessions:**
```bash
# Session 1
git checkout develop
git pull origin develop
git checkout -b feature/long-feature
# ... work ...
git push origin feature/long-feature

# Session 2 (next day)
git checkout feature/long-feature
git pull origin feature/long-feature
# ... continue work ...

# When complete
git checkout develop
git pull origin develop
git merge feature/long-feature
git push origin develop
```

---

## Branch Naming Conventions

- `claude/session-*` - Auto-created by Claude Code (ephemeral)
- `feature/<name>` - New features (e.g., `feature/curate-mode`)
- `fix/<name>` - Bug fixes (e.g., `fix/auth-redirect`)
- `docs/<name>` - Documentation only (e.g., `docs/api-guide`)

---

## Important Rules

### ✅ DO:
- Always start by pulling develop
- Always end by merging back to develop
- Commit frequently with clear messages
- Push to origin often (backup your work)
- Delete feature branches after merging

### ❌ DON'T:
- Push broken code to develop (test first!)
- Work on main branch directly (use develop)
- Force push to develop or main
- Leave unmerged feature branches for more than a week

---

## Quick Reference

**Start Session:**
```bash
git checkout develop && git pull origin develop
```

**End Session:**
```bash
git checkout develop && git pull origin develop && git merge <feature-branch> && git push origin develop
```

**Check Status:**
```bash
git status
git log --oneline --graph --all --decorate | head -20
```

**See What's on Remote:**
```bash
git fetch origin
git branch -r
```

---

## Troubleshooting

### **"I forgot to merge to develop and started a new session"**

You now have diverged branches. Fix:
```bash
# Get both branches
git checkout develop
git pull origin develop

git checkout <old-feature-branch>
git pull origin <old-feature-branch>

# Merge old work into develop
git checkout develop
git merge <old-feature-branch>
git push origin develop
```

### **"I have merge conflicts"**

```bash
# See conflicted files
git status

# Edit files to resolve conflicts (look for <<<<<<)
# Then:
git add <resolved-files>
git commit -m "merge: resolve conflicts"
git push origin develop
```

### **"Which branch am I on?"**

```bash
git branch  # Shows all local branches, * = current
git status  # Shows current branch and changes
```

---

## Integration with Claude Code

**Claude Code automatically:**
- Creates session-specific branches (e.g., `claude/debug-local-sync-011CUMF99YapxHSFfjA4uAeS`)
- Commits with descriptive messages
- Pushes to origin

**You need to manually:**
- Merge back to develop at end of session
- Pull from develop at start of session

**Tip:** Add this to your session start routine:
1. Read `.claude/SESSION_SUMMARY.md` (if exists)
2. `git checkout develop && git pull origin develop`
3. Start working

---

**Last Updated:** 2025-10-22
**Version:** 1.0.0
