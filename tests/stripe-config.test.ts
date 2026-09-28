import { afterEach, describe, expect, it } from 'vitest'
import { getStripe } from '../server/stripe'

const original = process.env.STRIPE_SECRET_KEY
afterEach(() => {
  if (original === undefined) delete process.env.STRIPE_SECRET_KEY
  else process.env.STRIPE_SECRET_KEY = original
})

describe('getStripe', () => {
  it('reports the missing key', () => {
    delete process.env.STRIPE_SECRET_KEY
    const s = getStripe()
    expect(s.ok).toBe(false)
    if (!s.ok) expect(s.missing).toEqual(['STRIPE_SECRET_KEY'])
  })

  it('allows live keys once the catalog is the real assortment', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_live_123'
    expect(getStripe().ok).toBe(true)
  })

  it('allows live keys for order reads while the catalog is a sample', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_live_123'
    expect(getStripe({ purpose: 'read' }).ok).toBe(true)
  })

  it('accepts test keys', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123'
    expect(getStripe().ok).toBe(true)
  })
})
