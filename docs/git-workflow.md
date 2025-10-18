# Git Workflow & Tagging Strategy

## Overview
This document defines our git workflow for the Careersy Community Platform project. The core principle: **every functional commit gets tagged** so we can quickly rollback to known-good states.

---

## Commit Standards

### What is a "Functional Commit"?
A functional commit is one where:
1. ✅ All existing features still work
2. ✅ Tests pass (`npm run test:run`)
3. ✅ TypeScript compiles (`npm run type-check`)
4. ✅ App builds successfully (`npm run build`)

### Commit Message Format
```
[type]: [concise description]

[optional body explaining why/what changed]

Tested: [what was tested]
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring (no behavior change)
- `test:` - Adding or updating tests
- `docs:` - Documentation updates
- `chore:` - Maintenance (deps, config, etc)
- `db:` - Database schema changes

**Examples:**
```bash
feat: add private/public toggle to chat interface

Added toggle component allowing users to switch between private AI chat
and public community posting. Toggle state persists across sessions.

Tested: Toggle switches modes, UI updates correctly, state persists
```

```bash
db: add Community and Vote models

Extended Prisma schema with Community, CommunityMember, Vote, Validation,
and TrainingData models. Updated existing models with community fields.

Tested: Migration successful, Prisma client generated, all tests pass
```

---

## Tagging Strategy

### Tag Format
```
v[MAJOR].[MINOR].[PATCH]-[FEATURE]
```

**Semantic Versioning:**
- **MAJOR**: Breaking changes (v1.0.0 → v2.0.0)
- **MINOR**: New features, backward compatible (v1.0.0 → v1.1.0)
- **PATCH**: Bug fixes (v1.0.0 → v1.0.1)

**Feature Tags** (for development):
- `v0.1.0-foundation` - Initial working app
- `v0.2.0-community-schema` - Database schema for community features
- `v0.3.0-public-toggle` - Private/public mode toggle
- `v0.4.0-community-feed` - Community feed page
- `v0.5.0-threading` - Message threading
- `v0.6.0-voting` - Upvote/downvote system
- `v0.7.0-validation` - Expert validation
- `v0.8.0-rag` - AI with RAG
- `v1.0.0-pitch-ready` - Demo-ready for client pitch

### When to Tag

**Tag EVERY functional commit** using this workflow:

```bash
# 1. Make your changes
# 2. Run checks
npm run test:run           # Tests must pass
npm run type-check         # TypeScript must compile
npm run build              # Build must succeed

# 3. If all checks pass, commit
git add .
git commit -m "feat: add community feed page"

# 4. Tag immediately
git tag v0.4.0-community-feed

# 5. Push with tags
git push origin main --tags
```

### Quick Rollback

If something breaks:

```bash
# See all tags
git tag -l

# Rollback to last working state
git checkout v0.3.0-public-toggle

# Or create a new branch from that tag
git checkout -b fix-from-working-state v0.3.0-public-toggle

# Or hard reset (DESTRUCTIVE - be careful)
git reset --hard v0.3.0-public-toggle
```

---

## Pre-Commit Checklist

Before EVERY commit, run:

```bash
npm run test:run && npm run type-check && npm run build
```

**OR** use this shorthand script (add to package.json):

```json
"scripts": {
  "precommit": "npm run test:run && npm run type-check && npm run build"
}
```

Then run:
```bash
npm run precommit && git commit -m "your message"
```

---

## Branch Strategy

### Branches
- **main** - Production (always working, demo-ready)
- **develop** - Integration (test features here first)
- **feature/** - Feature branches

### Rules
1. Never commit directly to main
2. Always branch from develop
3. Merge to develop first, test, then main
4. Only tag main

### Workflow

```bash
# Create feature branch
git checkout -b feature/expert-validation

# Make multiple commits
git commit -m "wip: add Validation model"
git commit -m "wip: create validation API"
git commit -m "feat: complete expert validation system"

# Run checks
npm run precommit

# Merge to main (squash if multiple WIP commits)
git checkout main
git merge --squash feature/expert-validation
git commit -m "feat: add expert validation system"

# Tag
git tag v0.7.0-validation
git push origin main --tags
```

---

## Tag Reference (Project Timeline)

| Tag | Description | Date |
|-----|-------------|------|
| `v0.1.0-foundation` | Initial app (auth, chat, Stripe) | Oct 9, 2025 |
| `v0.2.0-community-schema` | Database migration complete | Oct 16, 2025 |
| `v0.3.0-public-toggle` | Private/public toggle working | TBD |
| `v0.4.0-community-feed` | Community feed page | TBD |
| `v0.5.0-threading` | Message threading | TBD |
| `v0.6.0-voting` | Voting system | TBD |
| `v0.7.0-validation` | Expert validation | TBD |
| `v0.8.0-rag` | AI with RAG | TBD |
| `v1.0.0-pitch-ready` | Demo-ready | Nov 6, 2025 (target) |

---

## Emergency Procedures

### If Main Branch Breaks

1. **Identify last working tag:**
   ```bash
   git tag -l
   ```

2. **Check that tag:**
   ```bash
   git checkout v0.X.0-working-tag
   npm run test:run
   npm run build
   ```

3. **If working, restore main:**
   ```bash
   git checkout main
   git reset --hard v0.X.0-working-tag
   git push origin main --force
   ```

4. **Fix the issue on a branch:**
   ```bash
   git checkout -b fix/broken-feature
   # make fixes
   npm run precommit
   git commit -m "fix: resolve issue with X"
   git checkout main
   git merge fix/broken-feature
   git tag v0.X.1-hotfix
   git push origin main --tags
   ```

---

## Automated Checks (Future)

Consider adding GitHub Actions or Vercel deployment checks:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run test:run
      - run: npm run type-check
      - run: npm run build
```

---

## Summary

**Golden Rule:** Only commit when everything works, and tag every commit on main.

**Quick Commands:**
```bash
# Full check
npm run test:run && npm run type-check && npm run build

# Commit and tag
git add .
git commit -m "feat: your feature"
git tag v0.X.0-feature-name
git push origin main --tags

# Rollback
git checkout vX.Y.Z-tag-name
```

**Why This Works:**
- No "where were we?" moments
- Instant rollback to any working state
- Clear project timeline via tags
- Safe to experiment (just rollback)
- Demo-ready tags for client meetings

---

Last Updated: October 16, 2025
