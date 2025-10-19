'use client'

import Link from 'next/link'
import { useState } from 'react'

interface TestPage {
  name: string
  path: string
  description: string
  category: 'feature' | 'integration' | 'visual'
  status: 'passing' | 'failing' | 'unknown'
  lastRun?: string
}

const testPages: TestPage[] = [
  {
    name: 'Streaming Chat',
    path: '/test-stream',
    description: 'Verifies AI streaming responses work word-by-word for Voyager community',
    category: 'feature',
    status: 'passing',
    lastRun: '2025-10-19'
  },
  {
    name: 'Multi-Community Branding',
    path: '/test-branding',
    description: 'Verifies dynamic branding configs for Voyager and Careersy (colors, fonts, components)',
    category: 'visual',
    status: 'unknown',
  },
]

export default function TestIndexPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'feature' | 'integration' | 'visual'>('all')

  const filteredTests = selectedCategory === 'all'
    ? testPages
    : testPages.filter(test => test.category === selectedCategory)

  const statusColors = {
    passing: 'bg-green-100 text-green-800 border-green-200',
    failing: 'bg-red-100 text-red-800 border-red-200',
    unknown: 'bg-gray-100 text-gray-600 border-gray-200'
  }

  const statusEmoji = {
    passing: '✅',
    failing: '❌',
    unknown: '❓'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🧪 Test Suite</h1>
          <p className="text-gray-600">
            Manual test pages for verifying features across session boundaries.
            Part of our <strong>Test-Driven Context Preservation (TDCP)</strong> approach.
          </p>
        </div>

        {/* TDCP Explainer */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">💡 What is TDCP?</h2>
          <p className="text-blue-800 mb-4">
            <strong>Test-Driven Context Preservation</strong> is our approach to preserving knowledge
            across AI session compacting. When sessions get long, context is summarized - but code doesn&apos;t lie.
          </p>
          <div className="space-y-2 text-sm text-blue-700">
            <div className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span><strong>Create test page first</strong> - Shows current state (usually broken/missing)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span><strong>Implement feature</strong> - Build the actual functionality</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span><strong>Verify test passes</strong> - Manually test and check all items</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold">4.</span>
              <span><strong>Commit together</strong> - Test + implementation in same commit</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold">5.</span>
              <span><strong>Future sessions use tests</strong> - Tests survive compacting, serve as living docs</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">{testPages.length}</div>
            <div className="text-sm text-gray-600">Total Tests</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {testPages.filter(t => t.status === 'passing').length}
            </div>
            <div className="text-sm text-gray-600">Passing</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-500">
              {testPages.filter(t => t.status === 'unknown').length}
            </div>
            <div className="text-sm text-gray-600">Need Testing</div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6">
          {(['all', 'feature', 'integration', 'visual'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                selectedCategory === category
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Test List */}
        <div className="space-y-4">
          {filteredTests.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
              No tests in this category yet.
            </div>
          ) : (
            filteredTests.map((test) => (
              <Link
                key={test.path}
                href={test.path}
                className="block bg-white border border-gray-200 rounded-lg p-6 hover:border-black transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-black">
                        {test.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${statusColors[test.status]}`}>
                        {statusEmoji[test.status]} {test.status}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded border border-gray-200 bg-gray-50 text-gray-700 capitalize">
                        {test.category}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{test.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="font-mono">{test.path}</span>
                      </div>
                      {test.lastRun && (
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Last run: {test.lastRun}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🚀 Quick Actions</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span><strong>New feature?</strong> Use <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">/build</code> command - it now includes TDCP workflow</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span><strong>After testing:</strong> Update test status in <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">app/test/page.tsx</code></span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              <span><strong>Creating test?</strong> Follow format in <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">app/test-stream/page.tsx</code></span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>💡 Tip: Run all tests after major changes or when resuming from a compacted session</p>
        </div>
      </div>
    </div>
  )
}
