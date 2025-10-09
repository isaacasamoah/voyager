interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant'
    content: string
  }
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-4 shadow ${
          message.role === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-900'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}
