import { beforeAll, describe, expect, it } from 'vitest'
import { preloadAllPages, prerenderRoutes } from '../src/entry-server'
import { buildHead } from '../src/lib/seo'
import { getProduct } from '../src/catalog'
import { cachedRender as render } from './renderCache'

const h1Count = (html: string) => (html.match(/<h1[\s>]/g) ?? []).length

beforeAll(async () => {
  await preloadAllPages()
  for (const { path } of prerenderRoutes()) render(path)
}, 600_000)

describe('prerendered HTML', () => {
  it('renders exactly one h1 and a full head on every route', () => {
    for (const { path } of prerenderRoutes()) {
      const { html, head } = render(path)
      expect(h1Count(html), path).toBe(1)
      expect(head, path).toContain('<title>')
      expect(head, path).toContain('name="description"')
      expect(head, path).toContain('property="og:title"')
      expect(head, path).toContain('property="og:image"')
      expect(head, path).toContain('name="twitter:card"')
    }
  })

  it('renders the 404 page for unknown products and collections', () => {
    expect(render('/products/not-a-shoe').html).toContain('Page not found')
    expect(render('/collections/sandals').html).toContain('Page not found')
  })

  it('keeps utility pages out of the index and the sitemap', () => {
    for (const path of ['/cart', '/search', '/wishlist', '/checkout/success', '/admin']) {
      expect(render(path).head, path).toContain('noindex')
      expect(prerenderRoutes().find((r) => r.path === path)?.sitemap).toBe(false)
    }
  })

  it('emits Product JSON-LD with catalog prices and no review markup', () => {
    const { head } = render('/products/ndure-kay-0003-black')
    const blocks = [...head.matchAll(/<script type="application\/ld\+json" data-seo>(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]))
    const group = blocks.find((b) => b['@type'] === 'ProductGroup')
    expect(group).toBeDefined()
    const price = getProduct('ndure-kay-0003-black')!.priceCents / 100
    for (const v of group.hasVariant) {
      expect(Number(v.offers.price)).toBe(price)
      expect(v.offers.priceCurrency).toBe('USD')
    }
    expect(head).not.toMatch(/aggregateRating|"Review"/)
    expect(blocks.some((b) => b['@type'] === 'BreadcrumbList')).toBe(true)
  })
})

describe('buildHead', () => {
  it('keeps the clean canonical on noindex views and drops it only when asked', () => {
    const noindex = buildHead({ title: 'X', description: 'Y', path: '/shop', noindex: true })
    expect(JSON.stringify(noindex)).toContain('noindex')
    expect(noindex.tags.some((t) => t.tag === 'link' && t.attrs.rel === 'canonical')).toBe(true)
    const missing = buildHead({ title: 'X', description: 'Y', path: '/404', noindex: true, canonical: false })
    expect(missing.tags.some((t) => t.tag === 'link' && t.attrs.rel === 'canonical')).toBe(false)
  })
})
