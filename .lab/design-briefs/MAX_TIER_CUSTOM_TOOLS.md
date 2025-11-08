# MAX TIER & CUSTOM TOOLS - DESIGN BRIEF

**Project:** Voyager
**Feature:** Max Tier Subscription + Custom Tool Creation
**Status:** 📋 Design Phase
**Date:** 2025-11-08
**Owner:** Kai (CTO) + Zara (AI/Ethics) + Nadia (COO)

---

## EXECUTIVE SUMMARY

**The Vision:** Enable power users to extend Voyager by building custom tools that integrate with the real world - API calls, data fetching, external services - guided by Shipwright and reviewed for quality/safety.

**The Approach:** Max tier users pair-program with Shipwright to write TypeScript tools, test in sandbox, submit for review via PR, and earn credits when shared with community/platform.

**Key Differentiator:** Not a no-code builder. Not unguided coding. **Guided open-source contribution** that maintains constitutional alignment while enabling limitless flexibility.

---

## THREE-TIER MODEL

### Free Tier
- 100 AI messages/month (Haiku/Llama routing)
- Unlimited human chat
- Community realm experience
- Beautiful conversations
- **Cost:** ~$0.26/user/month

### Pro Tier ($18.99/month)
- 500 AI messages/month (Haiku/Sonnet routing)
- Unlimited human chat
- Personal realm customization
- Full /profile personalization
- **Revenue to Voyager (70%):** $13.29/user
- **Margin:** ~$11.89/user

### Max Tier ($99/month)
- 5,000 AI messages/month (10x Pro)
- Priority intelligent routing
- **Custom tool creation (unlimited)**
- Tool library management
- Priority support
- Early access to features
- **Revenue to Voyager (70%):** $69.30/user
- **Margin:** ~$55/user

---

## COMMANDS VS TOOLS

### Commands (Prompt Modifications)
**What they are:** Mode/context switches for Claude

**Examples:**
- `/plan` - puts Claude in planning mode
- `/profile` - interview mode for personalization
- `/navigator` - coaching mode

**How they work:** Modify system prompt, change response style

**User creation:** Not in scope for Max tier (yet)

---

### Tools (Executable Functions)
**What they are:** Functions Claude can call to interact with external world

**Examples:**
- Web search - fetches search results
- File upload - analyzes documents
- API integration - queries external services
- Code execution - runs code, interprets output

**How they work:** Claude detects need, calls function, processes result, responds to user

**User creation:** THIS IS MAX TIER ✨

---

## CUSTOM TOOLS: THE VISION

### What Max Users Can Build

**Real-world integrations:**
- `/gpu-price-check` - fetch GPU prices across cloud providers
- `/starlink-tracker` - get satellite positions via Space-Track API
- `/crm-lookup` - query user's Salesforce data
- `/code-analyzer` - run linting/testing on code
- `/data-fetch` - pull from user's analytics dashboard

**The magic:** Voyager extends into the real world, tailored to each user's needs.

---

## THE CREATION FLOW

### Step 1: Initiate with Shipwright

**User:** `/shipwright I want to create a tool that checks GPU prices across AWS, GCP, and Azure`

**Shipwright:**
```
"Great idea! This would help GPU engineers compare costs.
Let me make sure we build this safely and well.

First - what should Navigator do with this data?
- Just display current prices?
- Compare and recommend cheapest?
- Track over time?
- Something else?"
```

**Shipwright's role:**
- Understand intent
- Ask clarifying questions
- Guide toward constitutional alignment
- Ensure code quality principles

---

### Step 2: Co-Create the Tool

**Shipwright guides through:**

1. **Tool specification**
   - Name, inputs, outputs
   - External APIs to call
   - Data transformations needed

2. **Constitutional check**
   - ✅ Elevation: Does this help users make better decisions?
   - ✅ Preservation: Does this build lasting knowledge?
   - ✅ Collaboration: Does this benefit the community?

3. **Code principles check**
   - Read-only operations (no DB writes initially)
   - Public APIs or user-provided auth
   - Error handling included
   - Rate limiting respected
   - Security boundaries clear

4. **Generate TypeScript code**
   - Show user the code
   - Explain what it does
   - Confirm understanding

---

### Step 3: Sandbox Testing

**Location:** `.tools/staging/user-{userId}/{tool-name}.ts`

**Sandbox environment:**
- Isolated Docker container
- Can call external APIs
- Cannot access Voyager database
- Cannot access other users' data
- 30-second timeout per execution
- Results only visible to tool creator

**Testing flow:**
```
Shipwright: "I've created a sandbox version. Let's test it.

Try: /gpu-price-check A100"

User types: /gpu-price-check A100

[Tool runs in sandbox]

Navigator responds:
"GPU Price Comparison for A100:

AWS: $4.10/hr (us-east-1) ✅ Available
GCP: $3.93/hr (us-central1) ✅ Available
Azure: $4.26/hr (eastus) ⚠️ Limited

Cheapest: GCP at $3.93/hr
Savings vs most expensive: $0.33/hr (7.7%)

[Powered by gpu-price-check tool]"
```

**User can:**
- Test tool functionality
- Iterate with Shipwright if issues
- Refine inputs/outputs
- Verify behavior

---

### Step 4: Submit for Review

**When user is satisfied:**

**Shipwright:**
```
"Great! Ready to make this available?

Options:
1. Keep private (just for you)
2. Share with community leaders for approval
3. Submit to Voyager platform for review

What would you like to do?"
```

**User chooses** → Shipwright creates pull request

---

### Step 5: Automated Review (Claude Code)

**PR created automatically with:**
- Tool code (`.tools/approved/{tool-name}.ts`)
- Tests (if applicable)
- Documentation
- Constitutional alignment statement

**Claude Code (Kai) reviews:**

```
✅ Constitutional alignment verified
✅ No database access
✅ No file system access
✅ External APIs only (read-only)
✅ Error handling present
✅ Rate limiting respected
✅ Timeout configured
⚠️ Suggestion: Add 5-min cache to reduce API calls

Status: APPROVED
Recommendation: Merge to production
```

**If issues found:**
```
⚠️ Security concern: API key hardcoded
⚠️ Missing error handling for network timeout

Recommendation: REQUEST CHANGES

Shipwright will help you fix these issues.
```

Shipwright guides user to fix → resubmit

---

### Step 6: Human Approval (Isaac or Community Leader)

**For community tools:**
- Community leader sees pending tool
- Reviews code + Claude's recommendation
- Approves → tool available to community

**For platform-wide tools:**
- Isaac sees pending tool
- Reviews code + Claude's recommendation
- Approves → tool available to all Voyager users

---

### Step 7: Tool Goes Live

**Once approved:**
- Moves from staging to production
- Available to specified scope (user/community/platform)
- Listed in tool library
- Tracked for usage/analytics

---

## CREDIT SYSTEM

### How Credits Work

**Personal use (default):**
- User builds tool for themselves
- No credit (they're paying Max tier already)
- Tool stays private or shared at their discretion

**Community sharing:**
- User offers tool to community leader(s)
- Leader tests and approves
- Tool becomes available to community
- **User receives: 1-3 months free Max tier** 🎁

**Platform sharing:**
- User submits tool to Voyager team
- Isaac/team reviews and approves
- Tool becomes available platform-wide
- **User receives: 12 months free Max tier** 🎁🎁

**Incentive alignment:**
- Quality tools benefit everyone
- Creators rewarded for contributions
- Platform grows through community innovation
- Open-source spirit with Voyager values

---

## TECHNICAL ARCHITECTURE

### Storage Structure

```
.tools/
├── staging/              # In-progress tools (sandboxed)
│   └── user-{userId}/
│       └── {tool-name}.ts
│
├── approved/             # Production tools
│   ├── platform/         # Available to all
│   │   ├── gpu-price-check.ts
│   │   └── starlink-tracker.ts
│   ├── community/        # Available to specific communities
│   │   └── {communityId}/
│   │       └── {tool-name}.ts
│   └── private/          # User-only tools
│       └── user-{userId}/
│           └── {tool-name}.ts
│
└── tests/                # Tool tests
    └── {tool-name}.test.ts
```

### Database Schema

```typescript
interface CustomTool {
  id: string
  userId: string              // Creator
  toolName: string            // "gpu-price-check"

  // Code
  filePath: string            // Path in .tools/
  version: string             // Semantic versioning

  // Metadata
  description: string
  category: string            // "data-fetch", "analysis", "integration"

  // Scope
  scope: 'private' | 'community' | 'platform'
  communityId?: string        // If community-scoped

  // Status
  status: 'staging' | 'review' | 'approved' | 'rejected'
  reviewedBy?: string         // UserId or "claude-code"
  reviewNotes?: string

  // Usage
  usageCount: number
  lastUsed: Date

  // Credits
  creditAwarded: boolean
  creditType?: 'community' | 'platform'
  creditMonths?: number

  // Timestamps
  createdAt: Date
  approvedAt?: Date
  updatedAt: Date
}
```

### Sandbox Execution

```typescript
async function executeToolInSandbox(
  toolCode: string,
  input: any,
  userId: string
): Promise<any> {
  // Spin up isolated Docker container
  const sandbox = await createSandbox({
    timeout: 30000,              // 30 second max
    memory: '512MB',             // Limited memory
    network: 'restricted',       // Only whitelisted APIs
    filesystem: 'readonly',      // No writes
  })

  try {
    // Inject tool code
    await sandbox.loadCode(toolCode)

    // Execute with input
    const result = await sandbox.execute(input)

    // Log usage
    await logToolUsage(userId, toolCode, result)

    return result

  } catch (error) {
    // Handle errors gracefully
    return {
      error: true,
      message: "Tool execution failed",
      details: sanitizeError(error)
    }
  } finally {
    // Always cleanup
    await sandbox.destroy()
  }
}
```

---

## SAFETY & SECURITY

### What Tools CAN Do

✅ **External API calls** (read-only)
- Public APIs (no auth required)
- User-authenticated APIs (user provides keys)
- Rate limiting respected

✅ **Data transformation**
- Process API responses
- Format for Navigator
- Calculate/analyze results

✅ **Return structured data**
- JSON, text, tables
- Error messages
- Status indicators

---

### What Tools CANNOT Do

❌ **Database access** (initially)
- No reads from Voyager DB
- No writes to Voyager DB
- Future: read-only with strict permissions

❌ **File system access**
- No reading user files
- No writing files
- Security nightmare

❌ **Execute arbitrary code**
- No eval()
- No child processes
- Sandboxed environment only

❌ **Access other users' data**
- Strict user isolation
- Tools run in user context only

---

### Review Checklist

**Automated (Claude Code):**
- [ ] Constitutional alignment verified
- [ ] No database operations
- [ ] No file system access
- [ ] External APIs documented
- [ ] Error handling present
- [ ] Rate limiting considered
- [ ] Timeout configured
- [ ] Security boundaries clear

**Manual (Isaac/Community Leader):**
- [ ] Aligns with community values
- [ ] Useful to others (if sharing)
- [ ] No malicious intent
- [ ] Quality code
- [ ] Well-documented

---

## COMPLEXITY LIMITS (Phase 1)

**Start simple, expand carefully:**

**Allowed:**
- ✅ Single API calls
- ✅ Data parsing/formatting
- ✅ Simple calculations
- ✅ Status checks

**Not yet:**
- ❌ Multi-step workflows
- ❌ Database operations
- ❌ File uploads/downloads
- ❌ Long-running processes

**Future phases can expand** as we learn and build safety measures.

---

## EXAMPLE: GPU PRICE CHECK

### User Story

**Sarah (GPU Engineer, Max tier):**
"I constantly compare GPU prices across cloud providers. Takes 10 minutes to check AWS, GCP, Azure pricing pages. I want a tool that does this instantly."

### Creation Process

**1. Initiate:**
```
Sarah: /shipwright I want to check GPU prices across clouds

Shipwright: "Let's build that! What GPU types do you need?"

Sarah: "A100, H100, V100"

Shipwright: "Perfect. I'll create gpu-price-check tool."
```

**2. Build:**
Shipwright generates TypeScript code that:
- Calls AWS Pricing API
- Calls GCP Cloud Pricing API
- Calls Azure Pricing API
- Compares results
- Returns cheapest option

**3. Test:**
```
Sarah: /gpu-price-check A100

Navigator: "GPU Price Check:
AWS: $4.10/hr ✅
GCP: $3.93/hr ✅ CHEAPEST
Azure: $4.26/hr ⚠️

Save $0.33/hr with GCP"
```

**4. Share with community:**
Sarah offers to GPU Engineers community → approved → 3 months free Max tier

**5. Platform-wide:**
Voyager team sees value → approves for all users → Sarah gets 12 months free

---

## SUCCESS METRICS

**Phase 1 (First 3 months):**
- 10+ custom tools created
- 80%+ pass automated review
- 50%+ approved for community use
- 3+ approved for platform-wide
- 0 security incidents

**Phase 2 (6 months):**
- 100+ custom tools
- 20+ platform-wide tools
- Tool usage > 1,000/month
- Community tool marketplace emerging

**Phase 3 (12 months):**
- Custom tools core differentiator
- Power users building businesses on Voyager
- Tool library = competitive moat

---

## OPEN QUESTIONS

1. **API Key Storage:** How do users provide API keys securely?
2. **Tool Monetization:** Should creators be able to charge for tools?
3. **Tool Marketplace:** Public discovery of community tools?
4. **Versioning:** How do we handle tool updates/breaking changes?
5. **Rate Limiting:** Per-tool or per-user limits?

---

## NEXT STEPS

**Before Building:**
1. Validate with 3-5 potential Max users
2. Design sandbox security in detail
3. Define review automation scope
4. Plan credit/reward system

**Phase 1 Implementation (8 weeks):**
1. Max tier subscription (Week 1-2)
2. Sandbox environment (Week 3-4)
3. Shipwright tool creation mode (Week 5-6)
4. Review system + PR automation (Week 7-8)

**Phase 2 (Future):**
1. Community tool sharing
2. Tool marketplace
3. Advanced tool types (DB access, file handling)
4. Creator monetization

---

## THE VISION

**Voyager Max isn't just "more messages."**

**It's the ability to extend Voyager into YOUR world.**

Your APIs. Your data. Your workflows. Your tools.

**Guided by Shipwright. Reviewed by AI. Approved by humans.**

**Constitutional principles at every step. Beautiful conversations throughout.**

**Limitless flexibility. Guided freedom.**

---

**This is how Voyager becomes the platform where communities build worlds beyond imagination - with tools that connect those worlds to reality.** 🛠️🌌✨

---

**Status:** Design phase - ready for validation
**Next:** Test with potential Max users, refine security model
**Timeline:** 8 weeks to MVP after validation
