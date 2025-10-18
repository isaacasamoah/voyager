'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function VoyagerLanding() {
  const { data: session } = useSession()
  const router = useRouter()
  const [showSidebar, setShowSidebar] = useState(false)
  const [searchMode, setSearchMode] = useState(false)
  const [input, setInput] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [loading, setLoading] = useState(false)

  // Hardcoded communities for now (could fetch from API later)
  const communities = [
    { id: 'careersy', name: 'Careersy Coaching', description: 'ANZ tech career advice' }
  ]

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
      {/* Sidebar - hidden by default */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 lg:relative lg:z-0">
          {/* Overlay for mobile */}
          <div
            className="absolute inset-0 bg-black/20 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />

          {/* Sidebar content */}
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 p-6 lg:relative">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-semibold text-gray-900">Communities</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="lg:hidden text-gray-500 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {communities.map(community => (
                <button
                  key={community.id}
                  onClick={() => handleJoinCommunity(community.id)}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="font-medium text-gray-900 group-hover:text-gray-700">
                    {community.name}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {community.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setSearchMode(!searchMode)}
                className={`text-sm px-4 py-2 rounded-full transition-colors ${
                  searchMode
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {searchMode ? 'Exploring' : 'Explore'}
              </button>

              {session ? (
                <Link
                  href="/api/auth/signout"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Sign out
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Main conversational interface */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="max-w-2xl w-full text-center space-y-12">
            {/* VOYAGER wordmark */}
            <div>
              <h1 className="text-7xl font-bold tracking-wider text-gray-900 mb-4">
                VOYAGER
              </h1>
              <div className="w-48 h-px bg-gray-300 mx-auto mb-6"></div>
              <p className="text-xl text-gray-600">
                Chart your course
              </p>
            </div>

            {/* Conversational input */}
            {searchMode ? (
              <div className="space-y-6">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="What brings you here today?"
                    className="w-full px-6 py-4 pr-14 border border-gray-300 rounded-full focus:outline-none focus:border-gray-500 transition-colors text-base"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </button>
                </form>

                {suggestion && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-left">
                    <p className="text-gray-700 whitespace-pre-wrap">{suggestion.replace(/\*\*/g, '')}</p>
                    <button
                      onClick={() => handleJoinCommunity('careersy')}
                      className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                      Join Careersy Coaching
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">
                Click &ldquo;Explore&rdquo; to find your community
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
