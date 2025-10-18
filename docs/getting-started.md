# Getting Started with Voyager

Complete setup guide for local development.

---

## Prerequisites

- Node.js 18+ (LTS recommended)
- PostgreSQL 14+ (or Neon account)
- Git
- Code editor (VS Code recommended)

---

## Setup (5 minutes)

### 1. Clone & Install

```bash
git clone [repository-url]
cd careersy_wingman
npm install
```

### 2. Environment Variables

Create `.env.local`:

```bash
# Database (Neon)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[run: openssl rand -base64 32]"

# OAuth (Google)
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# OAuth (LinkedIn)
LINKEDIN_CLIENT_ID="your-client-id"
LINKEDIN_CLIENT_SECRET="your-client-secret"

# AI (Anthropic - Primary)
ANTHROPIC_API_KEY="sk-ant-..."

# AI (OpenAI - Fallback)
OPENAI_API_KEY="sk-..."
```

### 3. Database Setup

```bash
# Run migrations
npx prisma migrate dev

# Seed data
npx prisma db seed

# Open Prisma Studio (optional)
npx prisma studio
```

### 4. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

---

## Project Structure

```
careersy_wingman/
├── app/                    # Next.js routes (App Router)
│   ├── page.tsx           # Voyager landing
│   ├── [communityId]/     # Dynamic community pages
│   ├── api/               # API routes
│   └── login/             # Auth pages
├── components/            # React components
│   ├── chat/             # Chat interface
│   └── ui/               # Reusable UI
├── lib/                   # Business logic
│   ├── communities.ts    # Community config loader
│   ├── auth.ts           # Authentication
│   └── ai-providers.ts   # AI integration
├── communities/           # Community configs (JSON)
│   ├── careersy.json
│   └── voyager.json
├── prisma/               # Database
│   └── schema.prisma     # DB schema
├── middleware.ts         # Custom domain routing
└── docs/                 # Documentation
```

---

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Edit code
- Test locally
- Commit frequently

### 3. Test

```bash
# Build check
npm run build

# Type check
npx tsc --noEmit

# Run tests (when available)
npm test
```

### 4. Push & Deploy

```bash
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

Creates automatic Vercel preview deployment.

---

## Common Tasks

### Add a New Community

1. Create `/communities/community-id.json`:
```json
{
  "id": "community-id",
  "name": "Community Name",
  "description": "Brief description",
  "systemPrompt": "custom",
  "customPrompt": "AI instructions...",
  "experts": ["expert@email.com"],
  "public": true,
  "allowPublicConversations": true,
  "branding": {
    "colors": {
      "primary": "#000000",
      "background": "#FFFFFF",
      "text": "#000000"
    }
  }
}
```

2. Users auto-join on next login (if public: true)
3. Access at: `/community-id`

### Debug Database Issues

```bash
# Reset database (⚠️ destroys data)
npx prisma migrate reset

# View database
npx prisma studio

# Check migrations
npx prisma migrate status
```

### Update Dependencies

```bash
npm update
npm audit fix
```

---

## OAuth Setup

### Google OAuth

1. Visit: https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID & Secret to `.env.local`

### LinkedIn OAuth

1. Visit: https://www.linkedin.com/developers/apps
2. Create app
3. Request scopes: `openid`, `profile`, `email`
4. Redirect URL: `http://localhost:3000/api/auth/callback/linkedin`
5. Copy Client ID & Secret to `.env.local`

---

## Troubleshooting

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Database Connection Issues

```bash
# Check DATABASE_URL format
echo $DATABASE_URL

# Test connection
npx prisma db push
```

### OAuth Not Working

1. Check redirect URIs match exactly
2. Verify CLIENT_ID and CLIENT_SECRET
3. Ensure NEXTAUTH_SECRET is set
4. Check NEXTAUTH_URL matches your domain

### Prisma Studio Not Loading

```bash
# Kill existing studio processes
pkill -f "prisma studio"

# Restart
npx prisma studio
```

---

## Next Steps

- Read [Architecture Overview](./architecture.md)
- Review [Community System](./communities.md)
- Explore [Custom Domains](./CUSTOM_DOMAINS.md)
- Check [Codebase Review](./CODEBASE_REVIEW.md)

---

**Need help?** Check the [operations guide](./operations.md) or review [CLAUDE.md](../CLAUDE.md) for development standards.
