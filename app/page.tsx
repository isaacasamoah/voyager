'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function VoyagerLanding() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const isLoading = status === 'loading'
  const [showSidebar, setShowSidebar] = useState(false)
  const [input, setInput] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [collaborateMode, setCollaborateMode] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])

  // Hardcoded communities for now (could fetch from API later)
  const communities = [
    { id: 'careersy', name: 'Careersy Coaching', description: 'ANZ tech career advice' }
  ]

  // Filter communities based on search
  const filteredCommunities = searchQuery.trim()
    ? communities.filter(community =>
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : communities

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)
    setSuggestion('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId: null,
          communityId: 'voyager',
          mode: 'private',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
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

  const handleJoinCommunity = (communityId: string) => {
    if (session) {
      router.push(`/${communityId}`)
    } else {
      router.push('/login')
    }
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar - Minimal Space Style (matches Careersy exactly) */}
      {showSidebar && (
        <div className="w-64 bg-white border-r border-gray-100 flex flex-col">
          {/* Communities List */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-3 px-2">
              Communities
            </div>
            {communities.length === 0 ? (
              <div className="text-center text-gray-400 py-4 text-xs">
                No communities yet
              </div>
            ) : (
              communities.map((community) => (
                <button
                  key={community.id}
                  onClick={() => handleJoinCommunity(community.id)}
                  className="w-full text-left px-3 py-2 mb-1 rounded hover:bg-gray-50 transition-colors"
                >
                  <div className="text-sm text-black truncate">{community.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {community.description}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* User Info & Logout - Centered (matches Careersy exactly) */}
          {session && (
            <div className="px-3 py-4 border-t border-gray-100">
              <div className="flex flex-col items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-black text-sm font-medium mb-2">
                  {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-xs text-black truncate text-center max-w-full px-2">
                  {session?.user?.name}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2 bg-black hover:bg-gray-800 text-white rounded-full text-xs font-medium transition-colors text-center"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header - Voyager Style with Collaborate Mode (matches Careersy exactly) */}
        <div className="flex-shrink-0 px-6 py-4 bg-white flex items-center justify-between">
          {/* Left: Hamburger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-gray-50 rounded transition-colors"
            >
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Right: Collaborate Tools + Toggle */}
          <div className="flex items-center gap-3">
            {/* Collaborate Mode Tools - Only show when collaborate is ON */}
            {collaborateMode && (
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSearch(!showSearch)
                    }}
                    className="w-5 h-5 flex items-center justify-center hover:text-black transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-500 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  {/* Tooltip - Below Icon */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50">
                    Search communities
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-black"></div>
                  </div>
                </div>

                {/* Search Field with Dropdown */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className={`px-3 py-1 border border-gray-200 rounded-full focus:outline-none focus:border-black transition-all text-xs ${
                      showSearch ? 'w-48 opacity-100' : 'w-0 opacity-0 pointer-events-none'
                    }`}
                  />

                  {/* Search Results Dropdown */}
                  {showSearch && searchQuery.trim() && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 max-h-64 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Results Count */}
                      <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-100">
                        {filteredCommunities.length} {filteredCommunities.length === 1 ? 'result' : 'results'}
                      </div>

                      {/* Results List */}
                      {filteredCommunities.length === 0 ? (
                        <div className="px-3 py-4 text-xs text-gray-400 text-center">
                          No matches found
                        </div>
                      ) : (
                        filteredCommunities.map((community) => (
                          <button
                            key={community.id}
                            onClick={() => {
                              handleJoinCommunity(community.id)
                              setSearchQuery('')
                              setShowSearch(false)
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                          >
                            <div className="text-xs text-black font-medium truncate">
                              {community.name}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {community.description}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sign In (only show when NOT logged in) - Strong CTA */}
            {isLoading ? (
              <div className="px-4 py-2 bg-gray-200 text-gray-400 rounded-full text-sm font-medium">
                Loading...
              </div>
            ) : !session ? (
              <Link
                href="/login"
                className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:scale-105 transition-transform"
              >
                Sign in
              </Link>
            ) : null}

            {/* Collaborate Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-black font-medium">Collaborate</span>
              <button
                onClick={() => {
                  setCollaborateMode(!collaborateMode)
                  setShowSearch(false)
                }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  collaborateMode ? 'bg-black' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    collaborateMode ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Empty State - VOYAGER Wordmark */}
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h1 className="text-7xl font-lexend font-bold text-black tracking-wider mb-4">
                  VOYAGER
                </h1>
                <div className="w-48 h-[1px] bg-gray-200 mx-auto mt-6"></div>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-xl p-4 ${
                  msg.role === 'user'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-black'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-xl p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form - Voyager Style */}
        <form onSubmit={handleSearch} className="flex-shrink-0 p-8 bg-white">
          <div className="w-[60%] mx-auto">
            <div className="relative flex items-center gap-2">
              {/* Input Field */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What brings you here today?"
                className="flex-1 px-6 py-3 pr-14 border border-gray-200 rounded-full focus:outline-none focus:border-black transition-colors text-base"
                disabled={loading}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 transition-transform flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
