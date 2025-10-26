# Collaboration Feature Design Roadmap

> **Vision:** Build the "Canva for collaboration" - making high-quality community engagement inevitable through AI-assisted artifact creation.

**Core Philosophy:**
- Quality over quantity - Every post should be answerable, every question well-formed
- Guided flexibility - AI provides guardrails while preserving user creativity
- Compound learning - Platform gets smarter over time through expert engagement and RAG
- Accessible expertise - Everyone gets world-class coaching, not just those who can afford mentors

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Phase 1: Split-View Collaborate (Draft Posts)](#phase-1-split-view-collaborate-draft-posts)
3. [Phase 2: File Upload & Context Extraction](#phase-2-file-upload--context-extraction)
4. [Phase 3: User Context System](#phase-3-user-context-system)
5. [Phase 4: Community Knowledge RAG](#phase-4-community-knowledge-rag)
6. [Phase 5: Collaboards](#phase-5-collaboards)
7. [Risk Mitigation](#risk-mitigation)
8. [Success Metrics](#success-metrics)

---

## Architecture Overview

### The Split-View Pattern

All collaboration modes follow the same fundamental pattern:

```
┌──────────────────┬──────────────────────────┐
│  💬 Chat    [◀]  │  [▶] 📝 Artifact         │
│                  │                          │
│  Conversation    │  Thing being created     │
│  with AI about   │  (Draft, Canvas, Doc,    │
│  the artifact    │   Resume, etc.)          │
│                  │                          │
└──────────────────┴──────────────────────────┘
```

**Key principles:**
- Left panel = Contextual conversation
- Right panel = Persistent artifact
- Responsive = Adapts to mobile portrait/landscape, tablet, desktop
- Draggable divider = User controls focus
- Collapse controls = Full screen when needed

### Context Architecture

```typescript
// Every AI request includes:
{
  systemPrompt: {
    domainExpertise,      // Community knowledge (careers, tech, etc.)
    modeConfig            // Coach vs Curator behavior
  },
  userContext: {
    recentActivity,       // Last 2 weeks (verbatim)
    compressedHistory,    // Older than 2 weeks (summarized)
    currentVoyageFiles    // Uploaded attachments
  },
  communityKnowledge: {   // RAG (Phase 4)
    expertAnswers,        // From verified experts
    qualityPosts          // High-engagement community content
  }
}
```

**Token budget management:**
- Compression: ~88% reduction (50 posts → 3k tokens vs 25k)
- Prompt caching: ~90% cost reduction for repeat users
- RAG on-demand: Deep search only when user requests (`/history`)

---

## Phase 1: Split-View Collaborate (Draft Posts)

**Goal:** Core UX for AI-assisted post creation

**Timeline:** 3-4 days

### Artifacts to Build

#### 1. UI Components

**`CollaborateLayout.tsx`**
- Split-view container with draggable divider
- Responsive breakpoints:
  - Mobile portrait (< 768px): Vertical stack, 60% draft / 40% chat
  - Mobile landscape (< 768px, rotated): Side-by-side, 50/50
  - Tablet (768-1024px): Side-by-side, 40% chat / 60% draft
  - Desktop (> 1024px): Side-by-side, 35% chat / 65% draft
- Collapse buttons: `[◀] [▶]` (horizontal) or `[▼] [▲]` (vertical)
- Smart auto-expand:
  - AI proposes `[READY_TO_POST]` → Draft expands
  - User types in chat → Chat expands
  - User taps draft to edit → Draft expands

**Tool:** Use `react-resizable-panels` for draggable divider (handles touch events well)

**`DraftPanel.tsx`**
- Title input (single line, max 100 chars)
- Content textarea (multi-line, rich preview)
- Live character/word count
- Action buttons: `[Edit] [Post]`
- Preview mode when `[READY_TO_POST]` received

**`ChatPanel.tsx`**
- Reuse existing chat component, adapted for split view
- Scrolls independently of draft
- Shows curator banner when in collaborate mode

#### 2. State Management

**Voyage metadata extension:**
```typescript
interface VoyageMetadata {
  drafts?: Draft[]
  // ... existing fields
}

interface Draft {
  version: number
  title: string
  content: string
  timestamp: string
  status: 'draft' | 'ready' | 'posted'
}
```

**Auto-save:**
- Debounce 30s after last edit
- Optimistic UI updates (don't wait for save confirmation)
- Version history (keep last 5 drafts)

#### 3. Backend Updates

**`PATCH /api/voyages/:id`**
- Handle draft updates in metadata
- Return updated voyage with new draft version

**Animation:**
- Draft panel slides in from right (300ms ease-out)
- Conversation compresses to make room
- Smooth, not jarring

### Activation Flow

**User toggles collaborate mode:**
1. Toggle switches to active state
2. Split-view animates in
3. System prompt switches to curator mode
4. AI sends greeting: *"🎯 Let me help you craft a post. What would you like to write about?"*
5. Draft panel shows empty, ready state

**User toggles collaborate mode OFF:**
1. If draft exists and unsaved:
   ```
   ⚠️ You have an unsaved draft. What would you like to do?

   [Save as draft] [Discard] [Cancel]
   ```
2. If saved or empty: Just collapse split-view, return to conversation

**AI predicts user wants to post (future):**
1. User: *"I want to ask the community about negotiating at Atlassian"*
2. AI: *"That's a great question for the community! Would you like me to help you craft a post?"*
3. Inline buttons: `[Create a post] [Just chat about it]`
4. If user clicks "Create a post":
   - Toggle switches automatically
   - Split-view appears
   - AI continues with context: *"Great! Let me help you craft that Atlassian negotiation post..."*

### Success Criteria

- ✅ Toggle activates split-view within 300ms
- ✅ Draggable divider works smoothly on mobile + desktop
- ✅ Draft auto-saves within 30s of last edit
- ✅ Draft persists across page refreshes
- ✅ Works on all breakpoints (mobile portrait/landscape, tablet, desktop)

---

## Phase 2: File Upload & Context Extraction

**Goal:** Let users upload resume/JD, parse them, include in AI context

**Timeline:** 4-5 days

### Artifacts to Build

#### 1. File Upload UI

**Drag & drop zone in chat:**
```
┌──────────────────────────────────┐
│  💬 Chat                         │
│                                  │
│  [Drag files here or click]     │
│  📎 Attach resume, JD, or docs   │
│                                  │
└──────────────────────────────────┘
```

**File preview in voyage:**
```
Attachments (2):
📄 resume.pdf (2.3 MB) - Parsed ✓
📄 jd-atlassian.pdf (1.1 MB) - Parsed ✓
```

#### 2. Storage Schema

**Supabase Storage:**
- Bucket: `voyage-attachments`
- Path: `{userId}/{voyageId}/{fileName}`
- RLS: Users can only access their own voyage files

**Database table:**
```sql
CREATE TABLE voyage_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voyage_id UUID REFERENCES voyages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,      -- Supabase Storage path
  file_type TEXT NOT NULL,       -- 'resume' | 'job_description' | 'other'
  file_size INTEGER,
  parsed_data JSONB,             -- Extracted structured data
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policy
CREATE POLICY "Users can access their voyage attachments"
  ON voyage_attachments
  FOR ALL
  USING (
    voyage_id IN (
      SELECT id FROM voyages WHERE user_id = auth.uid()
    )
  );
```

#### 3. File Parsing

**PDF parsing:**
```typescript
import pdf from 'pdf-parse'

async function parsePDF(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer)
  return data.text
}
```

**Resume extraction with GPT-4:**
```typescript
async function extractResumeData(pdfText: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Extract structured data from this resume. Return JSON with:
        - yearsOfExperience (number)
        - skills (array of strings)
        - location (string)
        - currentRole (string)
        - education (array of degrees)
        - companies (array of company names)`
      },
      { role: 'user', content: pdfText }
    ],
    response_format: { type: 'json_object' }
  })

  return JSON.parse(response.choices[0].message.content)
}
```

**Fallback for scanned PDFs:**
```typescript
// If text extraction fails, use GPT-4 Vision
const imageData = await convertPDFToImage(buffer)
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Extract resume data from this image' },
      { type: 'image_url', image_url: { url: imageData } }
    ]
  }]
})
```

**Job description extraction:**
```typescript
async function extractJDData(pdfText: string) {
  // Similar approach, extract:
  // - role, level, requirements, techStack, location, company
}
```

#### 4. Context Integration

**When building AI prompt:**
```typescript
const attachments = await getVoyageAttachments(voyageId)
const contextPrompt = `
## User's Uploaded Files

${attachments.map(a => `
### ${a.file_name} (${a.file_type})
${JSON.stringify(a.parsed_data, null, 2)}
`).join('\n')}
`
```

**Example context:**
```
## User's Uploaded Files

### resume.pdf (resume)
{
  "yearsOfExperience": 3,
  "skills": ["Python", "Django", "AWS", "PostgreSQL"],
  "location": "Sydney",
  "currentRole": "Backend Engineer"
}

### jd-atlassian.pdf (job_description)
{
  "role": "Senior Backend Engineer",
  "level": "L5",
  "requirements": ["5+ years", "System design", "Kafka", "Kubernetes"],
  "location": "Sydney",
  "company": "Atlassian"
}
```

**AI can now:**
- Not ask redundant questions (*"What's your YOE?"* - already knows)
- Reference files in responses (*"I see from your resume that you have AWS experience..."*)
- Draft richer posts (*"Mention your Django background since the JD requires Python frameworks"*)

### File Size & Cost Management

**Client-side limits:**
- Max file size: 2MB per file
- Max files per voyage: 10
- Accepted types: PDF, DOCX, TXT, PNG, JPG

**Cost optimization:**
- Cache parsed results (only re-parse if file changes)
- Batch parsing (if user uploads 3 files, parse in parallel)
- Free tier users: 5 file uploads/month
- Paid users: Unlimited

### Success Criteria

- ✅ Drag & drop works on all devices
- ✅ PDF parsing handles both text and scanned PDFs
- ✅ Parsing completes within 10s for typical resume/JD
- ✅ Parsed data appears in AI context automatically
- ✅ File previews show in voyage UI

---

## Phase 3: User Context System

**Goal:** Include user's post history + private voyage history in AI context

**Timeline:** 2-3 days

### Context Builder

```typescript
async function buildUserContext(userId: string, voyageId: string) {
  const [currentVoyage, myPosts, myVoyages, attachments] = await Promise.all([
    getVoyage(voyageId),
    getUserPublicPosts(userId, { limit: 10 }),
    getUserPrivateVoyages(userId, { limit: 5, maxAge: '90d' }),
    getVoyageAttachments(voyageId)
  ])

  return {
    // Recent activity (verbatim, last 2 weeks)
    recentPosts: myPosts.slice(0, 5),
    recentVoyages: myVoyages.slice(0, 3),
    currentFiles: attachments.map(a => a.parsed_data),

    // Compressed historical summary (older than 2 weeks)
    historicalSummary: await compressUserHistory(userId)
  }
}
```

### Compression Strategy

**Compress old voyages into summary:**
```typescript
async function compressUserHistory(userId: string) {
  const oldPosts = await getUserPublicPosts(userId, {
    olderThan: '14d',
    limit: 100
  })

  const oldVoyages = await getUserPrivateVoyages(userId, {
    olderThan: '14d',
    limit: 50
  })

  // Use GPT-4 to summarize
  const summary = await openai.chat.completions.create({
    model: 'gpt-4o-mini',  // Cheaper model for summarization
    messages: [{
      role: 'system',
      content: `Summarize this user's career history into a compact profile. Include:
      - Career profile (YOE, skills, location, target companies)
      - Key topics they've discussed
      - Notable questions/concerns
      - Current career stage and goals`
    }, {
      role: 'user',
      content: JSON.stringify({ posts: oldPosts, voyages: oldVoyages })
    }]
  })

  return summary.choices[0].message.content
}
```

**Example compressed summary:**
```
Career Profile:
- 3 YOE, Backend Engineer, Python/Django/AWS
- Based in Sydney, targeting senior roles at Atlassian, Canva, Xero
- Currently at Series B startup, seeking better comp + growth

Key Topics:
- Salary negotiation tactics (asked 3x in past 2 months)
- Resume optimization for ATS
- Interview prep for system design rounds

Recent Activity:
- Posted "How to negotiate at Xero?" 3 weeks ago
- Asked about ATS optimization 1 month ago
- Uploaded resume showing AWS/Django experience
```

### Prompt Integration

**System messages structure:**
```typescript
const messages = [
  {
    role: 'system',
    content: getCommunitySystemPrompt(config, { curateMode: true }),
    cache_control: { type: 'ephemeral' }  // Cache domain expertise
  },
  {
    role: 'system',
    content: buildUserContextPrompt(userContext),
    cache_control: { type: 'ephemeral' }  // Cache user profile
  },
  ...currentVoyageMessages  // Only this changes per request
]
```

**Token savings:**
- Without compression: 50 posts × 500 tokens = 25,000 tokens
- With compression: 5 recent posts (2,500) + summary (500) = 3,000 tokens
- **~88% reduction**

**Cost savings with prompt caching:**
- First request: Full tokens charged
- Subsequent requests in 5min window: Only new messages charged
- **~90% cost reduction for repeat users**

### Special Commands for Context Control

**`/history <query>`** - Deep RAG search across all user data
```
User: /history What did I learn about Atlassian interviews?

[Triggers RAG search across 47 posts + 28 voyages]

AI: Looking through your history...

Found 3 relevant conversations:
- Jan 15: You discussed Atlassian's system design focus
- Feb 3: You asked about behavioral interview prep for L5
- Feb 20: You uploaded an Atlassian JD mentioning Kafka

Here's what you learned: [detailed summary with citations]
```

**`/include-post <post-id>`** - Include specific post in context
```
User: /include-post abc123

AI: I'll reference your post "How to negotiate at Xero" in my next response.
```

**`/forget`** - Minimal context mode
```
User: /forget

AI: I'll respond with minimal context (just this conversation).
Use /history to restore full context.
```

**`/profile`** - Show compressed career profile
```
User: /profile

AI: Here's your career profile based on our conversations:

[Shows compressed summary]

Want to update any of this?
```

### Privacy & RLS

**Critical:** User context ONLY includes user's own data.

**RLS policies ensure:**
```sql
-- Users can only read their own posts
CREATE POLICY "Users read own posts"
  ON posts FOR SELECT
  USING (user_id = auth.uid());

-- Users can only read their own voyages
CREATE POLICY "Users read own voyages"
  ON voyages FOR SELECT
  USING (user_id = auth.uid());
```

**Never accessible:**
- ❌ Other users' private voyages
- ❌ Other users' drafts
- ❌ Other users' uploaded files

### Success Criteria

- ✅ AI references user's previous posts naturally
- ✅ AI doesn't ask questions already answered in uploads
- ✅ Compressed context fits within token budget
- ✅ `/history` command returns relevant results
- ✅ RLS prevents cross-user data leaks

---

## Phase 4: Community Knowledge RAG

**Goal:** AI can reference expert answers and quality community posts

**Timeline:** 5-7 days

### Knowledge Base Schema

```sql
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id TEXT NOT NULL,
  source_type TEXT NOT NULL,        -- 'expert_answer' | 'quality_post'
  source_id UUID,                   -- Reference to original post/comment
  content TEXT NOT NULL,
  embedding VECTOR(1536),           -- OpenAI text-embedding-3-small
  metadata JSONB,                   -- { author, votes, topic, etc. }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity search index
CREATE INDEX ON knowledge_base
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- RLS: Knowledge base is publicly readable
CREATE POLICY "Knowledge base publicly readable"
  ON knowledge_base FOR SELECT
  USING (true);
```

### Ingestion Pipeline

**Background job (runs nightly):**
```typescript
async function ingestCommunityKnowledge(communityId: string) {
  // 1. Find expert posts (from designated expert users)
  const expertPosts = await supabase
    .from('posts')
    .select('*')
    .eq('community_id', communityId)
    .in('user_id', communityConfig.experts)  // eli@careersy.com, etc.

  // 2. Find high-quality posts (>5 upvotes, expert replies)
  const qualityPosts = await supabase
    .from('posts')
    .select('*')
    .eq('community_id', communityId)
    .gte('votes', 5)

  // 3. Generate embeddings
  const toEmbed = [...expertPosts, ...qualityPosts]
  const embeddings = await openai.embeddings.create({
    model: 'text-embedding-3-small',  // $0.02 per 1M tokens
    input: toEmbed.map(p => `${p.title}\n\n${p.content}`)
  })

  // 4. Store in knowledge base
  await supabase.from('knowledge_base').insert(
    toEmbed.map((post, i) => ({
      community_id: communityId,
      source_type: post.user_id in experts ? 'expert_answer' : 'quality_post',
      source_id: post.id,
      content: `${post.title}\n\n${post.content}`,
      embedding: embeddings.data[i].embedding,
      metadata: {
        author: post.user_id,
        votes: post.votes,
        created_at: post.created_at
      }
    }))
  )
}
```

### RAG Search

**Vector similarity search:**
```typescript
async function searchKnowledge(
  query: string,
  communityId: string,
  options = { limit: 5, threshold: 0.7 }
) {
  // 1. Generate query embedding
  const queryEmbedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query
  })

  // 2. Vector search in Supabase
  const { data } = await supabase.rpc('match_knowledge', {
    query_embedding: queryEmbedding.data[0].embedding,
    match_threshold: options.threshold,
    match_count: options.limit,
    community_filter: communityId
  })

  return data
}
```

**Supabase function:**
```sql
CREATE OR REPLACE FUNCTION match_knowledge(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  community_filter TEXT
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    knowledge_base.id,
    knowledge_base.content,
    knowledge_base.metadata,
    1 - (knowledge_base.embedding <=> query_embedding) AS similarity
  FROM knowledge_base
  WHERE
    knowledge_base.community_id = community_filter
    AND 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
```

### Integration with AI Prompts

**When user asks question or creates post:**
```typescript
// Extract user intent
const userQuery = extractUserIntent(messages)

// RAG search for relevant community knowledge
const relevantKnowledge = await searchKnowledge(userQuery, communityId)

// Build knowledge prompt
const knowledgePrompt = `
## Community Knowledge

${relevantKnowledge.map(k => `
### ${k.metadata.author} (${k.similarity.toFixed(2)} relevance)
${k.content}
`).join('\n')}

Use this community knowledge to inform your response. Cite sources when referencing expert insights.
`

// Include in system messages
const messages = [
  { role: 'system', content: domainExpertise },
  { role: 'system', content: userContext },
  { role: 'system', content: knowledgePrompt },  // ← RAG results
  ...conversationMessages
]
```

**Example AI response using RAG:**
```
Based on eli@'s advice from the community, candidates at L5
should focus on multi-issue negotiation (title, scope,
flexibility, comp). Several people have found success with...
```

### Cost Optimization

**Embedding costs:**
- Only embed expert posts + high-quality posts (>5 upvotes)
- Batch embed nightly (not real-time)
- Cache embeddings (don't re-embed unchanged posts)
- Cost: ~$0.02 per 1M tokens → 10k posts = ~$0.20

**Search costs:**
- Vector search is free (runs in Supabase)
- Only pay for embedding the user query (~$0.000002 per query)

### Success Criteria

- ✅ Expert posts embedded within 24h of posting
- ✅ RAG search returns relevant results (>0.7 similarity)
- ✅ AI cites community knowledge naturally
- ✅ Knowledge base grows with community engagement
- ✅ Cost stays under $10/month for 10k posts

---

## Phase 5: Collaboards

**Goal:** Visual canvas for collaborative artifact creation

**Timeline:** 10-14 days

### Canvas Component

**Use tldraw (recommended):**
- Open source (MIT license)
- Production-ready (used by Vercel, Linear)
- Built-in: infinite canvas, shapes, drawing, sticky notes
- React component with clean API

**Installation:**
```bash
npm install tldraw
```

**Basic implementation:**
```tsx
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

function Collaboard({ voyageId }: { voyageId: string }) {
  const [snapshot, setSnapshot] = useState(null)

  return (
    <CollaborateLayout>
      <ChatPanel voyageId={voyageId} />

      <div className="collaboard-panel">
        <Tldraw
          snapshot={snapshot}
          onMount={(editor) => {
            // Load canvas state
            loadCanvasState(voyageId).then(state => {
              editor.store.loadSnapshot(state)
            })

            // Auto-save on changes
            editor.store.listen((update) => {
              debouncedSave(voyageId, editor.getSnapshot())
            })
          }}
        />
      </div>
    </CollaborateLayout>
  )
}
```

### Storage Architecture

**Voyage metadata extension:**
```typescript
interface VoyageMetadata {
  collaboard?: {
    currentState: TLDrawSnapshot,      // Latest canvas state
    snapshots: Snapshot[],              // Manual checkpoints
    eventLog: Event[]                   // High-level events for AI
  }
}

interface Snapshot {
  version: number
  state: TLDrawSnapshot
  timestamp: string
  label: string                         // AI-suggested, user can edit
}

interface Event {
  type: 'file_added' | 'element_created' | 'snapshot_saved'
  details: any
  timestamp: string
}
```

**Canvas state storage:**
```typescript
async function saveCanvasState(voyageId: string, snapshot: TLDrawSnapshot) {
  await supabase
    .from('voyages')
    .update({
      metadata: {
        collaboard: {
          currentState: snapshot,
          updatedAt: new Date().toISOString()
        }
      }
    })
    .eq('id', voyageId)
}
```

**Auto-save logic:**
```typescript
const debouncedSave = debounce(async (voyageId, snapshot) => {
  // Save current state
  await saveCanvasState(voyageId, snapshot)

  // Log high-level events
  const events = detectEvents(snapshot)
  if (events.length > 0) {
    await appendEventLog(voyageId, events)
  }
}, 10000) // 10s after last edit
```

### Snapshot System (MVP)

**1. Auto-save (continuous)**
- Canvas state saved every 10s after pause
- One version: "latest"
- User never loses work

**2. Manual checkpoints (user-triggered)**
```tsx
function SaveCheckpointButton({ editor, voyageId }: Props) {
  async function saveCheckpoint() {
    const snapshot = editor.getSnapshot()

    // AI suggests label based on recent events
    const suggestedLabel = await generateSnapshotLabel(voyageId)

    // User can edit
    const label = await promptUserForLabel(suggestedLabel)

    // Save checkpoint
    await createSnapshot(voyageId, {
      version: nextVersion,
      state: snapshot,
      timestamp: new Date().toISOString(),
      label
    })
  }

  return <button onClick={saveCheckpoint}>Save checkpoint</button>
}
```

**AI-suggested labels:**
```typescript
async function generateSnapshotLabel(voyageId: string) {
  const recentEvents = await getEventLog(voyageId, { limit: 10 })

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'system',
      content: 'Suggest a short label for this checkpoint based on recent events'
    }, {
      role: 'user',
      content: JSON.stringify(recentEvents)
    }]
  })

  return response.choices[0].message.content
  // Example: "Added resume and JD comparison"
}
```

**Checkpoint limits:**
- Max 20 snapshots per voyage
- Auto-delete oldest when limit reached
- User can manually delete any snapshot

**3. Activity log for AI awareness**
```typescript
interface EventLog {
  events: Event[]  // Last 50 high-level events (rolling window)
}

// Detect meaningful events from canvas changes
function detectEvents(snapshot: TLDrawSnapshot): Event[] {
  const events: Event[] = []

  // File added?
  const newAssets = findNewAssets(snapshot)
  if (newAssets.length > 0) {
    events.push({
      type: 'file_added',
      details: { files: newAssets.map(a => a.name) },
      timestamp: new Date().toISOString()
    })
  }

  // Sticky notes created?
  const newNotes = findNewShapes(snapshot, 'note')
  if (newNotes.length > 0) {
    events.push({
      type: 'element_created',
      details: { type: 'sticky_note', count: newNotes.length },
      timestamp: new Date().toISOString()
    })
  }

  return events
}
```

### File Handling

**Drag & drop files onto canvas:**
```tsx
function Collaboard() {
  return (
    <Tldraw
      onMount={(editor) => {
        // Handle file drops
        editor.registerExternalAssetHandler('file', async (file) => {
          // 1. Upload to Supabase Storage
          const filePath = await uploadFile(voyageId, file)

          // 2. Parse if resume/JD
          const parsedData = await parseFile(file)

          // 3. Create attachment record
          await createAttachment(voyageId, {
            file_name: file.name,
            file_path: filePath,
            file_type: detectFileType(file),
            parsed_data: parsedData
          })

          // 4. Log event
          await appendEventLog(voyageId, {
            type: 'file_added',
            details: { fileName: file.name },
            timestamp: new Date().toISOString()
          })

          // 5. Return asset for canvas
          return {
            id: generateId(),
            type: 'file',
            src: filePath,
            name: file.name,
            metadata: parsedData
          }
        })
      }}
    />
  )
}
```

**File representation on canvas:**
```tsx
// Custom shape: FileCard
function FileCard({ file }: { file: Attachment }) {
  return (
    <div className="file-card">
      <div className="file-icon">📄</div>
      <div className="file-name">{file.file_name}</div>
      {file.parsed_data && (
        <div className="file-preview">
          {/* Show parsed data summary */}
          <div>{file.parsed_data.yearsOfExperience} YOE</div>
          <div>{file.parsed_data.skills?.slice(0, 3).join(', ')}</div>
        </div>
      )}
    </div>
  )
}
```

**File parsing:**
- Same logic as Phase 2 (resume/JD extraction)
- Parse in background, update card when ready
- Show loading state while parsing

### AI Canvas Interactions

**AI reads canvas state:**
```typescript
async function buildCanvasContext(voyageId: string) {
  const collaboard = await getCollaboard(voyageId)

  if (!collaboard) return ''

  const { currentState, eventLog } = collaboard

  // Count elements
  const elements = {
    files: countElementsByType(currentState, 'file'),
    stickyNotes: countElementsByType(currentState, 'note'),
    arrows: countElementsByType(currentState, 'arrow'),
    drawings: countElementsByType(currentState, 'draw')
  }

  // Recent activity
  const recentEvents = eventLog.slice(-10)

  return `
## Current Canvas State

Elements:
- ${elements.files} files uploaded
- ${elements.stickyNotes} sticky notes
- ${elements.arrows} connections/arrows
- ${elements.drawings} hand-drawn elements

Recent activity:
${recentEvents.map(e => `- ${e.type}: ${JSON.stringify(e.details)}`).join('\n')}
  `
}
```

**AI suggests additions via chat:**
```
User: Can you add a comparison table?

AI: Sure! I'll add a sticky note with a comparison table.

[AI adds element to staging area]
```

**Staging area for AI suggestions:**
```tsx
function Collaboard({ voyageId }: Props) {
  const [aiSuggestions, setAiSuggestions] = useState<Element[]>([])

  return (
    <div className="collaboard-container">
      <Tldraw />

      {/* Staging area */}
      <div className="ai-suggestions-staging">
        <h3>✨ AI Suggestions</h3>
        {aiSuggestions.map(element => (
          <SuggestionCard
            key={element.id}
            element={element}
            onAccept={() => {
              // User drags into canvas = accepted
              addToCanvas(element)
              removeSuggestion(element.id)
            }}
          />
        ))}
        <p className="hint">Drag up to accept →</p>
      </div>
    </div>
  )
}
```

**AI can create:**
- ✅ Sticky notes (text suggestions, summaries)
- ✅ Text labels (annotations, callouts)
- ✅ Arrows (showing relationships)
- 🔮 Tables (comparison grids) - Future
- ❌ Drawings (user domain)
- ❌ Moving existing elements (too intrusive)

**AI interaction rules:**
1. **Always ask first** (*"Should I add a comparison table?"*)
2. **Suggest in staging area** (user drags to accept)
3. **Device-appropriate elements** (mobile gets simple notes, desktop gets complex shapes)

### Mobile Experience

**Phase 1 (MVP): View-only + Chat**

**Mobile UI:**
```tsx
function MobileCollaboard({ voyageId }: Props) {
  const [showChat, setShowChat] = useState(false)

  return (
    <div className="mobile-collaboard">
      {/* Canvas view (read-only) */}
      <div className="canvas-view">
        <Tldraw
          readOnly={true}  // View-only
          snapshot={canvasState}
        />

        <button
          className="chat-toggle"
          onClick={() => setShowChat(true)}
        >
          💬 Chat about this
        </button>
      </div>

      {/* Chat overlay */}
      {showChat && (
        <div className="chat-overlay">
          <button onClick={() => setShowChat(false)}>
            ← Back to canvas
          </button>

          <ChatPanel voyageId={voyageId} />
        </div>
      )}
    </div>
  )
}
```

**Mobile workflow:**
1. User creates collaboard on desktop
2. Views on mobile (pan, zoom, read-only)
3. Taps "Chat about this"
4. Requests changes via chat: *"Add a comparison table"*
5. AI makes changes
6. User sees updated canvas
7. Continue collaborating via chat

**Benefits:**
- ✅ Faster to ship (no mobile editing complexity)
- ✅ Still valuable (can review, discuss, request changes)
- ✅ Validates demand before building mobile editing

**Phase 2 (Future): Mobile editing**
- If demand exists, add simplified canvas editing
- Tap to add sticky notes
- Files appear as stacked cards
- No freehand drawing
- Elements auto-arrange in grid

### Revert to Snapshot

**User can rollback to previous checkpoint:**
```tsx
function SnapshotHistory({ voyageId, editor }: Props) {
  const snapshots = useSnapshots(voyageId)

  async function revertToSnapshot(snapshot: Snapshot) {
    if (confirm(`Revert to "${snapshot.label}"? Current work will be saved as a new checkpoint.`)) {
      // Save current state as checkpoint
      await saveCheckpoint(editor, 'Before revert')

      // Load snapshot
      editor.store.loadSnapshot(snapshot.state)

      // Save as current state
      await saveCanvasState(voyageId, snapshot.state)
    }
  }

  return (
    <div className="snapshot-list">
      {snapshots.map(s => (
        <div key={s.version} className="snapshot-item">
          <div>{s.label}</div>
          <div>{formatDate(s.timestamp)}</div>
          <button onClick={() => revertToSnapshot(s)}>
            Restore
          </button>
        </div>
      ))}
    </div>
  )
}
```

### Success Criteria

- ✅ Canvas loads within 2s on desktop
- ✅ Auto-save preserves work (no data loss)
- ✅ Manual snapshots create within 1s
- ✅ AI suggestions appear in staging area
- ✅ Drag-to-accept works smoothly
- ✅ Mobile view-only + chat works on iOS/Android
- ✅ File uploads appear on canvas with parsed data
- ✅ Revert to snapshot restores canvas state

---

## Risk Mitigation

### Risk 1: Token Budget Explosion ✅ SOLVED

**Problem:** User with long history = huge context

**Solution:** Compression + RAG + User Control
- Compressed summaries (~88% token reduction)
- Prompt caching (~90% cost reduction)
- RAG for deep search (on-demand only)
- User commands (`/history`, `/forget`) for control

**Result:** Default context stays under 5k tokens, deep search available when needed

---

### Risk 2: Snapshot/Event Log Scaling ✅ SOLVED

**Problem:** Canvas events could grow unbounded

**Solution:** Simplified MVP
- Auto-save (single "latest" state)
- Manual snapshots only (max 20, user-triggered)
- Event log (last 50 high-level events, rolling window)

**Result:** Storage stays minimal, user gets core value (safety + checkpoints)

---

### Risk 3: AI Canvas Manipulation UX ✅ SOLVED

**Problem:** AI-generated elements could feel jarring

**Solution:** Staging Area + Always Ask First
- AI suggestions appear in dedicated staging zone
- User drags to accept (implicit approval)
- AI always asks before suggesting (*"Should I add X?"*)
- Device-appropriate elements (simple on mobile, rich on desktop)

**Result:** User stays in control, AI enhances without intruding

---

## Success Metrics

### User Engagement

**Post quality (curator mode):**
- ✅ 90%+ of posts have clear titles (<100 chars)
- ✅ 80%+ of posts include context (YOE, location, what they tried)
- ✅ 70%+ of posts receive expert engagement within 48h
- ✅ Post response rate >50% (vs. <10% on typical forums)

**Coach mode usage:**
- ✅ 60%+ of users try coach mode (get instant answers)
- ✅ Average 3+ exchanges per voyage (meaningful conversations)
- ✅ 70%+ of users report learning something new (survey)

**Collaboard engagement (Phase 5):**
- ✅ 40%+ of power users create collaboards
- ✅ Average 2+ files uploaded per collaboard
- ✅ 50%+ of collaboards have 3+ snapshots (iterative work)

### Technical Performance

**Response times:**
- ✅ AI responses <3s (p95)
- ✅ File parsing <10s for typical resume/JD
- ✅ Canvas load <2s on desktop, <3s on mobile

**Costs:**
- ✅ AI costs <$0.10 per voyage (with caching)
- ✅ Storage costs <$5/month for 1000 users
- ✅ Embedding costs <$10/month for 10k posts

### Quality Metrics

**Knowledge accumulation:**
- ✅ RAG knowledge base grows 10% month-over-month
- ✅ Expert posts embedded within 24h
- ✅ AI citation accuracy >90% (references correct sources)

**User satisfaction:**
- ✅ NPS >50 for collaborate mode
- ✅ 80%+ of users prefer AI-assisted posting vs. manual
- ✅ 60%+ of users return within 7 days (retention)

---

## Phase Sequencing

**Recommended order:**

### Phase 1-3: Core Collaboration (2-3 weeks)
Focus: Get split-view collaborate working with full context

1. **Week 1:** Split-view UI + draft persistence
2. **Week 2:** File upload + parsing + context extraction
3. **Week 3:** User context system + compression

**Deliverable:** Users can create high-quality posts with AI assistance, context-aware coaching

---

### Phase 4: Community Knowledge (1 week)
Focus: AI gets smarter from expert engagement

1. **Week 4:** RAG ingestion + search + integration

**Deliverable:** AI references expert insights, compound learning begins

---

### Phase 5: Collaboards (2-3 weeks)
Focus: Visual collaboration workspace

1. **Week 5-6:** Canvas component + auto-save + snapshots
2. **Week 7:** AI integration + staging area + mobile view-only

**Deliverable:** Power users can collaborate on visual artifacts

---

## Future Enhancements

**Phase 6+: Advanced Features**

1. **Real-time collaboration**
   - Multiple users on same collaboard
   - Websockets for live updates
   - Cursor tracking, presence indicators

2. **Mobile editing**
   - Simplified canvas interactions
   - Tap-to-add sticky notes
   - Template-based layouts

3. **AI canvas generation**
   - AI creates full diagrams (career paths, comparisons)
   - Export as images for sharing

4. **Cross-artifact linking**
   - Reference collaboard from post
   - Link draft to canvas
   - Unified artifact history

5. **Expert collaboration modes**
   - Invite expert to collaboard
   - Live coaching sessions
   - Annotation and feedback tools

---

## Conclusion

This roadmap transforms Voyager from a Q&A platform into **"The Canva for Collaboration"** - making high-quality community engagement inevitable through:

1. **AI-assisted artifact creation** (split-view collaborate)
2. **Rich user context** (compression + RAG + files)
3. **Compound community knowledge** (expert insights accumulate)
4. **Visual collaboration** (collaboards for complex thinking)

**Core Philosophy:**
- Quality over quantity
- Guided flexibility
- Accessible expertise
- Joyful collaboration

Every design decision serves the mission: **Make it easy to ask great questions and get great answers.**

Let's build it. 🚀
