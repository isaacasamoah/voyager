'use client'

/**
 * Prompt Update Card Component
 *
 * Displays a single prompt update with constitutional analysis,
 * confidence score, and approve/reject actions
 */

import { useState } from 'react'
import { approveAndApplyUpdate, rejectUpdate } from './actions'

interface PromptUpdateCardProps {
  update: any
  sessionId: string
  updateIndex: number
  sessionTopic: string
  expertEmail: string
  communityId: string
}

export function PromptUpdateCard({
  update,
  sessionId,
  updateIndex,
  sessionTopic,
  expertEmail,
  communityId
}: PromptUpdateCardProps) {
  const [isApplying, setIsApplying] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [showFullEvidence, setShowFullEvidence] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string } | null>(null)

  const isHighConfidence = update.confidence >= 90
  const autoApplyReady = isHighConfidence && update.autoApplyRecommendation

  const handleApprove = async () => {
    if (!confirm(`Apply this update to ${communityId}/${update.section}?`)) {
      return
    }

    setIsApplying(true)
    setResult(null)

    const response = await approveAndApplyUpdate(sessionId, updateIndex)

    setIsApplying(false)
    setResult({
      success: response.success,
      message: response.success
        ? `✅ ${response.message} (${response.commitHash?.substring(0, 8)})`
        : `❌ ${response.error}`
    })
  }

  const handleReject = async () => {
    if (!confirm('Reject this update? It will not be applied.')) {
      return
    }

    setIsRejecting(true)
    setResult(null)

    const response = await rejectUpdate(sessionId, updateIndex)

    setIsRejecting(false)
    setResult({
      success: response.success,
      message: response.success ? '✅ Update rejected' : `❌ ${response.error}`
    })
  }

  // If already processed, show result
  if (result) {
    return (
      <div className={`rounded-lg border p-6 ${
        result.success
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="text-sm font-medium">
          {result.message}
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg border p-6 space-y-4 ${
      autoApplyReady
        ? 'bg-green-50 border-green-200'
        : 'bg-amber-50 border-amber-200'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          {autoApplyReady && (
            <div className="inline-block px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
              ✅ AUTO-APPLY READY
            </div>
          )}
          {!autoApplyReady && update.confidence >= 70 && (
            <div className="inline-block px-2 py-1 bg-amber-600 text-white text-xs font-semibold rounded">
              ⚠️  NEEDS REVIEW
            </div>
          )}
          <h3 className="font-semibold text-lg text-gray-900">
            {update.section}
          </h3>
          <div className="text-sm text-gray-600">
            From: {sessionTopic} • {expertEmail}
          </div>
        </div>

        <div className="text-right space-y-1">
          <div className="text-2xl font-bold text-gray-900">
            {update.confidence}
            <span className="text-sm font-normal text-gray-500">/100</span>
          </div>
          <div className="text-xs text-gray-600">
            Risk: {update.riskLevel}
          </div>
          <div className="text-xs text-gray-600">
            Priority: {update.priority}
          </div>
        </div>
      </div>

      {/* Suggested Addition */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Suggested Addition
        </div>
        <div className="text-sm text-gray-800 leading-relaxed">
          {update.suggestedAddition}
        </div>
      </div>

      {/* Constitutional Checks */}
      <div className="grid grid-cols-4 gap-2">
        {['elevation', 'transparency', 'agency', 'growth'].map((check) => {
          const checkData = update.constitutionalCheck[check]
          return (
            <div
              key={check}
              className={`rounded px-3 py-2 text-center ${
                checkData.passes
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              <div className="text-xs font-semibold capitalize">
                {check}
              </div>
              <div className="text-lg">
                {checkData.passes ? '✅' : '❌'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Evidence */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="text-xs font-semibold text-blue-700 uppercase mb-2">
          💡 Evidence from Session
        </div>
        <div className="text-sm text-blue-900">
          {showFullEvidence
            ? update.evidenceFromSession
            : `${update.evidenceFromSession.substring(0, 150)}...`}
        </div>
        {update.evidenceFromSession.length > 150 && (
          <button
            onClick={() => setShowFullEvidence(!showFullEvidence)}
            className="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium"
          >
            {showFullEvidence ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* Reasoning */}
      <div className="text-sm text-gray-700">
        <span className="font-semibold">Reasoning:</span> {update.reasoning}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleApprove}
          disabled={isApplying || isRejecting}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            autoApplyReady
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isApplying ? 'Applying...' : 'Approve & Apply'}
        </button>

        <button
          onClick={handleReject}
          disabled={isApplying || isRejecting}
          className="px-4 py-2 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRejecting ? 'Rejecting...' : 'Reject'}
        </button>
      </div>
    </div>
  )
}
