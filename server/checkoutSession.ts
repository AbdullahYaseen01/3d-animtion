import type Stripe from 'stripe'
import { variantLabel } from '../src/catalog/index.js'
import type { PricedCart } from '../src/commerce/cart.js'
import { store } from '../src/config/store.js'

/** Short stable fingerprint of the validated cart, used in idempotency keys. */
export async function cartHash(lines: { sku: string; quantity: number }[]): Promise<string> {
  const canonical = [...lines]
    .sort((a, b) => a.sku.localeCompare(b.sku))
    .map((l) => `${l.sku}x${l.quantity}`)
    .join('|')
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical))
  return Array.from(new Uint8Array(digest).slice(0, 12), (b) => b.toString(16).padStart(2, '0')).join('')
}

export interface SessionOptions {
  origin: string
  automaticTax: boolean
  hash: string
  /** Seconds since epoch; defaults to now. */
  now?: number
}

const SESSION_TTL_SECONDS = 60 * 60

export function buildSessionParams(cart: PricedCart, opts: SessionOptions): Stripe.Checkout.SessionCreateParams {
  const taxBehavior = opts.automaticTax ? ('exclusive' as const) : undefined
  const httpsOrigin = opts.origin.startsWith('https://')
  const shippingRates = [store.shipping.standard, store.shipping.express].filter((r) => r != null)

  return {
    mode: 'payment',
    line_items: cart.lines.map((l) => ({
      quantity: l.quantity,
      price_data: {
        currency: 'usd',
        unit_amount: l.unitCents,
        tax_behavior: taxBehavior,
        product_data: {
          name: l.product.name,
          description: variantLabel(l.product, l.color, l.size, l.widthCode),
          images: httpsOrigin ? [`${opts.origin}/images/products/${l.color.images[0]}-700.webp`] : undefined,
          metadata: { sku: l.sku, product_id: l.product.id },
        },
      },
    })),
    shipping_address_collection: { allowed_countries: [...store.shipping.allowedCountries] },
    shipping_options: shippingRates.map((r) => ({
      shipping_rate_data: {
        type: 'fixed_amount' as const,
        display_name: r.label,
        fixed_amount: { amount: r.priceCents, currency: 'usd' },
        tax_behavior: taxBehavior,
        delivery_estimate: {
          minimum: { unit: 'business_day' as const, value: r.minBusinessDays + store.shipping.processingBusinessDays },
          maximum: { unit: 'business_day' as const, value: r.maxBusinessDays + store.shipping.processingBusinessDays },
        },
      },
    })),
    automatic_tax: { enabled: opts.automaticTax },
    billing_address_collection: 'auto',
    metadata: { cart_hash: opts.hash, source: 'nova-web' },
    payment_intent_data: { metadata: { cart_hash: opts.hash, source: 'nova-web' } },
    success_url: `${opts.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${opts.origin}/cart?checkout=canceled`,
    expires_at: (opts.now ?? Math.floor(Date.now() / 1000)) + SESSION_TTL_SECONDS,
  }
}

const META_CHUNK = 480

/** Cart lines stored on the Polar checkout. Polar copies this metadata onto the paid order. */
export function packCartMetadata(lines: { sku: string; quantity: number }[], hash: string): Record<string, string> {
  const raw = lines.map((l) => `${l.sku}\t${l.quantity}`).join('\n')
  const parts = Math.max(1, Math.ceil(raw.length / META_CHUNK))
  const count = Math.min(parts, 40)
  const meta: Record<string, string> = { source: 'nova-web', cart_hash: hash, line_parts: String(count) }
  for (let i = 0; i < count; i++) meta[`l${i}`] = raw.slice(i * META_CHUNK, (i + 1) * META_CHUNK)
  return meta
}

export function unpackCartLines(metadata: Record<string, string | null | undefined> | null | undefined): { sku: string; quantity: number }[] {
  if (!metadata) return []
  const n = Number(metadata.line_parts ?? 0)
  if (!Number.isFinite(n) || n <= 0) return []
  let raw = ''
  for (let i = 0; i < Math.min(n, 40); i++) raw += metadata[`l${i}`] ?? ''
  const lines: { sku: string; quantity: number }[] = []
  for (const row of raw.split('\n')) {
    const tab = row.lastIndexOf('\t')
    if (tab <= 0) continue
    const sku = row.slice(0, tab)
    const quantity = Number(row.slice(tab + 1))
    if (!sku || !Number.isInteger(quantity) || quantity <= 0 || quantity > 99) continue
    lines.push({ sku, quantity })
  }
  return lines
}
