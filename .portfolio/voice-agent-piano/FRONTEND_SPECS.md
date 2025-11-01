# Piano Removalist Dashboard - Frontend Implementation Specs

**Engineer:** Alex (Frontend)
**Goal:** Fast, accessible React dashboard with real-time updates
**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Server Components

---

## Tech Stack Decisions

### Framework: Next.js 14 (App Router)

**Why:**
- Server Components reduce client JS bundle
- Built-in API routes (Backend For Frontend pattern)
- Excellent performance (Core Web Vitals)
- Vercel deployment is seamless
- TypeScript support out of the box

**Not using:**
- Create React App (outdated, slow)
- Vite (good, but Next.js gives us more for free)
- Remix (overkill for this project)

### Styling: Tailwind CSS

**Why:**
- Fast development (no context switching)
- Excellent mobile-first utilities
- Small production bundle (purges unused)
- Consistent design system
- Great dark mode support (future)

**Config:**
```js
// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
    },
  },
}
```

### State Management: React Server Components + URL State

**Why:**
- Server Components for data fetching (no loading states needed)
- URL for filters/pagination (shareable, back button works)
- useState for modal state (local UI only)
- No need for Redux/Zustand (overkill)

### Real-time Updates: Server-Sent Events (SSE)

**Why:**
- One-way server → client (perfect for notifications)
- Simpler than WebSockets (HTTP, works everywhere)
- Auto-reconnect built-in
- Falls back gracefully

**Not using:**
- WebSockets (bidirectional not needed)
- Polling (inefficient, delays)

---

## Project Structure

```
piano-voice-agent/
├── app/
│   ├── layout.tsx              # Root layout (header, fonts)
│   ├── page.tsx                # Dashboard page (Server Component)
│   ├── api/
│   │   ├── calls/route.ts      # Proxy to Python backend
│   │   ├── quotes/route.ts     # Proxy to Python backend
│   │   └── events/route.ts     # SSE endpoint for real-time
│   └── globals.css             # Tailwind imports
├── components/
│   ├── dashboard/
│   │   ├── StatsRow.tsx        # 4 metric cards
│   │   ├── CallsTable.tsx      # Recent calls table
│   │   ├── CallCard.tsx        # Mobile card view
│   │   ├── CallDetailModal.tsx # Full call info modal
│   │   └── LiveCallBanner.tsx  # Real-time call indicator
│   ├── ui/
│   │   ├── Badge.tsx           # Status badges (booked, sent, etc.)
│   │   ├── Button.tsx          # Reusable button
│   │   ├── Card.tsx            # Stat/call cards
│   │   └── Modal.tsx           # Base modal component
│   └── Header.tsx              # Logo, nav, user menu
├── lib/
│   ├── api.ts                  # API client (fetch helpers)
│   ├── types.ts                # TypeScript types
│   └── utils.ts                # Helpers (formatDate, formatMoney)
├── public/
│   └── logo.svg                # Company logo
└── package.json
```

---

## TypeScript Types

```typescript
// lib/types.ts

export type PianoType = 'upright' | 'baby_grand' | 'grand' | 'concert_grand';

export type CallStatus =
  | 'in_progress'
  | 'completed'
  | 'booked'
  | 'quote_sent'
  | 'declined'
  | 'failed';

export interface Customer {
  id: string;
  phone_number: string;
  name?: string;
  email?: string;
  created_at: string;
}

export interface Call {
  id: string;
  customer_id: string;
  customer: Customer;
  twilio_call_sid: string;
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
  transcript?: string;
  recording_url?: string;
  status: CallStatus;
  created_at: string;
}

export interface Quote {
  id: string;
  call_id: string;
  customer_id: string;

  // Piano details
  piano_type: PianoType;

  // Location
  origin_address: string;
  origin_floor: number;
  origin_has_elevator: boolean;
  origin_stairs: number;
  destination_address: string;
  destination_floor: number;
  destination_has_elevator: boolean;
  destination_stairs: number;
  distance_km: number;

  // Pricing
  base_price: number;
  distance_charge: number;
  stairs_charge: number;
  urgency_charge: number;
  total_price: number;

  // Booking
  requested_date: string;
  booking_status: 'quote_only' | 'booked' | 'declined';

  created_at: string;
}

export interface CallWithQuote extends Call {
  quote?: Quote;
}

export interface DashboardStats {
  calls_today: number;
  calls_this_week: number;
  conversion_rate: number; // 0-100
  avg_quote_value: number;
}
```

---

## Component Specs

### 1. Dashboard Page (Server Component)

```typescript
// app/page.tsx

import { StatsRow } from '@/components/dashboard/StatsRow';
import { CallsTable } from '@/components/dashboard/CallsTable';

async function getStats(): Promise<DashboardStats> {
  const res = await fetch(`${process.env.BACKEND_URL}/api/stats`, {
    cache: 'no-store', // Always fresh
  });
  return res.json();
}

async function getRecentCalls(): Promise<CallWithQuote[]> {
  const res = await fetch(`${process.env.BACKEND_URL}/api/calls?limit=20`, {
    cache: 'no-store',
  });
  return res.json();
}

export default async function DashboardPage() {
  const [stats, calls] = await Promise.all([
    getStats(),
    getRecentCalls(),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Dashboard
      </h1>

      <StatsRow stats={stats} />

      <CallsTable calls={calls} />
    </main>
  );
}
```

**Performance:**
- Server Component = no client JS for initial render
- Parallel data fetching (Promise.all)
- Target: < 1 second Time to First Byte

---

### 2. StatsRow Component

```typescript
// components/dashboard/StatsRow.tsx

import { DashboardStats } from '@/lib/types';
import { Card } from '@/components/ui/Card';

interface Props {
  stats: DashboardStats;
}

export function StatsRow({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <div className="text-3xl font-bold text-gray-900">
          {stats.calls_today}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          Calls Today
        </div>
      </Card>

      <Card>
        <div className="text-3xl font-bold text-gray-900">
          {stats.calls_this_week}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          This Week
        </div>
      </Card>

      <Card>
        <div className="text-3xl font-bold text-gray-900">
          {stats.conversion_rate.toFixed(0)}%
        </div>
        <div className="text-sm text-gray-600 mt-1">
          Conversion Rate
        </div>
      </Card>

      <Card>
        <div className="text-3xl font-bold text-gray-900">
          ${stats.avg_quote_value.toFixed(0)}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          Avg Quote Value
        </div>
      </Card>
    </div>
  );
}
```

**Responsive:** Grid auto-stacks on mobile

---

### 3. CallsTable Component (Client Component)

```typescript
// components/dashboard/CallsTable.tsx
'use client';

import { useState } from 'react';
import { CallWithQuote } from '@/lib/types';
import { CallDetailModal } from './CallDetailModal';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeTime, formatMoney } from '@/lib/utils';

interface Props {
  calls: CallWithQuote[];
}

export function CallsTable({ calls }: Props) {
  const [selectedCall, setSelectedCall] = useState<CallWithQuote | null>(null);

  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Calls
          </h2>
        </div>

        {/* Desktop: Table */}
        <div className="hidden md:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Piano Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Quote
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {calls.map((call) => (
                <tr
                  key={call.id}
                  onClick={() => setSelectedCall(call)}
                  className="hover:bg-gray-50 cursor-pointer transition"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatRelativeTime(call.started_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {call.customer.name || call.customer.phone_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {call.quote?.piano_type.replace('_', ' ') || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {call.quote ? formatMoney(call.quote.total_price) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Badge status={call.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: Cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {calls.map((call) => (
            <button
              key={call.id}
              onClick={() => setSelectedCall(call)}
              className="w-full px-4 py-4 text-left hover:bg-gray-50"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-gray-900">
                  {call.customer.name || call.customer.phone_number}
                </div>
                <Badge status={call.status} />
              </div>
              <div className="text-sm text-gray-600">
                {call.quote?.piano_type.replace('_', ' ')} • {' '}
                {call.quote ? formatMoney(call.quote.total_price) : 'No quote'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatRelativeTime(call.started_at)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedCall && (
        <CallDetailModal
          call={selectedCall}
          onClose={() => setSelectedCall(null)}
        />
      )}
    </>
  );
}
```

**Key features:**
- Responsive (table on desktop, cards on mobile)
- Click row → open modal
- Hover states
- Client component (needs interactivity)

---

### 4. Badge Component

```typescript
// components/ui/Badge.tsx

import { CallStatus } from '@/lib/types';

interface Props {
  status: CallStatus;
}

const statusConfig: Record<CallStatus, { label: string; color: string }> = {
  in_progress: { label: 'In Progress', color: 'bg-gray-100 text-gray-800' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800' },
  booked: { label: 'Booked', color: 'bg-green-100 text-green-800' },
  quote_sent: { label: 'Sent', color: 'bg-amber-100 text-amber-800' },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-800' },
  failed: { label: 'Failed', color: 'bg-gray-100 text-gray-600' },
};

export function Badge({ status }: Props) {
  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
```

---

### 5. Call Detail Modal

```typescript
// components/dashboard/CallDetailModal.tsx
'use client';

import { CallWithQuote } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { formatDate, formatMoney, formatDuration } from '@/lib/utils';

interface Props {
  call: CallWithQuote;
  onClose: () => void;
}

export function CallDetailModal({ call, onClose }: Props) {
  const { customer, quote } = call;

  return (
    <Modal onClose={onClose} title={`Call with ${customer.name || 'Customer'}`}>
      {/* Call Info */}
      <section className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          📞 Call Info
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium text-gray-900">
              {formatDate(call.started_at)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium text-gray-900">
              {call.duration_seconds ? formatDuration(call.duration_seconds) : '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium text-gray-900">
              {customer.phone_number}
            </span>
          </div>
          {customer.email && (
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-gray-900">
                {customer.email}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Piano Details */}
      {quote && (
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            🎹 Piano Details
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium text-gray-900">
                {quote.piano_type.replace('_', ' ')}
              </span>
            </div>
            <div>
              <div className="text-gray-600 mb-1">From:</div>
              <div className="font-medium text-gray-900">
                {quote.origin_address} (Floor {quote.origin_floor})
              </div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">To:</div>
              <div className="font-medium text-gray-900">
                {quote.destination_address} (Floor {quote.destination_floor})
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Distance:</span>
              <span className="font-medium text-gray-900">
                {quote.distance_km.toFixed(1)}km
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Requested Date:</span>
              <span className="font-medium text-gray-900">
                {formatDate(quote.requested_date)}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Quote Breakdown */}
      {quote && (
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            💰 Quote Breakdown
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Base price ({quote.piano_type.replace('_', ' ')})</span>
              <span className="font-medium text-gray-900">
                {formatMoney(quote.base_price)}
              </span>
            </div>
            {quote.distance_charge > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Distance ({quote.distance_km.toFixed(0)}km)</span>
                <span className="font-medium text-gray-900">
                  {formatMoney(quote.distance_charge)}
                </span>
              </div>
            )}
            {quote.stairs_charge > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Stairs</span>
                <span className="font-medium text-gray-900">
                  {formatMoney(quote.stairs_charge)}
                </span>
              </div>
            )}
            {quote.urgency_charge > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Urgency</span>
                <span className="font-medium text-gray-900">
                  {formatMoney(quote.urgency_charge)}
                </span>
              </div>
            )}
            <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between text-base">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-gray-900">
                {formatMoney(quote.total_price)}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Recording (if available) */}
      {call.recording_url && (
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            🎧 Recording
          </h3>
          <audio
            controls
            src={call.recording_url}
            className="w-full"
          >
            Your browser does not support audio playback.
          </audio>
        </section>
      )}

      {/* Transcript (if available) */}
      {call.transcript && (
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            📝 Transcript
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap">
            {call.transcript}
          </div>
        </section>
      )}
    </Modal>
  );
}
```

---

### 6. Utility Functions

```typescript
// lib/utils.ts

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatMoney(cents: number): string {
  return `$${(cents).toFixed(0)}`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

---

## Performance Optimization

### Core Web Vitals Targets

- **LCP (Largest Contentful Paint):** < 1.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### Optimizations

1. **Server Components** - Reduce client JS bundle
2. **Image Optimization** - next/image (if we add images)
3. **Font Optimization** - next/font for Inter
4. **Code Splitting** - Modal only loads when opened
5. **Caching** - Static assets cached, API fresh

---

## Real-Time Updates (SSE)

```typescript
// app/api/events/route.ts

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send heartbeat every 30s to keep connection alive
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(':heartbeat\n\n'));
      }, 30000);

      // Listen for events from backend
      // (In production, this would connect to Redis pub/sub or similar)
      const eventSource = new EventSource(`${process.env.BACKEND_URL}/api/events`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      eventSource.onerror = () => {
        clearInterval(heartbeat);
        eventSource.close();
        controller.close();
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

```typescript
// components/dashboard/LiveCallBanner.tsx
'use client';

import { useEffect, useState } from 'react';

export function LiveCallBanner() {
  const [liveCall, setLiveCall] = useState<any>(null);

  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'call_started') {
        setLiveCall(data.call);
      } else if (data.type === 'call_ended') {
        setLiveCall(null);
      }
    };

    return () => eventSource.close();
  }, []);

  if (!liveCall) return null;

  return (
    <div className="bg-red-50 border-b border-red-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="font-medium text-red-900">
            LIVE CALL
          </span>
          <span className="text-red-700">
            {liveCall.customer_name || 'Unknown caller'}
          </span>
        </div>
      </div>
    </div>
  );
}
```

---

## Build Commands

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.3.0"
  }
}
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
# Or in production:
# NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Import repo in Vercel
3. Set environment variables
4. Deploy (automatic)

**Build settings:**
- Framework: Next.js
- Build command: `next build`
- Output directory: `.next`

---

## Testing Checklist

### Functionality
- [ ] Stats load correctly
- [ ] Calls table displays data
- [ ] Mobile cards work
- [ ] Click row opens modal
- [ ] Modal shows all info
- [ ] Close modal works (button + ESC + backdrop click)

### Performance
- [ ] Lighthouse score > 90 (all metrics)
- [ ] LCP < 1.5s
- [ ] No CLS (layout shift)
- [ ] Loads fast on 3G

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader announces correctly
- [ ] Color contrast passes

### Responsive
- [ ] Works on mobile (375px width)
- [ ] Works on tablet (768px)
- [ ] Works on desktop (1920px)

---

**Ready to build tomorrow.** ⚡

Kai, want to wrap up with deployment strategy and GitHub setup?

- Alex
