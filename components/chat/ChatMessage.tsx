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
        className={`max-w-[80%] rounded-xl p-4 shadow-lg ${
          message.role === 'user'
            ? 'bg-careersy-yellow text-careersy-black border-2 border-careersy-yellow'
            : 'bg-white text-gray-900 border-2 border-careersy-yellow/20'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}
