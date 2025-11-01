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
}

/**
 * Detect and parse slash commands from user input
 */
export function parseCommand(message: string): CommandResult {
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
      return {
        isCommand: true,
        command: 'help',
        responseMessage: `**Available Commands:**

**/navigator**
Switch to Navigator mode (1-on-1 coaching)

**/cartographer**
Switch to Cartographer mode (knowledge extraction)

**/shipwright**
Switch to Shipwright mode (post crafting)

**/help**
Show this help message

---

Just type a command to switch modes. Your conversation context carries over.`
      }

    default:
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
 */
export function getAvailableCommands() {
  return [
    {
      command: '/navigator',
      description: 'Personal coaching mode'
    },
    {
      command: '/cartographer',
      description: 'Knowledge extraction mode'
    },
    {
      command: '/shipwright',
      description: 'Post crafting mode'
    },
    {
      command: '/help',
      description: 'Show available commands'
    }
  ]
}
