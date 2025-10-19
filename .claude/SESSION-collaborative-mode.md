# Collaborative Mode - Session Context

**Branch:** `feature/collaborative-prompts`
**Status:** Partially implemented - ready to continue

## What We're Building

Transform Voyager from Q&A → collaborative creation space where AI helps prepare something worth sharing with the community.

**Flow:**
```
Private chat → Depth detected → Suggest collaboration → Accept/Decline
                                       ↓
                                  Public mode (Explore/Craft)
                                       ↓
                                 Prepare to share
```

## Completed ✅

### 1. Test Page (`/test-collaborative`)
- Manual testing checklist
- Documents all expected behaviors
- Registered in `/test`
- TDCP: Survives session compacting

### 2. Prompt Layers (`lib/prompts.ts`)
```typescript
DEPTH_DETECTION_LAYER(communityName) // Suggests collaboration
EXPLORE_MODE_LAYER                   // Public mode, no artifact
CRAFT_MODE_LAYER                     // Future: with artifacts

buildCollaborativePrompt()           // Injects layers
shouldSuggestCollaboration()         // Detects 6+ msgs or keywords
```

**Triggers:** 6+ messages OR keywords (create, write, draft, prepare, help me with)

### 3. Schema (`prisma/schema.prisma`)
```prisma
model Course {
  collaborationPrompted Boolean @default(false)
  collaborationDeclined Boolean @default(false)
}
```
**Note:** Migration not run - do manually when ready

## Still TODO 🚧

### 1. Chat Stream API (`app/api/chat-stream/route.ts`)
- Import prompt helpers
- Detect depth with `shouldSuggestCollaboration()`
- Layer prompts with `buildCollaborativePrompt()`
- Update `collaborationPrompted` flag when suggesting

### 2. ChatInterface UI (`components/chat/ChatInterface.tsx`)
- Detect "💡" in AI response
- Show [Yes, let's collaborate] [Not yet] buttons
- Accept: switch to public, update DB
- Decline: update `collaborationDeclined`, never ask again

### 3. API Endpoint (`app/api/conversations/route.ts`)
- Add PATCH handler for updating flags

### 4. Migration
```bash
npx prisma migrate dev --name add_collaboration_flags
```

## Key Behaviors

**Depth Detection:**
- After 6+ messages: "💡 Want to collaborate with community?"
- Or keywords detected early
- Only asks once per conversation

**Accept:**
- Switches `isPublic: true`
- Next AI response uses EXPLORE_MODE_LAYER
- Tone: "Let's prepare this together..."

**Decline:**
- Sets `collaborationDeclined: true`
- Stays private
- Never auto-suggests again
- Manual toggle still works

**Explore Mode Tone:**
- "I'm curious..."
- "What would make this valuable for others?"
- Asks vs answers
- Helps clarify, not solve

## Next Session Pickup

1. Finish chat-stream integration
2. Add UI buttons
3. Test at `/test-collaborative`
4. Iterate based on feel

## Test Checklist
Visit `/test-collaborative` to verify:
- [ ] 6+ messages triggers suggestion
- [ ] Keywords trigger early
- [ ] Accept switches mode
- [ ] Decline works
- [ ] Manual toggle independent
- [ ] Explore tone different

Quick test: Go to Careersy, chat 3+ exchanges, look for 💡
