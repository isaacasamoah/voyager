# Voyager Platform

> Multi-community AI platform with custom domains and white-label support

**Production:** https://careersy-wingman.vercel.app
**Staging:** https://careersy-wingman-git-develop.vercel.app

---

## Overview

Voyager is a platform for deploying AI-powered communities with zero code. Each community has its own branding, AI prompt, and user base - deployed via simple JSON configuration.

**Current Communities:**
- **Careersy** - Australian tech career coaching
- **Voyager** - Platform navigator

---

## Quick Start

### For Developers

```bash
# Clone and install
git clone [repository]
cd careersy_wingman
npm install

# Setup environment
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Setup database
npx prisma migrate dev

# Run development server
npm run dev
```

**→ Full setup guide:** [docs/getting-started.md](./docs/getting-started.md)

### For Community Creators

Create a new community in 3 steps:

1. **Create config:** `communities/my-community.json`
2. **Define community:**
   ```json
   {
     "id": "my-community",
     "name": "My Community",
     "customPrompt": "You are an expert in...",
     "public": true,
     "branding": {
       "colors": { "primary": "#3B82F6", "background": "#FFFFFF", "text": "#000000" }
     }
   }
   ```
3. **Deploy:** `git push` - that's it!

**→ Full guide:** [docs/communities.md](./docs/communities.md)

---

## Documentation

### Getting Started
- **[Setup Guide](./docs/getting-started.md)** - Local development (5 minutes)
- **[Architecture Overview](./docs/architecture.md)** - System design & decisions
- **[CLAUDE.md](./CLAUDE.md)** - AI assistant instructions

### Core Features
- **[Communities System](./docs/communities.md)** - Creating and managing communities
- **[Custom Domains](./docs/CUSTOM_DOMAINS.md)** - White-label domain setup
- **[AI Models](./docs/AI_MODEL_SYSTEM.md)** - Provider configuration

### Operations
- **[Deployment](./docs/operations.md)** - Production deployment
- **[Monitoring](./docs/operations.md#monitoring)** - Observability
- **[Troubleshooting](./docs/operations.md#troubleshooting)** - Common issues

### Development
- **[Codebase Review](./docs/CODEBASE_REVIEW.md)** - Principal engineer review (Grade: A-)
- **[Git Workflow](./GIT_WORKFLOW.md)** - Branching strategy

**→ Browse all docs:** [docs/README.md](./docs/README.md)

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL + Prisma
- **Auth:** NextAuth.js (OAuth)
- **AI:** OpenAI + Anthropic
- **Hosting:** Vercel + Neon

---

## Key Features

✅ **Zero-code community deployment** - JSON configs only
✅ **Custom domains** - White-label support
✅ **Multi-provider AI** - OpenAI + Anthropic
✅ **OAuth authentication** - Google + LinkedIn
✅ **Public & private communities** - Flexible permissions
✅ **Production-ready** - Deployed on Vercel

---

## Project Structure

```
careersy_wingman/
├── app/                    # Next.js routes (App Router)
│   ├── page.tsx           # Voyager landing
│   ├── [communityId]/     # Dynamic community pages
│   └── api/               # API routes
├── components/            # React components
│   ├── chat/             # Chat interface
│   └── ui/               # Reusable UI
├── lib/                   # Business logic
│   ├── communities.ts    # Community loader
│   ├── auth.ts           # Authentication
│   └── ai-providers.ts   # AI integration
├── communities/           # Community configs (JSON)
│   ├── careersy.json
│   └── voyager.json
├── prisma/               # Database
│   └── schema.prisma
├── middleware.ts         # Custom domain routing
└── docs/                 # Documentation
```

---

## Development

### Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npx tsc --noEmit         # Type check

# Database
npx prisma studio        # Database GUI
npx prisma migrate dev   # Create migration
npx prisma generate      # Generate client

# Deployment
git push origin develop  # Deploy to staging
git push origin main     # Deploy to production
```

### Adding a New Community

```bash
# 1. Create config
touch communities/my-community.json

# 2. Define community (see docs/communities.md)

# 3. Deploy
git add communities/my-community.json
git commit -m "feat: add my-community"
git push
```

Community is live at: `voyager.ai/my-community`

---

## Environment Variables

Required variables (see `.env.local.example`):

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[generate with: openssl rand -base64 32]"

# OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
LINKEDIN_CLIENT_ID="..."
LINKEDIN_CLIENT_SECRET="..."

# AI
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."
```

**→ Full setup:** [docs/getting-started.md](./docs/getting-started.md)

---

## Contributing

1. Read [CLAUDE.md](./CLAUDE.md) for development standards
2. Follow [Git Workflow](./GIT_WORKFLOW.md)
3. Create feature branch from `develop`
4. Open PR to `develop` (auto-deploys preview)

---

## Architecture Highlights

### JSON-Based Communities
Communities defined by configuration files, not database records.

**Benefits:**
- Instant deployment (no migrations)
- Git version control
- Zero database queries for metadata
- Developer-friendly

### Custom Domain Routing
Next.js middleware maps domains to communities.

```
community.acme.com  → /acme-corp
careersy.voyager.ai → /careersy
voyager.ai/careersy → /careersy
```

**Benefits:**
- Zero-config on Vercel
- Auto SSL certificates
- White-label ready

### Multi-Provider AI
Unified interface for OpenAI + Anthropic.

**Benefits:**
- Cost optimization
- Redundancy
- Switch providers without code changes

**→ Full architecture:** [docs/architecture.md](./docs/architecture.md)

---

## Deployment

### Staging
- Branch: `develop`
- URL: https://careersy-wingman-git-develop.vercel.app
- Auto-deploy: ✅

### Production
- Branch: `main`
- URL: https://careersy-wingman.vercel.app
- Auto-deploy: ✅

**→ Full guide:** [docs/operations.md](./docs/operations.md)

---

## Support

- **Documentation:** [docs/README.md](./docs/README.md)
- **Issues:** GitHub Issues
- **Contact:** [Your email/contact]

---

## License

MIT License

---

**Built with ❤️ for multi-community platforms**
**Last Updated:** 2025-10-19
