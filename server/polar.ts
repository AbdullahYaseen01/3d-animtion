import type { DeliveryDetails } from '../src/commerce/delivery.js'
import { env, logEvent } from './http.js'

const PRODUCT_NAME = 'Westora Style order'
/** Polar's minimum fixed price for USD. */
export const POLAR_MIN_CENTS = 50

export interface PolarAddress {
  line1?: string | null
  line2?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
  country?: string | null
}

export interface PolarCheckout {
  id: string
  url?: string | null
  status: string
  amount?: number | null
  tax_amount?: number | null
  total_amount?: number | null
  discount_amount?: number | null
  currency?: string | null
  customer_email?: string | null
  customer_name?: string | null
  customer_billing_address?: PolarAddress | null
  metadata?: Record<string, string | null> | null
}

export interface PolarOrder {
  id: string
  created_at?: string
  status?: string
  paid?: boolean
  checkout_id?: string | null
  subtotal_amount?: number | null
  discount_amount?: number | null
  tax_amount?: number | null
  total_amount?: number | null
  billing_name?: string | null
  billing_address?: PolarAddress | null
  customer?: { email?: string | null; name?: string | null } | null
  metadata?: Record<string, string | null> | null
}

export interface PolarCheckoutInput {
  amountCents: number
  successUrl: string
  returnUrl: string
  metadata: Record<string, string>
  idempotencyKey: string
  delivery: DeliveryDetails
}

type Fail = { ok: false; reason: string; missing?: string[]; httpStatus: number }

export function polarConfigured(): boolean {
  return Boolean(env('POLAR_ACCESS_TOKEN'))
}

export function polarApiBase(): string {
  return env('POLAR_SERVER') === 'sandbox' ? 'https://sandbox-api.polar.sh/v1' : 'https://api.polar.sh/v1'
}

function allowedCheckoutUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && (parsed.hostname === 'polar.sh' || parsed.hostname.endsWith('.polar.sh'))
  } catch {
    return false
  }
}

let productInflight: Promise<string> | null = null

async function polarFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const access = env('POLAR_ACCESS_TOKEN')
  if (!access) throw new Error('missing_token')
  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${access}`)
  headers.set('Accept', 'application/json')
  if (init.body) headers.set('Content-Type', 'application/json')
  return fetch(`${polarApiBase()}${path}`, { ...init, headers, signal: AbortSignal.timeout(20_000) })
}

function itemsOf(body: unknown): Record<string, unknown>[] {
  if (Array.isArray(body)) return body.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
  if (!body || typeof body !== 'object') return []
  const record = body as { items?: unknown; result?: { items?: unknown } }
  const items = record.items ?? record.result?.items
  return Array.isArray(items) ? items.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object') : []
}

async function findOrCreateProduct(): Promise<string> {
  const listed = await polarFetch('/products/?limit=100')
  if (listed.ok) {
    const existing = itemsOf(await listed.json()).find((item) => item.name === PRODUCT_NAME && typeof item.id === 'string' && !item.is_archived)
    if (existing && typeof existing.id === 'string') return existing.id
  } else if (listed.status !== 404) {
    logEvent('polar_products_list_failed', { status: listed.status })
  }

  const created = await polarFetch('/products/', {
    method: 'POST',
    body: JSON.stringify({
      name: PRODUCT_NAME,
      description: 'Merchandise purchased from the Westora Style store. The receipt lists the items in this order.',
      prices: [{ amount_type: 'fixed', price_amount: 100, price_currency: 'usd' }],
    }),
  })
  if (!created.ok) {
    logEvent('polar_product_create_failed', { status: created.status })
    throw new Error(`product_${created.status}`)
  }
  const product = (await created.json()) as { id?: string }
  if (!product.id) throw new Error('product_missing_id')
  return product.id
}

async function productId(): Promise<string> {
  const configured = env('POLAR_PRODUCT_ID')
  if (configured) return configured
  if (!productInflight) {
    productInflight = findOrCreateProduct().catch((err) => {
      productInflight = null
      throw err
    })
  }
  return productInflight
}

function failure(status: number): Fail {
  if (status === 401 || status === 403) {
    return { ok: false, httpStatus: 503, reason: 'Checkout is not configured yet.', missing: ['POLAR_ACCESS_TOKEN'] }
  }
  return { ok: false, httpStatus: 502, reason: 'We could not start checkout. Please try again in a moment.' }
}

/** Opens a Polar checkout for the server-priced cart total. The price is ad hoc, so one Polar product covers every cart. */
export async function createCheckout(input: PolarCheckoutInput): Promise<{ ok: true; url: string; id: string } | Fail> {
  if (!polarConfigured()) {
    return { ok: false, httpStatus: 503, reason: 'Checkout is not configured yet.', missing: ['POLAR_ACCESS_TOKEN'] }
  }
  if (!Number.isInteger(input.amountCents) || input.amountCents < POLAR_MIN_CENTS) {
    return { ok: false, httpStatus: 400, reason: 'This order is below the minimum charge.' }
  }

  try {
    const id = await productId()
    const res = await polarFetch('/checkouts/', {
      method: 'POST',
      headers: { 'Idempotency-Key': input.idempotencyKey },
      body: JSON.stringify({
        products: [id],
        prices: { [id]: [{ amount_type: 'fixed', price_amount: input.amountCents, price_currency: 'usd' }] },
        success_url: input.successUrl,
        return_url: input.returnUrl,
        metadata: input.metadata,
        customer_name: input.delivery.fullName,
        customer_billing_name: input.delivery.fullName,
        customer_billing_address: {
          country: input.delivery.country,
          line1: input.delivery.street,
          line2: input.delivery.house,
          city: input.delivery.city,
          state: input.delivery.state,
          postal_code: input.delivery.zip,
        },
        require_billing_address: true,
        billing_address_fields: {
          country: 'required',
          state: 'required',
          city: 'required',
          postal_code: 'required',
          line1: 'required',
          line2: 'required',
        },
        allow_discount_codes: false,
      }),
    })
    if (!res.ok) {
      logEvent('polar_checkout_failed', { status: res.status })
      return failure(res.status)
    }
    const checkout = (await res.json()) as PolarCheckout
    if (!checkout.id || !checkout.url || !allowedCheckoutUrl(checkout.url)) {
      logEvent('polar_checkout_failed', { status: 'bad_url' })
      return { ok: false, httpStatus: 502, reason: 'We could not start checkout. Please try again in a moment.' }
    }
    return { ok: true, url: checkout.url, id: checkout.id }
  } catch (err) {
    logEvent('polar_checkout_failed', { status: err instanceof Error ? err.message.slice(0, 40) : 'unknown' })
    return { ok: false, httpStatus: 502, reason: 'We could not start checkout. Please try again in a moment.' }
  }
}

export async function getPolarCheckout(id: string): Promise<PolarCheckout | 'missing' | 'unavailable' | 'error'> {
  if (!polarConfigured()) return 'unavailable'
  try {
    const res = await polarFetch(`/checkouts/${encodeURIComponent(id)}`)
    if (res.status === 404) return 'missing'
    if (!res.ok) {
      logEvent('polar_checkout_read_failed', { status: res.status })
      return res.status === 401 || res.status === 403 ? 'unavailable' : 'error'
    }
    const checkout = (await res.json()) as PolarCheckout
    if (!checkout?.id || checkout.metadata?.source !== 'nova-web') return 'missing'
    return checkout
  } catch {
    logEvent('polar_checkout_read_failed', { status: 'network' })
    return 'error'
  }
}

export async function listPolarOrders(): Promise<{ items: PolarOrder[]; hasMore: boolean } | Fail> {
  if (!polarConfigured()) {
    return { ok: false, httpStatus: 503, reason: 'Polar is not configured yet.', missing: ['POLAR_ACCESS_TOKEN'] }
  }
  try {
    const res = await polarFetch('/orders/?limit=50&sorting=-created_at')
    if (!res.ok) {
      logEvent('polar_orders_failed', { status: res.status })
      return failure(res.status)
    }
    const body = (await res.json()) as { pagination?: { max_page?: number } }
    const items = itemsOf(body) as unknown as PolarOrder[]
    return { items, hasMore: (body.pagination?.max_page ?? 1) > 1 }
  } catch {
    logEvent('polar_orders_failed', { status: 'network' })
    return { ok: false, httpStatus: 502, reason: 'We could not load orders from Polar.' }
  }
}
