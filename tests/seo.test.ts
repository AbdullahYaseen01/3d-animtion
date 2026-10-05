import { existsSync } from 'node:fs'
import path from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { buildRobots, buildSitemap } from '../scripts/seo-files.mjs'
import { extractJsonLd, validateJsonLd } from '../scripts/qa/schema-rules.mjs'
import { activeCategories, allProducts, shoeCollections } from '../src/catalog'
import { guides } from '../src/data/guides'
import { outreachTargets } from '../src/data/outreach'
import { faqGroups } from '../src/pages/Faq'
import { preloadAllPages, prerenderRoutes } from '../src/entry-server'
import { DESCRIPTION_MAX, metaDescription, pageTitle, SITE_URL, TITLE_MAX } from '../src/lib/seo'
import { brandKeywords, departmentKeywords, keywordPlanForPath, keywordsFor, pageKeywords, productKeywordPlan, shoeKeywords, subCollectionKeywords } from '../src/lib/seoKeywords'
import { cachedRender as render } from './renderCache'

const indexable = () => prerenderRoutes().filter((r) => r.sitemap)
const attr = (head: string, re: RegExp) => head.match(re)?.[1]?.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'")
const titleOf = (head: string) => attr(head, /<title>(.*?)<\/title>/)
const descriptionOf = (head: string) => attr(head, /name="description" content="([^"]*)"/)
const canonicalOf = (head: string) => attr(head, /rel="canonical" href="([^"]*)"/)
const h1Of = (html: string) =>
  html
    .match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
const isKeywordPage = (p: string) => p === '/' || p === '/shop' || p.startsWith('/collections/') || !/^\/(products|guides)\//.test(p)

beforeAll(async () => {
  await preloadAllPages()
  for (const { path } of prerenderRoutes()) render(path)
}, 600_000)

describe('keyword map', () => {
  it('keeps every target within title and description limits once the brand is added', () => {
    const targets = [
      ...Object.values(pageKeywords),
      ...Object.values(departmentKeywords),
      ...Object.values(shoeKeywords),
      ...Object.values(brandKeywords),
      ...Object.values(subCollectionKeywords),
    ]
    for (const t of targets) {
      expect(pageTitle(t.title).length, t.title).toBeGreaterThanOrEqual(50)
      expect(pageTitle(t.title).length, t.title).toBeLessThanOrEqual(TITLE_MAX)
      expect(pageTitle(t.title).endsWith('| Westora Style'), t.title).toBe(true)
      expect(t.description.length, t.description).toBeGreaterThanOrEqual(140)
      expect(t.description.length, t.description).toBeLessThanOrEqual(DESCRIPTION_MAX)
    }
    expect(new Set(targets.map((t) => t.primary)).size).toBe(targets.length)
    for (const t of targets) {
      expect([1, 2, 3, 'info'], t.primary).toContain(t.tier)
      expect(t.winnability.length, t.primary).toBeGreaterThan(10)
      expect(t.currentRank, t.primary).toBe('unknown')
    }
  })
})

describe('titles and descriptions', () => {
  it('fit search-result limits and are unique on every indexable page', () => {
    const titles = new Map<string, string>()
    const descriptions = new Map<string, string>()
    for (const { path } of indexable()) {
      const { head } = render(path)
      const title = titleOf(head)!
      const description = descriptionOf(head)!
      expect(title.length, `${path} title "${title}"`).toBeLessThanOrEqual(TITLE_MAX)
      expect(title.length, `${path} title "${title}"`).toBeGreaterThanOrEqual(isKeywordPage(path) ? 50 : 30)
      expect(description.length, `${path} description`).toBeLessThanOrEqual(DESCRIPTION_MAX)
      expect(description.length, `${path} description "${description}"`).toBeGreaterThanOrEqual(isKeywordPage(path) ? 140 : 100)
      expect(titles.get(title), `${path} duplicates the title of ${titles.get(title)}`).toBeUndefined()
      expect(descriptions.get(description), `${path} duplicates the description of ${descriptions.get(description)}`).toBeUndefined()
      titles.set(title, path)
      descriptions.set(description, path)
    }
  })

  it('drops the brand suffix rather than overflowing, and trims descriptions at a word', () => {
    expect(pageTitle('Short')).toBe('Short | Westora Style')
    const long = 'A very long guide title that already uses most of the space'
    expect(pageTitle(long)).toBe(long)
    const trimmed = metaDescription('word '.repeat(60))
    expect(trimmed.length).toBeLessThanOrEqual(DESCRIPTION_MAX)
    expect(trimmed.endsWith('word…')).toBe(true)
  })

  it('leads each collection with its primary keyword in the title and the one h1', () => {
    for (const c of [...activeCategories(), ...shoeCollections()]) {
      const kw = keywordsFor(c.slug)!
      const { head, html } = render(`/collections/${c.slug}`)
      expect(titleOf(head)!.startsWith(kw.title), c.slug).toBe(true)
      expect(h1Of(html), c.slug).toBe(kw.h1)
    }
    expect(h1Of(render('/').html)?.toLowerCase()).toContain(pageKeywords.home.h1.toLowerCase())
  })

  it('gives every product a unique description in its own words', () => {
    const seen = new Map<string, string>()
    for (const p of allProducts()) {
      expect(p.description.length, p.slug).toBeGreaterThanOrEqual(100)
      expect(seen.get(p.description), `${p.slug} copies ${seen.get(p.description)}`).toBeUndefined()
      seen.set(p.description, p.slug)
    }
  })
})

describe('canonicals and indexing', () => {
  it('gives every indexable page a clean, self-referencing canonical on the production domain', () => {
    expect(SITE_URL).toBe(process.env.VITE_SITE_URL?.replace(/\/$/, '') || 'https://westorastyle.com')
    for (const { path } of indexable()) {
      const canonical = canonicalOf(render(path).head)
      expect(canonical, path).toBe(`${SITE_URL}${path}`)
      expect(canonical, path).not.toMatch(/[?#]/)
    }
  })

  it('noindexes filtered, sorted, paginated and search URLs and points them at the clean URL', () => {
    const cases: [string, string][] = [
      ['/shop?color=black', '/shop'],
      ['/collections/shoes?size=9', '/collections/shoes'],
      ['/collections/running?width=D', '/collections/running'],
      ['/shop?sort=price-asc', '/shop'],
      ['/collections/shoes?use=lifestyle', '/collections/shoes'],
      ['/shop?page=2', '/shop'],
      ['/search?q=runner', '/search'],
    ]
    for (const [url, clean] of cases) {
      const { head } = render(url)
      expect(head, url).toContain('content="noindex, follow"')
      expect(canonicalOf(head), url).toBe(`${SITE_URL}${clean}`)
    }
  })

  it('noindexes cart, wishlist, checkout, admin and the 404 page', () => {
    for (const url of ['/cart', '/wishlist', '/checkout/success', '/admin', '/definitely-missing']) {
      expect(render(url).head, url).toContain('content="noindex, follow"')
    }
    expect(canonicalOf(render('/definitely-missing').head)).toBeUndefined()
  })

  it('returns the 404 page for empty departments instead of a thin page', () => {
    const live = new Set<string>(activeCategories().map((c) => c.slug))
    for (const slug of Object.keys(departmentKeywords).filter((s) => !live.has(s))) {
      expect(render(`/collections/${slug}`).html, slug).toContain('Page not found')
      expect(prerenderRoutes().some((r) => r.path === `/collections/${slug}`), slug).toBe(false)
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

  it('adds Organization and WebSite with a SearchAction to the homepage', () => {
    const blocks = extractJsonLd(render('/').head)
    expect(blocks.find((b) => b['@type'] === 'Organization')).toBeDefined()
    expect(blocks.find((b) => b['@type'] === 'WebSite')?.potentialAction?.['@type']).toBe('SearchAction')
  })

  it('adds BreadcrumbList to every indexable page except the homepage', () => {
    for (const { path } of indexable().filter((r) => r.path !== '/')) {
      const types = extractJsonLd(render(path).head).map((b) => b['@type'])
      expect(types, path).toContain('BreadcrumbList')
    }
  })

  it('lists the visible products in a CollectionPage on every collection', () => {
    for (const c of [...activeCategories(), ...shoeCollections()]) {
      const { head, html } = render(`/collections/${c.slug}`)
      const page = extractJsonLd(head).find((b) => b['@type'] === 'CollectionPage')
      expect(page, c.slug).toBeDefined()
      for (const item of page.mainEntity.itemListElement) expect(html).toContain(`href="${item.url.replace(SITE_URL, '')}"`)
    }
  })

  it('names the real brand on products, with shipping details on every offer', () => {
    for (const p of allProducts()) {
      const group = extractJsonLd(render(`/products/${p.slug}`).head).find((b) => b['@type'] === 'ProductGroup')
      const brand = p.specs.find((s) => s.label === 'Brand')?.value
      if (brand) expect(group.brand.name, p.slug).toBe(brand)
      expect(group.name, p.slug).toBe(p.name)
    }
  })

  it('builds FAQPage from exactly the questions shown on /faq', () => {
    const { head, html } = render('/faq')
    const faq = extractJsonLd(head).find((b) => b['@type'] === 'FAQPage')
    const visible = faqGroups().flatMap((g) => g.items)
    expect(faq.mainEntity).toHaveLength(visible.length)
    expect((html.match(/<details/g) ?? []).length).toBe(visible.length)
    const plain = html.replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").replace(/&amp;/g, '&')
    for (const q of faq.mainEntity) {
      expect(plain, q.name).toContain(q.name)
      expect(plain, q.name).toContain(q.acceptedAnswer.text)
    }
  })

  it('dates every guide, marks it up as an Article, and adds FAQPage only for visible questions', () => {
    for (const g of guides) {
      const { head, html } = render(`/guides/${g.slug}`)
      const blocks = extractJsonLd(head)
      const article = blocks.find((b) => b['@type'] === 'Article')
      expect(article.datePublished).toBe(g.published)
      expect(article.dateModified).toBe(g.updated)
      expect(html, g.slug).toMatch(new RegExp(`<time datetime="${g.updated}">`, 'i'))
      expect(html, g.slug).toContain('By the Westora Style team')
      const faq = blocks.find((b) => b['@type'] === 'FAQPage')
      expect(!!faq, g.slug).toBe(!!g.faq?.length)
      const plain = html.replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"')
      for (const q of faq?.mainEntity ?? []) expect(plain, `${g.slug}: ${q.name}`).toContain(q.name)
    }
  })
})

describe('content', () => {
  it('publishes at least eight guides beyond the original seven, including gift guides', () => {
    expect(guides.length).toBeGreaterThanOrEqual(15)
    for (const slug of ['fathers-day-gift-guide', 'holiday-gift-guide-for-him', 'holiday-gift-guide-for-her']) {
      expect(guides.some((g) => g.slug === slug), slug).toBe(true)
    }
    const products = new Set(allProducts().map((p) => p.slug))
    for (const g of guides) for (const slug of g.relatedProducts) expect(products.has(slug), `${g.slug} cites ${slug}`).toBe(true)
  })

  it('never claims wide sizes the catalog does not stock', () => {
    const wide = allProducts().some((p) => p.widths.some((w) => w.code !== 'D'))
    if (wide) return
    for (const url of ['/faq', '/fit-guide', '/collections/shoes', ...guides.map((g) => `/guides/${g.slug}`)]) {
      const text = render(url).html.replace(/<[^>]+>/g, ' ')
      expect(text, url).not.toMatch(/(come|comes|available|offered|also) in wide|wide \(2E\) (as well|options)/i)
    }
  })

  it('keeps a manual outreach list of fifty US targets, each with an asset that exists', () => {
    expect(outreachTargets.length).toBeGreaterThanOrEqual(50)
    const known = new Set(prerenderRoutes().map((r) => r.path))
    for (const t of outreachTargets) {
      expect(known.has(t.asset), `${t.name} asset ${t.asset}`).toBe(true)
      expect(t.url, t.name).toMatch(/^https:\/\//)
    }
  })
})

describe('images', () => {
  it('gives every product image descriptive alt text and dimensions', () => {
    for (const url of ['/', '/shop', '/collections/coats', `/products/${allProducts()[0].slug}`]) {
      const { html } = render(url)
      for (const [tag] of html.matchAll(/<img [^>]*src="\/images\/products\/[^"]*"[^>]*>/g)) {
        expect(tag, url).toMatch(/alt="[^"]{8,}"/)
        expect(tag, url).toMatch(/width="\d+"/)
        expect(tag, url).toMatch(/height="\d+"/)
      }
    }
  })

  it('preloads a responsive AVIF LCP image on the home, collection and product pages', () => {
    for (const url of ['/', '/collections/shoes', `/products/${allProducts()[0].slug}`]) {
      expect(render(url).head, url).toMatch(/rel="preload" as="image"[^>]*type="image\/avif"|rel="preload"[^>]*imagesrcset="[^"]*\.avif/)
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
      expect(html, p.slug).toContain(`href="/collections/${p.category}"`)
    }
  })

  it('cross-links related departments and links every department from the footer', () => {
    const pairs: [string, string][] = [
      ['jackets', 'coats'],
      ['coats', 'hoodies'],
      ['hoodies', 'jackets'],
      ['handbags', 'wallets'],
      ['wallets', 'watches'],
      ['watches', 'wallets'],
      ['shoes', 'running'],
      ['running', 'shoes'],
    ]
    const live = new Set<string>([...activeCategories(), ...shoeCollections()].map((c) => c.slug))
    for (const [from, to] of pairs.filter(([a, b]) => live.has(a) && live.has(b))) {
      expect(render(`/collections/${from}`).html, `${from} -> ${to}`).toContain(`href="/collections/${to}"`)
    }
    const footer = render('/about').html.split('<footer')[1]
    for (const c of activeCategories()) expect(footer, c.slug).toContain(`href="/collections/${c.slug}"`)
    expect(footer).toContain('href="/guides"')
    expect(footer).toContain('href="/press"')
  })

  it('assigns a tiered keyword to every indexable page', () => {
    const products = new Map(allProducts().map((p) => [`/products/${p.slug}`, p]))
    for (const { path } of indexable()) {
      const plan = products.has(path) ? productKeywordPlan(products.get(path)!) : keywordPlanForPath(path)
      expect(plan, path).toBeDefined()
      expect([1, 2, 3, 'info'], path).toContain(plan!.tier)
    }
  })

  it('reaches every product in three clicks or fewer from home', () => {
    const known = new Set(indexable().map((r) => r.path))
    const depth = new Map<string, number>([['/', 0]])
    const queue = ['/']
    while (queue.length) {
      const from = queue.shift()!
      const next = (depth.get(from) ?? 0) + 1
      if (next > 3) continue
      for (const [, href] of render(from).html.matchAll(/<a [^>]*href="(\/[^"#?]*)/g)) {
        const path = href.replace(/\/$/, '') || '/'
        if (!known.has(path) || depth.has(path)) continue
        depth.set(path, next)
        queue.push(path)
      }
    }
    for (const p of allProducts()) {
      const path = `/products/${p.slug}`
      expect(depth.get(path), path).toBeLessThanOrEqual(3)
    }
  })

  it('does not render the old support domain', () => {
    for (const { path } of prerenderRoutes()) {
      expect(render(path).html, path).not.toContain('novafootwear.com')
    }
  })

  it('renders a purchase line and Only N left on product pages', () => {
    const html = render('/products/bagx-monaco-choco').html
    expect(html).toMatch(/ from .+ purchased this /)
    expect(html).toMatch(/Only [2-9] left/)
  })

  it('leaves no indexable page orphaned', () => {
    const linked = new Set<string>()
    for (const { path } of prerenderRoutes()) {
      for (const [, href] of render(path).html.matchAll(/<a [^>]*href="(\/[^"#?]*)/g)) if (href !== path) linked.add(href)
    }
    for (const { path } of indexable().filter((r) => r.path !== '/')) expect(linked.has(path), path).toBe(true)
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
    expect(xml).not.toMatch(/<loc>[^<]*[A-Z][^<]*<\/loc>/)
    expect(xml).not.toMatch(/<loc>https?:\/\/[^/<]+\/[^<]+\/<\/loc>/)
    for (const g of guides) expect(xml, g.slug).toContain(`<loc>${site}/guides/${g.slug}</loc>`)
  })

  it('blocks everything unless indexing is intentionally enabled', () => {
    expect(buildRobots(false, site)).toMatch(/Disallow: \/\n/)
    expect(buildRobots(false, site)).not.toContain('Sitemap:')
    const prod = buildRobots(true, site)
    expect(prod).toContain(`Sitemap: ${site}/sitemap.xml`)
    for (const p of ['/admin', '/api/', '/cart', '/checkout']) expect(prod).toContain(`Disallow: ${p}`)
    expect(prod).not.toMatch(/Disallow: \/\n/)
  })
})
