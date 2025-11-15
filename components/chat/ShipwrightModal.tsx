'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { markdown } from '@codemirror/lang-markdown'

// Dynamically import CodeMirror to avoid SSR issues
const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), { ssr: false })

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ShipwrightModalProps {
  anchorId: string
  onClose: () => void
  branding?: any
}

export default function ShipwrightModal({ anchorId, onClose, branding }: ShipwrightModalProps) {
  // Use community colors or fallback to Voyager defaults
  const colors = branding?.colors || {
    primary: '#000000',
    background: '#ffffff',
    text: '#000000',
    textSecondary: '#6b7280',
  }
  const [markdownContent, setMarkdownContent] = useState('')
  const [previousMarkdown, setPreviousMarkdown] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentVersion, setCurrentVersion] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<{ section: string; timestamp: number } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Edit mode state
  const [editMode, setEditMode] = useState<'ai' | 'manual'>('ai')
  const [draftMarkdown, setDraftMarkdown] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Save to Outputs state
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [filename, setFilename] = useState<string>('')
  const [communityId] = useState('careersy') // TODO: Pass from props

  // Update progress state (NEW - for /update command)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateProgress, setUpdateProgress] = useState(0)
  const [updateStatus, setUpdateStatus] = useState('')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

  // Fetch the context anchor content on mount
  useEffect(() => {
    async function fetchAnchor() {
      try {
        setLoading(true)
        setLoadError(null)
        const response = await fetch(`/api/context-anchors/${anchorId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch context anchor')
        }

        const data = await response.json()
        setMarkdownContent(data.anchor.contentMarkdown || '')
      } catch (error) {
        console.error('Error fetching anchor:', error)
        setLoadError('Failed to load document. Please try closing and reopening.')
      } finally {
        setLoading(false)
      }
    }

    fetchAnchor()
  }, [anchorId])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle sending message with streaming
  async function handleSend() {
    if (!input.trim() || sending) return

    const userMessage = input.trim()

    // Check for /update command
    if (userMessage === '/update') {
      setInput('')
      handleUpdate()
      return
    }

    setInput('')
    setSending(true)

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    // Track if we've added an assistant message yet
    let assistantMessageAdded = false
    let assistantMessageIndex = messages.length + 1

    try {
      // Call streaming API with full conversation history
      // Filter out empty messages (Anthropic API rejects empty content)
      const validMessages = messages.filter(msg => msg.content.trim().length > 0)

      const response = await fetch('/api/shipwright/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anchorId,
          message: userMessage,
          conversationHistory: validMessages  // Only send messages with content
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // Parse SSE stream
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response stream')
      }

      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue

          const data = line.slice(6) // Remove 'data: ' prefix
          try {
            const event = JSON.parse(data)

            if (event.type === 'message') {
              // Create assistant message on first content
              if (!assistantMessageAdded) {
                setMessages(prev => [...prev, { role: 'assistant', content: event.content }])
                assistantMessageAdded = true
              } else {
                // Append to existing assistant message
                setMessages(prev => {
                  const newMessages = [...prev]
                  newMessages[assistantMessageIndex] = {
                    role: 'assistant',
                    content: newMessages[assistantMessageIndex].content + event.content
                  }
                  return newMessages
                })
              }

              // Chat only - no preview updates during chat
              // Document updates happen via /update command only
            } else if (event.type === 'error') {
              console.error('Stream error:', event.message)
              if (!assistantMessageAdded) {
                setMessages(prev => [...prev, {
                  role: 'assistant',
                  content: 'Sorry, something went wrong. Please try again.'
                }])
                assistantMessageAdded = true
              } else {
                setMessages(prev => {
                  const newMessages = [...prev]
                  newMessages[assistantMessageIndex] = {
                    role: 'assistant',
                    content: 'Sorry, something went wrong. Please try again.'
                  }
                  return newMessages
                })
              }
            } else if (event.type === 'done') {
              // Stream complete - chat only, no document updates
              break
            }
          } catch (e) {
            console.error('Failed to parse SSE event:', e)
          }
        }
      }
    } catch (error) {
      console.error('Send message error:', error)
      if (!assistantMessageAdded) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        }])
      } else {
        setMessages(prev => {
          const newMessages = [...prev]
          newMessages[assistantMessageIndex] = {
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.'
          }
          return newMessages
        })
      }
    } finally {
      setSending(false)
    }
  }

  // Handle Enter key to send
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Format section ID for display (e.g., "experience" -> "Experience")
  function formatSectionName(sectionId: string): string {
    return sectionId.charAt(0).toUpperCase() + sectionId.slice(1)
  }

  function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  // Handle /update command - trigger document regeneration
  async function handleUpdate() {
    if (isUpdating) return // Prevent spam

    setIsUpdating(true)
    setUpdateProgress(0)
    setUpdateStatus('Starting update...')

    // Save previous version for undo
    setPreviousMarkdown(markdownContent)

    try {
      // Call update API with conversation history
      const validMessages = messages.filter(msg => msg.content.trim().length > 0)

      const response = await fetch('/api/shipwright/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anchorId,
          conversationHistory: validMessages
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update document')
      }

      // Parse SSE stream for progress
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            try {
              const event = JSON.parse(data)

              if (event.type === 'progress') {
                setUpdateProgress(event.percent)
                setUpdateStatus(event.status)
                console.log(`📊 Update progress: ${Math.round(event.percent * 100)}% - ${event.status}`)
              } else if (event.type === 'complete') {
                // Document is ready!
                setUpdateProgress(1.0)
                setUpdateStatus('Update complete!')
                setMarkdownContent(event.document)
                setIsEditing(false)
                setCurrentVersion(prev => prev + 1)
                setLastSavedAt(new Date())

                // Add completion message to chat
                setMessages(prev => [...prev, {
                  role: 'assistant',
                  content: '✅ **Working document saved!** Your changes are now in the preview pane.\n\n💡 This is your source document - it will show these updates next time you open Shipwright.'
                }])

                console.log('✅ Document update complete')
              } else if (event.type === 'error') {
                throw new Error(event.message)
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Update error:', error)
      setUpdateStatus('Update failed')
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Update failed. Please try again.'
      }])
    } finally {
      // Reset progress after 2 seconds
      setTimeout(() => {
        setIsUpdating(false)
        setUpdateProgress(0)
        setUpdateStatus('')
      }, 2000)
    }
  }

  // Handle undo - revert to previous markdown version
  async function handleUndo() {
    if (!previousMarkdown) return

    try {
      // Save to database
      const response = await fetch(`/api/context-anchors/${anchorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentMarkdown: previousMarkdown
        })
      })

      if (!response.ok) {
        throw new Error('Failed to undo changes')
      }

      // Update UI
      setMarkdownContent(previousMarkdown)
      setPreviousMarkdown(null) // Clear undo history after reverting
    } catch (error) {
      console.error('Undo error:', error)
      alert('Failed to undo changes. Please try again.')
    }
  }

  // Handle switching to manual edit mode
  function handleStartManualEdit() {
    setDraftMarkdown(markdownContent) // Initialize draft with current content
    setEditMode('manual')
  }

  // Handle saving manual edits
  async function handleSaveManualEdit() {
    setIsSavingEdit(true)

    try {
      // Save to database
      const response = await fetch(`/api/context-anchors/${anchorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentMarkdown: draftMarkdown
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save changes')
      }

      // Update local state (save previous for undo)
      setPreviousMarkdown(markdownContent)
      setMarkdownContent(draftMarkdown)

      // Notify AI about the manual edit
      const userMessage = "I just edited the document manually."
      setMessages(prev => [...prev, { role: 'user', content: userMessage }])

      // Switch back to AI mode
      setEditMode('ai')
    } catch (error) {
      console.error('Save edit error:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setIsSavingEdit(false)
    }
  }

  // Handle canceling manual edit
  function handleCancelManualEdit() {
    setDraftMarkdown('') // Clear draft
    setEditMode('ai')
  }

  // Handle save to outputs (database only, no Blob upload)
  async function handleSaveToOutputs() {
    // Get filename from user
    const userFilename = prompt('Enter filename (without extension):', filename || 'document')
    if (!userFilename) return // User cancelled

    setFilename(userFilename)
    setIsSaving(true)
    setSaveSuccess(false)

    try {
      // Save to database via OutputArtifacts API
      const response = await fetch('/api/output-artifacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentMarkdown: markdownContent,
          filename: userFilename.endsWith('.md') ? userFilename : `${userFilename}.md`,
          artifactType: 'document',
          communityId,
          conversationId: null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save')
      }

      // Show success feedback
      setSaveSuccess(true)

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save document. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      {/* Modal Container */}
      <div className="w-full h-full max-w-[100vw] max-h-[100vh] bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Edit with Shipwright
          </h2>
          <div className="flex items-center gap-2">
            {/* Save Success Feedback */}
            {saveSuccess && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 animate-fade-in">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Saved to Outputs!
              </div>
            )}

            {/* Save to Outputs Button */}
            <button
              onClick={handleSaveToOutputs}
              disabled={isSaving}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: colors.primary,
              }}
              title="Save to Outputs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              {isSaving ? 'Saving...' : 'Save to Outputs'}
            </button>

            {/* Undo Button */}
            {previousMarkdown && (
              <button
                onClick={handleUndo}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                title="Undo last change"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Undo
              </button>
            )}
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
        </div>

        {/* Two-pane layout - stacks vertically on mobile, side-by-side on desktop */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Pane - Chat Interface */}
          <div className="h-1/2 md:h-full w-full md:w-1/2 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col min-h-0">
            <div className="px-4 py-3 border-b border-gray-200 bg-white md:hidden flex-shrink-0">
              <h3 className="text-sm font-semibold text-gray-700">Chat</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto min-h-0 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-sm">
                    <p className="text-sm text-gray-500 mb-2">
                      Start editing your document by chatting with Shipwright
                    </p>
                    <p className="text-xs text-gray-400">
                      Try: &ldquo;Fix the formatting&rdquo; or &ldquo;Make this more concise&rdquo;
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
                    >
                      <div
                        className="max-w-[85%] rounded-lg p-3"
                        style={message.role === 'user' ? {
                          backgroundColor: colors.primary,
                          color: branding?.colors?.userMessageText || '#ffffff'
                        } : {
                          backgroundColor: '#f3f4f6',
                          color: colors.text
                        }}
                      >
                        <div className="text-sm whitespace-pre-wrap break-words">
                          {message.content.split('\n').map((line, i) => (
                            <span key={i}>
                              {line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/).map((part, j) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return <strong key={j}>{part.slice(2, -2)}</strong>
                                } else if (part.startsWith('*') && part.endsWith('*')) {
                                  return <em key={j}>{part.slice(1, -1)}</em>
                                } else if (part.startsWith('`') && part.endsWith('`')) {
                                  return <code key={j} className="bg-gray-200 px-1 rounded text-xs">{part.slice(1, -1)}</code>
                                }
                                return part
                              })}
                              {i < message.content.split('\n').length - 1 && <br />}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Loading indicator while AI is responding */}
                  {sending && (
                    <div className="flex justify-start w-full">
                      <div className="max-w-[85%] rounded-lg p-3 bg-gray-100">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0 relative">
              {/* Command autocomplete */}
              {input.startsWith('/') && input.length < 8 && input !== '/update' && (
                <div className="absolute bottom-full left-4 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
                  <button
                    onClick={() => setInput('/update')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <span className="font-mono text-blue-600">/update</span>
                    <span className="text-gray-500">Apply changes to document</span>
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message... (or / for commands)"
                  disabled={sending}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-400"
                  style={{ '--tw-ring-color': colors.primary } as any}
                  rows={2}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="px-4 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0 text-sm font-medium"
                  style={!input.trim() || sending ? {} : {
                    backgroundColor: colors.primary,
                    color: branding?.colors?.userMessageText || '#ffffff'
                  }}
                >
                  {sending ? '...' : 'Send'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Pane - Markdown Preview/Editor */}
          <div className="h-1/2 md:h-full w-full md:w-1/2 flex flex-col bg-gray-50 min-h-0">
            <div className="px-4 md:px-6 py-3 border-b border-gray-200 bg-white flex-shrink-0 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-700">
                      {editMode === 'manual' ? 'Edit Document' : 'Working Document'}
                    </h3>
                    {lastSavedAt && (
                      <span className="text-xs text-gray-500">
                        • Saved {formatTimeAgo(lastSavedAt)}
                      </span>
                    )}
                  </div>
                  {/* Mode Toggle - uses community colors */}
                  <div className="flex items-center rounded-lg border border-gray-300 overflow-hidden">
                    <button
                      onClick={() => editMode === 'manual' ? handleCancelManualEdit() : setEditMode('ai')}
                      disabled={editMode === 'ai' || isSavingEdit}
                      className="px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed"
                      style={editMode === 'ai' ? {
                        backgroundColor: colors.primary,
                        color: colors.userMessageText || '#ffffff'
                      } : {
                        backgroundColor: '#ffffff',
                        color: colors.text
                      }}
                    >
                      🤖 AI Edits
                    </button>
                    <button
                      onClick={handleStartManualEdit}
                      disabled={editMode === 'manual' || isSavingEdit}
                      className="px-3 py-1 text-xs font-medium transition-colors border-l border-gray-300 disabled:cursor-not-allowed"
                      style={editMode === 'manual' ? {
                        backgroundColor: colors.primary,
                        color: colors.userMessageText || '#ffffff'
                      } : {
                        backgroundColor: '#ffffff',
                        color: colors.text
                      }}
                    >
                      ✏️ You Edit
                    </button>
                  </div>
                </div>
                {isEditing && editMode === 'ai' && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: colors.primary }}>
                    <div className="animate-pulse">●</div>
                    <span>AI is editing...</span>
                  </div>
                )}
              </div>

              {/* Progress Bar - NEW for /update command */}
              {isUpdating && (
                <div className="bg-blue-50 border border-blue-200 rounded px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {updateStatus}
                    </span>
                    <span className="text-xs text-gray-600">
                      {Math.round(updateProgress * 100)}%
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300 ease-out"
                      style={{
                        width: `${updateProgress * 100}%`,
                        backgroundColor: colors.primary
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Update Notification Banner */}
              {lastUpdate && (
                <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded px-3 py-2 text-xs animate-slide-down">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-gray-700">Updated: {lastUpdate.section}</span>
                  </div>
                  <button
                    onClick={() => setLastUpdate(null)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Dismiss notification"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 p-4 md:p-6 overflow-y-auto min-h-0">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-sm text-gray-400">Loading...</div>
                </div>
              ) : loadError ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-sm">
                    <p className="text-sm text-red-600 mb-2">{loadError}</p>
                    <button
                      onClick={onClose}
                      className="text-xs text-gray-500 underline hover:text-gray-700"
                    >
                      Close and try again
                    </button>
                  </div>
                </div>
              ) : editMode === 'manual' ? (
                /* Manual Edit Mode - CodeMirror editor */
                <div className="h-full flex flex-col gap-3">
                  <div className="flex-1 min-h-0 border border-gray-300 rounded-lg overflow-hidden">
                    <CodeMirror
                      value={draftMarkdown}
                      height="100%"
                      extensions={[markdown()]}
                      onChange={(value) => setDraftMarkdown(value)}
                      theme="light"
                      basicSetup={{
                        lineNumbers: true,
                        highlightActiveLineGutter: true,
                        foldGutter: false,
                        dropCursor: true,
                        allowMultipleSelections: true,
                        indentOnInput: true,
                        bracketMatching: true,
                        closeBrackets: true,
                        autocompletion: true,
                        highlightActiveLine: true,
                        highlightSelectionMatches: true
                      }}
                      className="h-full text-sm"
                    />
                  </div>
                  {/* Save/Cancel buttons */}
                  <div className="flex gap-2 justify-end flex-shrink-0">
                    <button
                      onClick={handleCancelManualEdit}
                      disabled={isSavingEdit}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveManualEdit}
                      disabled={isSavingEdit}
                      className="px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: colors.primary,
                        color: colors.userMessageText || '#ffffff'
                      }}
                    >
                      {isSavingEdit ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                /* AI Mode - Preview */
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-mono text-xs md:text-sm text-gray-800 bg-white p-3 md:p-4 rounded-lg border border-gray-200">
                    {markdownContent || '(empty document)'}
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
