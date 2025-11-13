# Experiment 006: Context Anchors

**Status:** ✅ MICRO-FEATURE 1 COMPLETE | 🚧 MICRO-FEATURE 2 IN PROGRESS
**Branch:** `lab-context-anchors`
**Date Started:** Nov 9, 2025

---

## Hypothesis

**User Need (Isaac):**
> "I need to upload my resume and job description and get genuine help with it. I want to prepare for my Sophie interview. Upload context easily, drag and drop anywhere, get real help."

**Core Belief:**
Context Anchors + Shipwright = The resume/document workflow everyone wishes existed. No more formatting nightmares, no more Word wrestling. Just conversational editing → beautiful output.

**Success = When:**
- Isaac can upload resume + JD for Sophie interview
- Edit via Shipwright (conversational refinement)
- Export ATS-optimized PDF in one click
- Saves hours of formatting pain

---

## Approach

### Micro-feature 1: Core Upload & Display
- Database schema (ContextAnchor, OutputArtifact)
- Upload API endpoint
- File parsing (PDF, DOCX, TXT, MD)
- Sidebar display (Context Anchors section)
- Remove functionality

### Micro-feature 2: Shipwright Integration
- Edit button → Opens Shipwright
- Markdown editor in right pane
- Conversational editing
- Auto-save to database
- Export markdown

### Micro-feature 3: PDF Generation
- ATS-optimized resume template
- Markdown → PDF conversion
- Vercel Blob storage for PDFs
- Download functionality
- Outputs section in sidebar

### Micro-feature 4: Drag-and-Drop & Polish
- Global drag-and-drop handler
- Drop zone overlay
- Error handling
- Loading states
- Mobile optimization

---

## Success Criteria

1. **Upload works:** Drag PDF → parses to markdown → displays in sidebar
2. **Shipwright editing:** Click Edit → conversational refinement → markdown updates
3. **PDF export:** Export → ATS-optimized PDF → downloads
4. **Isaac's interview prep:** Can prep for Sophie interview using this feature

---

## Progress

### ✅ Done
- [x] Design doc created (CONTEXT_ANCHORS_V1.md)
- [x] Technical plan approved
- [x] Scale validation (100K users)
- [x] Lab branch created
- [x] Database schema (ContextAnchor, OutputArtifact)
- [x] Dependencies installed (pdf2json, mammoth, @vercel/blob)
- [x] Upload API endpoint with file parsing
- [x] Sidebar UI with drag-and-drop
- [x] ContextModal for text-based input
- [x] Context anchors integrated into AI chat stream
- [x] **Micro-feature 1: Core Upload & Display** ✅

### 🚧 In Progress
- [ ] **Micro-feature 2: Shipwright Integration**

### 📋 Next
- [ ] Edit button on context anchors
- [ ] Shipwright editor UI
- [ ] Markdown editor in right pane
- [ ] Export markdown functionality

---

## Technical Notes

**Dependencies:**
```json
{
  "pdf-parse": "^1.1.1",
  "mammoth": "^1.6.0",
  "md-to-pdf": "^6.0.0",
  "@vercel/blob": "^0.15.0"
}
```

**Database Models:**
- `ContextAnchor` - Uploaded documents (resume, JD, research)
- `OutputArtifact` - Generated outputs (resume PDF, cover letter, LinkedIn post)

**Scale Confidence:**
- 100K users → 300GB blob storage → $60/month
- Indexed queries <50ms
- PDF generation: Synchronous v1, queue when needed

---

## Next Steps

1. Add schema to prisma/schema.prisma
2. Run migration
3. Install dependencies
4. Build upload endpoint
