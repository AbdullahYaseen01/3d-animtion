import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

const AnnounceContext = createContext<(message: string) => void>(() => {})

/** Polite live region shared by the whole app (cart updates, filter results). */
export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const announce = useCallback((next: string) => {
    setMessage('')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(next), 60)
  }, [])
  return (
    <AnnounceContext.Provider value={announce}>
      {children}
      <div className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {message}
      </div>
    </AnnounceContext.Provider>
  )
}

export const useAnnounce = () => useContext(AnnounceContext)
