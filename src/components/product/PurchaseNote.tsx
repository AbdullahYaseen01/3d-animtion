import { useEffect, useState } from 'react'
import { latestPurchaseFor, purchaseSentence, subscribePurchases } from '../../commerce/purchaseActivity'
import { productPurchaseLine } from '../../commerce/samplePurchases'

/** Shows a recent purchase line for this product. A real paid order replaces the preview line. */
export function PurchaseNote({ productId, className }: { productId: string; className?: string }) {
  const [line, setLine] = useState<string | null>(() => productPurchaseLine(productId))

  useEffect(() => {
    const update = () => {
      const latest = latestPurchaseFor(productId)
      setLine(latest ? purchaseSentence(latest) : productPurchaseLine(productId))
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
