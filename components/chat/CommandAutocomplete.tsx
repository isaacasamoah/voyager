'use client'

import { useEffect, useRef } from 'react'

interface Command {
  command: string
  description: string
}

interface CommandAutocompleteProps {
  input: string
  onSelect: (command: string) => void
  position: { top: number; left: number }
  branding: any // fullBranding from community config
}

const COMMANDS: Command[] = [
  { command: '/navigator', description: 'Personal coaching mode' },
  { command: '/cartographer', description: 'Knowledge extraction mode' },
  { command: '/shipwright', description: 'Post crafting mode' },
  { command: '/help', description: 'Show available commands' },
]

export default function CommandAutocomplete({ input, onSelect, position, branding }: CommandAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Filter commands based on input
  const filteredCommands = COMMANDS.filter(cmd =>
    cmd.command.toLowerCase().startsWith(input.toLowerCase())
  )

  // If no match or input doesn't start with /, don't show
  if (!input.startsWith('/') || filteredCommands.length === 0) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="absolute z-50 bg-white rounded-lg shadow-xl border overflow-hidden"
      style={{
        bottom: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: '280px',
        maxWidth: '400px',
        borderColor: branding.colors.textSecondary || '#e5e7eb'
      }}
    >
      <div className="py-2">
        {filteredCommands.map((cmd, idx) => (
          <button
            key={cmd.command}
            onClick={() => onSelect(cmd.command)}
            className="w-full px-4 py-2.5 text-left transition-colors flex items-start gap-3 group"
            style={{
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = branding.colors.background || '#f9fafb'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <div className="flex-shrink-0 mt-0.5">
              <div
                className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: branding.colors.background || '#f3f4f6'
                }}
              >
                <span
                  className="text-xs font-mono"
                  style={{ color: branding.colors.textSecondary || '#6b7280' }}
                >
                  /
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="font-medium text-sm font-mono"
                style={{ color: branding.colors.text }}
              >
                {cmd.command}
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: branding.colors.textSecondary || '#6b7280' }}
              >
                {cmd.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Hint text */}
      <div
        className="px-4 py-2 border-t"
        style={{
          backgroundColor: branding.colors.background || '#f9fafb',
          borderTopColor: branding.colors.textSecondary || '#e5e7eb'
        }}
      >
        <p
          className="text-xs"
          style={{ color: branding.colors.textSecondary || '#6b7280' }}
        >
          <span className="font-medium">↑↓</span> Navigate
          <span className="ml-3 font-medium">Enter</span> Select
          <span className="ml-3 font-medium">Esc</span> Close
        </p>
      </div>
    </div>
  )
}
