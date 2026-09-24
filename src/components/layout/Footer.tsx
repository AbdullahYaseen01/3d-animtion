import { Link } from 'react-router'
import { activeCategories, CATALOG_IS_SAMPLE } from '../../catalog'
import { store } from '../../config/store'
import { NewsletterForm } from '../forms/NewsletterForm'
import './Footer.css'

export function Footer() {
  const categories = activeCategories()
  return (
    <footer className="site-footer on-night">
      <div className="container">
        <div className="site-footer__signup">
          <div>
            <h2 className="site-footer__title">Notes from NOVA</h2>
            <p className="muted">New arrivals and restocks. Unsubscribe anytime.</p>
          </div>
          <NewsletterForm source="footer" tone="dark" />
        </div>

        <div className="site-footer__cols">
          <nav aria-labelledby="footer-shop">
            <h3 id="footer-shop">Shop</h3>
            <ul role="list">
              <li><Link to="/shop">Shop all</Link></li>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link to={`/collections/${c.slug}`}>{c.name}</Link>
                </li>
              ))}
              <li><Link to="/wishlist">Saved items</Link></li>
            </ul>
          </nav>
          <nav aria-labelledby="footer-help">
            <h3 id="footer-help">Help</h3>
            <ul role="list">
              <li><Link to="/fit-guide">Shoe size & fit</Link></li>
              <li><Link to="/shipping">Shipping</Link></li>
              <li><Link to="/returns">Returns</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Contact us</Link></li>
            </ul>
          </nav>
          <nav aria-labelledby="footer-about">
            <h3 id="footer-about">NOVA</h3>
            <ul role="list">
              <li><Link to="/about">Our craft</Link></li>
              <li><Link to="/guides">Guides</Link></li>
              {store.social.map((s) => (
                <li key={s.href}>
                  <a href={s.href} rel="noopener me" target="_blank">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h3>Questions?</h3>
            <p className="muted">
              Email <a href={`mailto:${store.supportEmail}`}>{store.supportEmail}</a> or use our{' '}
              <Link to="/contact">contact form</Link>.
            </p>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>
            &copy; {new Date().getFullYear()} {store.legalName}
          </p>
          <ul role="list">
            <li><Link to="/privacy">Privacy policy</Link></li>
            <li><Link to="/terms">Terms of service</Link></li>
          </ul>
        </div>
        {CATALOG_IS_SAMPLE && (
          <p className="sample-note">Preview build: product names, prices, stock and imagery are sample data pending the final catalog.</p>
        )}
      </div>
    </footer>
  )
}
