# 🚀 Getting Started - AI Career Coach

Welcome! This guide will get you up and running in **less than 10 minutes**.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js 18+** installed ([Download](https://nodejs.org/))
- [ ] **PostgreSQL** database (local or cloud)
- [ ] **OpenAI API key** ([Get one](https://platform.openai.com/api-keys))
- [ ] **Google OAuth credentials** ([Setup](https://console.cloud.google.com/apis/credentials))
- [ ] **LinkedIn OAuth credentials** ([Setup](https://www.linkedin.com/developers/apps))

---

## ⚡ Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
```bash
# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your credentials (see below)
```

Required environment variables:
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/ai_career_coach"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
OPENAI_API_KEY="sk-..."
```

### Step 3: Setup Database & Run
```bash
# Initialize database
npx prisma migrate dev --name init

# Start development server
npm run dev
```

🎉 **Done!** Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Getting API Keys & Credentials

### 1. OpenAI API Key (2 minutes)

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy key and add to `.env.local`

**Cost**: ~$0.01 per message with GPT-4 Turbo

---

### 2. Google OAuth (5 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create new project (or select existing)
3. Enable "Google+ API"
4. Create **OAuth 2.0 Client ID**:
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy **Client ID** and **Client Secret**

---

### 3. LinkedIn OAuth (5 minutes)

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click "Create app"
3. Fill required fields:
   - App name: **AI Career Coach**
   - Company: Select or create LinkedIn page
   - Privacy policy URL: (can use placeholder for dev)
   - App logo: Upload any image
4. Go to **Auth** tab
5. Add redirect URL: `http://localhost:3000/api/auth/callback/linkedin`
6. Request scopes: `openid`, `profile`, `email`
7. Copy **Client ID** and **Client Secret**

---

### 4. PostgreSQL Database (5 minutes)

**Option A: Local PostgreSQL**
```bash
# Install (Ubuntu/Debian)
sudo apt-get install postgresql

# Create database
sudo -u postgres createdb ai_career_coach

# Connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_career_coach"
```

**Option B: Docker (Easiest)**
```bash
docker run --name postgres-career \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=ai_career_coach \
  -p 5432:5432 \
  -d postgres:15

# Connection string
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/ai_career_coach"
```

**Option C: Cloud Database (Production-Ready)**
- [Neon](https://neon.tech/) - Free tier, serverless PostgreSQL
- [Supabase](https://supabase.com/) - Free tier, 500MB
- [Railway](https://railway.app/) - $5/month

---

## 🧪 Test Your Setup

After running `npm run dev`, test each feature:

### 1. Landing Page
✅ Visit `http://localhost:3000`
✅ Should see "AI Career Coach" title
✅ Click "Get Started" → redirects to `/login`

### 2. Authentication
✅ Click "Continue with Google"
✅ Complete OAuth flow
✅ Redirected to `/chat`
✅ Session persists on refresh

### 3. Chat Interface
✅ Send message: "What's the average salary for a software engineer in Sydney?"
✅ Receive AI response within 5 seconds
✅ Message saved (check with `npx prisma studio`)

---

## 🐛 Troubleshooting

### "Environment variable not found: DATABASE_URL"
**Fix**: Ensure `.env.local` exists and contains all required variables

### "Cannot connect to database"
**Fix**:
```bash
# Test connection
npx prisma db pull

# If fails, verify DATABASE_URL format:
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

### OAuth "redirect_uri_mismatch" error
**Fix**: Ensure redirect URI in provider settings exactly matches:
- Google: `http://localhost:3000/api/auth/callback/google`
- LinkedIn: `http://localhost:3000/api/auth/callback/linkedin`

### Prisma errors after schema changes
**Fix**:
```bash
npx prisma generate
npm run dev
```

### Port 3000 already in use
**Fix**:
```bash
# Use different port
npm run dev -- -p 3001
```

---

## 📚 Next Steps

Once your app is running:

1. **Explore the Code**
   - Check `app/` for pages and API routes
   - Review `lib/` for core utilities
   - Examine `components/` for UI

2. **Read Documentation**
   - [README.md](./README.md) - Full documentation
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy to production

3. **Customize**
   - Modify system prompt in `lib/openai.ts`
   - Customize UI in `components/`
   - Add features based on your needs

4. **Deploy**
   - Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Deploy to Vercel in minutes
   - Set up monitoring

---

## 🎓 Learning Path

**Beginner? Start here:**
1. [Next.js Tutorial](https://nextjs.org/learn) (2 hours)
2. [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) (1 hour)
3. [Tailwind CSS Docs](https://tailwindcss.com/docs) (30 mins)

**Want to understand the architecture?**
1. Read [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Review data flow diagrams
3. Understand security model

**Ready to deploy?**
1. Read [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Follow pre-deployment checklist
3. Deploy step-by-step

---

## 💡 Helpful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:migrate       # Create new migration
npm run db:studio        # Open Prisma Studio (GUI)
npm run db:push          # Push schema without migration
npm run db:reset         # Reset database (DANGER)

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Check TypeScript types
npm run clean            # Clear build cache
```

---

## 🤝 Need Help?

**Resources:**
- 📖 [Project Documentation](./README.md)
- 🏗️ [Architecture Guide](./ARCHITECTURE.md)
- 🚀 [Deployment Guide](./DEPLOYMENT.md)
- 🔧 [Setup Guide](./SETUP.md)

**External Docs:**
- [Next.js](https://nextjs.org/docs)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://www.prisma.io/docs)
- [OpenAI](https://platform.openai.com/docs)

**Community:**
- Next.js Discord
- Prisma Slack
- Stack Overflow

---

## ✅ Success Criteria

You're ready to build features when:
- ✅ Dev server runs without errors
- ✅ Can log in with OAuth
- ✅ Can send/receive chat messages
- ✅ Database saves messages
- ✅ No console errors

---

**Happy coding!** 🚀

If you get stuck, check the troubleshooting section or review the comprehensive documentation in this repository.
