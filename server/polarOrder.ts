import { resolveSku, variantLabel } from '../src/catalog/index.js'
import { shippingFor } from '../src/commerce/cart.js'
import type { AdminOrder, AdminOrderLine } from './adminOrder.js'
import { unpackCartLines } from './checkoutSession.js'
import { maskEmail, orderNumber, type OrderStatus, type OrderView, type OrderViewLine } from './orderView.js'
import type { PolarAddress, PolarCheckout, PolarOrder } from './polar.js'

export function polarCheckoutStatus(status: string | null | undefined): OrderStatus {
  switch (status) {
    case 'succeeded':
      return 'paid'
    case 'confirmed':
      return 'processing'
    case 'expired':
      return 'expired'
    case 'failed':
      return 'failed'
    default:
      return 'unpaid'
  }
}

export function polarOrderStatus(order: Pick<PolarOrder, 'status' | 'paid'>): OrderStatus {
  if (order.paid || order.status === 'paid' || order.status === 'partially_refunded') return 'paid'
  if (order.status === 'pending') return 'processing'
  if (order.status === 'refunded') return 'failed'
  return 'unpaid'
}

function catalogLines(metadata: Record<string, string | null | undefined> | null | undefined): OrderViewLine[] {
  return unpackCartLines(metadata).flatMap((line) => {
    const resolved = resolveSku(line.sku)
    if (!resolved) return []
    const totalCents = resolved.product.priceCents * line.quantity
    return [
      {
        name: resolved.product.name,
        description: variantLabel(resolved.product, resolved.color, resolved.variant.size, resolved.variant.widthCode),
        sku: line.sku,
        quantity: line.quantity,
        unitCents: resolved.product.priceCents,
        totalCents,
      },
    ]
  })
}

function place(address: PolarAddress | null | undefined): string | null {
  if (!address) return null
  const text = [address.city, address.state].filter(Boolean).join(', ')
  return text || null
}

function firstName(name: string | null | undefined): string | null {
  const trimmed = name?.trim()
  return trimmed ? trimmed.split(/\s+/)[0] : null
}

/** Public order page for a Polar checkout. Paid only when Polar reports `succeeded`. */
export function polarCheckoutToOrderView(checkout: PolarCheckout): OrderView {
  const lines = catalogLines(checkout.metadata)
  const subtotalCents = lines.reduce((sum, line) => sum + line.totalCents, 0)
  const shippingCents = lines.length > 0 ? shippingFor(subtotalCents).cents : 0
  const taxCents = checkout.tax_amount ?? 0
  const discountCents = checkout.discount_amount ?? 0
  const totalCents = checkout.total_amount ?? checkout.amount ?? subtotalCents + shippingCents + taxCents
  return {
    orderNumber: orderNumber(checkout.id),
    status: polarCheckoutStatus(checkout.status),
    firstName: firstName(checkout.customer_name),
    emailMasked: maskEmail(checkout.customer_email),
    shipTo: place(checkout.customer_billing_address),
    lines,
    subtotalCents,
    shippingCents,
    taxCents,
    discountCents,
    totalCents,
  }
}

function addressLines(address: PolarAddress | null | undefined): string[] {
  if (!address) return []
  const city = [address.city, address.state].filter(Boolean).join(', ')
  const locality = [city, address.postal_code].filter(Boolean).join(' ')
  return [address.line1, address.line2, locality || null, address.country].filter((line): line is string => Boolean(line))
}

export function polarOrderToAdmin(order: PolarOrder): AdminOrder {
  const lines = catalogLines(order.metadata)
  const viewLines: AdminOrderLine[] = lines.map((line) => ({
    name: line.name,
    sku: line.sku,
    quantity: line.quantity,
    totalCents: line.totalCents,
  }))
  const subtotalCents = lines.reduce((sum, line) => sum + line.totalCents, 0)
  const shippingCents = lines.length > 0 ? shippingFor(subtotalCents).cents : 0
  const reference = order.checkout_id || order.id
  return {
    orderNumber: orderNumber(reference),
    createdAt: order.created_at ?? new Date(0).toISOString(),
    status: polarOrderStatus(order),
    email: order.customer?.email ?? null,
    name: order.billing_name ?? order.customer?.name ?? null,
    phone: null,
    addressLines: addressLines(order.billing_address),
    lines: viewLines,
    subtotalCents: order.subtotal_amount ?? subtotalCents,
    shippingCents,
    taxCents: order.tax_amount ?? 0,
    discountCents: order.discount_amount ?? 0,
    totalCents: order.total_amount ?? subtotalCents + shippingCents,
  }
}
