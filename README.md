# Voyager

> AI that elevates human thinking, preserves expert knowledge, and empowers collaboration

**Production:** https://voyager-platform.vercel.app
**Staging:** https://voyager-git-develop-isaac-asamoahs-projects.vercel.app

---

## Vision

**Core Belief:**
AI can help humans elevate each other's thinking and preserve expert knowledge, but only if it's designed to empower collaboration, not replace it.

**The World We're Building:**
Where expert knowledge isn't locked in individual minds but flows freely to elevate others. Where AI helps people think better, not think less. Where learning is collaborative elevation, not passive consumption.

### Immutable Principles

1. **Elevation Over Replacement** - AI elevates human thinking, never replaces it
2. **Knowledge Preservation** - Expert knowledge is preserved and accessible, not locked away
3. **Human-Centered Collaboration** - AI facilitates human-to-human connection and learning

---

## Current Focus

**Careersy** - Career coaching community for ANZ tech professionals

Testing hypothesis: *"Career coaches will use Voyager to extract their tacit knowledge if the interview flow takes <15 minutes and produces immediately useful outputs"*

---

## What Makes Voyager Different

### Three AI Modes

**Navigator** - Private coaching for immediate answers
- 1-on-1 conversations with AI coach
- Personalized guidance based on your context
- Instant answers to career questions

**Cartographer** - Expert knowledge extraction (experts only)
- AI interviews experts to capture tacit knowledge
- Structures insights for future learners
- Builds community knowledge base

**Shipwright** - Craft quality community posts
- AI helps draft well-structured questions
- Ensures posts are answerable and specific
- Preserves genuine curiosity and vulnerability

### Constitutional AI Framework

Every interaction is governed by core principles:
- Elevate thinking, don't replace it
- Build capability, don't create dependence
- Be honest about uncertainty
- Every sentence adds value

---

## Quick Start

```bash
# Clone and install
git clone [repository]
cd voyager
npm install

# Setup environment
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Setup database
npx prisma migrate dev

# Run development server
npm run dev
```

---

## Documentation

### Core Documents
- **[VOYAGER_VISION.md](./.claude/VOYAGER_VISION.md)** - Living document with current focus and learnings
- **[VOYAGER_CONSTITUTIONAL_FRAMEWORK.md](./.claude/VOYAGER_CONSTITUTIONAL_FRAMEWORK.md)** - AI principles implementation
- **[COLLABORATION_ROADMAP.md](./.claude/COLLABORATION_ROADMAP.md)** - Future features and phases

### Development Guides
- **[Git Workflow](./docs/git-workflow.md)** - Branching strategy
- **[Architecture](./docs/architecture.md)** - System design and patterns
- **[Communities](./docs/communities.md)** - Creating and configuring communities

### User Guides
- **[Navigator Mode](./docs/guides/user-guides/navigator-guide.md)** - 1-on-1 coaching
- **[Cartographer Mode](./docs/guides/user-guides/cartographer-guide.md)** - Expert knowledge extraction
- **[Shipwright Mode](./docs/guides/user-guides/shipwright-guide.md)** - Post crafting

### Design Briefs
- **[Design Brief Workflow](./.lab/design-briefs/README.md)** - Blue sky UI/UX exploration process
- **[Shipwright v0.2.0 Design](./.lab/design-briefs/SHIPWRIGHT_V0.2.0_HANDOFF.md)** - Production-ready spec (Phase 1)

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL + Prisma
- **Auth:** NextAuth.js (Google OAuth)
- **AI:** Anthropic Claude (Sonnet 4.5)
- **Hosting:** Vercel + Neon

---

## Architecture Highlights

### Modular Prompt System
Communities defined by JSON configuration with three layers:
1. **Domain Expertise** - Core knowledge and capabilities
2. **Mode Behavior** - Navigator, Cartographer, or Shipwright
3. **Constitutional Layer** - Immutable principles governing all interactions

### JSON-Based Communities
No database migrations needed - just create a JSON file and deploy:
```json
{
  "id": "my-community",
  "name": "My Community",
  "domainExpertise": {
    "role": "Expert Coach",
    "mission": "Help users achieve their goals",
    "coreCapabilities": ["skill 1", "skill 2"]
  },
  "modes": {
    "navigator": { "behavior": "...", "style": "..." },
    "cartographer": { "behavior": "...", "style": "..." },
    "shipwright": { "behavior": "...", "style": "..." }
  },
  "branding": {
    "colors": { "primary": "#color", "background": "#color", "text": "#color" }
  }
}
```

### Mobile-First Design
- Dynamic viewport height (dvh) for mobile browsers
- Responsive mode switcher
- Touch-optimized interactions
- Text visibility fixes for all screen sizes

---

## Project Structure

```
voyager/
├── app/                      # Next.js routes
│   ├── page.tsx             # Root (redirects to /careersy for demo)
│   ├── [communityId]/       # Dynamic community routes
│   └── api/
│       ├── chat-stream/     # Streaming chat endpoint (handles commands)
│       └── chat/            # Non-streaming chat
├── components/
│   └── chat/
│       ├── ChatInterface.tsx      # Main chat UI with command system
│       ├── ChatMessage.tsx        # Message bubbles
│       └── CommandAutocomplete.tsx # Slash command autocomplete
├── lib/
│   ├── communities.ts       # Core: Community config loader & prompt builder
│   ├── commands.ts          # Command parser (/navigator, /cartographer, etc.)
│   ├── prompts/
│   │   └── constitution.ts  # Constitutional AI framework
│   ├── terminology.ts       # Custom terminology per community
│   └── features.ts          # Feature flags (A/B testing)
├── communities/             # Community configs (git-tracked)
│   ├── careersy.json       # ANZ tech career coaching
│   └── voyager.json        # Platform navigator
├── .lab/                   # Experimentation playground
│   ├── experiments/        # Lab experiments (decision funnel)
│   │   └── 001-command-driven-modes/  # Command-based mode switching
│   └── design-briefs/      # Blue sky UI/UX exploration
│       ├── README.md       # Design brief workflow
│       └── SHIPWRIGHT_V0.2.0_HANDOFF.md  # Production-ready design spec
├── .claude/                # Documentation & context
│   ├── VOYAGER_VISION.md                    # Living document (current focus)
│   ├── VOYAGER_CONSTITUTIONAL_FRAMEWORK.md  # AI principles
│   └── COLLABORATION_ROADMAP.md             # Future phases
├── docs/                   # Developer documentation
│   ├── guides/            # User guides (Navigator, Cartographer, Shipwright)
│   ├── architecture.md    # System architecture
│   ├── communities.md     # Community config guide
│   └── git-workflow.md    # Branching strategy
└── prisma/
    └── schema.prisma
```

---

## Current State (2025-11-01)

### ✅ Shipped (v0.1.0-alpha)
- **Three-mode system** (Navigator, Cartographer, Shipwright)
- **Constitutional AI framework** with emergent meta-reasoning
- **Command-driven interface** (`/navigator`, `/cartographer`, `/shipwright`, `/help`)
- **Command autocomplete** (type `/` to see available modes)
- **Improved Cartographer UX** (one question at a time, expectation setting, opt-in depth)
- **Mobile-responsive design** (dvh, proper text scaling, touch-optimized)
- **Dynamic community branding** (JSON-configured colors, terminology)
- **The Lab** (`.lab/` folder for experiments and design briefs)

### 🚧 In Progress (Week 2: Nov 1-7)
- **Cartographer → AI enhancement pipeline** (current priority)
  - JSON output structure (knowledge extraction → machine-readable)
  - Auto-update community prompts from expert sessions
  - RAG dataset population (expert insights become retrievable)
  - Fine-tuning examples generation
- **Alpha testing with Eli** (monitoring usage patterns)

### 📦 Parked (Validated, Deferred)
- **Shipwright v0.2.0** (complete design ready, Phase 1 - needs public forum)
  - Design spec: `.lab/design-briefs/SHIPWRIGHT_V0.2.0_HANDOFF.md`
  - 10-14 hour implementation estimate
- **User Profiles** (`/profile` - needs user research validation)
- Community RAG knowledge base (prerequisite: Cartographer → AI pipeline)
- Advanced mode routing
- Voyager developer community

---

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[generate with: openssl rand -base64 32]"

# OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# AI
ANTHROPIC_API_KEY="sk-ant-..."
```

---

## Key Learnings (Week 1)

### Constitutional Framework Creates Emergent Behavior

During Careersy testing, Cartographer mode demonstrated meta-level reasoning that we didn't explicitly design. When tested with "structure this for prompts/RAG/fine-tuning", it refused to do both sides of the conversation and instead proposed "reverse knowledge extraction" - learning how modes work best by seeking feedback.

**The Insight:**
Constitutional constraints don't just limit behavior - they create emergent capabilities. By refusing to replace thinking (constitutional principle), the AI was forced to reason about its own reasoning, which generated novel approaches.

**Why This Matters:**
1. Strong principles create better AI, not worse
2. Mode constraints + constitutional framework = emergent meta-reasoning
3. Evidence of "here's what surprised me" - designed for one thing, got something better
4. Potential feature - AI systems that learn how to improve their own modes

---

## Git Workflow

**Branches:**
- `main` - Production (https://voyager-platform.vercel.app)
- `develop` - Staging (auto-deploy on push)
- Feature branches - Create from `develop`, merge back via PR

**Commits:**
```bash
git add .
git commit -m "feat: description

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin develop
```

---

## Support

- **Issues:** GitHub Issues
- **Vision Doc:** [.claude/VOYAGER_VISION.md](./.claude/VOYAGER_VISION.md)

---

## The Lab

`.lab/` is our experimentation playground with a decision funnel:

**Lab Experiment → Success → Approve → Ship to Production**

### Experiments
- Prototype features with real user testing
- Measure against success criteria
- Document learnings (what worked, what didn't)

### Design Briefs
- Blue sky UI/UX exploration (browser-only sessions, no codebase context)
- Complete design specs before implementation
- Validated by team before building

**Current Experiments:**
- ✅ `001-command-driven-modes/` (shipped to production)

**Design Briefs Ready:**
- `SHIPWRIGHT_V0.2.0_HANDOFF.md` (parked for Phase 1)

---

**Built to elevate human thinking**
**Last Updated:** 2025-11-01
