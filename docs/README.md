# Voyager Platform Documentation

> Multi-community platform with AI-powered conversations, custom domains, and white-label support.

## Quick Navigation

### 🚀 Getting Started
- **[Setup Guide](./getting-started.md)** - Local development setup (5 min)
- **[Architecture Overview](./architecture.md)** - System design & decisions
- **[CLAUDE.md](../CLAUDE.md)** - AI assistant instructions

### 🏗️ Core Features
- **[Communities System](./communities.md)** - JSON-based multi-tenancy
- **[Custom Domains](./CUSTOM_DOMAINS.md)** - White-label setup & routing
- **[AI Models](./AI_MODEL_SYSTEM.md)** - Provider abstraction & switching

### 🔧 Operations
- **[Deployment](./operations.md)** - Production deployment guide
- **[Monitoring](./LOGGING.md)** - Logging & observability
- **[Troubleshooting](./operations.md#troubleshooting)** - Common issues

### 📊 Development
- **[Codebase Review](./CODEBASE_REVIEW.md)** - Architecture & recommendations
- **[Git Workflow](../GIT_WORKFLOW.md)** - Branching strategy
- **[Testing](./testing.md)** - Test strategy & coverage

---

## Documentation Structure

```
docs/
├── README.md              ← You are here
├── getting-started.md     ← Setup & onboarding
├── architecture.md        ← System design
├── communities.md         ← Community system
├── operations.md          ← Deployment & monitoring
├── CUSTOM_DOMAINS.md      ← Custom domain setup
├── AI_MODEL_SYSTEM.md     ← AI provider configuration
└── CODEBASE_REVIEW.md     ← Principal engineer review
```

---

## Key Concepts

### Platform Architecture
**Voyager** is the platform. **Communities** are tenants.

```
voyager.ai              → Platform landing page
voyager.ai/careersy     → Careersy community
community.acme.com      → Custom domain → ACME community
```

### Community System
Communities are defined by JSON configs in `/communities/*.json`:

```json
{
  "id": "careersy",
  "name": "Careersy Coaching",
  "branding": {
    "colors": { ... },
    "domains": ["careersy.voyager.ai"]
  }
}
```

**No database tables for communities.** Zero-code deployment.

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL + Prisma
- **Auth:** NextAuth.js (OAuth)
- **AI:** OpenAI + Anthropic
- **Hosting:** Vercel

---

## Quick Links

| Resource | Link |
|----------|------|
| Production | https://careersy-wingman.vercel.app |
| Staging | https://careersy-wingman-git-develop.vercel.app |
| Database | Neon (serverless PostgreSQL) |
| Repository | GitHub (private) |

---

## Contributing

1. Read [CLAUDE.md](../CLAUDE.md) for development standards
2. Follow [Git Workflow](../GIT_WORKFLOW.md) for branching
3. Run tests before committing: `npm test`
4. Keep documentation updated

---

## Support

For questions or issues:
1. Check [Troubleshooting](./operations.md#troubleshooting)
2. Review [Architecture](./architecture.md)
3. Contact: [Your contact info]

---

**Last Updated:** 2025-10-19
**Version:** 1.0.0
