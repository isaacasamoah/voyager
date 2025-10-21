import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import type { VoyageTerminology } from './terminology'
export type { VoyageTerminology } from './terminology'

const VOYAGER_BASE_THEME = {
  typography: {
    title: {
      font: "font-lexend",
      size: "text-7xl",
      weight: "font-bold",
      tracking: "tracking-wider"
    },
    message: {
      size: "text-sm"
    },
    input: {
      size: "text-base"
    }
  },
  components: {
    messageUser: "bg-black text-white",
    messageAssistant: "bg-gray-100 text-black",
    button: "bg-black hover:bg-gray-800 text-white rounded-full hover:scale-105",
    input: "border border-gray-200 rounded-full focus:border-black",
    sidebar: "bg-white border-r border-gray-100",
    loadingDots: "bg-gray-400"
  },
  spacing: {
    messageMaxWidth: "80%",
    inputWidth: "60%"
  }
} as const

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
  showsCommunities?: boolean  // If true, sidebar shows communities instead of conversations
  inviteOnly?: boolean
  inviteToken?: string
  terminology?: VoyageTerminology  // Per-voyage custom terminology
  branding: {
      colors: {
        primary: string
        background: string
        text: string
        textSecondary?: string
      }
      logo?: string | null
      title?: string
    }
}

const COMMUNITIES_DIR = join(process.cwd(), 'communities')

/**
 * Load a specific community configuration
 */

 /**
   * Merge base Voyager theme with community branding
   */
  export function getFullBranding(communityBranding:
  CommunityConfig['branding']) {
    return {
      ...VOYAGER_BASE_THEME,
      colors: {
        ...communityBranding.colors,
        textSecondary: communityBranding.colors.textSecondary ||
  communityBranding.colors.text
      },
      logo: communityBranding.logo,
      title: communityBranding.title
    }
  }

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

/**
 * Get terminology for a voyage (community)
 * Re-exported from ./terminology for convenience
 */
export { DEFAULT_TERMINOLOGY, getVoyageTerminology } from './terminology'
