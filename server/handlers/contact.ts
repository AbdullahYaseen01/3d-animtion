import { env, isEmail, isSameOrigin, json, logEvent, methodNotAllowed, readJson } from '../http.js'
import { escapeHtml, resendRequest } from '../resend.js'
import { CONTACT_TOPICS, type ContactTopic } from '../../src/config/contact.js'

function str(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: 'Forbidden' }, { status: 403 })
  const body = await readJson(request)
  if (!body) return json({ error: 'Invalid request.' }, { status: 400 })
  if (typeof body.company === 'string' && body.company.trim()) return json({ ok: true })

  const name = str(body.name, 100)
  const email = str(body.email, 254).toLowerCase()
  const topic: ContactTopic = CONTACT_TOPICS.includes(body.topic as ContactTopic) ? (body.topic as ContactTopic) : 'Something else'
  const order = str(body.order, 40)
  const message = str(body.message, 5000)
  const submissionId = str(body.submissionId, 64)

  const errors: Record<string, string> = {}
  if (!name) errors.name = 'Enter your name.'
  if (!isEmail(email)) errors.email = 'Enter a valid email address.'
  if (message.length < 10) errors.message = 'Tell us a little more (at least 10 characters).'
  if (Object.keys(errors).length) return json({ error: 'Please fix the highlighted fields.', errors }, { status: 422 })

  const to = env('CONTACT_TO_EMAIL')
  const from = env('CONTACT_FROM_EMAIL')
  if (!to || !from || !env('RESEND_API_KEY')) {
    logEvent('contact_unavailable')
    return json({ error: 'The contact form is not available yet.', code: 'unavailable' }, { status: 503 })
  }

  const result = await resendRequest(
    '/emails',
    {
      from,
      to: [to],
      reply_to: email,
      subject: `[Contact] ${topic}${order ? ` – order ${order}` : ''}`,
      text: `From: ${name} <${email}>\nTopic: ${topic}\nOrder: ${order || '—'}\n\n${message}`,
      html: `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;<br><strong>Topic:</strong> ${escapeHtml(topic)}<br><strong>Order:</strong> ${escapeHtml(order || '—')}</p><p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
    },
    /^[A-Za-z0-9_-]{8,64}$/.test(submissionId) ? `contact-${submissionId}` : undefined,
  )
  if (result.ok) {
    logEvent('contact_sent', { topic })
    return json({ ok: true })
  }
  logEvent('contact_failed', { status: result.status })
  return json({ error: 'Your message could not be sent. Please try again or email us directly.' }, { status: 502 })
}

export const GET = () => methodNotAllowed(['POST'])
