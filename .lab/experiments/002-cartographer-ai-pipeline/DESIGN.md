# Experiment 002: Cartographer → AI Enhancement Pipeline

**Status:** 🚧 IN PROGRESS
**Start Date:** 2025-11-01
**Target Completion:** 2025-11-07 (6-7 days)
**Owner:** Kai (backend) + Zara (ML) + Marcus (infrastructure)

---

## Goal

Close the feedback loop: Make Voyager learn from expert knowledge captured in Cartographer sessions.

**Success Criteria:**
- Eli uses Cartographer 3+ times
- Navigator responses improve measurably after Cartographer sessions
- Can demonstrate "AI learned from you" to Eli
- Knowledge persists and compounds over time

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   CARTOGRAPHER SESSION                       │
│  Expert ──> AI Interview ──> Structured Knowledge            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  JSON OUTPUT   │
              │  (structured)  │
              └────┬───┬───┬───┘
                   │   │   │
        ┌──────────┘   │   └──────────┐
        ▼              ▼              ▼
   ┌─────────┐  ┌──────────┐  ┌─────────────┐
   │ PROMPTS │  │   RAG    │  │ FINE-TUNING │
   │ UPDATE  │  │ DATASET  │  │  EXAMPLES   │
   └─────────┘  └──────────┘  └─────────────┘
        │              │              │
        └──────┬───────┴──────┬───────┘
               ▼              ▼
          NAVIGATOR       FUTURE
          IMPROVES      MODEL TRAINING
```

---

## Part 1: Structured JSON Output (2 days)

**Owner:** Zara (prompt design) + Kai (backend integration)

### 1.1 JSON Schema Design

```typescript
interface CartographerSession {
  // Metadata
  sessionId: string                 // UUID
  expertEmail: string               // From auth
  communityId: string               // e.g., "careersy"
  timestamp: string                 // ISO 8601
  topic: string                     // Extracted from conversation

  // Raw conversation
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }>

  // Structured knowledge extraction
  insights: Array<{
    category: 'best-practice' | 'mistake-to-avoid' | 'framework' | 'metric' | 'edge-case' | 'tool-recommendation'
    content: string                 // The actual insight
    context: string                 // When/where this applies
    examples?: string[]             // Concrete examples if provided
    metadata?: {
      companies?: string[]          // e.g., ["Atlassian", "Canva"]
      roles?: string[]              // e.g., ["Software Engineer"]
      experience?: string           // e.g., "3-5 years"
      location?: string             // e.g., "ANZ", "Sydney"
    }
  }>

  // Prompt enhancement suggestions
  promptUpdates: Array<{
    section: string                 // e.g., "resumeRewriteRules", "jobSearchCoaching"
    suggestedAddition: string       // What to add
    reasoning: string               // Why this improves the prompt
    priority: 'high' | 'medium' | 'low'
  }>

  // RAG dataset entries
  ragEntries: Array<{
    question: string                // What a user might ask
    answer: string                  // Expert's insight
    keywords: string[]              // For semantic search
    relevanceScore: number          // 0-1, how generally applicable
  }>

  // Fine-tuning examples
  finetuningExamples: Array<{
    prompt: string                  // User question or scenario
    completion: string              // Expert-informed response
    constitutionalAlignment: boolean // Does this follow our principles?
  }>
}
```

### 1.2 Prompt Design (Zara)

**Approach:** Two-phase extraction

**Phase 1: Cartographer interview** (existing behavior)
- AI interviews expert (current UX, no changes)
- Conversation flows naturally
- Expert doesn't see JSON generation

**Phase 2: Post-session extraction** (new)
- After session concludes (user says "that's enough" or offers to structure)
- AI generates structured JSON in background
- User sees: "✅ Knowledge documented and added to community knowledge base"

**Implementation:**

```typescript
// In chat-stream API route
if (mode === 'cartographer' && sessionComplete) {
  // 1. Normal Cartographer response to user
  const userResponse = await generateCartographerResponse(messages)

  // 2. Background: Extract structured knowledge
  const extractionPrompt = `
You are analyzing a Cartographer session where an expert shared knowledge.

CONVERSATION:
${conversationHistory}

Extract structured insights following this schema:
${JSON.stringify(CartographerSessionSchema)}

Focus on:
- Specific, actionable insights (not generic advice)
- Concrete examples with companies, roles, metrics
- Edge cases and "it depends" scenarios
- Mistakes to avoid from expert's experience
- Framework or approach they used

Output valid JSON only.
`

  const structuredKnowledge = await extractStructuredKnowledge(extractionPrompt)

  // 3. Store in database
  await saveCartographerSession(structuredKnowledge)

  // 4. Trigger downstream pipelines (prompts, RAG, fine-tuning)
  await Promise.all([
    updateCommunityPrompts(structuredKnowledge),
    populateRAGDataset(structuredKnowledge),
    generateFineTuningExamples(structuredKnowledge)
  ])
}
```

### 1.3 Database Schema (Marcus)

**New table:** `cartographer_sessions`

```prisma
model CartographerSession {
  id            String   @id @default(uuid())
  sessionId     String   @unique
  expertEmail   String
  communityId   String
  timestamp     DateTime @default(now())
  topic         String

  // JSON columns
  messages      Json     // Raw conversation
  insights      Json     // Structured insights
  promptUpdates Json     // Suggested prompt improvements
  ragEntries    Json     // RAG dataset entries
  finetuningExamples Json // Training examples

  // Metadata
  processed     Boolean  @default(false)
  processingError String?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([expertEmail])
  @@index([communityId])
  @@index([timestamp])
}
```

### 1.4 API Endpoints (Kai)

**New endpoint:** `POST /api/cartographer/extract`

```typescript
// app/api/cartographer/extract/route.ts
export async function POST(request: Request) {
  const { sessionId, messages, expertEmail, communityId } = await request.json()

  // 1. Extract structured knowledge using LLM
  const structured = await extractStructuredKnowledge(messages, communityId)

  // 2. Save to database
  const session = await prisma.cartographerSession.create({
    data: {
      sessionId,
      expertEmail,
      communityId,
      topic: structured.topic,
      messages: messages,
      insights: structured.insights,
      promptUpdates: structured.promptUpdates,
      ragEntries: structured.ragEntries,
      finetuningExamples: structured.finetuningExamples,
      processed: false
    }
  })

  // 3. Trigger processing pipeline (background)
  triggerPipelineProcessing(session.id)

  return NextResponse.json({ success: true, sessionId: session.id })
}
```

---

## Part 2: Auto-Prompt Enhancement (1 day)

**Owner:** Zara + Kai

### 2.1 Prompt Update Strategy

**Approach:** Git-based versioning + A/B testing

```typescript
// lib/prompts/enhance.ts
export async function enhanceCommunityPrompt(
  communityId: string,
  promptUpdates: PromptUpdate[]
) {
  // 1. Load current community config
  const currentConfig = await loadCommunityConfig(communityId)

  // 2. Apply high-priority updates
  const updatedConfig = applyPromptUpdates(currentConfig, promptUpdates)

  // 3. Write to versioned file
  const version = Date.now()
  await fs.writeFile(
    `communities/${communityId}.v${version}.json`,
    JSON.stringify(updatedConfig, null, 2)
  )

  // 4. Update main config (with backup)
  await fs.copyFile(
    `communities/${communityId}.json`,
    `communities/${communityId}.backup.json`
  )
  await fs.writeFile(
    `communities/${communityId}.json`,
    JSON.stringify(updatedConfig, null, 2)
  )

  // 5. Log change for A/B testing
  await logPromptChange(communityId, version, promptUpdates)
}
```

**Safety:**
- Always backup before updating
- Version control all changes
- A/B test prompt changes (measure Navigator quality before/after)
- Manual review for major changes

---

## Part 3: RAG Dataset Population (2-3 days)

**Owner:** Marcus + Kai

### 3.1 Vector Database Setup

**Technology choice:** pgvector (Postgres extension)

**Why pgvector:**
- Already using Postgres (Neon supports pgvector)
- No additional infrastructure
- Good enough for <10k documents (alpha stage)
- Can migrate to dedicated vector DB later if needed

### 3.2 Schema

```prisma
model KnowledgeBase {
  id          String   @id @default(uuid())
  communityId String
  sessionId   String   // Link to CartographerSession

  // Content
  question    String   // What user might ask
  answer      String   // Expert insight
  keywords    String[] // For keyword search

  // Vector embedding
  embedding   Unsupported("vector(1536)")  // OpenAI ada-002 dimension

  // Metadata
  expertEmail String
  category    String   // From insight.category
  relevance   Float    // 0-1 score

  createdAt   DateTime @default(now())

  @@index([communityId])
  @@index([category])
}
```

### 3.3 Embedding Generation

```typescript
// lib/rag/embed.ts
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text
  })
  return response.data[0].embedding
}

export async function populateRAGFromSession(session: CartographerSession) {
  for (const entry of session.ragEntries) {
    // Generate embedding for question + answer
    const combined = `${entry.question}\n\n${entry.answer}`
    const embedding = await generateEmbedding(combined)

    // Store in database
    await prisma.knowledgeBase.create({
      data: {
        communityId: session.communityId,
        sessionId: session.sessionId,
        question: entry.question,
        answer: entry.answer,
        keywords: entry.keywords,
        embedding,
        expertEmail: session.expertEmail,
        category: 'expert-insight',
        relevance: entry.relevanceScore
      }
    })
  }
}
```

### 3.4 RAG Retrieval in Navigator

```typescript
// lib/rag/retrieve.ts
export async function retrieveRelevantKnowledge(
  query: string,
  communityId: string,
  limit: number = 3
): Promise<KnowledgeBase[]> {
  // 1. Generate query embedding
  const queryEmbedding = await generateEmbedding(query)

  // 2. Vector similarity search (pgvector)
  const results = await prisma.$queryRaw`
    SELECT *
    FROM "KnowledgeBase"
    WHERE "communityId" = ${communityId}
    ORDER BY embedding <-> ${queryEmbedding}::vector
    LIMIT ${limit}
  `

  return results
}
```

### 3.5 Navigator Integration

```typescript
// In chat-stream when mode === 'navigator'
if (mode === 'navigator') {
  // Retrieve relevant expert knowledge
  const relevantKnowledge = await retrieveRelevantKnowledge(
    userMessage,
    communityId
  )

  // Add to system prompt
  const enhancedPrompt = `
${baseNavigatorPrompt}

EXPERT KNOWLEDGE (from Cartographer sessions):
${relevantKnowledge.map(k => `
Q: ${k.question}
A: ${k.answer}
`).join('\n')}

Use this expert knowledge when relevant, citing it as:
"Based on insights from ${k.expertEmail.split('@')[0]}..."
`
}
```

---

## Part 4: Fine-Tuning Examples (1 day)

**Owner:** Zara

### 4.1 Dataset Generation

```typescript
// lib/finetuning/generate.ts
export async function generateFineTuningDataset(
  sessions: CartographerSession[]
): Promise<FineTuningExample[]> {
  const examples: FineTuningExample[] = []

  for (const session of sessions) {
    for (const example of session.finetuningExamples) {
      // OpenAI fine-tuning format
      examples.push({
        messages: [
          { role: 'system', content: getNavigatorPrompt(session.communityId) },
          { role: 'user', content: example.prompt },
          { role: 'assistant', content: example.completion }
        ]
      })
    }
  }

  return examples
}
```

### 4.2 Export for Training

```typescript
// app/api/finetuning/export/route.ts
export async function GET(request: Request) {
  const { communityId } = await request.json()

  // Get all processed sessions
  const sessions = await prisma.cartographerSession.findMany({
    where: { communityId, processed: true }
  })

  // Generate training dataset
  const dataset = await generateFineTuningDataset(sessions)

  // Export as JSONL (OpenAI format)
  const jsonl = dataset.map(ex => JSON.stringify(ex)).join('\n')

  return new Response(jsonl, {
    headers: {
      'Content-Type': 'application/jsonl',
      'Content-Disposition': `attachment; filename="${communityId}-finetuning-${Date.now()}.jsonl"`
    }
  })
}
```

---

## Implementation Timeline

### Day 1-2: JSON Output Structure
- [ ] Design extraction prompt (Zara)
- [ ] Create database schema (Marcus)
- [ ] Run Prisma migration (Marcus)
- [ ] Build extraction API endpoint (Kai)
- [ ] Integrate with Cartographer flow (Kai)
- [ ] Test with mock session (Team)

### Day 3: Auto-Prompt Enhancement
- [ ] Design prompt update strategy (Zara)
- [ ] Build prompt enhancement logic (Kai)
- [ ] Version control system (Kai)
- [ ] Test prompt updates (Zara)

### Day 4-6: RAG Dataset Population
- [ ] Setup pgvector on Neon (Marcus)
- [ ] Create KnowledgeBase schema (Marcus)
- [ ] Build embedding generation (Kai)
- [ ] Implement vector search (Marcus)
- [ ] Integrate with Navigator (Kai)
- [ ] Test retrieval quality (Zara)

### Day 7: Fine-Tuning Export
- [ ] Build dataset generation (Zara)
- [ ] Create export endpoint (Kai)
- [ ] Test JSONL format (Zara)

---

## Testing Strategy

### Unit Tests
- JSON extraction accuracy
- Embedding generation
- Vector similarity search
- Prompt update logic

### Integration Tests
- End-to-end Cartographer → RAG flow
- Navigator retrieval quality
- Prompt version rollback

### User Testing with Eli
- Use Cartographer 3+ times
- Measure Navigator improvement
- Gather qualitative feedback

---

## Success Metrics

**Quantitative:**
- 3+ Cartographer sessions completed by Eli
- Navigator cites expert knowledge in 50%+ of relevant queries
- Average session time <15 minutes

**Qualitative:**
- Eli reports Navigator feels "smarter" after Cartographer sessions
- Eli voluntarily shows feature to another coach
- Clients notice improvement in Navigator responses

---

## Rollback Plan

If pipeline causes issues:
1. Disable RAG retrieval (feature flag)
2. Revert prompt updates (restore backup)
3. Keep collecting data (don't stop sessions)
4. Fix issues, re-enable gradually

---

**Next Steps:** Start Day 1-2 implementation (JSON output structure)
