import { describe, expect, it } from 'vitest'
import { LOW_STOCK_THRESHOLD, allProducts, buildSku, getProduct, stockFor } from '../src/catalog'
import { stockUrgencyLabel } from '../src/catalog/urgency'
import { sizeForLength } from '../src/catalog/sizing'
import { applyFilters, parseFilters } from '../src/catalog/filters'
import { deliveryWindow } from '../src/lib/delivery'

describe('stock, delivery, size', () => {
  it('shows a low-stock count only from the real SKU quantity', () => {
    const product = getProduct('ndure-kay-0003-black')!
    const sku = buildSku(product.id, 'black', 10, 'D')
    const qty = stockFor(product, sku)
    expect(qty).toBe(8)
    expect(qty).toBeLessThanOrEqual(LOW_STOCK_THRESHOLD)
    expect(product.compareAtPriceCents).toBe(12600)
    expect(stockUrgencyLabel(product, 'black', 10, 'D')).toBeNull()
  })

  it('does not stamp the shared stock level on every product', () => {
    const product = getProduct('ndure-kay-0003-black')!
    expect(stockUrgencyLabel(product, 'black', null, 'D')).toBeNull()
    const bag = getProduct('bagx-monaco-choco')!
    expect(stockFor(bag, buildSku(bag.id, 'choco', 0, 'OS'))).toBe(8)
    expect(stockUrgencyLabel(bag, 'choco', 0, 'OS')).toBeNull()
    const soldOut = getProduct('ndure-kay-0004-white')!
    expect(stockUrgencyLabel(soldOut, 'white', 10, 'D')).toBeNull()
    expect(allProducts().every((item) => stockUrgencyLabel(item, item.colors[0].slug, item.variant === 'simple' ? 0 : null, item.widths[0].code) == null)).toBe(true)
  })

  it('searches across categories and respects a written budget', () => {
    const ids = (q: string) => applyFilters(allProducts(), parseFilters(new URLSearchParams(`q=${encodeURIComponent(q)}`))).items.map((p) => p.id)
    const underHundred = ids('black handbag under $100')
    expect(underHundred.length).toBeGreaterThan(0)
    for (const id of underHundred) expect(getProduct(id)!.priceCents).toBeLessThanOrEqual(10000)
    expect(ids('hobo bag')).toContain('bagx-monaco-choco')
    expect(ids('gold plated ring')).toContain('mz-solid-925-chandi-2-3-grams-18k-gold-plated')
    expect(ids('metal bracelet watch')).toContain('naviforce-nf5053g-ch-wht')
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