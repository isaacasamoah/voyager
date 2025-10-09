# Production Deployment Checklist

## Pre-Deployment Checklist

### 1. Code Quality
- [ ] All TypeScript types are properly defined (no `any`)
- [ ] No console.logs in production code
- [ ] Error boundaries implemented
- [ ] Loading states for all async operations
- [ ] Proper error messages for users
- [ ] All environment variables documented

### 2. Security
- [ ] Generate new `NEXTAUTH_SECRET` for production
- [ ] OAuth redirect URIs updated to production domain
- [ ] All secrets stored in environment variables
- [ ] No sensitive data in git history
- [ ] Database connection uses SSL (`?sslmode=require`)
- [ ] CORS properly configured
- [ ] Rate limiting considered (if needed)

### 3. Database
- [ ] Production database created
- [ ] Migrations tested in staging
- [ ] Connection string validated
- [ ] Backup strategy in place
- [ ] Indexes verified for performance

### 4. Testing
- [ ] Local build succeeds (`npm run build`)
- [ ] TypeScript compilation passes (`npm run type-check`)
- [ ] All pages load without errors
- [ ] OAuth flow tested with real providers
- [ ] Chat functionality tested end-to-end
- [ ] Mobile responsive design verified

---

## Deployment Steps

### Step 1: Setup Database

**Option A: Vercel Postgres**
```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Create database
vercel postgres create

# Get connection string
vercel env add DATABASE_URL
```

**Option B: External Provider (Neon, Supabase, Railway)**
1. Create database on provider
2. Copy connection string
3. Ensure SSL is enabled
4. Add to Vercel environment variables

### Step 2: Configure Environment Variables

Go to Vercel Dashboard → Project → Settings → Environment Variables

Add all variables from `.env.production.example`:

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="<generate-new-secret>"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
LINKEDIN_CLIENT_ID="..."
LINKEDIN_CLIENT_SECRET="..."
OPENAI_API_KEY="sk-..."
```

**Generate new NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Step 3: Update OAuth Redirect URIs

#### Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Add to "Authorized redirect URIs":
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```
4. Save changes

#### LinkedIn Developer Portal
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Select your app → Auth tab
3. Add to "Redirect URLs":
   ```
   https://your-domain.vercel.app/api/auth/callback/linkedin
   ```
4. Save changes

### Step 4: Deploy to Vercel

**Option A: GitHub Integration (Recommended)**
1. Push code to GitHub
2. Go to [Vercel](https://vercel.com/new)
3. Import your GitHub repository
4. Vercel auto-detects Next.js
5. Add environment variables (from Step 2)
6. Click "Deploy"

**Option B: Vercel CLI**
```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Verify deployment URL
# Update NEXTAUTH_URL in environment variables if needed

# Deploy to production
vercel --prod
```

### Step 5: Run Database Migrations

After first deployment:

```bash
# Set DATABASE_URL locally to production database
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy

# Verify
npx prisma studio
```

**Or via Vercel CLI:**
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

### Step 6: Verify Deployment

Test all critical paths:

1. **Landing Page**
   - [ ] Visit `https://your-domain.vercel.app`
   - [ ] Click "Get Started" → redirects to `/login`

2. **Authentication**
   - [ ] Click "Continue with Google"
   - [ ] Complete OAuth flow
   - [ ] Redirected to `/chat`
   - [ ] Verify session persists on refresh

3. **Chat Functionality**
   - [ ] Send a test message
   - [ ] Verify AI response received
   - [ ] Verify message saved to database
   - [ ] Test conversation continuity

4. **Error Handling**
   - [ ] Test with invalid conversation ID
   - [ ] Test logout flow
   - [ ] Test protected route access without auth

### Step 7: Monitor Initial Traffic

```bash
# View real-time logs
vercel logs --follow

# Check for errors
vercel logs --since 1h | grep ERROR
```

---

## Post-Deployment

### DNS Configuration (Custom Domain)

1. Add domain in Vercel dashboard
2. Update DNS records (provided by Vercel)
3. Wait for DNS propagation (up to 48 hours)
4. Update `NEXTAUTH_URL` to custom domain
5. Update OAuth redirect URIs to custom domain

### SSL Certificate
- Automatically provisioned by Vercel
- Auto-renews
- Verify: Check padlock in browser

### Performance Optimization

1. **Enable Vercel Speed Insights**
   ```bash
   npm install @vercel/speed-insights
   ```

2. **Enable Vercel Analytics**
   ```bash
   npm install @vercel/analytics
   ```

3. **Configure Caching**
   - Static assets: cached automatically
   - API routes: consider adding cache headers

### Monitoring Setup

**Recommended Tools:**

1. **Vercel Dashboard**
   - Real-time deployment logs
   - Performance metrics
   - Error tracking

2. **Sentry** (Error Tracking)
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

3. **PostHog** (Analytics)
   ```bash
   npm install posthog-js
   ```

4. **Uptime Monitoring**
   - [UptimeRobot](https://uptimerobot.com/) (free)
   - [Pingdom](https://www.pingdom.com/)

### Backup Strategy

1. **Database Backups**
   - Vercel Postgres: Automatic daily backups
   - External providers: Configure backup schedule
   - Test restore process monthly

2. **Code Backups**
   - GitHub is source of truth
   - Tag releases: `git tag v1.0.0 && git push --tags`

### Cost Monitoring

**Expected Monthly Costs (MVP):**
- Vercel: $0-20 (Hobby tier usually sufficient)
- Database: $0-25 (depends on provider)
- OpenAI: $10-100 (depends on usage)
- **Total**: ~$10-145/month

**Monitor:**
- OpenAI usage: [OpenAI Dashboard](https://platform.openai.com/usage)
- Vercel usage: Vercel Dashboard
- Database usage: Provider dashboard

---

## Rollback Procedure

If deployment fails or causes issues:

### Immediate Rollback
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "•••" → "Promote to Production"

### Via CLI
```bash
vercel rollback
```

### Database Rollback
```bash
# If you need to rollback migrations
npx prisma migrate resolve --rolled-back <migration-name>
```

---

## Troubleshooting

### Issue: 500 Error on API Routes
**Causes:**
- Missing environment variables
- Database connection failed
- OpenAI API error

**Debug:**
```bash
vercel logs --follow
```

**Fix:**
- Verify all env vars set
- Test database connection
- Check OpenAI API key validity

### Issue: OAuth Login Fails
**Causes:**
- Redirect URI mismatch
- Invalid OAuth credentials
- NEXTAUTH_URL incorrect

**Fix:**
1. Verify redirect URIs exactly match
2. Check OAuth credentials in env vars
3. Ensure NEXTAUTH_URL is production domain

### Issue: Database Connection Timeout
**Causes:**
- SSL mode not configured
- Connection string incorrect
- Database not accessible from Vercel

**Fix:**
- Add `?sslmode=require` to DATABASE_URL
- Verify connection string
- Check database firewall rules

### Issue: Build Fails
**Causes:**
- TypeScript errors
- Missing dependencies
- Invalid environment variables

**Fix:**
```bash
# Test locally
npm run build

# Check types
npm run type-check
```

---

## Scaling Considerations

### When to Scale

**Metrics to monitor:**
- Response time > 2 seconds
- Database CPU > 80%
- 500 errors increasing
- Monthly costs exceeding budget

### Scaling Options

**Database:**
- Upgrade to higher tier
- Add read replicas
- Implement connection pooling
- Add caching layer (Redis)

**Vercel:**
- Upgrade to Pro plan ($20/month)
- Increases: bandwidth, build minutes, team collaboration

**AI Costs:**
- Implement response caching
- Add rate limiting per user
- Consider GPT-3.5 for simple queries
- Fine-tune model for domain

---

## Maintenance Schedule

### Daily
- [ ] Check error logs
- [ ] Monitor uptime

### Weekly
- [ ] Review performance metrics
- [ ] Check OpenAI usage & costs
- [ ] Review user feedback

### Monthly
- [ ] Update dependencies
- [ ] Review security advisories
- [ ] Test backup restore
- [ ] Review and optimize database

### Quarterly
- [ ] Security audit
- [ ] Performance optimization
- [ ] Cost analysis & optimization
- [ ] Feature prioritization

---

## Emergency Contacts

**Key Services:**
- Vercel Status: https://vercel-status.com
- OpenAI Status: https://status.openai.com
- GitHub Status: https://githubstatus.com

**Support:**
- Vercel: support@vercel.com
- OpenAI: https://help.openai.com

---

## Success Criteria

Deployment is successful when:
- ✅ All health checks pass
- ✅ Authentication flow works end-to-end
- ✅ Chat functionality operational
- ✅ No errors in logs
- ✅ Response times < 2 seconds
- ✅ SSL certificate active
- ✅ Custom domain working (if applicable)
- ✅ Monitoring tools active

---

**Ready to deploy?** Follow the checklist step-by-step and you'll have a production-ready application! 🚀
