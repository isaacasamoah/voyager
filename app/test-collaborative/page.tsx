// @ts-nocheck
'use client'

import { useState } from 'react'

export default function TestCollaborativePage() {
  const [testResults, setTestResults] = useState<any[]>([])

  const addResult = (test: string, passed: boolean, details?: string) => {
    setTestResults(prev => [...prev, { test, passed, details, timestamp: new Date() }])
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🤝 Collaborative Mode Test</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-blue-900 mb-3">What We're Testing</h2>
        <div className="text-blue-800 space-y-2 text-sm">
          <p><strong>Collaborative Mode Flow:</strong></p>
          <ol className="list-decimal ml-6 space-y-1">
            <li>Start in PRIVATE mode (default)</li>
            <li>After 6+ messages or creation keywords → AI suggests collaboration</li>
            <li>User accepts → Switch to PUBLIC mode (Explore prompt)</li>
            <li>User declines → Stay private, never ask again</li>
            <li>Manual toggle works anytime</li>
          </ol>
        </div>
      </div>

      <div className="space-y-6">
        {/* Test 1: Depth Detection */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test 1: Depth Detection</h2>
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-mono text-sm mb-2">Expected Behavior:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>✓ Start Careersy chat in private mode</li>
                <li>✓ Send 3+ back-and-forth messages (6+ total)</li>
                <li>✓ AI should suggest: "💡 Want to open this up for collaboration?"</li>
                <li>✓ Buttons appear: [Yes, let's collaborate] [Not yet, keep going]</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
              <p className="font-semibold text-yellow-900 mb-2">Manual Test Steps:</p>
              <ol className="text-sm space-y-1 list-decimal ml-4">
                <li>Go to Careersy (/careersy)</li>
                <li>Ensure Collaborate toggle is OFF</li>
                <li>Start conversation: "How do I improve my resume?"</li>
                <li>Continue for 3+ exchanges</li>
                <li>Look for 💡 collaboration suggestion</li>
              </ol>
            </div>

            <label className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                onChange={(e) => addResult('Depth Detection', e.target.checked, 'AI suggested collaboration after 6+ messages')}
                className="w-4 h-4"
              />
              <span className="text-sm">✅ AI suggested collaboration after depth reached</span>
            </label>
          </div>
        </div>

        {/* Test 2: Accept Collaboration */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test 2: Accept Collaboration</h2>
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-mono text-sm mb-2">Expected Behavior:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>✓ Click "Yes, let's collaborate"</li>
                <li>✓ Collaborate toggle switches to ON</li>
                <li>✓ Next AI message uses EXPLORE mode tone</li>
                <li>✓ AI helps prepare something to share</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded">
              <p className="font-semibold text-green-900 mb-2">What to Look For:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li><strong>Explore Mode Tone:</strong></li>
                <li>- "Let's think through this together..."</li>
                <li>- "What would make this valuable for others?"</li>
                <li>- "I'm curious about..."</li>
                <li>- Asks questions vs giving answers</li>
                <li>- Helps you prepare, not solves for you</li>
              </ul>
            </div>

            <label className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                onChange={(e) => addResult('Accept Collaboration', e.target.checked, 'Mode switched and AI tone changed to Explore')}
                className="w-4 h-4"
              />
              <span className="text-sm">✅ Mode switched & AI uses Explore tone</span>
            </label>
          </div>
        </div>

        {/* Test 3: Decline Collaboration */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test 3: Decline Collaboration</h2>
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-mono text-sm mb-2">Expected Behavior:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>✓ Click "Not yet, keep going"</li>
                <li>✓ Stay in private mode</li>
                <li>✓ AI confirms: "No problem - staying private..."</li>
                <li>✓ AI never auto-suggests collaboration again</li>
                <li>✓ Manual toggle still works</li>
              </ul>
            </div>

            <label className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                onChange={(e) => addResult('Decline Collaboration', e.target.checked, 'Stayed private, no more auto-suggestions')}
                className="w-4 h-4"
              />
              <span className="text-sm">✅ Declined correctly & doesn't ask again</span>
            </label>
          </div>
        </div>

        {/* Test 4: Creation Keywords */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test 4: Creation Keywords Trigger</h2>
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-mono text-sm mb-2">Expected Behavior:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>✓ Trigger words: "create", "write", "draft", "prepare", "help me with"</li>
                <li>✓ Even in early messages (before 6 total)</li>
                <li>✓ AI suggests collaboration</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
              <p className="font-semibold text-yellow-900 mb-2">Test Messages:</p>
              <ul className="text-sm space-y-1 ml-4 font-mono">
                <li>"Help me write a cover letter"</li>
                <li>"I need to create a pitch deck"</li>
                <li>"Can you help me draft a proposal?"</li>
              </ul>
            </div>

            <label className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                onChange={(e) => addResult('Creation Keywords', e.target.checked, 'Triggered collaboration on creation keywords')}
                className="w-4 h-4"
              />
              <span className="text-sm">✅ Creation keywords trigger collaboration prompt</span>
            </label>
          </div>
        </div>

        {/* Test 5: Manual Toggle */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test 5: Manual Toggle Works</h2>
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-mono text-sm mb-2">Expected Behavior:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>✓ User can toggle Collaborate anytime</li>
                <li>✓ Doesn't wait for depth detection</li>
                <li>✓ Immediate mode switch</li>
                <li>✓ Next message uses Explore prompt</li>
              </ul>
            </div>

            <label className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                onChange={(e) => addResult('Manual Toggle', e.target.checked, 'Manual toggle switches mode immediately')}
                className="w-4 h-4"
              />
              <span className="text-sm">✅ Manual toggle works independently</span>
            </label>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="border border-green-200 bg-green-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-900 mb-4">Test Results</h2>
            <div className="space-y-2">
              {testResults.map((result, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className={result.passed ? 'text-green-600' : 'text-red-600'}>
                    {result.passed ? '✅' : '❌'}
                  </span>
                  <span className="font-semibold">{result.test}:</span>
                  <span className="text-gray-700">{result.details}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-green-200">
              <div className="text-sm text-green-800">
                <strong>Passing:</strong> {testResults.filter(r => r.passed).length} / {testResults.length}
              </div>
            </div>
          </div>
        )}

        {/* Implementation Notes */}
        <details className="border border-gray-200 rounded-lg p-6">
          <summary className="text-xl font-semibold cursor-pointer">Implementation Notes</summary>
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <p className="font-semibold mb-1">Prompt Layers:</p>
              <ul className="ml-4 space-y-1">
                <li><code className="bg-gray-100 px-2 py-1 rounded">DEPTH_DETECTION_LAYER</code> - Suggests collaboration</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">EXPLORE_MODE_LAYER</code> - Public mode, no artifact</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">CRAFT_MODE_LAYER</code> - Public mode with artifact (future)</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-1">Database Flags:</p>
              <ul className="ml-4 space-y-1">
                <li><code className="bg-gray-100 px-2 py-1 rounded">collaborationPrompted</code> - Have we asked?</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">collaborationDeclined</code> - Did they decline?</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-1">Mode Detection:</p>
              <pre className="bg-gray-100 p-3 rounded overflow-x-auto">
{`const shouldSuggest =
  !isPublicMode &&
  !collaborationPrompted &&
  !collaborationDeclined &&
  (messages.length >= 6 ||
   hasCreationKeywords)`}
              </pre>
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}
