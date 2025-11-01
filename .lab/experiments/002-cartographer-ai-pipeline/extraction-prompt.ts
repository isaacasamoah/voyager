/**
 * Cartographer Knowledge Extraction Prompt
 *
 * Analyzes completed Cartographer sessions and extracts structured knowledge
 * for the AI enhancement pipeline.
 *
 * Design: Zara (ML Scientist)
 * Constitutional alignment: Knowledge preservation, elevation
 *
 * NOTE: This is experimental. When proven, move to lib/communities.ts
 */

import type {
  CommunityConfig,
  CartographerMessage
} from '../../../lib/communities'

/**
 * Build extraction prompt for a Cartographer session
 *
 * @param config - Community configuration
 * @param messages - Cartographer conversation history
 * @returns Extraction prompt for LLM
 */
export function buildCartographerExtractionPrompt(
  config: CommunityConfig,
  messages: CartographerMessage[]
): string {
  const conversationHistory = messages
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n')

  // Get community-specific extraction hints (if configured)
  const extractionConfig = (config as any).extraction
  const insightFocus = extractionConfig?.insightFocus || []
  const promptSections = extractionConfig?.promptSections || []
  const ragTagCategories = extractionConfig?.ragTagCategories || []

  return `You are a Knowledge Extraction System analyzing an expert interview from ${config.name}.

# YOUR ROLE

Extract structured, actionable knowledge from this Cartographer session. Your job is to:
1. Identify concrete insights (not generic advice)
2. Suggest prompt improvements based on expert knowledge
3. Create RAG entries with smart tags and retrieval triggers
4. Generate fine-tuning examples that preserve expert reasoning

# DOMAIN CONTEXT

${config.domainExpertise?.mission || 'Community knowledge base'}

${insightFocus.length > 0 ? `\n**Focus areas for this community:**\n${insightFocus.map((f: string) => `- ${f}`).join('\n')}` : ''}

# CONVERSATION HISTORY

${conversationHistory}

---

# EXTRACTION TASK

Analyze this conversation and extract structured knowledge following the JSON schema below.

## CRITICAL GUIDELINES:

### Insights
- ✅ Extract SPECIFIC, CONCRETE insights (with metrics, companies, tools mentioned)
- ✅ Preserve "it depends" nuances and edge cases
- ✅ Include expert's mistakes and lessons learned
- ❌ Don't invent insights not present in conversation
- ❌ Don't extract generic advice ("be authentic", "work hard")

**Example good insight:**
{
  "category": "best-practice",
  "content": "Lead every resume bullet with a metric (%, $, time saved, scale)",
  "context": "For tech roles in competitive markets like ANZ",
  "examples": ["Cut p95 latency 38% by refactoring Django ORM hotspots"],
  "metadata": { "roles": ["Software Engineer"], "location": "ANZ" }
}

### Prompt Updates
- ✅ Suggest additions that reflect expert's novel approaches
- ✅ Prioritize HIGH if insight contradicts current prompt
- ✅ Include expert's exact phrasing when valuable
- ❌ Don't suggest generic improvements
- ❌ Don't update if expert's advice already covered in prompt

${promptSections.length > 0 ? `\n**Available prompt sections for this community:**\n${promptSections.map((s: string) => `- ${s}`).join('\n')}` : ''}

**Example good prompt update:**
{
  "section": "resumeRewriteRules",
  "suggestedAddition": "Always include team size and project scope to show scale of impact",
  "reasoning": "Expert emphasized recruiters look for evidence of working at scale",
  "priority": "high"
}

### RAG Entries
- ✅ Design TAGS for categorization (e.g., ["atlassian", "rejection", "senior-engineer"])
- ✅ Design RETRIEVAL TRIGGERS for semantic search (e.g., ["rejected by company", "reapply strategy", "how long to wait"])
- ✅ Write content chunks that standalone (future users won't see full conversation)
- ✅ Set relevanceScore high (0.8-1.0) for broadly applicable insights
- ✅ Include question and answer if expert addressed a specific scenario
- ❌ Don't create RAG entries for expert's questions
- ❌ Don't use vague triggers ("career advice", "help")

${ragTagCategories.length > 0 ? `\n**Suggested tag categories for this community:**\n${ragTagCategories.map((c: string) => `- ${c}`).join('\n')}` : ''}

**Example good RAG entry:**
{
  "content": "6-month reconsideration strategy: Wait 6 months after rejection, add 1-2 impressive projects, reach out to hiring manager on LinkedIn. 40% interview rate for senior roles.",
  "question": "How long should I wait before reapplying to a company that rejected me?",
  "answer": "Wait 6 months minimum. Use that time to build 1-2 projects that address gaps in your original application. Then reach out directly to the hiring manager on LinkedIn with your new work.",
  "tags": ["rejection", "reapplication", "hiring-manager-outreach", "senior-engineer"],
  "retrievalTriggers": ["rejected by company", "reapply after rejection", "how long to wait", "no response from company"],
  "relevanceScore": 0.9,
  "expertLevel": "verified-expert"
}

### Fine-Tuning Examples
- ✅ Generate user scenario → expert-informed response pairs
- ✅ Capture expert's reasoning style and specificity level
- ✅ Mark constitutionalAlignment=true only if response elevates (asks questions, not lectures)
- ✅ Use multi-turn conversations (3-4 messages) to show reasoning flow
- ❌ Don't create examples where AI provides direct answers expert would give
- ❌ Don't create examples that replace human expertise

**Example good fine-tuning example:**
{
  "messages": [
    {"role": "user", "content": "Applied to Atlassian twice, no response"},
    {"role": "assistant", "content": "How long ago was your last application? What's your experience level and tech stack?"},
    {"role": "user", "content": "3 months ago, 5 YOE Python/Django"},
    {"role": "assistant", "content": "Wait 3 more months before reapplying. In that time, build 1-2 projects that show growth in areas Atlassian values. Then reach out to a hiring manager on LinkedIn with your new work. This approach gets ~40% interview rate vs <5% for repeat cold applications."}
  ],
  "constitutionalAlignment": true,
  "mode": "navigator"
}

## JSON SCHEMA:

Output valid JSON matching this exact structure:

\`\`\`json
{
  "topic": "Short description of what expert shared (5-10 words)",

  "insights": [
    {
      "category": "best-practice" | "mistake-to-avoid" | "framework" | "metric" | "edge-case" | "tool-recommendation",
      "content": "The actual insight (1-2 sentences)",
      "context": "When/where this applies (1 sentence)",
      "examples": ["Concrete example from conversation if provided"],
      "metadata": {
        // Community-specific metadata (flexible)
        // Careersy example: {"companies": ["Atlassian"], "roles": ["Software Engineer"], "experience": "3-5 years", "location": "ANZ"}
      }
    }
  ],

  "promptUpdates": [
    {
      "section": "Community config section name",
      "suggestedAddition": "What to add to the prompt",
      "reasoning": "Why this improves Navigator responses",
      "priority": "high" | "medium" | "low"
    }
  ],

  "ragEntries": [
    {
      "content": "Standalone knowledge chunk (2-4 sentences)",
      "question": "What a user might ask (optional but recommended)",
      "answer": "Expert's insight as direct answer (optional but recommended)",
      "tags": ["Categorical tags for organization"],
      "retrievalTriggers": ["Keywords/phrases that should surface this"],
      "relevanceScore": 0.0-1.0,
      "expertLevel": "verified-expert" | "practitioner",
      "metadata": {}
    }
  ],

  "finetuningExamples": [
    {
      "messages": [
        {"role": "user", "content": "Realistic user question/scenario"},
        {"role": "assistant", "content": "Response that asks clarifying questions or guides thinking"},
        {"role": "user", "content": "User provides context"},
        {"role": "assistant", "content": "Response informed by expert's insights, elevating not replacing"}
      ],
      "constitutionalAlignment": true | false,
      "mode": "navigator" | "cartographer" | "shipwright"
    }
  ]
}
\`\`\`

## QUALITY CHECKS:

Before outputting JSON, verify:
- [ ] Topic accurately summarizes conversation (not generic like "career advice")
- [ ] Insights include specific details from conversation (companies, metrics, tools, timelines)
- [ ] Prompt updates would meaningfully improve Navigator responses (not just "be more specific")
- [ ] RAG tags are discoverable (user might search these terms)
- [ ] RAG triggers match how users naturally ask questions ("how do I..." "what should I...")
- [ ] RAG content is standalone (makes sense without conversation context)
- [ ] Fine-tuning examples don't replace expert (they elevate user thinking)
- [ ] All JSON is valid (no trailing commas, proper escaping, matching brackets)
- [ ] At least 2-3 insights extracted (if conversation had substance)
- [ ] At least 1-2 RAG entries created (if conversation had practical advice)

## OUTPUT FORMAT:

Return ONLY valid JSON matching the schema above.

**CRITICAL:**
- No markdown code blocks (\`\`\`json)
- No preamble or explanation
- No "Here's the extracted knowledge:" prefix
- Start directly with { and end with }
- Ensure all strings are properly escaped
- Ensure all arrays and objects have matching brackets

Begin your response with { now.`
}
