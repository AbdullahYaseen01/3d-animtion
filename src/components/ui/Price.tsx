import { formatMoney } from '../../lib/money'

export function Price({ cents, compareAtCents, className }: { cents: number; compareAtCents?: number; className?: string }) {
  const onSale = compareAtCents != null && compareAtCents > cents
  return (
    <span className={`price ${className ?? ''}`}>
      {onSale ? (
        <>
          <span className="visually-hidden">Sale price </span>
          <span className="price__now price__now--sale">{formatMoney(cents)}</span>
          <span className="visually-hidden"> Original price </span>
          <s className="price__was">{formatMoney(compareAtCents)}</s>
        </>
      ) : (
        <span className="price__now">{formatMoney(cents)}</span>
      )}
    </span>
  )
}
