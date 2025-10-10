'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SubscribePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubscribe = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const data = await response.json()

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Subscription error:', err)
      setError('Failed to start subscription process. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-careersy-cream flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-lexend font-bold text-careersy-black mb-3 tracking-tight">
              Get Started with Careersy Wingman
            </h1>
            <p className="text-gray-700">
              Your AI career partner for the Australian tech market
            </p>
          </div>

          {/* Pricing Card */}
          <div className="border-2 border-careersy-yellow rounded-lg p-6 mb-6 bg-careersy-cream/30">
            <div className="text-center mb-4">
              <div className="text-5xl font-lexend font-bold text-careersy-black mb-2">$0</div>
              <div className="text-gray-700">per month</div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-careersy-black mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="text-gray-700">Unlimited AI career coaching</span>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-careersy-black mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="text-gray-700">Australian tech market insights</span>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-careersy-black mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="text-gray-700">Interview preparation</span>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-careersy-black mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="text-gray-700">Salary negotiation guidance</span>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-careersy-black mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="text-gray-700">Conversation history</span>
              </div>
            </div>

            <div className="bg-careersy-yellow/20 border border-careersy-yellow rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-careersy-black mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                <p className="text-sm text-careersy-black">
                  <strong>Demo Tier:</strong> This is a free test subscription to demonstrate the platform. No credit card required!
                </p>
              </div>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full bg-careersy-yellow hover:scale-105 text-careersy-black font-semibold py-3 px-6 rounded-[30px] transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Processing...' : 'Start Free Subscription'}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {error}
              </div>
            )}
          </div>

          <p className="text-center text-sm text-gray-500">
            Cancel anytime. No commitment required.
          </p>
        </div>
      </div>
    </div>
  )
}
