'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import ChatMessage from './ChatMessage'

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

export default function ChatInterface() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [showSidebar, setShowSidebar] = useState(false)
  const [loadingConversations, setLoadingConversations] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

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
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
      setConversationId(data.conversationId)

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
          <div className="p-4 border-b border-gray-800">
            <button
              onClick={startNewChat}
              className="w-full py-2 px-4 bg-careersy-yellow text-careersy-black hover:scale-105 rounded-[30px] font-semibold transition-transform"
            >
              + New Chat
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
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-careersy-yellow/30 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-careersy-cream rounded-[30px] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Image
              src="/careersy-logo.webp"
              alt="Careersy Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <div>
              <h1 className="text-xl font-lexend font-bold text-careersy-black tracking-tight">Careersy Wingman</h1>
              <p className="text-sm text-gray-700">Your AI Career Partner for Australian Tech</p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-700">
                <h2 className="text-3xl font-lexend font-bold mb-3 text-careersy-black tracking-tight">👋 Welcome, {session?.user?.name?.split(' ')[0]}!</h2>
                <p className="mb-6 text-lg">Ask me anything about your tech career in Australia</p>
                <div className="text-left max-w-md mx-auto space-y-3 bg-white p-6 rounded-xl shadow-lg border-2 border-careersy-yellow/20">
                  <p className="text-sm font-semibold text-careersy-black">Try asking about:</p>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-careersy-yellow">●</span>
                      <span>Interview preparation tips</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-careersy-yellow">●</span>
                      <span>Salary expectations for your role</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-careersy-yellow">●</span>
                      <span>Career progression advice</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-careersy-yellow">●</span>
                      <span>Resume feedback</span>
                    </li>
                  </ul>
                </div>
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

        {/* Input Form */}
        <form onSubmit={sendMessage} className="flex-shrink-0 p-4 border-t border-careersy-yellow/30 bg-white">
          <div className="flex space-x-2 max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about careers, interviews, salaries..."
              className="flex-1 p-3 border-2 border-gray-200 rounded-[30px] focus:outline-none focus:ring-2 focus:ring-careersy-yellow focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-8 py-3 bg-careersy-yellow text-careersy-black font-semibold rounded-[30px] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-transform shadow-lg"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
