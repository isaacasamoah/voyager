'use client'

import { useState, useEffect, useRef } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ShipwrightModalProps {
  anchorId: string
  onClose: () => void
}

export default function ShipwrightModal({ anchorId, onClose }: ShipwrightModalProps) {
  const [markdownContent, setMarkdownContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentVersion, setCurrentVersion] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle sending message with streaming
  async function handleSend() {
    if (!input.trim() || sending) return

    const userMessage = input.trim()
    setInput('')
    setSending(true)

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    // Add empty assistant message that we'll stream into
    const assistantMessageIndex = messages.length + 1
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      // Call streaming API
      const response = await fetch('/api/shipwright/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anchorId,
          message: userMessage
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
              // Append to assistant message
              setMessages(prev => {
                const newMessages = [...prev]
                newMessages[assistantMessageIndex] = {
                  role: 'assistant',
                  content: newMessages[assistantMessageIndex].content + event.content
                }
                return newMessages
              })
            } else if (event.type === 'markdown_update') {
              // Update markdown preview
              setIsEditing(true)
              setMarkdownContent(event.content)
              setCurrentVersion(event.version)

              // Clear editing indicator after short delay
              setTimeout(() => setIsEditing(false), 1000)
            } else if (event.type === 'error') {
              console.error('Stream error:', event.message)
              setMessages(prev => {
                const newMessages = [...prev]
                newMessages[assistantMessageIndex] = {
                  role: 'assistant',
                  content: 'Sorry, something went wrong. Please try again.'
                }
                return newMessages
              })
            } else if (event.type === 'done') {
              // Stream complete
              break
            }
          } catch (e) {
            console.error('Failed to parse SSE event:', e)
          }
        }
      }
    } catch (error) {
      console.error('Send message error:', error)
      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[assistantMessageIndex] = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        }
        return newMessages
      })
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
                        className={`max-w-[85%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                  rows={2}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0 text-sm font-medium"
                >
                  {sending ? '...' : 'Send'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Pane - Markdown Preview */}
          <div className="h-1/2 md:h-full w-full md:w-1/2 flex flex-col bg-gray-50 min-h-0">
            <div className="px-4 md:px-6 py-3 border-b border-gray-200 bg-white flex-shrink-0 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Preview</h3>
              {isEditing && (
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <div className="animate-pulse">●</div>
                  <span>AI is editing...</span>
                </div>
              )}
            </div>
            <div className="flex-1 p-4 md:p-6 overflow-y-auto min-h-0">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-sm text-gray-400">Loading...</div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-mono text-xs md:text-sm text-gray-800 bg-white p-3 md:p-4 rounded-lg border border-gray-200">
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
