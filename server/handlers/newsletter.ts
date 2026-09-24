import { env, isEmail, isSameOrigin, json, logEvent, methodNotAllowed, readJson } from '../http.js'
import { resendRequest } from '../resend.js'

export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: 'Forbidden' }, { status: 403 })
  const body = await readJson(request)
  if (!body) return json({ error: 'Invalid request.' }, { status: 400 })

  // Honeypot: real visitors never fill the hidden "company" field.
  if (typeof body.company === 'string' && body.company.trim()) return json({ ok: true })

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!isEmail(email)) return json({ error: 'Enter a valid email address.', field: 'email' }, { status: 422 })
  if (body.consent !== true) return json({ error: 'Please confirm you would like to receive emails.', field: 'consent' }, { status: 422 })

  if (!env('RESEND_API_KEY')) {
    logEvent('newsletter_unavailable')
    return json({ error: 'Email sign-up is not available yet. Please check back soon.', code: 'unavailable' }, { status: 503 })
  }

  const segment = env('RESEND_SEGMENT_ID')
  const result = await resendRequest('/contacts', { email, unsubscribed: false, ...(segment ? { segments: [{ id: segment }] } : {}) })
  if (result.ok || result.status === 409 || (!result.ok && /already exist/i.test(result.message))) {
    logEvent('newsletter_subscribed', { source: typeof body.source === 'string' ? body.source.slice(0, 32) : undefined })
    return json({ ok: true })
  }
  logEvent('newsletter_failed', { status: result.status })
  return json({ error: 'We could not sign you up right now. Please try again later.' }, { status: 502 })
}

export const GET = () => methodNotAllowed(['POST'])
