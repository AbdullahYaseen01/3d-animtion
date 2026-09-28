import { useEffect, useId, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import type { AdminOrder } from '../../server/adminOrder'
import { formatMoney } from '../lib/money'
import { Seo } from '../lib/seo'
import { store } from '../config/store'
import './Admin.css'

type Filter = 'all' | 'paid' | 'processing' | 'other'
type LoadState =
  | { kind: 'checking' }
  | { kind: 'login'; error?: string; unconfigured?: boolean }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; orders: AdminOrder[]; hasMore: boolean; provider: 'polar' | 'stripe' }

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'paid', label: 'Paid' },
  { id: 'processing', label: 'Processing' },
  { id: 'other', label: 'Other' },
]

const when = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' })

function matches(order: AdminOrder, filter: Filter): boolean {
  if (filter === 'all') return true
  if (filter === 'paid') return order.status === 'paid'
  if (filter === 'processing') return order.status === 'processing'
  return order.status !== 'paid' && order.status !== 'processing'
}

async function loadOrders(): Promise<LoadState> {
  const res = await fetch('/api/admin/orders', { cache: 'no-store' })
  const data = (await res.json().catch(() => ({}))) as { error?: string; orders?: AdminOrder[]; hasMore?: boolean; provider?: string }
  if (res.status === 401) return { kind: 'login' }
  if (!res.ok) return { kind: 'error', message: data.error ?? 'Orders could not be loaded.' }
  return { kind: 'ready', orders: data.orders ?? [], hasMore: Boolean(data.hasMore), provider: data.provider === 'polar' ? 'polar' : 'stripe' }
}

export default function Admin() {
  const [state, setState] = useState<LoadState>({ kind: 'checking' })
  const [filter, setFilter] = useState<Filter>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    loadOrders()
      .then((next) => {
        if (!cancelled) setState(next)
      })
      .catch(() => {
        if (!cancelled) setState({ kind: 'error', message: 'We could not reach the server.' })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="admin">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Seo title="Orders" description="Private order desk for paid customer checkouts." path="/admin" noindex rawTitle />
      <header className="admin-bar">
        <p className="admin-bar__brand">{store.name}</p>
        <p className="admin-bar__label">Order desk</p>
        <div className="admin-bar__actions">
          <Link to="/" className="admin-bar__link">
            View store
          </Link>
          {(state.kind === 'ready' || state.kind === 'error') && (
            <button
              type="button"
              className="admin-bar__link"
              onClick={() => {
                void fetch('/api/admin/session', { method: 'DELETE' }).finally(() => {
                  setState({ kind: 'login' })
                  setOpenId(null)
                })
              }}
            >
              Sign out
            </button>
          )}
        </div>
      </header>
      <main id="main" className="admin-main" tabIndex={-1}>
        {state.kind === 'checking' && (
          <div className="admin-gate" aria-busy="true">
            <span className="spinner" aria-hidden="true" />
            <h1>Orders</h1>
            <p className="muted">Checking your sign-in.</p>
          </div>
        )}
        {state.kind === 'login' && (
          <Login
            error={state.error}
            unconfigured={state.unconfigured}
            onSuccess={() => {
              setState({ kind: 'checking' })
              loadOrders()
                .then(setState)
                .catch(() => setState({ kind: 'error', message: 'We could not reach the server.' }))
            }}
            onFailure={(error, unconfigured) => setState({ kind: 'login', error, unconfigured })}
          />
        )}
        {state.kind === 'error' && (
          <div className="admin-gate">
            <h1>Orders unavailable</h1>
            <p className="muted">{state.message}</p>
            <button type="button" className="btn" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        )}
        {state.kind === 'ready' && (
          <OrderDesk
            orders={state.orders}
            hasMore={state.hasMore}
            provider={state.provider}
            filter={filter}
            onFilter={setFilter}
            openId={openId}
            onOpen={setOpenId}
            onRefresh={() => {
              setState({ kind: 'checking' })
              loadOrders()
                .then(setState)
                .catch(() => setState({ kind: 'error', message: 'We could not reach the server.' }))
            }}
          />
        )}
      </main>
    </div>
  )
}

function Login({
  error,
  unconfigured,
  onSuccess,
  onFailure,
}: {
  error?: string
  unconfigured?: boolean
  onSuccess: () => void
  onFailure: (error: string, unconfigured?: boolean) => void
}) {
  const id = useId()
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (pending) return
    setPending(true)
    try {
      const res = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.status === 204) {
        onSuccess()
        return
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string; code?: string }
      onFailure(data.error ?? 'Sign-in failed.', data.code === 'unconfigured')
    } catch {
      onFailure('We could not reach the server.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="admin-gate admin-login" onSubmit={(event) => void submit(event)}>
      <p className="eyebrow">Owner</p>
      <h1>Sign in to orders</h1>
      <p className="muted">Customer checkouts from the store appear here after you sign in.</p>
      <div className="field">
        <label htmlFor={`${id}-password`}>Password</label>
        <input
          id={`${id}-password`}
          className="input"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error && (
          <p id={`${id}-error`} className="field-error" role="alert">
            {error}
          </p>
        )}
        {unconfigured && <p className="field-hint">Set ADMIN_PASSWORD in the Vercel project, then redeploy.</p>}
      </div>
      <button type="submit" className="btn" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}

function OrderDesk({
  orders,
  hasMore,
  provider,
  filter,
  onFilter,
  openId,
  onOpen,
  onRefresh,
}: {
  orders: AdminOrder[]
  hasMore: boolean
  provider: 'polar' | 'stripe'
  filter: Filter
  onFilter: (filter: Filter) => void
  openId: string | null
  onOpen: (id: string | null) => void
  onRefresh: () => void
}) {
  const visible = useMemo(() => orders.filter((order) => matches(order, filter)), [orders, filter])
  const paid = orders.filter((order) => order.status === 'paid')
  const revenue = paid.reduce((sum, order) => sum + order.totalCents, 0)
  const processing = orders.filter((order) => order.status === 'processing').length

  return (
    <div className="admin-desk">
      <div className="admin-desk__head">
        <div>
          <p className="eyebrow">{provider === 'polar' ? 'Polar' : 'Stripe'}</p>
          <h1>Customer orders</h1>
          <p className="muted">Paid and completed checkouts, newest first.</p>
        </div>
        <button type="button" className="btn btn--secondary" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      <dl className="admin-stats">
        <div>
          <dt>Paid orders</dt>
          <dd>{paid.length}</dd>
        </div>
        <div>
          <dt>Paid revenue</dt>
          <dd>{formatMoney(revenue)}</dd>
        </div>
        <div>
          <dt>Still processing</dt>
          <dd>{processing}</dd>
        </div>
      </dl>

      <div className="admin-filters" role="group" aria-label="Filter orders">
        {FILTERS.map((item) => (
          <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => onFilter(item.id)}>
            {item.label}
          </button>
        ))}
      </div>

      {orders.length === 0 && <p className="admin-empty">No customer orders yet. A completed checkout will show up here.</p>}
      {orders.length > 0 && visible.length === 0 && <p className="admin-empty">Nothing in this filter.</p>}

      <ul className="admin-orders" role="list">
        {visible.map((order) => {
          const open = openId === order.orderNumber
          return (
            <li key={order.orderNumber}>
              <article className="admin-order">
                <button
                  type="button"
                  className="admin-order__toggle"
                  aria-expanded={open}
                  onClick={() => onOpen(open ? null : order.orderNumber)}
                >
                  <span className={`admin-status admin-status--${order.status}`}>{order.status}</span>
                  <span className="admin-order__id">{order.orderNumber}</span>
                  <span className="admin-order__who">{order.name || order.email || 'Customer'}</span>
                  <time dateTime={order.createdAt}>{when.format(new Date(order.createdAt))}</time>
                  <span className="admin-order__total">{formatMoney(order.totalCents)}</span>
                </button>
                {open && <OrderDetail order={order} />}
              </article>
            </li>
          )
        })}
      </ul>
      {hasMore && <p className="field-hint">Showing the latest 50 checkouts. Older ones stay in the {provider === 'polar' ? 'Polar' : 'Stripe'} dashboard.</p>}
    </div>
  )
}

function OrderDetail({ order }: { order: AdminOrder }) {
  return (
    <div className="admin-detail">
      <section>
        <h2>Customer</h2>
        <p>{order.name ?? 'Name not collected'}</p>
        {order.email && (
          <p>
            <a href={`mailto:${order.email}`}>{order.email}</a>
          </p>
        )}
        {order.phone && <p>{order.phone}</p>}
        {order.addressLines.length > 0 && (
          <address>
            {order.addressLines.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </address>
        )}
      </section>
      <section>
        <h2>Items</h2>
        {order.lines.length === 0 ? (
          <p className="muted">Line items were not included on this checkout. The total below is still the amount charged.</p>
        ) : (
          <ul role="list" className="admin-lines">
            {order.lines.map((line, index) => (
              <li key={`${line.name}-${index}`}>
                <span>
                  <strong>{line.name}</strong>
                  {line.sku && <span className="muted">{line.sku}</span>}
                </span>
                <span>× {line.quantity}</span>
                <span>{formatMoney(line.totalCents)}</span>
              </li>
            ))}
          </ul>
        )}
        <dl className="admin-totals">
          <div>
            <dt>Subtotal</dt>
            <dd>{formatMoney(order.subtotalCents)}</dd>
          </div>
          <div>
            <dt>Shipping</dt>
            <dd>{order.shippingCents === 0 ? 'Free' : formatMoney(order.shippingCents)}</dd>
          </div>
          <div>
            <dt>Tax</dt>
            <dd>{formatMoney(order.taxCents)}</dd>
          </div>
          {order.discountCents > 0 && (
            <div>
              <dt>Discount</dt>
              <dd>−{formatMoney(order.discountCents)}</dd>
            </div>
          )}
          <div className="admin-totals__grand">
            <dt>Total</dt>
            <dd>{formatMoney(order.totalCents)}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
