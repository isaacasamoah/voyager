# Testing Strategy: Tests as Context Preservation

## Philosophy

**Tests are not just for catching bugs—they're our memory when AI context gets compacted.**

### The Problem
When working with AI assistants over long sessions:
1. Build complex features with deep context
2. Session gets compacted (summarized to save tokens)
3. Nuanced details and edge cases get lost
4. Continue building → introduce bugs from forgotten context
5. Waste time re-learning what was compacted away

### The Solution: Test-Driven Context Preservation (TDCP)

**Write tests FIRST to encode requirements that survive compacting.**

```typescript
// Tests = Preserved Context
describe('Dynamic Terminology System', () => {
  // This test preserves knowledge even after compacting
  it('should use "voyage" for Voyager, "course" for Careersy', () => {
    const voyagerTerms = getCommunityConfig('voyager').terminology
    const careersyTerms = getCommunityConfig('careersy').terminology

    expect(voyagerTerms.singular).toBe('voyage')
    expect(careersyTerms.singular).toBe('course')
  })

  // This test prevents regressions from forgotten edge cases
  it('should fall back to defaults if terminology missing', () => {
    const config = { id: 'test' } // No terminology defined
    const terms = getTerminology(config)

    expect(terms.singular).toBe('conversation')
  })
})
```

## TDCP Workflow

### Phase 1: Capture Requirements as Tests
**BEFORE building a feature, write tests that encode:**

1. **Core functionality**
   ```typescript
   it('should create a new course when user sends first message')
   it('should resume existing course on subsequent messages')
   ```

2. **Edge cases**
   ```typescript
   it('should handle missing community gracefully')
   it('should validate user is community member before access')
   ```

3. **Integration points**
   ```typescript
   it('should work with both Voyager (no auth) and Careersy (auth required)')
   it('should use correct AI model per community config')
   ```

4. **Business rules**
   ```typescript
   it('should not save conversations for Voyager community')
   it('should track conversation history for authenticated communities')
   ```

### Phase 2: Build Feature
With tests in place, build the feature to make tests pass.

### Phase 3: Context Survives Compacting
When the session compacts:
- ✅ **Tests remain**: Full test suite preserved
- ❌ **Context lost**: Discussion, reasoning, edge cases
- ✅ **Tests = Memory**: Re-running tests restores understanding

### Phase 4: Continue Confidently
Future work won't break existing features because:
- Tests catch regressions immediately
- Tests document expected behavior
- Tests serve as "executable requirements"

## Testing Pyramid for Voyager

### 1. **Unit Tests** (60% of tests)
**Purpose:** Test isolated logic

```typescript
// tests/unit/lib/communities.test.ts
describe('getCommunityConfig', () => {
  it('should load voyager community config', () => {
    const config = getCommunityConfig('voyager')
    expect(config).toBeDefined()
    expect(config.id).toBe('voyager')
  })

  it('should return null for non-existent community', () => {
    const config = getCommunityConfig('fake-community')
    expect(config).toBeNull()
  })
})

// tests/unit/lib/ai-providers.test.ts
describe('callAIModel', () => {
  it('should use OpenAI when provider is openai', async () => {
    const config = { provider: 'openai', model: 'gpt-4' }
    // Mock and test
  })

  it('should use Anthropic when provider is anthropic', async () => {
    const config = { provider: 'anthropic', model: 'claude-3-5-sonnet' }
    // Mock and test
  })
})
```

### 2. **Integration Tests** (30% of tests)
**Purpose:** Test multiple components working together

```typescript
// tests/integration/chat-flow.test.ts
describe('Chat Flow', () => {
  it('should complete full Voyager chat without auth', async () => {
    // 1. Send message to /api/chat with communityId=voyager
    // 2. Verify AI response returned
    // 3. Verify NO database record created (Voyager doesn't save)
  })

  it('should complete full Careersy chat with auth', async () => {
    // 1. Authenticate user
    // 2. Send message to /api/chat with communityId=careersy
    // 3. Verify Course and Log created in database
    // 4. Verify conversation can be resumed
  })
})

// tests/integration/custom-domains.test.ts
describe('Custom Domain Routing', () => {
  it('should route careersycoaching.com to careersy community', async () => {
    const response = await fetch('http://careersycoaching.com', {
      headers: { host: 'careersycoaching.com' }
    })
    // Verify careersy branding loaded
  })
})
```

### 3. **E2E Tests** (10% of tests)
**Purpose:** Test complete user journeys

```typescript
// tests/e2e/voyager-landing.spec.ts (Playwright)
test('Voyager landing chat flow', async ({ page }) => {
  await page.goto('/')

  // Type message
  await page.fill('[data-testid="chat-input"]', 'What is Voyager?')
  await page.click('[data-testid="send-button"]')

  // Verify response appears
  await expect(page.locator('[data-testid="assistant-message"]')).toBeVisible()

  // Verify no login required
  await expect(page.locator('[data-testid="login-button"]')).not.toBeVisible()
})

// tests/e2e/careersy-chat.spec.ts
test('Careersy authenticated chat', async ({ page }) => {
  // Login
  await page.goto('/login')
  // ... auth flow

  // Navigate to Careersy
  await page.goto('/careersy')

  // Send message
  await page.fill('[data-testid="chat-input"]', 'Help with resume')
  await page.click('[data-testid="send-button"]')

  // Verify message saved to conversation history
  await page.reload()
  await expect(page.locator('text=Help with resume')).toBeVisible()
})
```

## Critical Test Categories

### 1. **Community System Tests** (HIGHEST PRIORITY)
Why: It's the "crown jewel" - must never break

```typescript
describe('Community System', () => {
  it('should load all community configs without errors')
  it('should validate community config schema')
  it('should handle missing optional fields with defaults')
  it('should map custom domains to correct communities')
  it('should enforce membership rules per community')
})
```

### 2. **Authentication Flow Tests**
Why: Security and access control

```typescript
describe('Authentication', () => {
  it('should allow Voyager access without auth')
  it('should require auth for Careersy')
  it('should add user to public communities on signup')
  it('should restrict private community access')
})
```

### 3. **Chat API Tests**
Why: Core product functionality

```typescript
describe('Chat API', () => {
  it('should create Course and Log for authenticated users')
  it('should NOT save Voyager conversations')
  it('should use correct AI model per community')
  it('should include resume context when available')
  it('should handle streaming responses')
})
```

### 4. **Database Schema Tests**
Why: Prevents migrations from breaking production

```typescript
describe('Database Schema', () => {
  it('should have Course model mapping to Conversation table')
  it('should have Log model mapping to Message table')
  it('should enforce foreign key constraints')
  it('should cascade delete logs when course deleted')
})
```

## Implementation Plan

### Phase 1: Foundation (Current Sprint)
**Goal:** Test infrastructure + critical paths

```bash
tests/
├── unit/
│   ├── lib/
│   │   ├── communities.test.ts       # Community config loading
│   │   ├── ai-providers.test.ts      # AI provider abstraction
│   │   └── terminology.test.ts       # Dynamic terminology
│   └── middleware.test.ts            # Custom domain routing
├── integration/
│   ├── chat-api.test.ts              # Full chat flow
│   └── auth-flow.test.ts             # OAuth → session
└── setup/
    ├── test-db.ts                    # Test database setup
    └── mocks.ts                      # Shared mocks (AI, Stripe, etc.)
```

**Estimated time:** 6-8 hours
**Value:** Prevents regressions on core features

### Phase 2: Expansion (Next Sprint)
**Goal:** Cover all major features

- Stripe subscription flows
- Community thread creation (public mode)
- Vote and validation systems
- Resume parsing and storage

**Estimated time:** 8-12 hours

### Phase 3: E2E (Future)
**Goal:** User journey validation

- Playwright setup
- Critical user paths
- Cross-browser testing

**Estimated time:** 4-6 hours

## Testing Best Practices

### 1. **Tests as Documentation**
```typescript
describe('Course vs Conversation terminology', () => {
  /**
   * CONTEXT: We renamed "Conversation" to "Course" in the code
   * but the database table is still named "Conversation" (capital C)
   *
   * This preserves the knowledge even after compacting!
   */
  it('should map Course model to Conversation table', async () => {
    const course = await prisma.course.create({
      data: { userId: 'test', title: 'Test' }
    })

    // Verify it's actually stored in "Conversation" table
    const raw = await prisma.$queryRaw`SELECT * FROM "Conversation" WHERE id = ${course.id}`
    expect(raw).toBeDefined()
  })
})
```

### 2. **Test Edge Cases Explicitly**
```typescript
describe('Chat API - Edge Cases', () => {
  it('should handle missing ANTHROPIC_API_KEY gracefully', async () => {
    delete process.env.ANTHROPIC_API_KEY

    const response = await POST(mockRequest)

    expect(response.status).toBe(500)
    expect(await response.json()).toMatchObject({
      error: 'Failed to process message'
    })
  })
})
```

### 3. **Use Test Factories**
```typescript
// tests/factories/user.ts
export function createTestUser(overrides = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    communities: ['careersy'],
    ...overrides
  }
}

// Usage
const user = createTestUser({ communities: ['voyager', 'careersy'] })
```

### 4. **Isolate Database State**
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

beforeEach(async () => {
  // Clean slate for each test
  await prisma.log.deleteMany()
  await prisma.course.deleteMany()
  await prisma.user.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})
```

## Running Tests

### Development
```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/unit/lib/communities.test.ts

# Watch mode (re-run on changes)
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### CI/CD
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run build  # Verify build passes
```

## Measuring Success

### Coverage Targets
- **Unit tests:** 80%+ coverage on lib/ and utilities
- **Integration tests:** All API routes covered
- **E2E tests:** 3-5 critical user journeys

### Quality Metrics
- ❌ **Before:** "Something broke after deployment, not sure why"
- ✅ **After:** "Test suite caught regression before merge"

### Context Preservation Test
**Scenario:** AI session gets compacted

**Before TDCP:**
- Continue building → introduce bugs
- Forget edge cases → users report issues
- Re-read old code → waste time understanding

**After TDCP:**
- Run tests → see what's expected
- Tests fail → know exactly what broke
- Read test names → understand feature instantly

## Example: Streaming Chat + TDCP

### Step 1: Write Tests FIRST
```typescript
// tests/integration/streaming-chat.test.ts
describe('Streaming Chat Implementation', () => {
  it('should stream tokens as they arrive from AI model', async () => {
    const stream = await fetch('/api/chat/stream', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello' })
    })

    const reader = stream.body.getReader()
    const chunks = []

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }

    expect(chunks.length).toBeGreaterThan(1) // Verify streaming, not single response
  })

  it('should handle stream errors gracefully', async () => {
    // Mock AI provider to throw error mid-stream
    // Verify client receives partial response + error
  })

  it('should work for both Voyager and Careersy', async () => {
    // Test streaming for unauthenticated (voyager)
    // Test streaming for authenticated (careersy)
  })
})
```

### Step 2: Build Feature
Implement streaming with tests as guide

### Step 3: Session Compacts
AI context gets summarized, losing details about:
- Why we chose Vercel AI SDK
- Edge cases with `useChat` hook
- UIMessage structure quirks

### Step 4: Continue Building
**Without tests:** Forget edge cases, break existing functionality
**With tests:** Tests fail immediately, preserving knowledge through executable specs

---

## Next Steps

1. **Install testing tools:**
   ```bash
   npm install -D vitest @testing-library/react @testing-library/jest-dom
   npm install -D @playwright/test  # For E2E later
   ```

2. **Create first test:**
   ```typescript
   // tests/unit/lib/communities.test.ts
   // Start with community system (highest value)
   ```

3. **Set up test script in package.json:**
   ```json
   "scripts": {
     "test": "vitest",
     "test:ui": "vitest --ui",
     "test:coverage": "vitest --coverage"
   }
   ```

4. **Write tests for next feature BEFORE building:**
   - Example: Streaming chat
   - Write 5-10 tests describing expected behavior
   - Build to make tests pass
   - Tests preserve context after compacting

---

## Conclusion

**Tests are not overhead—they're an investment in velocity.**

By encoding requirements as tests FIRST:
1. ✅ Context survives compacting
2. ✅ Regressions caught immediately
3. ✅ Onboarding faster (tests = docs)
4. ✅ Refactoring confidence
5. ✅ Ship faster with fewer bugs

**The workflow:**
```
Requirements → Tests (preserve context) → Build → Compact → Continue → Tests prevent regressions
```

Instead of:
```
Requirements → Build → Compact (lose context) → Continue → Break things → Debug → Waste time
```

---

**Your instinct is spot-on: Tests are the memory that survives compacting.**
