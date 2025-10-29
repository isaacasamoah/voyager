# Future Features - Voyager Platform

**Purpose:** Conceptual exploration and long-term vision features. Not immediate roadmap.

**How this differs from other docs:**
- **VOYAGER_VISION.md** - Current sprint focus + parking lot (next 2-3 weeks)
- **COLLABORATION_ROADMAP.md** - Technical implementation phases (3-6 months)
- **FUTURE_FEATURES.md** (this doc) - Conceptual ideas and marketing language (6+ months)

---

## 1. Expert Interview (Prompt Generation)

**Purpose:** Collaborative AI-expert prompt building to create accurate, domain-specific system prompts for each community.

**Flow:**
1. **AI interviews expert:** Ask about domain expertise, common questions, key concepts, tone/style preferences
2. **Expert interviews AI:** Test responses, validate knowledge, identify gaps
3. **Generate prompt:** AI creates system prompt based on interview insights
4. **Iterative refinement:** Expert reviews, edits, approves
5. **Continuous improvement:** Periodic check-ins to update prompt based on community evolution

**Why this matters:**
- Creates authentic expert voice in AI responses
- Validates domain knowledge before community launch
- Builds trust between expert and AI system
- Enables continuous learning and improvement

**Implementation notes:**
- Guided interview flow (structured questions)
- Prompt versioning and A/B testing
- Expert dashboard to review/edit prompts
- Schedule automated check-in reminders

**Priority:** High (enables quality community launches)
**Estimated effort:** 1-2 weeks
**Dependencies:** Community auth, expert roles

---

## 2. Collaborative Posting with AI

**Purpose:** Transform "collaborate mode" from simple public sharing into AI-assisted community question crafting.

**Mental model:** AI as community catalyst, not answer provider. The dandelion effect - scattered wisdom, unified insights.

**Private mode:** AI = your coach (1-on-1, instant answers)
**Collaborate mode:** AI = your editor/curator (helps craft questions worth community's time)

### Features:

#### Phase 1 - MVP (Week 1-2)
**Clarifying questions:**
- AI asks probing questions before posting
- Turns vague questions into specific, answerable ones
- Multi-turn conversation to gather context

**Draft post preview:**
- AI generates structured post (context → specifics → ask)
- User reviews and edits before publishing
- Suggests improved title

**Example flow:**
```
USER: "I'm struggling with System Design interviews"

AI: "Let's craft this into a great community post. A few questions:
1. What specific aspect? (architecture, scaling, databases, trade-offs)
2. What have you already tried?
3. What's your experience level?
4. Are you preparing for a specific company?"

[User answers]

AI: "Here's a draft post:

**Title:** How do you confidently discuss trade-offs in system design interviews?

[Structured post with context, specifics, clear ask]

Ready to post, or want to refine further?"
```

#### Phase 2 (Week 3-4)
**Tag suggestions:**
- AI analyzes content and suggests 3-5 relevant tags
- User can edit/approve
- Improves discoverability

**Expert matching:**
- Identifies which community experts might help
- Suggests @mentions (e.g., "This looks like a question for @eli")
- Optional expert notifications

#### Phase 3 (Month 2)
**Similar thread detection:**
- Vector search on conversation content
- Shows related conversations before posting
- "These 2 conversations are related—want to check them first?"
- Reduces duplicate questions, increases engagement on existing threads

**External collaboration (LinkedIn agent):**
- AI suggests relevant people outside community
- "Want to invite Sarah from LinkedIn? She's a Staff Engineer at Canva."
- User sends invite link
- Expands community expertise organically

### Design Principles:

**Clarify, don't solve:**
- AI helps user ask better questions
- Leaves questions genuinely open-ended
- Preserves vulnerability that invites help
- Avoids over-coaching (question shouldn't look like it contains the answer)

**Respect community attention:**
- Well-crafted questions get better responses
- Reduces noise, increases signal
- Makes user look thoughtful and prepared
- Creates culture of quality over quantity

**AI as servant of human connection:**
- Not replacing experts or community
- Facilitating meaningful conversations
- Bringing scattered knowledge together (dandelion effect)
- Nurturing human collaboration

### Implementation notes:

**Technical approach:**
- Separate chat mode state (private vs collaborate-draft)
- Collaborate mode = multi-turn conversation until "post" action
- Store drafts in conversation with `isDraft: true` flag
- Publish action converts to public conversation
- Tag system (simple string array on Conversation model)
- Vector embeddings for similar thread detection (Pinecone/pgvector)

**UX considerations:**
- Clear mode indicators (private coaching vs collaborative drafting)
- Draft preview before publishing
- Edit functionality post-publish
- Notification preferences for expert mentions

**Priority:** High (core differentiator)
**Estimated effort:** 3-4 weeks across phases
**Dependencies:** Community auth, expert roles, public/private conversations

---

## 3. Voyager Meta-Community (Platform Feedback & Collaboration)

**Purpose:** Turn Voyager itself into a community about building Voyager - a place for users to collaborate on improving the open-source platform.

**The Question:** Should Voyager (the community discovery guide) also be a community about the platform itself?

**Vision:**
- Users can share feedback, ideas, and feature requests
- Contribute to open-source development
- Learn how Voyager works under the hood
- Collaborate on making the platform better
- AI co-pilot learns from community interactions about platform improvement

**Considerations:**
- Does "collaborate mode" make sense for Voyager if it becomes a meta-community?
- Should conversations about the platform be public/persistent?
- How do we distinguish between "personal guide to communities" vs "community about communities"?
- Would this confuse the core Voyager experience (discovery guide)?

**Potential Features:**
- Public threads about feature requests/bugs
- Community voting on priorities
- Open-source contribution guides
- Platform changelog and updates
- Search communities AND platform discussions

**Design questions to explore in /play:**
- Is Voyager two things? (1) Personal guide + (2) Platform community?
- Or should there be a separate "Platform" community?
- How do we make the distinction clear in the UI?
- What does collaborate mode mean in this context?

**Priority:** Medium (interesting meta-concept, but not blocking core features)
**Estimated effort:** TBD (depends on design direction)
**Dependencies:** Clear product vision for Voyager's role

---

## 4. Community Creation via Curate Mode

**Purpose:** Use curate mode not just for posts, but for creating entire communities through structured expert interviews.

**Mental model:** Curate mode = preparation before publishing. For messages, that's refining a post. For communities, that's interviewing an expert to generate the community config.

### The Vision:

**Voyager as Community Architect**
- Expert wants to create "GraphQL Performance" community
- Toggles curate mode in Voyager (contentType: "community")
- AI Curator runs structured interview (5-10 deep questions)
- Generates community config JSON from interview insights
- Expert validates by "quizzing" the Navigator with domain questions
- Config approved → git commit → instant deployment

### Expert Interview Flow:

```
STEP 1: Domain & Expertise
- What area of expertise?
- Target audience?
- Most common questions?

STEP 2: Key Knowledge
- Core concepts AI needs to understand?
- Common misconceptions?
- Technical vocabulary?

STEP 3: Tone & Style
- Professional? Casual? Data-driven?
- Regional context (e.g., ANZ for Careersy)?
- Typical use cases/commands?

STEP 4: Success Criteria
- What makes a great answer?
- What's bad advice in this domain?
- Red flags to avoid?

STEP 5: Generate & Validate
- AI generates system prompt
- Creates community config JSON
- Expert tests with domain questions
- Iterative refinement until approved
```

### Voyager as Omni-Curator (Advanced)

**Concept:** Voyager knows ALL communities (reads all configs) and can:
- Route users to the right community based on interests
- Select best AI model per conversation type (via Hugging Face)
- Help experts create new communities
- Act as meta-curator with deep knowledge of each community

**Model Selection Strategy:**
```json
{
  "id": "voyager",
  "modelStrategy": "omni",
  "modelSelection": {
    "default": "claude-sonnet",
    "code": "deepseek-coder",
    "reasoning": "o1-preview",
    "creative": "gpt-4"
  }
}
```

**Auto-generated Voyager prompt includes knowledge from all communities:**
- Reads all community configs
- Extracts domain focus, experts, capabilities
- Builds comprehensive navigation prompt
- Updates automatically when new communities added

### Implementation Approach:

**Phase 1: Basic Community Creation**
- `contentType: "community"` triggers interview mode
- Curator prompt guides expert interview (voyager.json)
- Generate community config JSON from conversation
- Manual approval → create PR with new config
- Git merge → Vercel auto-deploys

**Phase 2: Expert Validation**
- Quiz phase: expert tests generated prompt
- AI responds using draft config
- Expert approves/refines until satisfied
- Track validation metrics

**Phase 3: Omni-Curator**
- Voyager auto-generates prompt from all configs
- Model selection per conversation type
- Hugging Face integration for model routing
- Community marketplace/templates

### Design Principles:

**Git is the database:**
- Community configs = JSON files in repo
- Version controlled, auditable
- Deploy with git push
- No separate admin database

**Expert as curator:**
- Experts create their own communities
- AI facilitates the structure
- Validation built into creation process
- Continuous refinement over time

**Privacy-safe monitoring:**
- After publish, curator tracks public engagement
- "3 people commented, Sarah suggested X"
- Private insights delivered to creator's draft conversation
- Only analyzes public data

### Technical Notes:

**Schema already supports this:**
```typescript
{
  curateMode: true,
  contentType: "community",  // Not "message", but "community"!
  communityId: "voyager"
}
```

**API endpoints needed:**
- POST /api/communities/create (generates config from interview)
- POST /api/communities/validate (expert quiz phase)
- POST /api/communities/publish (creates PR or commits)

**Security considerations:**
- Git write access (PR vs direct commit)
- Community approval workflow
- Prevent malicious configs
- Rate limiting on creation

### Reality Check:

✅ **Simple?** YES - contentType: "community" triggers interview
✅ **Git-versioned?** YES - new communities = JSON files
✅ **Deploy with git push?** YES - Vercel auto-deploys configs
✅ **Feels inevitable?** YES - "Curate mode makes communities. Makes sense."

**Complexity:** Git write access. Solutions:
- Create PR for manual approval (safest)
- Admin dashboard to approve
- Direct commit if backend has write access

**What we're NOT building:**
- Auto-approval (all communities need review)
- Community deletion (create only, prevent accidents)
- Real-time model switching (start with one model per community)

**Priority:** High (but AFTER message curation MVP proves the pattern)
**Estimated effort:** 2-3 weeks
**Dependencies:** Message curation working, git integration, PR creation API

---

## Marketing Language

**The Dandelion Effect:**
"AI doesn't replace experts. It connects them. Each person has scattered knowledge—AI gathers and arranges the pieces so they make something beautiful together."

**Key messaging:**
- "Your knowledge, amplified by community"
- "AI as catalyst, not replacement"
- "Scattered wisdom, unified insights"
- "Everything you need, nothing you don't"
