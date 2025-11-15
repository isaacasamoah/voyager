'use client'

import { useState, useEffect } from 'react'

interface OutputArtifact {
  id: string
  filename: string
  artifactType: string
  createdAt: string
  contentMarkdown?: string
  outputUrl?: string
}

interface OutputArtifactsProps {
  communityId: string
  branding?: any
}

export default function OutputArtifacts({ communityId, branding }: OutputArtifactsProps) {
  const [artifacts, setArtifacts] = useState<OutputArtifact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch output artifacts on mount
  useEffect(() => {
    fetchArtifacts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId])

  async function fetchArtifacts() {
    try {
      setLoading(true)
      const response = await fetch(`/api/output-artifacts?communityId=${communityId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch output artifacts')
      }

      const data = await response.json()
      setArtifacts(data.artifacts || [])
    } catch (err: any) {
      console.error('Error fetching artifacts:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this artifact?')) return

    try {
      const response = await fetch(`/api/output-artifacts/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete artifact')
      }

      // Remove from list
      setArtifacts(artifacts.filter(a => a.id !== id))
    } catch (err: any) {
      console.error('Delete error:', err)
      alert('Failed to delete artifact. Please try again.')
    }
  }

  async function handleDownload(artifact: OutputArtifact) {
    try {
      // Fetch full artifact with contentMarkdown if not already loaded
      let content = artifact.contentMarkdown

      if (!content) {
        const response = await fetch(`/api/output-artifacts/${artifact.id}`)
        if (!response.ok) throw new Error('Failed to fetch artifact content')
        const data = await response.json()
        content = data.artifact.contentMarkdown
      }

      if (!content) {
        alert('No content available to download')
        return
      }

      // Create blob from markdown content
      const blob = new Blob([content], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)

      // Ensure filename has .md extension
      const filename = artifact.filename.endsWith('.md')
        ? artifact.filename
        : `${artifact.filename}.md`

      // Download
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Cleanup
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download artifact. Please try again.')
    }
  }

  function getFileIcon(type: string) {
    const iconClass = 'w-4 h-4'

    switch (type) {
      case 'resume':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#3b82f6' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'cover-letter':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#8b5cf6' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      case 'linkedin-post':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#0a66c2' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        )
      case 'email':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#10b981' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#6b7280' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="px-3 py-4 border-t border-gray-100">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
          Outputs
        </h3>
      </div>

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
        ) : artifacts.length === 0 ? (
          <div className="text-xs text-gray-400 text-center py-4">
            No exports yet. Use Shipwright to create and export documents.
          </div>
        ) : (
          artifacts.map((artifact) => (
            <div
              key={artifact.id}
              className="group flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* File Icon */}
              <div className="flex-shrink-0">
                {getFileIcon(artifact.artifactType)}
              </div>

              {/* Filename and Date */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 truncate">
                  {artifact.filename}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDate(artifact.createdAt)}
                </p>
              </div>

              {/* Download Button */}
              <button
                onClick={() => handleDownload(artifact)}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-50 rounded"
                title="Download"
              >
                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(artifact.id)}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                title="Delete"
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
