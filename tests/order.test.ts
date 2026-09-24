import { describe, expect, it } from 'vitest'
import type Stripe from 'stripe'
import { maskEmail, orderNumber, orderStatus, toOrderView } from '../server/orderView'
import { GET } from '../server/handlers/order'

describe('orderStatus', () => {
  it('is paid only when Stripe reports payment', () => {
    expect(orderStatus({ status: 'complete', payment_status: 'paid' })).toBe('paid')
    expect(orderStatus({ status: 'complete', payment_status: 'unpaid' })).toBe('processing')
    expect(orderStatus({ status: 'complete', payment_status: 'unpaid' }, 'requires_payment_method')).toBe('failed')
    expect(orderStatus({ status: 'open', payment_status: 'unpaid' })).toBe('unpaid')
    expect(orderStatus({ status: 'expired', payment_status: 'unpaid' })).toBe('expired')
  })
})

describe('toOrderView', () => {
  it('exposes only minimal customer data', () => {
    const session = {
      id: 'cs_test_a1b2c3d4e5f6g7h8',
      status: 'complete',
      payment_status: 'paid',
      amount_subtotal: 29000,
      amount_total: 31320,
      total_details: { amount_shipping: 0, amount_tax: 2320, amount_discount: 0 },
      customer_details: { email: 'jordan@example.com', name: 'Jordan Lee', address: { line1: '1 Main St' } },
      collected_information: { shipping_details: { name: 'Jordan Lee', address: { line1: '1 Main St', city: 'Portland', state: 'OR', postal_code: '97201' } } },
    } as unknown as Stripe.Checkout.Session
    const items = [{ description: 'Stride Runner', quantity: 2, amount_subtotal: 29000, price: { product: { name: 'Stride Runner', description: 'Chalk / Ember · US M 10.5', metadata: { sku: 'x' } } } }] as unknown as Stripe.LineItem[]
    const view = toOrderView(session, items)
    expect(view).toMatchObject({ status: 'paid', firstName: 'Jordan', shipTo: 'Portland, OR', totalCents: 31320, taxCents: 2320 })
    expect(view.lines[0]).toMatchObject({ unitCents: 14500, totalCents: 29000 })
    expect(JSON.stringify(view)).not.toMatch(/jordan@example|1 Main St|97201/)
    expect(view.orderNumber).toBe(orderNumber(session.id))
  })

  it('masks emails', () => {
    expect(maskEmail('jordan@example.com')).toBe('j•••••@example.com')
    expect(maskEmail(null)).toBeNull()
  })
})

describe('GET /api/order', () => {
  it('404s on malformed session ids without calling Stripe', async () => {
    const res = await GET(new Request('https://nova.test/api/order?session_id=../../etc'))
    expect(res.status).toBe(404)
    expect(res.headers.get('cache-control')).toBe('no-store')
  })
})
