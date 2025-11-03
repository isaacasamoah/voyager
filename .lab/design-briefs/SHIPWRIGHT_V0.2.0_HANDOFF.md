# SHIPWRIGHT v0.2.0 - HANDOFF DOCUMENT

**Project:** Voyager
**Feature:** Shipwright Mode (Question Crafting)
**Version:** 0.2.0 (MVP)
**Date:** 2025-11-01
**Team:** Jordan (Designer), Priya (PM), Alex (Frontend)
**Status:** ✅ APPROVED - PARKED FOR PHASE 1 (Week 4-6)  

---

## EXECUTIVE SUMMARY

**What:** Shipwright is an AI-guided mode that helps users craft clear, specific, well-framed questions through conversational refinement.

**Why:** Traditional forums suffer from vague questions that get poor responses. Shipwright elevates question quality through AI guidance, teaching users to ask better questions over time.

**User:** Eli (coach) and his community members who want to ask questions that get high-quality responses.

**Output:** Beautifully formatted question text that can be copied to clipboard or saved for later posting.

**Scope:** MVP focuses on question crafting ONLY. Public posting, thread display, and responses are v0.3.0+.

---

## USER STORY

```
As a community member,
When I want to ask my community a question,
I use Shipwright to refine my question through AI-guided conversation,
So that my question is clear, specific, and likely to get high-quality responses.
```

**Success Criteria:**
- User completes Shipwright session in 2-5 minutes (mobile) or 5-10 minutes (desktop)
- Question quality improves (measurable by specificity, context, clarity)
- User learns what makes questions effective (elevation)
- Draft auto-saves (user never loses work)

---

## TECHNICAL ARCHITECTURE

### Component Structure

```
ShipwrightMode/
├── ShipwrightShell.tsx          (Container component)
│   ├── ShipwrightHeader.tsx     (Mode indicator, back button)
│   ├── ConversationPane.tsx     (AI ↔ User messages)
│   │   ├── MessageBubble.tsx    (Individual message)
│   │   └── MessageInput.tsx     (User reply input)
│   ├── DraftPane.tsx            (Question draft display)
│   │   ├── DraftEditor.tsx      (Editable draft text)
│   │   └── DraftActions.tsx     (Copy, Save buttons)
│   └── EmptyState.tsx           (First-time experience)
```

### State Management

```typescript
interface ShipwrightState {
  conversation: Message[];          // AI ↔ User message history
  draft: string;                    // Current question draft
  isLoading: boolean;              // AI is thinking
  draftSaved: boolean;             // Auto-save status
  error: string | null;            // Error message if any
}

interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: Date;
}
```

### API Endpoints

```
POST /api/shipwright/message
Request: { message: string, conversationId: string }
Response: { reply: string, updatedDraft: string }

POST /api/shipwright/draft
Request: { draft: string, conversationId: string }
Response: { saved: boolean, draftId: string }

GET /api/shipwright/draft/:id
Response: { draft: string, conversation: Message[] }
```

---

## MOBILE DESIGN (PRIMARY)

### Layout: Progressive Disclosure

**Stage 1: Empty State (First Time)**

```
┌─────────────────────────────────────┐
│  ← Navigator    SHIPWRIGHT          │
├─────────────────────────────────────┤
│                                     │
│                                     │
│          🚢                         │
│      Shipwright Mode                │
│                                     │
│   Craft better questions for        │
│   your community through            │
│   AI-guided conversation            │
│                                     │
│   💡 Tips for great questions:      │
│   • Be specific about your context  │
│   • Explain what you've tried       │
│   • State your goal clearly         │
│                                     │
│                                     │
│   ┌───────────────────────────┐   │
│   │   Start Crafting          │   │
│   └───────────────────────────┘   │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

**Stage 2: Conversation Started**

```
┌─────────────────────────────────────┐
│  ← Navigator    SHIPWRIGHT          │
├─────────────────────────────────────┤
│  💬 CONVERSATION                    │
│                                     │
│  ┌────────────────────────────┐   │
│  │ 🤖 AI                       │   │
│  │                             │   │
│  │ What question do you want   │   │
│  │ to ask your community?      │   │
│  │                             │   │
│  └────────────────────────────┘   │
│                                     │
│  ┌────────────────────────────┐   │
│  │ Type your reply...    [→]  │   │
│  └────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Stage 3: Draft Appears**

```
┌─────────────────────────────────────┐
│  ← Navigator    SHIPWRIGHT          │
├─────────────────────────────────────┤
│  💬 CONVERSATION                    │
│                                     │
│  ┌────────────────────────────┐   │
│  │ 🤖 AI                       │   │
│  │ Great! Let's make that more │   │
│  │ specific. What kind of      │   │
│  │ coaching do you do?         │   │
│  └────────────────────────────┘   │
│                                     │
│  ┌────────────────────────────┐   │
│  │ 👤 You                      │   │
│  │ Career coaching for mid-    │   │
│  │ level professionals         │   │
│  └────────────────────────────┘   │
│                                     │
│  [Scroll to see more...]           │
│                                     │
├─────────────────────────────────────┤
│  📝 YOUR QUESTION                   │
├─────────────────────────────────────┤
│                                     │
│  ┌────────────────────────────┐   │
│  │                             │   │
│  │ How can I transition from   │   │
│  │ software engineering to     │   │
│  │ career coaching for mid-    │   │
│  │ level professionals?        │   │
│  │                             │   │
│  └────────────────────────────┘   │
│                                     │
│  ┌──────────┐  ┌────────────┐    │
│  │ 📋 Copy  │  │ 💾 Save    │    │
│  └──────────┘  └────────────┘    │
│                                     │
│  💾 Draft auto-saved                │
│                                     │
└─────────────────────────────────────┘
│  ┌────────────────────────────┐   │
│  │ Type your reply...    [→]  │   │
│  └────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Dimensions & Spacing

**Mobile (375px width):**
- Screen padding: 16px horizontal, 24px vertical
- Conversation bubble padding: 16px
- Draft box padding: 16px
- Button height: 44px (iOS touch target)
- Input height: 48px
- Gap between messages: 12px
- Gap between sections: 24px

**Typography:**
- Headers: 20px bold
- Body text: 16px regular
- Input placeholder: 16px light gray
- Button text: 16px medium

**Colors (Generic):**
- Background: #F9FAFB (light gray)
- Text primary: #111827 (near black)
- Text secondary: #6B7280 (gray)
- AI bubble: #F3F4F6 (light gray)
- User bubble: #FFFFFF (white) with border
- Accent: #8B5CF6 (purple - placeholder)
- Border: #E5E7EB (light border)

---

## DESKTOP DESIGN (RESPONSIVE)

### Layout: Side-by-Side (>768px)

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Navigator         SHIPWRIGHT MODE                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────┐  ┌───────────────────────┐ │
│  │  💬 CONVERSATION               │  │  📝 YOUR QUESTION     │ │
│  │                                │  │                       │ │
│  │  ┌──────────────────────────┐ │  │  ┌─────────────────┐ │ │
│  │  │ 🤖 AI                    │ │  │  │                 │ │ │
│  │  │ What question do you     │ │  │  │ How can I       │ │ │
│  │  │ want to ask?             │ │  │  │ transition from │ │ │
│  │  └──────────────────────────┘ │  │  │ software to     │ │ │
│  │                                │  │  │ coaching?       │ │ │
│  │  ┌──────────────────────────┐ │  │  │                 │ │ │
│  │  │ 👤 You                   │ │  │  └─────────────────┘ │ │
│  │  │ Career coaching          │ │  │                       │ │
│  │  └──────────────────────────┘ │  │  💡 Tips:             │ │
│  │                                │  │  • Be specific        │ │
│  │  ┌──────────────────────────┐ │  │  • Add context        │ │
│  │  │ 🤖 AI                    │ │  │                       │ │
│  │  │ Let's make that specific │ │  │  ┌─────┐  ┌────────┐ │ │
│  │  └──────────────────────────┘ │  │  │Copy │  │  Save  │ │ │
│  │                                │  │  └─────┘  └────────┘ │ │
│  │  [Scrollable conversation]     │  │                       │ │
│  │                                │  │  💾 Draft auto-saved  │ │
│  │  ┌──────────────────────────┐ │  │                       │ │
│  │  │ Type reply...        [→] │ │  │                       │ │
│  │  └──────────────────────────┘ │  │                       │ │
│  └────────────────────────────────┘  └───────────────────────┘ │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Dimensions & Spacing (Desktop)

**Desktop (>768px):**
- Container max-width: 1200px
- Conversation pane: 60% width (720px max)
- Draft pane: 40% width (480px max)
- Gap between panes: 24px
- Screen padding: 32px
- Component spacing: Same as mobile

**Responsive Breakpoints:**
```css
/* Mobile first */
@media (max-width: 767px) {
  /* Stacked layout */
  /* Conversation full width */
  /* Draft below conversation */
}

@media (min-width: 768px) {
  /* Side-by-side layout */
  /* 60/40 split */
}

@media (min-width: 1024px) {
  /* Wider side-by-side */
  /* Max-width container */
}
```

---

## COMPONENT SPECIFICATIONS

### 1. ShipwrightHeader

**Purpose:** Mode indicator and navigation

**Mobile:**
```
┌─────────────────────────────────────┐
│  ← Navigator    SHIPWRIGHT          │
└─────────────────────────────────────┘
```

**Specs:**
- Height: 56px
- Background: White
- Border-bottom: 1px solid #E5E7EB
- Back button: Left aligned, 40px touch target
- Title: Centered, 18px semibold
- Padding: 16px horizontal

**States:**
- Default: Shown
- Scroll: Sticky to top

---

### 2. EmptyState

**Purpose:** First-time experience, explains Shipwright

**Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│          🚢                         │
│      Shipwright Mode                │
│                                     │
│   Craft better questions for        │
│   your community through            │
│   AI-guided conversation            │
│                                     │
│   💡 Tips for great questions:      │
│   • Be specific about your context  │
│   • Explain what you've tried       │
│   • State your goal clearly         │
│                                     │
│   ┌───────────────────────────┐   │
│   │   Start Crafting          │   │
│   └───────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Copy:**
- Title: "Shipwright Mode"
- Subtitle: "Craft better questions for your community through AI-guided conversation"
- Tips header: "💡 Tips for great questions:"
- Tip 1: "• Be specific about your context"
- Tip 2: "• Explain what you've tried"
- Tip 3: "• State your goal clearly"
- Button: "Start Crafting"

**Specs:**
- Icon: 🚢 (48px size)
- Title: 24px bold
- Subtitle: 16px regular, gray
- Tips: 14px regular, left-aligned
- Button: Primary, full width mobile, auto width desktop
- Vertical centering on viewport

---

### 3. MessageBubble (AI)

**Purpose:** Display AI messages

**Layout:**
```
┌────────────────────────────┐
│ 🤖 AI                      │
│                            │
│ What question do you want  │
│ to ask your community?     │
│                            │
└────────────────────────────┘
```

**Specs:**
- Background: #F3F4F6 (light gray)
- Border-radius: 12px
- Padding: 16px
- Max-width: 80% of container (mobile), 100% (desktop conversation pane)
- Align: Left
- Avatar: 🤖 emoji or icon (24px)
- Text: 16px regular, #111827
- Line-height: 1.5

**States:**
- Default: Shown
- Loading: Show typing indicator (three animated dots)

---

### 4. MessageBubble (User)

**Purpose:** Display user messages

**Layout:**
```
┌────────────────────────────┐
│ 👤 You                     │
│                            │
│ Career coaching for mid-   │
│ level professionals        │
│                            │
└────────────────────────────┘
```

**Specs:**
- Background: #FFFFFF (white)
- Border: 1px solid #E5E7EB
- Border-radius: 12px
- Padding: 16px
- Max-width: 80% of container (mobile), 100% (desktop)
- Align: Left (not right - keeps conversation linear)
- Avatar: 👤 emoji or user avatar (24px)
- Text: 16px regular, #111827

---

### 5. MessageInput

**Purpose:** User types replies to AI

**Layout:**
```
┌────────────────────────────────┐
│ Type your reply...        [→] │
└────────────────────────────────┘
```

**Specs:**
- Background: White
- Border: 1px solid #E5E7EB
- Border-radius: 24px (fully rounded)
- Padding: 12px 16px
- Height: 48px
- Placeholder: "Type your reply..."
- Send button: Circle, accent color, 36px
- Icon: → (arrow right)

**States:**
- Empty: Send button disabled (gray)
- Has text: Send button enabled (accent color)
- Focus: Border accent color
- Sending: Show loading spinner in send button

**Position:**
- Mobile: Fixed to bottom, 16px from edges
- Desktop: Bottom of conversation pane

---

### 6. DraftPane

**Purpose:** Display and edit the crafted question

**Layout:**
```
┌─────────────────────────────────────┐
│  📝 YOUR QUESTION                   │
├─────────────────────────────────────┤
│                                     │
│  ┌────────────────────────────┐   │
│  │                             │   │
│  │ How can I transition from   │   │
│  │ software engineering to     │   │
│  │ career coaching for mid-    │   │
│  │ level professionals?        │   │
│  │                             │   │
│  └────────────────────────────┘   │
│                                     │
│  ┌──────────┐  ┌────────────┐    │
│  │ 📋 Copy  │  │ 💾 Save    │    │
│  └──────────┘  └────────────┘    │
│                                     │
│  💾 Draft auto-saved                │
│                                     │
└─────────────────────────────────────┘
```

**Specs:**
- Header: "📝 YOUR QUESTION" (16px semibold)
- Draft box:
  - Background: White
  - Border: 1px solid #E5E7EB
  - Border-radius: 8px
  - Padding: 16px
  - Min-height: 120px (mobile), 200px (desktop)
  - Font: 16px regular
  - Line-height: 1.6
  - Editable: contenteditable or textarea
- Buttons:
  - Copy: Ghost style (border only)
  - Save: Primary style (filled)
  - Width: Equal, side-by-side
  - Height: 44px
  - Gap: 12px
- Auto-save indicator:
  - Text: "💾 Draft auto-saved"
  - Font: 14px regular, gray
  - Appears below buttons

**States:**
- Empty: Show placeholder "Your question will appear here as you refine it through conversation"
- Has content: Show draft text
- Editing: Border accent color
- Saved: Show checkmark briefly

---

### 7. DraftActions (Buttons)

**Copy Button:**
```
┌──────────┐
│ 📋 Copy  │
└──────────┘
```

**Specs:**
- Style: Ghost (border only)
- Border: 1px solid #E5E7EB
- Background: White
- Text: 16px medium
- Icon: 📋 (16px)
- Height: 44px
- Border-radius: 8px
- Hover: Border accent color
- Active: Background light accent

**Behavior:**
- Click: Copy draft text to clipboard
- Show toast: "Copied to clipboard!"
- Toast duration: 2 seconds

**Save Button:**
```
┌────────────┐
│ 💾 Save    │
└────────────┘
```

**Specs:**
- Style: Primary (filled)
- Background: Accent color
- Text: White, 16px medium
- Icon: 💾 (16px)
- Height: 44px
- Border-radius: 8px
- Hover: Darken 10%
- Active: Darken 20%

**Behavior:**
- Click: Save draft to backend
- Show indicator: "💾 Draft saved"
- Auto-save: Triggers 2 seconds after editing stops

---

## INTERACTION FLOWS

### Flow 1: First Time User

```
1. User types /shipwright in Navigator
   → Mode switches to Shipwright
   → EmptyState appears

2. User reads empty state
   → Sees tips for good questions
   → Taps "Start Crafting"

3. EmptyState fades out
   → Conversation appears
   → AI's first message: "What question do you want to ask your community?"
   → Input activates (keyboard appears on mobile)

4. User types initial question
   → Taps send
   → Message appears in conversation
   → AI thinks (loading indicator)
   → AI responds with clarifying question

5. User answers AI's question
   → Draft section appears below conversation
   → Draft shows refined question
   → Auto-save indicator appears

6. Conversation continues (2-4 exchanges)
   → Draft updates with each AI response
   → Question becomes clearer and more specific

7. User is satisfied
   → Taps "Copy" button
   → Toast: "Copied to clipboard!"
   → User can paste into forum/Slack/email

8. User wants to save for later
   → Taps "Save" button
   → Indicator: "💾 Draft saved"
   → Can return to Navigator

9. User returns to Navigator
   → Taps "← Navigator"
   → Draft auto-saves
   → Navigator resumes previous conversation
```

### Flow 2: Returning User

```
1. User types /shipwright
   → Checks for existing draft
   → If exists: Resume draft + conversation
   → If not: Empty state

2. User with saved draft
   → Conversation + draft load
   → Can continue refining
   → Or start new (needs "New Question" option)

3. User edits draft directly
   → Clicks in draft box
   → Types changes
   → Auto-save triggers after 2 seconds
   → AI can respond to manual edits: "I see you changed X. Would you like me to help refine further?"
```

### Flow 3: Error Handling

```
ERROR: API Timeout
→ Show message: "AI is taking longer than usual. Please try again."
→ Keep user's message in conversation
→ Allow retry

ERROR: Network Offline
→ Show message: "You're offline. Your draft is saved locally and will sync when you're back online."
→ Draft continues to work (local state)
→ Sync when reconnected

ERROR: Draft Save Failed
→ Show message: "Couldn't save draft. Your work is safe locally. We'll try again."
→ Retry automatically in background
→ Show success when synced
```

---

## COPY & CONTENT

### Empty State
- **Title:** "Shipwright Mode"
- **Subtitle:** "Craft better questions for your community through AI-guided conversation"
- **Tips Header:** "💡 Tips for great questions:"
- **Tip 1:** "• Be specific about your context"
- **Tip 2:** "• Explain what you've tried"
- **Tip 3:** "• State your goal clearly"
- **Button:** "Start Crafting"

### AI Prompts (Examples)
- **Initial:** "What question do you want to ask your community?"
- **Clarifying:** "Let's make that more specific. What [aspect] are you focusing on?"
- **Context:** "That's helpful! Can you tell me more about [context]?"
- **Goal:** "What are you hoping to learn or achieve by asking this?"
- **Refinement:** "Great! Here's a clearer version of your question. What do you think?"
- **Encouragement:** "This is shaping up well! Anything else you'd like to add?"

### Button Labels
- **Primary CTA:** "Start Crafting"
- **Copy:** "📋 Copy"
- **Save:** "💾 Save"
- **Edit:** "✏️ Edit Draft"
- **Back:** "← Navigator"

### Status Messages
- **Auto-save:** "💾 Draft auto-saved"
- **Copied:** "Copied to clipboard!"
- **Saved:** "💾 Draft saved"
- **Syncing:** "Syncing..."
- **Offline:** "Offline - will sync when online"

### Error Messages
- **Timeout:** "AI is taking longer than usual. Please try again."
- **Offline:** "You're offline. Your draft is saved locally and will sync when you're back online."
- **Save failed:** "Couldn't save draft. Your work is safe locally. We'll try again."
- **Generic:** "Something went wrong. Please try again."

### Placeholders
- **Input:** "Type your reply..."
- **Draft (empty):** "Your question will appear here as you refine it through conversation"

---

## EDGE CASES & ERROR STATES

### Case 1: Empty Input Submit
- **Trigger:** User taps send with empty input
- **Behavior:** Button is disabled (can't happen)
- **Fallback:** If somehow triggered, ignore

### Case 2: Very Long Message
- **Trigger:** User types 500+ character message
- **Behavior:** Accept it (no character limit yet)
- **UI:** Message bubble expands, scrollable if needed

### Case 3: Very Long Draft
- **Trigger:** Draft becomes 1000+ characters
- **Behavior:** Draft box expands vertically
- **UI:** Scrollable if exceeds max-height

### Case 4: Rapid Fire Messages
- **Trigger:** User sends messages faster than AI responds
- **Behavior:** Queue messages, process in order
- **UI:** Show loading state on each

### Case 5: Network Interruption
- **Trigger:** User loses internet mid-conversation
- **Behavior:** Store messages locally, show offline indicator
- **UI:** Banner: "Offline - will sync when online"
- **Recovery:** Auto-sync when reconnected

### Case 6: Session Timeout
- **Trigger:** User leaves Shipwright open for 30+ minutes
- **Behavior:** Draft auto-saves, conversation preserved
- **UI:** No visible change (works offline)

### Case 7: Browser Refresh
- **Trigger:** User refreshes page
- **Behavior:** Reload from saved draft + conversation
- **UI:** Resume exactly where they left off

### Case 8: Multiple Drafts (Future)
- **Current:** Only one draft at a time
- **Future:** Draft list, but not in v0.2.0
- **UI:** "New Question" button starts fresh (overwrites current)

### Case 9: Empty Draft After Conversation
- **Trigger:** AI hasn't generated draft yet
- **Behavior:** Show placeholder + tips
- **UI:** "Your question will appear here..."

### Case 10: Copy on Empty Draft
- **Trigger:** User taps Copy before draft exists
- **Behavior:** Button disabled (grayed out)
- **Fallback:** If triggered, show error: "No question to copy yet"

---

## ACCESSIBILITY

### Keyboard Navigation
- Tab order: Back button → Message input → Copy button → Save button → Edit draft
- Enter in message input: Send message
- Escape: Focus message input (from anywhere)
- Arrow keys: Navigate conversation (when focused)

### Screen Reader
- Announce new AI messages: "AI says: [message]"
- Announce draft updates: "Your question updated"
- Announce actions: "Copied to clipboard", "Draft saved"
- Label all buttons with aria-label
- Mark conversation as live region (aria-live="polite")

### Focus States
- All interactive elements have visible focus ring
- Focus ring: 2px solid accent color, 2px offset
- Focus visible on keyboard navigation only (not mouse clicks)

### Touch Targets
- Minimum: 44x44px (iOS guidelines)
- All buttons meet this requirement
- Input height: 48px (comfortable touch)

### Color Contrast
- Text on background: 4.5:1 minimum (WCAG AA)
- Button text: 4.5:1 minimum
- Placeholder text: 3:1 minimum (allowed for placeholders)

---

## PERFORMANCE

### Loading States
- **AI thinking:** Show animated dots (⋯) in message bubble placeholder
- **Draft updating:** Smooth fade transition (200ms)
- **Saving:** Brief spinner on Save button
- **Page load:** Skeleton screen while fetching saved draft

### Optimization
- **Debounce auto-save:** 2 seconds after typing stops
- **Lazy load:** Conversation history (paginated if >50 messages)
- **Optimize re-renders:** Only update draft when AI responds, not on every keystroke
- **Local first:** Save to localStorage immediately, sync to backend async

### Target Metrics
- **Time to interactive:** <2 seconds
- **First AI response:** <3 seconds
- **Auto-save:** <1 second (local) + <2 seconds (backend sync)
- **Copy to clipboard:** Instant
- **Mode switch:** <500ms

---

## TECHNICAL IMPLEMENTATION NOTES

### State Management
```typescript
// Recommended: Use React Context or Zustand for Shipwright state
const ShipwrightContext = createContext<ShipwrightState>();

// State persists across mode switches
// Draft saves to localStorage on every change
// Syncs to backend every 2 seconds (debounced)
```

### API Integration
```typescript
// Send message, get AI reply + updated draft
async function sendMessage(message: string): Promise<AIResponse> {
  const response = await fetch('/api/shipwright/message', {
    method: 'POST',
    body: JSON.stringify({ 
      message, 
      conversationId: currentConversationId 
    })
  });
  return response.json(); // { reply, updatedDraft }
}

// Auto-save draft
async function saveDraft(draft: string): Promise<void> {
  await fetch('/api/shipwright/draft', {
    method: 'POST',
    body: JSON.stringify({ 
      draft, 
      conversationId: currentConversationId 
    })
  });
}
```

### Component Reuse
- **MessageInput:** Can reuse existing Navigator input component
- **Button styles:** Use existing Voyager button variants
- **Layout wrapper:** Use existing container/max-width patterns
- **Mode switching:** Integrate with existing command system (/shipwright)

### Mobile Considerations
- **Keyboard handling:** Input should scroll into view when focused
- **Safe areas:** Respect iOS notch and Android gesture areas
- **Viewport height:** Use dvh (dynamic viewport height) not vh
- **Touch feedback:** Add active states (background color change on tap)

### Desktop Enhancements
- **Keyboard shortcuts:** Cmd+Enter to send, Cmd+C to copy (when draft focused)
- **Resize panes:** Optional - allow user to drag divider between conversation and draft
- **Hover states:** Show tooltips on buttons
- **Wider layout:** Max 1200px container, then center

---

## FUTURE ENHANCEMENTS (Post v0.2.0)

These are NOT in scope for v0.2.0 but inform architectural decisions:

### v0.3.0: Public Posting
- Add "Post to Community" button (in addition to Copy)
- Modal: "Where do you want to post?" (select community)
- Direct integration with Voyager's future public space
- Draft becomes thread in community

### v0.4.0: Shipwright for Answers
- Community members use Shipwright to craft responses
- Same conversation pattern for answers
- Helps maintain quality across responses

### v0.5.0: Multiple Drafts
- Draft management UI (list of saved drafts)
- "New Question" starts fresh draft
- Archive/delete old drafts

### v0.6.0: Artifact Shipwrighting
- Shipwright for documents (long-form content)
- Shipwright for whiteboards (visual artifacts)
- Same conversation shell, different workspace

---

## DESIGN SYSTEM INTEGRATION

### Colors (Placeholders - Adjust to Voyager's Actual Design System)

```css
/* Backgrounds */
--bg-primary: #FFFFFF;
--bg-secondary: #F9FAFB;
--bg-tertiary: #F3F4F6;

/* Text */
--text-primary: #111827;
--text-secondary: #6B7280;
--text-tertiary: #9CA3AF;

/* Borders */
--border-light: #E5E7EB;
--border-medium: #D1D5DB;

/* Accents (use Voyager's brand color) */
--accent-primary: #8B5CF6;  /* Replace with actual */
--accent-hover: #7C3AED;
--accent-active: #6D28D9;

/* Status */
--success: #10B981;
--error: #EF4444;
--warning: #F59E0B;
```

### Typography Scale

```css
/* Headings */
--text-2xl: 24px;  /* Page titles */
--text-xl: 20px;   /* Section headers */
--text-lg: 18px;   /* Mode headers */

/* Body */
--text-base: 16px;  /* Default text */
--text-sm: 14px;    /* Small text, captions */
--text-xs: 12px;    /* Tiny text, labels */

/* Weights */
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing Scale (Tailwind-style)

```
4px  = 1 unit
8px  = 2 units
12px = 3 units
16px = 4 units
24px = 6 units
32px = 8 units
48px = 12 units
```

### Border Radius

```
--radius-sm: 4px;   /* Subtle rounding */
--radius-md: 8px;   /* Default */
--radius-lg: 12px;  /* Message bubbles */
--radius-xl: 16px;  /* Cards */
--radius-full: 9999px;  /* Pills, input */
```

---

## TESTING CHECKLIST

Before shipping to production, test:

### Functional Testing
- [ ] Empty state appears on first use
- [ ] "Start Crafting" initiates conversation
- [ ] User can send messages
- [ ] AI responds within 3 seconds
- [ ] Draft appears and updates correctly
- [ ] Copy button copies to clipboard
- [ ] Save button saves draft
- [ ] Auto-save works after 2 seconds
- [ ] Return to Navigator preserves draft
- [ ] Resume from saved draft works
- [ ] Command /shipwright activates mode

### Mobile Testing
- [ ] Layout works on iPhone SE (320px)
- [ ] Layout works on iPhone 14 (390px)
- [ ] Layout works on Android (various sizes)
- [ ] Keyboard doesn't cover input
- [ ] Scroll works smoothly
- [ ] Touch targets are 44x44px minimum
- [ ] Safe areas respected (notch, gestures)

### Desktop Testing
- [ ] Side-by-side layout works (>768px)
- [ ] Conversation scrolls independently
- [ ] Draft pane is fixed/sticky
- [ ] Responsive breakpoints work
- [ ] Max-width container centers properly

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader announces messages
- [ ] Focus states visible
- [ ] Color contrast passes WCAG AA
- [ ] Touch targets meet iOS guidelines

### Performance Testing
- [ ] First render <2 seconds
- [ ] AI response <3 seconds
- [ ] Auto-save doesn't block UI
- [ ] Smooth animations (60fps)
- [ ] Works offline (with degraded sync)

### Error Testing
- [ ] Network timeout handled gracefully
- [ ] Offline mode works
- [ ] Failed save retries automatically
- [ ] Empty states display correctly
- [ ] Long content doesn't break layout

---

## SUCCESS METRICS (Post-Launch)

Track these to validate v0.2.0:

### Usage Metrics
- Shipwright sessions started per week
- Completion rate (started → copied/saved)
- Average session duration
- Messages per session (2-10 is healthy)
- Return usage rate (did they use it again?)

### Quality Metrics
- Question clarity improvement (compare pre/post Shipwright)
- Community engagement on Shipwright questions (responses, quality)
- Time saved (vs writing question manually)

### User Feedback
- NPS or satisfaction rating
- "Did Shipwright help you craft a better question?" (Yes/No)
- Open feedback: "What would make Shipwright better?"

### Technical Metrics
- API response time
- Error rate
- Auto-save success rate
- Copy to clipboard success rate

**Success Threshold:**
- 60%+ completion rate (users finish sessions)
- 70%+ return usage (users come back)
- 4+/5 satisfaction rating
- Measurable improvement in question quality

---

## HANDOFF SUMMARY

**Ready to implement in Claude Code:**

✅ **Complete design specs** (mobile + desktop)  
✅ **Component structure** (what to build)  
✅ **All copy and content** (exact text)  
✅ **Interaction flows** (step-by-step behaviors)  
✅ **Edge cases handled** (errors, offline, etc)  
✅ **Accessibility requirements** (keyboard, screen reader, contrast)  
✅ **Performance targets** (load times, animations)  
✅ **Testing checklist** (validate before ship)  

**Estimated build time:** 10-14 hours

**Questions for implementation:**
1. What's the exact accent color hex? (Replace placeholder #8B5CF6)
2. Confirm API endpoint URLs (match backend routes)
3. Confirm authentication (same as Navigator?)
4. Any existing components to reuse? (buttons, inputs, layout)

**Ready to build this in Claude Code!** 🚀

---

## APPENDIX: DESIGN RATIONALE

### Why Progressive Disclosure?
- Mobile screens are small - showing everything at once is overwhelming
- Conversation → Draft flow teaches users the value proposition
- Users focus on one thing at a time (conversation first, then draft)

### Why Not Tabs?
- Tabs hide context - users forget what AI said when editing draft
- Progressive disclosure keeps conversation visible while drafting
- Desktop side-by-side solves context problem with more space

### Why Auto-Save?
- Users never lose work (trust building)
- Removes anxiety about "saving"
- Enables seamless mode switching (Navigator ↔ Shipwright)

### Why Copy, Not Post?
- v0.2.0 validates question crafting value, not public posting
- Users can post wherever they want (Eli's forum, Slack, email)
- Public posting requires forum infrastructure (v0.3.0)

### Why AI-First, Not Template-First?
- Templates are rigid, conversation is flexible
- Users learn through interaction, not form-filling
- AI adapts to user's specific context
- Aligns with constitutional principles (elevation, not replacement)

---

**END OF HANDOFF DOCUMENT**

*Created by: Jordan (Designer), Priya (PM), Alex (Frontend)*  
*For: Voyager Shipwright v0.2.0*  
*Date: 2025-11-01*
