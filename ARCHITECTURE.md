# Architecture Overview

## System Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client (Browser)                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  React Components (Next.js App Router)              │    │
│  │  - Landing Page                                      │    │
│  │  - Login Page (OAuth)                                │    │
│  │  - Chat Interface                                    │    │
│  └──────────────┬──────────────────────────────────────┘    │
└─────────────────┼────────────────────────────────────────────┘
                  │ HTTP/HTTPS
┌─────────────────┼────────────────────────────────────────────┐
│                 ▼                                             │
│            Next.js Server                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Routes                                          │   │
│  │  - /api/auth/[...nextauth]  (Authentication)        │   │
│  │  - /api/chat                (Chat endpoint)          │   │
│  └──────────┬──────────────────┬────────────────────────┘   │
└─────────────┼──────────────────┼────────────────────────────┘
              │                  │
              ▼                  ▼
    ┌─────────────────┐  ┌──────────────────┐
    │   PostgreSQL    │  │   OpenAI API     │
    │   (Prisma)      │  │   (GPT-4)        │
    └─────────────────┘  └──────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + NextAuth session
- **UI Components**: Custom components with Tailwind

### Backend
- **API**: Next.js API Routes (serverless functions)
- **Authentication**: NextAuth.js v5
- **Database ORM**: Prisma
- **AI Integration**: OpenAI SDK

### Infrastructure
- **Database**: PostgreSQL
- **Hosting**: Vercel (optimized for Next.js)
- **OAuth Providers**: Google, LinkedIn

## Directory Structure

```
ai-career-coach/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (no auth required)
│   │   ├── login/
│   │   │   └── page.tsx          # Login page with OAuth buttons
│   │   └── layout.tsx            # Auth layout wrapper
│   │
│   ├── (dashboard)/              # Protected route group
│   │   ├── chat/
│   │   │   └── page.tsx          # Main chat interface
│   │   └── layout.tsx            # Dashboard layout with auth guard
│   │
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts      # NextAuth handler
│   │   └── chat/
│   │       └── route.ts          # Chat API endpoint
│   │
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
│
├── components/                   # React components
│   ├── chat/
│   │   ├── ChatInterface.tsx     # Main chat component
│   │   └── ChatMessage.tsx       # Message bubble component
│   └── SessionProvider.tsx       # NextAuth client wrapper
│
├── lib/                          # Utility libraries
│   ├── auth.ts                   # NextAuth configuration
│   ├── db.ts                     # Prisma client instance
│   └── openai.ts                 # OpenAI client & prompts
│
├── prisma/                       # Database schema & migrations
│   └── schema.prisma             # Database schema definition
│
├── types/                        # TypeScript type definitions
│   └── next-auth.d.ts            # NextAuth type extensions
│
└── Configuration files
    ├── next.config.js            # Next.js configuration
    ├── tsconfig.json             # TypeScript configuration
    ├── tailwind.config.ts        # Tailwind CSS configuration
    ├── package.json              # Dependencies & scripts
    └── .env.local                # Environment variables (not committed)
```

## Data Flow

### Authentication Flow

```
1. User clicks "Get Started" → /login
2. User clicks OAuth provider (Google/LinkedIn)
3. NextAuth redirects to provider
4. Provider authenticates & redirects back
5. NextAuth creates session in database
6. User redirected to /chat
```

**Implementation Details:**
- Server-side session validation on protected routes
- Database session storage (not JWT)
- Automatic session refresh
- OAuth token encryption

### Chat Flow

```
1. User types message in ChatInterface
2. Frontend sends POST to /api/chat
   - Body: { message: string, conversationId?: string }
3. API validates session (server-side)
4. API creates/fetches conversation
5. API saves user message to database
6. API calls OpenAI GPT-4 with:
   - System prompt (career coach persona)
   - Last 20 messages (context window)
   - Current user message
7. API receives GPT-4 response
8. API saves assistant message to database
9. API returns { message: string, conversationId: string }
10. Frontend displays assistant message
```

**Error Handling:**
- 401: Session expired → redirect to login
- 404: Conversation not found
- 500: Server error → user-friendly message

## Database Schema

```prisma
User {
  id: String (cuid)
  email: String (unique)
  name: String?
  image: String?
  accounts: Account[]
  sessions: Session[]
  conversations: Conversation[]
}

Account {
  OAuth provider data
  Linked to User
}

Session {
  sessionToken: String (unique)
  expires: DateTime
  Linked to User
}

Conversation {
  id: String (cuid)
  userId: String (indexed)
  title: String
  messages: Message[]
  Linked to User
}

Message {
  id: String (cuid)
  conversationId: String (indexed)
  role: "user" | "assistant"
  content: Text
  createdAt: DateTime
  Linked to Conversation
}
```

### Indexing Strategy
- `Conversation.userId`: Fast user conversation lookups
- `Message.conversationId`: Fast message retrieval per conversation
- `Session.sessionToken`: Fast session validation

### Relationships
- User → Conversations (1:N, cascade delete)
- Conversation → Messages (1:N, cascade delete)
- User → Sessions (1:N, cascade delete)
- User → Accounts (1:N, cascade delete)

## Security Architecture

### Authentication
- **OAuth 2.0**: Industry-standard authentication
- **Session Storage**: Database-backed sessions (not client-side JWT)
- **CSRF Protection**: Built-in via NextAuth
- **Secure Cookies**: HttpOnly, Secure, SameSite

### Authorization
- **Server-Side Guards**: All protected routes check session on server
- **Middleware**: Next.js middleware for route protection
- **API Validation**: Every API call validates session
- **User Isolation**: Users can only access their own data

### Data Protection
- **Environment Variables**: Secrets not in code
- **SQL Injection**: Prevented by Prisma parameterization
- **XSS Prevention**: React auto-escaping
- **Rate Limiting**: (TODO: implement in production)

## API Design

### Authentication API

**Endpoint**: `/api/auth/[...nextauth]`
- Handled by NextAuth.js
- Supports Google & LinkedIn OAuth
- Database session management

### Chat API

**Endpoint**: `POST /api/chat`

**Request:**
```typescript
{
  message: string          // User's message
  conversationId?: string  // Optional: existing conversation
}
```

**Response:**
```typescript
{
  message: string          // AI response
  conversationId: string   // Conversation ID (for followup)
}
```

**Error Responses:**
- 401: `{ error: "Unauthorized" }`
- 400: `{ error: "Invalid message" }`
- 404: `{ error: "Conversation not found" }`
- 500: `{ error: "Failed to process message" }`

## AI Integration

### OpenAI Configuration
- **Model**: GPT-4 Turbo Preview
- **Temperature**: 0.7 (balanced creativity)
- **Max Tokens**: 1000 (concise responses)
- **Context Window**: Last 20 messages

### System Prompt
```
You are an expert career coach specializing in the Australian tech industry.
- Career advice tailored to Australian job market
- Interview preparation for tech roles
- Resume and cover letter feedback
- Salary negotiation guidance (AUD)
- Career progression strategies
- Insights into Australian tech companies

Be encouraging, practical, and specific to Australian context.
Keep responses concise but informative.
```

### Cost Optimization
1. **Context Limiting**: Only last 20 messages sent to API
2. **Max Tokens**: Cap at 1000 tokens per response
3. **Efficient Prompting**: Clear, concise system prompt
4. **Future**: Implement caching for common queries

## Performance Optimizations

### Frontend
- **React Server Components**: Reduce client-side JavaScript
- **Code Splitting**: Automatic via Next.js App Router
- **Image Optimization**: Next.js automatic image optimization
- **CSS Purging**: Tailwind removes unused CSS in production

### Backend
- **Serverless**: Auto-scaling via Vercel
- **Database Connection Pooling**: Prisma built-in
- **Prisma Optimizations**: Indexed queries, limited relations
- **API Route Optimization**: Minimal cold start time

### Database
- **Indexes**: Strategic indexes on foreign keys
- **Query Optimization**: Limit message history to 20
- **Connection Pooling**: Reuse connections
- **Cascade Deletes**: Automatic cleanup

## Deployment Architecture

### Vercel Platform
```
┌─────────────────────────────────────┐
│        Vercel Edge Network          │
│  (CDN + Global Load Balancing)      │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│     Serverless Functions            │
│  - API Routes (auto-scaling)        │
│  - SSR Pages (cached)               │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│    External Services                │
│  - PostgreSQL (managed)             │
│  - OpenAI API                       │
└─────────────────────────────────────┘
```

### Environment Separation
- **Development**: Local PostgreSQL, localhost OAuth
- **Production**: Managed PostgreSQL, production OAuth callbacks

## Scalability Considerations

### Current Architecture (MVP)
- **Users**: 0-10,000
- **Conversations**: ~100,000
- **Messages**: ~1,000,000
- **Cost**: ~$50-200/month

### Future Scaling (10k+ users)
1. **Database**:
   - Add read replicas
   - Implement query caching
   - Archive old conversations

2. **AI**:
   - Implement response caching
   - Add rate limiting per user
   - Consider fine-tuned models

3. **Infrastructure**:
   - Add Redis for session storage
   - Implement CDN for static assets
   - Add monitoring (Sentry, LogRocket)

4. **Features**:
   - Message queuing for AI calls
   - Streaming responses
   - Background job processing

## Monitoring & Observability

### Current Implementation
- Console logging
- Prisma query logging (development)
- Next.js build-time optimization warnings

### Production Recommendations
1. **Error Tracking**: Sentry
2. **Analytics**: Vercel Analytics, PostHog
3. **Performance**: Vercel Speed Insights
4. **Logging**: Structured logging (Pino, Winston)
5. **Uptime**: Vercel monitoring

## Testing Strategy (Future)

### Unit Tests
- Utility functions (lib/)
- Component logic
- API endpoint logic

### Integration Tests
- Database queries
- OpenAI integration
- OAuth flow

### E2E Tests
- Full user journey
- Authentication flow
- Chat interaction

**Tools**: Jest, React Testing Library, Playwright

## Security Best Practices

✅ **Implemented:**
- Environment variable validation
- Server-side authentication
- SQL injection prevention (Prisma)
- XSS prevention (React)
- CSRF protection (NextAuth)
- Secure session storage
- OAuth 2.0 standard

🔄 **Recommended (Production):**
- Rate limiting (per user, per IP)
- Input validation & sanitization
- Content Security Policy headers
- CORS configuration
- Secrets rotation
- Security headers (Helmet.js)
- DDoS protection
- Regular dependency updates

## Maintenance & Operations

### Regular Tasks
- Update dependencies monthly
- Monitor error logs weekly
- Review AI costs weekly
- Database backups (automatic with managed providers)
- Security patches (automated via Dependabot)

### Deployment Process
1. Push to GitHub
2. Vercel auto-deploys preview
3. Review preview deployment
4. Merge to main → auto-deploy production
5. Run `prisma migrate deploy` if schema changed

---

**Last Updated**: October 2025
**Version**: 1.0.0 (MVP)
