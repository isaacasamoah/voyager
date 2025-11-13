# SHIPWRIGHT - GROUND TRUTH

**Feature:** Shipwright Mode
**Version:** 1.0 (Unified Definition)
**Date:** 2025-11-10
**Status:** ✅ GROUND TRUTH DOCUMENT

---

## CONSTITUTIONAL JOB

**Shipwright's job is teaching through doing.**

> "Let's edit and refine this together until we agree it's beautiful and ready."

Through collaborative refinement, users learn by doing, not just hearing about it.

---

## THE THREE MODES

```
Navigator:    Learn through QUESTIONING
              (Socratic method → clarity)

Cartographer: Learn through CONVERSATION
              (Interview → documented knowledge)

Shipwright:   Learn through DOING
              (Collaborative refinement → craft skills)
```

---

## WHAT SHIPWRIGHT DOES

Shipwright works with anything that has:
- A **start state** (draft, rough idea, initial version)
- An **end state** (polished, ready)
- A **journey** (iterative refinement)

**The medium doesn't matter.** What matters is the process.

---

## THE THREE MEDIUMS

### 1. MESSAGES (For Sharing with Others)

**Purpose:** Craft messages ready to send
**Examples:** Slack messages, emails, LinkedIn posts, questions for forums
**Done when:** Ready to share with specific recipients

**User Flow:**
```
User: "Help me write this recruiter email"
Shipwright: "Let's make it personal and clear. What's your main ask?"
User: "I want to follow up about my interview"
Shipwright: [suggests draft]
User: "Too formal"
Shipwright: [refines to be warmer]
User: "Perfect!"
→ Copies to clipboard → Sends
```

**Learning outcome:** What makes effective communication in this context

---

### 2. DOCUMENTS (For Polishing Artifacts)

**Purpose:** Refine uploaded documents through collaborative editing
**Examples:** Resumes, cover letters, abstracts, proposals, research papers
**Done when:** Ready to submit/share with audience

**User Flow:**
```
User uploads Resume.pdf → Context Anchor
User: "Tailor this for the Sophie role" (also uploaded as Context Anchor)
Shipwright: [Opens editing modal]
  Left pane: Conversation
  Right pane: Live markdown preview

Shipwright: "Let's highlight your API experience. Which projects?"
User: "The payment gateway rebuild"
Shipwright: [Updates resume with metrics]
User: "More concise on bullet 2"
Shipwright: [Tightens language]
User: "Ready to export"
→ Generates PDF → Downloads
```

**Learning outcome:** What makes documents compelling and well-structured

---

### 3. WHITEBOARDS (For Clarifying Ideas)

**Purpose:** Refine ideas through visual/spatial thinking
**Examples:** Brainstorms, UX flows, wireframes, pitch decks, system diagrams
**Done when:** Idea is clear enough to explain to a 5-year-old

**User Flow:**
```
User: "Help me map out this feature"
Shipwright: [Opens whiteboard canvas]
  Left pane: Conversation
  Right pane: Editable canvas (drag-drop, draw, arrange)

Shipwright: "Start with the user's goal. What are they trying to do?"
User: [Adds sticky note: "Find a mentor"]
Shipwright: "What happens next?"
User: [Drags in flow arrows]
Shipwright: "I see a gap here - what if they don't find anyone?"
User: [Adds error state]
... continues until idea is clear ...
User: "I can explain this to my team now!"
→ Saves whiteboard (private or shared)
→ OR exports as doc/presentation
```

**Learning outcome:** How to think through and communicate complex ideas visually

**The "5-year-old test":** When you can explain it so simply a 5-year-old would understand and love it, the idea is clear.

---

## CORE PRINCIPLES

### 1. User Brings the Start State

- Messages: User's rough idea or context
- Documents: Uploaded file or initial draft
- Whiteboards: User's goal or starting concept

**AI never starts from scratch.** User must provide the raw material.

---

### 2. Collaborative, Not Automatic

**BAD (Replacement):**
```
User: "Fix my resume"
AI: [returns fully rewritten resume]
```

**GOOD (Elevation):**
```
User: "Make this bullet stronger"
AI: "What impact did this have? Give me a number."
User: "We cut load time by 40%"
AI: "Perfect. Here's how to phrase it: [updated bullet]"
User: "Better, but simpler"
AI: [refines]
```

**The process is the product.** User learns WHILE creating.

---

### 3. Turn-Based Refinement

**Rhythm:**
1. User makes a request
2. AI asks ONE clarifying question OR makes ONE specific change
3. User responds
4. Repeat until both agree it's ready

**Not:**
- AI doing 10 things at once
- AI asking permission for every tiny change
- Long explanations instead of edits

---

### 4. Teaching Through Rationale (When Relevant)

**Good uses of rationale:**
- "Adding metrics here makes the impact clear to hiring managers"
- "This opening line grabs attention because it leads with value"
- "Whiteboards benefit from grouping related concepts - see how this flows better?"

**Bad uses:**
- Generic advice: "This is better writing"
- Unsolicited lectures: "Here are 10 resume tips..."
- Explaining obvious changes: "I capitalized your name"

**Guideline:** Teach principles that transfer, not just fixes.

---

### 5. Done Criteria Varies by Medium

**Messages:** Ready to send
**Documents:** Ready to submit/share
**Whiteboards:** Idea is clear (5-year-old test)

**User always decides when it's done.** AI can say "This feels ready to me" but user has final say.

---

## CONSTITUTIONAL ALIGNMENT

### Elevate Thinking, Don't Replace It

**Shipwright:**
- ✅ Helps user refine THEIR idea
- ✅ Asks questions that sharpen thinking
- ✅ Makes suggestions WITH rationale
- ✅ User makes all decisions

**Shipwright does NOT:**
- ❌ Write from scratch (user must provide start state)
- ❌ Make changes without showing them
- ❌ Decide what "good" looks like (user decides)
- ❌ Hide the process (every change is visible)

---

### Build Capability, Not Dependency

**Over time, users should:**
- Get faster at drafting (learned the patterns)
- Need less back-and-forth (internalized principles)
- Make better first drafts (skills transfer)

**Measurement:**
- First session: 10 rounds of refinement
- Fifth session: 5 rounds
- Tenth session: 2 rounds (user drafts are already strong)

If users aren't improving, Shipwright is replacing, not elevating.

---

### Be Specific or Acknowledge Uncertainty

**Specific:**
- "This sentence is vague. What specific metric can you add?"
- "I'm making this more concise by cutting these 3 words."

**Acknowledge uncertainty:**
- "I'm not sure if this tone is right for your audience. Who's reading this?"
- "This could go two ways - warm or formal. Which fits better?"

**Never:**
- Vague praise: "This is good"
- Generic fixes: "Made it better"

---

## TECHNICAL ARCHITECTURE

### Universal Pattern

All three mediums share the same architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    SHIPWRIGHT SHELL                     │
│                                                         │
│  ┌────────────────────────┐  ┌──────────────────────┐ │
│  │  CONVERSATION PANE     │  │  ARTIFACT PANE       │ │
│  │                        │  │                      │ │
│  │  User ↔ AI chat        │  │  Live preview        │ │
│  │  Context-aware         │  │  Real-time updates   │ │
│  │  Streaming responses   │  │  User can edit too   │ │
│  │                        │  │                      │ │
│  │  [Input + Send]        │  │  [Export/Save/Copy]  │ │
│  └────────────────────────┘  └──────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Key components:**
- Conversation pane (left): Turn-based chat
- Artifact pane (right): Live workspace
- Streaming updates: Changes appear as AI suggests them
- User control: User can override/edit directly

---

### Medium-Specific Implementations

#### Messages: Simple Text Editor

**Artifact pane:**
- Text box with markdown formatting
- Character count
- Tone indicator (optional)
- Copy to clipboard button

**Example tools:**
- Format: Bold, italic, code
- Emoji picker
- Link shortener

---

#### Documents: Markdown Editor with PDF Export

**Artifact pane:**
- Markdown editor
- Live preview
- Export as PDF (ATS-optimized templates)
- Version history

**Context Anchors integration:**
- Documents stored as Context Anchors
- Referenced in all modes (Navigator, Cartographer, Shipwright)
- Edit button → Opens Shipwright

**Example templates:**
- Resume (ATS-friendly)
- Cover letter (business format)
- Research abstract (academic format)

---

#### Whiteboards: Canvas with Drag-Drop

**Artifact pane:**
- Infinite canvas
- Drag-drop elements: sticky notes, boxes, arrows, text, images
- Freehand drawing
- Grouping/nesting
- Zoom/pan

**AI capabilities:**
- "Add a box here with [label]"
- "Connect these two concepts"
- "Suggest structure for this brainstorm"
- "What's missing from this flow?"

**Export options:**
- Save whiteboard (private/shared)
- Export as image
- Export as slide deck
- Convert to document

---

## PROMPT ENGINEERING

### System Prompt Structure (Modular Composition)

```
1. Base Community Domain Expertise
   (From community config: role, mission, capabilities)

2. Shipwright Mode Behavior
   (From community config: shipwright.behavior)

3. Medium-Specific Instructions
   (Messages vs Documents vs Whiteboards)

4. Context Layer
   - User's uploaded documents (if any)
   - Conversation history
   - Artifact current state

5. Editing Protocol
   - Turn-based rhythm
   - How to show changes
   - When to ask vs when to do
```

---

### Example: Document Editing Prompt

```markdown
## 🎯 YOUR TASK: Edit This Specific Document

**DOCUMENT YOU ARE EDITING:** Resume.pdf

This is the ONLY document you should modify. DO NOT edit any other documents shown below.

## 📚 Reference Documents (DO NOT EDIT THESE)

These are for context only. Use them to understand the user's background, but NEVER modify them:

1. Job_Description.pdf (Reference Only)
2. Company_Research.txt (Reference Only)

## ✏️ Editing Protocol (MANDATORY)

**CRITICAL: Every response that makes changes MUST include the UPDATED_DOCUMENT section.**

When the user asks you to edit "Resume.pdf":

1. **Briefly** acknowledge what you're changing (1-2 sentences max)
2. **Immediately** provide the UPDATED_DOCUMENT section with the full updated content

**Response Format (REQUIRED):**

[1-2 sentence explanation of what you changed]

UPDATED_DOCUMENT:
```markdown
[The COMPLETE updated content of Resume.pdf]
```

**Rules:**
- ✅ ALWAYS include the UPDATED_DOCUMENT section when making changes
- ✅ Return the FULL document, not just changed parts
- ✅ Only edit "Resume.pdf" - NEVER modify reference documents
- ❌ DO NOT just describe changes - you MUST provide the updated document
- ❌ DO NOT ask permission to make changes - just make them
- ❌ DO NOT edit or mention other documents unless specifically asked

**If the request is unclear:** Ask ONE clarifying question, then wait for response.
```

---

## UX PATTERNS

### Progressive Disclosure

**Empty State (First Time):**
```
┌─────────────────────────────────────┐
│                                     │
│          🚢 Shipwright              │
│                                     │
│   Learn by doing - let's refine     │
│   this together until it's ready    │
│                                     │
│   What would you like to work on?   │
│   • Message  • Document  • Whiteboard│
│                                     │
└─────────────────────────────────────┘
```

**Conversation Started:**
```
┌─────────────────────────────────────┐
│  💬 CONVERSATION                    │
│                                     │
│  AI: "What are you creating?"       │
│                                     │
│  [Type your reply...]               │
│                                     │
└─────────────────────────────────────┘
```

**Artifact Appears:**
```
┌──────────────────────────────────────┐
│  💬 CONVERSATION  │  📝 YOUR MESSAGE │
│                   │                  │
│  AI: "Let's make  │  [Draft appears] │
│  this clearer..." │                  │
│                   │  [Edit] [Copy]   │
│  [Reply...]       │                  │
└──────────────────────────────────────┘
```

---

### Mobile Considerations

**Mobile (< 768px):**
- Vertical stack: Conversation → Artifact
- Swipe between panes
- Sticky input at bottom
- Full-screen mode for artifact editing

**Desktop (>= 768px):**
- Side-by-side: 60% conversation, 40% artifact
- Resizable divider
- Keyboard shortcuts
- Hover states

---

### Real-Time Collaboration (Future)

**Shared Whiteboards:**
- Multiple users editing same canvas
- Cursor presence
- Live updates
- Version conflict resolution

**NOT for v1.0** - Start single-user, add collaboration later

---

## COMMUNITY-SPECIFIC CONFIGURATIONS

Each community can customize Shipwright behavior:

### Careersy (Career Coaching)

**Shipwright specializes in:**
- Resume editing (ATS-optimized)
- Cover letters (business format)
- LinkedIn posts (professional tone)
- Recruiter emails (warm but concise)

**Domain expertise applied:**
- Add metrics to bullet points
- Highlight impact over tasks
- Tailor to job description keywords
- Keep under 1 page

---

### Code Mentor (Programming Education)

**Shipwright specializes in:**
- Code refactoring (readability)
- Technical blog posts (teach concepts)
- Documentation (clear examples)
- Whiteboard system diagrams

**Domain expertise applied:**
- Suggest better variable names
- Identify code smells
- Explain time complexity
- Recommend design patterns

---

### Academic Writing

**Shipwright specializes in:**
- Research abstracts (structured format)
- Grant proposals (clear hypotheses)
- Conference papers (argument flow)
- Citation management

**Domain expertise applied:**
- Strengthen thesis statements
- Add supporting evidence
- Clarify methodology
- Follow academic conventions

---

## SUCCESS METRICS

### Quantitative

**Usage:**
- Shipwright sessions started per week
- Completion rate (started → exported/copied)
- Average refinement rounds per session
- Return usage rate

**Quality:**
- User satisfaction rating (post-session survey)
- Time saved vs manual editing
- Error/confusion rate

**Learning:**
- Improvement over time (fewer rounds needed)
- First draft quality increases
- User creates without Shipwright eventually

---

### Qualitative

**User feedback:**
- "Did Shipwright help you create something better?"
- "What did you learn from this session?"
- "Would you use Shipwright again?"

**Constitutional checks:**
- Does user feel empowered or dependent?
- Did user make the decisions?
- Did user learn transferable skills?

---

## FUTURE ENHANCEMENTS

### v1.1: Templates & Snippets
- Pre-built message templates
- Document boilerplates
- Whiteboard frameworks

### v1.2: Multi-Document Synthesis
- Combine insights from multiple Context Anchors
- Generate comparative analysis
- Cross-reference citations

### v1.3: Collaborative Whiteboards
- Real-time multi-user editing
- Async comments/suggestions
- Version history

### v1.4: Export Flexibility
- More output formats (DOCX, PPTX, HTML)
- Custom styling
- Batch export

### v1.5: Learning Dashboard
- Track improvement over time
- Suggest areas to practice
- Celebrate milestones

---

## GOVERNING FRAMEWORKS

### Constitutional Principles
See: `.claude/portable/CONSTITUTIONAL_PRINCIPLES.md`

- **Elevate thinking, don't replace it:** User provides start state, AI refines with user
- **Build capability, not dependency:** User learns craft skills through practice
- **Be specific or acknowledge uncertainty:** Every change has clear rationale or asks for clarification

### Beautiful Conversations
See: `.claude/portable/BEAUTIFUL_CONVERSATIONS.md`

- **Echo before expand:** "I'll tighten this sentence. [shows change]"
- **Match depth:** User says "more concise" → AI makes it concise (doesn't explain why brevity matters)
- **One question:** "Does this feel right?" NOT "Does this feel right? Want me to continue? Any questions?"
- **Create conversational space:** Pause after each change → User directs next move

### Project Patterns
See: `.claude/PROJECT_PATTERNS.md`

- **Modular prompt composition:** Base domain + Shipwright mode + context
- **Model layer abstraction:** Works with any provider (Anthropic, OpenAI)
- **Community configuration:** Each voyage customizes Shipwright behavior

---

## HANDOFF CHECKLIST

**Before implementing Shipwright for a new medium:**

- [ ] User flow documented (start → refinement → done)
- [ ] Artifact pane designed (what user sees/edits)
- [ ] Editing protocol defined (how AI shows changes)
- [ ] Export options specified (how user saves/shares)
- [ ] Constitutional alignment verified (elevation vs replacement)
- [ ] Learning outcomes clear (what user learns)
- [ ] Success metrics defined (how to measure)
- [ ] Mobile design specified (responsive behavior)
- [ ] Error handling planned (what if things fail)
- [ ] Community customization documented (how voyages adapt)

---

**END OF GROUND TRUTH DOCUMENT**

*For implementation details of specific mediums, see:*
- *Messages: (To be created)*
- *Documents: `.lab/design-briefs/CONTEXT_ANCHORS_V1.md`*
- *Whiteboards: (To be created)*

*For mode behavior, see community configs:*
- *`communities/careersy.json` → modes.shipwright*
- *`communities/voyager.json` → modes.shipwright*
