import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { getProductById } from '../catalog'
import { useAnnounce } from './Announcer'

const STORAGE_KEY = 'nova:wishlist:v1'

export interface SavedItem {
  productId: string
  colorSlug: string
}

interface WishlistApi {
  items: SavedItem[]
  hydrated: boolean
  has: (productId: string) => boolean
  toggle: (productId: string, colorSlug: string) => void
  remove: (productId: string) => void
}

const WishlistContext = createContext<WishlistApi | null>(null)

function readSaved(): SavedItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(raw)) return []
    return raw.filter(
      (i): i is SavedItem =>
        !!i && typeof i.productId === 'string' && typeof i.colorSlug === 'string' && !!getProductById(i.productId),
    )
  } catch {
    return []
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SavedItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const announce = useAnnounce()

  useEffect(() => {
    setItems(readSaved())
    setHydrated(true)
    const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && setItems(readSaved())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const persist = (next: SavedItem[]) => {
    setItems(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }

  const has = useCallback((productId: string) => items.some((i) => i.productId === productId), [items])

  const toggle = (productId: string, colorSlug: string) => {
    const name = getProductById(productId)?.name ?? 'Item'
    if (has(productId)) {
      persist(items.filter((i) => i.productId !== productId))
      announce(`${name} removed from your saved items.`)
    } else {
      persist([...items, { productId, colorSlug }])
      announce(`${name} saved.`)
    }
  }

  const remove = (productId: string) => persist(items.filter((i) => i.productId !== productId))

  return <WishlistContext.Provider value={{ items, hydrated, has, toggle, remove }}>{children}</WishlistContext.Provider>
}

export function useWishlist(): WishlistApi {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider')
  return ctx
}
