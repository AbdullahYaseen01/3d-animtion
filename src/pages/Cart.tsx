import { Link, useSearchParams } from 'react-router'
import { CartLineItem } from '../components/cart/CartLineItem'
import { CartAssurances, CartTotals, CheckoutButton, FreeShippingProgress } from '../components/cart/CartSummary'
import { Icon } from '../components/ui/Icon'
import { Seo } from '../lib/seo'
import { useCart } from '../state/CartProvider'
import '../components/cart/Cart.css'

export default function Cart() {
  const { cart, hydrated, issues, dismissIssues } = useCart()
  const [params] = useSearchParams()
  const canceled = params.get('checkout') === 'canceled'

  return (
    <>
      <Seo title="Your Cart" description="Review the shoes in your NOVA cart." path="/cart" noindex />
      <div className="container">
        <div className="page-head">
          <h1>Your cart</h1>
        </div>

        {canceled && (
          <div className="notice notice--warning" role="status" style={{ marginBottom: 'var(--space-5)' }}>
            <Icon name="alert" size={18} />
            <span>Checkout was canceled and you have not been charged. Your cart is saved below whenever you are ready.</span>
          </div>
        )}

        {issues.length > 0 && (
          <div className="notice notice--warning" role="status" style={{ marginBottom: 'var(--space-5)' }}>
            <Icon name="alert" size={18} />
            <div>
              <p>We updated your cart to match current availability:</p>
              <ul>
                {issues.map((i) => (
                  <li key={i.sku}>
                    {i.type === 'sold-out' ? `${i.name} in your selected size sold out and was removed.` : i.type === 'reduced' ? `${i.name}: only ${i.available} available, quantity reduced.` : 'An item that is no longer sold was removed.'}
                  </li>
                ))}
              </ul>
              <button type="button" className="catalog-chips__clear" onClick={dismissIssues}>
                Dismiss
              </button>
            </div>
          </div>
        )}

        {!hydrated ? (
          <p className="muted" aria-busy="true" style={{ paddingBlock: 'var(--space-8)' }}>
            Loading your cart…
          </p>
        ) : cart.lines.length === 0 ? (
          <div className="empty-state">
            <h2>Your cart is empty</h2>
            <p>Browse running, trail, lifestyle and everyday styles, or pick up where you left off in your saved items.</p>
            <div className="hero__ctas" style={{ justifyContent: 'center' }}>
              <Link to="/shop" className="btn">
                Shop all shoes
              </Link>
              <Link to="/wishlist" className="btn btn--secondary">
                Saved items
              </Link>
            </div>
          </div>
        ) : (
          <div className="cart-page">
            <section aria-labelledby="cart-items-title">
              <h2 id="cart-items-title" className="visually-hidden">
                Items
              </h2>
              <FreeShippingProgress />
              <ul role="list" className="cart-lines">
                {cart.lines.map((line) => (
                  <CartLineItem key={line.sku} line={line} />
                ))}
              </ul>
              <Link to="/shop" className="link-arrow" style={{ marginTop: 'var(--space-4)' }}>
                Continue shopping
              </Link>
            </section>
            <aside className="cart-page__summary" aria-labelledby="summary-title">
              <h2 id="summary-title">Order summary</h2>
              <CartTotals />
              <CheckoutButton label="Secure checkout" />
              <CartAssurances />
            </aside>
          </div>
        )}
      </div>
    </>
  )
}
