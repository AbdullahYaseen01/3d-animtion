import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { allProducts, getCategory } from '../../catalog'
import { store } from '../../config/store'
import { useCart } from '../../state/CartProvider'
import { useWishlist } from '../../state/WishlistProvider'
import { Dialog } from '../ui/Dialog'
import { Icon } from '../ui/Icon'
import { ProductImage } from '../ui/ProductImage'
import { SearchDialog } from './SearchDialog'
import '@fontsource/bodoni-moda/latin-400.css'
import '@fontsource/bodoni-moda/latin-500.css'
import './Header.css'

const BAG_LINKS = [
  { slug: 'handbags', label: 'Handbags' },
  { slug: 'wallets', label: 'Wallets' },
] as const

const OUTERWEAR_LINKS = [
  { slug: 'jackets', label: 'Jackets' },
  { slug: 'hoodies', label: 'Hoodies' },
  { slug: 'coats', label: 'Coats' },
] as const

const MOBILE_CATS = ['shoes', 'handbags', 'wallets', 'jackets', 'hoodies', 'coats', 'womens-jewelry', 'backpacks', 'watches'] as const
const MOBILE_LABELS: Partial<Record<(typeof MOBILE_CATS)[number], string>> = {
  'womens-jewelry': 'Jewelry',
}

export function Header() {
  const { cart, hydrated, openCart } = useCart()
  const wishlist = useWishlist()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [bagsOpen, setBagsOpen] = useState(false)
  const [outerOpen, setOuterOpen] = useState(false)
  const bagsRef = useRef<HTMLLIElement>(null)
  const outerRef = useRef<HTMLLIElement>(null)
  const location = useLocation()
  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
    setBagsOpen(false)
    setOuterOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!bagsOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setBagsOpen(false)
    }
    const onPointer = (e: PointerEvent) => {
      if (!bagsRef.current?.contains(e.target as Node)) setBagsOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [bagsOpen])

  useEffect(() => {
    if (!outerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOuterOpen(false)
    }
    const onPointer = (e: PointerEvent) => {
      if (!outerRef.current?.contains(e.target as Node)) setOuterOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [outerOpen])

  const count = hydrated ? cart.itemCount : 0
  const editorial = location.pathname === '/'

  return (
    <header className={editorial ? 'site-header site-header--editorial' : 'site-header'}>
      <div className="container site-header__inner">
        <button
          type="button"
          className="icon-btn site-header__menu-btn"
          aria-label="Open menu"
          aria-haspopup="dialog"
          onClick={() => setMenuOpen(true)}
        >
          <Icon name="menu" />
        </button>

        <Link to="/" className="wordmark" aria-label={`${store.name} home`}>
          {store.name}
        </Link>

        <nav className="primary-nav" aria-label="Primary">
          <ul role="list">
            {editorial ? (
              <li>
                <NavLink to="/shop?sort=newest" className="nav-link nav-link--all">
                  New In
                </NavLink>
              </li>
            ) : (
              <li>
                <NavLink to="/shop" end className="nav-link nav-link--all">
                  Shop All
                </NavLink>
              </li>
            )}
            <li>
              <NavLink to="/collections/shoes" className="nav-link nav-link--shoes">
                Shoes
              </NavLink>
            </li>
            <li
              className={`nav-drop${bagsOpen ? ' is-open' : ''}`}
              ref={bagsRef}
              onMouseEnter={() => setBagsOpen(true)}
              onMouseLeave={() => setBagsOpen(false)}
              onBlur={(e) => {
                if (!bagsRef.current?.contains(e.relatedTarget as Node)) setBagsOpen(false)
              }}
            >
              <NavLink
                to="/collections/handbags"
                className="nav-link nav-link--bags"
                aria-expanded={bagsOpen}
                aria-haspopup="true"
                onFocus={() => setBagsOpen(true)}
                onClick={(event) => {
                  if (window.matchMedia('(hover: none)').matches && !bagsOpen) {
                    event.preventDefault()
                    setBagsOpen(true)
                  }
                }}
              >
                Bags & Wallets
              </NavLink>
              <ul className="nav-drop__panel" role="list">
                {BAG_LINKS.map((item) => (
                  <li key={item.slug}>
                    <Link to={`/collections/${item.slug}`} className={`nav-drop__link nav-drop__link--${item.slug}`}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li
              className={`nav-drop${outerOpen ? ' is-open' : ''}`}
              ref={outerRef}
              onMouseEnter={() => setOuterOpen(true)}
              onMouseLeave={() => setOuterOpen(false)}
              onBlur={(e) => {
                if (!outerRef.current?.contains(e.relatedTarget as Node)) setOuterOpen(false)
              }}
            >
              <NavLink
                to="/collections/jackets"
                className="nav-link nav-link--jackets"
                aria-expanded={outerOpen}
                aria-haspopup="true"
                onFocus={() => setOuterOpen(true)}
                onClick={(event) => {
                  if (window.matchMedia('(hover: none)').matches && !outerOpen) {
                    event.preventDefault()
                    setOuterOpen(true)
                  }
                }}
              >
                Outerwear
              </NavLink>
              <ul className="nav-drop__panel" role="list">
                {OUTERWEAR_LINKS.map((item) => (
                  <li key={item.slug}>
                    <Link to={`/collections/${item.slug}`} className={`nav-drop__link nav-drop__link--${item.slug}`}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <NavLink to="/collections/womens-jewelry" className="nav-link nav-link--jewelry">
                Jewelry
              </NavLink>
            </li>
            <li>
              <NavLink to="/collections/watches" className="nav-link nav-link--watches">
                Watches
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="site-header__actions">
          <button type="button" className="icon-btn" aria-label="Search" aria-haspopup="dialog" onClick={() => setSearchOpen(true)}>
            <Icon name="search" />
          </button>
          <Link to="/wishlist" className="icon-btn site-header__saved" aria-label={`Saved items${wishlist.items.length ? `, ${wishlist.items.length}` : ''}`}>
            <Icon name="heart" />
            {wishlist.hydrated && wishlist.items.length > 0 && <span className="count-dot" aria-hidden="true">{wishlist.items.length}</span>}
          </Link>
          <button
            type="button"
            className="icon-btn"
            aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}
            aria-haspopup="dialog"
            onClick={openCart}
          >
            <Icon name="bag" />
            {count > 0 && (
              <span className="count-dot" aria-hidden="true">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>
        </div>
      </div>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />

      <Dialog open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" variant="drawer-left" className="mobile-menu">
        <nav aria-label="Mobile">
          <p className="eyebrow">Shop</p>
          <ul role="list" className="mobile-menu__cats">
            {editorial && (
              <li>
                <Link to="/shop?sort=newest" className="mobile-menu__cat">
                  <span className="mobile-menu__thumb mobile-menu__thumb--all" aria-hidden="true">New</span>
                  <span>
                    <strong>New In</strong>
                    <span className="muted">Just added</span>
                  </span>
                  <Icon name="chevron" size={18} />
                </Link>
              </li>
            )}
            <li>
              <Link to="/shop" className="mobile-menu__cat">
                <span className="mobile-menu__thumb mobile-menu__thumb--all" aria-hidden="true">All</span>
                <span>
                  <strong>Shop All</strong>
                  <span className="muted">{allProducts().length} styles</span>
                </span>
                <Icon name="chevron" size={18} />
              </Link>
            </li>
            {MOBILE_CATS.map((slug) => {
              const c = getCategory(slug)
              const first = allProducts().find((p) => p.category === slug)
              if (!c) return null
              return (
                <li key={slug}>
                  <Link to={`/collections/${slug}`} className={`mobile-menu__cat mobile-menu__cat--${slug}`}>
                    <span className="mobile-menu__thumb" aria-hidden="true">
                      {first && <ProductImage image={first.colors[0].images[0]} alt="" sizes="56px" />}
                    </span>
                    <span>
                      <strong>{MOBILE_LABELS[slug] ?? c.name}</strong>
                      <span className="muted">{c.summary}</span>
                    </span>
                    <Icon name="chevron" size={18} />
                  </Link>
                </li>
              )
            })}
          </ul>
          <p className="eyebrow">Help & more</p>
          <ul role="list" className="mobile-menu__links">
            <li><Link to="/wishlist">Saved items</Link></li>
            <li><Link to="/fit-guide">Size & fit guide</Link></li>
            <li><Link to="/about">Our craft</Link></li>
            <li><Link to="/guides">Guides</Link></li>
            <li><Link to="/shipping">Shipping</Link></li>
            <li><Link to="/returns">Returns</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/contact">Contact us</Link></li>
          </ul>
        </nav>
      </Dialog>
    </header>
  )
}
