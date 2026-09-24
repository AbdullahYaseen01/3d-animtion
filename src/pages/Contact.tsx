import { useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { CONTACT_TOPICS } from '../config/contact'
import { store } from '../config/store'
import { InfoPage } from '../components/layout/InfoPage'
import { Icon } from '../components/ui/Icon'
import { track } from '../lib/analytics'
import '../components/forms/Forms.css'

type Fields = { name: string; email: string; topic: string; order: string; message: string }
type Status = { kind: 'idle' } | { kind: 'submitting' } | { kind: 'sent' } | { kind: 'error'; message: string; unavailable?: boolean }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(f: Fields): Partial<Record<keyof Fields, string>> {
  const e: Partial<Record<keyof Fields, string>> = {}
  if (!f.name.trim()) e.name = 'Enter your name.'
  if (!EMAIL_RE.test(f.email.trim())) e.email = 'Enter a valid email address, like name@example.com.'
  if (f.message.trim().length < 10) e.message = 'Tell us a little more (at least 10 characters).'
  return e
}

export default function Contact() {
  const id = useId()
  const [fields, setFields] = useState<Fields>({ name: '', email: '', topic: CONTACT_TOPICS[0], order: '', message: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const honeypot = useRef<HTMLInputElement>(null)
  const submissionId = useRef<string>('')
  const formRef = useRef<HTMLFormElement>(null)

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFields((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status.kind === 'submitting') return
    const errs = validate(fields)
    setErrors(errs)
    const first = Object.keys(errs)[0]
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    if (!submissionId.current) submissionId.current = crypto.randomUUID()
    setStatus({ kind: 'submitting' })
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, company: honeypot.current?.value ?? '', submissionId: submissionId.current }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string; errors?: Partial<Record<keyof Fields, string>>; code?: string }
      if (res.ok) {
        setStatus({ kind: 'sent' })
        track('generate_lead', { method: 'contact_form', topic: fields.topic })
        return
      }
      if (data.errors) setErrors(data.errors)
      setStatus({ kind: 'error', message: data.error ?? 'Your message could not be sent.', unavailable: data.code === 'unavailable' })
    } catch {
      setStatus({ kind: 'error', message: 'We could not reach our servers. Check your connection and try again.' })
    }
  }

  const field = (k: keyof Fields) => ({
    id: `${id}-${k}`,
    name: k,
    value: fields[k],
    onChange: set(k),
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `${id}-${k}-err` : undefined,
  })
  const err = (k: keyof Fields) =>
    errors[k] && (
      <p className="field-error" id={`${id}-${k}-err`}>
        <Icon name="alert" size={16} /> {errors[k]}
      </p>
    )

  return (
    <InfoPage
      seo={{ title: 'Contact Us', description: 'Questions about sizing, an order or returns? Contact the NOVA team by email or with our contact form.', path: '/contact' }}
      eyebrow="Help"
      title="Contact us"
      intro={<p>Questions about sizing, an order or a return? Send us a message and we will reply by email.</p>}
      help={false}
      aside={
        <>
          <h2>Other ways to reach us</h2>
          <p>
            <Icon name="mail" size={18} /> <a href={`mailto:${store.supportEmail}`}>{store.supportEmail}</a>
          </p>
          <p className="muted">Include your order number if your question is about an order.</p>
          <p>
            Helpful pages: <Link to="/faq">FAQ</Link> · <Link to="/fit-guide">Size & fit</Link> · <Link to="/shipping">Shipping</Link> · <Link to="/returns">Returns</Link>
          </p>
        </>
      }
    >
      {status.kind === 'sent' ? (
        <div className="notice notice--success" role="status">
          <Icon name="check" size={18} />
          <div>
            <p>
              <strong>Thanks, {fields.name.split(' ')[0]}. Your message has been sent.</strong>
            </p>
            <p>We will reply to {fields.email}.</p>
          </div>
        </div>
      ) : (
        <form ref={formRef} className="form-grid" onSubmit={submit} noValidate aria-describedby={`${id}-req`}>
          <p id={`${id}-req`} className="field-hint">
            All fields are required unless marked optional.
          </p>
          <div className="form-grid form-grid--2">
            <div className="field">
              <label htmlFor={`${id}-name`}>Name</label>
              <input className="input" type="text" autoComplete="name" required {...field('name')} />
              {err('name')}
            </div>
            <div className="field">
              <label htmlFor={`${id}-email`}>Email</label>
              <input className="input" type="email" autoComplete="email" inputMode="email" required {...field('email')} />
              {err('email')}
            </div>
          </div>
          <div className="form-grid form-grid--2">
            <div className="field">
              <label htmlFor={`${id}-topic`}>Topic</label>
              <select className="select" {...field('topic')}>
                {CONTACT_TOPICS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor={`${id}-order`}>
                Order number <span className="muted">(optional)</span>
              </label>
              <input className="input" type="text" placeholder="NV-…" {...field('order')} />
            </div>
          </div>
          <div className="field">
            <label htmlFor={`${id}-message`}>Message</label>
            <textarea className="textarea" rows={6} required {...field('message')} />
            {err('message')}
          </div>
          <div className="newsletter__trap" aria-hidden="true">
            <label>
              Company <input ref={honeypot} type="text" name="company" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          {status.kind === 'error' && (
            <div className="notice notice--error" role="alert">
              <Icon name="alert" size={18} />
              <p>
                {status.message} {status.unavailable ? 'Please email us instead at ' : 'You can also email '}
                <a href={`mailto:${store.supportEmail}`}>{store.supportEmail}</a>.
              </p>
            </div>
          )}
          <div>
            <button type="submit" className="btn btn--lg" disabled={status.kind === 'submitting'}>
              {status.kind === 'submitting' ? (
                <>
                  <span className="spinner" aria-hidden="true" /> Sending…
                </>
              ) : (
                'Send message'
              )}
            </button>
          </div>
          <p className="field-hint">
            We use your details only to reply to you. See our <Link to="/privacy">privacy policy</Link>.
          </p>
        </form>
      )}
    </InfoPage>
  )
}
