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
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const isLoadingConversation = useRef(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToTop = () => {
    messagesContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    // If we just loaded a conversation, scroll to top
    if (isLoadingConversation.current) {
      scrollToTop()
      isLoadingConversation.current = false
    } else {
      // Otherwise scroll to bottom for new messages
      scrollToBottom()
    }
  }, [messages])

  // Load conversations and check resume on mount
  useEffect(() => {
    loadConversations()
    checkResume()
  }, [])

  // Reload conversations when mode changes
  useEffect(() => {
    loadConversations()
  }, [mode])

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
      // Fetch different data based on mode
      const endpoint = mode === 'public' ? '/api/community/threads' : '/api/conversations'
      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        // Threads endpoint returns { threads }, conversations returns { conversations }
        setConversations(data.threads || data.conversations || [])
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoadingConversations(false)
    }
  }

  const loadConversation = async (id: string) => {
    try {
      isLoadingConversation.current = true
      const response = await fetch(`/api/conversations/${id}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        setConversationId(id)
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
      isLoadingConversation.current = false
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

  // Filter conversations based on search query (only in collaborate mode)
  const filteredConversations = mode === 'public' && searchQuery.trim()
    ? conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations

  return (
    <div className="flex h-screen bg-careersy-cream">
      {/* Sidebar - Minimal Space Style */}
      {showSidebar && (
        <div className="w-64 bg-white border-r border-gray-100 flex flex-col">
          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-3 px-2">
              {mode === 'public' ? (
                searchQuery ? `Results (${filteredConversations.length})` : 'Community'
              ) : (
                'History'
              )}
            </div>
            {loadingConversations ? (
              <div className="text-center text-gray-400 py-4 text-sm">...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center text-gray-400 py-4 text-xs">
                {searchQuery
                  ? 'No matches found'
                  : mode === 'public' ? 'No threads yet' : 'No history yet'
                }
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={`w-full text-left px-3 py-2 mb-1 rounded hover:bg-gray-50 transition-colors ${
                    conversationId === conv.id ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="text-sm text-careersy-black truncate">{conv.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* User Info & Logout - Minimal */}
          <div className="px-3 py-3 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-2 px-2">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-careersy-black text-xs font-medium">
                {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-careersy-black truncate">{session?.user?.name}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-2 bg-careersy-yellow hover:bg-careersy-yellow/90 text-careersy-black rounded-full text-xs font-medium transition-colors text-center"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header - Voyager Style with Collaborate Mode */}
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

          {/* Right: Collaborate Tools + Toggle */}
          <div className="flex items-center gap-0.5">
            {/* Collaborate Mode Tools */}
            {mode === 'public' && (
              <div className="flex items-center gap-0.5 animate-in fade-in slide-in-from-right-5 duration-300">
                {/* New Conversation */}
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewConversation(!showNewConversation)
                      setShowSearch(false)
                    }}
                    className="w-5 h-5 border border-gray-300 hover:border-careersy-yellow rounded-full flex items-center justify-center transition-colors"
                  >
                    <svg className="w-3 h-3 text-gray-500 group-hover:text-careersy-yellow transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  {/* Tooltip - Below Icon */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-careersy-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50">
                    Start new conversation
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-careersy-black"></div>
                  </div>
                </div>

                {/* New Conversation Title Field */}
                <div className={`relative transition-all ${showNewConversation ? 'w-48 opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
                  <input
                    type="text"
                    value={publicTitle}
                    onChange={(e) => setPublicTitle(e.target.value)}
                    placeholder="Conversation title..."
                    className="w-full px-3 py-1 pr-8 border border-gray-200 rounded-full focus:outline-none focus:border-careersy-yellow transition-colors text-xs"
                  />
                  {publicTitle && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-careersy-yellow">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Search */}
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSearch(!showSearch)
                      setShowNewConversation(false)
                    }}
                    className="w-5 h-5 flex items-center justify-center hover:text-careersy-yellow transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-500 group-hover:text-careersy-yellow transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  {/* Tooltip - Below Icon */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-careersy-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50">
                    Search conversations
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-careersy-black"></div>
                  </div>
                </div>

                {/* Search Field */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className={`px-3 py-1 border border-gray-200 rounded-full focus:outline-none focus:border-careersy-yellow transition-all text-xs ${
                    showSearch ? 'w-48 opacity-100' : 'w-0 opacity-0 pointer-events-none'
                  }`}
                />
              </div>
            )}

            {/* Collaborate Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-careersy-black font-medium">Collaborate</span>
              <button
                onClick={() => {
                  // Smooth transition: clear screen before mode switch
                  setMessages([])
                  setConversationId(null)
                  // Small delay so the fade feels natural
                  setTimeout(() => {
                    setMode(mode === 'private' ? 'public' : 'private')
                    setShowNewConversation(false)
                    setShowSearch(false)
                  }, 100)
                }}
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
        </div>

        {/* Messages Container */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-8 space-y-6">
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
          <div className="w-[60%] mx-auto">
            {/* Message Input with Add Context + Submit */}
            <div className="relative flex items-center gap-2">
              {/* Add Files Button */}
              <button
                type="button"
                onClick={() => setShowResumeModal(true)}
                className="flex-shrink-0 w-10 h-10 border border-gray-200 hover:border-careersy-yellow rounded-full flex items-center justify-center transition-colors group relative"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-careersy-yellow transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {hasResume && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-careersy-yellow rounded-full border-2 border-white"></div>
                )}
                {/* Custom Careersy Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-careersy-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                  <div className="relative">
                    Add files for context
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-careersy-black"></div>
                  </div>
                </div>
              </button>

              {/* Input Field */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="|"
                className="flex-1 px-6 py-4 pr-14 border border-gray-200 rounded-full focus:outline-none focus:border-careersy-yellow transition-colors text-base"
                disabled={loading}
              />

              {/* Submit Button */}
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
