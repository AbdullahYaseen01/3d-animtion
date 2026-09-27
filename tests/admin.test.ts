import type Stripe from 'stripe'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ADMIN_COOKIE, adminCookieValid, adminCookieValue, passwordsMatch, readCookie } from '../server/adminAuth'
import { isCustomerOrder, toAdminOrder } from '../server/adminOrder'
import { DELETE, POST } from '../server/handlers/adminSession'
import { GET } from '../server/handlers/adminOrders'

const PASSWORD = 'correct-horse'

function sessionRequest(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  if (!headers.has('origin')) headers.set('origin', 'https://nova.test')
  return new Request(`https://nova.test${path}`, { ...init, headers })
}

describe('admin auth', () => {
  afterEach(() => {
    delete process.env.ADMIN_PASSWORD
  })

  it('rejects a short password as unconfigured and accepts a matching one', async () => {
    process.env.ADMIN_PASSWORD = 'short'
    const missing = await POST(sessionRequest('/api/admin/session', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: 'short' }) }))
    expect(missing.status).toBe(503)

    process.env.ADMIN_PASSWORD = PASSWORD
    const wrong = await POST(sessionRequest('/api/admin/session', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: 'wrong-password' }) }))
    expect(wrong.status).toBe(401)

    const ok = await POST(sessionRequest('/api/admin/session', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: PASSWORD }) }))
    expect(ok.status).toBe(204)
    const cookie = ok.headers.get('set-cookie') ?? ''
    expect(cookie).toMatch(/HttpOnly/)
    expect(cookie).toMatch(/SameSite=Strict/)
    const token = readCookie(cookie, ADMIN_COOKIE)
    expect(adminCookieValid(token, PASSWORD)).toBe(true)
    expect(passwordsMatch(PASSWORD, PASSWORD)).toBe(true)
  })

  it('refuses a cross-site login', async () => {
    process.env.ADMIN_PASSWORD = PASSWORD
    const res = await POST(new Request('https://nova.test/api/admin/session', { method: 'POST', headers: { origin: 'https://evil.test', 'content-type': 'application/json' }, body: JSON.stringify({ password: PASSWORD }) }))
    expect(res.status).toBe(403)
  })

  it('clears the cookie on sign-out', () => {
    const res = DELETE(sessionRequest('/api/admin/session', { method: 'DELETE' }))
    expect(res.status).toBe(204)
    expect(res.headers.get('set-cookie')).toMatch(/Max-Age=0/)
  })

  it('rejects an expired cookie', () => {
    const token = adminCookieValue(PASSWORD, Date.now() - 13 * 60 * 60 * 1000)
    expect(adminCookieValid(token, PASSWORD)).toBe(false)
  })
})

describe('admin orders', () => {
  const paid = {
    id: 'cs_test_a1b2c3d4e5f6g7h8',
    created: 1_758_000_000,
    status: 'complete',
    payment_status: 'paid',
    metadata: { source: 'nova-web' },
    amount_subtotal: 11700,
    amount_total: 11700,
    total_details: { amount_shipping: 0, amount_tax: 0, amount_discount: 0 },
    customer_details: { email: 'jordan@example.com', name: 'Jordan Lee', phone: '+15551212', address: null },
    collected_information: { shipping_details: { name: 'Jordan Lee', address: { line1: '1 Main St', city: 'Portland', state: 'OR', postal_code: '97201', country: 'US' } } },
    line_items: { data: [{ description: 'NAVIFORCE NF5053G', quantity: 1, amount_subtotal: 11700, price: { product: { name: 'NAVIFORCE', metadata: { sku: 'NF5053G' } } } }] },
  } as unknown as Stripe.Checkout.Session

  it('keeps the customer email for the owner and ignores other checkouts', () => {
    expect(isCustomerOrder(paid)).toBe(true)
    expect(isCustomerOrder({ ...paid, metadata: { source: 'other' } })).toBe(false)
    expect(isCustomerOrder({ ...paid, status: 'open', payment_status: 'unpaid' })).toBe(false)
    const view = toAdminOrder(paid)
    expect(view.email).toBe('jordan@example.com')
    expect(view.addressLines).toEqual(['1 Main St', 'Portland, OR 97201', 'US'])
    expect(view.lines[0]).toMatchObject({ name: 'NAVIFORCE NF5053G', sku: 'NF5053G', totalCents: 11700 })
    expect(view.status).toBe('paid')
  })

  it('requires a sign-in cookie before calling Stripe', async () => {
    process.env.ADMIN_PASSWORD = PASSWORD
    const res = await GET(sessionRequest('/api/admin/orders'))
    expect(res.status).toBe(401)
    delete process.env.ADMIN_PASSWORD
  })
})

describe('GET /api/admin/orders', () => {
  afterEach(() => {
    vi.doUnmock('../server/stripe.js')
    vi.resetModules()
    delete process.env.ADMIN_PASSWORD
    delete process.env.STRIPE_SECRET_KEY
  })

  it('returns Stripe orders for a valid cookie', async () => {
    process.env.ADMIN_PASSWORD = PASSWORD
    process.env.STRIPE_SECRET_KEY = 'sk_test_dummy'
    vi.resetModules()
    vi.doMock('../server/stripe.js', () => ({
      getStripe: () => ({
        ok: true,
        stripe: {
          checkout: {
            sessions: {
              list: async () => ({
                has_more: false,
                data: [
                  {
                    id: 'cs_test_a1b2c3d4e5f6g7h8',
                    created: 1_758_000_000,
                    status: 'complete',
                    payment_status: 'paid',
                    metadata: { source: 'nova-web' },
                    amount_subtotal: 11700,
                    amount_total: 11700,
                    total_details: { amount_shipping: 0, amount_tax: 0, amount_discount: 0 },
                    customer_details: { email: 'jordan@example.com', name: 'Jordan Lee', phone: null, address: null },
                    collected_information: null,
                    line_items: { data: [] },
                    payment_intent: null,
                  },
                  {
                    id: 'cs_test_open00000000000',
                    created: 1_758_000_100,
                    status: 'open',
                    payment_status: 'unpaid',
                    metadata: { source: 'nova-web' },
                    amount_total: 5000,
                    customer_details: { email: 'abandoned@example.com' },
                  },
                ],
              }),
            },
          },
        },
      }),
    }))
    const { GET: list } = await import('../server/handlers/adminOrders')
    const { adminCookieValue: mint } = await import('../server/adminAuth')
    const res = await list(sessionRequest('/api/admin/orders', { headers: { cookie: `${ADMIN_COOKIE}=${mint(PASSWORD)}` } }))
    expect(res.status).toBe(200)
    const body = (await res.json()) as { orders: { email: string }[] }
    expect(body.orders).toHaveLength(1)
    expect(body.orders[0].email).toBe('jordan@example.com')
    expect(JSON.stringify(body)).not.toMatch(/abandoned@example/)
  })
})
