'use client'

import { useState } from 'react'

export default function TestStreamPage() {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const testStream = async () => {
    setLoading(true)
    setResponse('')

    try {
      const res = await fetch('/api/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          communityId: 'voyager'
        })
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      let fullResponse = ''
      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        const chunk = decoder.decode(value)
        fullResponse += chunk
        setResponse(fullResponse)
      }
    } catch (error) {
      setResponse('Error: ' + (error instanceof Error ? error.message : 'Unknown'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧪 Streaming Chat Test</h1>

      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">Message:</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && testStream()}
            className="w-full p-2 border rounded"
            placeholder="Type a message..."
            disabled={loading}
          />
        </div>

        <button
          onClick={testStream}
          disabled={loading || !input}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Streaming...' : 'Send'}
        </button>

        {response && (
          <div className="p-4 border rounded bg-gray-50">
            <p className="font-medium mb-2">Response:</p>
            <div className="whitespace-pre-wrap">{response}</div>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="font-medium">✅ Watch for:</p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Response appears <strong>word-by-word</strong> (not all at once)</li>
          <li>No loading spinner needed</li>
          <li>Natural typing feel</li>
        </ul>
      </div>
    </div>
  )
}
