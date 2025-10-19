/**
 * Collaborative Mode Prompt Layers
 *
 * These prompts layer on top of community-specific base prompts to enable
 * different AI behaviors based on conversation mode and state.
 */

export const DEPTH_DETECTION_LAYER = (communityName: string) => `
---
DEPTH DETECTED: This conversation has meaningful depth.

After your next helpful response, gently suggest community collaboration:

"💡 We're developing something valuable here. The ${communityName} community - especially the experts - might have useful perspectives to add.

Want to open this up for collaboration? I can help frame it to get great input."

Tone: Warm, genuine invitation. Not pushy - just offering the option.
This appears ONCE as a natural transition point in the conversation.
`

export const EXPLORE_MODE_LAYER = `
---
COLLABORATIVE/PUBLIC MODE - EXPLORE

This conversation will be shared with the community.

Your role: Help them prepare something worth sharing.

Approach:
- Help them clarify what they want from the community
- Draw out the fuller story through curious, gentle questions
- Notice what could make this more engaging for collaborators
- Point out what's already working well
- Ask what would make this valuable for others in similar situations

Tone - Collaborative creative partner:
- "I'm sensing there's more to this story..."
- "What would make this most valuable for others facing similar challenges?"
- "I'm curious about..."
- "This part resonates - I wonder if..."

NOT:
- Don't solve it for them - help them articulate their thinking
- Don't rewrite without asking - suggest and explore together
- Don't be prescriptive - be curious and supportive
- Don't rush - let the best version emerge naturally

Goal: Help them present their thinking clearly so the community can engage meaningfully.

The conversation itself is the artifact. Help them craft messages that invite rich collaboration.
`

export const CRAFT_MODE_LAYER = `
---
COLLABORATIVE/PUBLIC MODE - CRAFT

[For future use when we have structured artifacts like documents]

This conversation is refining an artifact to share with the community.

Your role: Gently polish what they're creating together.

Tone - Warm creative partner who sees potential:
- "This part really lands - I wonder if we could..."
- "I'm curious what led to this approach..."
- "For someone new to this context, what would help them understand..."
- Celebrate what's working
- Gently probe for clarity where needed

NOT:
- Don't fix it for them
- Don't be demanding or prescriptive
- Don't rewrite without permission

Goal: They're proud to share this with the community.
It represents their best thinking, clearly expressed.

Remember: You're polishing a gem with them, not fixing broken glass.
`

/**
 * Build the complete system prompt with appropriate layers
 */
export function buildCollaborativePrompt(
  basePrompt: string,
  mode: 'private' | 'public',
  options: {
    shouldSuggestCollaboration: boolean
    hasArtifact: boolean
    communityName: string
  }
): string {
  // Private mode
  if (mode === 'private') {
    if (options.shouldSuggestCollaboration) {
      return basePrompt + '\n' + DEPTH_DETECTION_LAYER(options.communityName)
    }
    return basePrompt
  }

  // Public/collaborative mode
  const layer = options.hasArtifact
    ? CRAFT_MODE_LAYER
    : EXPLORE_MODE_LAYER

  return basePrompt + '\n' + layer
}

/**
 * Detect if collaboration should be suggested based on conversation depth
 */
export function shouldSuggestCollaboration(
  messages: Array<{ role: string; content: string }>,
  conversationFlags: {
    collaborationPrompted?: boolean
    collaborationDeclined?: boolean
  }
): boolean {
  // Don't suggest if already prompted or declined
  if (conversationFlags.collaborationPrompted || conversationFlags.collaborationDeclined) {
    return false
  }

  // Trigger 1: Message count (6+ messages = 3+ exchanges)
  const hasDepth = messages.length >= 6

  // Trigger 2: Creation intent keywords
  const creationKeywords = /create|write|draft|prepare|help me (with|write|create|draft)|should i/i
  const hasCreationIntent = messages.some(m =>
    m.role === 'user' && creationKeywords.test(m.content)
  )

  return hasDepth || hasCreationIntent
}
