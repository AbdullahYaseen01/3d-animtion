import { Link } from 'react-router'
import { store } from '../../config/store'
import { formatMoney } from '../../lib/money'
import { useCart } from '../../state/CartProvider'
import { Icon } from '../ui/Icon'

export function FreeShippingProgress() {
  const { cart } = useCart()
  const threshold = store.shipping.freeThresholdCents
  if (threshold == null || cart.freeShippingRemainingCents == null) return null
  const pct = Math.min(100, Math.round((cart.subtotalCents / threshold) * 100))
  return (
    <div className="ship-progress">
      <p>
        {cart.freeShippingRemainingCents > 0
          ? `You're ${formatMoney(cart.freeShippingRemainingCents)} away from free standard shipping.`
          : 'Your order ships free.'}
      </p>
      <div className="ship-progress__bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free shipping">
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function CartTotals({ compact = false }: { compact?: boolean }) {
  const { cart } = useCart()
  const s = store.shipping.standard
  return (
    <dl className="totals">
      <div>
        <dt>Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})</dt>
        <dd>{formatMoney(cart.subtotalCents)}</dd>
      </div>
      <div>
        <dt>
          Shipping
          {!compact && (
            <span className="totals__note">
              {s.label}, {s.minBusinessDays}–{s.maxBusinessDays} business days
            </span>
          )}
        </dt>
        <dd>{cart.shippingCents === 0 ? 'Free' : formatMoney(cart.shippingCents)}</dd>
      </div>
      <div>
        <dt>Sales tax</dt>
        <dd className="totals__muted">Calculated at checkout</dd>
      </div>
      <div className="totals__grand">
        <dt>{compact ? 'Total before tax' : 'Estimated total before tax'}</dt>
        <dd>{formatMoney(cart.totalBeforeTaxCents)}</dd>
      </div>
    </dl>
  )
}

export function CartAssurances() {
  return (
    <ul role="list" className="assurance-list">
      <li>
        <Icon name="truck" size={20} />
        <span>
          {store.shipping.standard.priceCents === 0 ? 'Free standard shipping' : store.shipping.standard.label} to US addresses.{' '}
          <Link to="/shipping">Shipping details</Link>
        </span>
      </li>
    </ul>
  )
}
