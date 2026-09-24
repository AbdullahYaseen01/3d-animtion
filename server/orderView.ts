import type Stripe from 'stripe'

export type OrderStatus = 'paid' | 'processing' | 'failed' | 'unpaid' | 'expired'

export interface OrderViewLine {
  name: string
  description: string | null
  sku: string | null
  quantity: number
  unitCents: number
  totalCents: number
}

/** The only order data exposed to the browser. Deliberately excludes full email, address and payment details. */
export interface OrderView {
  orderNumber: string
  status: OrderStatus
  firstName: string | null
  emailMasked: string | null
  shipTo: string | null
  lines: OrderViewLine[]
  subtotalCents: number
  shippingCents: number
  taxCents: number
  discountCents: number
  totalCents: number
}

export function orderNumber(sessionId: string): string {
  return `NV-${sessionId.slice(-10).toUpperCase()}`
}

/**
 * A session is only "paid" when Stripe says so. A completed session that is still unpaid is
 * an asynchronous payment (e.g. bank debit); it is "failed" once its PaymentIntent needs a new method.
 */
export function orderStatus(
  session: Pick<Stripe.Checkout.Session, 'status' | 'payment_status'>,
  paymentIntentStatus?: Stripe.PaymentIntent.Status | null,
): OrderStatus {
  if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') return 'paid'
  if (session.status === 'expired') return 'expired'
  if (session.status === 'complete') {
    return paymentIntentStatus === 'requires_payment_method' || paymentIntentStatus === 'canceled' ? 'failed' : 'processing'
  }
  return 'unpaid'
}

export function maskEmail(email: string | null | undefined): string | null {
  if (!email) return null
  const [user, domain] = email.split('@')
  if (!user || !domain) return null
  return `${user[0]}${'•'.repeat(Math.max(2, Math.min(user.length - 1, 6)))}@${domain}`
}

export function toOrderView(
  session: Stripe.Checkout.Session,
  items: Stripe.LineItem[],
  paymentIntentStatus?: Stripe.PaymentIntent.Status | null,
): OrderView {
  const shipping = session.collected_information?.shipping_details ?? null
  const name = shipping?.name ?? session.customer_details?.name ?? null
  const addr = shipping?.address
  return {
    orderNumber: orderNumber(session.id),
    status: orderStatus(session, paymentIntentStatus),
    firstName: name ? name.trim().split(/\s+/)[0] : null,
    emailMasked: maskEmail(session.customer_details?.email),
    shipTo: addr ? [addr.city, addr.state].filter(Boolean).join(', ') || null : null,
    lines: items.map((li) => {
      const product = li.price && typeof li.price.product === 'object' && !('deleted' in li.price.product && li.price.product.deleted) ? (li.price.product as Stripe.Product) : null
      return {
        name: li.description ?? product?.name ?? 'Item',
        description: product?.description ?? null,
        sku: product?.metadata?.sku ?? null,
        quantity: li.quantity ?? 1,
        unitCents: li.quantity ? Math.round(li.amount_subtotal / li.quantity) : li.amount_subtotal,
        totalCents: li.amount_subtotal,
      }
    }),
    subtotalCents: session.amount_subtotal ?? 0,
    shippingCents: session.total_details?.amount_shipping ?? session.shipping_cost?.amount_total ?? 0,
    taxCents: session.total_details?.amount_tax ?? 0,
    discountCents: session.total_details?.amount_discount ?? 0,
    totalCents: session.amount_total ?? 0,
  }
}
