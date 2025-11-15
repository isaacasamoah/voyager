/**
 * Command Detection & Parsing
 *
 * Handles slash commands for mode switching and other bot-like interactions
 */

export type VoyagerMode = 'navigator' | 'cartographer' | 'shipwright'

export interface CommandResult {
  isCommand: boolean
  command?: string
  mode?: VoyagerMode
  responseMessage?: string
  communityCommandPrompt?: string  // For community commands (e.g., /jung, /freud)
}

import type { CommunityConfig } from './communities'

/**
 * Detect and parse slash commands from user input
 * Supports both platform commands (mode switching) and community commands (domain-specific)
 */
export function parseCommand(message: string, communityConfig?: CommunityConfig): CommandResult {
  const trimmed = message.trim()

  // Not a command if doesn't start with /
  if (!trimmed.startsWith('/')) {
    return { isCommand: false }
  }

  // Extract command (everything after / until first space or end)
  const commandMatch = trimmed.match(/^\/(\w+)/)
  if (!commandMatch) {
    return { isCommand: false }
  }

  const command = commandMatch[1].toLowerCase()

  // Mode switching commands
  switch (command) {
    case 'navigator':
      return {
        isCommand: true,
        command: 'navigator',
        mode: 'navigator',
        responseMessage: "Navigator here. I'm your personal coach. What's on your mind?"
      }

    case 'cartographer':
      return {
        isCommand: true,
        command: 'cartographer',
        mode: 'cartographer',
        responseMessage: "🗺️ Cartographer here. Let's extract some knowledge. I'll start with **2-3 questions** about your experience - we can always go deeper if you want. What framework, strategy, or expertise should we document?"
      }

    case 'shipwright':
      return {
        isCommand: true,
        command: 'shipwright',
        mode: 'shipwright',
        responseMessage: "Shipwright here. Ready to craft a quality post. What topic are you thinking about?"
      }

    case 'help':
      // Build help message dynamically
      let helpMessage = `**Available Commands:**

**/navigator**
Switch to Navigator mode (1-on-1 coaching)

**/cartographer**
Switch to Cartographer mode (knowledge extraction)

**/shipwright**
Switch to Shipwright mode (post crafting)

**/help**
Show this help message`

      // Add community commands if they exist
      if (communityConfig?.communityCommands && communityConfig.communityCommands.length > 0) {
        helpMessage += `

---

**Community Commands:**

`
        communityConfig.communityCommands.forEach(cmd => {
          helpMessage += `**/${cmd.command}** - ${cmd.displayName}
${cmd.description}

`
        })
      }

      helpMessage += `

---

Just type a command to switch modes. Your conversation context carries over.`

      return {
        isCommand: true,
        command: 'help',
        responseMessage: helpMessage
      }

    default:
      // Check if it's a community command
      if (communityConfig?.communityCommands) {
        const communityCommand = communityConfig.communityCommands.find(
          cmd => cmd.command.toLowerCase() === command
        )

        if (communityCommand) {
          return {
            isCommand: true,
            command,
            communityCommandPrompt: communityCommand.prompt,
            responseMessage: `Switching to ${communityCommand.displayName}...`
          }
        }
      }

      // Unknown command
      return {
        isCommand: true,
        command,
        responseMessage: `Unknown command: \`/${command}\`\n\nTry **/help** to see available commands.`
      }
  }
}

/**
 * Get available commands for autocomplete
 * Returns both platform commands and community-specific commands
 */
export function getAvailableCommands(communityConfig?: CommunityConfig) {
  const platformCommands = [
    {
      command: '/navigator',
      description: 'Personal coaching mode',
      type: 'platform' as const
    },
    {
      command: '/cartographer',
      description: 'Knowledge extraction mode',
      type: 'platform' as const
    },
    {
      command: '/shipwright',
      description: 'Post crafting mode',
      type: 'platform' as const
    },
    {
      command: '/help',
      description: 'Show available commands',
      type: 'platform' as const
    }
  ]

  const communityCommands = communityConfig?.communityCommands?.map(cmd => ({
    command: `/${cmd.command}`,
    description: cmd.description,
    displayName: cmd.displayName,
    type: 'community' as const
  })) || []

  return [...platformCommands, ...communityCommands]
}
