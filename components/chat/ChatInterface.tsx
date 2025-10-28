'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ChatMessage from './ChatMessage'
import ResumeModal from './ResumeModal'
import TutorialOverlay from '../tutorial/TutorialOverlay'
import { getTutorialSteps } from '../tutorial/tutorialSteps'
import { CommunityConfig } from '@/lib/communities'
import { getVoyageTerminology } from '@/lib/terminology'

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

interface ChatInterfaceProps {
  communityId: string
  communityConfig: CommunityConfig
  fullBranding: any
}

export default function ChatInterface({ communityId, communityConfig, fullBranding }: ChatInterfaceProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const terms = getVoyageTerminology(communityConfig)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [showSidebar, setShowSidebar] = useState(false)
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [hasResume, setHasResume] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
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
    checkTutorialStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-focus input when tutorial starts or ends
  useEffect(() => {
    inputRef.current?.focus()
  }, [showTutorial])

  // Check if user needs tutorial (first time only)
  const checkTutorialStatus = () => {
    const tutorialKey = `${communityId}_tutorial_completed`
    const hasSeenTutorial = localStorage.getItem(tutorialKey)
    if (!hasSeenTutorial && getTutorialSteps(communityId).length > 0) {
      setTimeout(() => setShowTutorial(true), 500) // Small delay for smooth entrance
    }
  }

  const handleTutorialComplete = () => {
    setShowTutorial(false)
    const tutorialKey = `${communityId}_tutorial_completed`
    localStorage.setItem(tutorialKey, 'true')
  }

  const handleTutorialSkip = () => {
    setShowTutorial(false)
    const tutorialKey = `${communityId}_tutorial_completed`
    localStorage.setItem(tutorialKey, 'true')
  }

  const restartTutorial = () => {
    setShowTutorial(true)
  }

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
      // Fetch different data based on community config
      let endpoint
      if (communityConfig.showsCommunities) {
        // Voyager: show communities in sidebar
        endpoint = `/api/communities`
      } else {
        // Show user's conversations
        endpoint = `/api/conversations?communityId=${communityId}`
      }

      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        setConversations(data.communities || data.conversations || [])
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
        setCurrentConversation(data.conversation || null)
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
      isLoadingConversation.current = false
    }
  }

  const startNewChat = () => {
    setMessages([])
    setConversationId(null)
    setCurrentConversation(null)
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
      // Start streaming response
      const response = await fetch('/api/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId: conversationId,
          communityId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // Create placeholder for streaming response
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      // Turn off loading spinner - streaming has started
      setLoading(false)

      // Read stream and update message in real-time
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        fullResponse += decoder.decode(value)
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: fullResponse }
          return updated
        })
      }

      // Save to database after streaming completes (skip voyager)
      if (communityId !== 'voyager') {
        const saveResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            assistantMessage: fullResponse,
            conversationId,
            communityId,
          }),
        })

        if (saveResponse.ok) {
          const data = await saveResponse.json()
          setConversationId(data.conversationId)
          if (data.conversation) {
            setCurrentConversation(data.conversation)
          }
        }

        // Reload conversations to show the new one
        loadConversations()
      }
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
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: fullBranding.colors.background, height: '100dvh' }}>
      {/* Sidebar - Mobile-first: full screen overlay on mobile, fixed width on desktop */}
      {showSidebar && (
        <div className={`fixed md:relative inset-0 md:inset-auto z-50 md:z-auto w-full md:w-64 ${fullBranding.components.sidebar} flex flex-col`}>
          {/* Mobile Close Button (top-right) */}
          <div className="md:hidden flex justify-end px-4 pt-4 pb-2">
            <button
              onClick={() => setShowSidebar(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" style={{ color: fullBranding.colors.text }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-3 px-2">
              {communityConfig.showsCommunities ? 'Communities' : 'History'}
            </div>
            {loadingConversations ? (
              <div className="text-center text-gray-400 py-4 text-sm">...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center text-gray-400 py-4 text-xs">
                No history yet
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    if (communityConfig.showsCommunities) {
                      // Navigate to community
                      router.push(`/${conv.id}`)
                    } else {
                      // Load conversation
                      loadConversation(conv.id)
                    }
                  }}
                  className={`w-full text-left px-3 py-2 mb-1 rounded hover:bg-gray-50 transition-colors ${
                    conversationId === conv.id ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="text-sm truncate" style={{ color: fullBranding.colors.text }}>{conv.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: fullBranding.colors.textSecondary }}>
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* User Info & Logout - Centered */}
          <div className="px-3 py-4 border-t border-gray-100">
            <div className="flex flex-col items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium mb-2" style={{ color: fullBranding.colors.text }}>
                {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-xs truncate text-center max-w-full px-2" style={{ color: fullBranding.colors.text }}>
                {session?.user?.name}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className={`w-full py-2 ${fullBranding.components.button} text-xs font-medium transition-colors text-center`}
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header - Mobile-first: smaller padding on mobile */}
        <div className="flex-shrink-0 px-4 py-3 md:px-6 md:py-4 bg-white flex items-center justify-between border-b border-gray-100">
          {/* Left: Hamburger + Replay Tutorial */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-gray-50 rounded transition-colors"
            >
              <svg className="w-4 h-4" style={{ color: fullBranding.colors.text }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <button
              onClick={restartTutorial}
              className="p-1.5 hover:bg-gray-50 rounded transition-colors group"
              title="Replay tutorial"
            >
              <svg className="w-3.5 h-3.5 transition-colors" style={{ color: fullBranding.colors.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Right: New Chat Button */}
          <button
            onClick={startNewChat}
            className="p-2 hover:bg-gray-50 rounded transition-colors"
            title="New conversation"
          >
            <svg className="w-4 h-4" style={{ color: fullBranding.colors.text }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Messages Container - Mobile-first: less padding on mobile */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                {fullBranding.logo && (
                  <Image
                    src={fullBranding.logo}
                    alt={communityConfig.name}
                    width={80}
                    height={80}
                    className="object-contain mx-auto mb-4 md:mb-6 opacity-90 w-16 h-16 md:w-24 md:h-24 lg:w-30 lg:h-30"
                  />
                )}
                <h1 className={`${fullBranding.typography.title.font} text-4xl md:text-5xl lg:${fullBranding.typography.title.size} ${fullBranding.typography.title.weight} ${fullBranding.typography.title.tracking} mb-2`} style={{ color: fullBranding.colors.text }}>
                  {fullBranding.title}
                </h1>
                <div className="w-48 h-[1px] bg-gray-200 mx-auto mt-6"></div>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <ChatMessage
              key={idx}
              message={msg}
              primaryColor={fullBranding.colors.primary}
            />
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className={`${fullBranding.components.messageAssistant} rounded-xl p-4`}>
                <div className="flex space-x-2">
                  <div className={`w-2 h-2 ${fullBranding.components.loadingDots} rounded-full animate-bounce`}></div>
                  <div className={`w-2 h-2 ${fullBranding.components.loadingDots} rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
                  <div className={`w-2 h-2 ${fullBranding.components.loadingDots} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>


        {/* Input Form - Mobile-first: less padding, full width on mobile */}
        <form onSubmit={sendMessage} className="flex-shrink-0 p-4 md:p-6 lg:p-8 bg-white">
          <div className="w-full max-w-2xl mx-auto px-2 md:px-0">
            {/* Message Input with Add Context + Submit */}
            <div className="flex items-center gap-2">
              {/* Add Files Button - Mobile-first: slightly smaller on mobile */}
              <button
                type="button"
                onClick={() => setShowResumeModal(true)}
                className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 border rounded-full flex items-center justify-center transition-colors group relative"
                style={{ borderColor: fullBranding.colors.border }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = fullBranding.colors.borderHover}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = fullBranding.colors.border}
              >
                <svg className="w-5 h-5 transition-colors" style={{ color: fullBranding.colors.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {hasResume && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: fullBranding.colors.primary }}></div>
                )}
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg" style={{ backgroundColor: fullBranding.colors.text }}>
                  <div className="relative">
                    Add context
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent" style={{ borderTopColor: fullBranding.colors.text }}></div>
                  </div>
                </div>
              </button>

              {/* Input Field with Submit Button - Mobile-first: less padding on mobile */}
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="What's your next career move?"
                  className={`w-full px-4 py-3 md:px-6 md:py-4 pr-12 md:pr-14 ${fullBranding.components.input} transition-colors text-sm md:${fullBranding.typography.input.size} placeholder:text-gray-400`}
                  disabled={loading}
                />

                {/* Submit Button - Inside input field, smaller on mobile */}
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className={`absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 ${fullBranding.components.button} flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all`}
                  title="Send message"
                >
                  <svg className="w-5 h-5" style={{ color: fullBranding.colors.userMessageText }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
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

      {/* Tutorial Overlay */}
      {showTutorial && (
        <TutorialOverlay
          steps={getTutorialSteps(communityId)}
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
          accentColor={communityConfig.branding.colors.primary}
        />
      )}
    </div>
  )
}
