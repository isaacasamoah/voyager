'use client'

import { useState, useEffect } from 'react'

export interface TutorialStep {
  id: string
  title: string
  description: string
  targetSelector?: string // CSS selector for element to highlight
  resultSelector?: string // CSS selector for what appears after interaction (modal, sidebar, etc.)
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: 'click' | 'type' | 'view' // What user should do
  requireInteraction?: boolean // Wait for user to do action before next
  waitForElement?: boolean // Wait for resultSelector to appear before allowing Next
  allowInteraction?: boolean // Allow user to click the highlighted element
}

interface TutorialOverlayProps {
  steps: TutorialStep[]
  onComplete: () => void
  onSkip: () => void
  onStepChange?: (stepId: string) => void
  accentColor?: string // Hex color for borders and highlights (defaults to Careersy yellow)
}

export default function TutorialOverlay({ steps, onComplete, onSkip, onStepChange, accentColor = '#fad02c' }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null)

  const step = steps[currentStep]

  // Determine if we need light or dark text based on accent color brightness
  const getTextColor = (hexColor: string): string => {
    const hex = hexColor.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128 ? '#000000' : '#ffffff'
  }

  // Notify parent when step changes
  useEffect(() => {
    if (onStepChange) {
      onStepChange(step.id)
    }
  }, [step.id, onStepChange])

  // Find and highlight target element
  useEffect(() => {
    if (!step.targetSelector) {
      setTargetElement(null)
      setSpotlightRect(null)
      return
    }

    const element = document.querySelector(step.targetSelector) as HTMLElement
    if (element) {
      setTargetElement(element)
      const rect = element.getBoundingClientRect()
      setSpotlightRect(rect)

      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })

      // Add highlight class
      element.classList.add('tutorial-highlight')
    }

    return () => {
      if (element) {
        element.classList.remove('tutorial-highlight')
      }
    }
  }, [step.targetSelector])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getTooltipPosition = () => {
    if (!spotlightRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }

    const padding = 20
    const tooltipWidth = 320
    const tooltipHeight = 250 // Approximate
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let top = 0
    let left = 0
    let transform = ''

    // Try preferred position first, but adjust if it goes off screen
    switch (step.position) {
      case 'bottom':
        top = spotlightRect.bottom + padding
        left = spotlightRect.left + spotlightRect.width / 2
        transform = 'translateX(-50%)'

        // If tooltip goes below viewport, try above
        if (top + tooltipHeight > viewportHeight) {
          const topPosition = spotlightRect.top - padding - tooltipHeight
          // If above also goes off-screen, center it vertically
          if (topPosition < 0) {
            top = viewportHeight / 2
            transform = 'translate(-50%, -50%)'
          } else {
            top = spotlightRect.top - padding
            transform = 'translate(-50%, -100%)'
          }
        }
        break

      case 'top':
        top = spotlightRect.top - padding
        left = spotlightRect.left + spotlightRect.width / 2
        transform = 'translate(-50%, -100%)'

        // If tooltip goes above viewport, move it below
        if (top - tooltipHeight < 0) {
          top = spotlightRect.bottom + padding
          transform = 'translateX(-50%)'
        }
        break

      case 'left':
        top = spotlightRect.top + spotlightRect.height / 2
        left = spotlightRect.left - padding
        transform = 'translate(-100%, -50%)'

        // If tooltip goes off left edge, try bottom then right
        if (left - tooltipWidth < 0) {
          // Try bottom first
          if (spotlightRect.bottom + padding + tooltipHeight < viewportHeight) {
            top = spotlightRect.bottom + padding
            left = spotlightRect.left + spotlightRect.width / 2
            transform = 'translateX(-50%)'
          } else {
            // Fall back to right if bottom doesn't work
            left = spotlightRect.right + padding
            transform = 'translateY(-50%)'
          }
        }
        break

      case 'right':
        top = spotlightRect.top + spotlightRect.height / 2
        left = spotlightRect.right + padding
        transform = 'translateY(-50%)'

        // If tooltip goes off right edge, try bottom then left
        if (left + tooltipWidth > viewportWidth) {
          // Try bottom first
          if (spotlightRect.bottom + padding + tooltipHeight < viewportHeight) {
            top = spotlightRect.bottom + padding
            left = spotlightRect.left + spotlightRect.width / 2
            transform = 'translateX(-50%)'
          } else {
            // Fall back to left if bottom doesn't work
            left = spotlightRect.left - padding
            transform = 'translate(-100%, -50%)'
          }
        }
        break

      case 'center':
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }
    }

    // Final bounds check: ensure tooltip is visible horizontally
    if (left < tooltipWidth / 2) {
      left = tooltipWidth / 2 + padding
      transform = 'translateX(-50%)'
    } else if (left > viewportWidth - tooltipWidth / 2) {
      left = viewportWidth - tooltipWidth / 2 - padding
      transform = 'translateX(-50%)'
    }

    // Ensure tooltip is visible vertically
    if (top < padding) {
      top = padding
    } else if (top + tooltipHeight > viewportHeight) {
      top = viewportHeight - tooltipHeight - padding
    }

    return {
      top: `${top}px`,
      left: `${left}px`,
      transform,
    }
  }

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Dark overlay - blocks all clicks */}
      <div className="absolute inset-0 bg-black/70 cursor-not-allowed">
        {spotlightRect && (
          <div
            className="absolute border-2 rounded-lg shadow-xl"
            style={{
              top: `${spotlightRect.top - 8}px`,
              left: `${spotlightRect.left - 8}px`,
              width: `${spotlightRect.width + 16}px`,
              height: `${spotlightRect.height + 16}px`,
              borderColor: `${accentColor}99`, // 60% opacity
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
            }}
          />
        )}
      </div>

      {/* Tutorial tooltip */}
      <div
        className="absolute bg-white rounded-xl shadow-2xl border-2 max-w-sm w-80 p-6 animate-in fade-in slide-in-from-bottom-4 duration-300"
        style={{
          ...getTooltipPosition(),
          borderColor: accentColor,
        }}
      >
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-6'
                    : idx < currentStep
                    ? 'w-1.5'
                    : 'w-1.5 bg-gray-200'
                }`}
                style={{
                  backgroundColor: idx <= currentStep ? (idx === currentStep ? accentColor : `${accentColor}80`) : undefined
                }}
              />
            ))}
          </div>
          <button
            onClick={onSkip}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Step content */}
        <div className="mb-6">
          <h3 className="text-lg font-lexend font-bold text-careersy-black mb-2">
            {step.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm text-gray-600 hover:text-careersy-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Back
          </button>

          <div className="text-xs text-gray-400">
            {currentStep + 1} of {steps.length}
          </div>

          <button
            onClick={handleNext}
            className="px-6 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
            style={{
              backgroundColor: accentColor,
              color: getTextColor(accentColor),
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>

      {/* Global styles for tutorial highlight */}
      <style jsx global>{`
        .tutorial-highlight {
          position: relative;
          z-index: 51 !important;
        }
      `}</style>
    </div>
  )
}
