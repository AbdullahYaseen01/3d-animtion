import type Stripe from 'stripe'
import { env, logEvent } from './http.js'
import { orderNumber, toOrderView } from './orderView.js'
import { escapeHtml, resendRequest } from './resend.js'
import { formatMoney } from '../src/lib/money.js'

/**
 * Claims an order for fulfillment exactly once, even when Stripe delivers the same
 * event more than once or delivers both `completed` and `async_payment_succeeded`.
 * Uses Upstash Redis when configured, otherwise a flag on the PaymentIntent metadata.
 */
export async function claimFulfillment(stripe: Stripe, session: Stripe.Checkout.Session): Promise<boolean> {
  const url = env('UPSTASH_REDIS_REST_URL')
  const token = env('UPSTASH_REDIS_REST_TOKEN')
  if (url && token) {
    const res = await fetch(`${url.replace(/\/$/, '')}/set/nova:fulfilled:${session.id}/1/NX/EX/7776000`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`Upstash responded ${res.status}`)
    const data = (await res.json()) as { result: string | null }
    return data.result === 'OK'
  }

  const piId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id
  if (!piId) return true
  const pi = await stripe.paymentIntents.retrieve(piId)
  if (pi.metadata?.nova_fulfilled_at) return false
  await stripe.paymentIntents.update(piId, { metadata: { nova_fulfilled_at: new Date().toISOString() } })
  return true
}

/** Sends the merchant an order notification if ORDER_NOTIFICATION_EMAIL is configured. */
export async function notifyMerchant(stripe: Stripe, session: Stripe.Checkout.Session): Promise<void> {
  const to = env('ORDER_NOTIFICATION_EMAIL')
  const from = env('CONTACT_FROM_EMAIL')
  if (!to || !from || !env('RESEND_API_KEY')) return
  const items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 50, expand: ['data.price.product'] })
  const view = toOrderView(session, items.data)
  const rows = view.lines
    .map((l) => `<tr><td>${escapeHtml(l.name)}<br><small>${escapeHtml(l.description ?? '')} ${escapeHtml(l.sku ?? '')}</small></td><td>${l.quantity}</td><td>${formatMoney(l.totalCents)}</td></tr>`)
    .join('')
  const result = await resendRequest(
    '/emails',
    {
      from,
      to: [to],
      subject: `New order ${view.orderNumber} – ${formatMoney(view.totalCents)}`,
      html: `<h1>Order ${view.orderNumber}</h1><table cellpadding="6">${rows}</table><p>Total ${formatMoney(view.totalCents)}. Full customer and shipping details are in the Stripe Dashboard (Checkout Session ${escapeHtml(session.id)}).</p>`,
    },
    `order-notify-${session.id}`,
  )
  if (!result.ok) logEvent('order_notify_failed', { order: orderNumber(session.id), status: result.status })
}
