# Piano Removalist - Pricing Logic & User Stories

**Designer:** Priya (PM)
**Goal:** Define clear pricing model and understand user jobs-to-be-done
**Focus:** Product thinking, not just technical implementation

---

## User Research (Jobs-to-be-Done)

### Customer's Job-to-be-Done

**When:** I need to move my piano to a new home
**I want to:** Get an accurate price quote quickly
**So I can:** Decide if I can afford professional movers or need to find another solution

**Underlying needs:**
- 🕐 Speed (don't want to wait days for callback)
- 💰 Transparency (understand what I'm paying for)
- 🛡️ Trust (know my piano won't be damaged)
- 📅 Convenience (book when it suits me, even after hours)

**Pain points with current solutions:**
- Call during business hours → voicemail → wait 24-48hrs for callback
- Get vague "we'll need to inspect" → schedule in-person quote → more delays
- Unclear pricing → hidden fees surprise me later
- Small companies = limited availability

**Emotional jobs:**
- Feel confident I'm making a good choice
- Feel respected (my time valued)
- Feel informed (understand the process)
- Reduce anxiety (piano is valuable/sentimental)

### Business Owner's Job-to-be-Done

**When:** A customer calls while I'm on a job
**I want to:** Capture the lead and provide a quote
**So I can:** Not lose business to competitors who answer faster

**Underlying needs:**
- 📈 Capture more leads (available 24/7)
- ⚡ Respond instantly (beat competitors)
- 💪 Focus on skilled work (let AI handle repetitive quotes)
- 📊 Track lead quality (which channels, what conversion)

**Pain points with current solutions:**
- Miss calls while working → lost revenue
- Hire receptionist → expensive, limited hours
- Generic answering service → doesn't understand pianos, can't quote
- Manual follow-up → time-consuming

**Emotional jobs:**
- Feel like I'm not missing opportunities
- Feel professional (quick, consistent service)
- Feel efficient (time used well)
- Feel in control (know what's in pipeline)

### Hiring Manager's Job-to-be-Done

**When:** I'm evaluating candidates for Senior AI Engineer
**I want to:** See evidence they understand production AI AND product thinking
**So I can:** Hire someone who can build real business value, not just cool tech

**Evaluation criteria:**
- ✅ Can they ship fast? (MVP in days, not weeks)
- ✅ Do they understand cost at scale? (not just "use OpenAI for everything")
- ✅ Do they think product-first? (solve user problems, not tech for tech's sake)
- ✅ Can they communicate? (explain decisions clearly)
- ✅ Do they match our stack? (Python, async, Live Kit ecosystem)

---

## Pricing Model

### Philosophy
**Transparent, component-based pricing** - customer understands exactly what they're paying for.

**Not:** "It'll be $500-900, we'll know when we see it"
**Instead:** "$280 base + $30 distance + $150 stairs = $460 total"

### Price Components

#### 1. Base Price (Piano Type)

| Piano Type | Base Price | Rationale |
|------------|-----------|-----------|
| Upright | $280 | Standard move, 2-3 movers, 1-2 hours |
| Baby Grand | $450 | Heavier, needs disassembly, 3 movers, 2-3 hours |
| Grand | $650 | Very heavy, complex disassembly, 3-4 movers, 3-4 hours |
| Concert Grand | Human consult | Too large/valuable for automated quote |

**Includes:**
- Professional moving team (trained for pianos)
- Specialized equipment (dollies, straps, blankets)
- Transit insurance (up to $10k for upright, $25k for grand)
- Basic assembly/disassembly

#### 2. Distance Charges

| Distance | Charge | Rationale |
|----------|--------|-----------|
| 0-20km | Included | Local move, minimal fuel/time |
| 21-50km | $2/km | Moderate distance, typical metro move |
| 51-100km | $3/km | Regional move, more fuel/time |
| 100km+ | Human consult | Long distance, needs route planning |

**Example:**
- 35km move: (35-20) × $2 = $30 distance charge
- 75km move: (50-20) × $2 + (75-50) × $3 = $60 + $75 = $135

#### 3. Access Charges

| Access Challenge | Charge | Rationale |
|------------------|--------|-----------|
| Stairs (per floor) | $75 | Extra time, physical effort, safety equipment |
| Narrow doorway/hallway | $50 | May need to tilt piano, extra maneuvering |
| No elevator (high-rise) | $75/floor | Stairs in apartment building = harder |
| Difficult parking | $100 | Need to use smaller truck or shuttle |
| Crane/hoist required | Human consult | Complex, needs specialized equipment |

**Stairs calculation:**
- Ground → 1st floor = 1 flight = $75
- Ground → 2nd floor = 2 flights = $150
- Etc.

#### 4. Urgency Charges

| Timeframe | Charge | Rationale |
|-----------|--------|-----------|
| Same-day | $250 | Drop everything, rearrange schedule |
| Next-day | $150 | Limited scheduling flexibility |
| Same-week (2-7 days) | $50 | Some schedule adjustment |
| 1-2 weeks | $0 | Standard booking window |
| 2+ weeks | $0 | Plenty of time to schedule |

#### 5. Special Considerations (Optional Add-ons)

| Service | Charge | When Needed |
|---------|--------|-------------|
| Climate control protection | $50 | Extreme heat/cold during move |
| Rain protection | $30 | Wet weather, extra wrapping |
| Extra insurance ($50k+) | $100 | Valuable antiques (human approval needed) |
| Tuning after move | $180 | Customer requests post-move tuning |
| Storage (per week) | $80 | Gap between move-out and move-in |

---

## Quote Calculation Examples

### Example 1: Simple Local Move

**Scenario:**
- Piano: Upright
- Origin: Ground floor, Bondi (easy access)
- Destination: 1st floor (with elevator), Randwick (easy access)
- Distance: 8km
- Timing: 10 days out

**Calculation:**
```
Base (Upright):              $280
Distance (8km, under 20km):  $0
Access (elevator, no stairs): $0
Urgency (10 days):           $0
────────────────────────────
TOTAL:                       $280
```

### Example 2: Moderate Complexity

**Scenario:**
- Piano: Baby Grand
- Origin: Ground floor, Newtown
- Destination: 2nd floor (no elevator), Marrickville
- Distance: 12km
- Timing: 4 days out

**Calculation:**
```
Base (Baby Grand):           $450
Distance (12km, under 20km): $0
Stairs (2 floors):           $150
Urgency (same week):         $50
────────────────────────────
TOTAL:                       $650
```

### Example 3: Complex Move

**Scenario:**
- Piano: Grand
- Origin: 3rd floor (no elevator), Surry Hills
- Destination: Ground floor, Wollongong
- Distance: 85km
- Timing: Tomorrow
- Special: Narrow stairwell

**Calculation:**
```
Base (Grand):                $650
Distance (85km):
  - 21-50km: 30km × $2 =     $60
  - 51-85km: 35km × $3 =     $105
Stairs (3 floors):           $225
Narrow access:               $50
Urgency (next-day):          $150
────────────────────────────
TOTAL:                       $1,240
```

### Example 4: Transfer to Human

**Scenario:**
- Piano: Concert Grand (9ft Steinway)
- Origin: 5th floor (no elevator), historic building
- Destination: Concert hall
- Distance: 120km
- Timing: Specific date required

**Agent Response:**
"You know what [Name], this sounds like a very special piano and a move that needs expert planning. I want to make sure we do this perfectly. Let me have one of our senior movers who specializes in concert grands give you a call within the hour. They'll visit the site and put together a detailed plan. Sound good?"

---

## User Stories

### Epic 1: Get Instant Quote

**As a** customer with a piano to move
**I want to** call and get an instant, accurate quote
**So that** I can make a quick decision without waiting days

**Acceptance Criteria:**
- ✅ Call is answered immediately (AI agent)
- ✅ Conversation feels natural, not robotic
- ✅ Agent gathers all necessary info (piano type, locations, access)
- ✅ Quote is provided within 3 minutes
- ✅ Quote breakdown is transparent (customer understands pricing)
- ✅ Quote is saved and emailed to customer

**Success Metrics:**
- Average call duration: 3-5 minutes
- Quote accuracy: >90% match human-generated quote
- Customer satisfaction: >4.5/5 stars
- Conversion rate: >30% of quotes → bookings

---

### Epic 2: Book Move Immediately

**As a** customer who likes the quote
**I want to** book the move during the same call
**So that** I don't have to call back or wait

**Acceptance Criteria:**
- ✅ Agent offers booking during call
- ✅ Collects necessary info (date, time, contact details)
- ✅ Confirms booking verbally
- ✅ Sends confirmation email immediately
- ✅ Adds booking to company calendar/system

**Success Metrics:**
- Booking completion rate: >80% of customers who say "yes"
- Booking accuracy: 100% (correct date, time, location)
- Calendar integration: Real-time availability check

---

### Epic 3: Understand Pricing

**As a** customer comparing quotes
**I want to** understand why the price is what it is
**So that** I feel confident I'm not being overcharged

**Acceptance Criteria:**
- ✅ Agent explains each component of price
- ✅ Agent clarifies what's included (insurance, equipment, team)
- ✅ Agent compares to DIY risks (damage, injury)
- ✅ Email quote includes itemized breakdown

**Success Metrics:**
- Price objection rate: <20%
- "Seems fair" sentiment: >70% in post-call survey
- Repeat customer rate: >40% (trust built)

---

### Epic 4: 24/7 Availability

**As a** business owner
**I want** the AI agent to answer calls 24/7
**So that** I never miss a lead

**Acceptance Criteria:**
- ✅ Agent answers calls after hours, weekends, holidays
- ✅ Agent captures lead info (name, email, phone)
- ✅ Business owner receives notification of new lead
- ✅ Quotes are logged in CRM/dashboard

**Success Metrics:**
- After-hours lead capture: >50% increase
- Lost call rate: <1% (system reliability)
- Response time: <3 seconds to answer

---

### Epic 5: Escalate Complex Moves

**As a** business owner
**I want** the AI to escalate complex moves to me
**So that** we don't quote something we can't deliver

**Acceptance Criteria:**
- ✅ Agent recognizes complexity triggers (concert grand, crane, etc.)
- ✅ Agent explains why human consult is needed
- ✅ Agent collects contact info for callback
- ✅ Business owner receives escalation notification with details

**Success Metrics:**
- Appropriate escalation rate: 100% of complex moves
- False escalation rate: <5% (agent isn't overly cautious)
- Customer understanding: >90% appreciate need for expert consult

---

## Portfolio Story (For Application)

### Problem Statement

"Piano removal companies lose an estimated 30-40% of potential leads because they can't answer calls in real-time. Customers call 3-4 companies and book with whoever responds first. Meanwhile, business owners are stuck choosing between missing calls or hiring expensive staff who sit idle between calls."

### Solution

"I built an AI voice agent that answers calls 24/7, conducts natural conversations to gather move details, and generates transparent, accurate quotes in under 3 minutes. Complex moves are automatically escalated to human experts."

### Impact

"For the business:
- Capture 100% of inbound leads (vs. 60-70% currently)
- Respond in seconds (vs. hours/days)
- Handle 10x more quote requests without hiring staff
- Focus on high-value work (complex moves, customer relationships)

For the customer:
- Instant quotes (no waiting)
- 24/7 availability
- Transparent pricing (understand what they're paying for)
- Expert fallback (complex moves get human attention)"

### Technical Approach

"MVP uses Twilio + OpenAI Realtime API for fast development. At scale (7-figure ARR, 50k+ calls/month), I'd migrate to Live Kit + self-hosted Whisper/Llama to reduce costs from $225k/year to $50k/year - a $175k annual saving that directly impacts profitability."

### Product Thinking

"This isn't about replacing humans - it's about elevating the business owner to focus on skilled work while AI handles repetitive tasks. The agent educates customers about why piano moving is complex (building trust) and escalates appropriately (preserving human judgment for edge cases)."

---

## Success Metrics (How to Measure)

### Business Metrics
- **Lead capture rate:** % of calls that result in quote
- **Conversion rate:** % of quotes that become bookings
- **Revenue per lead:** Average booking value
- **After-hours leads:** % of quotes generated outside 9-5

### Quality Metrics
- **Quote accuracy:** Agent quote vs. actual final price
- **Customer satisfaction:** Post-call survey rating
- **Escalation appropriateness:** % of escalations that truly needed human
- **Call completion rate:** % of calls that reach quote stage

### Technical Metrics
- **Availability:** % uptime (target: 99.9%)
- **Response time:** Seconds to answer call
- **Call duration:** Average length (target: 3-5 min)
- **Error rate:** % of calls that fail technically

---

**Ready for tomorrow's build.** 📊

Next: Jordan designs dashboard UI, Alex specs frontend components.

- Priya
