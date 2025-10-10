# Stripe Integration Setup Guide

## Overview

Careersy Wingman now includes Stripe subscription integration! For the demo, we've set up a **$0/month free tier** to showcase the subscription flow without requiring payment.

## Quick Setup (5 minutes)

### 1. Create Stripe Account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Sign up for a free account
3. Activate your account (they'll ask for business details - you can use test mode for demo)

### 2. Get API Keys

1. In Stripe Dashboard, go to **Developers** → **API keys**
2. You'll see two types of keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - Click "Reveal test key"
3. Copy both keys

### 3. Create Free Product & Price

1. In Stripe Dashboard, go to **Product catalog** → **Add product**
2. Fill in:
   - **Name**: Careersy Wingman - Free Tier
   - **Description**: AI-powered career coaching for Australian tech professionals
   - **Pricing**: Recurring
   - **Price**: `0` AUD
   - **Billing period**: Monthly
3. Click **Save product**
4. Copy the **Price ID** (starts with `price_`)

### 4. Set Up Webhook

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL**: `http://localhost:3000/api/stripe/webhook` (for local testing)
4. **Select events to listen to**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

### 5. Update Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Keys
STRIPE_SECRET_KEY="sk_test_..." # Your secret key from step 2
STRIPE_PUBLISHABLE_KEY="pk_test_..." # Your publishable key from step 2
STRIPE_PRICE_ID="price_..." # Your price ID from step 3
STRIPE_WEBHOOK_SECRET="whsec_..." # Your webhook secret from step 4
```

### 6. Restart Your Dev Server

```bash
npm run dev
```

## Testing the Flow

### Complete Subscription Flow

1. **Log out** if you're currently logged in
2. **Navigate to** `http://localhost:3000`
3. **Click "Get Started"** and sign in with Google
4. You'll be **redirected to `/subscribe`** (subscription page)
5. **Click "Start Free Subscription"**
6. You'll be redirected to Stripe Checkout
7. Fill in test card details:
   - **Email**: your-email@example.com
   - **Card number**: `4242 4242 4242 4242`
   - **Expiry**: Any future date (e.g., `12/25`)
   - **CVC**: Any 3 digits (e.g., `123`)
   - **Name**: Your name
8. **Click "Subscribe"**
9. You'll be redirected back to `/chat` with full access!

### Testing Webhooks Locally

For local webhook testing, you'll need to use Stripe CLI:

```bash
# Install Stripe CLI (macOS)
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will give you a new webhook secret starting with `whsec_`. Replace `STRIPE_WEBHOOK_SECRET` in `.env.local` with this value.

## How It Works

### User Flow

1. **New user signs up** → Redirected to `/subscribe`
2. **User clicks subscribe** → Creates Stripe Checkout Session
3. **User completes payment** → Stripe sends webhook
4. **Webhook updates database** → User gets subscription
5. **User redirected to chat** → Full access granted

### Subscription Check

The chat page checks for an active subscription:

```typescript
const hasActiveSubscription = !!user?.stripeSubscriptionId
```

If no subscription → redirect to `/subscribe`

### Database Fields

We added these fields to the User model:

- `stripeCustomerId` - Links user to Stripe customer
- `stripeSubscriptionId` - Active subscription ID
- `stripePriceId` - Current price tier
- `stripeCurrentPeriodEnd` - Subscription expiry date

## Production Deployment

### For Vercel Deployment

1. **Switch to live mode** in Stripe Dashboard (toggle in top-right)
2. **Get live API keys** (start with `pk_live_` and `sk_live_`)
3. **Create live product and price** (same as test mode)
4. **Add webhook** with your production URL: `https://your-domain.com/api/stripe/webhook`
5. **Update environment variables** in Vercel:
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add all `STRIPE_*` variables with live keys

### Webhook Endpoint

Production webhook URL format:
```
https://your-domain.vercel.app/api/stripe/webhook
```

## Pricing Tiers (Future)

To add paid tiers later:

1. Create new products in Stripe (e.g., "Pro - $29/month")
2. Update the subscribe page with multiple pricing options
3. Pass the selected price ID to the checkout API
4. Update chat features based on price tier

Example tiers:
- **Free** ($0) - 10 messages/month
- **Pro** ($29) - Unlimited messages + resume feedback
- **Enterprise** ($99) - Everything + priority support

## Troubleshooting

### "No such price" error
- Make sure `STRIPE_PRICE_ID` in `.env.local` matches your Stripe price ID
- Check you're using test mode keys with test price IDs

### Webhook not firing
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Check webhook secret matches in `.env.local`

### User stuck on subscribe page after payment
- Check webhook is firing (Stripe Dashboard → Developers → Webhooks → Events)
- Check database - is `stripeSubscriptionId` populated?
- Check server logs for webhook errors

### "Unauthorized" after subscribing
- Make sure you're logged in (check session)
- Clear cookies and re-authenticate

## Demo Tips

When demoing to Eli:

1. **Show the subscribe page** - clean UI, clear value prop
2. **Use test mode** - demonstrate the checkout flow
3. **Show test card** - `4242 4242 4242 4242`
4. **Highlight instant access** - after payment, immediate chat access
5. **Mention scalability** - easy to add paid tiers later

## Support

- Stripe Dashboard: [https://dashboard.stripe.com](https://dashboard.stripe.com)
- Stripe Testing: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)
- Stripe API Docs: [https://stripe.com/docs/api](https://stripe.com/docs/api)

---

## Quick Reference: Test Cards

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Auth**: `4000 0025 0000 3155`

**All test cards:**
- **Expiry**: Any future date
- **CVC**: Any 3 digits
- **ZIP**: Any 5 digits

---

You're all set! 🎉
