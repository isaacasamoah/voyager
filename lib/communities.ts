import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import type { VoyageTerminology } from './terminology'
import { VOYAGER_CONSTITUTION } from './prompts/constitution'
import { FEATURE_FLAGS } from './features'
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
    navigator?: {
      behavior: string
      style: string
      guidance?: string
    }
    shipwright?: {
      banner?: string
      role?: string
      behavior: string
      style: string
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
    cartographer?: {
      banner?: string
      role?: string
      behavior: string
      style: string
      criticalDirective?: string
      approach?: {
        message1: string
        "message2-3": string
        "message4-5": string
      }
      extractionFocus?: string[]
      documentationFormat?: string
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
    // Determine button text color based on primary background
    // For Careersy yellow (#fad02c), use black text for contrast
    // For dark backgrounds, use white text
    const primaryColor = communityBranding.colors.primary
    const isLightPrimary = primaryColor === '#fad02c' || primaryColor.toLowerCase().includes('yellow')
    const buttonTextColor = isLightPrimary ? 'text-black' : 'text-white'

    return {
      ...VOYAGER_BASE_THEME,
      components: {
        ...VOYAGER_BASE_THEME.components,
        button: `rounded-full hover:scale-105 ${buttonTextColor}`,
      },
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
export function getCommunitySystemPrompt(config: CommunityConfig, options?: { mode?: 'navigator' | 'shipwright' | 'cartographer', communityId?: string }): string {
  const mode = options?.mode || 'navigator'
  const communityId = options?.communityId || config.id

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

  // === MODE CONTROL - MUST COME FIRST ===
  // Critical: Tell AI what mode it's in BEFORE mode-specific instructions
  const modeBanner = (mode === 'shipwright' || mode === 'cartographer') && (modeConfig as any).banner
    ? (modeConfig as any).banner
    : null

  sections.push(`\n\n**IMPORTANT - MODE CONTROL:**
You are currently in **${mode}** mode. You MUST stay in this mode for the entire conversation.
- DO NOT switch to other modes based on user intent
- DO NOT suggest switching modes
- If a task would benefit from a different mode, handle it within your current mode's capabilities
- The user controls mode switching via UI buttons - you do not have this ability

${modeBanner ? `**CRITICAL FORMAT REQUIREMENT:** Every single response you give MUST start with this exact banner on the first line:\n${modeBanner}\n\nThis banner is part of your mode identity. Never skip it.` : ''}

Stay in **${mode}** mode regardless of what the user asks.`)

  sections.push(`\n\n━━━━━━━━━━━━━━━━━━━━━`)

  if (modeBanner) {
    sections.push(`\n${modeBanner}`)
  } else {
    sections.push(`\n**MODE: ${mode.toUpperCase()}**`)
  }

  if (mode === 'shipwright' && (modeConfig as any).role) {
    sections.push(`\nYou are the ${(modeConfig as any).role}.`)
  } else if (mode === 'cartographer' && (modeConfig as any).role) {
    sections.push(`\nYou are the ${(modeConfig as any).role}.`)
  }

  sections.push(`\n${modeConfig.behavior}`)
  sections.push(`\nStyle: ${modeConfig.style}`)

  // === SHIPWRIGHT-SPECIFIC SECTIONS ===
  if (mode === 'shipwright') {
    const shipwright = modeConfig as any

    if (shipwright.criticalDirective) {
      sections.push(`\n\n**CRITICAL:** ${shipwright.criticalDirective}`)
    }

    if (shipwright.expertiseUsage) {
      sections.push(`\n\n**How to use your expertise:** ${shipwright.expertiseUsage}`)
    }

    if (shipwright.goodExpertiseUse && shipwright.goodExpertiseUse.length > 0) {
      sections.push(`\n\n**Good uses of expertise:**`)
      shipwright.goodExpertiseUse.forEach((use: string) => sections.push(`- ${use}`))
    }

    if (shipwright.badExpertiseUse && shipwright.badExpertiseUse.length > 0) {
      sections.push(`\n\n**Bad uses of expertise (avoid):**`)
      shipwright.badExpertiseUse.forEach((use: string) => sections.push(`- ${use}`))
    }

    if (shipwright.approach) {
      sections.push(`\n\n**YOUR APPROACH:**`)
      sections.push(`- Message 1: ${shipwright.approach.message1}`)
      sections.push(`- Message 2-3: ${shipwright.approach.message2or3}`)
      sections.push(`- Timing: ${shipwright.approach.timing}`)
    }

    if (shipwright.postFormat) {
      sections.push(`\n\nPost format: ${shipwright.postFormat}`)
    }

    if (shipwright.postStructure) {
      sections.push(`\nPost structure:\n${shipwright.postStructure}`)
    }

    if (shipwright.reminders && shipwright.reminders.length > 0) {
      sections.push(`\n\n**REMINDERS:**`)
      shipwright.reminders.forEach((reminder: string) => sections.push(reminder))
    }

    if (shipwright.exampleInteraction) {
      sections.push(`\n\n**EXAMPLE INTERACTION:**`)
      sections.push(`\nUser: "${shipwright.exampleInteraction.user}"`)
      sections.push(`\nYou: "${shipwright.exampleInteraction.response1}"`)
      sections.push(`\nUser: "${shipwright.exampleInteraction.user2}"`)
      sections.push(`\nYou: "${shipwright.exampleInteraction.response2}"`)
    }
  }
  // === CARTOGRAPHER-SPECIFIC SECTIONS ===
  else if (mode === 'cartographer') {
    const cartographer = modeConfig as any

    if (cartographer.criticalDirective) {
      sections.push(`\n\n**CRITICAL:** ${cartographer.criticalDirective}`)
    }

    if (cartographer.approach) {
      sections.push(`\n\n**YOUR APPROACH:**`)
      sections.push(`- Message 1: ${cartographer.approach.message1}`)
      sections.push(`- Messages 2-3: ${cartographer.approach["message2-3"]}`)
      sections.push(`- Messages 4-5: ${cartographer.approach["message4-5"]}`)
    }

    if (cartographer.extractionFocus && cartographer.extractionFocus.length > 0) {
      sections.push(`\n\n**What to extract:**`)
      cartographer.extractionFocus.forEach((focus: string) => sections.push(`- ${focus}`))
    }

    if (cartographer.documentationFormat) {
      sections.push(`\n\n**Documentation format:**\n${cartographer.documentationFormat}`)
    }

    if (cartographer.reminders && cartographer.reminders.length > 0) {
      sections.push(`\n\n**REMINDERS:**`)
      cartographer.reminders.forEach((reminder: string) => sections.push(reminder))
    }

    if (cartographer.exampleInteraction) {
      sections.push(`\n\n**EXAMPLE INTERACTION:**`)
      sections.push(`\nUser: "${cartographer.exampleInteraction.user}"`)
      sections.push(`\nYou: "${cartographer.exampleInteraction.response1}"`)
      sections.push(`\nUser: "${cartographer.exampleInteraction.user2}"`)
      sections.push(`\nYou: "${cartographer.exampleInteraction.response2}"`)
    }
  }
  // === NAVIGATOR-SPECIFIC SECTIONS ===
  else if (mode === 'navigator' && 'guidance' in modeConfig && modeConfig.guidance) {
    sections.push(`\n\n**Guidance:** ${modeConfig.guidance}`)
  }

  // === CONSTITUTIONAL LAYER ===
  // Prepend Voyager constitution if:
  // 1. Feature flag is enabled AND
  // 2. NOT in Careersy basic mode (A/B test control group)
  const isBasicMode = communityId === 'careersy' && FEATURE_FLAGS.CAREERSY_MODE === 'basic'
  const constitutionalPrefix = (FEATURE_FLAGS.USE_CONSTITUTIONAL_LAYER && !isBasicMode)
    ? `${VOYAGER_CONSTITUTION}\n\n━━━━━━━━━━━━━━━━━━━━━\n\n`
    : '';

  // Debug: Log to verify mode and flag
  console.log('[Careersy A/B Test]', isBasicMode ? 'BASIC MODE (GPT + domain only)' : 'FULL VOYAGER (Claude + constitutional)');
  console.log('[Voyager Constitution]', (FEATURE_FLAGS.USE_CONSTITUTIONAL_LAYER && !isBasicMode) ? 'ENABLED' : 'DISABLED');

  return `${constitutionalPrefix}${sections.join('')}`
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
