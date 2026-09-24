import { priceCart, validateLines } from '../../src/commerce/cart.js'
import { buildSessionParams, cartHash } from '../checkoutSession.js'
import { env, isSameOrigin, json, logEvent, methodNotAllowed, readJson, requestOrigin } from '../http.js'
import { getStripe } from '../stripe.js'

const ATTEMPT_RE = /^[A-Za-z0-9_-]{8,64}$/

export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: 'Forbidden' }, { status: 403 })
  const body = await readJson(request)
  if (!body) return json({ error: 'Invalid request.' }, { status: 400 })

  const { lines, issues } = validateLines(body.lines)
  if (issues.length > 0) {
    return json({ error: 'Some items in your cart changed. Please review your cart and try again.', lines, issues }, { status: 409 })
  }
  if (lines.length === 0) return json({ error: 'Your cart is empty.' }, { status: 400 })

  const setup = getStripe()
  if (!setup.ok) {
    logEvent('checkout_unavailable', { missing: setup.missing.join(',') })
    return json({ error: `${setup.reason} Your cart is saved; please try again later or contact us to order.`, code: 'checkout_unavailable' }, { status: 503 })
  }

  const attemptId = typeof body.attemptId === 'string' && ATTEMPT_RE.test(body.attemptId) ? body.attemptId : crypto.randomUUID()
  const cart = priceCart(lines)
  const hash = await cartHash(lines)
  const params = buildSessionParams(cart, {
    origin: requestOrigin(request),
    automaticTax: env('STRIPE_AUTOMATIC_TAX') === 'true',
    hash,
  })

  try {
    const session = await setup.stripe.checkout.sessions.create(params, { idempotencyKey: `checkout_${attemptId}_${hash}` })
    if (!session.url) throw new Error('Session has no URL')
    logEvent('checkout_session_created', { session: session.id, lines: lines.length })
    return json({ url: session.url })
  } catch (err) {
    const code = (err as { code?: string; type?: string }).code ?? (err as { type?: string }).type ?? 'unknown'
    logEvent('checkout_session_failed', { code })
    return json({ error: 'We could not start checkout. Please try again in a moment.' }, { status: 502 })
  }
}

export const GET = () => methodNotAllowed(['POST'])
