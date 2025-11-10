'use client'

import { useState, useEffect } from 'react'

interface ShipwrightModalProps {
  anchorId: string
  onClose: () => void
}

export default function ShipwrightModal({ anchorId, onClose }: ShipwrightModalProps) {
  const [markdownContent, setMarkdownContent] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch the context anchor content on mount
  useEffect(() => {
    async function fetchAnchor() {
      try {
        setLoading(true)
        const response = await fetch(`/api/context-anchors/${anchorId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch context anchor')
        }

        const data = await response.json()
        setMarkdownContent(data.anchor.contentMarkdown || '')
      } catch (error) {
        console.error('Error fetching anchor:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnchor()
  }, [anchorId])

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      {/* Modal Container */}
      <div className="w-full h-full max-w-[100vw] max-h-[100vh] bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Edit with Shipwright
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Two-pane layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Pane - Chat Interface (placeholder for now) */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="text-sm text-gray-500">
                Chat interface coming in next step...
              </div>
            </div>
          </div>

          {/* Right Pane - Markdown Preview */}
          <div className="w-1/2 flex flex-col bg-gray-50">
            <div className="px-6 py-3 border-b border-gray-200 bg-white">
              <h3 className="text-sm font-semibold text-gray-700">Preview</h3>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-sm text-gray-400">Loading...</div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 bg-white p-4 rounded-lg border border-gray-200">
                    {markdownContent}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
