import { describe, expect, it } from 'vitest'
import { LOW_STOCK_THRESHOLD, allProducts, buildSku, getProduct, stockFor } from '../src/catalog'
import { sizeForLength } from '../src/catalog/sizing'
import { deliveryWindow } from '../src/lib/delivery'
import { purchaseMessage, urgencyLeft } from '../src/lib/urgency'

describe('stock, delivery, size', () => {
  it('keeps catalog stock for checkout while every product gets urgency copy', () => {
    const product = getProduct('stride-runner')!
    const sku = buildSku(product.id, 'chalk-ember', 10, 'D')
    const qty = stockFor(product, sku)
    expect(qty).toBe(3)
    expect(qty).toBeLessThanOrEqual(LOW_STOCK_THRESHOLD)
    expect(product.compareAtPriceCents).toBeUndefined()

    const messages = allProducts().map((p) => purchaseMessage(p.id))
    expect(new Set(messages).size).toBe(messages.length)
    for (const message of messages) {
      expect(message).toMatch(/ from .+ purchased this \d+ minutes ago$/)
    }
    for (const p of allProducts()) {
      const left = urgencyLeft(p.id)
      expect(left).toBeGreaterThanOrEqual(1)
      expect(left).toBeLessThanOrEqual(7)
    }
  })

  it('builds the delivery window from shipping settings', () => {
    const window = deliveryWindow(new Date(2026, 8, 24))
    expect(window.label).toBe('Sep 30 – Oct 6')
  })

  it('picks the chart size at or just above the measured length', () => {
    expect(sizeForLength(27)).toMatchObject({ usM: 9 })
    expect(sizeForLength(26.2)).toMatchObject({ usM: 8.5 })
    expect(sizeForLength(10)).toBe('short')
  })
})