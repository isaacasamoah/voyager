# ELI DEMO MVP - SHIPWRIGHT + COLLAB SPACES
**Demo Date:** Nov 13, 2025 @ 5:30pm
**Time Available:** ~18 hours
**Status:** Planning → Execution

---

## 🎯 GOAL

Demonstrate complete Shipwright → Output → Collab Space flow to Eli:
- User crafts artifact (message/document) with AI via `/shipwright` command
- User exports as file (.md, .pdf) OR shares to Collab Space
- Others can view and respond (read-only original, collaborative responses)

---

## 🔄 KEY UX CHANGES

### **Slash Commands > Mode Buttons**
- ❌ **Remove:** Navigator/Cartographer mode toggle buttons
- ✅ **Add:** `/shipwright` command activates Shipwright modal
- ✅ **Add:** `/collab` command (future: create/browse Collab Spaces)
- Why: Slash commands are intuitive, flexible, extensible, don't clutter UI

### **Shipwright Activation Flow**
```
User types: /shipwright

Popup menu appears:
┌─────────────────────────────────┐
│ /shipwright                     │
├─────────────────────────────────┤
│ Craft message, post, or document│
│                                 │
│ [Message/Post (default)]        │
│ [Select Context Anchor ▼]      │
│ [Drag & Drop File]              │
└─────────────────────────────────┘

1. Default: Opens Shipwright in "message" mode (blank canvas)
2. Select Context Anchor: Dropdown shows uploaded anchors → Opens with that document
3. Drag & Drop: User drops file → Parses → Opens with that content
```

**Benefits:**
- Clean UI (no persistent buttons)
- Fast (slash command → immediate modal)
- Flexible (choose message vs document on the fly)
- Discoverable (popup menu shows options)
- Extensible (easy to add more modes later)

---

## 📋 CRITICAL FEATURES (MVP for Demo)

### **1. Output Files (.md and .pdf export)**
**What:** Export button in Shipwright that generates downloadable files

**Implementation:**
- Add "Export ▼" dropdown in ShipwrightModal header
  - Export as Markdown (.md)
  - Export as PDF (.pdf) - ATS-friendly template
- POST `/api/output-artifacts/export`
  - Input: `{ contentMarkdown, artifactType, filename, conversationId }`
  - Output: `{ fileUrl, artifact }` (stored in Vercel Blob + database)
- For .md: Direct download (blob URL)
- For .pdf: Use md-to-pdf with ATS template

**Database:**
```typescript
model OutputArtifact {
  id              String   @id @default(cuid())
  userId          String
  communityId     String
  artifactType    String   // "message", "document", "resume"
  filename        String
  contentMarkdown String   @db.Text
  outputUrl       String?  // Vercel Blob URL for PDFs
  conversationId  String?  // Link to Shipwright session (voyage)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id])

  @@index([userId, communityId])
}
```

---

### **2. Output Files Storage, Display, and Interaction**
**What:** Sidebar section showing exported artifacts with download/share actions

**Implementation:**
- Add "📦 Outputs" section to sidebar (below Context Anchors)
- Display list of OutputArtifacts for current community
- Each artifact shows:
  - Filename
  - Type badge (Message/Document/Resume)
  - Created date
  - Actions: [Download] [Share to Collab Space] [Delete]
- Click artifact → Preview modal (read-only markdown)
- GET `/api/output-artifacts?communityId=X`

**UI:**
```
┌─────────────────────────────────┐
│ 📦 OUTPUTS                      │
│                                 │
│ 📄 Resume_Sophie_ATS.pdf        │
│    └─ [Download] [Share] [×]   │
│                                 │
│ 📝 Rejection_Post.md            │
│    └─ [Download] [Share] [×]   │
│                                 │
│ 💼 Recruiter_Email.md           │
│    └─ [Download] [Share] [×]   │
└─────────────────────────────────┘
```

---

### **3. /shipwright Command**
**What:** Slash command that activates Shipwright modal with smart defaults

**Implementation:**
- Detect `/shipwright` in chat input
- Show popup menu:
  - **Default:** Message/Post mode (blank canvas)
  - **Select Context Anchor:** Dropdown of uploaded anchors
  - **Drag & Drop:** Drop file anywhere to open with that content
- Opens ShipwrightModal in appropriate mode:
  - `mode: "message"` - No Context Anchor, starts blank
  - `mode: "document"` - Has Context Anchor ID, loads content
- User can switch between 🤖 AI Edits ↔ ✏️ You Edit anytime
- Export or Share when done

**Slash Command Handler:**
```typescript
// In chat input component
function handleSlashCommand(command: string) {
  if (command === '/shipwright') {
    setShowShipwrightMenu(true)
  }
}

// Menu options
const shipwrightOptions = [
  { label: 'Message/Post (blank)', action: () => openShipwright('message') },
  { label: 'Select Document', action: () => showAnchorDropdown() },
  { label: 'Drag & Drop File', action: () => enableDropZone() }
]
```

**UI Flow:**
```
1. User types: /shipwright
2. Popup appears above input
3. User selects option OR hits Enter (default = message mode)
4. Shipwright modal opens
5. User crafts with AI
6. User exports or shares
```

---

### **4. Collab Spaces - Share Crafted Work**
**What:** Ability to share Shipwright artifacts with other users (group or public)

**Implementation:**
- "Share to Collab Space" button in Shipwright
- Opens Collab Space creation modal:
  - Title (auto-suggested from artifact first line)
  - Privacy:
    - Private (invite-only)
    - Public (opt-in, discoverable)
  - Initial message: The artifact content (read-only)
- Creates new CollabSpace with artifact as first message
- Others can respond to it (collaborative conversation)
- Original artifact remains read-only (like original post in thread)

**Database:**
```typescript
model CollabSpace {
  id              String   @id @default(cuid())
  communityId     String
  creatorId       String
  title           String
  privacy         String   // "private", "public"
  status          String   // "active", "closed"
  initialArtifact String?  // OutputArtifact ID (optional)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  messages        CollabSpaceMessage[]
  members         CollabSpaceMember[]

  @@index([communityId, privacy, status])
}

model CollabSpaceMessage {
  id            String   @id @default(cuid())
  spaceId       String
  userId        String
  content       String   @db.Text
  isArtifact    Boolean  @default(false) // True for initial shared artifact
  createdAt     DateTime @default(now())

  space         CollabSpace @relation(fields: [spaceId], references: [id])

  @@index([spaceId, createdAt])
}

model CollabSpaceMember {
  id        String   @id @default(cuid())
  spaceId   String
  userId    String
  role      String   // "creator", "member"
  joinedAt  DateTime @default(now())

  space     CollabSpace @relation(fields: [spaceId], references: [id])

  @@unique([spaceId, userId])
  @@index([userId])
}
```

---

### **5. Collab Space Modal with Opt-In and Invite Users**
**What:** UI for viewing and participating in Collab Spaces

**Implementation:**
- Collab Space modal (similar to Shipwright modal, but multi-user)
- Header shows:
  - Title
  - Privacy badge (🔒 Private / 🌍 Public)
  - Member count (👥 5 members)
  - [Invite Users] button (if creator)
  - [Leave Space] button (if member)
- Main content:
  - First message is shared artifact (highlighted box, read-only)
  - Subsequent messages are responses (threaded conversation)
  - Input at bottom for new responses
- Right sidebar (collapsible on mobile):
  - Member list with avatars
  - Space metadata (created date, status)

**Invite flow:**
- Click [Invite Users] → Opens invite modal
- Search for users by name/email (within community)
- Select users → Send invite
- They get in-app notification → Can join space

**Discovery (Public spaces):**
- Add "🌍 Explore Spaces" to sidebar navigation
- Shows public Collab Spaces in current community
- Users can browse and opt-in to join

**UI:**
```
┌────────────────────────────────────────────────────────┐
│ Rejection Resilience Discussion        🌍 Public      │
│ 👥 12 members  [Invite Users]  [Leave Space]          │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ┌────────────────────────────────────────────────────┐│
│ │ 📄 ORIGINAL POST (by @eli)                        ││
│ │                                                    ││
│ │ "Getting rejected by Atlassian taught me more    ││
│ │  about resilience than landing 10 other roles..." ││
│ │                                                    ││
│ │  [Full artifact - read-only]                      ││
│ └────────────────────────────────────────────────────┘│
│                                                        │
│ 💬 @sarah: "This resonates. I got rejected by Canva  │
│            twice before they hired me as Senior PM."  │
│                                                        │
│ 💬 @marcus: "The Atlassian feedback loop is actually │
│             a gift. Most companies ghost you."        │
│                                                        │
│ [Type your response...]                         [Send]│
└────────────────────────────────────────────────────────┘
```

---

## 🎨 USER FLOW FOR ELI DEMO

### **Scenario 1: Craft Message → Share to Collab Space**
```
1. Eli types: /shipwright
2. Popup appears → Selects "Message/Post (blank)"
3. Shipwright modal opens in message mode
4. Eli types draft: "Getting rejected by Atlassian..."
5. Switches to AI mode: "How can I make this stronger?"
6. AI suggests: "Add specific lesson learned, tighten opening"
7. Eli switches to manual mode, applies changes
8. Clicks "Share to Collab Space"
9. Modal opens:
   - Title: "Rejection Resilience Discussion"
   - Privacy: Public
   - [Create Space]
10. Space is created with post as first message (read-only)
11. Other Careersy members see it in "🌍 Explore Spaces"
12. They join and respond with their own stories
13. Knowledge compounds in community
```

### **Scenario 2: Edit Resume → Export PDF**
```
1. Eli types: /shipwright
2. Popup appears → Selects "Select Document"
3. Dropdown shows: "Resume.pdf"
4. Selects it → Shipwright opens with resume loaded
5. Collaborates with AI on bullet points
6. Switches to manual mode to refine specific wording
7. Clicks "Export ▼" → "Export as PDF"
8. PDF generates with ATS template
9. Downloads to send to client
```

### **Scenario 3: Quick Export Without Editing**
```
1. Eli has context anchor: "Cover_Letter.md"
2. Types: /shipwright
3. Selects document from dropdown
4. Immediately clicks "Export as PDF" (no edits needed)
5. Downloads and sends to client
```

---

## 📊 WHAT THIS DEMONSTRATES

**To Eli:**
- ✅ `/shipwright` is fast and intuitive (no UI clutter)
- ✅ Works for both messages AND documents
- ✅ You can export polished work (PDF for clients, MD for yourself)
- ✅ You can share knowledge with your community
- ✅ Collab Spaces turn individual wisdom into collective knowledge
- ✅ Privacy control (private coaching vs public community wisdom)

**Product-Market Fit Validation:**
- Does Eli use `/shipwright` for client messages?
- Does he share artifacts to Collab Spaces?
- Do Careersy members join and engage in spaces?
- Does this feel like "elevation" or "replacement"?
- Is slash command UX better than mode buttons?

---

## 🛠️ IMPLEMENTATION PLAN

### **Phase 1: Outputs (4 hours)**
- [ ] Create OutputArtifact schema + migration
- [ ] POST `/api/output-artifacts/export` endpoint
- [ ] .md export (Vercel Blob storage + direct download)
- [ ] .pdf export (md-to-pdf with ATS template + Vercel Blob)
- [ ] Add "Export ▼" dropdown to ShipwrightModal
- [ ] Test: Export from document editing

### **Phase 2: Outputs Display (2 hours)**
- [ ] Add "📦 Outputs" section to sidebar
- [ ] GET `/api/output-artifacts?communityId=X` endpoint
- [ ] Display list with type badges and actions
- [ ] [Download] action (direct download from Blob URL)
- [ ] [Delete] action
- [ ] Preview modal for viewing artifacts
- [ ] Test: Create → Export → View in sidebar → Download

### **Phase 3: /shipwright Command (4 hours)**
- [ ] Remove Navigator/Cartographer mode buttons from UI
- [ ] Detect `/shipwright` in chat input
- [ ] Show popup menu with options:
  - Message/Post (blank)
  - Select Context Anchor (dropdown)
  - Drag & Drop File (enable drop zone)
- [ ] Refactor ShipwrightModal to accept:
  - `mode: "message" | "document"`
  - `anchorId?: string` (optional)
- [ ] Message mode: No Context Anchor, starts blank
- [ ] Document mode: Loads from Context Anchor
- [ ] Add drag-and-drop file handling anywhere in modal
- [ ] Test: `/shipwright` → Select each option → Export

### **Phase 4: Collab Spaces Backend (4 hours)**
- [ ] Create CollabSpace, CollabSpaceMessage, CollabSpaceMember schemas
- [ ] Run `prisma migrate dev`
- [ ] POST `/api/collab-spaces` (create space with initial artifact)
- [ ] POST `/api/collab-spaces/:id/messages` (add response message)
- [ ] POST `/api/collab-spaces/:id/members` (invite users)
- [ ] GET `/api/collab-spaces?communityId=X` (list spaces)
- [ ] GET `/api/collab-spaces/:id` (get space + messages + members)
- [ ] DELETE `/api/collab-spaces/:id/members/:userId` (leave space)

### **Phase 5: Collab Spaces UI (5 hours)**
- [ ] Create CollabSpaceModal component
- [ ] "Share to Collab Space" flow (from Shipwright)
  - Title input (auto-suggested)
  - Privacy toggle (Private/Public)
  - [Create Space] button
- [ ] Collab Space conversation view:
  - First message = artifact (highlighted, read-only)
  - Subsequent messages = responses (threaded)
  - Input for new responses
- [ ] Invite users modal (search + select)
- [ ] "🌍 Explore Spaces" sidebar section
  - List public spaces
  - [Join] button for each space
- [ ] Test: Share → Invite → Respond → Browse → Join

### **Phase 6: Polish & Testing (2 hours)**
- [ ] Error handling (network failures, validation)
- [ ] Loading states (spinners, disabled buttons)
- [ ] Empty states ("No outputs yet", "No spaces yet")
- [ ] Mobile responsive check
- [ ] Test full flow end-to-end with Careersy

---

## ⚠️ OUT OF SCOPE (Post-Demo)

**Not building for this demo:**
- Real-time updates (polling is fine for demo)
- Editing shared artifacts (read-only for now)
- Notifications system (manual checking is fine)
- Full mobile optimization (desktop-first demo)
- Evaluation framework (next critical feature after demo)
- `/collab` command (can manually browse spaces for demo)

---

## 🎯 SUCCESS CRITERIA

**Demo is successful if:**
1. Eli types `/shipwright` and it feels intuitive
2. Eli can craft a message with AI and export as .md/.pdf
3. Eli can select a Context Anchor and export as PDF
4. Eli can share an artifact to a Collab Space (public)
5. Eli can invite Careersy members to a private space
6. Members can respond to shared artifacts
7. Eli says: "This is useful for my coaching practice"
8. Eli prefers slash commands over mode buttons

---

## 📅 TIMELINE

**6pm Nov 12 → 2am Nov 13:** Phase 1-2 (Outputs + Display)
**8am → 12pm Nov 13:** Phase 3 (/shipwright command + UI cleanup)
**12pm → 3pm Nov 13:** Phase 4 (Collab Spaces backend)
**3pm → 5pm Nov 13:** Phase 5 (Collab Spaces UI)
**5pm → 5:30pm Nov 13:** Testing, polish, demo prep
**5:30pm Nov 13:** 🎯 Demo with Eli

---

## 🔄 NEXT CRITICAL FEATURE (After Demo)

**Evaluation Framework** - Beautiful Conversational UX through constant experimentation
- Assess all prompt modules (Navigator, Shipwright, Cartographer)
- Run periodically + after prompt updates
- Data collection → Reflection → Iteration
- Ensures quality as we scale

**Location:** Find Jordan's framework from previous Beautiful Conversations work

---

**LET'S SHIP THIS.** 🚀

**Key UX Win:** Slash commands > Mode buttons. Clean, intuitive, extensible.
