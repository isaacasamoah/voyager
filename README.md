# AI Career Coach - Australian Tech Market

A production-ready AI-powered career coaching application built with Next.js 14, focused on the Australian tech market.

## Features

✅ **Authentication**: Google & LinkedIn OAuth via NextAuth.js
✅ **AI Chat**: GPT-4 powered career coaching
✅ **Persistent Storage**: PostgreSQL with Prisma ORM
✅ **Protected Routes**: Server-side authentication guards
✅ **Responsive UI**: Tailwind CSS with clean, modern design
✅ **Production Ready**: Optimized for Vercel deployment

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma
- **Auth**: NextAuth.js v5 (Google + LinkedIn OAuth)
- **AI**: OpenAI GPT-4 API
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key
- Google OAuth credentials
- LinkedIn OAuth credentials

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Create a PostgreSQL database and update your connection string:

```bash
# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your database credentials
DATABASE_URL="postgresql://user:password@localhost:5432/ai_career_coach"
```

Run migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Configure OAuth Providers

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret to `.env.local`

#### LinkedIn OAuth
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Create new app with OAuth 2.0 scopes: `openid`, `profile`, `email`
3. Add redirect URL: `http://localhost:3000/api/auth/callback/linkedin`
4. Copy Client ID and Secret to `.env.local`

### 4. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Add to `.env.local`:
```
NEXTAUTH_SECRET="your-generated-secret"
```

### 5. Add OpenAI API Key

Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY="sk-..."
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Complete `.env.local` template:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ai_career_coach"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# LinkedIn OAuth
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"

# OpenAI
OPENAI_API_KEY="sk-..."
```

## Project Structure

```
├── app/
│   ├── (auth)/              # Auth pages (login)
│   ├── (dashboard)/         # Protected pages (chat)
│   ├── api/                 # API routes
│   │   ├── auth/           # NextAuth endpoints
│   │   └── chat/           # Chat API
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/
│   ├── chat/               # Chat UI components
│   └── SessionProvider.tsx # Auth session provider
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   ├── db.ts               # Prisma client
│   └── openai.ts           # OpenAI client & prompts
├── prisma/
│   └── schema.prisma       # Database schema
└── types/
    └── next-auth.d.ts      # TypeScript definitions
```

## Deployment to Vercel

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Setup Database

Use a managed PostgreSQL service:
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Neon](https://neon.tech/)
- [Supabase](https://supabase.com/)
- [Railway](https://railway.app/)

### 3. Configure Environment Variables

In Vercel dashboard, add all environment variables from `.env.local`

Update OAuth redirect URLs to production domain:
- Google: `https://your-domain.vercel.app/api/auth/callback/google`
- LinkedIn: `https://your-domain.vercel.app/api/auth/callback/linkedin`

### 4. Deploy

```bash
vercel
```

### 5. Run Migrations on Production

```bash
npx prisma migrate deploy
```

## Database Management

```bash
# Open Prisma Studio (GUI for database)
npx prisma studio

# Create new migration
npx prisma migrate dev --name your_migration_name

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# Generate Prisma Client after schema changes
npx prisma generate
```

## Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Database GUI
npx prisma studio
```

## Key Features Implementation

### Authentication Flow
1. User visits `/` → redirected to `/chat` if authenticated, else sees landing page
2. Click "Get Started" → `/login` with OAuth options
3. After OAuth → redirect to `/chat`
4. Protected routes use server-side session checks

### Chat System
- Messages stored in PostgreSQL with conversation threading
- Context window limited to last 20 messages per conversation
- GPT-4 with Australian tech market system prompt
- Real-time UI updates with optimistic rendering

### Security
- Server-side authentication guards
- Database session storage
- OAuth token encryption
- Environment variable validation
- CSRF protection via NextAuth

## Best Practices Implemented

✅ **Type Safety**: Full TypeScript coverage
✅ **Error Handling**: Try-catch blocks with user-friendly messages
✅ **Database Optimization**: Indexed queries, connection pooling
✅ **Security**: Environment validation, secure session storage
✅ **UX**: Loading states, optimistic updates, auto-scroll
✅ **Code Organization**: Modular structure, separation of concerns
✅ **Production Ready**: Logging, error boundaries, build optimization

## Future Enhancements

- [ ] Conversation history sidebar
- [ ] New conversation button
- [ ] User profile page with usage stats
- [ ] Rate limiting & usage quotas
- [ ] Stripe integration for subscriptions
- [ ] Resume upload & parsing
- [ ] Export conversations as PDF
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Admin dashboard

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
npx prisma db pull

# Reset if needed
npx prisma migrate reset
```

### OAuth Errors
- Verify redirect URIs match exactly (http vs https)
- Check OAuth scopes are approved
- Ensure credentials are correct in `.env.local`

### Build Errors
```bash
# Clear cache
rm -rf .next
npm run build
```

## Support

For issues or questions:
1. Check existing [GitHub Issues](https://github.com/yourusername/ai-career-coach/issues)
2. Review [Next.js Documentation](https://nextjs.org/docs)
3. Check [NextAuth.js Docs](https://next-auth.js.org)

## License

MIT License - feel free to use for personal or commercial projects.

---

Built with ❤️ for the Australian tech community
