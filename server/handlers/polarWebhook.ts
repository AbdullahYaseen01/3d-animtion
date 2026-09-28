import { escapeHtml } from '../resend.js'
import { claimOnce, notifyPolarPayment } from '../fulfillment.js'
import { env, json, logEvent, methodNotAllowed } from '../http.js'
import { polarOrderToAdmin } from '../polarOrder.js'
import type { PolarOrder } from '../polar.js'
import { verifyPolarWebhook } from '../polarWebhook.js'
import { formatMoney } from '../../src/lib/money.js'

const MAX_BODY = 1_000_000

export async function POST(request: Request): Promise<Response> {
  const secret = env('POLAR_WEBHOOK_SECRET')
  if (!secret) return json({ error: 'Webhook is not configured.' }, { status: 503 })

  const body = await request.text()
  if (body.length > MAX_BODY) return new Response('Payload too large', { status: 413 })

  const ok = verifyPolarWebhook(
    body,
    {
      id: request.headers.get('webhook-id') ?? '',
      timestamp: request.headers.get('webhook-timestamp') ?? '',
      signature: request.headers.get('webhook-signature') ?? '',
    },
    secret,
  )
  if (!ok) return new Response('Invalid signature', { status: 403 })

  let event: { type?: string; data?: PolarOrder }
  try {
    event = JSON.parse(body) as { type?: string; data?: PolarOrder }
  } catch {
    return json({ error: 'Invalid payload.' }, { status: 400 })
  }

  if (event.type !== 'order.paid' || !event.data?.id) return json({ received: true })
  if (event.data.metadata?.source !== 'nova-web') return json({ received: true })

  try {
    const claimed = await claimOnce(event.data.id)
    if (!claimed) return json({ received: true })
    const view = polarOrderToAdmin(event.data)
    const rows = view.lines
      .map(
        (line) =>
          `<tr><td>${escapeHtml(line.name)}${line.sku ? `<br><small>${escapeHtml(line.sku)}</small>` : ''}</td><td>${line.quantity}</td><td>${formatMoney(line.totalCents)}</td></tr>`,
      )
      .join('')
    await notifyPolarPayment({ id: event.data.id, orderNumber: view.orderNumber, totalCents: view.totalCents, rowsHtml: rows })
    logEvent('order_paid', { order: view.orderNumber })
    return json({ received: true })
  } catch {
    logEvent('order_fulfill_failed', { status: 'claim' })
    return json({ error: 'Please retry.' }, { status: 500 })
  }
}

export const GET = () => methodNotAllowed(['POST'])
