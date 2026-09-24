import { describe, expect, it } from 'vitest'
import { LOW_STOCK_THRESHOLD, allProducts, buildSku, getProduct, stockFor } from '../src/catalog'
import { stockUrgencyLabel } from '../src/catalog/urgency'
import { sizeForLength } from '../src/catalog/sizing'
import { applyFilters, parseFilters } from '../src/catalog/filters'
import { deliveryWindow } from '../src/lib/delivery'

describe('stock, delivery, size', () => {
  it('shows a low-stock count only from the real SKU quantity', () => {
    const product = getProduct('stride-runner')!
    const sku = buildSku(product.id, 'chalk-ember', 10, 'D')
    const qty = stockFor(product, sku)
    expect(qty).toBe(3)
    expect(qty).toBeLessThanOrEqual(LOW_STOCK_THRESHOLD)
    expect(product.compareAtPriceCents).toBeUndefined()
    expect(stockUrgencyLabel(product, 'chalk-ember', 10, 'D')).toBe('Only 3 left in stock')
  })

  it('shows real stock urgency on every product', () => {
    for (const product of allProducts()) {
      const label = stockUrgencyLabel(product, product.colors[0].slug, product.variant === 'simple' ? 0 : null, product.widths[0].code)
      expect(label, product.slug).toBeTruthy()
    }
    const pack = getProduct('commute-pack')!
    expect(stockFor(pack, buildSku(pack.id, 'charcoal', 0, 'OS'))).toBe(7)
    expect(stockUrgencyLabel(pack, 'charcoal', 0, 'OS')).toBe('Only 7 left in stock')
    const watch = getProduct('line-watch')!
    expect(stockUrgencyLabel(watch, 'tan-leather', 0, 'OS')).toBe('Only 5 left in stock')
    const earrings = getProduct('arc-earrings')!
    expect(stockUrgencyLabel(earrings, 'gold-tone', 0, 'OS')).toBe('12 in stock')
  })

  it('searches across categories and respects a written budget', () => {
    const ids = (q: string) => applyFilters(allProducts(), parseFilters(new URLSearchParams(`q=${encodeURIComponent(q)}`))).items.map((p) => p.id)
    expect(ids('black handbag under $100')).toEqual(['mini-crossbody'])
    expect(ids('backpack for a 15-inch laptop')).toContain('commute-pack')
    expect(ids('lightweight jacket for fall')).toContain('day-jacket')
    expect(ids('gold-tone earrings')).toContain('arc-earrings')
    expect(ids('minimalist watch with a leather strap')).toContain('line-watch')
    expect(ids('black handbag under $100')).not.toContain('stride-runner')
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