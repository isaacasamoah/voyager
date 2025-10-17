# Vercel Branch Deployment Setup

## Strategy
- **main** → Production (`careersy-wingman.vercel.app`)
- **develop** → Preview (`careersy-wingman-dev.vercel.app` or auto-generated)
- **feature/** → Auto preview URLs

## Setup Steps

### 1. Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select **careersy-wingman** project
3. Go to **Settings** → **Git**

### 2. Production Branch
Set **Production Branch** to `main`
- All pushes to main deploy to production URL

### 3. Preview Deployments
Enable automatic deployments for:
- ✅ `develop` branch
- ✅ All branches (for feature branches)

### 4. Branch Protection (GitHub)
1. Go to GitHub repo → Settings → Branches
2. Add branch protection rule for `main`:
   - ✅ Require pull request reviews
   - ✅ Require status checks (optional for now)

### 5. Environment Variables
Ensure all env vars are set for both:
- **Production** (main branch)
- **Preview** (develop + feature branches)

## Workflow

**Feature development:**
```bash
git checkout develop
git checkout -b feature/new-feature
# ... make changes ...
git push origin feature/new-feature
# Vercel auto-deploys preview URL
```

**Merge to develop:**
```bash
git checkout develop
git merge feature/new-feature
git push origin develop
# Vercel deploys to develop preview
```

**Release to production:**
```bash
git checkout main
git merge develop
git tag v0.X.0-feature-name
git push origin main --tags
# Vercel deploys to production
```

## URLs
- **Production**: https://careersy-wingman.vercel.app
- **Develop**: Auto-generated or custom domain
- **Features**: Auto-generated per branch
