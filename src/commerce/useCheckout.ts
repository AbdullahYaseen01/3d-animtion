import { useCallback, useRef, useState } from 'react'
import type { CartLine } from './cart'
import { useCart } from '../state/CartProvider'
import { lineItem, money, track } from '../lib/analytics'

export interface CheckoutProblem {
  message: string
  /** Server-corrected lines when stock or prices changed. */
  adjusted?: boolean
}

function cartKey(lines: CartLine[]): string {
  return lines
    .map((l) => `${l.sku}x${l.quantity}`)
    .sort()
    .join('|')
}

/** Stable per cart contents so double submits reuse the same Stripe session. */
function attemptIdFor(lines: CartLine[]): string {
  const key = `nova:checkout-attempt:${cartKey(lines)}`
  try {
    const existing = sessionStorage.getItem(key)
    if (existing) return existing
    const id = crypto.randomUUID()
    sessionStorage.setItem(key, id)
    return id
  } catch {
    return crypto.randomUUID()
  }
}

export function useCheckout() {
  const { lines, cart, setQuantity, remove } = useCart()
  const [status, setStatus] = useState<'idle' | 'submitting' | 'redirecting'>('idle')
  const [problem, setProblem] = useState<CheckoutProblem | null>(null)
  const busy = useRef(false)

  const start = useCallback(async () => {
    if (busy.current || !lines.length) return
    busy.current = true
    setStatus('submitting')
    setProblem(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines, attemptId: attemptIdFor(lines) }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        url?: string
        error?: string
        lines?: CartLine[]
      }
      if (res.ok && data.url) {
        track('begin_checkout', { ...money(cart.subtotalCents), items: cart.lines.map(lineItem) })
        setStatus('redirecting')
        window.location.assign(data.url)
        return
      }
      if (res.status === 409 && Array.isArray(data.lines)) {
        const next = new Map(data.lines.map((l) => [l.sku, l.quantity]))
        lines.forEach((l) => {
          const q = next.get(l.sku)
          if (q == null) remove(l.sku)
          else if (q !== l.quantity) setQuantity(l.sku, q)
        })
        setProblem({ message: data.error ?? 'Some items changed. Please review your cart.', adjusted: true })
      } else {
        setProblem({ message: data.error ?? 'We could not start checkout. Please try again.' })
      }
    } catch {
      setProblem({ message: 'We could not reach checkout. Check your connection and try again.' })
    }
    busy.current = false
    setStatus('idle')
  }, [lines, cart, remove, setQuantity])

  return { start, status, problem, clearProblem: () => setProblem(null) }
}
