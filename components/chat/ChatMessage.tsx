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
    }
  }
}

export default function ChatMessage({ message, branding }: ChatMessageProps) {
  // Default colors (Careersy) as fallback
  const colors = branding?.colors || {
    primary: '#fad02c',
    background: '#fff9f2',
    text: '#000000',
    textSecondary: '#6b7280'
  }

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-[80%] rounded-xl p-4 shadow-lg border-2"
        style={{
          backgroundColor: message.role === 'user' ? colors.primary : '#ffffff',
          color: colors.text,
          borderColor: message.role === 'user' ? colors.primary : `${colors.primary}33` // 33 = 20% opacity in hex
        }}
      >
        {message.role === 'user' ? (
          <p className="whitespace-pre-wrap" style={{ color: '#000000 !important' } as React.CSSProperties}>{message.content}</p>
        ) : (
          <div
            className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-strong:font-semibold"
            style={{
              color: '#000000', // Hardcoded black for testing
              // Override prose default colors - hardcoded for testing
              ['--tw-prose-body' as any]: '#000000',
              ['--tw-prose-headings' as any]: '#000000',
              ['--tw-prose-links' as any]: '#000000',
              ['--tw-prose-bold' as any]: '#000000',
              ['--tw-prose-bullets' as any]: '#000000',
              ['--tw-prose-code' as any]: '#000000',
            }}
          >
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
