# Voice Agent - Deployment & GitHub Strategy

**Lead:** Kai (CTO)
**Goal:** Simple, fast deployment for MVP. Clear path to scale.
**Timeline:** Deploy Day 2, polish Day 3

---

## Repository Structure

```
piano-voice-agent/
├── README.md                    # Portfolio-ready README
├── LICENSE
├── .gitignore
├── docs/
│   ├── ARCHITECTURE.md          # System design (from Marcus)
│   ├── CONVERSATIONAL_PROMPT.md # Prompt engineering (from Zara)
│   ├── PRICING_AND_STORIES.md   # Product thinking (from Priya)
│   ├── DASHBOARD_DESIGN.md      # UX design (from Jordan)
│   ├── FRONTEND_SPECS.md        # React implementation (from Alex)
│   ├── SCALE.md                 # 7-figure ARR architecture
│   └── COST_ANALYSIS.md         # OpenAI vs self-hosted
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── models.py            # Database models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── database.py          # DB connection
│   │   └── routers/
│   │       ├── calls.py         # Call endpoints
│   │       ├── quotes.py        # Quote endpoints
│   │       ├── twilio.py        # Twilio webhooks
│   │       └── realtime.py      # OpenAI Realtime integration
│   ├── requirements.txt
│   ├── Dockerfile               # For Railway/Fly.io
│   └── alembic/                 # DB migrations
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── next.config.js
└── docker-compose.yml           # Local development
```

---

## GitHub Setup

### Repository

**Name:** `piano-voice-agent`

**Description:**
> AI voice agent that handles phone calls for piano removal companies. Generates instant, transparent quotes 24/7. Built with Python (FastAPI), OpenAI Realtime API, and Next.js. Portfolio project demonstrating production voice AI + cost optimization strategy for 7-figure ARR scale.

**Topics:**
- `voice-ai`
- `openai-realtime-api`
- `fastapi`
- `nextjs`
- `twilio`
- `conversational-ai`
- `product-thinking`
- `portfolio`

**Visibility:** Public (for job application)

### Branches

**main** - Production-ready code
**develop** - Development branch
**feat/* - Feature branches

**Protection:**
- Require PR reviews (self-approve for solo project, but shows process)
- Require status checks (if we add CI)

---

## Local Development Setup

### Prerequisites

```bash
# Backend
Python 3.11+
PostgreSQL 15+

# Frontend
Node.js 18+
npm or pnpm

# Services
Twilio account (free trial)
OpenAI API key
```

### Quick Start

```bash
# Clone repo
git clone https://github.com/isaac/piano-voice-agent.git
cd piano-voice-agent

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env
cp .env.example .env
# Edit .env with your keys

# Run migrations
alembic upgrade head

# Start backend
uvicorn app.main:app --reload

# Frontend setup (new terminal)
cd frontend
npm install

# Create .env.local
cp .env.local.example .env.local

# Start frontend
npm run dev
```

**Access:**
- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- API docs: http://localhost:8000/docs

---

## Deployment Strategy

### Day 2 (Tomorrow) - MVP Deployment

#### Backend → Railway

**Why Railway:**
- ✅ Simple deployment (git push)
- ✅ PostgreSQL included (no setup)
- ✅ Free tier for testing
- ✅ Auto-HTTPS
- ✅ Environment variables UI

**Steps:**
1. Create Railway account
2. New project → Deploy from GitHub
3. Add PostgreSQL service
4. Set environment variables:
   ```
   TWILIO_ACCOUNT_SID=...
   TWILIO_AUTH_TOKEN=...
   TWILIO_PHONE_NUMBER=...
   OPENAI_API_KEY=...
   DATABASE_URL=${DATABASE_URL}  # Auto-provided by Railway
   ```
5. Deploy (automatic on git push)

**Alternative: Fly.io**
- More control
- Slightly more complex
- Use if Railway has issues

#### Frontend → Vercel

**Why Vercel:**
- ✅ Built for Next.js (zero config)
- ✅ Global CDN (fast everywhere)
- ✅ Automatic SSL
- ✅ Preview deployments (for PRs)
- ✅ Free tier generous

**Steps:**
1. Push to GitHub
2. Import in Vercel
3. Set environment variables:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
   ```
4. Deploy (automatic)

**URL:** `https://piano-voice-agent.vercel.app`

#### Twilio Phone Number

**Setup:**
1. Buy phone number ($1/month)
2. Configure webhook:
   - Voice webhook URL: `https://your-backend.railway.app/webhook/call`
   - Method: POST
3. Test by calling the number

---

### Day 3 - Polish & Documentation

1. **Architecture diagrams** (use Excalidraw or Figma)
   - MVP architecture
   - 7-figure ARR architecture
   - Data flow diagram

2. **README** (portfolio-quality)
   - Demo video (embedded)
   - Problem statement
   - Solution
   - Tech stack
   - Product thinking
   - Scale strategy
   - Cost analysis

3. **Cost analysis spreadsheet**
   - MVP costs (OpenAI Realtime)
   - Scale costs (Live Kit + self-hosted)
   - Break-even calculation
   - ROI projection

---

## Environment Variables

### Backend (.env)

```bash
# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+61412345678

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# App
BACKEND_URL=https://your-backend.railway.app
FRONTEND_URL=https://your-frontend.vercel.app
ENVIRONMENT=production  # or development

# Optional (for monitoring)
SENTRY_DSN=https://...
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
# Or for local dev:
# NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

## Monitoring & Observability (MVP)

### Basic Logging

**Backend (FastAPI):**
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# In route handlers:
logger.info(f"Call started: {call_id}")
logger.error(f"OpenAI error: {error}")
```

**View logs:**
- Railway: Dashboard → Deployments → Logs
- Vercel: Dashboard → Deployment → Logs

### Error Tracking (Optional)

**Sentry (free tier):**
```python
# backend/app/main.py
import sentry_sdk

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    environment=os.getenv("ENVIRONMENT"),
    traces_sample_rate=0.1,
)
```

### Uptime Monitoring

**UptimeRobot (free):**
- Monitor: `https://your-backend.railway.app/health`
- Alert if down > 5 minutes
- Email/SMS notifications

---

## Cost Estimate (MVP)

### Monthly Costs

| Service | Cost | Notes |
|---------|------|-------|
| Twilio Phone Number | $1/month | Base fee |
| Twilio Voice | $0.013/min | ~50 calls/month × 4 min = $2.60 |
| OpenAI Realtime API | $0.15/min | ~50 calls/month × 4 min = $30 |
| Railway (Backend + DB) | $0 - $5 | Free tier, then pay-as-you-go |
| Vercel (Frontend) | $0 | Free tier sufficient |
| **Total** | **~$35-40/month** | For testing/demo |

**At scale (10k calls/month):**
- Twilio: ~$500/month
- OpenAI Realtime: ~$6,000/month
- **Total: ~$6,500/month**

*This is why we'd switch to self-hosted at scale.*

---

## Testing Strategy

### Manual Testing Checklist

**Before deploying:**
- [ ] Backend health check: `GET /health` returns 200
- [ ] Database connection works
- [ ] Twilio webhook receives calls
- [ ] OpenAI Realtime API connects
- [ ] Quote calculation is correct
- [ ] Call saved to database
- [ ] Frontend loads dashboard
- [ ] Frontend fetches calls
- [ ] Modal opens/closes

**After deploying:**
- [ ] Make test call to Twilio number
- [ ] Verify call appears in dashboard
- [ ] Check quote is accurate
- [ ] Listen to recording
- [ ] Check mobile responsiveness

### Automated Testing (Future)

**Backend:**
```python
# pytest
def test_quote_calculation():
    quote = calculate_quote(
        piano_type="upright",
        distance_km=35,
        stairs=2,
        days_until=10,
    )
    assert quote["base_price"] == 280
    assert quote["distance_charge"] == 30
    assert quote["stairs_charge"] == 150
    assert quote["total_price"] == 460
```

**Frontend:**
```typescript
// Playwright or Cypress
test('opens call detail modal', async ({ page }) => {
  await page.goto('/');
  await page.click('table tr:first-child');
  await expect(page.locator('dialog')).toBeVisible();
});
```

---

## Security Checklist

### Backend
- [x] Environment variables (not in code)
- [x] Twilio webhook signature verification
- [x] CORS configured (only allow frontend domain)
- [x] Rate limiting (prevent abuse)
- [x] SQL injection prevention (SQLAlchemy ORM)
- [x] Input validation (Pydantic schemas)

### Frontend
- [x] No API keys in client code
- [x] Environment variables prefixed NEXT_PUBLIC
- [x] HTTPS only (Vercel default)
- [x] CSP headers (Content Security Policy)

### Twilio
- [x] Restrict webhook to known IPs
- [x] Use auth tokens (not exposed)

---

## Backup & Recovery

### Database Backups

**Railway:**
- Automatic daily backups (built-in)
- Manual backup before major changes

**Export:**
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

**Restore:**
```bash
psql $DATABASE_URL < backup_20251101.sql
```

### Code Backups

**GitHub:**
- Main branch protected
- All changes via PR
- Git tags for releases

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests pass locally
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] README updated
- [ ] Demo video recorded

### Deployment
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Database migrated
- [ ] Environment variables set
- [ ] Twilio webhook configured
- [ ] DNS configured (if custom domain)

### Post-Deployment
- [ ] Health check passes
- [ ] Test call successful
- [ ] Dashboard loads
- [ ] Mobile tested
- [ ] Error monitoring active

---

## Demo Video Script

**Length:** 1-2 minutes

**Shots:**
1. **Intro (5s):** "AI Voice Agent for Piano Removalists"
2. **Problem (10s):** Text overlay - "Small businesses lose 30-40% of leads because they can't answer calls 24/7"
3. **Call Demo (45s):**
   - Show phone dialing Twilio number
   - Split screen: audio waveform + dashboard
   - Agent asks questions naturally
   - Customer provides piano details
   - Agent generates quote with breakdown
   - Customer books move
4. **Dashboard (20s):**
   - Show call appearing in real-time
   - Click to view details
   - Show quote breakdown
   - Mobile view
5. **Scale Architecture (15s):**
   - Quick transition to architecture diagram
   - Text: "MVP: $35/month. Scale: $50k/year vs $225k (OpenAI)"
6. **CTA (10s):**
   - GitHub link
   - "Built in 3 days to demonstrate production voice AI + product thinking"

**Tools:**
- Screen recording: OBS or Loom
- Video editing: iMovie or DaVinci Resolve
- Hosting: YouTube (unlisted) → embed in README

---

## README Template

```markdown
# 🎹 Piano Voice Agent

> AI-powered phone agent that handles calls for piano removal companies,
> generating instant, transparent quotes 24/7.

[📹 Watch Demo (2 min)](https://www.youtube.com/...)

## Problem

Piano removal companies lose 30-40% of potential leads because they can't
answer calls in real-time. Customers call 3-4 companies and book with
whoever responds first.

## Solution

An AI voice agent that:
- ✅ Answers calls 24/7 (never miss a lead)
- ✅ Conducts natural conversations (not robotic)
- ✅ Generates accurate quotes in <3 minutes
- ✅ Explains pricing transparently (builds trust)
- ✅ Escalates complex moves to humans (preserves judgment)

## Tech Stack

**Backend (Python):**
- FastAPI (async web framework)
- OpenAI Realtime API (voice conversations)
- Twilio (phone infrastructure)
- PostgreSQL (data persistence)

**Frontend (Next.js):**
- Next.js 14 (App Router, Server Components)
- TypeScript + Tailwind CSS
- Server-Sent Events (real-time updates)

## Product Thinking

This isn't about replacing humans - it's about **elevation over replacement**:

- **Elevates business owner:** Focus on complex moves, not repetitive quotes
- **Educates customer:** Understand pricing factors, make informed decisions
- **Preserves expertise:** Complex moves automatically escalated to humans

## Scale Strategy

### MVP (Current)
- OpenAI Realtime API: ~$0.15/min
- **Cost at 10k calls/month:** ~$6,000/month

### 7-Figure ARR Scale
- Live Kit + self-hosted Whisper/Llama 3.1
- **Cost at 50k calls/month:** ~$4,000-6,000/month
- **Annual savings:** $150k+

[Full cost analysis →](docs/COST_ANALYSIS.md)

## Architecture

[Architecture diagram]

[Scale architecture diagram]

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

## Local Development

[Setup instructions]

## Deployment

- **Backend:** Railway (PostgreSQL + FastAPI)
- **Frontend:** Vercel (Next.js)
- **Phone:** Twilio

## Why I Built This

I'm applying for Senior AI Engineer roles and wanted to demonstrate:

1. **Production AI:** Real OpenAI Realtime API integration, not a toy
2. **Product thinking:** Solve real business problems, not tech for tech's sake
3. **Cost awareness:** MVP fast, but design for scale economics
4. **Full-stack:** Python backend + Next.js frontend
5. **Ship fast:** 3 days from idea to deployed demo

## Built By

Isaac Asamoah | [LinkedIn](https://linkedin.com/in/isaac) | [GitHub](https://github.com/isaac)

Built in 3 days as a portfolio piece for voice AI engineering roles.

---

**Note:** This is a demonstration project. For production use, add:
authentication, payment processing, booking calendar integration,
multi-tenancy, and enhanced error handling.
```

---

## Tomorrow's Build Plan

**Morning (4 hours) - Backend:**
1. FastAPI project setup (30 min)
2. Database models + migrations (45 min)
3. Twilio webhook integration (1 hour)
4. OpenAI Realtime API integration (1.5 hours)
5. Quote calculation logic (30 min)
6. Deploy to Railway (30 min)

**Afternoon (4 hours) - Frontend:**
1. Next.js setup + Tailwind (30 min)
2. Stats row + calls table (1 hour)
3. Call detail modal (1 hour)
4. API integration (45 min)
5. Responsive design polish (45 min)
6. Deploy to Vercel (30 min)

**Evening (2 hours) - Testing:**
1. End-to-end call test (30 min)
2. Bug fixes (1 hour)
3. Demo video recording (30 min)

**Total: 10 hours** (realistic for a focused build day)

---

**Spec complete. Ready to build tomorrow.** 🚀

Isaac, review the specs tonight. Tomorrow we ship.

- Kai
