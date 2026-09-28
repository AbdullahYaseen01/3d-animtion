import type Stripe from 'stripe'
import { orderNumber, orderStatus, type OrderStatus } from './orderView.js'

export interface AdminOrderLine {
  name: string
  sku: string | null
  quantity: number
  totalCents: number
}

/** Ship-to fields the owner needs to hand the parcel to the right door. */
export interface OrderDelivery {
  fullName: string | null
  phone: string | null
  house: string | null
  street: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  notes: string | null
}

/** Full customer details for the signed-in store owner. Never returned by the public order API. */
export interface AdminOrder {
  orderNumber: string
  createdAt: string
  status: OrderStatus
  email: string | null
  name: string | null
  phone: string | null
  addressLines: string[]
  delivery: OrderDelivery | null
  lines: AdminOrderLine[]
  subtotalCents: number
  shippingCents: number
  taxCents: number
  discountCents: number
  totalCents: number
}

type SessionGate = {
  metadata?: Stripe.Metadata | null
  status?: Stripe.Checkout.Session.Status | null
  payment_status?: Stripe.Checkout.Session.PaymentStatus | null
}

/** Finished store checkouts only. Open, abandoned sessions are not orders. */
export function isCustomerOrder(session: SessionGate): boolean {
  if (session.metadata?.source !== 'nova-web') return false
  return session.payment_status === 'paid' || session.status === 'complete'
}

function addressLines(address: Stripe.Address | null | undefined): string[] {
  if (!address) return []
  const city = [address.city, address.state].filter(Boolean).join(', ')
  const locality = [city, address.postal_code].filter(Boolean).join(' ')
  return [address.line1, address.line2, locality || null, address.country].filter((line): line is string => Boolean(line))
}

export function toAdminOrder(session: Stripe.Checkout.Session, paymentIntentStatus?: Stripe.PaymentIntent.Status | null): AdminOrder {
  const shipping = session.collected_information?.shipping_details ?? null
  const customer = session.customer_details
  const items = session.line_items?.data ?? []
  const address = shipping?.address ?? customer?.address ?? null
  const name = shipping?.name ?? customer?.name ?? null
  return {
    orderNumber: orderNumber(session.id),
    createdAt: new Date(session.created * 1000).toISOString(),
    status: orderStatus(session, paymentIntentStatus),
    email: customer?.email ?? null,
    name,
    phone: customer?.phone ?? null,
    addressLines: addressLines(address),
    delivery: address
      ? {
          fullName: name,
          phone: customer?.phone ?? null,
          house: address.line2 ?? null,
          street: address.line1 ?? null,
          city: address.city ?? null,
          state: address.state ?? null,
          zip: address.postal_code ?? null,
          country: address.country ?? null,
          notes: null,
        }
      : null,
    lines: items.map((li) => {
      const product = li.price && typeof li.price.product === 'object' && !('deleted' in li.price.product && li.price.product.deleted) ? (li.price.product as Stripe.Product) : null
      return {
        name: li.description ?? product?.name ?? 'Item',
        sku: product?.metadata?.sku ?? null,
        quantity: li.quantity ?? 1,
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
