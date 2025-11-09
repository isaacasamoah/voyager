import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { put } from '@vercel/blob'

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Supported file types
const SUPPORTED_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
  'text/markdown': 'md',
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const communityId = formData.get('communityId') as string | null

    // Validate inputs
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!communityId) {
      return NextResponse.json({ error: 'No communityId provided' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Validate file type
    const fileType = SUPPORTED_TYPES[file.type as keyof typeof SUPPORTED_TYPES]
    if (!fileType) {
      return NextResponse.json(
        {
          error: 'Unsupported file type. Supported formats: PDF, DOCX, TXT, MD',
          receivedType: file.type
        },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parse document to markdown
    let contentMarkdown: string
    try {
      contentMarkdown = await parseDocumentToMarkdown(buffer, fileType)
    } catch (parseError) {
      console.error('Document parsing error:', parseError)
      return NextResponse.json(
        { error: 'Failed to parse document. Please ensure the file is not corrupted.' },
        { status: 400 }
      )
    }

    // Upload original file to Vercel Blob (optional, for backup)
    let originalUrl: string | null = null
    try {
      const blob = await put(`context-anchors/${user.id}/${Date.now()}-${file.name}`, buffer, {
        access: 'public',
        contentType: file.type,
      })
      originalUrl = blob.url
    } catch (blobError) {
      console.error('Blob upload error:', blobError)
      // Continue anyway - we have the markdown content
    }

    // Create ContextAnchor in database
    const anchor = await prisma.contextAnchor.create({
      data: {
        userId: user.id,
        communityId,
        filename: file.name,
        fileType,
        contentMarkdown,
        originalUrl,
      },
    })

    return NextResponse.json({ anchor }, { status: 201 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Parse document buffer to markdown based on file type
 */
async function parseDocumentToMarkdown(
  buffer: Buffer,
  fileType: string
): Promise<string> {
  switch (fileType) {
    case 'pdf':
      return parsePdfToMarkdown(buffer)

    case 'docx':
      return parseDocxToMarkdown(buffer)

    case 'txt':
      return buffer.toString('utf-8')

    case 'md':
      return buffer.toString('utf-8')

    default:
      throw new Error(`Unsupported file type: ${fileType}`)
  }
}

/**
 * Parse PDF to markdown using pdf2json
 */
async function parsePdfToMarkdown(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    // Dynamic import pdf2json
    import('pdf2json').then((module) => {
      const PDFParser = module.default
      const pdfParser = new PDFParser()

      pdfParser.on('pdfParser_dataError', (errData: any) => {
        reject(new Error(errData.parserError))
      })

      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          // Extract text from all pages
          const texts: string[] = []

          if (pdfData.Pages) {
            pdfData.Pages.forEach((page: any) => {
              if (page.Texts) {
                page.Texts.forEach((text: any) => {
                  if (text.R) {
                    text.R.forEach((run: any) => {
                      if (run.T) {
                        texts.push(decodeURIComponent(run.T))
                      }
                    })
                  }
                })
              }
            })
          }

          let markdown = texts.join(' ')

          // Clean up
          markdown = markdown
            .replace(/\s+/g, ' ') // Normalize spaces
            .replace(/\n{3,}/g, '\n\n') // Collapse multiple newlines
            .trim()

          resolve(markdown)
        } catch (error) {
          reject(error)
        }
      })

      // Parse the buffer
      pdfParser.parseBuffer(buffer)
    }).catch(reject)
  })
}

/**
 * Parse DOCX to markdown (via HTML conversion)
 */
async function parseDocxToMarkdown(buffer: Buffer): Promise<string> {
  // Dynamic imports to avoid Next.js build issues
  const mammoth = (await import('mammoth')).default
  const TurndownService = (await import('turndown')).default

  // Convert DOCX to HTML
  const result = await mammoth.convertToHtml({ buffer })

  // Convert HTML to Markdown
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  })

  const markdown = turndownService.turndown(result.value).trim()

  // Log any warnings from mammoth
  if (result.messages.length > 0) {
    console.warn('Mammoth conversion warnings:', result.messages)
  }

  return markdown
}
