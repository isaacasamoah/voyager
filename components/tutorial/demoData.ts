/**
 * Demo Mode Data
 * Fake responses and data for tutorial/demo without DB persistence
 */

export const DEMO_AI_RESPONSE = `Great question! Here's how I can help with your ANZ tech career:

**Resume Review**
I'll analyze your resume against ATS systems and provide specific improvements based on the 8-rule framework:
- Lead with metrics (%, $, time saved)
- Keep bullets ≤30 words
- Use strong action verbs
- Highlight relevant tech stacks

**Interview Prep**
Build 6-8 STAR stories mapped to common questions for roles at companies like Atlassian, Canva, and Xero.

**Salary Guidance**
Get realistic salary ranges for Sydney, Melbourne, and Auckland tech roles based on your experience level.

Try uploading your resume or a job description to get personalized advice! 🚀`

export const DEMO_RESUME_SAVED_MESSAGE = `✓ Demo resume saved! I can now provide personalized advice based on your background.

Try asking: "Review my experience for a Senior Engineer role at Canva"`

export const DEMO_RESUME_TEXT = `DEMO RESUME

Software Engineer
3 years experience in full-stack development
Skills: React, TypeScript, Node.js, PostgreSQL
Previous roles at Australian tech startups`

export interface DemoMessage {
  role: 'user' | 'assistant'
  content: string
}

export const createDemoResponse = (userMessage: string): string => {
  const lower = userMessage.toLowerCase()

  // Specific demo responses based on keywords
  if (lower.includes('resume') || lower.includes('cv')) {
    return `I'd be happy to review your resume! Here's what I look for:

**Impact-First Bullets**
Instead of: "Responsible for building features"
Try: "Built 3 customer-facing features that increased engagement 25%"

**ATS Keywords**
Match exact terms from the JD - ATS systems do literal string matching.

**ANZ Context**
Reference local companies (Atlassian, Seek, Canva) and Australian tech ecosystem.

Upload your resume using the + button to get specific feedback!`
  }

  if (lower.includes('interview')) {
    return `Here's my ANZ tech interview prep framework:

**STAR Stories (6-8 minimum)**
- Technical challenge you solved
- Team conflict resolution
- Scope creep management
- System design decision

**Company Research**
For Sydney/Melbourne roles, know:
- Local tech scene positioning
- ANZ-specific products
- Remote work policies

**Practice Questions**
"Tell me about a time you improved system performance"
"How would you architect X for Australian market?"

Want to practice a specific scenario?`
  }

  if (lower.includes('salary') || lower.includes('pay')) {
    return `**ANZ Tech Salary Ranges (2025, AUD)**

**Software Engineer**
- Junior (0-2y): $70k-$95k
- Mid (2-5y): $95k-$130k
- Senior (5-8y): $130k-$170k
- Lead (8y+): $160k-$220k

**Location Premium**
- Sydney: +10-15%
- Melbourne: Baseline
- Auckland (NZD): -10-15% (convert to AUD)

**Negotiation Tips**
- Total comp = base + super + equity
- Request equity breakdown upfront
- Research company's stage (startup vs scale-up)

What's your target role and location?`
  }

  // Default response
  return DEMO_AI_RESPONSE
}
