import { store } from '../../config/store'
import { formatMoney } from '../../lib/money'

export function Price({ cents, compareAtCents, className }: { cents: number; compareAtCents?: number; className?: string }) {
  const showFormer = store.pricing.showCompareAt && compareAtCents != null && compareAtCents > cents
  return (
    <span className={`price ${className ?? ''}`}>
      {showFormer ? (
        <>
          <span className="visually-hidden">Sale price </span>
          <span className="price__now price__now--sale">{formatMoney(cents)}</span>
          <span className="visually-hidden"> Former price this store charged </span>
          <s className="price__was">{formatMoney(compareAtCents)}</s>
          <span className="price__save">Save {formatMoney(compareAtCents - cents)}</span>
        </>
      ) : (
        <span className="price__now">{formatMoney(cents)}</span>
      )}
    </span>
  )
}
