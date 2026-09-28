import { useEffect, useState } from 'react'
import { latestPurchaseFor, purchaseSentence, subscribePurchases } from '../../commerce/purchaseActivity'

/** Shows a real paid order for this product. Nothing is shown until someone actually buys it. */
export function PurchaseNote({ productId, className }: { productId: string; className?: string }) {
  const [line, setLine] = useState<string | null>(null)

  useEffect(() => {
    const update = () => {
      const latest = latestPurchaseFor(productId)
      setLine(latest ? purchaseSentence(latest) : null)
    }
    update()
    const interval = window.setInterval(update, 60_000)
    const unsubscribe = subscribePurchases(update)
    return () => {
      window.clearInterval(interval)
      unsubscribe()
    }
  }, [productId])

  if (!line) return null
  return (
    <p className={className} role="status">
      {line}
    </p>
  )
}
