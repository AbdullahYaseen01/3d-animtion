import { Suspense, useEffect, useRef } from 'react'
import { Outlet, Route, Routes, useLocation, useNavigate, useNavigationType } from 'react-router'
import { MiniCart } from './components/cart/MiniCart'
import { ErrorBoundary } from './components/layout/ErrorBoundary'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { PurchaseToast } from './components/product/PurchaseToast'
import { pages } from './routes'
import { AnnouncerProvider, useAnnounce } from './state/Announcer'
import { CartProvider } from './state/CartProvider'
import { WishlistProvider } from './state/WishlistProvider'

const About = pages.about.page.Component
const Cart = pages.cart.page.Component
const Catalog = pages.catalog.page.Component
const CheckoutSuccess = pages.checkoutSuccess.page.Component
const Contact = pages.contact.page.Component
const Faq = pages.faq.page.Component
const FitGuide = pages.fitGuide.page.Component
const Guide = pages.guide.page.Component
const Guides = pages.guides.page.Component
const Home = pages.home.page.Component
const NotFound = pages.notFound.page.Component
const Privacy = pages.privacy.page.Component
const Product = pages.product.page.Component
const Returns = pages.returns.page.Component
const Shipping = pages.shipping.page.Component
const Terms = pages.terms.page.Component
const Wishlist = pages.wishlist.page.Component

/** Section anchors from the previous single-page site. */
const LEGACY_HASHES: Record<string, string> = {
  '#showcase': '/shop',
  '#process': '/about',
  '#contact': '/contact',
}

function Layout() {
  const location = useLocation()
  const navType = useNavigationType()
  const navigate = useNavigate()
  const announce = useAnnounce()
  const mainRef = useRef<HTMLElement>(null)
  const firstRender = useRef(true)

  useEffect(() => {
    const target = location.pathname === '/' ? LEGACY_HASHES[location.hash] : undefined
    if (target) navigate(target, { replace: true })
  }, [location.pathname, location.hash, navigate])

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (navType !== 'POP') window.scrollTo(0, 0)
    // Deferred so it runs after any open drawer closes and the browser restores focus to its opener.
    const t = setTimeout(() => {
      mainRef.current?.focus({ preventScroll: true })
      announce(document.title)
    }, 60)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" ref={mainRef} tabIndex={-1}>
        <ErrorBoundary key={location.pathname}>
          <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <MiniCart />
      <PurchaseToast />
    </>
  )
}

export function App() {
  return (
    <AnnouncerProvider>
      <CartProvider>
        <WishlistProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Catalog mode={{ kind: 'shop' }} />} />
              <Route path="collections/:slug" element={<CollectionRoute />} />
              <Route path="search" element={<Catalog mode={{ kind: 'search' }} />} />
              <Route path="products/:slug" element={<Product />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout/success" element={<CheckoutSuccess />} />
              <Route path="about" element={<About />} />
              <Route path="fit-guide" element={<FitGuide />} />
              <Route path="shipping" element={<Shipping />} />
              <Route path="returns" element={<Returns />} />
              <Route path="faq" element={<Faq />} />
              <Route path="contact" element={<Contact />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />
              <Route path="guides" element={<Guides />} />
              <Route path="guides/:slug" element={<Guide />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </WishlistProvider>
      </CartProvider>
    </AnnouncerProvider>
  )
}

function CollectionRoute() {
  const { pathname } = useLocation()
  const slug = pathname.split('/')[2] ?? ''
  return <Catalog key={slug} mode={{ kind: 'collection', slug }} />
}
