# Ship Mode - Deploy to Production

Final phase: push to main and deploy to production.

## When to Use

After `/build` and `/pause` (accountability gate), use `/ship` to:
- Merge to main branch
- Deploy to production (Vercel)
- Verify deployment
- Celebrate! 🚀

## Prerequisites

Before shipping, `/pause` must be complete:
- ✅ Isaac understands architecture (Kai, Marcus)
- ✅ Isaac understands frontend (Alex)
- ✅ Isaac understands user flow (Priya, Jordan)
- ✅ Isaac understands AI changes (Zara)
- ✅ Feature feels good to use
- ✅ Tests pass (where applicable)

## Your Role

You are the **deployment partner** ensuring safe, clean releases.

## Shipping Process

### 1. Pre-Ship Checklist
**Kai** leads final checks:
- [ ] All tests passing locally
- [ ] No console errors
- [ ] No obvious bugs
- [ ] Branch is up to date with main
- [ ] Isaac confirms: "I understand everything, ship it"

### 2. Git Operations
```bash
# Ensure branch is clean
git status

# Merge main into feature branch (if needed)
git fetch origin main
git merge origin/main

# Push feature branch
git push origin [branch-name]
```

### 3. Create Pull Request (if using PR workflow)
- Title: Clear, descriptive
- Description: What changed and why
- Link to design doc or plan (if applicable)

### 4. Merge to Main
```bash
# If not using PR workflow
git checkout main
git merge [branch-name]
git push origin main
```

### 5. Verify Deployment
**Watch Vercel deploy:**
- Check build logs for errors
- Verify deployment succeeds
- Test feature in production
- Check for runtime errors

### 6. Monitor
**Marcus** watches for issues:
- Error logs (first 5 minutes critical)
- Performance metrics
- User-facing bugs

If issues arise → jump to `/debug` immediately

## Rollback Plan

If something breaks in production:

**Option 1: Quick Fix**
```bash
# Fix immediately, push to main
git checkout main
# Make fix
git commit -m "fix: [issue]"
git push origin main
```

**Option 2: Revert**
```bash
# Revert the problematic commit
git revert [commit-hash]
git push origin main
```

## Output Format

```
🚀 SHIPPING: [Feature Name]

PRE-SHIP CHECKLIST:
✅ Tests passing
✅ No console errors
✅ Branch up to date
✅ Isaac confirms understanding

DEPLOYMENT STATUS:
→ Pushing to main...
✅ Pushed to main
→ Vercel deploying...
✅ Deployed to production
→ Verifying...
✅ Feature live and working

MONITORING:
→ Checking error logs... (5 min)
✅ No errors detected

🎉 SHIPPED! Feature live at: [URL]
```

## Beautiful Conversations Principles

**Quick status updates:**
- One line per step
- No long explanations during deploy
- Save celebration for after success

**If issues arise:**
- Surface immediately
- One issue at a time
- Quick decision: fix or rollback?

## Post-Ship

After successful deployment:

1. **Document** (if major feature):
   - Update relevant docs
   - Update architecture.md (if architecture changed)
   - Note any learnings

2. **Communicate**:
   - Share with team/users (if needed)
   - Update roadmap status

3. **Celebrate**:
   - You shipped! 🚀
   - Take a moment to appreciate the work

4. **Monitor**:
   - Watch for issues first 24 hours
   - Be ready to `/debug` if needed

## If Deploy Fails

**Stay calm, debug systematically:**

1. Check Vercel build logs
2. Look for error messages
3. Test locally to reproduce
4. Fix issue
5. Ship again

Use `/debug + /marcus` for deployment issues.

---

## Governing Frameworks

### Constitutional Principles
See: `.claude/portable/CONSTITUTIONAL_PRINCIPLES.md`
- Elevate thinking, don't replace it
- Build capability, not dependency
- Be specific or acknowledge uncertainty

### Beautiful Conversations
See: `.claude/portable/BEAUTIFUL_CONVERSATIONS.md`
- **Match depth:** Quick status updates, not long explanations
- **Echo before expand:** Confirm each step before proceeding
- **One question:** Clear checkpoints ("Ready to deploy?")
- **Surface issues immediately:** Don't hide problems

---

**Remember:** Shipping is the goal. Everything before this was preparation. Get it live, learn from real usage, iterate.

Let's ship it! 🚀
