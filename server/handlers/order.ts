import type Stripe from 'stripe'
import { json, logEvent, methodNotAllowed } from '../http.js'
import { toOrderView } from '../orderView.js'
import { getPolarCheckout } from '../polar.js'
import { polarCheckoutToOrderView } from '../polarOrder.js'
import { getStripe } from '../stripe.js'

const SESSION_RE = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/
const CHECKOUT_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(request: Request): Promise<Response> {
  const id = new URL(request.url).searchParams.get('session_id') ?? ''
  if (CHECKOUT_RE.test(id)) return polarOrder(id)
  if (!SESSION_RE.test(id)) return json({ error: 'Order not found.' }, { status: 404 })

  const setup = getStripe({ purpose: 'read' })
  if (!setup.ok) return json({ error: 'Order lookup is unavailable.' }, { status: 503 })

  try {
    const session = await setup.stripe.checkout.sessions.retrieve(id, { expand: ['payment_intent'] })
    if (session.metadata?.source !== 'nova-web') return json({ error: 'Order not found.' }, { status: 404 })
    const items = await setup.stripe.checkout.sessions.listLineItems(id, { limit: 50, expand: ['data.price.product'] })
    const pi = session.payment_intent && typeof session.payment_intent === 'object' ? (session.payment_intent as Stripe.PaymentIntent) : null
    return json(toOrderView(session, items.data, pi?.status ?? null))
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode
    if (status === 404) return json({ error: 'Order not found.' }, { status: 404 })
    logEvent('order_lookup_failed', { code: (err as { code?: string }).code ?? 'unknown' })
    return json({ error: 'We could not load your order.' }, { status: 502 })
  }
}

async function polarOrder(id: string): Promise<Response> {
  const checkout = await getPolarCheckout(id)
  if (checkout === 'missing') return json({ error: 'Order not found.' }, { status: 404 })
  if (checkout === 'unavailable') return json({ error: 'Order lookup is unavailable.' }, { status: 503 })
  if (checkout === 'error') return json({ error: 'We could not load your order.' }, { status: 502 })
  return json(polarCheckoutToOrderView(checkout))
}

export const POST = () => methodNotAllowed(['GET'])
