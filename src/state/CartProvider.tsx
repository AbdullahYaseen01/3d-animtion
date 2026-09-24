import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { cartReducer, priceCart, validateLines, type CartAction, type CartIssue, type CartLine, type PricedCart } from '../commerce/cart'
import { resolveSku } from '../catalog'
import { lineItem, money, track } from '../lib/analytics'
import { useAnnounce } from './Announcer'

const STORAGE_KEY = 'nova:cart:v1'

interface CartApi {
  lines: CartLine[]
  cart: PricedCart
  hydrated: boolean
  issues: CartIssue[]
  dismissIssues: () => void
  add: (sku: string, quantity?: number) => void
  setQuantity: (sku: string, quantity: number) => void
  remove: (sku: string) => void
  clear: () => void
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartApi | null>(null)

function read(): unknown {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw)?.lines : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(cartReducer, [] as CartLine[])
  const [hydrated, setHydrated] = useState(false)
  const [issues, setIssues] = useState<CartIssue[]>([])
  const [isOpen, setOpen] = useState(false)
  const announce = useAnnounce()
  const skipWrite = useRef(false)

  useEffect(() => {
    const { lines: valid, issues: found } = validateLines(read())
    dispatch({ type: 'replace', lines: valid })
    setIssues(found.filter((i) => i.type !== 'unknown'))
    setHydrated(true)
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      skipWrite.current = true
      dispatch({ type: 'replace', lines: validateLines(read()).lines })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (skipWrite.current) {
      skipWrite.current = false
      return
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines, savedAt: Date.now() }))
    } catch {
      /* storage full or disabled: cart still works for this session */
    }
  }, [lines, hydrated])

  const cart = useMemo(() => priceCart(lines), [lines])

  const run = useCallback((action: CartAction) => dispatch(action), [])

  const add = useCallback(
    (sku: string, quantity = 1) => {
      const resolved = resolveSku(sku)
      if (!resolved) return
      run({ type: 'add', sku, quantity })
      const priced = priceCart([{ sku, quantity }]).lines[0]
      if (priced) track('add_to_cart', { ...money(priced.lineCents), items: [lineItem(priced)] })
      announce(`${resolved.product.name} added to your cart.`)
    },
    [run, announce],
  )

  const setQuantity = useCallback(
    (sku: string, quantity: number) => {
      const current = lines.find((l) => l.sku === sku)
      run({ type: 'set', sku, quantity })
      const resolved = resolveSku(sku)
      if (current && resolved && quantity < current.quantity) {
        const priced = priceCart([{ sku, quantity: current.quantity - quantity }]).lines[0]
        if (priced) track('remove_from_cart', { ...money(priced.lineCents), items: [lineItem(priced)] })
      }
      if (resolved) announce(quantity > 0 ? `${resolved.product.name} quantity updated to ${quantity}.` : `${resolved.product.name} removed from your cart.`)
    },
    [lines, run, announce],
  )

  const remove = useCallback(
    (sku: string) => {
      const current = lines.find((l) => l.sku === sku)
      run({ type: 'remove', sku })
      const priced = current ? priceCart([current]).lines[0] : undefined
      if (priced) {
        track('remove_from_cart', { ...money(priced.lineCents), items: [lineItem(priced)] })
        announce(`${priced.product.name} removed from your cart.`)
      }
    },
    [lines, run, announce],
  )

  const value: CartApi = {
    lines,
    cart,
    hydrated,
    issues,
    dismissIssues: () => setIssues([]),
    add,
    setQuantity,
    remove,
    clear: () => run({ type: 'clear' }),
    isOpen,
    openCart: () => setOpen(true),
    closeCart: () => setOpen(false),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
