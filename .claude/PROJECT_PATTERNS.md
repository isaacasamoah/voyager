# Voyager Project Patterns

**Last Updated:** Nov 10, 2025
**Purpose:** Core architectural patterns for Voyager. Reference this in portable commands.

---

## Table of Contents

1. [Git Flow & Branching Strategy](#git-flow--branching-strategy)
2. [Modular Prompt Composition](#modular-prompt-composition)
3. [Model Layer Abstraction](#model-layer-abstraction)
4. [Community Configuration System](#community-configuration-system)
5. [Database Migration Workflow](#database-migration-workflow)

---

## Git Flow & Branching Strategy

### The Three-Tier Flow

```
.lab (experiments)
    ↓
  develop (integration)
    ↓
   main (production)
```

### Branch Purposes

**`.lab` branches (lab-*):**
- Rapid experimentation
- Breaking things is OK
- No CI/CD requirements
- Document learnings

**`develop` branch:**
- Integration branch for tested features
- All features merge here first
- Automatic preview deployments
- Neon database branch per deployment

**`main` branch:**
- Production code only
- Deploys to live Vercel production
- Protected branch
- Connected to main Neon database

### Experiment → Production Flow

```
1. Create lab branch: git checkout -b lab-[experiment-name]
2. Experiment freely, document in .lab/experiments/
3. If successful → Decision Funnel (.lab/README.md)
4. Create feature branch: git checkout -b feature/[name]
5. Refactor for production quality
6. PR to develop
7. Test in develop preview
8. PR to main
9. Deploy to production
```

### Rules

✅ **DO:**
- Create lab branches for experiments
- Document results in `.lab/experiments/`
- Merge to develop first, then main
- Test in preview before production
- Use conventional commits (`feat:`, `fix:`, `docs:`, etc.)

❌ **DON'T:**
- Push lab code directly to main
- Skip the develop integration step
- Merge untested code to main
- Force push to develop or main

---

## Modular Prompt Composition

### The Pattern

Voyager uses **composable, modular prompts** instead of monolithic system prompts.

```typescript
// ❌ BAD: Hardcoded, monolithic prompt
const systemPrompt = `You are a helpful assistant...`

// ✅ GOOD: Modular composition
const systemPrompt = getCommunitySystemPrompt(config, { mode: 'shipwright' })
systemPrompt += `\n\n${contextSection}`  // Add context
systemPrompt += `\n\n${modeInstructions}` // Add mode-specific rules
```

### Architecture

**Base Layer:** Community domain expertise
```typescript
config.domainExpertise = {
  role: "ANZ Tech Career Coach+",
  mission: "Help candidates land tech roles faster...",
  coreCapabilities: ["résumé optimization", "interview prep", ...]
}
```

**Mode Layer:** Behavior variations
```typescript
config.modes = {
  navigator: { /* coaching behavior */ },
  shipwright: { /* document editing behavior */ },
  cartographer: { /* knowledge extraction */ }
}
```

**Context Layer:** User-specific data
```typescript
// Resume, context anchors, conversation history
systemPrompt += `\n\nUser's Resume:\n${user.resumeText}`
systemPrompt += `\n\nContext Documents:\n${contextAnchors}`
```

### Implementation

**Location:** `lib/communities.ts`

```typescript
export function getCommunitySystemPrompt(
  config: CommunityConfig,
  options?: {
    mode?: 'navigator' | 'shipwright' | 'cartographer',
    communityId?: string
  }
): string {
  const mode = options?.mode || 'navigator'
  const expertise = config.domainExpertise
  const modeConfig = config.modes[mode]

  // Compose: Domain + Mode + Style
  return `${expertise.role}\n${expertise.mission}\n${modeConfig.behavior}...`
}
```

### Benefits

1. **Maintainability:** Change domain expertise once, all modes inherit
2. **Flexibility:** Easy to add new modes
3. **Testability:** Test each layer independently
4. **Portability:** Same pattern works across communities

---

## Model Layer Abstraction

### The Pattern

Never hardcode AI providers or models. Use **configurable model system** with unified interface.

```typescript
// ❌ BAD: Hardcoded Anthropic
const anthropic = new Anthropic({ apiKey })
const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20240620', // Hardcoded!
  ...
})

// ✅ GOOD: Abstracted, configurable
const modelConfig = getModelConfig() // Reads env DEFAULT_AI_MODEL
const response = await callAIModel(modelConfig, messages)
```

### Architecture

**Model Config:** `lib/ai-models.ts`
```typescript
export const AVAILABLE_MODELS: Record<string, ModelConfig> = {
  'claude-sonnet': {
    provider: 'anthropic',
    modelId: 'claude-sonnet-4-5-20250929',
    displayName: 'Claude Sonnet 4.5',
    maxTokens: 8192,
    temperature: 0.7,
    systemPrompt: COMMUNITY_PROMPT
  },
  'claude-haiku': { /* faster, cheaper */ },
  'gpt-4-turbo': { /* OpenAI */ }
}
```

**Provider Abstraction:** `lib/ai-providers.ts`
```typescript
// Unified interface for all providers
export async function callAIModel(
  config: ModelConfig,
  messages: ChatMessage[]
): Promise<ChatCompletionResponse>

// Streaming interface
export async function* streamAIModel(
  config: ModelConfig,
  messages: ChatMessage[]
): AsyncGenerator<string, void, unknown>
```

### Usage

```typescript
// Non-streaming
const modelConfig = getModelConfig() // Uses DEFAULT_AI_MODEL env var
const response = await callAIModel(modelConfig, messages)

// Streaming (e.g., Shipwright)
const stream = streamAIModel(modelConfig, messages)
for await (const chunk of stream) {
  // Handle streaming chunk
}
```

### Benefits

1. **Provider Flexibility:** Switch between Anthropic/OpenAI easily
2. **Model Routing:** Route tasks to appropriate models (Haiku for simple, Sonnet for complex)
3. **Cost Optimization:** Easy A/B testing of models
4. **Future-Proof:** Add new providers without changing application code

---

## Community Configuration System

### The Pattern

Everything is **community-configurable**: prompts, styling, terminology, modes.

```typescript
// ❌ BAD: Hardcoded colors
<button className="bg-blue-600 text-white">Send</button>

// ✅ GOOD: Community colors
<button style={{
  backgroundColor: branding.colors.primary,
  color: branding.colors.userMessageText
}}>Send</button>
```

### Architecture

**Community Config:** `lib/communities.ts`
```typescript
export interface CommunityConfig {
  id: string
  name: string
  domainExpertise: {
    role: string
    mission: string
    coreCapabilities: string[]
    regionalContext?: string
  }
  modes: {
    navigator: ModeConfig
    shipwright: ModeConfig
    cartographer: ModeConfig
  }
  branding: {
    colors: {
      primary: string
      background: string
      text: string
      textSecondary: string
      userMessageText?: string
    }
    logo?: string
    fonts?: {
      heading: string
      body: string
    }
  }
  terminology: {
    /* Community-specific terms */
  }
}
```

### Props Flow

```
ChatInterface (receives config)
  ↓ passes branding
ContextAnchors
  ↓ passes branding
ShipwrightModal
  ↓ uses colors
UI Components
```

### Implementation Pattern

**Component:**
```typescript
interface MyComponentProps {
  branding?: any // Community branding
}

export default function MyComponent({ branding }: MyComponentProps) {
  const colors = branding?.colors || {
    primary: '#000000', // Fallback
    text: '#000000'
  }

  return (
    <div style={{ color: colors.text }}>
      <button style={{ backgroundColor: colors.primary }}>
        Action
      </button>
    </div>
  )
}
```

### Benefits

1. **Multi-Tenancy:** Support multiple communities in one codebase
2. **Customization:** Each community gets their brand
3. **Consistency:** Branding flows from one source
4. **Maintainability:** Change once, applies everywhere

---

## Database Migration Workflow

### The Pattern

Schema is source of truth. Migrations are version-controlled. Never bypass them.

### Three Separate Databases (Neon)

```
LOCAL (dev machine)
  ↓ prisma migrate dev
PREVIEW (Vercel branch)
  ↓ prisma migrate deploy (automatic)
PRODUCTION (main branch)
  ↓ prisma migrate deploy (automatic)
```

### Golden Rules

✅ **ALWAYS:**
1. Edit `prisma/schema.prisma` first
2. Run `prisma migrate dev` locally
3. Commit schema + migration files together
4. Test in preview before merging to main
5. Let Vercel run migrations automatically

❌ **NEVER:**
1. Use `prisma db push` in production
2. Manually run SQL without migration
3. Commit schema without migration files
4. Ignore failed migrations
5. Force-delete migration files

### Workflow: Adding a Table

```bash
# 1. Edit schema
vim prisma/schema.prisma

# 2. Create migration
npx prisma migrate dev --name add_context_anchors

# 3. Test locally
npm run dev

# 4. Commit
git add prisma/
git commit -m "feat(db): add context anchors table"

# 5. Push to branch
git push origin feature/context-anchors

# 6. Vercel preview: migration runs automatically

# 7. Test in preview

# 8. Merge to main → production migration runs
```

### Recovery: Failed Migration

If Vercel build fails with migration error:

```bash
# 1. Create cleanup script
# app/api/migrate/cleanup/route.ts (one-time use)

# 2. Temporarily disable migrations
# package.json: "postinstall": "prisma generate"

# 3. Deploy → run cleanup endpoint

# 4. Fix migration (make idempotent)

# 5. Re-enable migrations
# package.json: "postinstall": "prisma generate && prisma migrate deploy"

# 6. Deploy again
```

### Database State Tracking

```sql
-- Check migration status
SELECT * FROM _prisma_migrations ORDER BY started_at DESC;

-- See current schema
\d+ table_name
```

---

## Quick Reference

### When Adding a Feature

1. **Start in lab branch:** `git checkout -b lab-[feature]`
2. **Use modular prompts:** `getCommunitySystemPrompt(config, { mode })`
3. **Use model abstraction:** `const config = getModelConfig()`
4. **Use community styling:** Pass `branding` prop down
5. **Schema changes:** `prisma migrate dev --name [change]`
6. **Test in preview:** Push to branch, check Vercel preview
7. **Merge to develop:** PR to develop first
8. **Test in develop preview**
9. **Merge to main:** PR to main for production

### When Debugging

1. **Check git branch:** `git branch` (should be on lab/feature branch)
2. **Check model config:** `DEFAULT_AI_MODEL` env var
3. **Check community config:** `getCommunityConfig(communityId)`
4. **Check database:** Neon dashboard → correct branch?
5. **Check migrations:** `_prisma_migrations` table

### File Locations

- **Community configs:** `lib/communities.ts`
- **Model configs:** `lib/ai-models.ts`
- **AI providers:** `lib/ai-providers.ts`
- **Database schema:** `prisma/schema.prisma`
- **Migrations:** `prisma/migrations/`
- **Experiments:** `.lab/experiments/`

---

## Pattern Checklist

Before committing code, verify:

- [ ] Uses `getCommunitySystemPrompt()` for prompts (not hardcoded)
- [ ] Uses `getModelConfig()` for AI calls (not hardcoded model)
- [ ] Accepts `branding` prop and uses community colors
- [ ] Schema changes have migration files
- [ ] Tested in preview deployment
- [ ] Follows git flow (lab → develop → main)
- [ ] Documented in appropriate README
- [ ] No hardcoded strings that should be configurable

---

**Remember:** Patterns exist to make us faster and more consistent. Follow them.

**When in doubt:** Check existing code that follows these patterns (e.g., Shipwright, Navigator).
