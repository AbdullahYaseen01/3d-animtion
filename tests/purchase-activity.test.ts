import { describe, expect, it } from 'vitest'
import { allProducts, buildSku, getProduct } from '../src/catalog'
import { purchaseSentence, purchasesFromOrder, regionFromShipTo, relativeAgo } from '../src/commerce/purchaseActivity'
import { samplePurchaseFor, samplePurchases } from '../src/commerce/samplePurchases'

describe('confirmed purchase activity', () => {
  const at = new Date('2026-09-24T17:00:00.000Z')

  it('turns a paid order into a first-name, state, and product sentence', () => {
    const product = getProduct('commute-pack')!
    const [activity] = purchasesFromOrder(
      {
        orderNumber: 'NV-TEST',
        status: 'paid',
        firstName: 'Sarah',
        shipTo: 'Austin, TX',
        lines: [{ sku: buildSku(product.id, 'charcoal', 0, 'OS') }],
      },
      at,
    )
    expect(regionFromShipTo('Austin, TX')).toBe('Texas')
    expect(activity).toMatchObject({ firstName: 'Sarah', region: 'Texas', productName: 'Commute Pack' })
    expect(purchaseSentence(activity, new Date(at.getTime() + 8 * 60_000))).toBe('Sarah from Texas purchased Commute Pack 8 minutes ago.')
  })

  it('ignores unpaid orders and orders with no ship-to region', () => {
    const product = getProduct('line-watch')!
    const sku = buildSku(product.id, 'tan-leather', 0, 'OS')
    expect(purchasesFromOrder({ orderNumber: 'NV-1', status: 'processing', firstName: 'Sarah', shipTo: 'Austin, TX', lines: [{ sku }] }, at)).toEqual([])
    expect(purchasesFromOrder({ orderNumber: 'NV-2', status: 'paid', firstName: 'Sarah', shipTo: null, lines: [{ sku }] }, at)).toEqual([])
    expect(purchasesFromOrder({ orderNumber: 'NV-3', status: 'paid', firstName: null, shipTo: 'Austin, TX', lines: [{ sku }] }, at)).toEqual([])
  })

  it('gives every product a different preview buyer', () => {
    const now = new Date('2026-09-24T17:00:00.000Z')
    const samples = samplePurchases(now)
    const products = allProducts()
    expect(samples.map((item) => item.productId).sort()).toEqual(products.map((product) => product.id).sort())
    const names = samples.map((item) => item.firstName)
    expect(new Set(names).size).toBe(names.length)
    expect(purchaseSentence(samplePurchaseFor('stride-runner', now)!, now)).toBe('Sarah from Texas purchased Stride Runner 8 minutes ago.')
    expect(samplePurchaseFor('ridge-trail', now)?.firstName).toBe('Mike')
    expect(samplePurchaseFor('court-low', now)?.firstName).toBe('John')
    expect(samplePurchaseFor('missing')).toBeNull()
  })

  it('formats short elapsed times', () => {
    expect(relativeAgo(at, new Date(at.getTime() + 30_000))).toBe('just now')
    expect(relativeAgo(at, new Date(at.getTime() + 60_000))).toBe('1 minute ago')
    expect(relativeAgo(at, new Date(at.getTime() + 2 * 60 * 60_000))).toBe('2 hours ago')
  })
})
