'use client'

import { useState, useEffect } from 'react'

interface ContextAnchor {
  id: string
  filename: string
  fileType: string
  createdAt: string
  originalUrl?: string
}

interface ContextAnchorsProps {
  communityId: string
}

export default function ContextAnchors({ communityId }: ContextAnchorsProps) {
  const [anchors, setAnchors] = useState<ContextAnchor[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Fetch context anchors on mount
  useEffect(() => {
    fetchAnchors()
  }, [communityId])

  async function fetchAnchors() {
    try {
      setLoading(true)
      const response = await fetch(`/api/context-anchors?communityId=${communityId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch context anchors')
      }

      const data = await response.json()
      setAnchors(data.anchors || [])
    } catch (err: any) {
      console.error('Error fetching anchors:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function uploadFile(file: File) {
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('communityId', communityId)

      const response = await fetch('/api/context-anchors/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()

      // Add new anchor to list
      setAnchors([data.anchor, ...anchors])
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    await uploadFile(file)
    e.target.value = '' // Reset file input
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['.pdf', '.docx', '.txt', '.md']
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!validTypes.includes(fileExt)) {
      setError(`Invalid file type. Supported formats: ${validTypes.join(', ')}`)
      return
    }

    await uploadFile(file)
  }

  async function handleRemove(anchorId: string) {
    if (!confirm('Remove this document?')) return

    try {
      const response = await fetch(`/api/context-anchors/${anchorId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to remove document')
      }

      // Remove from list
      setAnchors(anchors.filter(a => a.id !== anchorId))
    } catch (err: any) {
      console.error('Remove error:', err)
      setError(err.message)
    }
  }

  function getFileIcon(fileType: string) {
    const iconClass = "w-4 h-4"

    switch (fileType) {
      case 'pdf':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ef4444' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
      case 'docx':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#3b82f6' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'md':
      case 'txt':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#6b7280' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#9ca3af' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
    }
  }

  return (
    <div className="px-3 py-4 border-t border-gray-100">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
          Context Anchors
        </h3>
      </div>

      {/* Upload Button with Drag & Drop */}
      <label
        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed transition-colors cursor-pointer mb-3 ${
          uploading
            ? 'border-gray-200 bg-gray-50 cursor-wait'
            : isDragging
            ? 'border-blue-500 bg-blue-100'
            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <svg className={`w-4 h-4 ${uploading ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span className={`text-sm ${uploading ? 'text-gray-400' : isDragging ? 'text-blue-700' : 'text-gray-700'}`}>
          {uploading ? 'Uploading...' : isDragging ? 'Drop file here' : 'Upload or drag file'}
        </span>
        <input
          type="file"
          accept=".pdf,.docx,.txt,.md"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
        />
      </label>

      {/* Error Message */}
      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Documents List */}
      <div className="space-y-1">
        {loading ? (
          <div className="text-xs text-gray-400 text-center py-4">
            Loading...
          </div>
        ) : anchors.length === 0 ? (
          <div className="text-xs text-gray-400 text-center py-4">
            No documents uploaded yet
          </div>
        ) : (
          anchors.map((anchor) => (
            <div
              key={anchor.id}
              className="group flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* File Icon */}
              <div className="flex-shrink-0">
                {getFileIcon(anchor.fileType)}
              </div>

              {/* Filename */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 truncate">
                  {anchor.filename}
                </p>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => handleRemove(anchor.id)}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                title="Remove document"
              >
                <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
