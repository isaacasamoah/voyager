'use client'

import { useState, useEffect } from 'react'

export interface TutorialStep {
  id: string
  title: string
  description: string
  targetSelector?: string // CSS selector for element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: 'click' | 'type' | 'view' // What user should do
  requireInteraction?: boolean // Wait for user to do action before next
}

interface TutorialOverlayProps {
  steps: TutorialStep[]
  onComplete: () => void
  onSkip: () => void
}

export default function TutorialOverlay({ steps, onComplete, onSkip }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null)

  const step = steps[currentStep]

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

      // Add pulse animation to element
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

    switch (step.position) {
      case 'bottom':
        return {
          top: `${spotlightRect.bottom + padding}px`,
          left: `${spotlightRect.left + spotlightRect.width / 2}px`,
          transform: 'translateX(-50%)',
        }
      case 'top':
        return {
          top: `${spotlightRect.top - padding}px`,
          left: `${spotlightRect.left + spotlightRect.width / 2}px`,
          transform: 'translate(-50%, -100%)',
        }
      case 'left':
        return {
          top: `${spotlightRect.top + spotlightRect.height / 2}px`,
          left: `${spotlightRect.left - padding}px`,
          transform: 'translate(-100%, -50%)',
        }
      case 'right':
        return {
          top: `${spotlightRect.top + spotlightRect.height / 2}px`,
          left: `${spotlightRect.right + padding}px`,
          transform: 'translateY(-50%)',
        }
      case 'center':
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Dark overlay with spotlight cutout */}
      <div className="absolute inset-0 bg-black/70 pointer-events-none">
        {spotlightRect && (
          <div
            className="absolute border-4 border-careersy-yellow rounded-lg shadow-xl animate-pulse-slow"
            style={{
              top: `${spotlightRect.top - 8}px`,
              left: `${spotlightRect.left - 8}px`,
              width: `${spotlightRect.width + 16}px`,
              height: `${spotlightRect.height + 16}px`,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
            }}
          />
        )}
      </div>

      {/* Tutorial tooltip */}
      <div
        className="absolute bg-white rounded-xl shadow-2xl border-2 border-careersy-yellow max-w-sm w-80 p-6 animate-in fade-in slide-in-from-bottom-4 duration-300"
        style={getTooltipPosition()}
      >
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-6 bg-careersy-yellow'
                    : idx < currentStep
                    ? 'w-1.5 bg-careersy-yellow/50'
                    : 'w-1.5 bg-gray-200'
                }`}
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

          {step.action && (
            <div className="mt-3 px-3 py-2 bg-careersy-cream rounded-lg">
              <p className="text-xs text-careersy-black font-medium">
                {step.action === 'click' && '👆 Click the highlighted element'}
                {step.action === 'type' && '⌨️ Try typing a message'}
                {step.action === 'view' && '👀 Take a look at this feature'}
              </p>
            </div>
          )}
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
            className="px-6 py-2 bg-careersy-yellow hover:bg-careersy-yellow/90 text-careersy-black rounded-full text-sm font-medium transition-all hover:scale-105"
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
          pointer-events: auto !important;
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}
