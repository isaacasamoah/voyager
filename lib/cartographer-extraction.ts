/**
 * Cartographer Extraction Helpers
 *
 * Client-side and server-side utilities for triggering knowledge extraction
 * when Cartographer sessions complete.
 */

/**
 * Check if AI response indicates Cartographer session is complete
 */
export function isCartographerSessionComplete(aiResponse: string): boolean {
  return aiResponse.includes('[SESSION_COMPLETE]')
}

/**
 * Remove the session complete marker from AI response before showing to user
 */
export function cleanSessionCompleteMarker(aiResponse: string): string {
  return aiResponse.replace(/\[SESSION_COMPLETE\]/g, '').trim()
}

/**
 * Trigger background extraction (fire-and-forget)
 *
 * @param conversationId - ID of the conversation to extract
 * @param expertEmail - Email of the expert (optional, inferred from session)
 * @param communityId - Community ID (optional, inferred from conversation)
 */
export async function triggerCartographerExtraction(
  conversationId: string,
  expertEmail?: string,
  communityId?: string
): Promise<void> {
  try {
    const response = await fetch('/api/cartographer/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId,
        expertEmail,
        communityId
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Extraction failed:', error)
      return
    }

    const result = await response.json()
    console.log('✅ Knowledge extracted:', result.topic)
    console.log(`   - ${result.counts.insights} insights`)
    console.log(`   - ${result.counts.promptUpdates} prompt updates`)
    console.log(`   - ${result.counts.ragEntries} RAG entries`)
    console.log(`   - ${result.counts.finetuningExamples} fine-tuning examples`)

  } catch (error) {
    // Don't throw - extraction failure shouldn't affect user experience
    console.error('Extraction error:', error)
  }
}
