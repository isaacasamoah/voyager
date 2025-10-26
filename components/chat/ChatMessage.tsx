import ReactMarkdown from 'react-markdown'

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant'
    content: string
  }
  onPost?: () => void
  onEdit?: () => void
  primaryColor?: string
  publishing?: boolean
  published?: boolean
}

export default function ChatMessage({ message, onPost, onEdit, primaryColor = '#fad02c', publishing = false, published = false }: ChatMessageProps) {
  // Check if this message is ready to post
  const hasReadyMarker = message.content.includes('[READY_TO_POST]')

  // Strip the [READY_TO_POST] marker from display
  const displayContent = message.content.replace(/\[READY_TO_POST\]/g, '').trim()

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-xl p-4 shadow-lg ${
          message.role === 'user'
            ? 'bg-careersy-yellow text-careersy-black border-2 border-careersy-yellow'
            : hasReadyMarker
            ? 'bg-white text-gray-900 border-2 border-careersy-yellow shadow-careersy-yellow/30'
            : 'bg-white text-gray-900 border-2 border-careersy-yellow/20'
        }`}
      >
        {message.role === 'user' ? (
          <p className="whitespace-pre-wrap">{displayContent}</p>
        ) : (
          <>
            <div className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-strong:text-careersy-black prose-strong:font-semibold">
              <ReactMarkdown>{displayContent}</ReactMarkdown>
            </div>

            {/* Inline action buttons for curated drafts */}
            {hasReadyMarker && onPost && (
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2">
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    ✏️ Edit
                  </button>
                )}
                <button
                  onClick={onPost}
                  disabled={publishing || published}
                  className="px-4 py-1.5 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-50 hover:shadow-lg"
                  style={{
                    backgroundColor: published ? '#10b981' : primaryColor
                  }}
                >
                  {publishing ? (
                    <span className="flex items-center gap-1.5">
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Publishing...
                    </span>
                  ) : published ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Published!
                    </span>
                  ) : (
                    '🚀 Post'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
