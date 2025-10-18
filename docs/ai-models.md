# AI Model System Documentation

## Overview
The Careersy Wingman uses a **future-proof, multi-provider AI model system** that makes it easy to switch between different AI models (Claude, GPT-4, etc.) and sets the foundation for a user-facing model dropdown.

## Architecture

### Files
- **`lib/ai-models.ts`**: Model configuration and prompts
- **`lib/ai-providers.ts`**: Unified interface for AI providers (OpenAI, Anthropic)
- **`app/api/chat/route.ts`**: Chat API using the model system

### How It Works
1. **Model Configuration** (`ai-models.ts`):
   - Defines available models with their provider, ID, display name, and parameters
   - Includes the ANZ Tech Career Coach+ system prompt
   - Exports `getModelConfig()` to retrieve current model settings

2. **Provider Interface** (`ai-providers.ts`):
   - Abstracts OpenAI and Anthropic behind a single `callAIModel()` function
   - Handles provider-specific message formatting
   - Returns normalized responses with token usage

3. **Chat API** (`chat/route.ts`):
   - Calls `getModelConfig()` to get current model
   - Builds messages with system prompt + resume context
   - Calls `callAIModel()` with unified interface
   - Works with any configured provider

## Current Configuration

### Default Model
**Claude 3.5 Sonnet** (`claude-sonnet`)

### Available Models
- `claude-sonnet`: Claude 3.5 Sonnet (Anthropic)
- `gpt-4-turbo`: GPT-4 Turbo (OpenAI)

## Environment Variables

```bash
# Required for Claude (default model)
ANTHROPIC_API_KEY="sk-ant-..."

# Required for GPT-4 (backup model)
OPENAI_API_KEY="sk-..."

# Optional: Override default model
DEFAULT_AI_MODEL="claude-sonnet"  # or "gpt-4-turbo"
```

## Switching Models

### Method 1: Environment Variable
Set `DEFAULT_AI_MODEL` in your `.env.local` or Vercel environment:

```bash
DEFAULT_AI_MODEL="gpt-4-turbo"  # Switch to GPT-4
```

### Method 2: Code Configuration
Edit `lib/ai-models.ts`:

```typescript
export const DEFAULT_MODEL = 'gpt-4-turbo'
```

## Adding New Models

### Step 1: Add to Configuration
In `lib/ai-models.ts`, add your model to `AVAILABLE_MODELS`:

```typescript
'claude-opus': {
  provider: 'anthropic',
  modelId: 'claude-3-opus-20240229',
  displayName: 'Claude 3 Opus',
  maxTokens: 4096,
  temperature: 0.7,
  systemPrompt: ANZ_TECH_CAREER_COACH_PROMPT,
}
```

### Step 2: Use It
Set `DEFAULT_AI_MODEL="claude-opus"` or pass the key to `getModelConfig()`

## Adding New Providers

### Example: Adding Google Gemini

1. **Install SDK**:
   ```bash
   npm install @google/generative-ai
   ```

2. **Add Provider Function** in `ai-providers.ts`:
   ```typescript
   async function callGemini(
     config: ModelConfig,
     messages: ChatMessage[]
   ): Promise<ChatCompletionResponse> {
     // Implementation
   }
   ```

3. **Update Provider Type** in `ai-models.ts`:
   ```typescript
   export type ModelProvider = 'openai' | 'anthropic' | 'google'
   ```

4. **Add to Switch Statement** in `ai-providers.ts`:
   ```typescript
   if (config.provider === 'google') {
     return callGemini(config, messages)
   }
   ```

## Future: User-Facing Model Dropdown

The system is ready for a model dropdown! Here's how to implement:

### Backend: API Endpoint
Create `/api/models/route.ts`:

```typescript
import { AVAILABLE_MODELS } from '@/lib/ai-models'

export async function GET() {
  const models = Object.entries(AVAILABLE_MODELS).map(([key, config]) => ({
    key,
    displayName: config.displayName,
    provider: config.provider,
  }))

  return NextResponse.json({ models })
}
```

### Frontend: Model Selector
Add to `ChatInterface.tsx`:

```typescript
const [selectedModel, setSelectedModel] = useState('claude-sonnet')

// In sendMessage():
body: JSON.stringify({
  message: userMessage,
  conversationId,
  model: selectedModel,  // Pass selected model
})
```

### Backend: Use Selected Model
Update `chat/route.ts`:

```typescript
const { message, conversationId, model } = await req.json()
const modelConfig = getModelConfig(model)  // Use user's choice
```

## ANZ Tech Career Coach+ Prompt

The system includes a specialized prompt for the Australian/New Zealand tech market:

### Key Features
- **Resume Rewrite Rules**: 8-rule system with metric-first approach
- **ATS Optimization**: Keyword matching, format guidelines
- **LinkedIn Style Guide**: Story → Lesson → Takeaway → CTA
- **Regional Context**: Sydney, Melbourne, Auckland, Wellington
- **Reality Filter**: Never invents data, marks inferences
- **Career Coaching**: Job search, networking, negotiation strategies

### Formula
```
{Metric} + {Verb} + {Action} + {Tech/Context} → {Outcome}
```

**Example:**
"Cut p95 latency 38% by refactoring Django ORM hotspots + Redis caching—lifting checkout conversion +3.2% in ANZ."

## Benefits

### 1. **Easy Model Switching**
Change models with a single env var change

### 2. **Cost Management**
Use expensive models (GPT-4) for complex tasks, cheaper ones (GPT-3.5) for simple tasks

### 3. **Provider Redundancy**
Fall back to OpenAI if Anthropic has issues (implement fallback logic)

### 4. **Future-Proof**
Ready for model dropdowns, A/B testing, per-user models

### 5. **Consistent Interface**
All providers work the same way in your code

## Monitoring

Track which model is being used:

```typescript
logApi('Model used', {
  provider: modelConfig.provider,
  modelId: modelConfig.modelId,
  tokensUsed: response.usage?.totalTokens
})
```

## Testing

Test different models locally:

```bash
# Test Claude
DEFAULT_AI_MODEL=claude-sonnet npm run dev

# Test GPT-4
DEFAULT_AI_MODEL=gpt-4-turbo npm run dev
```

## Production Deployment

### Vercel Environment Variables
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `ANTHROPIC_API_KEY`: Your Anthropic API key
   - `DEFAULT_AI_MODEL`: `claude-sonnet` (or your preferred default)
3. Redeploy

### Cost Monitoring
- **Claude Sonnet**: ~$3 per million input tokens, ~$15 per million output tokens
- **GPT-4 Turbo**: ~$10 per million input tokens, ~$30 per million output tokens
- Monitor usage via Anthropic Console and OpenAI Dashboard

---

**Built with future-proofing in mind for Careersy Coaching** 🚀
