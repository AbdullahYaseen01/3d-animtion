import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getProductById } from '../../catalog'
import { purchaseSentence, readPurchases, subscribePurchases, type PurchaseActivity } from '../../commerce/purchaseActivity'
import { Icon } from '../ui/Icon'
import './PurchaseToast.css'

/** Site-wide notice for the newest confirmed purchase in this browser. */
export function PurchaseToast() {
  const [activity, setActivity] = useState<PurchaseActivity | null>(null)
  const [line, setLine] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState<string | null>(null)

  useEffect(() => {
    const update = () => {
      const latest = readPurchases().sort((a, b) => b.at.localeCompare(a.at))[0] ?? null
      setActivity(latest)
      setLine(latest ? purchaseSentence(latest) : null)
    }
    update()
    const interval = window.setInterval(update, 60_000)
    const unsubscribe = subscribePurchases(update)
    return () => {
      window.clearInterval(interval)
      unsubscribe()
    }
  }, [])

  if (!activity || !line || dismissed === activity.orderNumber + activity.productId) return null
  const product = getProductById(activity.productId)

  return (
    <aside className="purchase-toast" role="status" aria-live="polite">
      <p>{line}</p>
      <div className="purchase-toast__actions">
        {product && (
          <Link to={`/products/${product.slug}`}>View {product.name}</Link>
        )}
        <button type="button" className="icon-btn" aria-label="Dismiss purchase notice" onClick={() => setDismissed(activity.orderNumber + activity.productId)}>
          <Icon name="close" size={16} />
        </button>
      </div>
    </aside>
  )
}
