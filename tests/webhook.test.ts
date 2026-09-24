import Stripe from 'stripe'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const SECRET = 'whsec_test_secret'
const piMetadata = new Map<string, Record<string, string>>()
const realStripe = new Stripe('sk_test_dummy')

vi.mock('../server/stripe.js', () => ({
  getStripe: () => ({
    ok: true,
    stripe: {
      webhooks: realStripe.webhooks,
      paymentIntents: {
        retrieve: async (id: string) => ({ id, metadata: piMetadata.get(id) ?? {} }),
        update: async (id: string, p: { metadata: Record<string, string> }) => {
          piMetadata.set(id, { ...(piMetadata.get(id) ?? {}), ...p.metadata })
          return { id }
        },
      },
      checkout: { sessions: { listLineItems: async () => ({ data: [] }) } },
    },
  }),
}))

const { POST } = await import('../server/handlers/stripeWebhook')

function event(type: string, session: Record<string, unknown>) {
  return JSON.stringify({ id: `evt_${Math.random().toString(36).slice(2)}`, object: 'event', type, livemode: false, data: { object: { object: 'checkout.session', ...session } } })
}

async function deliver(payload: string, secret = SECRET) {
  const header = await realStripe.webhooks.generateTestHeaderStringAsync({ payload, secret })
  return POST(new Request('https://nova.test/api/stripe-webhook', { method: 'POST', headers: { 'stripe-signature': header }, body: payload }))
}

const logs: string[] = []
beforeEach(() => {
  process.env.STRIPE_WEBHOOK_SECRET = SECRET
  delete process.env.UPSTASH_REDIS_REST_URL
  piMetadata.clear()
  logs.length = 0
  vi.spyOn(console, 'log').mockImplementation((line: string) => void logs.push(line))
})
afterEach(() => vi.restoreAllMocks())

const paid = { id: 'cs_test_paid123456', payment_status: 'paid', status: 'complete', payment_intent: 'pi_1', amount_total: 14500 }

describe('POST /api/stripe-webhook', () => {
  it('rejects a missing or invalid signature', async () => {
    const payload = event('checkout.session.completed', paid)
    const noSig = await POST(new Request('https://nova.test/api/stripe-webhook', { method: 'POST', body: payload }))
    expect(noSig.status).toBe(400)
    expect((await deliver(payload, 'whsec_wrong')).status).toBe(400)
    expect(piMetadata.size).toBe(0)
  })

  it('fulfills a paid session exactly once across duplicate deliveries', async () => {
    const payload = event('checkout.session.completed', paid)
    expect((await deliver(payload)).status).toBe(200)
    expect((await deliver(payload)).status).toBe(200)
    expect((await deliver(event('checkout.session.async_payment_succeeded', paid))).status).toBe(200)
    expect(logs.filter((l) => l.includes('"order_paid"'))).toHaveLength(1)
    expect(logs.filter((l) => l.includes('"order_duplicate_delivery"'))).toHaveLength(2)
    expect(piMetadata.get('pi_1')?.nova_fulfilled_at).toBeTruthy()
  })

  it('does not fulfill a completed session that is still awaiting payment', async () => {
    await deliver(event('checkout.session.completed', { ...paid, payment_status: 'unpaid' }))
    expect(logs.some((l) => l.includes('"order_awaiting_payment"'))).toBe(true)
    expect(piMetadata.size).toBe(0)
  })

  it('logs no customer data', async () => {
    await deliver(event('checkout.session.completed', { ...paid, customer_details: { email: 'shopper@example.com', name: 'Pat Doe' } }))
    expect(logs.join('\n')).not.toMatch(/shopper@example\.com|Pat Doe/)
  })
})

