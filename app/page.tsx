'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function VoyagerLanding() {
  const { data: session } = useSession()
  const router = useRouter()
  const [showSidebar, setShowSidebar] = useState(false)
  const [collaborateMode, setCollaborateMode] = useState(false)
  const [input, setInput] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Hardcoded communities for now (could fetch from API later)
  const communities = [
    { id: 'careersy', name: 'Careersy Coaching', description: 'ANZ tech career advice' }
  ]

  // Filter communities based on search
  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setLoading(true)

    // Simple keyword matching for MVP
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes('career') || lowerInput.includes('job') || lowerInput.includes('tech') || lowerInput.includes('work')) {
      setSuggestion('Based on what you shared, **Careersy Coaching** might be perfect for you. It\'s a community for ANZ tech professionals looking to level up their careers.')
    } else {
      setSuggestion('I\'m not sure which community would be best. Try browsing the communities in the sidebar, or tell me more about what you\'re looking for!')
    }

    setLoading(false)
  }

  const handleJoinCommunity = (communityId: string) => {
    if (session) {
      router.push(`/${communityId}`)
    } else {
      router.push('/login')
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        } fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out z-50 lg:translate-x-0 lg:static`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex-shrink-0 p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-lexend font-bold text-black">Communities</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="lg:hidden text-gray-500 hover:text-black"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Communities List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {communities.map(community => (
                <button
                  key={community.id}
                  onClick={() => handleJoinCommunity(community.id)}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="text-sm font-medium text-black truncate">
                    {community.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-0.5">
                    {community.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            {/* Left: Hamburger */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Right: Search + Sign In + Collaborate Toggle */}
            <div className="flex items-center gap-4 ml-auto">
              {/* Search Icon */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative group"
              >
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                  <div className="relative">
                    Search
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-black"></div>
                  </div>
                </div>
              </button>

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
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors border-b border-gray-50 last:border-b-0"
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

              {/* Sign In/Out */}
              {session ? (
                <button
                  onClick={() => router.push('/api/auth/signout')}
                  className="text-sm text-gray-600 hover:text-black transition-colors"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-black transition-colors"
                >
                  Sign in
                </Link>
              )}

              {/* Collaborate Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-black font-medium">Collaborate</span>
                <button
                  onClick={() => setCollaborateMode(!collaborateMode)}
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
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Empty State - VOYAGER Wordmark */}
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h1 className="text-7xl font-lexend font-bold text-black tracking-wider mb-4">
                VOYAGER
              </h1>
              <div className="w-48 h-[1px] bg-gray-200 mx-auto mt-6"></div>
            </div>
          </div>

          {/* Suggestion Display (after search) */}
          {suggestion && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <p className="text-gray-700 whitespace-pre-wrap mb-4">{suggestion.replace(/\*\*/g, '')}</p>
                <button
                  onClick={() => handleJoinCommunity('careersy')}
                  className="px-6 py-2 bg-black text-white rounded-full hover:scale-105 transition-transform text-sm font-medium"
                >
                  Join Careersy Coaching
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex justify-start max-w-2xl mx-auto">
              <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-200">
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
