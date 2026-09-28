import { createHmac, timingSafeEqual } from 'node:crypto'

const TOLERANCE_SEC = 5 * 60

export interface PolarWebhookHeaders {
  id: string
  timestamp: string
  signature: string
}

/** Standard Webhooks key: strip `whsec_` and base64-decode. Older secrets are used as raw UTF-8. */
export function polarWebhookKey(secret: string): Buffer {
  if (secret.startsWith('whsec_')) return Buffer.from(secret.slice('whsec_'.length), 'base64')
  return Buffer.from(secret, 'utf8')
}

/**
 * Verifies a Polar webhook. Polar signs `id.timestamp.body` with HMAC-SHA256
 * and sends `v1,<base64>` in `webhook-signature`.
 */
export function verifyPolarWebhook(body: string, headers: PolarWebhookHeaders, secret: string, nowSec = Date.now() / 1000): boolean {
  const { id, timestamp, signature } = headers
  if (!id || !timestamp || !signature || id.length > 200 || timestamp.length > 20) return false
  const key = polarWebhookKey(secret)
  if (key.length === 0) return false
  const ts = Number(timestamp)
  if (!Number.isFinite(ts) || Math.abs(nowSec - ts) > TOLERANCE_SEC) return false
  const expected = createHmac('sha256', key).update(`${id}.${timestamp}.${body}`).digest()
  return signature.split(' ').some((part) => {
    if (!part.startsWith('v1,')) return false
    const got = Buffer.from(part.slice(3), 'base64')
    return got.length === expected.length && timingSafeEqual(got, expected)
  })
}
