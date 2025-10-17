'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import ChatMessage from './ChatMessage'
import ResumeModal from './ResumeModal'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Conversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

type ConversationMode = 'private' | 'public'

export default function ChatInterface() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [showSidebar, setShowSidebar] = useState(false)
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [hasResume, setHasResume] = useState(false)
  const [mode, setMode] = useState<ConversationMode>('private')
  const [publicTitle, setPublicTitle] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load conversations and check resume on mount
  useEffect(() => {
    loadConversations()
    checkResume()
  }, [])

  const checkResume = async () => {
    try {
      const response = await fetch('/api/resume')
      if (response.ok) {
        const data = await response.json()
        setHasResume(!!data.resumeText)
      }
    } catch (error) {
      console.error('Error checking resume:', error)
    }
  }

  const saveResume = async (resumeText: string) => {
    const response = await fetch('/api/resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText }),
    })

    if (!response.ok) {
      throw new Error('Failed to save resume')
    }

    setHasResume(true)
  }

  const loadConversations = async () => {
    setLoadingConversations(true)
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoadingConversations(false)
    }
  }

  const loadConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        setConversationId(id)
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
    }
  }

  const startNewChat = () => {
    setMessages([])
    setConversationId(null)
    setInput('')
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
          mode: mode,
          title: mode === 'public' && publicTitle ? publicTitle : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
      setConversationId(data.conversationId)

      // Clear public title after sending
      if (mode === 'public') {
        setPublicTitle('')
      }

      // Reload conversations to show the new one
      loadConversations()
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="flex h-screen bg-careersy-cream">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-64 bg-careersy-black text-white flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-800 space-y-2">
            <button
              onClick={startNewChat}
              className="w-full py-2 px-4 bg-careersy-yellow text-careersy-black hover:scale-105 rounded-[30px] font-semibold transition-transform"
            >
              + New Chat
            </button>
            <button
              onClick={() => setShowResumeModal(true)}
              className="w-full py-2 px-4 bg-gray-800 text-white hover:bg-gray-700 rounded-[30px] font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {hasResume ? '✓ Update Resume' : '+ Add Resume'}
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2">
            {loadingConversations ? (
              <div className="text-center text-gray-400 py-4">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center text-gray-400 py-4 text-sm">No conversations yet</div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={`w-full text-left p-3 rounded-[30px] mb-2 hover:bg-gray-800 transition-colors ${
                    conversationId === conv.id ? 'bg-gray-800' : ''
                  }`}
                >
                  <div className="text-sm font-medium truncate">{conv.title}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-careersy-yellow flex items-center justify-center text-careersy-black font-semibold text-lg">
                  {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{session?.user?.name}</div>
                <div className="text-xs text-gray-400 truncate">{session?.user?.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-[30px] text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header - Voyager Style */}
        <div className="flex-shrink-0 px-6 py-4 bg-white flex items-center justify-between border-b border-gray-100">
          {/* Left: Hamburger */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-gray-50 rounded transition-colors"
          >
            <svg className="w-4 h-4 text-careersy-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Right: Public Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-careersy-black font-medium">Public</span>
            <button
              onClick={() => setMode(mode === 'private' ? 'public' : 'private')}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                mode === 'public' ? 'bg-careersy-yellow' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  mode === 'public' ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Image
                  src="/careersy-logo.webp"
                  alt="Careersy"
                  width={120}
                  height={120}
                  className="object-contain mx-auto mb-6 opacity-90"
                />
                <h1 className="text-4xl font-lexend font-bold text-careersy-black tracking-wide mb-2">
                  CAREERSY WINGMAN
                </h1>
                <div className="w-48 h-[1px] bg-gray-200 mx-auto mt-6"></div>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <ChatMessage key={idx} message={msg} />
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-careersy-yellow/20">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-careersy-yellow rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-careersy-yellow rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-careersy-yellow rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form - Voyager Style */}
        <form onSubmit={sendMessage} className="flex-shrink-0 p-8 bg-white">
          <div className="w-[60%] mx-auto space-y-3">
            {/* Optional Title for Public Posts */}
            {mode === 'public' && (
              <input
                type="text"
                value={publicTitle}
                onChange={(e) => setPublicTitle(e.target.value)}
                placeholder="Give your question a title (optional)..."
                className="w-full px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:border-careersy-yellow transition-colors text-sm"
              />
            )}

            {/* Message Input with Integrated Submit */}
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="|"
                className="w-full px-6 py-4 pr-14 border border-gray-200 rounded-full focus:outline-none focus:border-careersy-yellow transition-colors text-base"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-careersy-yellow hover:bg-careersy-yellow/90 rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-5 h-5 text-careersy-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Resume Modal */}
      <ResumeModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        onSave={saveResume}
      />
    </div>
  )
}
