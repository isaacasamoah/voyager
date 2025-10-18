import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

export interface CommunityConfig {
  id: string
  name: string
  description?: string
  systemPrompt: 'default' | 'custom' | 'template'
  customPrompt?: string
  promptConfig?: {
    domain: string
    expertise: string
    context: string
  }
  experts: string[]
  public: boolean
  allowPublicConversations: boolean
  inviteOnly?: boolean
  inviteToken?: string
  branding?: {
    colors: {
      primary: string
      background: string
      text: string
    }
    logo?: string
  }
}

const COMMUNITIES_DIR = join(process.cwd(), 'communities')

/**
 * Load a specific community configuration
 */
export function getCommunityConfig(communityId: string): CommunityConfig | null {
  try {
    const configPath = join(COMMUNITIES_DIR, `${communityId}.json`)
    const configData = readFileSync(configPath, 'utf-8')
    return JSON.parse(configData) as CommunityConfig
  } catch (error) {
    console.error(`Failed to load community config for ${communityId}:`, error)
    return null
  }
}

/**
 * Load all community configurations
 */
export function getAllCommunityConfigs(): CommunityConfig[] {
  try {
    const files = readdirSync(COMMUNITIES_DIR)
    const jsonFiles = files.filter(file => file.endsWith('.json'))

    return jsonFiles
      .map(file => {
        const communityId = file.replace('.json', '')
        return getCommunityConfig(communityId)
      })
      .filter((config): config is CommunityConfig => config !== null)
  } catch (error) {
    console.error('Failed to load community configs:', error)
    return []
  }
}

/**
 * Get community system prompt
 */
export function getCommunitySystemPrompt(config: CommunityConfig): string {
  if (config.systemPrompt === 'custom' && config.customPrompt) {
    return config.customPrompt
  }

  if (config.systemPrompt === 'template' && config.promptConfig) {
    const { domain, expertise, context } = config.promptConfig
    return `You are an expert in ${domain}, helping ${context} with ${expertise}.
Provide helpful, accurate, and practical advice. Be conversational and supportive.
When you don't know something, say so honestly. Focus on actionable guidance.`
  }

  // Default Voyager prompt
  return `You are a helpful AI assistant for the Voyager community platform.
Provide thoughtful, accurate responses to help users learn and grow.
Be conversational, supportive, and honest. When uncertain, acknowledge it.
Focus on helping users ask better questions and connect with others in the community.`
}

/**
 * Check if user is an expert in a community
 */
export function isExpert(userEmail: string, communityId: string): boolean {
  const config = getCommunityConfig(communityId)
  if (!config) return false
  return config.experts.includes(userEmail)
}

/**
 * Validate invite token for a community
 */
export function validateInviteToken(communityId: string, token: string): boolean {
  const config = getCommunityConfig(communityId)
  if (!config || !config.inviteOnly) return true // Public communities don't need tokens
  return config.inviteToken === token
}

/**
 * Get public communities (for discovery)
 */
export function getPublicCommunities(): CommunityConfig[] {
  return getAllCommunityConfigs().filter(config => config.public)
}
