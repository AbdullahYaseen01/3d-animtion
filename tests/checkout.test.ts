import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { priceCart } from '../src/commerce/cart'
import { buildSessionParams, cartHash } from '../server/checkoutSession'

const created: { params: Record<string, unknown>; opts: Record<string, unknown> }[] = []
const setupState: { ok: boolean } = { ok: true }

vi.mock('../server/stripe.js', () => ({
  getStripe: () =>
    setupState.ok
      ? {
          ok: true,
          stripe: {
            checkout: {
              sessions: {
                create: async (params: Record<string, unknown>, opts: Record<string, unknown>) => {
                  created.push({ params, opts })
                  return { id: 'cs_test_abc', url: 'https://checkout.stripe.com/c/pay/cs_test_abc' }
                },
              },
            },
          },
        }
      : { ok: false, missing: ['STRIPE_SECRET_KEY'], reason: 'Checkout is not configured yet.' },
}))

const { POST } = await import('../server/handlers/checkout')

const SKU = 'stride-runner:chalk-ember:10.5:D'
const req = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('https://nova.test/api/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://nova.test', ...headers },
    body: JSON.stringify(body),
  })

beforeEach(() => {
  created.length = 0
  setupState.ok = true
  vi.spyOn(console, 'log').mockImplementation(() => {})
})
afterEach(() => vi.restoreAllMocks())

describe('buildSessionParams', () => {
  it('builds US-only hosted checkout from catalog prices', async () => {
    const cart = priceCart([{ sku: SKU, quantity: 2 }])
    const p = buildSessionParams(cart, { origin: 'https://nova.test', automaticTax: true, hash: 'h', now: 1000 })
    expect(p.mode).toBe('payment')
    expect(p.line_items?.[0]).toMatchObject({ quantity: 2, price_data: { currency: 'usd', unit_amount: 14500, tax_behavior: 'exclusive' } })
    expect(p.line_items?.[0].price_data?.product_data?.metadata).toEqual({ sku: SKU, product_id: 'stride-runner' })
    expect(p.shipping_address_collection?.allowed_countries).toEqual(['US'])
    expect(p.automatic_tax).toEqual({ enabled: true })
    expect(p.success_url).toBe('https://nova.test/checkout/success?session_id={CHECKOUT_SESSION_ID}')
    expect(p.cancel_url).toBe('https://nova.test/cart?checkout=canceled')
    expect(p.expires_at).toBe(1000 + 3600)
  })

  it('omits product images for non-https origins', () => {
    const p = buildSessionParams(priceCart([{ sku: SKU, quantity: 1 }]), { origin: 'http://localhost:5173', automaticTax: false, hash: 'h' })
    expect(p.line_items?.[0].price_data?.product_data?.images).toBeUndefined()
    expect(p.line_items?.[0].price_data?.tax_behavior).toBeUndefined()
  })

  it('hashes carts independent of line order', async () => {
    const a = await cartHash([{ sku: 'a', quantity: 1 }, { sku: 'b', quantity: 2 }])
    const b = await cartHash([{ sku: 'b', quantity: 2 }, { sku: 'a', quantity: 1 }])
    expect(a).toBe(b)
    expect(a).not.toBe(await cartHash([{ sku: 'a', quantity: 2 }, { sku: 'b', quantity: 2 }]))
  })
})

describe('POST /api/checkout', () => {
  it('creates a session with an idempotency key tied to the attempt and cart', async () => {
    const res = await POST(req({ lines: [{ sku: SKU, quantity: 1 }], attemptId: 'attempt_12345678' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ url: 'https://checkout.stripe.com/c/pay/cs_test_abc' })
    expect(created).toHaveLength(1)
    expect(created[0].opts.idempotencyKey).toMatch(/^checkout_attempt_12345678_[0-9a-f]{24}$/)
  })

  it('never trusts client prices', async () => {
    await POST(req({ lines: [{ sku: SKU, quantity: 1, priceCents: 1, unit_amount: 1 }], attemptId: 'attempt_12345678' }))
    const items = created[0].params.line_items as { price_data: { unit_amount: number } }[]
    expect(items[0].price_data.unit_amount).toBe(14500)
  })

  it('returns 409 with corrected lines when stock changed', async () => {
    const res = await POST(req({ lines: [{ sku: 'stride-runner:carbon:7:D', quantity: 1 }, { sku: SKU, quantity: 1 }] }))
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.lines).toEqual([{ sku: SKU, quantity: 1 }])
    expect(created).toHaveLength(0)
  })

  it('rejects empty carts, bad JSON and cross-site requests', async () => {
    expect((await POST(req({ lines: [] }))).status).toBe(400)
    expect((await POST(new Request('https://nova.test/api/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' }))).status).toBe(400)
    expect((await POST(req({ lines: [{ sku: SKU, quantity: 1 }] }, { origin: 'https://evil.test' }))).status).toBe(403)
  })

  it('returns 503 (not a fake success) when Stripe is not configured', async () => {
    setupState.ok = false
    const res = await POST(req({ lines: [{ sku: SKU, quantity: 1 }] }))
    expect(res.status).toBe(503)
    expect((await res.json()).code).toBe('checkout_unavailable')
  })
})
