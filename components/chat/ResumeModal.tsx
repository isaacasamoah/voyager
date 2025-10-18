'use client'

import { useState } from 'react'

interface ResumeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (resumeText: string) => Promise<void>
  initialResume?: string
}

export default function ResumeModal({ isOpen, onClose, onSave, initialResume = '' }: ResumeModalProps) {
  const [resumeText, setResumeText] = useState(initialResume)
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const handleSave = async () => {
    if (!resumeText.trim()) return

    setSaving(true)
    try {
      await onSave(resumeText)
      onClose()
    } catch (error) {
      console.error('Failed to save resume:', error)
      alert('Failed to save resume. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-lexend font-bold text-careersy-black">Add Context</h2>
          <p className="text-sm text-gray-600 mt-1">
            Add information to get personalized career advice
          </p>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste any of the following:&#10;&#10;• Resume/CV&#10;• Job description&#10;• LinkedIn profile&#10;• Cover letter&#10;• Interview questions&#10;• Career goals"
            className="w-full h-full min-h-[300px] p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-careersy-yellow focus:border-transparent resize-none"
          />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-3 border-2 border-gray-300 rounded-[30px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !resumeText.trim()}
            className="px-6 py-3 bg-careersy-yellow text-careersy-black rounded-[30px] font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
          >
            {saving ? 'Saving...' : 'Add Context'}
          </button>
        </div>
      </div>
    </div>
  )
}
