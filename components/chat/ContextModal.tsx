'use client'

import { useState } from 'react'

interface ContextModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (content: string, filename: string) => Promise<void>
  communityId: string
}

export default function ContextModal({ isOpen, onClose, onSave, communityId }: ContextModalProps) {
  const [content, setContent] = useState('')
  const [filename, setFilename] = useState('')
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const handleSave = async () => {
    if (!content.trim() || !filename.trim()) return

    setSaving(true)
    try {
      await onSave(content, filename)
      setContent('')
      setFilename('')
      onClose()
    } catch (error) {
      console.error('Failed to save context:', error)
      alert('Failed to save context. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-lexend font-bold text-gray-900">Add Context</h2>
          <p className="text-sm text-gray-600 mt-1">
            Paste text to add as context for personalized advice
          </p>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Name this context
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="e.g., 'Google PM Job Description' or 'My Resume'"
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-gray-900"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste any of the following:&#10;&#10;• Resume/CV&#10;• Job description&#10;• LinkedIn profile&#10;• Cover letter&#10;• Interview questions&#10;• Career goals"
              className="w-full min-h-[250px] p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none text-gray-900"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-3 border-2 border-gray-300 rounded-[30px] font-semibold text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !content.trim() || !filename.trim()}
            className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-[30px] font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
          >
            {saving ? 'Saving...' : 'Add Context'}
          </button>
        </div>
      </div>
    </div>
  )
}
