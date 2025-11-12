# Communities

Voyager supports multiple communities, each with their own domain expertise, branding, and personality.

## Available Communities

### Careersy (default)
- **URL:** `/careersy`
- **Focus:** ANZ tech career coaching
- **Colors:** Yellow (#fad02c) & cream
- **Experts:** Eli, Isaac

### Rosarium
- **URL:** `/rosarium`
- **Focus:** Australian rose gardening and botanical care
- **Colors:** Pastel pink (#f4a9b2) & apricot
- **Experts:** Elinya

## Adding a New Community

1. Create `communities/{community-id}.json` with the community config
2. Follow the structure from existing communities (careersy.json, rosarium.json)
3. The community will automatically be available at `/{community-id}`

## Adding Users to Communities

Users need to be added to a community's member list to access it. Two ways:

### Via Prisma Studio (Development)
```bash
npx prisma studio
# Navigate to User model
# Find the user by email
# Edit the 'communities' field (JSON array)
# Add "rosarium" to the array
# Save
```

### Via Database Query (Production)
```sql
-- Add user to Rosarium
UPDATE "User"
SET communities = array_append(communities, 'rosarium')
WHERE email = 'elinya@example.com';

-- Add user to multiple communities
UPDATE "User"
SET communities = ARRAY['careersy', 'rosarium']
WHERE email = 'user@example.com';

-- Check user's communities
SELECT email, communities
FROM "User"
WHERE email = 'elinya@example.com';
```

### Via API Endpoint (Future)
*Coming soon: Admin endpoint to manage community memberships*

## Community Configuration Structure

```json
{
  "id": "community-slug",
  "name": "Display Name",
  "description": "Short description",
  "domainExpertise": {
    "role": "Expert Role Title",
    "mission": "What this expert helps with",
    "coreCapabilities": ["Capability 1", "Capability 2"]
  },
  "modes": {
    "navigator": { "behavior": "...", "style": "..." },
    "shipwright": { "behavior": "...", "style": "..." },
    "cartographer": { "behavior": "...", "style": "..." }
  },
  "experts": ["expert@email.com"],
  "branding": {
    "colors": {
      "primary": "#hex",
      "background": "#hex",
      "text": "#hex",
      "textSecondary": "#hex",
      "userMessageText": "#hex"
    },
    "logo": "/logo.webp",
    "title": "TITLE"
  }
}
```

## Testing a New Community

1. Deploy to Vercel (or run locally)
2. Add yourself to the community via database
3. Navigate to `/{community-id}`
4. Test all three modes (Navigator, Shipwright, Cartographer)
5. Verify branding colors appear correctly
6. Test Context Anchors and Shipwright document editing

## Modular Prompt System

Communities follow the modular prompt composition pattern from `PROJECT_PATTERNS.md`:

- **Base Layer:** Community domain expertise
- **Mode Layer:** Behavior variations (Navigator, Shipwright, Cartographer)
- **Context Layer:** User-specific data (resume, context anchors, conversation history)

Use `getCommunitySystemPrompt(config, { mode })` to compose prompts.
