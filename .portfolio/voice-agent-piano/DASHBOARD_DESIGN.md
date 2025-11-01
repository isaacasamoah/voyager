# Piano Removalist Dashboard - UI/UX Design

**Designer:** Jordan (Design)
**Goal:** Simple, professional dashboard for business owner to track calls and quotes
**Principles:** Progressive disclosure, mobile-first, accessible, clarity over cleverness

---

## Design Philosophy

**This is NOT a flashy SaaS dashboard.**

This is a tool for a small business owner who's probably checking it on their phone between jobs. They need to:
- See recent calls at a glance
- Check quote status (quote sent, booking confirmed, declined)
- Listen to call recordings (quality assurance)
- View quote details (if customer calls back with questions)

**Design priorities:**
1. **Scannable** - find info in <5 seconds
2. **Mobile-first** - works perfectly on phone
3. **Accessible** - WCAG 2.1 AA compliant
4. **Professional** - builds confidence, not playful

---

## Visual Design System

### Color Palette

**Primary:** Deep Blue
- #1E40AF (primary actions, links)
- #3B82F6 (hover states)
- Shows professionalism, trust

**Success:** Green
- #10B981 (booking confirmed, quote accepted)

**Warning:** Amber
- #F59E0B (quote sent, awaiting response)

**Error:** Red
- #EF4444 (call failed, declined booking)

**Neutral:** Gray scale
- #111827 (text, headings)
- #6B7280 (secondary text)
- #F3F4F6 (backgrounds)
- #E5E7EB (borders, dividers)

### Typography

**Font:** Inter (clean, readable, excellent for dashboards)

**Scale:**
- Heading 1: 24px, bold (page titles)
- Heading 2: 20px, semibold (section titles)
- Heading 3: 18px, semibold (card titles)
- Body: 16px, regular (main content)
- Small: 14px, regular (metadata, timestamps)
- Tiny: 12px, medium (labels, badges)

**Line height:** 1.5 (comfortable reading)

### Spacing

**Base unit:** 4px

**Common spacings:**
- xs: 4px (tight elements)
- sm: 8px (within components)
- md: 16px (between elements)
- lg: 24px (between sections)
- xl: 32px (page margins)

### Shadows

**Subtle elevation (cards):**
- box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1)

**Medium elevation (modals, dropdowns):**
- box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1)

---

## Page Structure

### Layout

```
┌────────────────────────────────────────────┐
│  Header (Logo, Nav, User)                  │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  Stats Row (4 metric cards)          │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  Recent Calls Table                  │ │
│  │  ┌────┬────────┬────────┬──────────┐ │ │
│  │  │Row │Customer│Quote   │Status    │ │ │
│  │  ├────┼────────┼────────┼──────────┤ │ │
│  │  │ ...│ ...    │ ...    │ ...      │ │ │
│  │  └────┴────────┴────────┴──────────┘ │ │
│  └──────────────────────────────────────┘ │
│                                            │
└────────────────────────────────────────────┘
```

**Mobile (stacked):**
```
┌─────────────────┐
│  Header         │
├─────────────────┤
│  Stat Card 1    │
│  Stat Card 2    │
│  Stat Card 3    │
│  Stat Card 4    │
├─────────────────┤
│  Call Card 1    │
│  ┌─────────────┐│
│  │ Customer    ││
│  │ Quote: $480 ││
│  │ Status: ●   ││
│  └─────────────┘│
│                 │
│  Call Card 2... │
└─────────────────┘
```

---

## Components

### 1. Header

```
┌────────────────────────────────────────────┐
│  🎹 Elite Piano Movers     Calls  Quotes  │
│                                 John ▼     │
└────────────────────────────────────────────┘
```

**Elements:**
- Logo + company name (left)
- Navigation links (center) - "Calls", "Quotes", "Settings"
- User menu (right) - dropdown with logout

**Mobile:** Hamburger menu for nav

---

### 2. Stats Row (Key Metrics)

Four cards showing high-level metrics:

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Today       │  │  This Week   │  │  Conversion  │  │  Avg Quote   │
│              │  │              │  │              │  │              │
│    12        │  │    47        │  │    34%       │  │   $520       │
│  Calls       │  │  Calls       │  │  Rate        │  │  Value       │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

**Desktop:** 4 columns, equal width
**Mobile:** Stack vertically, full width

**Visual:**
- Large number (24px, bold)
- Small label below (14px, gray)
- Subtle background (#F9FAFB)
- Border: 1px solid #E5E7EB

---

### 3. Recent Calls Table

**Desktop view:**

```
Recent Calls
┌─────────────┬──────────────┬─────────────┬──────────┬────────────┐
│ Time        │ Customer     │ Piano Type  │ Quote    │ Status     │
├─────────────┼──────────────┼─────────────┼──────────┼────────────┤
│ 2:34 PM     │ Sarah Chen   │ Baby Grand  │ $650     │ ● Booked   │
│ 10:15 AM    │ Mike Roberts │ Upright     │ $460     │ ◐ Sent     │
│ Yesterday   │ Emma Wilson  │ Grand       │ $890     │ ○ Declined │
│ 2 days ago  │ James Lee    │ Upright     │ $280     │ ● Booked   │
└─────────────┴──────────────┴─────────────┴──────────┴────────────┘
                                             [View All Calls →]
```

**Columns:**
1. **Time** - Relative time ("2:34 PM", "Yesterday", "2 days ago")
2. **Customer** - Name + phone (hidden on small screens)
3. **Piano Type** - Upright, Baby Grand, Grand
4. **Quote** - Total amount in bold
5. **Status** - Badge with color-coding

**Status badges:**
- 🟢 Booked (green) - customer confirmed booking
- 🟡 Sent (amber) - quote sent, awaiting response
- 🔴 Declined (red) - customer declined
- ⚫ In Progress (gray) - call happening now
- ⚪ Failed (light gray) - call technical failure

**Click row:** Opens call detail modal

**Mobile:** Show as cards instead of table

---

### 4. Call Detail Modal

**Triggered by:** Clicking a row in the calls table

```
┌──────────────────────────────────────────────────┐
│  Call with Sarah Chen                       ✕    │
├──────────────────────────────────────────────────┤
│                                                  │
│  📞 Call Info                                    │
│  ┌────────────────────────────────────────────┐ │
│  │ Date: Nov 1, 2025 at 2:34 PM              │ │
│  │ Duration: 4 min 32 sec                    │ │
│  │ Phone: +61 4XX XXX XXX                    │ │
│  │ Email: sarah.chen@email.com               │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  🎹 Piano Details                                │
│  ┌────────────────────────────────────────────┐ │
│  │ Type: Baby Grand                          │ │
│  │ From: 123 Smith St, Bondi (Ground floor)  │ │
│  │ To: 45 Ocean Ave, Coogee (2nd floor)      │ │
│  │ Distance: 8km                             │ │
│  │ Requested Date: Nov 15, 2025              │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  💰 Quote Breakdown                              │
│  ┌────────────────────────────────────────────┐ │
│  │ Base price (Baby Grand)          $450     │ │
│  │ Distance (8km)                   $0       │ │
│  │ Stairs (2 floors)                $150     │ │
│  │ Urgency (2 weeks)                $0       │ │
│  │ ─────────────────────────────────────     │ │
│  │ Total                            $600     │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  🎧 Recording                                    │
│  ┌────────────────────────────────────────────┐ │
│  │  ▶ Play Recording (4:32)                  │ │
│  │  ──────●────────────────── 1:23 / 4:32    │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  📝 Transcript                                   │
│  ┌────────────────────────────────────────────┐ │
│  │ Agent: "Hi! Thanks for calling Elite      │ │
│  │ Piano Movers. I'm Alex..."                │ │
│  │                                            │ │
│  │ Customer: "Hi, I need to move my baby     │ │
│  │ grand from Bondi to Coogee..."            │ │
│  │                                            │ │
│  │ [Show More ▼]                              │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│                      [Close]                     │
└──────────────────────────────────────────────────┘
```

**Sections:**
1. Call info (date, time, duration, contact)
2. Piano details (type, locations, date)
3. Quote breakdown (itemized pricing)
4. Recording player (standard audio controls)
5. Transcript (collapsible, show first 4-5 lines)

**Mobile:** Same layout, but scrollable

---

### 5. Live Call Indicator

**When call is happening:**

Show prominent banner at top of page:

```
┌────────────────────────────────────────────────┐
│  ●  LIVE CALL  │  John Smith  │  3:45 elapsed  │
│               [View Details]                    │
└────────────────────────────────────────────────┘
```

**Visual:**
- Pulsing red dot (indicates live)
- Customer name
- Elapsed time (updates every second)
- Click to see real-time transcript

**Real-time updates via Server-Sent Events**

---

## Accessibility (WCAG 2.1 AA)

### Color Contrast
- ✅ Text: #111827 on white = 16.4:1 (AAA)
- ✅ Secondary text: #6B7280 on white = 5.2:1 (AA)
- ✅ Status badges: Use both color AND icons (not color alone)

### Keyboard Navigation
- ✅ All interactive elements are focusable
- ✅ Clear focus indicators (2px blue outline)
- ✅ Tab order is logical (top to bottom, left to right)
- ✅ Modal can be closed with Escape key

### Screen Readers
- ✅ Semantic HTML (table for tabular data, button for actions)
- ✅ ARIA labels where needed ("Close modal", "Play recording")
- ✅ Status announced with `aria-live` regions
- ✅ Time formatted for screen readers ("November 1, 2025 at 2:34 PM")

### Focus Management
- ✅ Opening modal moves focus to modal title
- ✅ Closing modal returns focus to trigger element
- ✅ Focus trapped within modal (can't tab out)

---

## Responsive Design

### Breakpoints

- **Mobile:** < 640px (single column)
- **Tablet:** 640px - 1024px (mixed layout)
- **Desktop:** > 1024px (full layout)

### Mobile Considerations

**Calls table becomes cards:**

```
┌─────────────────────────────┐
│  Sarah Chen      ● Booked   │
│  Baby Grand • $650          │
│  Today at 2:34 PM           │
│  [View Details →]           │
└─────────────────────────────┘

┌─────────────────────────────┐
│  Mike Roberts    ◐ Sent     │
│  Upright • $460             │
│  Today at 10:15 AM          │
│  [View Details →]           │
└─────────────────────────────┘
```

**Touch targets:** Minimum 44x44px (Apple HIG)

**Font sizes:** Slightly larger on mobile (18px body)

---

## Micro-interactions

### Hover States
- Table rows: Background lightens (#F9FAFB)
- Buttons: Background darkens slightly
- Links: Underline appears

### Loading States
- Skeleton screens for initial load
- Spinner for actions (update status, load more)

### Transitions
- Smooth, fast (150-200ms)
- Ease-out easing for natural feel
- No animations longer than 300ms (feels sluggish)

### Success/Error Feedback
- Toast notifications (top-right)
- Auto-dismiss after 5 seconds
- Close button for manual dismiss

---

## Empty States

### No Calls Yet

```
┌──────────────────────────────┐
│                              │
│        📞                    │
│                              │
│  No calls yet today          │
│                              │
│  Your AI agent is ready to   │
│  answer! Test it by calling: │
│                              │
│   +61 2 XXXX XXXX            │
│                              │
│  [View Setup Guide]          │
│                              │
└──────────────────────────────┘
```

**Friendly, helpful tone**
**Clear action to take next**

---

## Design Files

**For portfolio/implementation:**
- Figma mockups (optional, but nice to have)
- Screenshot of final build
- Mobile + desktop views

**Tools:**
- Figma (for mockups)
- Tailwind CSS (for implementation)
- shadcn/ui (for component primitives - optional)

---

## Component Priority for Implementation

### Phase 1 (MVP - Must Have)
1. ✅ Header (logo, nav)
2. ✅ Stats row (4 metrics)
3. ✅ Calls table (recent calls)
4. ✅ Call detail modal (full info)
5. ✅ Status badges (booked, sent, declined)

### Phase 2 (Nice to Have)
6. Live call indicator (real-time updates)
7. Recording player (audio playback)
8. Transcript viewer
9. Filters/search (find calls)

### Phase 3 (Future)
10. Quote management (edit, resend)
11. Customer CRM (full contact management)
12. Analytics dashboard (trends, insights)

---

**Ready for Alex to implement.** 🎨

Next: Alex specs the React components and tech stack.

- Jordan
