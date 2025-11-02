/**
 * Admin UI for Reviewing Prompt Updates
 *
 * Shows constitutional analysis, confidence scores, and allows
 * approve/reject actions with batch operations.
 */

import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PromptUpdateCard } from './PromptUpdateCard'

export default async function PromptUpdatesPage() {
  // Auth check - admin only
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect('/login')
  }

  // Get all unprocessed sessions with prompt updates
  const sessions = await prisma.cartographerSession.findMany({
    where: {
      processed: false
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Flatten all updates across sessions with session context
  const allUpdates = sessions.flatMap((session) => {
    const updates = session.promptUpdates as any[]
    const applied = session.appliedUpdates || []
    const rejected = session.rejectedUpdates || []

    return updates
      .map((update, index) => ({
        update,
        index,
        sessionId: session.id,
        sessionTopic: session.topic,
        expertEmail: session.expertEmail,
        communityId: session.communityId,
        isApplied: applied.includes(index),
        isRejected: rejected.includes(index),
        isPending: !applied.includes(index) && !rejected.includes(index)
      }))
      .filter(u => u.isPending) // Only show pending updates
  })

  // Categorize by confidence (treat undefined/null as needs review)
  const highConfidence = allUpdates.filter(u => u.update.confidence >= 90)
  const needsReview = allUpdates.filter(u => !u.update.confidence || u.update.confidence < 90)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            🧬 Prompt Update Review
          </h1>
          <p className="text-gray-600 mt-2">
            Review and apply constitutional prompt updates from Cartographer sessions
          </p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {allUpdates.length}
              </div>
              <div className="text-sm text-gray-600">Pending Updates</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {highConfidence.length}
              </div>
              <div className="text-sm text-gray-600">Auto-apply Ready</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">
                {needsReview.length}
              </div>
              <div className="text-sm text-gray-600">Needs Review</div>
            </div>
          </div>
        </div>

        {allUpdates.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-gray-400 text-lg">
              ✅ All caught up! No pending prompt updates.
            </div>
            <p className="text-gray-500 text-sm mt-2">
              New updates will appear here after Cartographer sessions complete.
            </p>
          </div>
        ) : (
          <>
            {/* High Confidence Section */}
            {highConfidence.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    ✅ Auto-Apply Ready ({highConfidence.length})
                  </h2>
                  <div className="text-sm text-gray-600">
                    Confidence ≥ 90 • All constitutional checks passed
                  </div>
                </div>

                {highConfidence.map((item) => (
                  <PromptUpdateCard
                    key={`${item.sessionId}-${item.index}`}
                    update={item.update}
                    sessionId={item.sessionId}
                    updateIndex={item.index}
                    sessionTopic={item.sessionTopic}
                    expertEmail={item.expertEmail}
                    communityId={item.communityId}
                  />
                ))}
              </div>
            )}

            {/* Needs Review Section */}
            {needsReview.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    ⚠️  Needs Review ({needsReview.length})
                  </h2>
                  <div className="text-sm text-gray-600">
                    Confidence &lt; 90 • Manual validation recommended
                  </div>
                </div>

                {needsReview.map((item) => (
                  <PromptUpdateCard
                    key={`${item.sessionId}-${item.index}`}
                    update={item.update}
                    sessionId={item.sessionId}
                    updateIndex={item.index}
                    sessionTopic={item.sessionTopic}
                    expertEmail={item.expertEmail}
                    communityId={item.communityId}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
