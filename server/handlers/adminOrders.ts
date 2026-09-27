import type Stripe from 'stripe'
import { isCustomerOrder, toAdminOrder } from '../adminOrder.js'
import { requestIsAdmin } from '../adminAuth.js'
import { json, logEvent, methodNotAllowed } from '../http.js'
import { getStripe } from '../stripe.js'

const LIST_LIMIT = 50

export async function GET(request: Request): Promise<Response> {
  if (!requestIsAdmin(request)) return json({ error: 'Sign in required.' }, { status: 401 })

  const setup = getStripe({ purpose: 'read' })
  if (!setup.ok) return json({ error: setup.reason, code: 'stripe' }, { status: 503 })

  try {
    const page = await listSessions(setup.stripe)
    const orders = page.data.filter(isCustomerOrder).map((session) => {
      const pi = session.payment_intent
      const status = pi && typeof pi === 'object' ? (pi as Stripe.PaymentIntent).status : null
      return toAdminOrder(session, status)
    })
    return json({ orders, hasMore: page.has_more })
  } catch (err) {
    logEvent('admin_orders_failed', { code: (err as { code?: string }).code ?? 'unknown' })
    return json({ error: 'We could not load orders from Stripe.' }, { status: 502 })
  }
}

async function listSessions(stripe: Stripe): Promise<Stripe.ApiList<Stripe.Checkout.Session>> {
  const expand = ['data.line_items.data.price.product', 'data.payment_intent']
  try {
    return await stripe.checkout.sessions.list({ limit: LIST_LIMIT, expand })
  } catch (err) {
    logEvent('admin_orders_expand_failed', { code: (err as { code?: string }).code ?? 'unknown' })
    return stripe.checkout.sessions.list({ limit: LIST_LIMIT })
  }
}

export const POST = () => methodNotAllowed(['GET'])
