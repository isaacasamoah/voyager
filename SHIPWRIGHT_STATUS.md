# Shipwright Status - November 2025

## Current State

**Status**: Working but not demo-ready. Recommend not including in Eli demo.

## What's Working

✅ **Chat Interface**
- Clean modal UI with split pane (chat + preview)
- Loading dots animation while AI responds
- Markdown rendering (bold, italic, code)
- Conversation history maintained

✅ **Streaming Preview**
- Real-time updates stream to preview pane as AI generates content
- Saves previous version for undo
- Smooth UX - you see changes happening live

✅ **Full Document Updates**
- AI can regenerate entire document
- Changes save to database
- Preview updates correctly

✅ **Document Context**
- Shipwright has access to all user's uploaded documents
- Can reference resume, job descriptions, etc.
- Maintains context across conversation

## What's Not Working Reliably

❌ **Surgical Section Updates**
- Goal: Update only specific sections (e.g., "Work Experience") without rewriting entire document
- Problem: Section matching is brittle and inconsistent
- Root cause: AI doesn't always follow the format for header-based matching
- Symptoms:
  - "Controller already closed" errors
  - Section updates fail silently
  - AI sometimes provides updates for non-existent sections

❌ **Completion Messages**
- Goal: "Finished - check the preview, what do you think?"
- Problem: Only appears when `markdown_update` event fires, which doesn't always happen
- Workaround needed: Show completion message on every done event

## Technical Debt

### Architecture Issues

1. **Streaming Coordination Complexity**
   - Chat stream and document updates happen simultaneously
   - State machine for filtering UPDATED_SECTION from chat is fragile
   - Race condition between stream completion and document processing

2. **Surgical Update Matching**
   - Header-based approach is theoretically sound
   - But relies on AI following exact format consistently
   - Conversation history can "poison" the AI with old instructions
   - Clearing conversations helps, but not a sustainable solution

3. **Event Timing**
   - `markdown_update` event sent after stream closes → controller errors
   - Try/catch wrappers mask the problem but don't solve it
   - Need to send events BEFORE closing controller

### Code Quality

- `/home/isaac/voyager/app/api/shipwright/chat/route.ts:459-550` - Complex surgical update logic happens after stream completion
- `/home/isaac/voyager/components/chat/ShipwrightModal.tsx:98-228` - Streaming state management is complex with many flags

## Recommended Next Steps (Post-Demo)

### Option A: Simplify to Full Document Updates Only
- Remove surgical updates entirely
- AI always regenerates full document
- Simpler, more reliable
- Trade-off: Slower for small changes
- Effort: ~30 minutes

### Option B: Async Document Updates
- Separate chat from document updates
- Add "Apply" button to trigger updates
- Updates happen in background, non-blocking
- Cleaner separation of concerns
- Effort: ~1-2 hours

### Option C: Rebuild with Clean Architecture
- Fresh start with proper state machine
- Separate streaming pipelines for chat vs documents
- Event-driven architecture
- Effort: ~3-4 hours

## Demo Strategy

**For Eli Demo**: Don't show Shipwright.

**Focus on**:
- Core Careersy chat experience (mode switching, beautiful conversations)
- A/B testing infrastructure
- Domain expertise in action
- Resume context awareness

**If asked about Shipwright**:
> "We've built a document editing agent called Shipwright - it's working but we're refining the UX. It does real-time resume editing with AI coaching. We want to perfect the experience before showing it."

## A/B Test Configuration (Verified Working)

✅ **Basic Mode**: GPT-4o + Domain Expertise ONLY
- No Voyager Constitution
- No Beautiful Conversations
- Clean baseline for measuring impact

✅ **Full Voyager Mode**: Claude Sonnet 4.5 + Constitution + Beautiful Conversations
- All modules active
- Runtime toggle working (`abTestMode` parameter)
- Debug logs confirm correct configuration

## Recent Improvements Completed

- ✅ Loading dots animation
- ✅ Fixed empty grey box issue
- ✅ Markdown rendering
- ✅ Excluded Beautiful Conversations from basic A/B mode
- ✅ Implemented header-based surgical updates (needs more testing)
- ✅ Added streaming preview updates
- ✅ Cleared all conversations for fresh testing

## Files Modified This Session

1. `/home/isaac/voyager/components/chat/ShipwrightModal.tsx` - Chat UI, streaming, message handling
2. `/home/isaac/voyager/lib/communities.ts` - A/B test configuration, Beautiful Conversations exclusion
3. `/home/isaac/voyager/app/api/shipwright/chat/route.ts` - Backend surgical updates, streaming logic
4. Database: Cleared all conversations via Prisma

## Testing Checklist (Post-Demo)

- [ ] Test surgical updates with fresh conversation
- [ ] Verify completion message appears consistently
- [ ] Test undo functionality
- [ ] Test with long documents (>1000 lines)
- [ ] Test with documents missing standard sections
- [ ] Test error handling when AI provides invalid section
- [ ] Test mobile responsive design
- [ ] Load testing with concurrent Shipwright sessions

---

**Last Updated**: 2025-11-13
**Session**: Pre-Eli Demo Prep
