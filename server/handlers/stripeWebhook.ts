import type Stripe from 'stripe'
import { claimFulfillment, notifyMerchant } from '../fulfillment.js'
import { env, json, logEvent, methodNotAllowed } from '../http.js'
import { orderNumber } from '../orderView.js'
import { getStripe } from '../stripe.js'

/**
 * The only place an order becomes "paid" for fulfillment. Verifies Stripe's signature on the raw body,
 * acts only on paid sessions, and claims each session once so retries never double-fulfill.
 */
export async function POST(request: Request): Promise<Response> {
  const secret = env('STRIPE_WEBHOOK_SECRET')
  const setup = getStripe()
  if (!secret || !setup.ok) return json({ error: 'Webhook not configured' }, { status: 503 })

  const signature = request.headers.get('stripe-signature')
  if (!signature) return json({ error: 'Missing signature' }, { status: 400 })

  const payload = await request.text()
  let event: Stripe.Event
  try {
    event = await setup.stripe.webhooks.constructEventAsync(payload, signature, secret)
  } catch {
    logEvent('webhook_signature_invalid')
    return json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object
        if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
          logEvent('order_awaiting_payment', { order: orderNumber(session.id), stripe_event: event.type })
          break
        }
        const claimed = await claimFulfillment(setup.stripe, session)
        if (!claimed) {
          logEvent('order_duplicate_delivery', { order: orderNumber(session.id), stripe_event_id: event.id })
          break
        }
        logEvent('order_paid', { order: orderNumber(session.id), amount: session.amount_total ?? 0, livemode: event.livemode })
        await notifyMerchant(setup.stripe, session)
        break
      }
      case 'checkout.session.async_payment_failed':
        logEvent('order_payment_failed', { order: orderNumber(event.data.object.id) })
        break
      case 'checkout.session.expired':
        logEvent('checkout_expired', { order: orderNumber(event.data.object.id) })
        break
      default:
        break
    }
  } catch (err) {
    logEvent('webhook_handler_error', { stripe_event: event.type, error: err instanceof Error ? err.message.slice(0, 120) : 'unknown' })
    return json({ error: 'Handler error' }, { status: 500 })
  }

  return json({ received: true })
}

export const GET = () => methodNotAllowed(['POST'])
