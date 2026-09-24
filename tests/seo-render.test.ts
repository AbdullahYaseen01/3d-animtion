import { describe, expect, it } from 'vitest'
import { prerenderRoutes, render } from '../src/entry-server'
import { buildHead } from '../src/lib/seo'
import { getProduct } from '../src/catalog'

const h1Count = (html: string) => (html.match(/<h1[\s>]/g) ?? []).length

describe('prerendered HTML', () => {
  it('renders exactly one h1 and a head on every route', () => {
    for (const { path } of prerenderRoutes()) {
      const { html, head } = render(path)
      expect(h1Count(html), path).toBe(1)
      expect(head, path).toContain('<title>')
      expect(head, path).toContain('name="description"')
    }
  })

  it('renders the 404 page for unknown products and collections', () => {
    expect(render('/products/not-a-shoe').html).toContain('Off the trail')
    expect(render('/collections/sandals').html).toContain('Off the trail')
  })

  it('keeps utility pages out of the index and the sitemap', () => {
    for (const path of ['/cart', '/search', '/wishlist', '/checkout/success']) {
      expect(render(path).head, path).toContain('noindex')
      expect(prerenderRoutes().find((r) => r.path === path)?.sitemap).toBe(false)
    }
  })

  it('emits Product JSON-LD with catalog prices and no review markup', () => {
    const { head } = render('/products/stride-runner')
    const blocks = [...head.matchAll(/<script type="application\/ld\+json" data-seo>(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]))
    const group = blocks.find((b) => b['@type'] === 'ProductGroup')
    expect(group).toBeDefined()
    const price = getProduct('stride-runner')!.priceCents / 100
    for (const v of group.hasVariant) expect(Number(v.offers.price)).toBe(price)
    expect(head).not.toMatch(/aggregateRating|"Review"/)
    expect(blocks.some((b) => b['@type'] === 'BreadcrumbList')).toBe(true)
  })
})

describe('buildHead', () => {
  it('is noindex without a canonical for non-production builds and noindex pages', () => {
    const head = buildHead({ title: 'X', description: 'Y', path: '/cart', noindex: true })
    expect(head.tags.some((t) => t.tag === 'link')).toBe(false)
    expect(JSON.stringify(head)).toContain('noindex')
  })
})
