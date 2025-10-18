# Community System

Complete guide to Voyager's community architecture.

---

## Overview

Communities are the core building block of Voyager. Each community is:
- **Independent** - Own branding, AI prompt, users
- **Isolated** - Data scoped to community
- **Zero-code** - Deployed via JSON config

---

## Community Configuration

### File Location
`/communities/{community-id}.json`

### Full Schema

```typescript
interface CommunityConfig {
  // Identity
  id: string                    // Unique identifier (lowercase, hyphens)
  name: string                  // Display name
  description?: string          // Brief description

  // AI Configuration
  systemPrompt: 'default' | 'custom' | 'template'
  customPrompt?: string         // Full AI instructions (if custom)
  promptConfig?: {              // Template variables (if template)
    domain: string
    expertise: string
    context: string
  }

  // Access Control
  public: boolean               // Anyone can join?
  allowPublicConversations: boolean  // Public threads allowed?
  inviteOnly?: boolean          // Require invite token?
  inviteToken?: string          // Secret token for invite link
  experts: string[]             // Expert emails (auto-join)

  // Branding
  branding?: {
    colors: {
      primary: string           // Hex color
      background: string        // Hex color
      text: string              // Hex color
    }
    logo?: string               // Path to logo file
    domains?: string[]          // Custom domains
    hideVoyagerBranding?: boolean  // White-label mode
  }
}
```

---

## Creating a Community

### 1. Create Configuration File

```bash
touch communities/my-community.json
```

### 2. Define Community

```json
{
  "id": "my-community",
  "name": "My Community",
  "description": "AI community for X enthusiasts",
  "systemPrompt": "custom",
  "customPrompt": "You are an expert in X. Help users with Y and Z. Be concise and practical.",
  "experts": ["expert@email.com"],
  "public": true,
  "allowPublicConversations": true,
  "branding": {
    "colors": {
      "primary": "#3B82F6",
      "background": "#FFFFFF",
      "text": "#000000"
    },
    "logo": "/logos/my-community.svg",
    "domains": [],
    "hideVoyagerBranding": false
  }
}
```

### 3. Add Logo (Optional)

```bash
# Place logo file
cp my-logo.svg public/logos/my-community.svg
```

### 4. Deploy

```bash
git add communities/my-community.json public/logos/my-community.svg
git commit -m "feat: add my-community"
git push
```

**That's it.** Community is live at: `voyager.ai/my-community`

---

## Community Types

### Public Community
Anyone can join, conversations are private by default.

```json
{
  "public": true,
  "inviteOnly": false,
  "allowPublicConversations": true
}
```

**Use case:** Careersy, open communities

### Private Community
Requires invite token to join.

```json
{
  "public": false,
  "inviteOnly": true,
  "inviteToken": "secret-token-123",
  "allowPublicConversations": false
}
```

**Invite link:** `voyager.ai/my-community?invite=secret-token-123`

**Use case:** Company intranets, paid communities

### White-Label Community
Private with custom domain, no Voyager branding.

```json
{
  "public": false,
  "inviteOnly": true,
  "branding": {
    "domains": ["community.acme.com"],
    "hideVoyagerBranding": true
  }
}
```

**Use case:** Enterprise clients, white-label products

---

## AI Prompt Strategies

### 1. Custom Prompt (Recommended)
Full control over AI behavior.

```json
{
  "systemPrompt": "custom",
  "customPrompt": "You are **Expert Name**, a specialist in X.\n\nYour role:\n1. Help users with Y\n2. Provide Z\n3. Never do W\n\nStyle: Concise, practical, friendly."
}
```

**Best for:** Unique communities with specific needs

### 2. Template Prompt
Use predefined template with variables.

```json
{
  "systemPrompt": "template",
  "promptConfig": {
    "domain": "Space Exploration",
    "expertise": "Astrophysics, Rocket Science",
    "context": "Focus on educational content"
  }
}
```

**Best for:** Similar communities with different domains

### 3. Default Prompt
Generic helpful assistant.

```json
{
  "systemPrompt": "default"
}
```

**Best for:** Quick testing, generic communities

---

## Permission Model

### How Users Join Communities

**Public communities:**
```typescript
// Auto-join on login
if (community.public && !community.inviteOnly) {
  await joinCommunity(user, community)
}
```

**Invite-only communities:**
```typescript
// Join via invite token
if (inviteToken === community.inviteToken) {
  await joinCommunity(user, community)
}
```

**Experts:**
```typescript
// Auto-join if email matches
if (community.experts.includes(user.email)) {
  await joinCommunity(user, community)
}
```

### Access Checks

**Community page:**
```typescript
// Check membership
if (!user.communities.includes(communityId)) {
  redirect('/?error=not-a-member')
}
```

**API routes:**
```typescript
// Validate access
if (!user.communities.includes(communityId)) {
  return 403 Forbidden
}
```

---

## Branding & Customization

### Colors

```json
{
  "branding": {
    "colors": {
      "primary": "#FA D02C",    // Buttons, accents
      "background": "#FFF9F2",  // Page background
      "text": "#000000"         // Text color
    }
  }
}
```

Applied via CSS variables:
```css
:root {
  --color-primary: #FAD02C;
  --color-background: #FFF9F2;
  --color-text: #000000;
}
```

### Logo

```json
{
  "branding": {
    "logo": "/logos/community.svg"
  }
}
```

**Requirements:**
- SVG format (scales well)
- Transparent background
- Max size: 200x200px
- Place in: `public/logos/`

### Custom Domains

See [Custom Domains Guide](./custom-domains.md) for full setup.

```json
{
  "branding": {
    "domains": [
      "community.acme.com",
      "acme.voyager.ai"
    ]
  }
}
```

### White-Label Mode

Hide all Voyager branding:

```json
{
  "branding": {
    "hideVoyagerBranding": true
  }
}
```

**Hides:**
- Voyager logo/wordmark
- "Powered by Voyager" footer
- Platform references in UI

---

## Data Isolation

### Database Scoping

All data is scoped to communities:

```sql
-- Conversations
SELECT * FROM conversations
WHERE communityId = 'careersy'
AND userId = 'user-id';

-- Public threads
SELECT * FROM conversations
WHERE communityId = 'careersy'
AND isPublic = true;
```

### Privacy Guarantees

- ✅ Users can only see their own private conversations
- ✅ Public threads visible to community members only
- ✅ Experts see all conversations in their communities
- ✅ No cross-community data leakage

---

## Expert Features

### Auto-Join
Experts automatically join their communities on login.

```json
{
  "experts": [
    "expert1@email.com",
    "expert2@email.com"
  ]
}
```

### Future: Expert Permissions
```json
{
  "experts": [
    {
      "email": "expert@email.com",
      "permissions": ["view_all", "moderate", "edit_prompt"]
    }
  ]
}
```

---

## Scaling Considerations

### Current Limits (MVP)
- **Communities:** Unlimited
- **Users per community:** 10K (optimal)
- **Conversations:** Unlimited
- **Messages:** Unlimited

### When to Optimize

| Metric | Threshold | Action |
|--------|-----------|--------|
| Total communities | >1000 | Add Redis cache for configs |
| Users per community | >10K | Migrate to CommunityMember table |
| Concurrent users | >5K | Add read replicas |
| Storage | >100GB | Move to S3 for attachments |

---

## Testing Communities

### Local Testing

1. Create config: `communities/test-community.json`
2. Restart dev server: `npm run dev`
3. Visit: `localhost:3000/test-community`

### Preview Deployment

1. Push to branch: `git push origin feature/new-community`
2. Vercel auto-deploys preview
3. Test at: `[preview-url]/community-id`

### Production

1. Merge to `develop`: Review changes
2. Merge to `main`: Deploy to production
3. Monitor: Check Vercel logs

---

## Community Migration

### Moving Users Between Communities

```typescript
// Manual script
await prisma.user.update({
  where: { id: userId },
  data: {
    communities: {
      push: 'new-community-id'
    }
  }
})
```

### Archiving Communities

```json
{
  "id": "archived-community",
  "public": false,
  "inviteOnly": true,
  // Users can still access, no new members
}
```

### Deleting Communities

```bash
# 1. Export data
npx prisma db export --community=old-community

# 2. Remove config
rm communities/old-community.json

# 3. Clean database (optional)
DELETE FROM conversations WHERE communityId = 'old-community';

# 4. Deploy
git push
```

---

## Best Practices

### Naming
- **ID:** Lowercase, hyphens: `my-community`
- **Name:** Title case: `My Community`
- **File:** Match ID: `my-community.json`

### Prompts
- Be specific about role and expertise
- Define clear boundaries (what NOT to do)
- Include example interactions
- Keep under 1000 words

### Branding
- Use web-safe colors
- Test contrast (WCAG AA minimum)
- SVG logos for scaling
- Consistent naming in paths

### Security
- Rotate invite tokens periodically
- Review expert list regularly
- Monitor for abuse

### Performance
- Keep configs under 10KB
- Optimize logos (< 50KB)
- Use color codes, not names

---

## Examples

### Careersy (Public)
```json
{
  "id": "careersy",
  "name": "Careersy Coaching",
  "public": true,
  "experts": ["eli@careersy.com"],
  "branding": {
    "colors": {
      "primary": "#FAD02C",
      "background": "#FFF9F2",
      "text": "#000000"
    },
    "domains": ["careersy.voyager.ai"]
  }
}
```

### Voyager (Platform)
```json
{
  "id": "voyager",
  "name": "Voyager",
  "public": true,
  "allowPublicConversations": false,
  "customPrompt": "You are the Voyager Navigator...",
  "branding": {
    "colors": {
      "primary": "#000000",
      "background": "#FFFFFF",
      "text": "#000000"
    }
  }
}
```

### Enterprise (White-Label)
```json
{
  "id": "acme-corp",
  "name": "ACME Corp",
  "public": false,
  "inviteOnly": true,
  "inviteToken": "SECRET",
  "branding": {
    "domains": ["community.acme.com"],
    "hideVoyagerBranding": true,
    "colors": {
      "primary": "#FF6600",
      "background": "#FFFFFF",
      "text": "#000000"
    }
  }
}
```

---

## References

- [Custom Domains](./custom-domains.md)
- [Architecture](./architecture.md)
- [Getting Started](./getting-started.md)

---

**Last Updated:** 2025-10-19
**Version:** 1.0.0
