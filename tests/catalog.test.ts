import { existsSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { activeCategories, allProducts, buildSku, resolveSku } from '../src/catalog'
import { applyFilters, parseFilters, serializeFilters } from '../src/catalog/filters'
import manifest from '../src/data/imageManifest.json'

describe('catalog integrity', () => {
  it('has no empty collections', () => {
    for (const c of activeCategories()) expect(c.count).toBeGreaterThan(0)
  })

  it('has built image files for every colorway image', () => {
    const images = manifest as Record<string, { widths: number[] }>
    for (const p of allProducts()) {
      for (const c of p.colors) {
        for (const img of c.images) {
          expect(images[img], `${img} missing from manifest`).toBeDefined()
          for (const w of images[img].widths) {
            for (const ext of ['avif', 'webp']) {
              expect(existsSync(path.join('public/images/products', `${img}-${w}.${ext}`)), `${img}-${w}.${ext}`).toBe(true)
            }
          }
        }
      }
    }
  })

  it('stock overrides reference real SKUs', () => {
    for (const p of allProducts()) for (const sku of Object.keys(p.stock)) expect(resolveSku(sku), sku).not.toBeNull()
  })

  it('round-trips every SKU', () => {
    for (const p of allProducts())
      for (const c of p.colors)
        for (const size of p.sizes)
          for (const w of p.widths) {
            const sku = buildSku(p.id, c.slug, size, w.code)
            const r = resolveSku(sku)
            expect(r?.product.id).toBe(p.id)
            expect(r?.variant.size).toBe(size)
          }
  })
})

describe('filters', () => {
  it('ignores invalid params and omits defaults when serializing', () => {
    const state = parseFilters(new URLSearchParams('color=black,purple&size=10.5,abc&sort=bogus&page=-2&price=under-120'))
    expect(state.color).toEqual(['black'])
    expect(state.size).toEqual([10.5])
    expect(state.sort).toBe('featured')
    expect(state.page).toBe(1)
    expect(serializeFilters(state).toString()).toBe('color=black&size=10.5&price=under-120')
  })

  it('round-trips through the URL', () => {
    const qs = 'q=trail&category=trail&color=green&size=9%2C10.5&width=D&availability=in-stock&sort=price-asc'
    expect(serializeFilters(parseFilters(new URLSearchParams(qs))).toString()).toBe(qs)
  })

  it('size filter only returns products buyable in that size', () => {
    const res = applyFilters(allProducts(), parseFilters(new URLSearchParams('size=7&width=2E')))
    // Stride Runner 7 2E is sold out in both colors; Drift Knit sage 7 2E is sold out but stone is not.
    const ids = res.items.map((p) => p.id)
    expect(ids).not.toContain('stride-runner')
    expect(ids).toContain('drift-knit')
    expect(ids).not.toContain('ridge-trail')
  })

  it('sorts by price', () => {
    const res = applyFilters(allProducts(), parseFilters(new URLSearchParams('sort=price-asc')))
    const prices = res.items.map((p) => p.priceCents)
    expect(prices).toEqual([...prices].sort((a, b) => a - b))
  })

  it('matches search synonyms', () => {
    const res = applyFilters(allProducts(), parseFilters(new URLSearchParams('q=hiking')))
    expect(res.items.map((p) => p.id)).toContain('ridge-trail')
  })

  it('ranks a plain-language request against catalog text', () => {
    const res = applyFilters(allProducts(), parseFilters(new URLSearchParams('q=comfortable shoes for walking all day')))
    const ids = res.items.map((p) => p.id)
    expect(ids).toContain('stride-runner')
    expect(ids).toContain('glide-slip-on')
    expect(ids.indexOf('glide-slip-on')).toBeLessThan(ids.indexOf('court-low'))
    expect(applyFilters(allProducts(), parseFilters(new URLSearchParams('q=zzzz-not-a-shoe'))).total).toBe(0)
  })
})
