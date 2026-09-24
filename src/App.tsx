import { useEffect, useRef } from 'react'
import { Outlet, Route, Routes, useLocation, useNavigate, useNavigationType } from 'react-router'
import { MiniCart } from './components/cart/MiniCart'
import { ErrorBoundary } from './components/layout/ErrorBoundary'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { PurchaseToast } from './components/product/PurchaseToast'
import { AnnouncerProvider, useAnnounce } from './state/Announcer'
import { CartProvider } from './state/CartProvider'
import { WishlistProvider } from './state/WishlistProvider'
import About from './pages/About'
import Cart from './pages/Cart'
import Catalog from './pages/Catalog'
import CheckoutSuccess from './pages/CheckoutSuccess'
import Contact from './pages/Contact'
import Faq from './pages/Faq'
import FitGuide from './pages/FitGuide'
import Guide from './pages/Guide'
import Guides from './pages/Guides'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Privacy from './pages/Privacy'
import Product from './pages/Product'
import Returns from './pages/Returns'
import Shipping from './pages/Shipping'
import Terms from './pages/Terms'
import Wishlist from './pages/Wishlist'

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
          <Outlet />
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
