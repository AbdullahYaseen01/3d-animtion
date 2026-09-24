import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { activeCategories } from '../../catalog'
import { store } from '../../config/store'
import { formatMoney } from '../../lib/money'
import { useCart } from '../../state/CartProvider'
import { useWishlist } from '../../state/WishlistProvider'
import { Dialog } from '../ui/Dialog'
import { Icon } from '../ui/Icon'
import { ProductImage } from '../ui/ProductImage'
import { SearchDialog } from './SearchDialog'
import { allProducts } from '../../catalog'
import './Header.css'

export function AnnouncementBar() {
  const { standard, freeThresholdCents } = store.shipping
  const shipping =
    standard.priceCents === 0
      ? 'Free standard shipping on every US order'
      : freeThresholdCents != null
        ? `Free standard shipping on US orders over ${formatMoney(freeThresholdCents)}`
        : null
  return (
    <div className="announcement">
      <p className="container announcement__inner">
        {shipping && <span>{shipping}</span>}
        <span className="announcement__sep" aria-hidden="true" />
        <Link to="/returns">{store.returns.windowDays}-day returns on unworn pairs</Link>
      </p>
    </div>
  )
}

export function Header() {
  const { cart, hydrated, openCart } = useCart()
  const wishlist = useWishlist()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const categories = activeCategories()

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname, location.search])

  const count = hydrated ? cart.itemCount : 0

  return (
    <header className="site-header">
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
          NOVA<span className="wordmark__dot" aria-hidden="true" />
        </Link>

        <nav className="primary-nav" aria-label="Primary">
          <ul role="list">
            <li>
              <NavLink to="/shop" end>
                Shop all
              </NavLink>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <NavLink to={`/collections/${c.slug}`}>{c.name}</NavLink>
              </li>
            ))}
            <li className="primary-nav__secondary">
              <NavLink to="/fit-guide">Fit guide</NavLink>
            </li>
            <li className="primary-nav__secondary">
              <NavLink to="/about">Our craft</NavLink>
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
            <li>
              <Link to="/shop" className="mobile-menu__cat">
                <span className="mobile-menu__thumb mobile-menu__thumb--all" aria-hidden="true">All</span>
                <span>
                  <strong>Shop all</strong>
                  <span className="muted">{allProducts().length} styles</span>
                </span>
                <Icon name="chevron" size={18} />
              </Link>
            </li>
            {categories.map((c) => {
              const first = allProducts().find((p) => p.category === c.slug)!
              return (
                <li key={c.slug}>
                  <Link to={`/collections/${c.slug}`} className="mobile-menu__cat">
                    <span className="mobile-menu__thumb" aria-hidden="true">
                      <ProductImage image={first.colors[0].images[0]} alt="" sizes="56px" />
                    </span>
                    <span>
                      <strong>{c.name}</strong>
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
