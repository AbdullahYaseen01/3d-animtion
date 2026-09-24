import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Icon } from '../components/ui/Icon'
import { trackPurchaseOnce } from '../lib/analytics'
import { formatMoney } from '../lib/money'
import { Seo } from '../lib/seo'
import { useCart } from '../state/CartProvider'
import { store } from '../config/store'
import type { OrderView } from '../../server/orderView'
import '../components/cart/Cart.css'
import './CheckoutSuccess.css'

type LoadState = { kind: 'loading' } | { kind: 'missing' } | { kind: 'error'; message: string } | { kind: 'loaded'; order: OrderView }

const POLL_MS = 4000
const MAX_POLLS = 8

export default function CheckoutSuccess() {
  const [params] = useSearchParams()
  const sessionId = params.get('session_id')
  const [state, setState] = useState<LoadState>(sessionId ? { kind: 'loading' } : { kind: 'missing' })
  const { clear } = useCart()
  const cleared = useRef(false)
  const polls = useRef(0)

  useEffect(() => {
    if (!sessionId) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>
    const load = async () => {
      try {
        const res = await fetch(`/api/order?session_id=${encodeURIComponent(sessionId)}`, { cache: 'no-store' })
        const data = await res.json().catch(() => ({}))
        if (cancelled) return
        if (!res.ok) {
          setState(res.status === 404 ? { kind: 'missing' } : { kind: 'error', message: data.error ?? 'We could not load your order.' })
          return
        }
        const order = data as OrderView
        setState({ kind: 'loaded', order })
        if (order.status === 'processing' && polls.current < MAX_POLLS) {
          polls.current += 1
          timer = setTimeout(load, POLL_MS)
        }
      } catch {
        if (!cancelled) setState({ kind: 'error', message: 'We could not reach our servers to confirm your order.' })
      }
    }
    load()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [sessionId])

  useEffect(() => {
    if (state.kind !== 'loaded') return
    const { order } = state
    if ((order.status === 'paid' || order.status === 'processing') && !cleared.current) {
      cleared.current = true
      clear()
    }
    if (order.status === 'paid') {
      trackPurchaseOnce(order.orderNumber, {
        currency: 'USD',
        value: order.totalCents / 100,
        tax: order.taxCents / 100,
        shipping: order.shippingCents / 100,
        items: order.lines.map((l) => ({ item_id: l.sku ?? l.name, item_name: l.name, quantity: l.quantity, price: l.unitCents / 100 })),
      })
    }
  }, [state, clear])

  return (
    <>
      <Seo title="Order Status" description="Your NOVA order status." path="/checkout/success" noindex />
      <div className="container container--narrow order-page">
        {state.kind === 'loading' && (
          <div className="order-status" aria-busy="true">
            <span className="spinner" aria-hidden="true" />
            <h1>Confirming your order…</h1>
            <p className="muted">We are checking your payment with Stripe. This usually takes a few seconds.</p>
          </div>
        )}

        {state.kind === 'missing' && (
          <div className="order-status">
            <h1>We could not find that order</h1>
            <p className="muted">
              This link is missing an order reference or has expired. If you completed a payment, check your email for a receipt or{' '}
              <Link to="/contact">contact us</Link> and we will help.
            </p>
            <Link to="/shop" className="btn">
              Continue shopping
            </Link>
          </div>
        )}

        {state.kind === 'error' && (
          <div className="order-status">
            <h1>Order status unavailable</h1>
            <p className="muted">{state.message} Your payment, if completed, is safe. Refresh this page to try again.</p>
            <button type="button" className="btn" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        )}

        {state.kind === 'loaded' && <OrderResult order={state.order} />}
      </div>
    </>
  )
}

function OrderResult({ order }: { order: OrderView }) {
  if (order.status === 'unpaid' || order.status === 'expired' || order.status === 'failed') {
    const heading = { unpaid: 'Payment not completed', expired: 'Checkout expired', failed: 'Payment failed' }[order.status]
    return (
      <div className="order-status">
        <Icon name="alert" size={32} />
        <h1>{heading}</h1>
        <p className="muted">
          {order.status === 'failed'
            ? `Your bank did not approve the payment for order ${order.orderNumber}, so the order will not ship and no payment was collected. You are welcome to place a new order with a different payment method.`
            : 'You have not been charged. Your cart is still saved, so you can try again whenever you are ready.'}
        </p>
        <Link to={order.status === 'failed' ? '/shop' : '/cart'} className="btn">
          {order.status === 'failed' ? 'Shop again' : 'Return to cart'}
        </Link>
      </div>
    )
  }

  const paid = order.status === 'paid'
  return (
    <article className="order">
      <header className="order-status">
        <span className={`order-status__icon${paid ? '' : ' is-pending'}`} aria-hidden="true">
          {paid ? <Icon name="check" size={28} /> : <span className="spinner" />}
        </span>
        <p className="eyebrow">Order {order.orderNumber}</p>
        <h1>{paid ? `Thank you${order.firstName ? `, ${order.firstName}` : ''}` : 'Payment processing'}</h1>
        <p className="muted">
          {paid
            ? `Your order is confirmed. A receipt is on its way${order.emailMasked ? ` to ${order.emailMasked}` : ''}.`
            : 'Your payment method is still being confirmed by the bank. We will email you as soon as it clears. There is no need to order again.'}
        </p>
      </header>

      <section aria-labelledby="order-items" className="order__section">
        <h2 id="order-items">Items</h2>
        <ul role="list" className="order__lines">
          {order.lines.map((l, i) => (
            <li key={`${l.name}-${i}`}>
              <span>
                <strong>{l.name}</strong>
                {l.description && <span className="muted">{l.description}</span>}
              </span>
              <span className="order__qty">× {l.quantity}</span>
              <span className="order__amt">{formatMoney(l.totalCents)}</span>
            </li>
          ))}
        </ul>
        <dl className="totals">
          <div>
            <dt>Subtotal</dt>
            <dd>{formatMoney(order.subtotalCents)}</dd>
          </div>
          <div>
            <dt>Shipping</dt>
            <dd>{order.shippingCents === 0 ? 'Free' : formatMoney(order.shippingCents)}</dd>
          </div>
          <div>
            <dt>Tax</dt>
            <dd>{formatMoney(order.taxCents)}</dd>
          </div>
          {order.discountCents > 0 && (
            <div>
              <dt>Discount</dt>
              <dd>−{formatMoney(order.discountCents)}</dd>
            </div>
          )}
          <div className="totals__grand">
            <dt>Total</dt>
            <dd>{formatMoney(order.totalCents)}</dd>
          </div>
        </dl>
      </section>

      {order.shipTo && (
        <section aria-labelledby="order-ship" className="order__section">
          <h2 id="order-ship">Shipping to</h2>
          <p>{order.shipTo}</p>
          <p className="muted">
            Standard shipping: processed within {store.shipping.processingBusinessDays} business{' '}
            {store.shipping.processingBusinessDays === 1 ? 'day' : 'days'}, then {store.shipping.standard.minBusinessDays}–
            {store.shipping.standard.maxBusinessDays} business days in transit.
          </p>
        </section>
      )}

      <section className="order__section order__next">
        <h2>Need help?</h2>
        <p className="muted">
          Questions about sizing, delivery or returns? Email <a href={`mailto:${store.supportEmail}`}>{store.supportEmail}</a> with your order number.
        </p>
        <div className="hero__ctas">
          <Link to="/shop" className="btn">
            Continue shopping
          </Link>
          <Link to="/returns" className="btn btn--secondary">
            Returns policy
          </Link>
        </div>
      </section>
    </article>
  )
}
