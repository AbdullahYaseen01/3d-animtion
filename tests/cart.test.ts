import { describe, expect, it } from 'vitest'
import { cartReducer, priceCart, shippingFor, validateLines } from '../src/commerce/cart'
import { getProductById } from '../src/catalog'
import { store } from '../src/config/store'

const IN_STOCK = 'stride-runner:chalk-ember:10.5:D'
const LOW_STOCK = 'stride-runner:chalk-ember:10:D' // 3 in stock
const SOLD_OUT = 'stride-runner:carbon:7:D'

describe('cartReducer', () => {
  it('adds, merges and clamps quantity to the per-line maximum', () => {
    let lines = cartReducer([], { type: 'add', sku: IN_STOCK, quantity: 2 })
    lines = cartReducer(lines, { type: 'add', sku: IN_STOCK, quantity: 20 })
    expect(lines).toEqual([{ sku: IN_STOCK, quantity: store.checkout.maxQuantityPerLine }])
  })

  it('removes a line when quantity is set to zero', () => {
    const lines = cartReducer([{ sku: IN_STOCK, quantity: 1 }], { type: 'set', sku: IN_STOCK, quantity: 0 })
    expect(lines).toEqual([])
  })
})

describe('validateLines', () => {
  it('rejects non-arrays and malformed entries', () => {
    expect(validateLines('nope').lines).toEqual([])
    expect(validateLines([{ sku: 1, quantity: 'x' }, null, { sku: IN_STOCK, quantity: Number.NaN }]).lines).toEqual([])
  })

  it('reports unknown, sold-out and reduced lines', () => {
    const { lines, issues } = validateLines([
      { sku: 'fake:red:10:D', quantity: 1 },
      { sku: SOLD_OUT, quantity: 1 },
      { sku: LOW_STOCK, quantity: 5 },
      { sku: IN_STOCK, quantity: 1 },
    ])
    expect(lines).toEqual([
      { sku: LOW_STOCK, quantity: 3 },
      { sku: IN_STOCK, quantity: 1 },
    ])
    expect(issues.map((i) => i.type)).toEqual(['unknown', 'sold-out', 'reduced'])
  })

  it('merges duplicate SKUs', () => {
    expect(validateLines([{ sku: IN_STOCK, quantity: 1 }, { sku: IN_STOCK, quantity: 2 }]).lines).toEqual([{ sku: IN_STOCK, quantity: 3 }])
  })

  it('rejects SKUs that do not round-trip exactly (e.g. "10.50")', () => {
    expect(validateLines([{ sku: 'stride-runner:chalk-ember:10.50:D', quantity: 1 }]).issues[0]?.type).toBe('unknown')
  })
})

describe('priceCart', () => {
  it('prices from the catalog in integer cents, ignoring any client-supplied price', () => {
    const product = getProductById('stride-runner')!
    const cart = priceCart([{ sku: IN_STOCK, quantity: 2, priceCents: 1 } as never])
    expect(cart.subtotalCents).toBe(product.priceCents * 2)
    expect(Number.isInteger(cart.subtotalCents)).toBe(true)
    expect(cart.itemCount).toBe(2)
    expect(cart.totalBeforeTaxCents).toBe(cart.subtotalCents + cart.shippingCents)
  })

  it('charges no shipping on an empty cart', () => {
    expect(priceCart([]).shippingCents).toBe(0)
  })

  it('applies the configured standard shipping rate and free-shipping threshold', () => {
    const threshold = store.shipping.freeThresholdCents
    if (threshold == null) {
      expect(shippingFor(10000)).toEqual({ cents: store.shipping.standard.priceCents, remaining: null })
    } else {
      expect(shippingFor(threshold).cents).toBe(0)
      expect(shippingFor(threshold - 100)).toEqual({ cents: store.shipping.standard.priceCents, remaining: 100 })
    }
  })
})
