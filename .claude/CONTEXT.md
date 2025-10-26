# Voyager Platform - Context & Vision

## About Isaac (The Creator)

**Personality**: INFP - The Mediator/Healer
- Values authenticity, meaning, and human potential
- Thinks in possibilities and big-picture patterns
- Driven by deeply held values and vision
- Prefers gentle, empathetic collaboration
- Best interactions flow naturally, feel meaningful, respect autonomy

**When working with Isaac:**
- Lead with "why" and meaning, not just "how"
- Explore possibilities before constraints
- Give space for reflection and discovery
- Be authentic and warm, not transactional
- Help connect ideas to deeper purpose

---

## Project Overview
Build a conversational co-learning platform (Voyager) with intelligent mode routing - transforming how people learn, get help, and share expertise.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js v5 (Google + LinkedIn OAuth)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **AI**: OpenAI GPT-4 API
- **Hosting**: Vercel (deployment ready)

## Project Structure
```
ai-career-coach/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── chat/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   └── chat/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   └── ChatMessage.tsx
│   └── ui/
│       ├── Button.tsx
│       └── Navbar.tsx
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   └── openai.ts
├── prisma/
│   └── schema.prisma
├── types/
│   └── next-auth.d.ts
├── .env.local.example
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  accounts      Account[]
  sessions      Session[]
  conversations Conversation[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?  @db.Text
  access_token      String?  @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?  @db.Text
  session_state     String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Conversation {
  id        String    @id @default(cuid())
  userId    String
  title     String    @default("New Conversation")
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages  Message[]
  
  @@index([userId])
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  role           String       // "user" or "assistant"
  content        String       @db.Text
  createdAt      DateTime     @default(now())
  
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  @@index([conversationId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

## Core Files Specifications

### 1. lib/db.ts
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 2. lib/auth.ts
```typescript
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import LinkedInProvider from "next-auth/providers/linkedin"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./db"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: { scope: 'openid profile email' }
      },
      issuer: 'https://www.linkedin.com',
      jwks_endpoint: 'https://www.linkedin.com/oauth/openid/jwks',
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'database',
  },
}
```

### 3. types/next-auth.d.ts
```typescript
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
    }
  }
}
```

### 4. app/api/auth/[...nextauth]/route.ts
```typescript
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

### 5. app/api/chat/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are an expert career coach specializing in the Australian tech industry. You provide:
- Career advice tailored to the Australian job market
- Interview preparation for tech roles in Australia
- Resume and cover letter feedback
- Salary negotiation guidance (in AUD)
- Career progression strategies
- Insights into Australian tech companies and culture

Be encouraging, practical, and specific to the Australian context. Keep responses concise but informative.`

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, conversationId } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
    }

    let conversation
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId, userId: session.user.id },
        include: { 
          messages: { 
            orderBy: { createdAt: 'asc' },
            take: 20 // Limit context window
          } 
        }
      })
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }
    } else {
      const title = message.length > 50 ? message.substring(0, 50) + '...' : message
      conversation = await prisma.conversation.create({
        data: {
          userId: session.user.id,
          title,
        },
        include: { messages: true }
      })
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
      },
    })

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversation.messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
      { role: 'user' as const, content: message }
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    })

    const assistantMessage = completion.choices[0].message.content || 'I apologize, I could not generate a response.'

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: assistantMessage,
      },
    })

    return NextResponse.json({
      message: assistantMessage,
      conversationId: conversation.id,
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
```

### 6. components/chat/ChatInterface.tsx
```typescript
'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import ChatMessage from './ChatMessage'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatInterface() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
      setConversationId(data.conversationId)
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, something went wrong. Please try again.' 
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b bg-white">
        <h1 className="text-xl font-semibold">AI Career Coach</h1>
        <p className="text-sm text-gray-600">Australian Tech Market Specialist</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <h2 className="text-2xl font-bold mb-2">👋 Welcome, {session?.user?.name?.split(' ')[0]}!</h2>
              <p className="mb-4">Ask me anything about your tech career in Australia</p>
              <div className="text-left max-w-md mx-auto space-y-2">
                <p className="text-sm">Try asking about:</p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Interview preparation tips</li>
                  <li>Salary expectations for your role</li>
                  <li>Career progression advice</li>
                  <li>Resume feedback</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg} />
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} className="flex-shrink-0 p-4 border-t bg-white">
        <div className="flex space-x-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about careers, interviews, salaries..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}
```

### 7. components/chat/ChatMessage.tsx
```typescript
interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant'
    content: string
  }
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-4 shadow ${
          message.role === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-900'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}
```

### 8. app/(dashboard)/chat/page.tsx
```typescript
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import ChatInterface from '@/components/chat/ChatInterface'

export default async function ChatPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return <ChatInterface />
}
```

### 9. app/(dashboard)/layout.tsx
```typescript
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
```

### 10. app/(auth)/login/page.tsx
```typescript
'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/chat'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Career Coach</h1>
          <p className="text-gray-600">Australian Tech Market Specialist</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => signIn('google', { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => signIn('linkedin', { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#0077B5] text-white rounded-lg hover:bg-[#006399] transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Continue with LinkedIn
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
```

### 11. app/page.tsx
```typescript
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/chat')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-2xl">
        <h1 className="text-5xl font-bold mb-4">AI Career Coach</h1>
        <p className="text-xl mb-8">Your personal guide to success in the Australian tech market</p>
        <Link 
          href="/login"
          className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </div>
  )
}
```

### 12. app/layout.tsx
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Career Coach - Australian Tech Market',
  description: 'Your personal AI career coach for the Australian tech industry',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

### 13. components/SessionProvider.tsx
```typescript
'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
```

## Environment Variables

Create `.env.local`:
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ai_career_coach"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# LinkedIn OAuth (get from LinkedIn Developer Portal)
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"

# OpenAI
OPENAI_API_KEY="sk-..."
```

## Setup Instructions

1. **Create Next.js Project**:
```bash
npx create-next-app@latest ai-career-coach --typescript --tailwind --app --no-src-dir
cd ai-career-coach
```

2. **Install Dependencies**:
```bash
npm install next-auth @auth/prisma-adapter prisma @prisma/client openai
npm install -D @types/node
```

3. **Initialize Prisma**:
```bash
npx prisma init
```

4. **Setup Database**:
- Update `prisma/schema.prisma` with the schema above
- Run migrations:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. **Configure OAuth**:
- **Google**: https://console.cloud.google.com/apis/credentials
  - Create OAuth 2.0 Client ID
  - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
- **LinkedIn**: https://www.linkedin.com/developers/apps
  - Create app, request OAuth 2.0 scopes: openid, profile, email
  - Authorized redirect URLs: `http://localhost:3000/api/auth/callback/linkedin`

6. **Generate NextAuth Secret**:
```bash
openssl rand -base64 32
```

7. **Run Development Server**:
```bash
npm run dev
```

8. **Deploy to Vercel**:
```bash
npm install -g vercel
vercel
```

## Key Features
- ✅ Google & LinkedIn OAuth authentication
- ✅ Persistent chat conversations in PostgreSQL
- ✅ GPT-4 powered career coaching
- ✅ Australian tech market specialization
- ✅ Clean, responsive UI
- ✅ Session management
- ✅ Protected routes
- ✅ Production-ready architecture

## Next Steps (Post-MVP)
1. Add conversation history sidebar
2. Implement new conversation button
3. Add user profile page
4. Implement usage limits/rate limiting
5. Add Stripe for subscriptions
6. Resume upload functionality
7. Export conversations as PDF
8. Mobile responsive improvements