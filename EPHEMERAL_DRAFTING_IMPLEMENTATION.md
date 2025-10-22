# Ephemeral Drafting Implementation - Summary

**Status**: ✅ Implementation Complete - Ready for Testing
**Branch**: `develop`
**Commit**: `0e3fe27` - "feat: implement ephemeral drafting for collaborate mode"

## What We Built

A simplified, ephemeral drafting system for collaborate mode where:
- Drafts stay in React state only (not saved to DB)
- Post button is always available
- Smart parsing handles both curator-assisted and direct posting
- Clean UX with visual indicators and smooth transitions

## Key Changes

### 1. New API Endpoint
**File**: `app/api/conversations/create-public/route.ts`
- Simple endpoint for publishing posts directly
- Input: `{ title, content, communityId }`
- Validates community membership
- Creates public conversation with single message marked `isPost: true`

### 2. Smart Publishing Function
**File**: `components/chat/ChatInterface.tsx` (lines 231-347)
- `publishFromDraft()` - intelligently decides what to post:
  - **Priority 1**: If AI message has `[READY_TO_POST]` → parse `TITLE:` and `POST:` format
  - **Priority 2**: Otherwise → prompt user for title, post their message
- No more complex state tracking (curateMode, publishedPostId, etc.)

### 3. Always-Visible Post Button
**File**: `components/chat/ChatInterface.tsx` (lines 739-772)
- Shows whenever `mode === 'public' && messages.length > 0`
- No longer waits for `[READY_TO_POST]` marker
- Users can post at any time

### 4. Draft Indicator Badge
**File**: `components/chat/ChatInterface.tsx` (lines 695-702)
- Small badge on Collaborate toggle showing message count
- Only appears when draft exists: `mode === 'public' && messages.length > 0`
- Gives visual feedback about ephemeral content

### 5. Smart Confirmation
**File**: `components/chat/ChatInterface.tsx` (lines 675-682)
- Only prompts when switching away from collaborate mode WITH unsaved messages
- Silent when no content to lose
- Prevents accidental data loss

### 6. Transition Effect
**File**: `components/chat/ChatInterface.tsx` (lines 872-881)
- Spotlight/blur overlay during publishing
- Shows spinner and status: "Publishing..." → "Published!"
- Creates smooth visual transition

### 7. Ephemeral Mode Logic
**File**: `app/api/chat/route.ts` (lines 323-348)
```typescript
const isCollaborateMode = mode === 'public'
const shouldSave = communityId !== 'voyager' && !isCollaborateMode

if (shouldSave) {
  // Save to database
}
```
- Collaborate mode messages stay in React state only
- Only saved when user clicks Post button

## How It Works

### Flow 1: Direct Posting (No Curator)
1. User enables collaborate mode (toggle ON)
2. User types message and sends
3. AI responds (normal conversation)
4. User clicks **Post** button
5. System prompts: "Enter a title for your post:"
6. User enters title
7. POST to `/api/conversations/create-public` with title + user's last message
8. Spotlight effect shows "Publishing..." → "Published!"
9. Loads published post in current view

### Flow 2: Curator-Assisted Posting
1. User enables collaborate mode (toggle ON)
2. User asks for help crafting a post
3. AI (curator) responds with structured format:
   ```
   TITLE: How do mid-level engineers approach referrals?
   POST: I'm a mid-level engineer looking for advice on...
   [READY_TO_POST]
   ```
4. User clicks **Post** button
5. System automatically parses TITLE and POST
6. POST to `/api/conversations/create-public` with parsed data
7. Spotlight effect shows "Publishing..." → "Published!"
8. Loads published post in current view

## Testing Checklist

### ✅ Completed (Implementation)
- [x] Create `/api/conversations/create-public` endpoint
- [x] Implement `publishFromDraft()` with smart parsing
- [x] Update Post button to always show in collaborate mode
- [x] Add draft indicator badge
- [x] Add smart confirmation on mode toggle
- [x] Add spotlight transition effect
- [x] Update ephemeral mode logic in `/api/chat`

### ⏳ Pending (Manual Testing)
- [ ] Test direct posting flow (no curator)
- [ ] Test curator-assisted posting flow
- [ ] Verify draft indicator shows message count
- [ ] Verify smart confirmation when switching with draft
- [ ] Verify spotlight effect during publishing
- [ ] Check ephemeral drafts don't save to DB
- [ ] Verify published post appears in community feed
- [ ] Verify draft is cleared after publishing

## Files Modified

1. `app/api/conversations/create-public/route.ts` (NEW)
2. `components/chat/ChatInterface.tsx` (major updates)
3. `app/api/chat/route.ts` (ephemeral mode logic)
4. `app/api/conversations/[id]/publish/route.ts` (kept for reference)
5. `communities/careersy.json` (curator prompt format)
6. `communities/voyager.json` (curator prompt format)
7. `components/chat/ChatMessage.tsx` ([READY_TO_POST] stripping)

## Key Code References

### Smart Parsing Logic
`components/chat/ChatInterface.tsx:238-250`
```typescript
const parseStructuredPost = (content: string): { title: string; post: string } | null => {
  const titleMatch = content.match(/TITLE:\s*(.+?)(?:\n|$)/i)
  const postMatch = content.match(/POST:\s*([\s\S]+?)(?:\[READY_TO_POST\]|$)/i)
  // ...
}
```

### Publishing Flow
`components/chat/ChatInterface.tsx:258-347`
```typescript
const publishFromDraft = async () => {
  // Check for [READY_TO_POST] marker
  // Priority 1: Parse AI's structured post
  // Priority 2: Prompt for title, use user's message
  // POST to /api/conversations/create-public
  // Show spotlight effect
  // Load published post
}
```

### Draft Indicator
`components/chat/ChatInterface.tsx:695-702`
```typescript
{mode === 'public' && messages.length > 0 && (
  <div className="..." style={{ backgroundColor: fullBranding.colors.primary }}>
    {messages.length}
  </div>
)}
```

## Known Issues / Notes

- Favicon errors in dev server are benign (expected behavior)
- Old `/api/conversations/[id]/publish` endpoint still exists (kept for reference)
- Curator prompts in community configs now include structured format instructions

## Next Steps for Testing

1. **Start dev server**: `npm run dev`
2. **Navigate to**: http://localhost:3000/careersy
3. **Test Flow 1 (Direct)**:
   - Turn collaborate toggle ON
   - Send a message asking a career question
   - Wait for AI response
   - Click Post button
   - Enter a title when prompted
   - Verify spotlight effect
   - Verify post appears in feed
4. **Test Flow 2 (Curator)**:
   - Turn collaborate toggle ON (or refresh page)
   - Ask: "Help me write a post about my job search"
   - Wait for curator to respond with TITLE:/POST:/[READY_TO_POST]
   - Click Post button
   - Verify automatic publishing (no title prompt)
   - Verify spotlight effect
   - Verify post appears in feed

## Architecture Benefits

✅ **Simpler**: No complex state tracking
✅ **Clearer**: Ephemeral → publish → permanent mental model
✅ **Flexible**: Users can post with or without curator help
✅ **Safe**: Smart confirmations prevent data loss
✅ **Polished**: Visual indicators and smooth transitions

---

**Ready to continue testing on mobile!** 🚀
