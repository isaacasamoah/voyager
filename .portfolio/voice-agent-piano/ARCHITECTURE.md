# Voice Agent for Piano Removalists - Architecture

**Project:** AI Phone Agent for Quote Generation
**Timeline:** 3 days
**Goal:** Portfolio piece for Senior AI Engineer application
**Stack:** Python (FastAPI) + Next.js + OpenAI Realtime API

---

## Product Vision

**Problem:** Piano removal companies lose business when they can't answer calls 24/7. Customers want instant quotes, not callbacks.

**Solution:** Voice AI agent that answers calls, gathers information, generates transparent quotes, and captures leads.

**Constitutional Alignment:**
- ✅ Elevates business owner (handles repetitive calls, allows focus on complex jobs)
- ✅ Educates customer (explains pricing factors, builds understanding)
- ❌ Does NOT replace human judgment for complex/risky moves

---

## MVP Architecture (Days 1-2)

### Tech Stack

**Backend (Python):**
- FastAPI (async web framework)
- Twilio (phone number, SIP integration)
- OpenAI Realtime API (voice conversation)
- PostgreSQL (call history, quotes, customer data)
- Pydantic (data validation)
- Redis (optional - session state)

**Frontend (Next.js):**
- Next.js 14 (App Router, Server Components)
- React 18 (UI components)
- Tailwind CSS (styling)
- Server-Sent Events (real-time call updates)
- shadcn/ui (component library - optional)

**Deployment:**
- Backend: Railway or Fly.io (simple, no Kubernetes)
- Frontend: Vercel (seamless Next.js deployment)
- Database: Railway Postgres or Neon
- Phone: Twilio phone number ($1/month + usage)

### Call Flow

```
Customer calls Twilio number
    ↓
Twilio webhook → FastAPI /webhook/call
    ↓
FastAPI initiates OpenAI Realtime API session
    ↓
Conversational agent gathers info:
    - What type of piano? (upright, baby grand, grand)
    - Where are you moving from? (address, stairs, elevator)
    - Where are you moving to? (address, access)
    - When do you need it moved?
    ↓
Agent calculates quote based on:
    - Base price (piano type)
    - Distance (origin → destination)
    - Access challenges (stairs, narrow doorways)
    - Urgency (next-day premium)
    ↓
Agent presents quote with breakdown
    ↓
Agent asks: "Would you like to book?"
    - Yes → Capture details, send confirmation
    - No → "No problem, I'll email you the quote"
    ↓
Save to database (call recording, transcript, quote, status)
    ↓
Real-time update to dashboard
```

### Database Schema

```sql
-- Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Calls
CREATE TABLE calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    twilio_call_sid VARCHAR(255) UNIQUE,
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    duration_seconds INTEGER,
    transcript TEXT,
    recording_url TEXT,
    status VARCHAR(50), -- in_progress, completed, failed
    created_at TIMESTAMP DEFAULT NOW()
);

-- Quotes
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID REFERENCES calls(id),
    customer_id UUID REFERENCES customers(id),

    -- Piano details
    piano_type VARCHAR(50), -- upright, baby_grand, grand

    -- Location
    origin_address TEXT,
    origin_floor INTEGER,
    origin_has_elevator BOOLEAN,
    origin_stairs INTEGER,
    destination_address TEXT,
    destination_floor INTEGER,
    destination_has_elevator BOOLEAN,
    destination_stairs INTEGER,
    distance_km DECIMAL(10,2),

    -- Pricing
    base_price DECIMAL(10,2),
    distance_charge DECIMAL(10,2),
    stairs_charge DECIMAL(10,2),
    urgency_charge DECIMAL(10,2),
    total_price DECIMAL(10,2),

    -- Booking
    requested_date DATE,
    booking_status VARCHAR(50), -- quote_only, booked, declined

    created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

```python
# FastAPI routes

# Twilio webhook - receives incoming call
POST /webhook/call
    - Initiates Realtime API session
    - Returns TwiML response

# Twilio webhook - call status updates
POST /webhook/call-status
    - Updates call record (ended_at, duration)

# Realtime API events
WebSocket /realtime/audio
    - Bidirectional audio streaming
    - OpenAI Realtime API integration

# Dashboard API
GET /api/calls
    - List recent calls (pagination)

GET /api/calls/{call_id}
    - Call details (transcript, quote, recording)

GET /api/quotes
    - List quotes (filter by status, date)

# Real-time updates
GET /api/events
    - Server-Sent Events for live call updates
```

### Environment Variables

```bash
# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# OpenAI
OPENAI_API_KEY=

# Database
DATABASE_URL=postgresql://...

# App
BACKEND_URL=https://your-backend.railway.app
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## 7-Figure ARR Architecture (Day 3 - Documentation Only)

### What Changes at Scale?

**Current MVP costs at 10,000 calls/month:**
- OpenAI Realtime API: ~$0.15/minute average
- Average call: 3-5 minutes
- Monthly cost: $4,500 - $7,500
- Annual: $54k - $90k

**At 7-figure ARR ($1M+):**
- Likely 50,000+ calls/month
- OpenAI cost: $225k - $375k/year
- **Need cost optimization**

### Scaled Architecture

```
                    ┌─────────────────┐
                    │   SIP Trunk     │
                    │  (Twilio/Telnyx)│
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   Live Kit      │
                    │  (SIP → WebRTC) │
                    └────────┬────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
       ┌────────▼───┐  ┌────▼─────┐  ┌──▼──────┐
       │  Whisper   │  │  LLM     │  │ Cartesia│
       │  (STT)     │  │(Self-host│  │ (TTS)   │
       │            │  │ Llama 3) │  │         │
       └────────────┘  └──────────┘  └─────────┘
                             │
                    ┌────────▼────────┐
                    │  Python Apps    │
                    │  (Kubernetes)   │
                    └────────┬────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
       ┌────────▼───┐  ┌────▼─────┐  ┌──▼──────┐
       │ PostgreSQL │  │  Redis   │  │S3/R2    │
       │   (RDS)    │  │ (Session)│  │(Storage)│
       └────────────┘  └──────────┘  └─────────┘
                             │
                    ┌────────▼────────┐
                    │  Observability  │
                    │ Prometheus      │
                    │ Grafana         │
                    │ CloudWatch      │
                    └─────────────────┘
```

### Cost Optimization Strategy

**Self-Hosted LLM (Llama 3.1 70B on AWS):**
- GPU instances: p4d.24xlarge (~$32/hr)
- Or use RunPod/Together AI (cheaper)
- Cost: ~$10k-15k/month (vs $225k OpenAI)
- **Savings: $200k+/year**

**Speech-to-Text:**
- Self-hosted Whisper v3 (fast, accurate)
- Or Deepgram (cost-effective at scale)
- Cost: ~$2k-5k/month

**Text-to-Speech:**
- Cartesia (low-latency, realistic)
- Or ElevenLabs (higher quality, higher cost)
- Cost: ~$3k-8k/month

**Live Kit Infrastructure:**
- Handles SIP, WebRTC, audio routing
- ~$5k-10k/month at scale
- Worth it vs. building custom

**Total at 50k calls/month:**
- MVP (OpenAI): ~$225k/year
- Scaled (Self-hosted): ~$50k-80k/year
- **ROI: $150k+ annual savings**

### Kubernetes Architecture

**Why Kubernetes at scale?**
- Auto-scaling based on call volume
- Rolling deployments (zero downtime)
- Resource management (CPU/GPU efficient)
- Observability integration

**EKS Setup:**
```yaml
# Simplified K8s structure

# Live Kit deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: livekit-server
spec:
  replicas: 3
  # ... Live Kit config

# Python app deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: voice-agent-api
spec:
  replicas: 10  # Auto-scale 5-20 based on load
  # ... FastAPI config

# Whisper STT deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: whisper-stt
spec:
  replicas: 5
  # ... GPU node affinity

# LLM deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: llm-inference
spec:
  replicas: 3  # Each replica = 1 GPU instance
  # ... GPU node affinity, model serving
```

### Observability Stack

**Prometheus (Metrics):**
- Call volume (requests/second)
- Response latency (p50, p95, p99)
- Error rates
- GPU utilization
- Token usage

**Grafana (Dashboards):**
- Real-time call metrics
- Cost tracking (per call, per minute)
- SLA monitoring (uptime, latency)
- Business metrics (quotes generated, conversion rate)

**CloudWatch (AWS Integration):**
- EKS cluster health
- RDS performance
- Auto-scaling triggers
- Alarms (high error rate, high latency)

**Alerts:**
- Error rate > 5%
- Latency p99 > 3 seconds
- GPU utilization > 90%
- Call queue > 100

### Production Considerations

**Error Handling:**
- Fallback to human if AI fails
- Graceful degradation (if LLM slow, use simpler model)
- Retry logic (transient failures)

**Quality Assurance:**
- Call monitoring (random sample review)
- Customer satisfaction tracking
- Quote accuracy validation
- A/B testing (different prompts)

**Security:**
- PCI compliance (if processing payments)
- Call recording consent (legal requirement)
- Data encryption (at rest, in transit)
- GDPR compliance (customer data)

**Scalability Targets:**
- 10,000 concurrent calls
- < 500ms response latency (p95)
- 99.9% uptime
- < 1% error rate

---

## Implementation Timeline

### Day 1 (Today - Spec & Design)
- [x] Architecture design (this doc)
- [ ] Prompt engineering (Zara)
- [ ] Dashboard wireframes (Jordan)
- [ ] Pricing logic (Priya)
- [ ] Component specs (Alex)
- [ ] Deployment plan (Kai)

### Day 2 (Tomorrow - Build)
**Morning (Backend):**
- [ ] FastAPI project setup
- [ ] Twilio integration (webhook, SIP)
- [ ] OpenAI Realtime API integration
- [ ] Database setup (PostgreSQL)
- [ ] Quote calculation logic
- [ ] Deploy to Railway

**Afternoon (Frontend):**
- [ ] Next.js project setup
- [ ] Dashboard UI (call history table)
- [ ] Live call status (SSE)
- [ ] Quote display
- [ ] Deploy to Vercel

**Evening (Testing):**
- [ ] End-to-end call test
- [ ] Demo video recording
- [ ] Bug fixes

### Day 3 (Polish & Docs)
- [ ] Scale architecture documentation
- [ ] Cost analysis spreadsheet
- [ ] Architecture diagrams (Excalidraw/Figma)
- [ ] README with product thinking
- [ ] GitHub repo polish

---

## Success Criteria

**MVP (Day 2):**
- ✅ Working phone number that answers calls
- ✅ Agent gathers piano removal info conversationally
- ✅ Generates accurate quote with transparent breakdown
- ✅ Saves call data to database
- ✅ Dashboard shows call history

**Portfolio (Day 3):**
- ✅ Demo video (1-2 minutes showing call + dashboard)
- ✅ Clean GitHub repo with great README
- ✅ Architecture diagrams (MVP vs Scale)
- ✅ Cost analysis showing 7-figure ARR thinking
- ✅ Product thinking (user stories, business impact)

**Interview Talking Points:**
- "I built this in 3 days to show I can ship fast"
- "Used your stack (Python async, real-time voice)"
- "Designed for scale - here's how I'd optimize for 7-figure ARR"
- "Shows product thinking - not just tech for tech's sake"

---

## Next Steps

Marcus: Create FastAPI boilerplate + DB schema
Zara: Design conversational prompt
Priya: Define pricing logic + user stories
Jordan: Wireframe dashboard
Alex: Plan Next.js components
Kai: Set up GitHub repo + deployment strategy

**Let's build this, Isaac.** 🚀
