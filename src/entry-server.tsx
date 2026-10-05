import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { App } from './App'
import { campaignHero, collectionOgImage } from './campaign/styleInMotion'
import { activeCategories, allProducts, liveBrands, productImagePath, productsInCategory, shoeCollections, styleCollections } from './catalog'
import { store } from './config/store'
import { guides } from './data/guides'
import { HeadContext, headToString, type HeadCollector } from './lib/seo'
import { pageFor, pages } from './routes'

/** Must be awaited before `render`, which cannot wait for code-split pages. */
export { preloadAllPages } from './routes'

/** Source file of the page a URL renders, as keyed in the Vite manifest. */
export function pageSource(url: string): string {
  return pages[pageFor(url)].src
}

export function render(url: string): { html: string; head: string } {
  const collector: HeadCollector = {}
  const html = renderToString(
    <StrictMode>
      <HeadContext.Provider value={collector}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </HeadContext.Provider>
    </StrictMode>,
  )
  return { html, head: collector.data ? headToString(collector.data) : '' }
}

export interface PrerenderRoute {
  path: string
  sitemap: boolean
  /** ISO date the page content last changed. */
  lastmod?: string
  /** Site-relative URLs of the main images shown on the page. */
  images?: string[]
}

/** Every public route, with whether it belongs in the sitemap. */
export function prerenderRoutes(): PrerenderRoute[] {
  const content = store.contentUpdated
  const legal = store.legal.updatedIso
  const latestGuide = guides.map((g) => g.updated).sort().pop() ?? content
  const indexable: Omit<PrerenderRoute, 'sitemap'>[] = [
    { path: '/', lastmod: content, images: [campaignHero.src.replace(/\.png$/, '-1600.webp')] },
    { path: '/shop', lastmod: content },
    ...[...activeCategories(), ...shoeCollections(), ...styleCollections()].map((c) => ({
      path: `/collections/${c.slug}`,
      lastmod: content,
      images: [
        collectionOgImage(c.slug)?.src,
        ...productsInCategory(c.slug)
          .slice(0, 4)
          .map((p) => productImagePath(p.colors[0].images[0], 1024)),
      ].filter((x): x is string => !!x),
    })),
    ...allProducts().map((p) => ({
      path: `/products/${p.slug}`,
      lastmod: content,
      images: [...new Set(p.colors.flatMap((c) => c.images))].map((k) => productImagePath(k, 1024)),
    })),
    { path: '/about', lastmod: content },
    { path: '/press', lastmod: content, images: ['/og/home.jpg'] },
    { path: '/fit-guide', lastmod: content },
    { path: '/shipping', lastmod: content },
    { path: '/faq', lastmod: content },
    { path: '/contact', lastmod: content },
    { path: '/privacy', lastmod: legal },
    { path: '/terms', lastmod: legal },
    { path: '/guides', lastmod: latestGuide },
    ...guides.map((g) => ({ path: `/guides/${g.slug}`, lastmod: g.updated, images: [g.image] })),
    { path: '/tools/shoe-size-converter', lastmod: content },
    ...liveBrands().map((b) => ({
      path: `/brands/${b.slug}`,
      lastmod: content,
      images: b.products.slice(0, 4).map((p) => productImagePath(p.colors[0].images[0], 1024)),
    })),
  ]
  // Empty departments are not prerendered: they fall through to the real 404 instead of a soft 404.
  const utility = ['/search', '/cart', '/wishlist', '/checkout/success', '/admin']
  return [...indexable.map((r) => ({ ...r, sitemap: true })), ...utility.map((path) => ({ path, sitemap: false }))]
}
