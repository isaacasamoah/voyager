// @ts-nocheck
'use client'

import { useState } from 'react'
import voyagerConfigData from '@/communities/voyager.json'
import careersyConfigData from '@/communities/careersy.json'

export default function TestBrandingPage() {
  const [selectedCommunity, setSelectedCommunity] = useState<'voyager' | 'careersy'>('voyager')

  const voyagerConfig = voyagerConfigData
  const careersyConfig = careersyConfigData
  const config = selectedCommunity === 'voyager' ? voyagerConfig : careersyConfig

  if (!config) {
    return <div className="p-8">❌ Failed to load community config</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🎨 Branding Configuration Test</h1>

      {/* Community Selector */}
      <div className="mb-8 flex gap-4">
        <button
          onClick={() => setSelectedCommunity('voyager')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            selectedCommunity === 'voyager'
              ? 'bg-black text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Voyager
        </button>
        <button
          onClick={() => setSelectedCommunity('careersy')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            selectedCommunity === 'careersy'
              ? 'bg-black text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Careersy
        </button>
      </div>

      {/* Test Results */}
      <div className="space-y-6">
        {/* Title & Logo */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Title & Logo</h2>
          <div className="space-y-2">
            <div>
              <span className="font-mono text-sm text-gray-600">branding.title:</span>
              <div className={`mt-2 ${config.branding.typography.title.font} ${config.branding.typography.title.size} ${config.branding.typography.title.weight} ${config.branding.typography.title.tracking}`} style={{ color: config.branding.colors.text }}>
                {config.branding.title}
              </div>
            </div>
            <div>
              <span className="font-mono text-sm text-gray-600">branding.logo:</span>
              <div className="mt-2 text-sm">{config.branding.logo || '(none)'}</div>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Colors</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(config.branding.colors).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded border border-gray-300"
                  style={{ backgroundColor: value }}
                ></div>
                <div>
                  <div className="font-mono text-xs text-gray-600">{key}</div>
                  <div className="font-mono text-sm">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Components */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Component Preview</h2>
          <div className="space-y-4">
            {/* Button */}
            <div>
              <span className="font-mono text-xs text-gray-600 block mb-2">button:</span>
              <button className={config.branding.components.button + " px-6 py-3"}>
                Test Button
              </button>
            </div>

            {/* Input */}
            <div>
              <span className="font-mono text-xs text-gray-600 block mb-2">input:</span>
              <input
                type="text"
                placeholder="Test input..."
                className={config.branding.components.input + " px-4 py-3 w-full"}
              />
            </div>

            {/* Message Bubbles */}
            <div className="space-y-2">
              <span className="font-mono text-xs text-gray-600 block mb-2">messages:</span>
              <div className="flex justify-end">
                <div className={config.branding.components.messageUser + " rounded-xl px-4 py-3 max-w-[80%]"}>
                  User message preview
                </div>
              </div>
              <div className="flex justify-start">
                <div className={config.branding.components.messageAssistant + " rounded-xl px-4 py-3 max-w-[80%]"}>
                  Assistant message preview
                </div>
              </div>
            </div>

            {/* Loading Dots */}
            <div>
              <span className="font-mono text-xs text-gray-600 block mb-2">loading:</span>
              <div className={config.branding.components.messageAssistant + " rounded-xl p-4 inline-block"}>
                <div className="flex space-x-2">
                  <div className={`w-2 h-2 ${config.branding.components.loadingDots} rounded-full animate-bounce`}></div>
                  <div className={`w-2 h-2 ${config.branding.components.loadingDots} rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
                  <div className={`w-2 h-2 ${config.branding.components.loadingDots} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Page Preview */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Full Page Preview</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            <div className="h-96" style={{ backgroundColor: config.branding.colors.background }}>
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <h1 className={`${config.branding.typography.title.font} ${config.branding.typography.title.size} ${config.branding.typography.title.weight} ${config.branding.typography.title.tracking} mb-4`} style={{ color: config.branding.colors.text }}>
                    {config.branding.title}
                  </h1>
                  <div className="w-48 h-[1px] bg-gray-200 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Checklist */}
        <div className="border border-green-200 bg-green-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-900">✅ Test Checklist</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="title" className="w-4 h-4" />
              <label htmlFor="title">Title displays with correct font, size, and color</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="colors" className="w-4 h-4" />
              <label htmlFor="colors">All colors match expected values</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="button" className="w-4 h-4" />
              <label htmlFor="button">Button has correct styling and hover effect</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="input" className="w-4 h-4" />
              <label htmlFor="input">Input has correct border and focus state</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="messages" className="w-4 h-4" />
              <label htmlFor="messages">Message bubbles have correct colors</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="background" className="w-4 h-4" />
              <label htmlFor="background">Background color matches</label>
            </div>
          </div>
        </div>

        {/* Config JSON */}
        <details className="border border-gray-200 rounded-lg p-6">
          <summary className="text-xl font-semibold cursor-pointer">Raw Config JSON</summary>
          <pre className="mt-4 bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(config.branding, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  )
}
