import ReactMarkdown from 'react-markdown'

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant'
    content: string
  }
}

export default function ChatMessage({ message }: ChatMessageProps) {
  // Strip the [READY_TO_POST] marker from display
  const displayContent = message.content.replace(/\[READY_TO_POST\]/g, '').trim()

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-xl p-4 shadow-lg ${
          message.role === 'user'
            ? 'bg-careersy-yellow text-careersy-black border-2 border-careersy-yellow'
            : 'bg-white text-gray-900 border-2 border-careersy-yellow/20'
        }`}
      >
        {message.role === 'user' ? (
          <p className="whitespace-pre-wrap">{displayContent}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-strong:text-careersy-black prose-strong:font-semibold">
            <ReactMarkdown>{displayContent}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
