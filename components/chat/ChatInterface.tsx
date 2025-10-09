'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import ChatMessage from './ChatMessage'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatInterface() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b bg-white">
        <h1 className="text-xl font-semibold">AI Career Coach</h1>
        <p className="text-sm text-gray-600">Australian Tech Market Specialist</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <h2 className="text-2xl font-bold mb-2">👋 Welcome, {session?.user?.name?.split(' ')[0]}!</h2>
              <p className="mb-4">Ask me anything about your tech career in Australia</p>
              <div className="text-left max-w-md mx-auto space-y-2">
                <p className="text-sm">Try asking about:</p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Interview preparation tips</li>
                  <li>Salary expectations for your role</li>
                  <li>Career progression advice</li>
                  <li>Resume feedback</li>
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
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} className="flex-shrink-0 p-4 border-t bg-white">
        <div className="flex space-x-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about careers, interviews, salaries..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}
