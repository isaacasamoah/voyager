# Quick Setup Guide

## 🚀 Fast Track (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:
- **DATABASE_URL**: Your PostgreSQL connection string
- **NEXTAUTH_SECRET**: Run `openssl rand -base64 32`
- **GOOGLE_CLIENT_ID** & **GOOGLE_CLIENT_SECRET**: From [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- **LINKEDIN_CLIENT_ID** & **LINKEDIN_CLIENT_SECRET**: From [LinkedIn Developers](https://www.linkedin.com/developers/apps)
- **OPENAI_API_KEY**: From [OpenAI Platform](https://platform.openai.com/api-keys)

### 3. Setup Database
```bash
# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 4. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📋 Detailed OAuth Setup

### Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (or select existing)
3. Navigate to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
4. Configure consent screen if prompted
5. Application type: **Web application**
6. Add Authorized redirect URI:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.vercel.app/api/auth/callback/google`
7. Copy **Client ID** and **Client Secret**

### LinkedIn OAuth Configuration

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click "Create app"
3. Fill in app details:
   - App name: AI Career Coach
   - LinkedIn Page: Your company page (or create one)
   - Privacy policy URL: Your policy URL
   - App logo: Upload a logo
4. Navigate to "Auth" tab
5. Add Redirect URLs:
   - Development: `http://localhost:3000/api/auth/callback/linkedin`
   - Production: `https://your-domain.vercel.app/api/auth/callback/linkedin`
6. Request OAuth 2.0 scopes: `openid`, `profile`, `email`
7. Copy **Client ID** and **Client Secret** from "Application credentials"

---

## 🗄️ Database Options

### Option 1: Local PostgreSQL (Development)
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb ai_career_coach

# Connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_career_coach"
```

### Option 2: Docker PostgreSQL
```bash
docker run --name postgres-career-coach \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_DB=ai_career_coach \
  -p 5432:5432 \
  -d postgres:15

# Connection string
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/ai_career_coach"
```

### Option 3: Cloud Providers (Production)

**Vercel Postgres** (Recommended for Vercel deployments)
```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Create Postgres database
vercel postgres create
```

**Other Options:**
- [Neon](https://neon.tech/) - Serverless PostgreSQL (Free tier)
- [Supabase](https://supabase.com/) - Free tier with 500MB
- [Railway](https://railway.app/) - $5/month
- [ElephantSQL](https://www.elephantsql.com/) - Free tier available

---

## 🔑 OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy the key (you won't see it again!)
6. Add to `.env.local` as `OPENAI_API_KEY`

**Cost estimate:**
- GPT-4 Turbo: ~$0.01 per message
- Monthly cost: ~$10-50 depending on usage

---

## ✅ Verify Setup

Run this checklist:

```bash
# 1. Check environment variables
cat .env.local | grep -v "^#" | grep "="

# 2. Test database connection
npx prisma db pull

# 3. Check Prisma client
npx prisma generate

# 4. Start dev server
npm run dev
```

If everything works, you should see:
- ✅ No Prisma errors
- ✅ Server running on `http://localhost:3000`
- ✅ Landing page loads
- ✅ Can click "Get Started" → redirects to login
- ✅ OAuth buttons work (may redirect to consent screen)

---

## 🐛 Common Issues

### Issue: "Environment variable not found: DATABASE_URL"
**Solution:** Ensure `.env.local` exists and contains `DATABASE_URL`

### Issue: "Invalid OAuth redirect URI"
**Solution:** Verify redirect URIs in OAuth provider settings match exactly:
- Development: `http://localhost:3000/api/auth/callback/{provider}`
- Production: `https://your-domain.vercel.app/api/auth/callback/{provider}`

### Issue: Prisma client errors
**Solution:**
```bash
npx prisma generate
npm run dev
```

### Issue: "Cannot connect to database"
**Solution:**
- Verify PostgreSQL is running: `pg_isready`
- Check connection string format
- Ensure database exists

### Issue: OAuth login fails silently
**Solution:**
- Check browser console for errors
- Verify OAuth credentials are correct
- Ensure scopes are approved in provider settings

---

## 🚢 Deploy to Vercel

### One-Click Deploy

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com/new)
3. Import your GitHub repository
4. Add environment variables (same as `.env.local`)
5. Deploy!

### Manual Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
# ... add all other env vars

# Deploy to production
vercel --prod
```

### Post-Deployment

1. Update OAuth redirect URIs to production domain
2. Run migrations: `npx prisma migrate deploy`
3. Test authentication flow
4. Monitor logs: `vercel logs`

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 🆘 Need Help?

1. Check the main [README.md](./README.md)
2. Review existing issues
3. Check console/terminal errors
4. Verify all environment variables are set correctly
5. Try clearing cache: `rm -rf .next && npm run dev`
