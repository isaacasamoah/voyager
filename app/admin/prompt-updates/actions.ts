'use server'

/**
 * Server Actions for Prompt Update Admin UI
 *
 * Handles approve/reject/apply operations with auth and validation
 */

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { applyPromptUpdate, validatePromptUpdate } from '@/lib/prompt-update-engine'

/**
 * Approve and apply a prompt update
 */
export async function approveAndApplyUpdate(
  sessionId: string,
  updateIndex: number
) {
  // Auth check
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return { success: false, error: 'Unauthorized' }
  }

  // Check if running on Vercel (read-only filesystem)
  if (process.env.VERCEL) {
    return {
      success: false,
      error: 'Prompt updates can only be applied locally. Vercel has a read-only filesystem. Use the admin UI to review, then apply updates locally and push to deploy.'
    }
  }

  try {
    // Get session
    const cartographerSession = await prisma.cartographerSession.findUnique({
      where: { id: sessionId }
    })

    if (!cartographerSession) {
      return { success: false, error: 'Session not found' }
    }

    const update = (cartographerSession.promptUpdates as any[])[updateIndex]

    if (!update) {
      return { success: false, error: 'Update not found at index ' + updateIndex }
    }

    // Validate before applying
    const validation = validatePromptUpdate(
      cartographerSession.communityId,
      update
    )

    if (!validation.valid) {
      return { success: false, error: `Validation failed: ${validation.error}` }
    }

    // Apply to community JSON
    const result = await applyPromptUpdate(
      cartographerSession.communityId,
      update
    )

    if (!result.success) {
      return { success: false, error: result.error }
    }

    // Mark update as applied in database
    const currentApplied = cartographerSession.appliedUpdates || []
    await prisma.cartographerSession.update({
      where: { id: sessionId },
      data: {
        appliedUpdates: [...currentApplied, updateIndex],
        appliedAt: new Date(),
        appliedBy: session.user.email,
        // Mark as processed if all updates are handled
        processed: (currentApplied.length + 1) === (cartographerSession.promptUpdates as any[]).length
      }
    })

    // Revalidate the page
    revalidatePath('/admin/prompt-updates')

    return {
      success: true,
      commitHash: result.commitHash,
      message: `Applied update to ${update.section}`
    }

  } catch (error) {
    console.error('Error in approveAndApplyUpdate:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Reject a prompt update (won't be applied)
 */
export async function rejectUpdate(
  sessionId: string,
  updateIndex: number
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const cartographerSession = await prisma.cartographerSession.findUnique({
      where: { id: sessionId }
    })

    if (!cartographerSession) {
      return { success: false, error: 'Session not found' }
    }

    const currentRejected = cartographerSession.rejectedUpdates || []
    const currentApplied = cartographerSession.appliedUpdates || []
    const totalUpdates = (cartographerSession.promptUpdates as any[]).length

    await prisma.cartographerSession.update({
      where: { id: sessionId },
      data: {
        rejectedUpdates: [...currentRejected, updateIndex],
        // Mark as processed if all updates are handled (applied or rejected)
        processed: (currentRejected.length + 1 + currentApplied.length) === totalUpdates
      }
    })

    revalidatePath('/admin/prompt-updates')

    return { success: true }

  } catch (error) {
    console.error('Error in rejectUpdate:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Batch approve all high-confidence updates
 */
export async function approveAllHighConfidence(sessionId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const cartographerSession = await prisma.cartographerSession.findUnique({
      where: { id: sessionId }
    })

    if (!cartographerSession) {
      return { success: false, error: 'Session not found' }
    }

    const updates = cartographerSession.promptUpdates as any[]
    const highConfidenceUpdates = updates
      .map((update, index) => ({ update, index }))
      .filter(({ update }) =>
        update.confidence >= 90 &&
        update.autoApplyRecommendation &&
        update.constitutionalCheck.elevation.passes &&
        update.constitutionalCheck.transparency.passes &&
        update.constitutionalCheck.agency.passes &&
        update.constitutionalCheck.growth.passes
      )

    let appliedCount = 0
    const errors: string[] = []

    // Apply each high-confidence update
    for (const { index } of highConfidenceUpdates) {
      const result = await approveAndApplyUpdate(sessionId, index)
      if (result.success) {
        appliedCount++
      } else {
        errors.push(`Update ${index}: ${result.error}`)
      }
    }

    return {
      success: errors.length === 0,
      appliedCount,
      totalHighConfidence: highConfidenceUpdates.length,
      errors: errors.length > 0 ? errors : undefined
    }

  } catch (error) {
    console.error('Error in approveAllHighConfidence:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
