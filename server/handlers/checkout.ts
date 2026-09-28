import { priceCart, validateLines } from '../../src/commerce/cart.js'
import { packDeliveryMetadata, validateDelivery } from '../../src/commerce/delivery.js'
import { cartHash, packCartMetadata } from '../checkoutSession.js'
import { isSameOrigin, json, logEvent, methodNotAllowed, readJson, requestOrigin } from '../http.js'
import { createCheckout } from '../polar.js'

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

  const deliveryResult = validateDelivery(body.delivery)
  if (!deliveryResult.ok) {
    const first = Object.values(deliveryResult.errors)[0] ?? 'Enter the delivery address so we can ship this order.'
    return json({ error: first, fields: deliveryResult.errors }, { status: 422 })
  }
  const delivery = deliveryResult.delivery

  const attemptId = typeof body.attemptId === 'string' && ATTEMPT_RE.test(body.attemptId) ? body.attemptId : crypto.randomUUID()
  const cart = priceCart(lines)
  const hash = await cartHash(lines)
  const shipHash = await cartHash([{ sku: packDeliveryMetadata(delivery).ship, quantity: 1 }])
  const origin = requestOrigin(request)
  const result = await createCheckout({
    amountCents: cart.totalBeforeTaxCents,
    successUrl: `${origin}/checkout/success?session_id={CHECKOUT_ID}`,
    returnUrl: `${origin}/cart?checkout=canceled`,
    metadata: { ...packCartMetadata(lines, hash), ...packDeliveryMetadata(delivery) },
    delivery,
    idempotencyKey: `checkout_${attemptId}_${hash}_${shipHash}`,
  })

  if (!result.ok) {
    if (result.httpStatus === 503) {
      logEvent('checkout_unavailable', { missing: (result.missing ?? []).join(',') })
      return json({ error: `${result.reason} Your cart is saved; please try again later or contact us to order.`, code: 'checkout_unavailable' }, { status: 503 })
    }
    if (result.httpStatus === 400) return json({ error: result.reason }, { status: 400 })
    return json({ error: result.reason }, { status: 502 })
  }

  logEvent('checkout_session_created', { session: result.id, lines: lines.length })
  return json({ url: result.url })
}

export const GET = () => methodNotAllowed(['POST'])
