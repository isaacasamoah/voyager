# Careersy Community Platform - Technical Specification
**For:** Claude Code
**Date:** October 16, 2025
**Language:** TypeScript (front and back)
**Status:** Pre-Launch (Pitch Phase)

---

## 🎯 Project Context

### The Situation
- **Client**: Careersy (career coaching company)
- **Current State**: They operate TWO separate products:
  1. AI chat tool (standalone)
  2. Community forum (high engagement, standalone)
- **The Problem**: Products are siloed - users can't leverage both, AI doesn't learn from community
- **The Opportunity**: Build unified platform where chat + forum enhance each other
- **The Goal**: Pitch this as an upgrade to their current setup

### What We're Building
**An intelligent career coaching platform where AI learns from validated community Q&As**

**Core Value Proposition**:
> "Your users already love the forum for community wisdom and the AI for instant help. But they're siloed. What if every great forum answer made your AI smarter? What if users could seamlessly move between private AI coaching and public community discussion? That's what we've built."

---

## 🏗️ Architecture Strategy: Hybrid Chat + Community

### User Experience Modes

**DUAL MODE INTERFACE:**

```
┌─────────────────────────────────────────┐
│  [Chat Mode] [Community Mode]          │ ← Mode tabs
├─────────────────────────────────────────┤
│                                         │
│  CHAT MODE (Default):                   │
│  - Private AI conversations             │
│  - 1-on-1 career coaching               │
│  - Resume-aware responses               │
│  - Toggle to "Share Publicly"           │
│                                         │
│  COMMUNITY MODE:                        │
│  - Public Q&A threads                   │
│  - Threaded discussions                 │
│  - Expert validation system             │
│  - Voting + best answers                │
│  - AI can suggest answers               │
│                                         │
└─────────────────────────────────────────┘
```

**Key Insight**: Same conversation can flow between private and public
- User asks privately → AI helps → User shares to community
- User posts publicly → Community answers → AI learns from validated answers

---

## 📊 Database Schema (PostgreSQL + Prisma)

### Strategy: Extend Current Schema (Don't Rebuild)

**Current Schema** (keep as-is):
- User (with Stripe fields + resume)
- Account (OAuth)
- Session
- Conversation
- Message

**Add Community Tables**:

```prisma
// PHASE 1: Add public/private functionality
model Community {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?
  createdAt   DateTime @default(now())

  members       CommunityMember[]
  conversations Conversation[]
}

model CommunityMember {
  id          String   @id @default(cuid())
  communityId String
  userId      String
  role        String   @default("member") // "member" | "expert" | "admin"
  joinedAt    DateTime @default(now())

  community Community @relation(fields: [communityId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([communityId, userId])
  @@index([userId])
}

// PHASE 1: Extend existing Conversation model
// ADD to existing Conversation:
//   isPublic      Boolean  @default(false)
//   communityId   String?
//   viewCount     Int      @default(0)

// PHASE 2: Add voting
model Vote {
  id        String   @id @default(cuid())
  messageId String
  userId    String
  value     Int      // -1 or 1
  createdAt DateTime @default(now())

  message Message @relation(fields: [messageId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([messageId, userId])
  @@index([messageId])
}

// PHASE 2: Add validation
model Validation {
  id                String   @id @default(cuid())
  messageId         String
  validatedBy       String
  validationType    String   // "affirm" | "contest" | "affirm_and_add"
  additionalContext String?  @db.Text
  createdAt         DateTime @default(now())

  message     Message @relation(fields: [messageId], references: [id], onDelete: Cascade)
  validator   User    @relation(fields: [validatedBy], references: [id], onDelete: Cascade)

  @@unique([messageId, validatedBy])
  @@index([messageId])
}

// PHASE 3: Training data collection
model TrainingData {
  id                  String   @id @default(cuid())
  questionMessageId   String
  answerMessageId     String
  validationScore     Int      @default(0)
  isValidated         Boolean  @default(false)
  createdAt           DateTime @default(now())

  question Message @relation("QuestionTraining", fields: [questionMessageId], references: [id], onDelete: Cascade)
  answer   Message @relation("AnswerTraining", fields: [answerMessageId], references: [id], onDelete: Cascade)

  @@unique([questionMessageId, answerMessageId])
  @@index([isValidated])
}

// PHASE 2: Extend existing Message model
// ADD to existing Message:
//   messageType    String?  @default("comment") // "question" | "answer" | "comment"
//   parentId       String?  // For threading
//   isAiGenerated  Boolean  @default(false)
```

---

## 🎨 Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router) ✅ Already using
- **Language**: TypeScript ✅ Already using
- **Styling**: Tailwind CSS with Careersy branding ✅ Already implemented
  - Cream (#fff9f2), Yellow (#fad02c), Black
  - Lexend Deca font for headings
- **State**: React hooks (useState, useContext)
- **Auth**: NextAuth.js ✅ Already using (Google + LinkedIn)

### Backend
- **Runtime**: Node.js
- **API**: Next.js API routes ✅ Already using
- **Database**: PostgreSQL (Neon) ✅ Already using
- **ORM**: Prisma ✅ Already using
- **AI**: **Switch from OpenAI to Anthropic Claude Sonnet 4** 🔄 Phase 3
- **Payments**: Stripe ✅ Already configured

### Infrastructure
- **Hosting**: Vercel ✅ Already deployed
- **Database**: Neon PostgreSQL ✅ Already provisioned
- **Storage**: Future (for file uploads beyond resume)

---

## 🚀 Implementation Roadmap (3-4 Weeks to Pitch)

### Week 1: Core Community UX 🎯 PRIORITY
**Goal**: Prove private/public integration works

**Tasks**:
1. ✅ Update Prisma schema (add Community, extend Conversation)
2. ✅ Database migration
3. ✅ Create single "Careersy Career Coaching" community
4. ✅ Add isPublic toggle to chat interface
5. ✅ Build `/community` feed page (show public conversations)
6. ✅ Update chat API to handle public/private mode
7. ✅ Add threading (reply to messages)
8. ✅ Mark messages as Question/Answer/Comment

**Deliverable**: Working demo where user can chat privately OR post publicly

---

### Week 2: Expert Validation System 🎯 PRIORITY
**Goal**: Show quality control and data collection

**Tasks**:
1. ✅ Add role system (member/expert/admin)
2. ✅ Build expert validation UI (Affirm/Contest/Affirm+Add)
3. ✅ Create Validation table + API
4. ✅ Visual indicators for validated answers (badges, checkmarks)
5. ✅ Add voting system (upvote/downvote)
6. ✅ Build Vote table + API
7. ✅ Sort answers by votes + validation

**Deliverable**: Experts can validate answers, creating trusted content

---

### Week 3: Training Data Pipeline + Claude Integration 🎯 PRIORITY
**Goal**: Prove AI learns from community

**Tasks**:
1. ✅ Create TrainingData table
2. ✅ Auto-collect validated Q&As (background job)
3. ✅ Switch from OpenAI to Anthropic Claude
4. ✅ Implement basic RAG (inject similar Q&As into context)
5. ✅ Build admin dashboard (view training data stats)
6. ✅ Add "AI learned from this" indicator on referenced answers

**Deliverable**: AI responds based on validated community answers

---

### Week 4: Polish + Pitch Materials 🎯 PRIORITY
**Goal**: Make it pitch-ready

**Tasks**:
1. ✅ Seed database with 15-20 realistic Q&A threads
2. ✅ Add user profiles with stats (questions asked, answers given, validations)
3. ✅ Build search functionality (search public conversations)
4. ✅ Performance optimization (caching, indexes)
5. ✅ Mobile responsive polish
6. 🎥 Record 5-minute product demo video
7. 📊 Create pitch deck (slides + business case)
8. 💰 Prepare pricing proposal

**Deliverable**: Pitch-ready demo + presentation materials

---

## 🎨 UI Components Spec

### 1. Chat Interface (Enhanced)
**Route**: `/chat`

**Current State**: Working 1-on-1 chat with sidebar
**Additions**:

```typescript
// Add mode toggle above input
<div className="mode-selector">
  <button onClick={() => setMode('private')}
          className={mode === 'private' ? 'active' : ''}>
    🔒 Private Chat
  </button>
  <button onClick={() => setMode('public')}
          className={mode === 'public' ? 'active' : ''}>
    🌍 Ask Community
  </button>
</div>

// When public mode, show optional title
{mode === 'public' && (
  <input
    placeholder="Give your question a title..."
    value={title}
    onChange={e => setTitle(e.target.value)}
  />
)}
```

---

### 2. Community Feed Page (NEW)
**Route**: `/community`

**Layout**:
```
┌─────────────────────────────────────────┐
│  Careersy Community                     │
│  🔍 Search...              [+ New Post] │
├─────────────────────────────────────────┤
│                                         │
│  📌 [Question] ↑24                      │
│  How to negotiate salary in Sydney?    │
│  by @sarah • 2 hours ago • 8 replies   │
│  ✅ Validated answer by @coach_mike    │
│                                         │
│  📌 [Question] ↑15                      │
│  Best tech companies in Melbourne?     │
│  by @james • 5 hours ago • 12 replies  │
│                                         │
└─────────────────────────────────────────┘
```

**Components**:
- `<CommunityFeed>` - Main feed container
- `<ConversationCard>` - Preview of each thread
- `<SearchBar>` - Filter conversations
- `<FilterTabs>` - All / Questions / Answered / Trending

---

### 3. Thread View (NEW)
**Route**: `/community/[conversationId]`

**Layout**:
```
┌─────────────────────────────────────────┐
│  ← Back to Community                    │
├─────────────────────────────────────────┤
│  [Question] 📌                          │
│  How to negotiate salary in Sydney?    │
│  Posted by @sarah • 2h ago             │
│  ────────────────────────────           │
│  I'm interviewing for a senior...      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ [Answer] ↑12 ✅ Validated       │   │
│  │ As a career coach, I recommend  │   │
│  │ researching market rates...     │   │
│  │ by @coach_mike (Expert)         │   │
│  │   [Reply] [Mark as Best]        │   │
│  │                                 │   │
│  │   ↳ [Reply] ↑3                  │   │
│  │     This worked for me! I got...│   │
│  │     by @john                    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Your answer...                  │   │
│  │ [Mark as: Answer | Comment]     │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Components**:
- `<ThreadHeader>` - Question + metadata
- `<MessageTree>` - Recursive component for threading
- `<Message>` - Individual message with actions
- `<ExpertActions>` - Validation buttons (if user is expert)
- `<ReplyForm>` - Compose reply

---

### 4. Expert Validation UI
**Shows for experts only**

```typescript
<div className="expert-actions">
  <button onClick={() => validate('affirm')}
          className="bg-green-100 text-green-800">
    ✅ Affirm Answer
  </button>
  <button onClick={() => validate('contest')}
          className="bg-red-100 text-red-800">
    ❌ Contest Answer
  </button>
  <button onClick={() => validate('affirm_and_add')}
          className="bg-blue-100 text-blue-800">
    ✅➕ Affirm & Add Context
  </button>
</div>

{validationType === 'affirm_and_add' && (
  <textarea
    placeholder="Add your expert context..."
    value={additionalContext}
  />
)}
```

---

## 🔧 Key Feature Implementation

### Feature 1: Private ↔ Public Toggle

**State Management**:
```typescript
type ConversationMode = 'private' | 'public'

const [mode, setMode] = useState<ConversationMode>('private')
const [title, setTitle] = useState('')

const handleSend = async () => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      message: input,
      mode: mode,
      title: mode === 'public' ? title : undefined,
      conversationId: conversationId
    })
  })
}
```

**API Logic** (`/api/chat/route.ts`):
```typescript
export async function POST(req: NextRequest) {
  const { message, mode, title, conversationId } = await req.json()

  let conversation
  if (conversationId) {
    conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    })
  } else {
    conversation = await prisma.conversation.create({
      data: {
        userId: session.user.id,
        title: title || generateTitle(message),
        isPublic: mode === 'public',
        communityId: mode === 'public' ? CAREERSY_COMMUNITY_ID : null
      }
    })
  }

  // Save user message
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      userId: session.user.id,
      role: 'user',
      content: message
    }
  })

  // Get AI response (Claude)
  const aiResponse = await getClaudeResponse(message, conversationHistory)

  // Save AI message
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: 'assistant',
      content: aiResponse,
      isAiGenerated: true
    }
  })

  return NextResponse.json({ message: aiResponse, conversationId: conversation.id })
}
```

---

### Feature 2: Expert Validation

**API** (`/api/validations/route.ts`):
```typescript
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const { messageId, validationType, additionalContext } = await req.json()

  // Check if user is expert
  const member = await prisma.communityMember.findFirst({
    where: {
      userId: session.user.id,
      role: { in: ['expert', 'admin'] }
    }
  })

  if (!member) {
    return NextResponse.json({ error: 'Only experts can validate' }, { status: 403 })
  }

  // Create validation
  const validation = await prisma.validation.create({
    data: {
      messageId,
      validatedBy: session.user.id,
      validationType,
      additionalContext
    }
  })

  // If affirmed, collect training data
  if (validationType === 'affirm') {
    await collectTrainingData(messageId)
  }

  return NextResponse.json({ validation })
}
```

---

### Feature 3: Training Data Collection

**Background Job** (`/api/cron/collect-training/route.ts`):
```typescript
export async function GET(req: NextRequest) {
  // Find Q&A pairs that are validated but not yet collected
  const validatedAnswers = await prisma.validation.findMany({
    where: {
      validationType: 'affirm',
      message: {
        messageType: 'answer'
      }
    },
    include: {
      message: {
        include: {
          conversation: {
            include: {
              messages: {
                where: { messageType: 'question' },
                take: 1
              }
            }
          }
        }
      }
    }
  })

  for (const validation of validatedAnswers) {
    const questionMessage = validation.message.conversation.messages[0]
    const answerMessage = validation.message

    // Check if already exists
    const existing = await prisma.trainingData.findFirst({
      where: {
        questionMessageId: questionMessage.id,
        answerMessageId: answerMessage.id
      }
    })

    if (!existing) {
      await prisma.trainingData.create({
        data: {
          questionMessageId: questionMessage.id,
          answerMessageId: answerMessage.id,
          isValidated: true,
          validationScore: await getVoteCount(answerMessage.id)
        }
      })
    }
  }

  return NextResponse.json({ success: true })
}
```

---

### Feature 4: RAG-Enhanced AI

**Claude Integration with RAG** (`/lib/ai.ts`):
```typescript
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function getClaudeResponse(
  userMessage: string,
  conversationHistory: Message[],
  useRAG = true
) {
  let systemPrompt = `You are an expert career coach specializing in the Australian tech industry.`

  if (useRAG) {
    // Search for similar validated Q&As
    const similarQAs = await searchTrainingData(userMessage, limit: 3)

    if (similarQAs.length > 0) {
      systemPrompt += `\n\nHere are validated answers from our expert coaches:\n\n`
      similarQAs.forEach(qa => {
        systemPrompt += `Q: ${qa.question.content}\n`
        systemPrompt += `A: ${qa.answer.content}\n\n`
      })
      systemPrompt += `Use these examples to inform your answer, but respond naturally.`
    }
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [
      ...conversationHistory.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
      { role: 'user', content: userMessage }
    ]
  })

  return response.content[0].text
}

async function searchTrainingData(query: string, limit: number) {
  // Simple keyword matching for MVP (upgrade to vector search later)
  const trainingData = await prisma.trainingData.findMany({
    where: {
      isValidated: true,
      question: {
        content: {
          contains: extractKeywords(query),
          mode: 'insensitive'
        }
      }
    },
    include: {
      question: true,
      answer: true
    },
    take: limit,
    orderBy: { validationScore: 'desc' }
  })

  return trainingData
}
```

---

## 🎯 Demo Script (For Pitch)

### Scene 1: Private AI Chat (Existing)
**Action**: User logs in, asks "What salary should I expect for a senior engineer in Sydney?"
**Result**: AI provides personalized answer based on resume
**Narration**: "This is what you already have - private AI career coaching."

### Scene 2: Share to Community
**Action**: User clicks "Share this publicly to help others"
**Result**: Conversation appears in community feed
**Narration**: "But now, users can seamlessly share helpful conversations with the community."

### Scene 3: Community Engagement
**Action**: Another user finds the thread, adds their experience
**Result**: Thread grows with real experiences
**Narration**: "Community members share real-world insights..."

### Scene 4: Expert Validation
**Action**: Careersy coach reviews thread, clicks "✅ Affirm Answer"
**Result**: Answer gets validation badge
**Narration**: "Your coaches validate quality answers, building trust and training data."

### Scene 5: AI Learning
**Action**: Third user asks similar question privately
**Result**: AI references the validated community answer
**Narration**: "Now when someone asks a similar question, the AI learns from YOUR coaches' expertise."

### Scene 6: Admin Dashboard
**Action**: Show dashboard with stats
**Result**: "50+ validated Q&As collected, AI accuracy improved 40%"
**Narration**: "You're building a proprietary knowledge base that becomes your competitive moat."

---

## 💰 Pricing Proposal (For Pitch)

### Current State
- Careersy AI chat: $X/month (separate vendor)
- Careersy forum: $Y/month (separate vendor)
- **Total: $X + $Y/month**
- **Problem**: Fragmented, no synergy

### Proposed
- **Unified Platform**: $149/month base (25 seats)
- **Additional seats**: $5/seat/month
- **Includes**:
  - Private AI coaching (Claude Sonnet 4)
  - Public community forum
  - Expert validation system
  - Training data collection
  - Resume-aware responses
  - Stripe integration (ready for their customers)

### Value Proposition
1. **Cost savings**: One platform vs two vendors
2. **Better product**: AI + community = smarter over time
3. **Competitive moat**: Your AI, trained on YOUR data
4. **Network effects**: More users = better AI = more engagement

---

## 📊 Success Metrics (For Pitch)

### Week 1: Foundation
- ✅ Private/public toggle working
- ✅ Community feed live
- ✅ Threading functional

### Week 2: Validation
- ✅ Expert validation system deployed
- ✅ Voting functional
- ✅ 20+ seeded Q&A threads

### Week 3: Intelligence
- ✅ Claude integration live
- ✅ RAG working (AI cites community answers)
- ✅ Training data pipeline collecting

### Week 4: Pitch Ready
- ✅ Demo video recorded
- ✅ Pitch deck complete
- ✅ 50+ validated Q&As in database
- ✅ Mobile responsive
- ✅ Search working

---

## 🚨 What We're NOT Building (Yet)

**Deferred to post-pitch**:
- Challenge posts with prizes (complex, unproven demand)
- Multiple communities (they only need one)
- Advanced search (vector/semantic search)
- File uploads beyond resume
- Mobile apps (web is fine for demo)
- Analytics dashboard (basic stats only)

---

## 🧪 Testing Strategy

### Philosophy
**Test what matters, not everything.** Focus on:
- Critical user paths (auth, chat, payments)
- API endpoints (chat, resume, community)
- Database integrity (models, relations)
- Component behavior (not styling)

### Testing Stack
- **Framework**: Vitest (fast, modern, Vite-based)
- **React Testing**: @testing-library/react
- **DOM Mocking**: jsdom
- **Coverage**: Vitest coverage reports

### Test Organization
```
tests/
├── api/              # API route tests
│   ├── chat.test.ts
│   ├── resume.test.ts
│   └── community.test.ts
├── components/       # Component tests
│   ├── ChatInterface.test.tsx
│   └── CommunityFeed.test.tsx
├── lib/              # Library/utility tests
│   ├── db.test.ts
│   └── ai.test.ts
└── setup.ts          # Test configuration
```

### Running Tests
```bash
npm run test              # Watch mode (development)
npm run test:run          # Run once (CI/pre-commit)
npm run test:ui           # Visual test UI
npm run test:coverage     # Coverage report
```

### Pre-Commit Requirement
**All tests must pass before committing:**
```bash
npm run test:run && npm run type-check && npm run build
```

If any fail → don't commit. Fix first.

### What to Test

**API Routes** (tests/api/):
- Request validation
- Authentication checks
- Database operations
- Response format
- Error handling

**Components** (tests/components/):
- Render without errors
- User interactions (clicks, input)
- Conditional rendering (loading states)
- Props handling

**Database** (tests/lib/):
- Model availability
- Relations work
- Queries return expected shape

**What NOT to Test**:
- Styling/CSS (visual regression is manual)
- Third-party libraries (OpenAI, Stripe, etc)
- Environment-specific issues (use staging for that)

### Test Coverage Goals
- **Critical paths**: 100% (auth, payments, core chat)
- **New features**: 80%+ before merge
- **Overall**: 60%+ (pragmatic, not dogmatic)

---

## 📦 Git Workflow & Tagging

### Core Principle
**Every functional commit gets tagged** for instant rollback capability.

### What is a "Functional Commit"?
One where:
1. ✅ All existing features work
2. ✅ Tests pass (`npm run test:run`)
3. ✅ TypeScript compiles (`npm run type-check`)
4. ✅ App builds (`npm run build`)

### Commit & Tag Workflow
```bash
# 1. Make changes
# 2. Run pre-commit checks
npm run test:run && npm run type-check && npm run build

# 3. If all pass, commit
git add .
git commit -m "feat: add private/public toggle"

# 4. Tag immediately
git tag v0.3.0-public-toggle

# 5. Push with tags
git push origin main --tags
```

### Tag Format
```
v[MAJOR].[MINOR].[PATCH]-[FEATURE]
```

**Examples:**
- `v0.2.0-community-schema` - Database migration
- `v0.3.0-public-toggle` - Private/public mode
- `v0.4.0-community-feed` - Community feed page
- `v1.0.0-pitch-ready` - Demo-ready

### Quick Rollback
```bash
# List tags
git tag -l

# Rollback to working state
git checkout v0.3.0-public-toggle

# Or hard reset (DESTRUCTIVE)
git reset --hard v0.3.0-public-toggle
```

### Why This Matters
- No "where were we?" confusion
- Instant rollback to any working state
- Clear project timeline
- Safe experimentation
- Demo-ready snapshots for client

**See [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) for complete workflow documentation.**

---

## 🎯 Next Immediate Steps

### Today (Day 1):
1. ✅ Update this spec with hybrid plan
2. ✅ Create new Prisma schema migration
3. ✅ Add isPublic field to Conversation
4. ✅ Create Community + CommunityMember tables
5. ✅ Seed single "Careersy Career Coaching" community
6. ✅ Add private/public toggle to chat UI

### Tomorrow (Day 2):
7. ✅ Build `/community` feed page
8. ✅ Update chat API to respect mode
9. ✅ Test end-to-end private → public flow

### This Week:
10. ✅ Add threading (replies)
11. ✅ Mark messages as question/answer/comment
12. ✅ Build thread view page

---

## 🛠️ Environment Variables

**Keep existing**:
```env
DATABASE_URL=              # Neon PostgreSQL ✅
NEXTAUTH_SECRET=          # ✅
NEXTAUTH_URL=             # ✅
GOOGLE_CLIENT_ID=         # ✅
GOOGLE_CLIENT_SECRET=     # ✅
LINKEDIN_CLIENT_ID=       # ✅
LINKEDIN_CLIENT_SECRET=   # ✅
STRIPE_SECRET_KEY=        # ✅
STRIPE_WEBHOOK_SECRET=    # ✅
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY= # ✅
```

**Add new**:
```env
ANTHROPIC_API_KEY=        # 🔄 Get from console.anthropic.com
OPENAI_API_KEY=           # Keep for migration period
```

---

## ✅ Definition of Done

**Demo is pitch-ready when**:
1. ✅ User can chat privately (existing feature)
2. ✅ User can toggle to public and share
3. ✅ Community feed shows public threads
4. ✅ Users can reply and thread discussions
5. ✅ Experts can validate answers
6. ✅ Voting works (upvote/downvote)
7. ✅ AI responds using validated community answers
8. ✅ Training data pipeline collecting Q&As
9. ✅ 50+ realistic seeded conversations
10. ✅ Clean, polished UI with Careersy branding
11. ✅ Mobile responsive
12. ✅ 5-min demo video recorded
13. ✅ Pitch deck complete

---

**Let's build this and win the deal. 🚀**

Last Updated: October 16, 2025
