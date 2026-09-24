import { useId, useState } from 'react'
import { Link } from 'react-router'
import { formatSize, type Product } from '../../catalog'
import { fmt, sizeForLength } from '../../catalog/sizing'
import { Dialog } from '../ui/Dialog'

export function SizeFinder({ product, onPick }: { product: Product; onPick: (size: number) => void }) {
  const [open, setOpen] = useState(false)
  const [cm, setCm] = useState('')
  const fieldId = useId()
  const length = Number(cm)
  const match = cm.trim() ? sizeForLength(length) : null
  const offered = match && typeof match === 'object' && product.sizes.includes(match.usM)

  return (
    <>
      <p className="pdp__size-help">
        Not sure about your size?{' '}
        <button type="button" className="text-link" onClick={() => setOpen(true)}>
          Find my size
        </button>
      </p>
      <Dialog open={open} onClose={() => setOpen(false)} title="Find your size" variant="modal">
        <ol className="size-finder__steps">
          <li>In the evening, stand on paper with your heel against a wall.</li>
          <li>Mark the tip of your longest toe, then measure wall to mark in centimeters.</li>
          <li>Use the longer foot. The chart picks the size at or just above that length.</li>
        </ol>
        <label className="size-finder__label" htmlFor={fieldId}>
          Foot length (cm)
        </label>
        <input
          id={fieldId}
          className="input"
          inputMode="decimal"
          value={cm}
          onChange={(e) => setCm(e.target.value)}
          placeholder="For example, 27"
        />
        {match === 'short' || match === 'long' ? (
          <p className="size-finder__result" role="status">
            That length is outside our US men’s 7–13 chart.{' '}
            <Link to="/fit-guide" onClick={() => setOpen(false)}>
              See the full size guide
            </Link>
            .
          </p>
        ) : match ? (
          <p className="size-finder__result" role="status">
            About <strong>US men’s {fmt(match.usM)}</strong> (US women’s {fmt(match.usW)}, {fmt(match.cm)} cm).
            {offered ? (
              <>
                {' '}
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    onPick(match.usM)
                    setOpen(false)
                  }}
                >
                  Select US men’s {formatSize(match.usM)}
                </button>
              </>
            ) : (
              <> This style is not offered in that size.</>
            )}
          </p>
        ) : null}
        <p className="muted">
          Conversions are approximate.{' '}
          <Link to="/fit-guide" onClick={() => setOpen(false)}>
            Full size guide
          </Link>
        </p>
      </Dialog>
    </>
  )
}
