/**
 * Test script for Context Anchors upload endpoint
 *
 * Usage: node test-upload.js <file-path>
 * Example: node test-upload.js resume.pdf
 */

const fs = require('fs')
const path = require('path')

async function testUpload(filePath) {
  // Read the file
  const fileBuffer = fs.readFileSync(filePath)
  const fileName = path.basename(filePath)

  // Create form data
  const FormData = require('form-data')
  const form = new FormData()
  form.append('file', fileBuffer, fileName)
  form.append('communityId', 'careersy')

  console.log(`📤 Uploading: ${fileName}`)
  console.log(`📊 Size: ${(fileBuffer.length / 1024).toFixed(2)} KB`)
  console.log('')

  try {
    // Make request (note: you'll need to be authenticated)
    const response = await fetch('http://localhost:3000/api/context-anchors/upload', {
      method: 'POST',
      headers: {
        // You'll need to add your session cookie here
        'Cookie': 'next-auth.session-token=YOUR_SESSION_TOKEN',
      },
      body: form,
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Upload successful!')
      console.log('')
      console.log('📋 Anchor details:')
      console.log(`   ID: ${result.anchor.id}`)
      console.log(`   Filename: ${result.anchor.filename}`)
      console.log(`   Type: ${result.anchor.fileType}`)
      console.log(`   Markdown preview: ${result.anchor.contentMarkdown.substring(0, 100)}...`)
      if (result.anchor.originalUrl) {
        console.log(`   Original URL: ${result.anchor.originalUrl}`)
      }
    } else {
      console.log('❌ Upload failed!')
      console.log('')
      console.log('Error:', result.error)
      if (result.receivedType) {
        console.log('Received type:', result.receivedType)
      }
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message)
  }
}

// Create test markdown file for quick testing
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

fs.writeFileSync('test-resume.md', testMarkdown)
console.log('✅ Created test-resume.md')
console.log('')
console.log('To test the endpoint:')
console.log('1. Log in to http://localhost:3000')
console.log('2. Get your session token from browser DevTools (Application > Cookies > next-auth.session-token)')
console.log('3. Update the Cookie header in this script')
console.log('4. Run: node test-upload.js test-resume.md')
console.log('')
console.log('Or test via browser:')
console.log('1. Open browser console on http://localhost:3000/careersy')
console.log('2. Run this code:')
console.log('')
console.log(`
const file = new File(['${testMarkdown}'], 'test-resume.md', { type: 'text/markdown' })
const formData = new FormData()
formData.append('file', file)
formData.append('communityId', 'careersy')

fetch('/api/context-anchors/upload', {
  method: 'POST',
  body: formData,
  credentials: 'include'
})
.then(r => r.json())
.then(console.log)
`)

// If file path provided, try to upload
if (process.argv[2]) {
  // Note: This won't work without authentication
  // testUpload(process.argv[2])
  console.log('Note: Direct upload requires authentication setup.')
  console.log('Use browser console method above for testing.')
}
