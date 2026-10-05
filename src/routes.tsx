import { lazy, type ComponentType } from 'react'

export interface LazyPage<P extends object> {
  Component: ComponentType<P>
  preload: () => Promise<void>
}

/**
 * Code-split page that renders synchronously once its module has loaded.
 * The server preloads every page before rendering and the client preloads the
 * current page before hydrating, so neither ever renders a Suspense fallback
 * for the first paint and the markup matches exactly.
 */
function lazyPage<P extends object>(load: () => Promise<{ default: ComponentType<P> }>): LazyPage<P> {
  let loaded: ComponentType<P> | undefined
  let pending: Promise<void> | undefined
  const preload = () =>
    (pending ??= load().then(
      (m) => {
        loaded = m.default
      },
      (err) => {
        pending = undefined
        throw err
      },
    ))
  const Deferred = lazy(() => preload().then(() => ({ default: loaded! })))
  function Page(props: P) {
    const Resolved = loaded ?? Deferred
    return <Resolved {...props} />
  }
  return { Component: Page, preload }
}

/** Source paths double as keys in the Vite manifest, which the prerender uses for modulepreload hints. */
export const pages = {
  home: { src: 'src/pages/Home.tsx', page: lazyPage(() => import('./pages/Home')) },
  catalog: { src: 'src/pages/Catalog.tsx', page: lazyPage(() => import('./pages/Catalog')) },
  product: { src: 'src/pages/Product.tsx', page: lazyPage(() => import('./pages/Product')) },
  wishlist: { src: 'src/pages/Wishlist.tsx', page: lazyPage(() => import('./pages/Wishlist')) },
  cart: { src: 'src/pages/Cart.tsx', page: lazyPage(() => import('./pages/Cart')) },
  checkoutSuccess: { src: 'src/pages/CheckoutSuccess.tsx', page: lazyPage(() => import('./pages/CheckoutSuccess')) },
  admin: { src: 'src/pages/Admin.tsx', page: lazyPage(() => import('./pages/Admin')) },
  about: { src: 'src/pages/About.tsx', page: lazyPage(() => import('./pages/About')) },
  press: { src: 'src/pages/Press.tsx', page: lazyPage(() => import('./pages/Press')) },
  fitGuide: { src: 'src/pages/FitGuide.tsx', page: lazyPage(() => import('./pages/FitGuide')) },
  shipping: { src: 'src/pages/Shipping.tsx', page: lazyPage(() => import('./pages/Shipping')) },
  faq: { src: 'src/pages/Faq.tsx', page: lazyPage(() => import('./pages/Faq')) },
  contact: { src: 'src/pages/Contact.tsx', page: lazyPage(() => import('./pages/Contact')) },
  privacy: { src: 'src/pages/Privacy.tsx', page: lazyPage(() => import('./pages/Privacy')) },
  terms: { src: 'src/pages/Terms.tsx', page: lazyPage(() => import('./pages/Terms')) },
  guides: { src: 'src/pages/Guides.tsx', page: lazyPage(() => import('./pages/Guides')) },
  guide: { src: 'src/pages/Guide.tsx', page: lazyPage(() => import('./pages/Guide')) },
  brand: { src: 'src/pages/Brand.tsx', page: lazyPage(() => import('./pages/Brand')) },
  shoeSizeConverter: { src: 'src/pages/ShoeSizeConverter.tsx', page: lazyPage(() => import('./pages/ShoeSizeConverter')) },
  notFound: { src: 'src/pages/NotFound.tsx', page: lazyPage(() => import('./pages/NotFound')) },
} as const

export type PageKey = keyof typeof pages

const STATIC: Record<string, PageKey> = {
  '/': 'home',
  '/shop': 'catalog',
  '/search': 'catalog',
  '/wishlist': 'wishlist',
  '/cart': 'cart',
  '/checkout/success': 'checkoutSuccess',
  '/admin': 'admin',
  '/about': 'about',
  '/press': 'press',
  '/fit-guide': 'fitGuide',
  '/shipping': 'shipping',
  '/faq': 'faq',
  '/contact': 'contact',
  '/privacy': 'privacy',
  '/terms': 'terms',
  '/guides': 'guides',
  '/tools/shoe-size-converter': 'shoeSizeConverter',
}

/** Which page module a URL renders. Must agree with the <Routes> in App.tsx. */
export function pageFor(pathname: string): PageKey {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (STATIC[path]) return STATIC[path]
  if (/^\/collections\/[^/]+$/.test(path)) return 'catalog'
  if (/^\/brands\/[^/]+$/.test(path)) return 'brand'
  if (/^\/products\/[^/]+$/.test(path)) return 'product'
  if (/^\/guides\/[^/]+$/.test(path)) return 'guide'
  return 'notFound'
}

export function preloadPage(pathname: string): Promise<void> {
  return pages[pageFor(pathname)].page.preload()
}

export function preloadAllPages(): Promise<void> {
  return Promise.all(Object.values(pages).map((p) => p.page.preload())).then(() => undefined)
}
