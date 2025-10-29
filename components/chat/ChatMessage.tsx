import ReactMarkdown from 'react-markdown'

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant'
    content: string
  }
  branding?: {
    colors: {
      primary: string
      background: string
      text: string
      textSecondary: string
      userMessageText?: string
    }
  }
}

export default function ChatMessage({ message, branding }: ChatMessageProps) {
  // Default colors (Careersy) as fallback
  const colors = branding?.colors || {
    primary: '#fad02c',
    background: '#fff9f2',
    text: '#000000',
    textSecondary: '#6b7280',
    userMessageText: '#000000'
  }

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-[80%] rounded-xl p-4 shadow-lg border-2"
        style={{
          backgroundColor: message.role === 'user' ? colors.primary : '#ffffff',
          color: message.role === 'user' ? (colors.userMessageText || '#ffffff') : colors.text,
          borderColor: message.role === 'user' ? colors.primary : `${colors.primary}33` // 33 = 20% opacity in hex
        }}
      >
        {message.role === 'user' ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div
            className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-strong:font-semibold"
            style={{
              color: colors.text,
              // Override prose default colors with community branding
              ['--tw-prose-body' as any]: colors.text,
              ['--tw-prose-headings' as any]: colors.text,
              ['--tw-prose-links' as any]: colors.primary,
              ['--tw-prose-bold' as any]: colors.text,
              ['--tw-prose-bullets' as any]: colors.text,
              ['--tw-prose-code' as any]: colors.text,
            }}
          >
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
