import { existsSync } from 'node:fs'
import path from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { buildRobots, buildSitemap } from '../scripts/seo-files.mjs'
import { extractJsonLd, validateJsonLd } from '../scripts/qa/schema-rules.mjs'
import { allProducts } from '../src/catalog'
import { guides } from '../src/data/guides'
import { faqGroups } from '../src/pages/Faq'
import { preloadAllPages, prerenderRoutes, render } from '../src/entry-server'
import { DESCRIPTION_MAX, metaDescription, pageTitle, SITE_URL, TITLE_MAX } from '../src/lib/seo'

const indexable = () => prerenderRoutes().filter((r) => r.sitemap)
const attr = (head: string, re: RegExp) => head.match(re)?.[1]?.replace(/&amp;/g, '&').replace(/&quot;/g, '"')
const titleOf = (head: string) => attr(head, /<title>(.*?)<\/title>/)
const descriptionOf = (head: string) => attr(head, /name="description" content="([^"]*)"/)
const canonicalOf = (head: string) => attr(head, /rel="canonical" href="([^"]*)"/)

beforeAll(() => preloadAllPages())

describe('titles and descriptions', () => {
  it('fit search-result limits and are unique on every indexable page', () => {
    const titles = new Map<string, string>()
    const descriptions = new Map<string, string>()
    for (const { path } of indexable()) {
      const { head } = render(path)
      const title = titleOf(head)!
      const description = descriptionOf(head)!
      expect(title.length, `${path} title "${title}"`).toBeLessThanOrEqual(TITLE_MAX)
      expect(title.length, `${path} title "${title}"`).toBeGreaterThanOrEqual(15)
      expect(description.length, `${path} description`).toBeLessThanOrEqual(DESCRIPTION_MAX)
      expect(description.length, `${path} description "${description}"`).toBeGreaterThanOrEqual(70)
      expect(titles.get(title), `${path} duplicates the title of ${titles.get(title)}`).toBeUndefined()
      expect(descriptions.get(description), `${path} duplicates the description of ${descriptions.get(description)}`).toBeUndefined()
      titles.set(title, path)
      descriptions.set(description, path)
    }
  })

  it('drops the brand suffix rather than overflowing, and trims descriptions at a word', () => {
    expect(pageTitle('Short')).toBe('Short | NOVA')
    const long = 'A very long guide title that already uses most of the space'
    expect(pageTitle(long)).toBe(long)
    const trimmed = metaDescription('word '.repeat(60))
    expect(trimmed.length).toBeLessThanOrEqual(DESCRIPTION_MAX)
    expect(trimmed.endsWith('word…')).toBe(true)
  })
})

describe('canonicals and indexing', () => {
  it('gives every indexable page a clean, self-referencing canonical', () => {
    for (const { path } of indexable()) {
      const canonical = canonicalOf(render(path).head)
      expect(canonical, path).toBe(`${SITE_URL}${path}`)
      expect(canonical, path).not.toMatch(/[?#]/)
    }
  })

  it('noindexes filtered, sorted and search URLs and drops their canonical', () => {
    for (const url of ['/shop?color=black', '/collections/shoes?size=9', '/collections/running?width=2E', '/shop?sort=price-asc', '/collections/shoes?use=trail', '/shop?page=2', '/search?q=runner', '/search']) {
      const { head } = render(url)
      expect(head, url).toContain('content="noindex, follow"')
      expect(canonicalOf(head), url).toBeUndefined()
    }
  })

  it('noindexes cart, wishlist, checkout and the 404 page', () => {
    for (const url of ['/cart', '/wishlist', '/checkout/success', '/definitely-missing']) {
      expect(render(url).head, url).toContain('content="noindex, follow"')
    }
  })
})

describe('structured data', () => {
  it('passes the schema rules on every page and never includes review markup', () => {
    for (const { path } of prerenderRoutes()) {
      const blocks = extractJsonLd(render(path).head)
      for (const block of blocks) expect(validateJsonLd(block), `${path} ${block['@type']}`).toEqual([])
    }
  })

  it('adds BreadcrumbList to every indexable page except the homepage', () => {
    for (const { path } of indexable().filter((r) => r.path !== '/')) {
      const types = extractJsonLd(render(path).head).map((b) => b['@type'])
      expect(types, path).toContain('BreadcrumbList')
    }
  })

  it('lists the visible products in ItemList on collections', () => {
    const { head, html } = render('/collections/running')
    const list = extractJsonLd(head).find((b) => b['@type'] === 'ItemList')
    expect(list).toBeDefined()
    for (const item of list.itemListElement) expect(html).toContain(`href="${item.url.replace(SITE_URL, '')}"`)
  })

  it('builds FAQPage from exactly the questions shown on /faq', () => {
    const { head, html } = render('/faq')
    const faq = extractJsonLd(head).find((b) => b['@type'] === 'FAQPage')
    const visible = faqGroups().flatMap((g) => g.items)
    expect(faq.mainEntity).toHaveLength(visible.length)
    expect((html.match(/<details/g) ?? []).length).toBe(visible.length)
    for (const q of faq.mainEntity) {
      const plain = html.replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").replace(/&amp;/g, '&')
      expect(plain, q.name).toContain(q.name)
      expect(plain, q.name).toContain(q.acceptedAnswer.text)
    }
  })

  it('dates every guide and shows the date on the page', () => {
    for (const g of guides) {
      const { head, html } = render(`/guides/${g.slug}`)
      const article = extractJsonLd(head).find((b) => b['@type'] === 'Article')
      expect(article.datePublished).toBe(g.published)
      expect(article.dateModified).toBe(g.updated)
      expect(html, g.slug).toMatch(new RegExp(`<time datetime="${g.updated}">`, 'i'))
      expect(html, g.slug).toContain('By the NOVA team')
    }
  })
})

describe('internal links', () => {
  it('only link to routes that exist', () => {
    const known = new Set(prerenderRoutes().map((r) => r.path))
    for (const { path } of prerenderRoutes()) {
      const { html } = render(path)
      for (const [, href] of html.matchAll(/<a [^>]*href="(\/[^"#?]*)/g)) {
        expect(known.has(href.replace(/\/$/, '') || '/'), `${path} links to ${href}`).toBe(true)
      }
    }
  })

  it('link every guide to its products and collections, and every product to its guides', () => {
    for (const g of guides) {
      const { html } = render(`/guides/${g.slug}`)
      for (const slug of g.relatedProducts) expect(html, g.slug).toContain(`href="/products/${slug}"`)
      expect(html, g.slug).toContain(`href="/collections/${g.categories[0]}"`)
    }
    for (const p of allProducts()) {
      const { html } = render(`/products/${p.slug}`)
      for (const slug of p.relatedGuides ?? []) expect(html, p.slug).toContain(`href="/guides/${slug}"`)
    }
  })
})

describe('sitemap and robots', () => {
  const site = 'https://example.com'

  it('lists only indexable routes, with lastmod and images that exist', () => {
    const routes = prerenderRoutes()
    const xml = buildSitemap(routes, site)
    for (const r of routes) {
      const listed = xml.includes(`<loc>${site}${r.path}</loc>`)
      expect(listed, r.path).toBe(r.sitemap)
      if (r.sitemap) expect(r.lastmod, r.path).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      for (const img of r.images ?? []) expect(existsSync(path.join('public', img)), img).toBe(true)
    }
    expect(xml).toContain('xmlns:image=')
    expect(xml).not.toMatch(/<loc>[^<]*\?/)
  })

  it('blocks everything unless indexing is intentionally enabled', () => {
    expect(buildRobots(false, site)).toMatch(/Disallow: \/\n/)
    expect(buildRobots(false, site)).not.toContain('Sitemap:')
    const prod = buildRobots(true, site)
    expect(prod).toContain(`Sitemap: ${site}/sitemap.xml`)
    expect(prod).toContain('Disallow: /cart')
    expect(prod).not.toMatch(/Disallow: \/\n/)
  })
})
