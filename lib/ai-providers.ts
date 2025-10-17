/**
 * AI Provider Interface
 * Abstracts different AI providers (OpenAI, Anthropic) behind a unified interface
 */

import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { ModelConfig } from './ai-models'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatCompletionResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

/**
 * Call the appropriate AI provider based on model config
 */
export async function callAIModel(
  config: ModelConfig,
  messages: ChatMessage[]
): Promise<ChatCompletionResponse> {
  if (config.provider === 'anthropic') {
    return callAnthropic(config, messages)
  } else if (config.provider === 'openai') {
    return callOpenAI(config, messages)
  } else {
    throw new Error(`Unsupported provider: ${config.provider}`)
  }
}

/**
 * Call Anthropic Claude API
 */
async function callAnthropic(
  config: ModelConfig,
  messages: ChatMessage[]
): Promise<ChatCompletionResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }

  const anthropic = new Anthropic({ apiKey })

  // Convert messages format - Claude separates system from conversation
  const systemMessage = messages.find((m) => m.role === 'system')?.content || config.systemPrompt
  const conversationMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

  const response = await anthropic.messages.create({
    model: config.modelId,
    max_tokens: config.maxTokens,
    temperature: config.temperature,
    system: systemMessage,
    messages: conversationMessages,
  })

  // Extract text content from response
  const textContent = response.content
    .filter((block) => block.type === 'text')
    .map((block) => ('text' in block ? block.text : ''))
    .join('')

  return {
    content: textContent,
    usage: {
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
    },
  }
}

/**
 * Call OpenAI GPT API
 */
async function callOpenAI(
  config: ModelConfig,
  messages: ChatMessage[]
): Promise<ChatCompletionResponse> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set')
  }

  const openai = new OpenAI({ apiKey })

  // OpenAI format is straightforward
  const response = await openai.chat.completions.create({
    model: config.modelId,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    temperature: config.temperature,
    max_tokens: config.maxTokens,
  })

  const content = response.choices[0].message.content || 'I apologize, I could not generate a response.'

  return {
    content,
    usage: response.usage
      ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        }
      : undefined,
  }
}
