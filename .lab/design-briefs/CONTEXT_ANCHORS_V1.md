# CONTEXT ANCHORS v1.0 - DESIGN DOCUMENT

**Project:** Voyager
**Feature:** Context Anchors (Document Upload & Management)
**Version:** 1.0 (MVP)
**Date:** 2025-11-09
**Team:** Jordan (Designer), Priya (PM), Kai (CTO), Marcus (Backend)
**Status:** ✅ APPROVED - READY FOR IMPLEMENTATION

---

## EXECUTIVE SUMMARY

**What:** Context Anchors are persistent documents that users upload to inform AI conversations within a voyage. Documents are voyage-specific, parsed to markdown, and can be edited collaboratively via Shipwright.

**Why:** Users need to provide rich context (resumes, job descriptions, research papers, code files) without pasting walls of text into chat. Context Anchors make AI conversations deeply personalized and actionable.

**User Need (Isaac's words):**
> "I need to upload my resume and job description and get genuine help with it. I want to prepare for my Sophie interview. Upload context easily, drag and drop anywhere, get real help."

**Output:**
- **Inputs:** Context Anchor documents (resume, JD, research)
- **Outputs:** Edited artifacts via Shipwright (resume PDF, cover letter, LinkedIn post)

**Scope:**
- v1.0: Document upload, storage, display, Shipwright editing, PDF export
- Future: Website scraping, multi-document RAG, version history

---

## USER STORY

```
As a Voyager user,
When I need the AI to understand my personal context,
I upload documents (resume, JD, research) as Context Anchors,
So that every conversation is informed by my specific situation,
And I can collaboratively edit those documents via Shipwright to create polished outputs.
```

**Success Criteria:**
- User can drag-and-drop documents anywhere in the app
- Documents parse to markdown and display in sidebar
- AI references context in every response
- User can edit via Shipwright and export as PDF
- Documents persist across conversations (voyage-specific)

---

## THE UNIVERSAL PATTERN

Context Anchors integrate with our existing Voyager architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    VOYAGER CORE                         │
│                                                         │
│  INPUTS              PROCESS              OUTPUTS       │
│  ───────────────     ───────────────     ─────────────  │
│                                                         │
│  Context Anchors  →  Shipwright Mode  →  Artifacts     │
│  (Documents)         (AI Collab)         (Exports)     │
│                                                         │
│  • Resume.pdf        • Conversational    • Resume.pdf  │
│  • Job_Desc.pdf        refinement        • CoverLtr.pdf│
│  • Research.docx     • Live preview      • LinkedIn.txt│
│  • Code_file.py      • Markdown editor   • Email.txt   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Integration with existing features:**

| Feature | Relationship to Context Anchors |
|---------|--------------------------------|
| **Shipwright** | Edits Context Anchors → Creates Output Artifacts |
| **Collab Spaces** | Context Anchors shared with space collaborators |
| **Navigator** | References Context Anchors in conversation |
| **Cartographer** | Extracts insights → Adds to community knowledge |

---

## TECHNICAL ARCHITECTURE

### Database Schema

```typescript
model ContextAnchor {
  id            String   @id @default(cuid())
  userId        String
  communityId   String   // Voyage-specific
  filename      String
  fileType      String   // pdf, docx, txt, md
  contentMarkdown String @db.Text  // Parsed content
  originalUrl   String?  // If stored in blob storage
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User     @relation(fields: [userId], references: [id])

  @@index([userId, communityId])
}

model OutputArtifact {
  id            String   @id @default(cuid())
  userId        String
  communityId   String
  artifactType  String   // resume, post, email, abstract, etc.
  filename      String
  contentMarkdown String @db.Text  // Markdown source
  outputUrl     String?  // PDF in blob storage
  conversationId String? // Link to Shipwright session
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User     @relation(fields: [userId], references: [id])

  @@index([userId, communityId])
}
```

### API Endpoints

```typescript
// Upload document
POST /api/context-anchors/upload
Request: FormData { file, communityId }
Response: { anchor: ContextAnchor }

// List user's context anchors for voyage
GET /api/context-anchors?communityId=careersy
Response: { anchors: ContextAnchor[] }

// Delete context anchor
DELETE /api/context-anchors/:id
Response: { success: boolean }

// Update context anchor (via Shipwright)
PATCH /api/context-anchors/:id
Request: { contentMarkdown: string }
Response: { anchor: ContextAnchor }

// Export artifact as PDF
POST /api/output-artifacts/export
Request: { contentMarkdown, artifactType, filename }
Response: { pdfUrl: string }

// List user's output artifacts
GET /api/output-artifacts?communityId=careersy
Response: { artifacts: OutputArtifact[] }
```

### Document Parsing Strategy

```typescript
// File upload → Markdown conversion
async function parseDocument(file: File): Promise<string> {
  const fileType = file.name.split('.').pop()?.toLowerCase()

  switch (fileType) {
    case 'pdf':
      return await parsePDF(file)  // Use pdf-parse library
    case 'docx':
      return await parseDOCX(file)  // Use mammoth library
    case 'txt':
    case 'md':
      return await file.text()  // Direct text extraction
    default:
      throw new Error('Unsupported file type')
  }
}

// Libraries needed:
// - pdf-parse: Extract text from PDFs
// - mammoth: Convert .docx to markdown
// - md-to-pdf: Generate PDFs from markdown (for exports)
```

### Markdown to PDF Generation

```typescript
// For Resume exports, use ATS-friendly template
async function generatePDF(markdown: string, template: 'resume' | 'letter' | 'generic'): Promise<Buffer> {
  const htmlTemplate = applyTemplate(markdown, template)

  // Use puppeteer or md-to-pdf
  const pdf = await mdToPdf({ content: htmlTemplate })
  return pdf.content
}

// Template styling:
// - Resume: Clean, single-column, ATS-optimized
// - Letter: Business letter format
// - Generic: Simple document layout
```

---

## UX DESIGN

### Sidebar Layout (Updated)

```
┌─────────────────────────────────┐
│ CAREERSY WINGMAN               │  ← Community title
├─────────────────────────────────┤
│                                 │
│ 📄 CONTEXT ANCHORS              │
│                                 │
│ ┌─────────────────────────────┐│
│ │  Drop files here or         ││  ← Drag-and-drop zone
│ │  click to browse            ││
│ │                             ││
│ │  📄 PDF, DOCX, TXT, MD      ││
│ └─────────────────────────────┘│
│                                 │
│ 📝 Resume.pdf                   │  ← Uploaded documents
│    └─ [Edit] [Remove]           │
│                                 │
│ 📋 Job_Description.pdf          │
│    └─ [Edit] [Remove]           │
│                                 │
│ 🏢 Company_Research.txt         │
│    └─ [Edit] [Remove]           │
│                                 │
├─────────────────────────────────┤
│                                 │
│ 📦 OUTPUTS                      │  ← Output artifacts
│                                 │
│ 📄 Resume_Sophie_Tailored.pdf  │
│    └─ [Download] [Copy]         │
│                                 │
│ 📝 Cover_Letter_Sophie.pdf     │
│    └─ [Download] [Copy]         │
│                                 │
│ 💼 LinkedIn_Launch_Post.txt    │
│    └─ [Copy]                    │
│                                 │
├─────────────────────────────────┤
│                                 │
│ 💬 CONVERSATIONS                │
│                                 │
│ └─ Interview Prep              │
│ └─ Resume Feedback             │
│                                 │
└─────────────────────────────────┘
```

**Key Design Decisions:**
1. **Context Anchors at top** - Most important for AI quality
2. **Outputs in middle** - Easy access to created artifacts
3. **Conversations at bottom** - Standard Voyager pattern
4. **Clear separation** - Visual hierarchy with section headers

---

## DRAG-AND-DROP ANYWHERE

### Implementation Strategy

```typescript
// Global drag-and-drop handler
// Attached to root <body> element

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  showDropZone()  // Highlight drop zone overlay
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  const files = Array.from(e.dataTransfer?.files || [])

  // Filter supported file types
  const supported = files.filter(file =>
    /\.(pdf|docx|txt|md)$/i.test(file.name)
  )

  if (supported.length > 0) {
    uploadFiles(supported)
  } else {
    showError('Unsupported file type. Please upload PDF, DOCX, TXT, or MD files.')
  }

  hideDropZone()
}
```

### Drop Zone Overlay

When user drags file over app, show full-screen overlay:

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│         📄 Drop files here      │
│                                 │
│    Upload to Context Anchors    │
│                                 │
│     PDF • DOCX • TXT • MD       │
│                                 │
│                                 │
└─────────────────────────────────┘
```

**Specs:**
- Background: Semi-transparent overlay (rgba(0,0,0,0.8))
- Text: White, large (24px), centered
- Icon: 48px document icon
- Border: Dashed border (2px, accent color)
- Animation: Gentle pulse on border
- Appears: On dragenter
- Disappears: On drop or dragleave

---

## SHIPWRIGHT INTEGRATION

### Editing Context Anchors via Shipwright

**User Flow:**
1. User uploads `Resume.pdf` → Parses to markdown → Stored as Context Anchor
2. User: "I want to tailor my resume for the Sophie role"
3. User uploads `Job_Description_Sophie.pdf` → Stored as Context Anchor
4. AI: "Let's refine your resume together. Ready?" → Shipwright activates
5. **Shipwright modal opens:**
   - **Left:** Chat with AI
   - **Right:** Markdown editor showing resume
   - **Bottom:** [Export PDF] [Save Draft] [Copy Markdown]

6. Conversational editing:
   - User: "Make bullet 3 more metric-focused"
   - AI updates markdown → User sees change live
   - User: "Perfect, continue"

7. Export:
   - User: "Export as PDF"
   - AI generates PDF using ATS-optimized template
   - Saved to "Outputs" section: `Resume_Sophie_Tailored.pdf`

### Shipwright Modal Layout (Updated for Context Anchors)

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Navigator         SHIPWRIGHT MODE: Resume Editing             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────┐  ┌───────────────────────┐ │
│  │  💬 CONVERSATION               │  │  📝 RESUME           │ │
│  │                                │  │                       │ │
│  │  ┌──────────────────────────┐ │  │  ┌─────────────────┐ │ │
│  │  │ 🤖 AI                    │ │  │  │ # Isaac Smith   │ │ │
│  │  │ Let's make bullet 3 more │ │  │  │                 │ │ │
│  │  │ metric-focused. What     │ │  │  │ ## Experience   │ │ │
│  │  │ impact did you have?     │ │  │  │                 │ │ │
│  │  └──────────────────────────┘ │  │  │ **Senior Eng.** │ │ │
│  │                                │  │  │ • Built X       │ │ │
│  │  ┌──────────────────────────┐ │  │  │ • Led team of Y │ │ │
│  │  │ 👤 You                   │ │  │  │ • Shipped Z     │ │ │
│  │  │ We increased conversion  │ │  │  │                 │ │ │
│  │  │ by 40%                   │ │  │  └─────────────────┘ │ │
│  │  └──────────────────────────┘ │  │                       │ │
│  │                                │  │  💡 ATS-Optimized     │ │
│  │  [Scrollable conversation]     │  │     Template          │ │
│  │                                │  │                       │ │
│  │  ┌──────────────────────────┐ │  │  ┌─────────────────┐ │ │
│  │  │ Type reply...        [→] │ │  │  │  Export PDF     │ │ │
│  │  └──────────────────────────┘ │  │  └─────────────────┘ │ │
│  └────────────────────────────────┘  │  ┌─────────────────┐ │ │
│                                       │  │  Save Draft     │ │ │
│                                       │  └─────────────────┘ │ │
│                                       │  ┌─────────────────┐ │ │
│                                       │  │  Copy Markdown  │ │ │
│                                       │  └─────────────────┘ │ │
│                                       │                       │ │
│                                       │  💾 Auto-saved       │ │
│                                       └───────────────────────┘ │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Key additions for Context Anchors:**
- **Export PDF button:** Generate ATS-optimized PDF from markdown
- **Markdown preview:** Right pane shows rendered markdown (read-only for v1)
- **Template indicator:** Shows which template is being used (ATS-Optimized Resume)

---

## COMMUNITY-SPECIFIC CONFIGURATIONS

Each voyage defines what Context Anchors and Outputs are relevant:

### Careersy (Career Coaching)

```json
{
  "communityId": "careersy",
  "contextAnchors": {
    "enabled": true,
    "supportedTypes": ["pdf", "docx", "txt", "md"],
    "suggestedUploads": [
      "📝 Your resume",
      "📋 Job description",
      "🏢 Company research"
    ]
  },
  "shipwright": {
    "artifactTypes": [
      {
        "type": "resume",
        "label": "Resume",
        "template": "ats-optimized",
        "outputFormat": "pdf",
        "icon": "📄"
      },
      {
        "type": "cover-letter",
        "label": "Cover Letter",
        "template": "business-letter",
        "outputFormat": "pdf",
        "icon": "📝"
      },
      {
        "type": "linkedin-post",
        "label": "LinkedIn Post",
        "template": "plain-text",
        "outputFormat": "text",
        "icon": "💼"
      },
      {
        "type": "recruiter-email",
        "label": "Recruiter Email",
        "template": "email",
        "outputFormat": "text",
        "icon": "📧"
      }
    ]
  }
}
```

### Code Mentor (Programming Education)

```json
{
  "communityId": "code-mentor",
  "contextAnchors": {
    "enabled": true,
    "supportedTypes": ["py", "js", "ts", "txt", "md"],
    "suggestedUploads": [
      "💻 Your code file",
      "📋 Error log",
      "📚 Assignment requirements"
    ]
  },
  "shipwright": {
    "artifactTypes": [
      {
        "type": "code-review",
        "label": "Code Review",
        "template": "markdown",
        "outputFormat": "md",
        "icon": "🔍"
      },
      {
        "type": "refactored-code",
        "label": "Refactored Code",
        "template": "code",
        "outputFormat": "text",
        "icon": "✨"
      }
    ]
  }
}
```

### Academic Writing

```json
{
  "communityId": "academic-writing",
  "contextAnchors": {
    "enabled": true,
    "supportedTypes": ["pdf", "docx", "txt", "md"],
    "suggestedUploads": [
      "📚 Research papers",
      "📝 Notes",
      "🔗 Citations"
    ]
  },
  "shipwright": {
    "artifactTypes": [
      {
        "type": "abstract",
        "label": "Abstract",
        "template": "academic",
        "outputFormat": "pdf",
        "icon": "📄"
      },
      {
        "type": "conference-proposal",
        "label": "Conference Proposal",
        "template": "academic",
        "outputFormat": "pdf",
        "icon": "🎤"
      }
    ]
  }
}
```

---

## INTERACTION FLOWS

### Flow 1: First-Time Upload (Drag & Drop)

```
1. User drags Resume.pdf over app
   → Full-screen drop zone appears
   → "Drop files here - Upload to Context Anchors"

2. User drops file
   → Drop zone disappears
   → Upload progress indicator appears in sidebar
   → "Uploading Resume.pdf... 50%"

3. Document parses
   → Progress: "Parsing document... 80%"
   → Markdown extraction happens server-side

4. Success!
   → Document appears in Context Anchors section
   → "📝 Resume.pdf" with [Edit] [Remove] buttons
   → AI automatically references it in next response

5. AI acknowledges in chat
   → "I've reviewed your resume. I see you have 5 years of
      software engineering experience. What would you like
      to work on?"
```

### Flow 2: Editing Resume via Shipwright

```
1. User: "I want to tailor my resume for the Sophie interview"

2. AI: "Great! I can see your resume and the job description
       you uploaded. Let's refine it together. Ready?"

3. User: "Yes"

4. Shipwright modal opens
   → Left: Conversation continues
   → Right: Resume markdown displayed
   → AI: "Let's start with your summary. What aspects of your
          experience are most relevant to Sophie's needs?"

5. Conversational editing (3-5 exchanges)
   → User describes changes
   → AI updates markdown in real-time
   → User sees changes live

6. User: "This looks perfect"

7. AI: "Excellent! Would you like to export as PDF?"

8. User: "Yes"

9. PDF generation
   → AI generates PDF using ATS-optimized template
   → "Generating PDF... Done!"
   → Saved to Outputs: "Resume_Sophie_Tailored.pdf"
   → [Download] [Copy Markdown] buttons appear

10. User downloads or copies
    → Can use immediately for application
```

### Flow 3: Multiple Context Anchors (Interview Prep)

```
1. User uploads:
   → Resume.pdf → Context Anchor
   → Job_Description_Sophie.pdf → Context Anchor
   → Company_Info_Sophie.txt → Context Anchor

2. AI in Navigator mode:
   → "I've reviewed your resume, the Sophie role, and their
      company info. Let me prepare some interview questions
      based on this context."

3. AI generates personalized interview questions
   → References specific skills from resume
   → Aligns with job requirements
   → Incorporates company culture insights

4. User practices answers

5. User: "Can you help me draft an email to the recruiter?"

6. Shipwright activates (recruiter-email artifact)
   → AI drafts personalized email
   → References specific role details
   → Professional tone

7. User: "Perfect, copy to clipboard"
   → Copies text
   → Pastes into Gmail
   → Sends
```

### Flow 4: Removing Context Anchor

```
1. User uploads wrong document
   → "Old_Resume_2023.pdf" appears in Context Anchors

2. User clicks [Remove]
   → Confirmation modal: "Remove Old_Resume_2023.pdf from
      Context Anchors? This cannot be undone."

3. User confirms
   → Document removed from database
   → Disappears from sidebar
   → AI no longer references it

4. AI acknowledges (if in active conversation)
   → "I've removed Old_Resume_2023.pdf from context. Let me
      know if you'd like to upload an updated version."
```

---

## MOBILE DESIGN

### Sidebar on Mobile (Drawer)

Mobile sidebar is a drawer that slides in from left:

```
┌─────────────────────────────────┐
│  [☰]  CAREERSY WINGMAN         │  ← Hamburger menu
└─────────────────────────────────┘
│                                 │
│  Main chat interface            │
│                                 │
│                                 │
```

**When hamburger tapped:**

```
┌─────────────────────────────────┐
│  [×]  MENU                      │  ← Close button
├─────────────────────────────────┤
│                                 │
│ 📄 CONTEXT ANCHORS              │
│                                 │
│ [+ Upload Document]             │  ← Upload button
│                                 │
│ 📝 Resume.pdf                   │
│    └─ Edit • Remove             │
│                                 │
│ 📋 Job_Desc.pdf                 │
│    └─ Edit • Remove             │
│                                 │
├─────────────────────────────────┤
│                                 │
│ 📦 OUTPUTS                      │
│                                 │
│ 📄 Resume_Sophie.pdf            │
│    └─ Download • Copy           │
│                                 │
├─────────────────────────────────┤
│                                 │
│ 💬 CONVERSATIONS                │
│                                 │
│ └─ Interview Prep              │
│                                 │
└─────────────────────────────────┘
```

### Drag-and-Drop on Mobile

**Mobile doesn't support drag-and-drop natively, so:**

```
┌─────────────────────────────────┐
│ 📄 CONTEXT ANCHORS              │
│                                 │
│ ┌─────────────────────────────┐│
│ │                             ││
│ │    Tap to upload files      ││
│ │                             ││
│ │    📄 PDF, DOCX, TXT, MD    ││
│ │                             ││
│ └─────────────────────────────┘│
│                                 │
```

**On tap:** Opens native file picker
- iOS: Files app integration
- Android: File manager integration

### Shipwright on Mobile (Full-Screen)

Mobile Shipwright uses progressive disclosure (like original spec):

**Stage 1: Conversation**
```
┌─────────────────────────────────┐
│  ← Back    SHIPWRIGHT           │
├─────────────────────────────────┤
│  💬 CONVERSATION                │
│                                 │
│  AI and user messages...        │
│                                 │
│  [Scroll to see draft below]    │
│                                 │
└─────────────────────────────────┘
```

**Stage 2: Draft Appears Below**
```
│  [Scrolled down]                │
├─────────────────────────────────┤
│  📝 YOUR RESUME                 │
├─────────────────────────────────┤
│                                 │
│  Markdown preview...            │
│                                 │
│  [Export PDF]  [Save Draft]     │
│                                 │
│  💾 Auto-saved                  │
└─────────────────────────────────┘
│  ┌────────────────────────────┐│
│  │ Type reply...         [→]  ││
│  └────────────────────────────┘│
└─────────────────────────────────┘
```

---

## PDF GENERATION (ATS-Optimized Templates)

### Template: ATS-Optimized Resume

**Design Principles:**
- Single column (ATS-friendly)
- Clear section headers
- Consistent formatting
- Standard fonts (Arial, Calibri, or system default)
- No tables or complex layouts
- Bullet points for readability
- White space for scanning

**Markdown Structure:**
```markdown
# [Name]
[Email] • [Phone] • [LinkedIn] • [Location]

## Professional Summary
[2-3 sentence summary]

## Experience

**[Job Title]** | [Company] | [Dates]
- [Achievement with metric]
- [Achievement with metric]
- [Achievement with metric]

**[Job Title]** | [Company] | [Dates]
- [Achievement with metric]
- [Achievement with metric]

## Education

**[Degree]** | [Institution] | [Year]
- [Relevant details]

## Skills
[Skill Category]: Skill, Skill, Skill
[Skill Category]: Skill, Skill, Skill
```

**PDF Styling (CSS):**
```css
/* ATS-Optimized Resume Template */
body {
  font-family: Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.4;
  color: #000;
  max-width: 8.5in;
  margin: 0.5in auto;
}

h1 {
  font-size: 18pt;
  font-weight: bold;
  margin-bottom: 0.2in;
  text-align: center;
}

h2 {
  font-size: 12pt;
  font-weight: bold;
  margin-top: 0.2in;
  margin-bottom: 0.1in;
  border-bottom: 1px solid #000;
}

p {
  margin: 0.05in 0;
}

ul {
  margin: 0.05in 0;
  padding-left: 0.3in;
}

li {
  margin: 0.05in 0;
}

strong {
  font-weight: bold;
}
```

### Template: Cover Letter

**Structure:**
```markdown
[Your Name]
[Your Address]
[Your Email] • [Your Phone]
[Date]

[Hiring Manager Name]
[Company Name]
[Company Address]

Dear [Hiring Manager Name],

[Opening paragraph: Why this role excites you]

[Body paragraph 1: Relevant experience and achievements]

[Body paragraph 2: Why you're a great fit]

[Closing paragraph: Call to action]

Sincerely,
[Your Name]
```

---

## ERROR HANDLING & EDGE CASES

### Case 1: Unsupported File Type
**Trigger:** User uploads .exe, .zip, or other unsupported file
**Behavior:** Show error toast: "Unsupported file type. Please upload PDF, DOCX, TXT, or MD files."
**UI:** File is not added to Context Anchors

### Case 2: File Too Large
**Trigger:** User uploads 50MB PDF
**Behavior:** Show error: "File too large. Maximum size is 10MB."
**Recommendation:** Ask user to compress or split document

### Case 3: Parsing Failure
**Trigger:** Corrupted PDF or complex .docx with tables/images
**Behavior:**
- Show warning: "We had trouble parsing this document. Some formatting may be lost."
- Still store what was extracted
- User can manually edit markdown via Shipwright

### Case 4: Empty Document
**Trigger:** User uploads blank PDF
**Behavior:**
- Document uploads successfully
- Markdown is empty
- AI acknowledges: "I see you uploaded [filename], but it appears to be empty. Would you like to upload a different version?"

### Case 5: Duplicate Filename
**Trigger:** User uploads "Resume.pdf" twice
**Behavior:**
- Show confirmation: "You already have a file named Resume.pdf. Replace it?"
- [Replace] [Keep Both] [Cancel]
- If "Keep Both": Append timestamp to filename (Resume_2.pdf)

### Case 6: Network Interruption During Upload
**Trigger:** Connection drops mid-upload
**Behavior:**
- Show error: "Upload interrupted. Please try again."
- Allow retry
- File is not added to Context Anchors

### Case 7: PDF Generation Failure
**Trigger:** Server error during markdown → PDF conversion
**Behavior:**
- Show error: "PDF generation failed. You can still copy the markdown or try again."
- [Retry] [Copy Markdown] buttons
- Don't lose user's work

### Case 8: Too Many Context Anchors
**Trigger:** User uploads 20+ documents
**Behavior (v1):** No limit, but warn if context size > 50k tokens
**Behavior (Future):** Implement smart context windowing or RAG

---

## ACCESSIBILITY

### Keyboard Navigation
- Tab order: Upload button → Document list → Edit/Remove buttons → Output list → Download/Copy buttons
- Enter on document: Opens in Shipwright
- Delete key on document (when focused): Remove confirmation
- Drag-and-drop keyboard alternative: Upload button activates file picker

### Screen Reader
- Announce uploads: "Uploading Resume.pdf... Complete"
- Announce parsing: "Parsing document... Done"
- Announce document list: "Context Anchors: 3 documents"
- Label all buttons with aria-label
- Mark sidebar sections with aria-label="Context Anchors section"

### Focus States
- All interactive elements have visible focus ring
- Focus ring: 2px solid accent color, 2px offset
- Upload drop zone has focus state for keyboard users

### Touch Targets
- Minimum: 44x44px (iOS guidelines)
- All buttons meet this requirement
- Edit/Remove buttons: 40px height, adequate spacing

---

## PERFORMANCE

### Loading States
- **File upload:** Progress bar (0-100%)
- **Parsing:** Spinner with "Parsing document..."
- **PDF generation:** Spinner with "Generating PDF..."
- **Download:** Browser native download progress

### Optimization
- **Debounce auto-save in Shipwright:** 2 seconds
- **Lazy load documents:** Only parse on upload, not every page load
- **Cache parsed markdown:** Store in database, don't re-parse
- **Optimize PDF generation:** Generate on-demand, cache for 24 hours
- **Compress uploads:** Client-side compression before upload (if >5MB)

### Target Metrics
- **Upload time:** <5 seconds for typical 1-2MB resume
- **Parse time:** <3 seconds
- **PDF generation:** <5 seconds
- **First paint (sidebar with documents):** <2 seconds

---

## FUTURE ENHANCEMENTS (Post v1.0)

### v1.1: Website Scraping
- User pastes URL (e.g., company website)
- Server fetches and parses content
- Adds as Context Anchor
- AI references website content

### v1.2: Multi-Document RAG
- When context exceeds token limits
- Use RAG to surface relevant chunks
- Vector embeddings for semantic search
- Only inject relevant context per message

### v1.3: Version History
- Track edits to Context Anchors
- Show revision history
- Restore previous versions
- Diff view between versions

### v1.4: Collaborative Context
- In Collab Spaces, share Context Anchors with space members
- Participants can view each other's documents (with permission)
- Collective context informs all responses

### v1.5: Smart Templates
- User-created templates
- Community-shared templates
- Template marketplace
- Custom PDF styling

---

## TESTING CHECKLIST

### Functional Testing
- [ ] Upload PDF via drag-and-drop
- [ ] Upload DOCX via browse button
- [ ] Upload TXT via drag-and-drop
- [ ] Upload MD via browse button
- [ ] Parsing extracts text correctly (PDF)
- [ ] Parsing extracts text correctly (DOCX)
- [ ] Document appears in sidebar
- [ ] AI references document in conversation
- [ ] Edit button opens Shipwright
- [ ] Remove button deletes document
- [ ] Shipwright editing updates markdown
- [ ] Export PDF generates ATS-optimized template
- [ ] Download button works
- [ ] Copy button copies markdown
- [ ] Outputs appear in Outputs section

### Mobile Testing
- [ ] Sidebar drawer works
- [ ] Upload button opens file picker
- [ ] Documents display correctly
- [ ] Shipwright progressive disclosure works
- [ ] PDF download works on mobile
- [ ] Copy to clipboard works on mobile

### Desktop Testing
- [ ] Drag-and-drop anywhere works
- [ ] Drop zone overlay appears
- [ ] Sidebar shows all sections
- [ ] Shipwright side-by-side layout works
- [ ] PDF download works
- [ ] Keyboard navigation works

### Edge Cases
- [ ] Unsupported file type rejected
- [ ] Large file (>10MB) rejected
- [ ] Corrupted file handled gracefully
- [ ] Empty document handled
- [ ] Duplicate filename handled
- [ ] Network interruption handled
- [ ] PDF generation failure handled

### Performance Testing
- [ ] Upload <5 seconds (typical file)
- [ ] Parsing <3 seconds
- [ ] PDF generation <5 seconds
- [ ] Sidebar loads <2 seconds
- [ ] No memory leaks with multiple uploads

---

## SUCCESS METRICS (Post-Launch)

### Usage Metrics
- Context Anchors uploaded per user
- Documents per voyage (average)
- Shipwright sessions initiated from Context Anchors
- PDFs exported per week
- Repeat usage rate

### Quality Metrics
- User satisfaction with PDF exports
- Time saved vs manual formatting
- Interview success rate (for Careersy users)
- Artifact reuse rate (do users download multiple times?)

### Technical Metrics
- Upload success rate
- Parse success rate
- PDF generation success rate
- Average upload time
- Error rate

**Success Threshold:**
- 80%+ users upload at least one document
- 70%+ users edit via Shipwright
- 60%+ users export at least one PDF
- 4+/5 satisfaction rating
- <5% error rate

---

## IMPLEMENTATION KANBAN

### 🔲 Backlog
- Smart context windowing (RAG)
- Website scraping
- Version history
- Collaborative context (Collab Spaces)
- User-created templates

### 📋 Ready
**Micro-feature 1: Core Upload & Display**
- Database schema (ContextAnchor, OutputArtifact)
- Upload API endpoint
- File parsing (PDF, DOCX, TXT, MD)
- Sidebar display (Context Anchors section)
- Remove functionality

**Micro-feature 2: Shipwright Integration**
- Edit button → Opens Shipwright
- Markdown editor in right pane
- Conversational editing
- Auto-save to database
- Export markdown

**Micro-feature 3: PDF Generation**
- ATS-optimized resume template
- Markdown → PDF conversion
- Vercel Blob storage for PDFs
- Download functionality
- Outputs section in sidebar

**Micro-feature 4: Drag-and-Drop & Polish**
- Global drag-and-drop handler
- Drop zone overlay
- Error handling
- Loading states
- Mobile optimization

### 🚧 In Progress
_(Move here when starting work)_

### ✅ Done
_(Ship when complete, celebrate, then grab next item)_

---

## HANDOFF SUMMARY

**Ready to implement:**

✅ **Complete design specs** (mobile + desktop)
✅ **Database schema** (ContextAnchor, OutputArtifact)
✅ **API endpoints** (upload, list, delete, export)
✅ **Parsing strategy** (pdf-parse, mammoth)
✅ **PDF generation** (md-to-pdf, ATS templates)
✅ **Shipwright integration** (editing flow)
✅ **UX flows** (upload, edit, export)
✅ **Error handling** (all edge cases)
✅ **Community configs** (Careersy, Code Mentor, Academic)

**Dependencies:**
- `pdf-parse`: Parse PDFs to text
- `mammoth`: Parse DOCX to markdown
- `md-to-pdf` or `puppeteer`: Generate PDFs
- `@vercel/blob`: Store PDFs

**Estimated build time:** 3-4 weeks (4 phases)

**Questions for implementation:**
1. Confirm Vercel Blob is enabled for this project
2. Maximum file size limit? (Recommend 10MB)
3. Token limit for context? (Plan RAG for v1.2)

**Ready to build this!** 🚀

---

## GOVERNING FRAMEWORKS

### Constitutional Principles
See: `.claude/portable/CONSTITUTIONAL_PRINCIPLES.md`

- **Elevate thinking, don't replace it:** Context Anchors + Shipwright empower users to create better artifacts, teaching them what works
- **Build capability, not dependency:** Users learn resume best practices through conversational refinement
- **Be specific or acknowledge uncertainty:** AI only references documents it has actually parsed

### Beautiful Conversations
See: `.claude/portable/BEAUTIFUL_CONVERSATIONS.md`

- **Echo before expand:** "I've reviewed your resume. Let's refine it together."
- **Match depth:** User uploads document → AI gives specific, actionable feedback
- **One question:** Shipwright asks focused questions during editing
- **Create conversational space:** Pause after each edit suggestion: "Does that feel right?"

---

**END OF DESIGN DOCUMENT**

*Created by: Jordan (Designer), Priya (PM), Kai (CTO), Marcus (Backend)*
*For: Voyager Context Anchors v1.0*
*Date: 2025-11-09*
