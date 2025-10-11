import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
})

// Free tier price ID - you'll create this in Stripe dashboard
// For demo: $0/month subscription
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || 'price_free_tier'
