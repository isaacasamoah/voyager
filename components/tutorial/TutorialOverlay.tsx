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
}

export default function TutorialOverlay({ steps, onComplete, onSkip }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null)
  const [resultAppeared, setResultAppeared] = useState(false)
  const [interactionCompleted, setInteractionCompleted] = useState(false)

  const step = steps[currentStep]

  // Find and highlight target element
  useEffect(() => {
    setResultAppeared(false)
    setInteractionCompleted(false)

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

      // If this step allows interaction, make element clickable
      if (step.allowInteraction) {
        element.classList.add('tutorial-interactive')
      }
    }

    return () => {
      if (element) {
        element.classList.remove('tutorial-highlight')
        element.classList.remove('tutorial-interactive')
      }
    }
  }, [step.targetSelector, step.allowInteraction])

  // Watch for result element to appear
  useEffect(() => {
    if (!step.resultSelector || !step.waitForElement) return

    const checkForResult = setInterval(() => {
      const resultElement = document.querySelector(step.resultSelector!) as HTMLElement
      if (resultElement) {
        setResultAppeared(true)
        setInteractionCompleted(true)

        // Highlight the result too
        const resultRect = resultElement.getBoundingClientRect()
        setSpotlightRect(resultRect)
        setTargetElement(resultElement)

        clearInterval(checkForResult)
      }
    }, 100)

    return () => clearInterval(checkForResult)
  }, [step.resultSelector, step.waitForElement])

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

    let position = { ...step.position } // Start with preferred position
    let top = 0
    let left = 0
    let transform = ''

    // Try preferred position first, but adjust if it goes off screen
    switch (step.position) {
      case 'bottom':
        top = spotlightRect.bottom + padding
        left = spotlightRect.left + spotlightRect.width / 2
        transform = 'translateX(-50%)'

        // If tooltip goes below viewport, move it above
        if (top + tooltipHeight > viewportHeight) {
          top = spotlightRect.top - padding
          transform = 'translate(-50%, -100%)'
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

        // If tooltip goes off left edge, move it to right
        if (left - tooltipWidth < 0) {
          left = spotlightRect.right + padding
          transform = 'translateY(-50%)'
        }
        break

      case 'right':
        top = spotlightRect.top + spotlightRect.height / 2
        left = spotlightRect.right + padding
        transform = 'translateY(-50%)'

        // If tooltip goes off right edge, move it to left
        if (left + tooltipWidth > viewportWidth) {
          left = spotlightRect.left - padding
          transform = 'translate(-100%, -50%)'
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

    return {
      top: `${top}px`,
      left: `${left}px`,
      transform,
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
        }

        .tutorial-interactive {
          pointer-events: auto !important;
          cursor: pointer !important;
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
