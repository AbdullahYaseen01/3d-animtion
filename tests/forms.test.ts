import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST as newsletter } from '../server/handlers/newsletter'
import { POST as contact } from '../server/handlers/contact'

const post = (url: string, body: unknown) =>
  new Request(`https://nova.test${url}`, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nova.test' }, body: JSON.stringify(body) })

const fetchMock = vi.fn()
beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  vi.spyOn(console, 'log').mockImplementation(() => {})
  delete process.env.RESEND_API_KEY
  delete process.env.RESEND_SEGMENT_ID
  delete process.env.CONTACT_TO_EMAIL
  delete process.env.CONTACT_FROM_EMAIL
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const ok = (status = 200, body: unknown = { id: 'x' }) => new Response(JSON.stringify(body), { status })

describe('POST /api/newsletter', () => {
  it('returns 503 when email service is not configured (never a fake success)', async () => {
    const res = await newsletter(post('/api/newsletter', { email: 'a@b.co', consent: true }))
    expect(res.status).toBe(503)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('validates email and consent', async () => {
    process.env.RESEND_API_KEY = 're_test'
    expect((await newsletter(post('/api/newsletter', { email: 'nope', consent: true }))).status).toBe(422)
    expect((await newsletter(post('/api/newsletter', { email: 'a@b.co', consent: false }))).status).toBe(422)
  })

  it('quietly accepts honeypot submissions without calling the service', async () => {
    process.env.RESEND_API_KEY = 're_test'
    const res = await newsletter(post('/api/newsletter', { email: 'a@b.co', consent: true, company: 'Spam Inc' }))
    expect(res.status).toBe(200)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('creates the contact in the configured segment', async () => {
    process.env.RESEND_API_KEY = 're_test'
    process.env.RESEND_SEGMENT_ID = 'seg_1'
    fetchMock.mockResolvedValue(ok())
    const res = await newsletter(post('/api/newsletter', { email: 'A@B.co ', consent: true }))
    expect(res.status).toBe(200)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.resend.com/contacts')
    expect(JSON.parse(init.body)).toEqual({ email: 'a@b.co', unsubscribed: false, segments: [{ id: 'seg_1' }] })
  })

  it('treats an existing contact as success and a service error as failure', async () => {
    process.env.RESEND_API_KEY = 're_test'
    fetchMock.mockResolvedValueOnce(ok(409, { message: 'Contact already exists' }))
    expect((await newsletter(post('/api/newsletter', { email: 'a@b.co', consent: true }))).status).toBe(200)
    fetchMock.mockResolvedValueOnce(ok(500, { message: 'boom' }))
    expect((await newsletter(post('/api/newsletter', { email: 'a@b.co', consent: true }))).status).toBe(502)
  })
})

describe('POST /api/contact', () => {
  const valid = { name: 'Pat', email: 'pat@example.com', topic: 'Returns', message: 'Where do I send my return?', submissionId: 'sub_12345678' }

  it('returns field errors', async () => {
    const res = await contact(post('/api/contact', { name: '', email: 'x', message: 'short' }))
    expect(res.status).toBe(422)
    expect(Object.keys((await res.json()).errors).sort()).toEqual(['email', 'message', 'name'])
  })

  it('returns 503 when not configured', async () => {
    expect((await contact(post('/api/contact', valid))).status).toBe(503)
  })

  it('sends with reply-to and an idempotency key, escaping HTML', async () => {
    process.env.RESEND_API_KEY = 're_test'
    process.env.CONTACT_TO_EMAIL = 'support@nova.test'
    process.env.CONTACT_FROM_EMAIL = 'NOVA <web@nova.test>'
    fetchMock.mockResolvedValue(ok())
    const res = await contact(post('/api/contact', { ...valid, message: '<script>alert(1)</script> hello there' }))
    expect(res.status).toBe(200)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.resend.com/emails')
    expect(init.headers['Idempotency-Key']).toBe('contact-sub_12345678')
    const body = JSON.parse(init.body)
    expect(body.reply_to).toBe('pat@example.com')
    expect(body.html).not.toContain('<script>')
  })
})
