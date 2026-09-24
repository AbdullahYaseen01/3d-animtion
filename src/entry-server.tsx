import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { App } from './App'
import { activeCategories, allProducts } from './catalog'
import { guides } from './data/guides'
import { HeadContext, headToString, type HeadCollector } from './lib/seo'

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

/** Every public route, with whether it belongs in the sitemap. */
export function prerenderRoutes(): { path: string; sitemap: boolean }[] {
  const indexable = [
    '/',
    '/shop',
    ...activeCategories().map((c) => `/collections/${c.slug}`),
    ...allProducts().map((p) => `/products/${p.slug}`),
    '/about',
    '/fit-guide',
    '/shipping',
    '/returns',
    '/faq',
    '/contact',
    '/privacy',
    '/terms',
    '/guides',
    ...guides.map((g) => `/guides/${g.slug}`),
  ]
  const utility = ['/search', '/cart', '/wishlist', '/checkout/success']
  return [...indexable.map((path) => ({ path, sitemap: true })), ...utility.map((path) => ({ path, sitemap: false }))]
}
