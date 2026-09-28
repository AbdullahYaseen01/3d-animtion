import { useEffect, useId, useState, type ReactNode } from 'react'
import { US_STATES, validateDelivery, type DeliveryErrors } from '../../commerce/delivery'
import { useCheckout } from '../../commerce/useCheckout'
import { Icon } from '../ui/Icon'

const STORAGE_KEY = 'nova:delivery'

type Draft = {
  fullName: string
  phone: string
  house: string
  street: string
  city: string
  state: string
  zip: string
  notes: string
}

const EMPTY: Draft = { fullName: '', phone: '', house: '', street: '', city: '', state: '', zip: '', notes: '' }

function loadDraft(): Draft {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<Draft>
    return { ...EMPTY, ...parsed }
  } catch {
    return EMPTY
  }
}

export function DeliveryForm() {
  const id = useId()
  const { start, status, problem } = useCheckout()
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [errors, setErrors] = useState<DeliveryErrors>({})
  const busy = status !== 'idle'

  useEffect(() => {
    setDraft(loadDraft())
  }, [])

  useEffect(() => {
    if (problem?.fields) setErrors(problem.fields)
  }, [problem])

  const set = (key: keyof Draft, value: string) => {
    setDraft((current) => {
      const next = { ...current, [key]: value }
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        /* Private browsing can block storage. The form still submits. */
      }
      return next
    })
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const submit = () => {
    const result = validateDelivery(draft)
    if (!result.ok) {
      setErrors(result.errors)
      const first = Object.keys(result.errors)[0]
      if (first) document.getElementById(`${id}-${first}`)?.focus()
      return
    }
    setErrors({})
    void start(result.delivery)
  }

  return (
    <form
      id="delivery"
      className="delivery-form"
      onSubmit={(event) => {
        event.preventDefault()
        if (!busy) submit()
      }}
    >
      <div>
        <h2>Delivery address</h2>
        <p className="muted">We ship to the house or apartment below. Payment happens on the next page.</p>
      </div>
      <div className="delivery-form__grid">
        <Field id={`${id}-fullName`} label="Full name" error={errors.fullName} className="delivery-form__wide">
          <input id={`${id}-fullName`} className="input" name="name" autoComplete="shipping name" value={draft.fullName} required aria-invalid={errors.fullName ? true : undefined} aria-describedby={errors.fullName ? `${id}-fullName-error` : undefined} onChange={(event) => set('fullName', event.target.value)} />
        </Field>
        <Field id={`${id}-phone`} label="Phone number" error={errors.phone}>
          <input id={`${id}-phone`} className="input" name="phone" type="tel" inputMode="tel" autoComplete="shipping tel" placeholder="(555) 123-4567" value={draft.phone} required aria-invalid={errors.phone ? true : undefined} aria-describedby={errors.phone ? `${id}-phone-error` : undefined} onChange={(event) => set('phone', event.target.value)} />
        </Field>
        <Field id={`${id}-house`} label="House or apartment number" error={errors.house}>
          <input id={`${id}-house`} className="input" name="address-line2" autoComplete="shipping address-line2" placeholder="12 or Apt 4B" value={draft.house} required aria-invalid={errors.house ? true : undefined} aria-describedby={errors.house ? `${id}-house-error` : undefined} onChange={(event) => set('house', event.target.value)} />
        </Field>
        <Field id={`${id}-street`} label="Street" error={errors.street} className="delivery-form__wide">
          <input id={`${id}-street`} className="input" name="address-line1" autoComplete="shipping address-line1" placeholder="Main Street" value={draft.street} required aria-invalid={errors.street ? true : undefined} aria-describedby={errors.street ? `${id}-street-error` : undefined} onChange={(event) => set('street', event.target.value)} />
        </Field>
        <Field id={`${id}-city`} label="City" error={errors.city}>
          <input id={`${id}-city`} className="input" name="city" autoComplete="shipping address-level2" value={draft.city} required aria-invalid={errors.city ? true : undefined} aria-describedby={errors.city ? `${id}-city-error` : undefined} onChange={(event) => set('city', event.target.value)} />
        </Field>
        <Field id={`${id}-state`} label="State" error={errors.state}>
          <select id={`${id}-state`} className="select" name="state" autoComplete="shipping address-level1" value={draft.state} required aria-invalid={errors.state ? true : undefined} aria-describedby={errors.state ? `${id}-state-error` : undefined} onChange={(event) => set('state', event.target.value)}>
            <option value="">Select a state</option>
            {US_STATES.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>
        </Field>
        <Field id={`${id}-zip`} label="ZIP code" error={errors.zip}>
          <input id={`${id}-zip`} className="input" name="zip" inputMode="numeric" autoComplete="shipping postal-code" placeholder="97201" value={draft.zip} required aria-invalid={errors.zip ? true : undefined} aria-describedby={errors.zip ? `${id}-zip-error` : undefined} onChange={(event) => set('zip', event.target.value)} />
        </Field>
        <Field id={`${id}-country`} label="Country">
          <input id={`${id}-country`} className="input" name="country" value="United States" autoComplete="shipping country-name" readOnly />
        </Field>
        <Field id={`${id}-notes`} label="Delivery note" error={errors.notes} hint="Optional. Gate code, buzzer, or where to leave the package." className="delivery-form__wide">
          <textarea id={`${id}-notes`} className="textarea" name="notes" rows={2} maxLength={120} value={draft.notes} aria-invalid={errors.notes ? true : undefined} aria-describedby={[errors.notes ? `${id}-notes-error` : '', `${id}-notes-hint`].filter(Boolean).join(' ') || undefined} onChange={(event) => set('notes', event.target.value)} />
        </Field>
      </div>
      {problem && !problem.fields && (
        <div className={`notice ${problem.adjusted ? 'notice--warning' : 'notice--error'}`} role="alert">
          <Icon name="alert" size={18} />
          <span>{problem.message}</span>
        </div>
      )}
      <button type="submit" className="btn btn--lg btn--block" disabled={busy} aria-busy={busy}>
        {busy ? (
          <>
            <span className="spinner" aria-hidden="true" /> {status === 'redirecting' ? 'Opening secure checkout…' : 'Checking availability…'}
          </>
        ) : (
          <>
            <Icon name="lock" size={18} /> Secure checkout
          </>
        )}
      </button>
      <p className="checkout-cta__note">Guest checkout. Payment is handled securely by Polar; Westora Style never sees your card number.</p>
    </form>
  )
}

function Field({
  id,
  label,
  error,
  hint,
  className,
  children,
}: {
  id: string
  label: string
  error?: string
  hint?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={`field${className ? ` ${className}` : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
