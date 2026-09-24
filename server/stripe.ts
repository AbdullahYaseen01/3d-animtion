import Stripe from 'stripe'
import { CATALOG_IS_SAMPLE } from '../src/catalog/index.js'
import { env } from './http.js'

export type StripeSetup = { ok: true; stripe: Stripe } | { ok: false; missing: string[]; reason: string }

let cached: { key: string; client: Stripe } | null = null

export function getStripe(): StripeSetup {
  const key = env('STRIPE_SECRET_KEY')
  if (!key) return { ok: false, missing: ['STRIPE_SECRET_KEY'], reason: 'Checkout is not configured yet.' }
  if (key.startsWith('sk_live_') && CATALOG_IS_SAMPLE) {
    return {
      ok: false,
      missing: ['real catalog (CATALOG_IS_SAMPLE is true)'],
      reason: 'Live payments are disabled while the store uses its sample catalog.',
    }
  }
  if (!cached || cached.key !== key) {
    cached = { key, client: new Stripe(key, { maxNetworkRetries: 2, appInfo: { name: 'nova-storefront' } }) }
  }
  return { ok: true, stripe: cached.client }
}
