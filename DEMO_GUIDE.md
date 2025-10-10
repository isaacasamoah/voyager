# Careersy Wingman - Demo Guide

## Demo Flow (3-5 minutes max)

### 1. Start with the Problem (15 sec)
"Tech professionals in Australia need personalized career guidance, but it's expensive and hard to access. That's why we built Careersy Wingman..."

### 2. Show the Login & Subscription (30 sec)
- Navigate to `http://localhost:3000`
- Clean, professional landing page
- Click "Get Started"
- Sign in with Google OAuth
- "Sign in with Google in seconds - secure and familiar"
- **NEW: Subscription page appears**
  - "We've integrated Stripe for subscriptions"
  - "$0/month free tier for demo purposes"
  - Click "Start Free Subscription"
  - Use test card: `4242 4242 4242 4242`, any future date, any CVC
  - "In production, we can easily add paid tiers"
  - After subscription → instant access to chat!

### 3. Highlight Key Features (2-3 min)

Walk through the interface:

#### Clean UI
- "ChatGPT-like experience - familiar and easy to use"
- Point out the sidebar, chat area, and input box

#### Ask Real Questions
Pick one or more of these example questions:

**Salary Questions:**
- "What's a competitive salary for a Senior React Developer in Sydney?"
- "What salary should I expect as a mid-level DevOps engineer in Melbourne?"

**Career Advice:**
- "How should I prepare for a tech interview at Atlassian?"
- "What's the best way to transition from frontend to full-stack in Australia?"

**Negotiation:**
- "How do I negotiate a job offer in the Australian tech market?"

**Company Research:**
- "What are the best tech companies to work for in Sydney?"

#### Show AI Response
- Let it answer naturally
- Point out how specific and relevant the Australian context is

#### Conversation History
- Click on the sidebar conversation list
- Show that past conversations persist
- Click on a previous conversation to load it

#### New Chat
- Demo the "+ New Chat" button
- Start a fresh conversation

#### Context Awareness
- Send a follow-up question to the AI
- Show that it remembers the conversation context
- Example: After asking about salaries, follow up with "What about bonuses and equity?"

### 4. Technical Highlights (30 sec)

"Under the hood, this is production-ready:"
- Built on **Next.js 14** - modern, scalable, fast
- **Secure Google OAuth** authentication
- **Stripe subscriptions** - monetization ready
- **PostgreSQL database** for conversation persistence
- **GPT-4o** for fast, accurate, and cost-effective AI responses
- Fully responsive design
- Ready to deploy on Vercel

### 5. Next Steps/Vision (30 sec)

"This is our MVP - ready for initial users to start getting value today."

**Potential Future Features:**
- **Paid tiers** - Pro ($29/mo), Enterprise ($99/mo)
- Resume upload and feedback
- Salary benchmarking with real market data
- Company culture insights
- Interview prep with mock interviews
- Job matching recommendations
- LinkedIn integration

"We can iterate quickly based on user feedback and build exactly what Australian tech professionals need."

**Call to Action:**
- "Ready to get some early users on this?"
- "What do you think? Should we start with beta testing?"

---

## Pro Tips for Recording

- **Practice once** before recording - run through the flow
- **Use real scenarios** - don't just say "testing 123"
- **Slow down** - people talk too fast on Loom
- **Show your face** in the bubble - builds trust
- **Keep it under 5 minutes** - attention spans are short
- **Smile and be enthusiastic** - energy is contagious
- **End with a clear CTA** - make it easy for Eli to say yes

---

## Pre-Demo Checklist

- [ ] **Stripe is configured** (see `STRIPE_SETUP.md` for 5-min setup)
- [ ] **Environment variables** set in `.env.local` (including Stripe keys)
- [ ] Server is running (`npm run dev`)
- [ ] Browser is on `http://localhost:3000`
- [ ] Logged out (to show the full login flow)
- [ ] **Test card ready**: `4242 4242 4242 4242`
- [ ] No other tabs/distractions visible
- [ ] Loom is ready to record
- [ ] Camera and mic tested
- [ ] Questions prepared (pick 2-3 from above)

---

## If Something Goes Wrong

- **AI is slow**: "We're on a free tier API key - production will be faster"
- **Login issues**: Refresh and try again
- **Conversation not loading**: Click "New Chat" and start fresh
- **General tech hiccup**: "This is a live demo on localhost - we'll polish everything before launch"

---

## Good Energy Phrases

- "Check this out..."
- "Notice how..."
- "What's cool here is..."
- "The magic happens when..."
- "This is just the beginning..."

---

Get some rest! You've got this. 🚀
