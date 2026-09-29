import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { priceCart } from '../src/commerce/cart'
import { buildSessionParams, cartHash } from '../server/checkoutSession'

const created: { amountCents: number; idempotencyKey: string; metadata: Record<string, string>; successUrl: string }[] = []
const setupState: { ok: boolean } = { ok: true }

vi.mock('../server/polar.js', () => ({
  createCheckout: async (input: { amountCents: number; idempotencyKey: string; metadata: Record<string, string>; successUrl: string }) => {
    if (!setupState.ok) return { ok: false, httpStatus: 503, reason: 'Checkout is not configured yet.', missing: ['POLAR_ACCESS_TOKEN'] }
    created.push(input)
    return { ok: true, url: 'https://buy.polar.sh/checkout/test', id: '11111111-1111-4111-8111-111111111111' }
  },
}))

const { POST } = await import('../server/handlers/checkout')

const SKU = 'ndure-kay-0003-black:black:10:D'
const delivery = {
  fullName: 'Jordan Lee',
  phone: '5035551212',
  house: '12',
  street: 'Main Street',
  city: 'Portland',
  state: 'OR',
  zip: '97201',
  notes: 'Ring the bell',
}
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
    expect(p.line_items?.[0]).toMatchObject({ quantity: 2, price_data: { currency: 'usd', unit_amount: 100, tax_behavior: 'exclusive' } })
    expect(p.line_items?.[0].price_data?.product_data?.metadata).toEqual({ sku: SKU, product_id: 'ndure-kay-0003-black' })
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
    const res = await POST(req({ lines: [{ sku: SKU, quantity: 1 }], attemptId: 'attempt_12345678', delivery }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ url: 'https://buy.polar.sh/checkout/test' })
    expect(created).toHaveLength(1)
    expect(created[0].idempotencyKey).toMatch(/^checkout_attempt_12345678_[0-9a-f]{24}_[0-9a-f]{24}$/)
    expect(created[0].successUrl).toBe('https://nova.test/checkout/success?session_id={CHECKOUT_ID}')
    expect(created[0].metadata.source).toBe('nova-web')
    expect(JSON.parse(created[0].metadata.ship)).toMatchObject({ h: '12', s: 'Main Street', t: 'OR', z: '97201', p: '+1 (503) 555-1212' })
    expect(created[0].amountCents).toBe(100)
  })

  it('refuses checkout until the house, street, city, state, ZIP and phone are present', async () => {
    const res = await POST(req({ lines: [{ sku: SKU, quantity: 1 }], delivery: { ...delivery, house: '', phone: '555' } }))
    expect(res.status).toBe(422)
    const body = (await res.json()) as { fields: { house: string; phone: string } }
    expect(body.fields.house).toMatch(/house or apartment/i)
    expect(body.fields.phone).toMatch(/phone/i)
    expect(created).toHaveLength(0)
  })

  it('accepts a delivery address outside the United States', async () => {
    const res = await POST(req({
      lines: [{ sku: SKU, quantity: 1 }],
      delivery: { ...delivery, country: 'PK', state: 'Punjab', zip: '54000', phone: '+92 300 1234567' },
    }))
    expect(res.status).toBe(200)
    expect(JSON.parse(created.at(-1)!.metadata.ship)).toMatchObject({ k: 'PK', t: 'Punjab', z: '54000', p: '+923001234567' })
  })

  it('never trusts client prices', async () => {
    await POST(req({ lines: [{ sku: SKU, quantity: 1, priceCents: 1, unit_amount: 1 }], attemptId: 'attempt_12345678', delivery }))
    expect(created[0].amountCents).toBe(100)
  })

  it('returns 409 with corrected lines when stock changed', async () => {
    const res = await POST(req({ lines: [{ sku: 'ndure-kay-0004-white:white:10:D', quantity: 1 }, { sku: SKU, quantity: 1 }] }))
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

  it('returns 503 (not a fake success) when Polar is not configured', async () => {
    setupState.ok = false
    const res = await POST(req({ lines: [{ sku: SKU, quantity: 1 }], delivery }))
    expect(res.status).toBe(503)
    expect((await res.json()).code).toBe('checkout_unavailable')
  })
})
