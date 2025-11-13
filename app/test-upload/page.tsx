'use client'

import { useState } from 'react'

export default function TestUploadPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testMarkdown = `# Isaac Asamoah
**Senior Software Engineer**

## Experience

### Lead Developer at Tech Corp
*2020 - Present*

- Led team of 5 engineers building Next.js applications
- Implemented authentication system using NextAuth.js
- Improved performance by 40% through optimization

### Software Engineer at StartupCo
*2018 - 2020*

- Built React applications with TypeScript
- Implemented CI/CD pipelines
- Mentored junior developers

## Skills

- **Frontend:** React, Next.js, TypeScript, Tailwind CSS
- **Backend:** Node.js, PostgreSQL, Prisma
- **DevOps:** Vercel, AWS, Docker

## Education

**B.S. Computer Science**
University of Technology, 2018
`

  async function testUpload() {
    setLoading(true)
    setResult(null)

    try {
      // Create a test markdown file
      const file = new File([testMarkdown], 'test-resume.md', { type: 'text/markdown' })

      const formData = new FormData()
      formData.append('file', file)
      formData.append('communityId', 'careersy')

      const response = await fetch('/api/context-anchors/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      const contentType = response.headers.get('content-type')
      let data

      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        data = { error: 'Non-JSON response', responseText: text.substring(0, 500) }
      }

      setResult({ status: response.status, data })
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  async function testFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('communityId', 'careersy')

      const response = await fetch('/api/context-anchors/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      const contentType = response.headers.get('content-type')
      let data

      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        data = { error: 'Non-JSON response', responseText: text.substring(0, 500) }
      }

      setResult({ status: response.status, data })
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Context Anchors Upload Test</h1>
        <p className="text-gray-600 mb-8">Test the upload API endpoint</p>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test 1: Upload Test Markdown</h2>
          <p className="text-gray-600 mb-4">
            Click the button to upload a pre-made test resume in markdown format.
          </p>
          <button
            onClick={testUpload}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Uploading...' : 'Upload Test Resume'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test 2: Upload Your Own File</h2>
          <p className="text-gray-600 mb-4">
            Choose a file (PDF, DOCX, TXT, or MD) to upload.
          </p>
          <input
            type="file"
            accept=".pdf,.docx,.txt,.md"
            onChange={testFileInput}
            disabled={loading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50"
          />
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Result</h2>

            {result.error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold">❌ Error</p>
                <p className="text-red-600 mt-2">{result.error}</p>
              </div>
            ) : (
              <div>
                <div className={`border rounded-lg p-4 mb-4 ${
                  result.status === 201 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <p className={`font-semibold ${
                    result.status === 201 ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.status === 201 ? '✅ Success' : '❌ Failed'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Status: {result.status}
                  </p>
                </div>

                {result.data.anchor && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">ID</p>
                      <p className="text-sm text-gray-600 font-mono">{result.data.anchor.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Filename</p>
                      <p className="text-sm text-gray-600">{result.data.anchor.filename}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">File Type</p>
                      <p className="text-sm text-gray-600">{result.data.anchor.fileType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Community</p>
                      <p className="text-sm text-gray-600">{result.data.anchor.communityId}</p>
                    </div>
                    {result.data.anchor.originalUrl && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Original URL</p>
                        <a
                          href={result.data.anchor.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline break-all"
                        >
                          {result.data.anchor.originalUrl}
                        </a>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Markdown Preview</p>
                      <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded border mt-1 overflow-x-auto">
                        {result.data.anchor.contentMarkdown.substring(0, 500)}
                        {result.data.anchor.contentMarkdown.length > 500 && '...'}
                      </pre>
                    </div>
                  </div>
                )}

                {result.data.error && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Error Message</p>
                    <p className="text-sm text-red-600">{result.data.error}</p>
                    {result.data.receivedType && (
                      <p className="text-xs text-gray-500 mt-1">
                        Received type: {result.data.receivedType}
                      </p>
                    )}
                  </div>
                )}

                <details className="mt-4">
                  <summary className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Raw Response
                  </summary>
                  <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded border mt-2 overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
