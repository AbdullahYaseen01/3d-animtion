import { createHmac } from 'node:crypto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { packCartMetadata, unpackCartLines } from '../server/checkoutSession'
import { polarCheckoutStatus, polarCheckoutToOrderView } from '../server/polarOrder'
import { verifyPolarWebhook } from '../server/polarWebhook'
import { POST } from '../server/handlers/polarWebhook'

const SKU = 'stride-runner:chalk-ember:10.5:D'
const SECRET = `whsec_${Buffer.from('nova-webhook-test-key').toString('base64')}`

function sign(id: string, timestamp: string, body: string, secret = SECRET): string {
  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64')
  return `v1,${createHmac('sha256', key).update(`${id}.${timestamp}.${body}`).digest('base64')}`
}

describe('cart metadata', () => {
  it('round-trips the lines Polar stores on the order', () => {
    const lines = [
      { sku: SKU, quantity: 2 },
      { sku: 'stride-runner:carbon:7:D', quantity: 1 },
    ]
    const meta = packCartMetadata(lines, 'abc')
    expect(meta.source).toBe('nova-web')
    expect(unpackCartLines(meta)).toEqual(lines)
  })
})

describe('Polar order view', () => {
  it('is paid only when the checkout succeeded, and hides the street address', () => {
    const view = polarCheckoutToOrderView({
      id: '11111111-1111-4111-8111-111111111111',
      status: 'succeeded',
      amount: 14500,
      tax_amount: 0,
      total_amount: 14500,
      customer_email: 'jordan@example.com',
      customer_name: 'Jordan Lee',
      customer_billing_address: { line1: '1 Main St', city: 'Portland', state: 'OR', postal_code: '97201', country: 'US' },
      metadata: packCartMetadata([{ sku: SKU, quantity: 1 }], 'h'),
    })
    expect(view.status).toBe('paid')
    expect(view.firstName).toBe('Jordan')
    expect(view.shipTo).toBe('Portland, OR')
    expect(view.lines[0]).toMatchObject({ quantity: 1, unitCents: 14500, totalCents: 14500 })
    expect(view.totalCents).toBe(14500)
    expect(JSON.stringify(view)).not.toMatch(/jordan@example|1 Main St|97201/)
    expect(polarCheckoutStatus('confirmed')).toBe('processing')
    expect(polarCheckoutStatus('open')).toBe('unpaid')
  })
})

describe('verifyPolarWebhook', () => {
  const body = JSON.stringify({ type: 'order.paid' })
  const now = 1_700_000_000
  const headers = { id: 'msg_1', timestamp: String(now), signature: sign('msg_1', String(now), body) }

  it('accepts a current signature and rejects tampering', () => {
    expect(verifyPolarWebhook(body, headers, SECRET, now)).toBe(true)
    expect(verifyPolarWebhook(`${body} `, headers, SECRET, now)).toBe(false)
    expect(verifyPolarWebhook(body, headers, 'other-secret', now)).toBe(false)
    expect(verifyPolarWebhook(body, headers, SECRET, now + 600)).toBe(false)
  })
})

describe('POST /api/polar-webhook', () => {
  afterEach(() => {
    delete process.env.POLAR_WEBHOOK_SECRET
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
    delete process.env.RESEND_API_KEY
    vi.restoreAllMocks()
  })

  it('accepts a signed order.paid event and ignores other events', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    process.env.POLAR_WEBHOOK_SECRET = SECRET
    const payload = JSON.stringify({
      type: 'order.paid',
      data: {
        id: '8f1c1c1c-1111-4111-8111-111111111111',
        checkout_id: '11111111-1111-4111-8111-111111111111',
        status: 'paid',
        paid: true,
        total_amount: 14500,
        metadata: packCartMetadata([{ sku: SKU, quantity: 1 }], 'h'),
      },
    })
    const timestamp = String(Math.floor(Date.now() / 1000))
    const res = await POST(
      new Request('https://nova.test/api/polar-webhook', {
        method: 'POST',
        headers: {
          'webhook-id': 'msg_2',
          'webhook-timestamp': timestamp,
          'webhook-signature': sign('msg_2', timestamp, payload),
          'content-type': 'application/json',
        },
        body: payload,
      }),
    )
    expect(res.status).toBe(200)

    const other = JSON.stringify({ type: 'checkout.updated', data: { id: '11111111-1111-4111-8111-111111111111' } })
    const ignored = await POST(
      new Request('https://nova.test/api/polar-webhook', {
        method: 'POST',
        headers: {
          'webhook-id': 'msg_3',
          'webhook-timestamp': timestamp,
          'webhook-signature': sign('msg_3', timestamp, other),
          'content-type': 'application/json',
        },
        body: other,
      }),
    )
    expect(ignored.status).toBe(200)

    const tampered = await POST(
      new Request('https://nova.test/api/polar-webhook', {
        method: 'POST',
        headers: {
          'webhook-id': 'msg_2',
          'webhook-timestamp': timestamp,
          'webhook-signature': sign('msg_2', timestamp, payload),
          'content-type': 'application/json',
        },
        body: payload.replace('paid', 'open'),
      }),
    )
    expect(tampered.status).toBe(403)
  })

  it('refuses webhooks when the secret is missing', async () => {
    const res = await POST(new Request('https://nova.test/api/polar-webhook', { method: 'POST', body: '{}' }))
    expect(res.status).toBe(503)
  })
})

describe('createCheckout', () => {
  afterEach(() => {
    delete process.env.POLAR_ACCESS_TOKEN
    delete process.env.POLAR_PRODUCT_ID
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('charges the catalog total on an ad hoc Polar price and only returns a polar.sh URL', async () => {
    process.env.POLAR_ACCESS_TOKEN = 'polar_oat_test'
    process.env.POLAR_PRODUCT_ID = '22222222-2222-4222-8222-222222222222'
    const calls: { url: string; init: RequestInit }[] = []
    vi.stubGlobal('fetch', async (url: string, init: RequestInit = {}) => {
      calls.push({ url, init })
      return new Response(JSON.stringify({ id: '11111111-1111-4111-8111-111111111111', url: 'https://buy.polar.sh/checkout/abc', status: 'open' }), {
        status: 201,
        headers: { 'content-type': 'application/json' },
      })
    })
    const { createCheckout } = await import('../server/polar')
    const result = await createCheckout({
      amountCents: 14500,
      successUrl: 'https://nova.test/checkout/success?session_id={CHECKOUT_ID}',
      returnUrl: 'https://nova.test/cart?checkout=canceled',
      metadata: { source: 'nova-web' },
      idempotencyKey: 'checkout_attempt_12345678_abc',
    })
    expect(result).toMatchObject({ ok: true, url: 'https://buy.polar.sh/checkout/abc' })
    const sent = JSON.parse(String(calls[0].init.body)) as { prices: Record<string, { price_amount: number }[]> }
    expect(sent.prices['22222222-2222-4222-8222-222222222222'][0].price_amount).toBe(14500)
    const headers = new Headers(calls[0].init.headers)
    expect(headers.get('Idempotency-Key')).toBe('checkout_attempt_12345678_abc')
    expect(headers.get('Authorization')).toBe('Bearer polar_oat_test')
    expect(calls[0].url).toBe('https://api.polar.sh/v1/checkouts/')
  })

  it('refuses a checkout URL outside polar.sh', async () => {
    process.env.POLAR_ACCESS_TOKEN = 'polar_oat_test'
    process.env.POLAR_PRODUCT_ID = '22222222-2222-4222-8222-222222222222'
    vi.stubGlobal('fetch', async () => new Response(JSON.stringify({ id: '11111111-1111-4111-8111-111111111111', url: 'https://evil.example/pay' }), { status: 201 }))
    const { createCheckout } = await import('../server/polar')
    const result = await createCheckout({
      amountCents: 14500,
      successUrl: 'https://nova.test/checkout/success?session_id={CHECKOUT_ID}',
      returnUrl: 'https://nova.test/cart',
      metadata: { source: 'nova-web' },
      idempotencyKey: 'checkout_attempt_12345678_abc',
    })
    expect(result.ok).toBe(false)
  })

  it('is unavailable without an access token', async () => {
    const { createCheckout } = await import('../server/polar')
    const result = await createCheckout({
      amountCents: 14500,
      successUrl: 'https://nova.test/checkout/success?session_id={CHECKOUT_ID}',
      returnUrl: 'https://nova.test/cart',
      metadata: { source: 'nova-web' },
      idempotencyKey: 'checkout_attempt_12345678_abc',
    })
    expect(result).toMatchObject({ ok: false, httpStatus: 503 })
  })
})
