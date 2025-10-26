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
  curateMode?: boolean
  isPublic?: boolean
  publishedPostId?: string
}

type ConversationMode = 'private' | 'public'

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
  const [mode, setMode] = useState<ConversationMode>('private')
  const [publicTitle, setPublicTitle] = useState('')
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showTutorial, setShowTutorial] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [showSpotlight, setShowSpotlight] = useState(false)
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
    // Restore private mode after tutorial
    setMode('private')
  }

  const handleTutorialSkip = () => {
    setShowTutorial(false)
    const tutorialKey = `${communityId}_tutorial_completed`
    localStorage.setItem(tutorialKey, 'true')
    // Restore private mode after tutorial
    setMode('private')
  }

  const restartTutorial = () => {
    setShowTutorial(true)
  }

  const handleTutorialStepChange = (stepId: string) => {
    // When tutorial reaches collaborate toggle, enable public mode
    if (stepId === 'collaborate-toggle') {
      setMode('public')
    }
  }

  // Reload conversations when mode changes
  useEffect(() => {
    loadConversations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // Fetch different data based on community config
      let endpoint
      if (communityConfig.showsCommunities) {
        // Voyager: show communities in sidebar
        endpoint = `/api/communities`
      } else if (mode === 'public') {
        // Public mode: show threads
        endpoint = `/api/community/threads?communityId=${communityId}`
      } else {
        // Private mode: show user's conversations
        endpoint = `/api/conversations?communityId=${communityId}`
      }

      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        setConversations(data.communities || data.threads || data.conversations || [])
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

  const startNewPost = () => {
    // Smart confirmation: only ask if there's content to lose
    const hasContent = messages.length > 0 || input.trim().length > 0

    if (hasContent) {
      if (confirm('Start new draft? Your current draft will be discarded.')) {
        setMessages([])
        setInput('')
      }
    } else {
      // No content, just clear
      setMessages([])
      setInput('')
    }
  }

  /**
   * Parse structured post format from curator AI
   * Expected format:
   * TITLE: [title text]
   * POST: [post content]
   * [READY_TO_POST]
   */
  const parseStructuredPost = (content: string): { title: string; post: string } | null => {
    const titleMatch = content.match(/TITLE:\s*(.+?)(?:\n|$)/i)
    const postMatch = content.match(/POST:\s*([\s\S]+?)(?:\[READY_TO_POST\]|$)/i)

    if (titleMatch && postMatch) {
      return {
        title: titleMatch[1].trim(),
        post: postMatch[1].trim().replace(/\[READY_TO_POST\]/g, '').trim()
      }
    }

    return null
  }

  /**
   * Smart publish from ephemeral draft
   * Priority 1: If last AI message has [READY_TO_POST], use AI's polished version
   * Priority 2: Otherwise, offer to post user's last message directly
   */
  const publishFromDraft = async () => {
    if (!session || messages.length === 0) return

    setPublishing(true)
    setShowSpotlight(true) // Start transition effect
    try {
      let title = ''
      let content = ''

      // Check if last AI message has [READY_TO_POST]
      const lastAiMessage = messages.filter(m => m.role === 'assistant').pop()
      const hasReadyMarker = lastAiMessage?.content.includes('[READY_TO_POST]')

      if (hasReadyMarker && lastAiMessage) {
        // Priority 1: Use AI's polished version
        const parsed = parseStructuredPost(lastAiMessage.content)

        if (parsed) {
          title = parsed.title
          content = parsed.post
        } else {
          throw new Error('Could not parse AI post format. Expected TITLE: and POST: format.')
        }
      } else {
        // Priority 2: Offer to post user's last message
        const lastUserMessage = messages.filter(m => m.role === 'user').pop()

        if (!lastUserMessage) {
          throw new Error('No message to post')
        }

        // Ask for confirmation and title
        const userTitle = prompt('Enter a title for your post:')

        if (!userTitle) {
          // User cancelled
          setPublishing(false)
          return
        }

        title = userTitle.trim()
        content = lastUserMessage.content
      }

      // Create the public post via new endpoint
      const res = await fetch('/api/conversations/create-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          communityId
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to publish')
      }

      const data = await res.json()
      const publishedPostId = data.conversation?.id

      setPublished(true)

      // Show "Published!" briefly, then load the published post in current view
      setTimeout(() => {
        if (publishedPostId) {
          // Load the published post in the current chat interface
          loadConversation(publishedPostId)
          // Reload conversations list to show the new post
          loadConversations()
          // Clear ephemeral draft
          setMessages([])
        } else {
          // Fallback: reload conversations and start fresh
          loadConversations()
          startNewChat()
        }
        setPublished(false)
        setShowSpotlight(false) // End transition effect
      }, 800)
    } catch (error) {
      console.error('Publish error:', error)
      alert(error instanceof Error ? error.message : 'Failed to publish post')
      setShowSpotlight(false) // End transition on error
    } finally {
      setPublishing(false)
    }
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
          curateMode: mode === 'public', // Enable curator when collaborate toggle is ON
          // In curate mode, pass ephemeral messages from React state (not saved to DB yet)
          incomingHistory: mode === 'public' ? messages : undefined,
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

      // Save to database after streaming completes
      // Skip saving for voyager and collaborate mode (ephemeral drafting)
      const isCollaborateMode = mode === 'public'
      const shouldSave = communityId !== 'voyager' && !isCollaborateMode

      if (shouldSave) {
        const saveResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            assistantMessage: fullResponse,
            conversationId,
            communityId,
            mode,
            curateMode: false, // No longer using curateMode
            title: publicTitle || undefined,
          }),
        })

        if (saveResponse.ok) {
          const data = await saveResponse.json()
          setConversationId(data.conversationId)
          if (data.conversation) {
            setCurrentConversation(data.conversation)
          }
        }
      }

      // Clear public title after sending
      if (mode === 'public') {
        setPublicTitle('')
      }

      // Reload conversations to show the new one
      if (communityId !== 'voyager') {
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

  // Filter conversations based on search query (only in collaborate mode)
  const filteredConversations = mode === 'public' && searchQuery.trim()
    ? conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations

  return (
    <div className="flex h-screen" style={{ backgroundColor: fullBranding.colors.background }}>
      {/* Sidebar - Minimal Space Style */}
      {showSidebar && (
        <div className={`w-64 ${fullBranding.components.sidebar} flex flex-col`}>
          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-3 px-2">
              {mode === 'public' ? (
                searchQuery ? `Results (${filteredConversations.length})` : (communityConfig.showsCommunities ? 'Communities' : 'Community')
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
                  : mode === 'public' ? `No ${terms.course}s yet` : 'No history yet'
                }
              </div>
            ) : (
              filteredConversations.map((conv) => (
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
        {/* Header - Voyager Style with Collaborate Mode */}
        <div className="flex-shrink-0 px-6 py-4 bg-white flex items-center justify-between border-b border-gray-100">
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

          {/* Right: Collaborate Tools + Toggle */}
          <div className="flex items-center gap-0.5">
            {/* Collaborate Mode Tools */}
            {mode === 'public' && (
              <div className="flex items-center gap-0.5 animate-in fade-in slide-in-from-right-5 duration-300">
                {/* New Post (in collaborate mode) */}
                <div className="relative group">
                  <button
                    type="button"
                    onClick={startNewPost}
                    className="w-5 h-5 border rounded-full flex items-center justify-center transition-colors"
                    style={{ borderColor: '#d1d5db' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = fullBranding.colors.primary}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                  >
                    <svg className="w-3 h-3 transition-colors" style={{ color: fullBranding.colors.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  {/* Tooltip - Below Icon */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50" style={{ backgroundColor: fullBranding.colors.text }}>
                    New Post
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent" style={{ borderBottomColor: fullBranding.colors.text }}></div>
                  </div>
                </div>

                {/* New Conversation Title Field */}
                <div className={`relative transition-all ${showNewConversation ? 'w-48 opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
                  <input
                    type="text"
                    value={publicTitle}
                    onChange={(e) => setPublicTitle(e.target.value)}
                    placeholder="Course title..."
                    className={`w-full px-3 py-1 pr-8 ${fullBranding.components.input} transition-colors text-xs`}
                  />
                  {publicTitle && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2" style={{ color: fullBranding.colors.primary }}>
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
                    className="w-5 h-5 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4 transition-colors" style={{ color: fullBranding.colors.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  {/* Tooltip - Below Icon */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50" style={{ backgroundColor: fullBranding.colors.text }}>
                    {communityConfig.showsCommunities ? 'Search communities' : 'Search conversations'}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent" style={{ borderBottomColor: fullBranding.colors.text }}></div>
                  </div>
                </div>

                {/* Search Field with Dropdown */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className={`px-3 py-1 ${fullBranding.components.input} transition-all text-xs ${
                      showSearch ? 'w-48 opacity-100' : 'w-0 opacity-0 pointer-events-none'
                    }`}
                  />

                  {/* Search Results Dropdown */}
                  {showSearch && searchQuery.trim() && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 max-h-64 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Results Count */}
                      <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-100">
                        {filteredConversations.length} {filteredConversations.length === 1 ? 'result' : 'results'}
                      </div>

                      {/* Results List */}
                      {filteredConversations.length === 0 ? (
                        <div className="px-3 py-4 text-xs text-gray-400 text-center">
                          No matches found
                        </div>
                      ) : (
                        filteredConversations.map((conv) => (
                          <button
                            key={conv.id}
                            onClick={() => {
                              loadConversation(conv.id)
                              setSearchQuery('')
                              setShowSearch(false)
                            }}
                            className="w-full text-left px-3 py-2 transition-colors border-b border-gray-50 last:border-b-0"
                            style={{ backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = fullBranding.colors.background}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <div className="text-xs font-medium truncate" style={{ color: fullBranding.colors.text }}>
                              {conv.title}
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: fullBranding.colors.textSecondary }}>
                              {new Date(conv.updatedAt).toLocaleDateString()}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Collaborate Toggle with Draft Indicator */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: fullBranding.colors.text }}>Collaborate</span>
              <div className="relative">
                <button
                  onClick={() => {
                    // Smart confirmation: only ask if switching away from collaborate mode with unsaved draft
                    const hasUnsavedDraft = mode === 'public' && messages.length > 0

                    if (hasUnsavedDraft) {
                      if (!confirm('Discard draft? Your messages will be lost.')) {
                        return // User cancelled
                      }
                    }

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
                  className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                  style={{ backgroundColor: mode === 'public' ? fullBranding.colors.primary : '#d1d5db' }}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      mode === 'public' ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
                {/* Draft indicator badge */}
                {mode === 'public' && messages.length > 0 && (
                  <div
                    className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-white text-[10px] font-medium shadow-sm animate-in fade-in zoom-in duration-200"
                    style={{ backgroundColor: fullBranding.colors.primary }}
                  >
                    {messages.length}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                {fullBranding.logo && (
                  <Image
                    src={fullBranding.logo}
                    alt={communityConfig.name}
                    width={120}
                    height={120}
                    className="object-contain mx-auto mb-6 opacity-90"
                  />
                )}
                <h1 className={`${fullBranding.typography.title.font} ${fullBranding.typography.title.size} ${fullBranding.typography.title.weight} ${fullBranding.typography.title.tracking} mb-2`} style={{ color: fullBranding.colors.text }}>
                  {fullBranding.title}
                </h1>
                <div className="w-48 h-[1px] bg-gray-200 mx-auto mt-6"></div>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => {
            // Check if this is the last AI message with [READY_TO_POST]
            const isLastAIMessage = msg.role === 'assistant' && idx === messages.length - 1
            const hasReadyMarker = msg.content.includes('[READY_TO_POST]')

            return (
              <ChatMessage
                key={idx}
                message={msg}
                onPost={isLastAIMessage && hasReadyMarker && mode === 'public' ? publishFromDraft : undefined}
                onEdit={isLastAIMessage && hasReadyMarker && mode === 'public' ? () => {
                  // Extract POST content and pre-fill input for editing
                  const parsed = parseStructuredPost(msg.content)
                  if (parsed?.post) {
                    setInput(parsed.post)
                    // Focus input field
                    inputRef.current?.focus()
                  }
                } : undefined}
                primaryColor={fullBranding.colors.primary}
                publishing={publishing}
                published={published}
              />
            )
          })}

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


        {/* Input Form - Voyager Style */}
        <form onSubmit={sendMessage} className="flex-shrink-0 p-8 bg-white">
          <div style={{ width: fullBranding.spacing.inputWidth }} className="mx-auto">
            {/* Message Input with Add Context + Submit */}
            <div className="flex items-center gap-2">
              {/* Add Files Button */}
              <button
                type="button"
                onClick={() => setShowResumeModal(true)}
                className="flex-shrink-0 w-10 h-10 border rounded-full flex items-center justify-center transition-colors group relative"
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

              {/* Input Field with Submit Button */}
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={mode === 'public' ? "Describe what you'd like to post about..." : "What's your next career move?"}
                  className={`w-full px-6 py-4 pr-14 ${fullBranding.components.input} transition-colors ${fullBranding.typography.input.size} placeholder:text-gray-400`}
                  disabled={loading}
                />

                {/* Submit Button - Inside input field */}
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 ${fullBranding.components.button} flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all group relative`}
                  title={mode === 'public' ? 'Ask curator for help' : 'Send message'}
                >
                  <svg className="w-5 h-5" style={{ color: fullBranding.colors.userMessageText }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {/* Tooltip */}
                  {mode === 'public' && (
                    <div className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Ask curator
                    </div>
                  )}
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
          onStepChange={handleTutorialStepChange}
          accentColor={communityConfig.branding.colors.primary}
        />
      )}

      {/* Spotlight Transition Effect */}
      {showSpotlight && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in duration-300 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4 mx-auto"></div>
            <div className="text-white text-lg font-medium">
              {published ? 'Published!' : 'Publishing...'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
