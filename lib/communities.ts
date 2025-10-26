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

  // Modular prompt structure
  domainExpertise?: {
    role: string
    mission: string
    coreCapabilities?: string[]
    [key: string]: any  // Allow flexible domain-specific fields
  }
  modes?: {
    coach?: {
      behavior: string
      style: string
      guidance?: string
    }
    curator?: {
      banner?: string
      role?: string
      behavior: string
      criticalDirective?: string
      expertiseUsage?: string
      goodExpertiseUse?: string[]
      badExpertiseUse?: string[]
      approach?: {
        message1: string
        message2or3: string
        timing: string
      }
      postFormat?: string
      postStructure?: string
      reminders?: string[]
      exampleInteraction?: {
        user: string
        response1: string
        user2: string
        response2: string
      }
    }
  }

  experts: string[]
  public: boolean
  requiresAuth?: boolean  // If true, requires user to be logged in to access
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
 * Get community system prompt - Modular composition
 */
export function getCommunitySystemPrompt(config: CommunityConfig, options?: { curateMode?: boolean, contentType?: string }): string {
  const curateMode = options?.curateMode || false
  const mode = curateMode ? 'curator' : 'coach'

  // If no modular structure, return fallback
  if (!config.domainExpertise || !config.modes) {
    return `You are a helpful AI assistant for the ${config.name} community.
Provide thoughtful, accurate responses to help users learn and grow.`
  }

  const expertise = config.domainExpertise
  const modeConfig = config.modes[mode]

  if (!modeConfig) {
    return `You are ${expertise.role}. ${expertise.mission}`
  }

  // Build modular prompt: Domain Expertise + Mode Behavior
  const sections: string[] = []

  // === DOMAIN EXPERTISE SECTION ===
  sections.push(`You are ${expertise.role}.`)
  sections.push(`\n${expertise.mission}`)

  if (expertise.coreCapabilities && expertise.coreCapabilities.length > 0) {
    sections.push(`\n\nCore capabilities:`)
    expertise.coreCapabilities.forEach(cap => {
      sections.push(`- ${cap}`)
    })
  }

  // Add domain-specific fields dynamically (resumeRules, regionalContext, etc.)
  Object.keys(expertise).forEach(key => {
    // Skip the ones we already handled
    if (['role', 'mission', 'coreCapabilities'].includes(key)) return

    const value = expertise[key]

    if (typeof value === 'string') {
      // Simple string field: "resumeFormula: 'X + Y = Z'"
      sections.push(`\n\n**${key}**: ${value}`)
    } else if (Array.isArray(value)) {
      // Array field: "resumeRewriteRules: [...]"
      sections.push(`\n\n**${key}**:`)
      value.forEach(item => sections.push(`- ${item}`))
    } else if (typeof value === 'object') {
      // Object field: "regionalContext: { cities: [...], companies: [...] }"
      sections.push(`\n\n**${key}**: ${JSON.stringify(value, null, 2)}`)
    }
  })

  // === MODE BEHAVIOR SECTION ===
  sections.push(`\n\n━━━━━━━━━━━━━━━━━━━━━`)

  if (mode === 'curator' && modeConfig.banner) {
    sections.push(`\n${modeConfig.banner}`)
  } else {
    sections.push(`\n**MODE: ${mode.toUpperCase()}**`)
  }

  if (mode === 'curator' && (modeConfig as any).role) {
    sections.push(`\nYou are the ${(modeConfig as any).role}.`)
  }

  sections.push(`\n${modeConfig.behavior}`)
  sections.push(`\nStyle: ${modeConfig.style}`)

  // === CURATOR-SPECIFIC SECTIONS ===
  if (mode === 'curator') {
    const curator = modeConfig as any

    if (curator.criticalDirective) {
      sections.push(`\n\n**CRITICAL:** ${curator.criticalDirective}`)
    }

    if (curator.expertiseUsage) {
      sections.push(`\n\n**How to use your expertise:** ${curator.expertiseUsage}`)
    }

    if (curator.goodExpertiseUse && curator.goodExpertiseUse.length > 0) {
      sections.push(`\n\n**Good uses of expertise:**`)
      curator.goodExpertiseUse.forEach((use: string) => sections.push(`- ${use}`))
    }

    if (curator.badExpertiseUse && curator.badExpertiseUse.length > 0) {
      sections.push(`\n\n**Bad uses of expertise (avoid):**`)
      curator.badExpertiseUse.forEach((use: string) => sections.push(`- ${use}`))
    }

    if (curator.approach) {
      sections.push(`\n\n**YOUR APPROACH:**`)
      sections.push(`- Message 1: ${curator.approach.message1}`)
      sections.push(`- Message 2-3: ${curator.approach.message2or3}`)
      sections.push(`- Timing: ${curator.approach.timing}`)
    }

    if (curator.postFormat) {
      sections.push(`\n\nPost format: ${curator.postFormat}`)
    }

    if (curator.postStructure) {
      sections.push(`\nPost structure:\n${curator.postStructure}`)
    }

    if (curator.reminders && curator.reminders.length > 0) {
      sections.push(`\n\n**REMINDERS:**`)
      curator.reminders.forEach((reminder: string) => sections.push(reminder))
    }

    if (curator.exampleInteraction) {
      sections.push(`\n\n**EXAMPLE INTERACTION:**`)
      sections.push(`\nUser: "${curator.exampleInteraction.user}"`)
      sections.push(`\nYou: "${curator.exampleInteraction.response1}"`)
      sections.push(`\nUser: "${curator.exampleInteraction.user2}"`)
      sections.push(`\nYou: "${curator.exampleInteraction.response2}"`)
    }
  }
  // === COACH-SPECIFIC SECTIONS ===
  else if (mode === 'coach' && modeConfig.guidance) {
    sections.push(`\n\n**Guidance:** ${modeConfig.guidance}`)
  }

  return sections.join('')
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
