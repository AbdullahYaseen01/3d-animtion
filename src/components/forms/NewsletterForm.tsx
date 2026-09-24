import { useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { track } from '../../lib/analytics'
import { Icon } from '../ui/Icon'
import './Forms.css'

type Status = { kind: 'idle' } | { kind: 'submitting' } | { kind: 'success'; message: string } | { kind: 'error'; message: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function NewsletterForm({ source, tone = 'light' }: { source: string; tone?: 'light' | 'dark' }) {
  const id = useId()
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [fieldError, setFieldError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const honeypot = useRef<HTMLInputElement>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status.kind === 'submitting') return
    if (!EMAIL_RE.test(email.trim())) {
      setFieldError('Enter a valid email address, like name@example.com.')
      inputRef.current?.focus()
      return
    }
    if (!consent) {
      setFieldError('Please confirm you want to receive NOVA emails.')
      return
    }
    setFieldError(null)
    setStatus({ kind: 'submitting' })
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), consent, source, company: honeypot.current?.value ?? '' }),
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string }
      if (res.ok) {
        setStatus({ kind: 'success', message: data.message ?? "You're on the list." })
        track('sign_up', { method: 'newsletter', source })
      } else {
        setStatus({ kind: 'error', message: data.error ?? 'Signup failed. Please try again in a moment.' })
      }
    } catch {
      setStatus({ kind: 'error', message: 'We could not reach our email service. Check your connection and try again.' })
    }
  }

  if (status.kind === 'success') {
    return (
      <div className={`newsletter newsletter--${tone}`} role="status">
        <p className="newsletter__success">
          <Icon name="check" /> {status.message}
        </p>
      </div>
    )
  }

  const errorId = `${id}-error`
  return (
    <form className={`newsletter newsletter--${tone}`} onSubmit={submit} noValidate>
      <div className="newsletter__row">
        <label htmlFor={`${id}-email`} className="visually-hidden">
          Email address
        </label>
        <input
          ref={inputRef}
          id={`${id}-email`}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="Email address"
          className="input newsletter__input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={fieldError?.startsWith('Enter') ? true : undefined}
          aria-describedby={fieldError ? errorId : undefined}
          required
        />
        <button type="submit" className={`btn ${tone === 'dark' ? 'btn--light' : ''}`} disabled={status.kind === 'submitting'}>
          {status.kind === 'submitting' ? (
            <>
              <span className="spinner" aria-hidden="true" /> Joining…
            </>
          ) : (
            'Join the list'
          )}
        </button>
      </div>
      <div className="newsletter__trap" aria-hidden="true">
        <label>
          Company <input ref={honeypot} type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="checkbox">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>
          Yes, email me about new releases and restocks. Unsubscribe anytime. See our <Link to="/privacy">privacy policy</Link>.
        </span>
      </label>
      {fieldError && (
        <p className="field-error" id={errorId} role="alert">
          <Icon name="alert" size={18} /> {fieldError}
        </p>
      )}
      {status.kind === 'error' && (
        <p className="field-error" role="alert">
          <Icon name="alert" size={18} /> {status.message}
        </p>
      )}
    </form>
  )
}
