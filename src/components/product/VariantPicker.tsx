import { forwardRef, useId } from 'react'
import { Link } from 'react-router'
import {
  buildSku,
  formatSize,
  isColorAvailable,
  LOW_STOCK_THRESHOLD,
  sizeLabel,
  stockFor,
  type Product,
} from '../../catalog'
import { conversionFor, fmt } from '../../catalog/sizing'
import { Icon } from '../ui/Icon'
import './VariantPicker.css'

interface Props {
  product: Product
  colorSlug: string
  widthCode: string
  size: number | null
  onColor: (slug: string) => void
  onWidth: (code: string) => void
  onSize: (size: number) => void
  sizeError?: string | null
  idPrefix?: string
}

export const VariantPicker = forwardRef<HTMLFieldSetElement, Props>(function VariantPicker(
  { product, colorSlug, widthCode, size, onColor, onWidth, onSize, sizeError, idPrefix },
  sizeRef,
) {
  const uid = useId()
  const name = (k: string) => `${idPrefix ?? uid}-${k}`
  const color = product.colors.find((c) => c.slug === colorSlug) ?? product.colors[0]
  const width = product.widths.find((w) => w.code === widthCode) ?? product.widths[0]
  const stockSku =
    product.variant === 'simple'
      ? buildSku(product.id, color.slug, 0, width.code)
      : size != null
        ? buildSku(product.id, color.slug, size, width.code)
        : null
  const selectedStock = stockSku ? stockFor(product, stockSku) : null
  const conv = size != null ? conversionFor(size) : undefined
  const errorId = `${name('size')}-error`

  return (
    <div className="variant-picker">
      {product.colors.length > 0 && (
        <fieldset className="vp-group">
          <legend className="vp-legend">
            Color: <strong>{color.name}</strong>
          </legend>
          <div className="vp-swatches">
            {product.colors.map((c) => {
              const available = isColorAvailable(product, c.slug)
              return (
                <label key={c.slug} className="vp-swatch" title={c.name}>
                  <input
                    type="radio"
                    name={name('color')}
                    value={c.slug}
                    checked={c.slug === color.slug}
                    onChange={() => onColor(c.slug)}
                    className="visually-hidden"
                  />
                  <span
                    className={`vp-swatch__chip${available ? '' : ' vp-swatch__chip--out'}`}
                    style={{ '--swatch-a': c.swatch[0], '--swatch-b': c.swatch[1] ?? c.swatch[0] } as React.CSSProperties}
                    aria-hidden="true"
                  />
                  <span className="visually-hidden">
                    {c.name}
                    {available ? '' : ', sold out'}
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>
      )}

      {product.variant === 'footwear' && product.widths.length > 1 && (
        <fieldset className="vp-group">
          <legend className="vp-legend">
            Width: <strong>{width.label}</strong>
          </legend>
          <div className="vp-segmented">
            {product.widths.map((w) => (
              <label key={w.code} className="vp-option">
                <input
                  type="radio"
                  name={name('width')}
                  value={w.code}
                  checked={w.code === width.code}
                  onChange={() => onWidth(w.code)}
                />
                <span>
                  {w.label} <span className="muted">({w.code})</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {product.variant !== 'simple' && (
        <fieldset
          className={`vp-group${sizeError ? ' vp-group--error' : ''}`}
          ref={sizeRef}
          tabIndex={-1}
          aria-describedby={sizeError ? errorId : undefined}
          aria-invalid={sizeError ? true : undefined}
        >
          <legend className="vp-legend vp-legend--row">
            <span>
              Size {product.variant === 'footwear' && <span className="muted">(US men's)</span>}
              {size != null && (
                <>
                  : <strong>{product.variant === 'footwear' ? formatSize(size) : sizeLabel(product, size)}</strong>
                </>
              )}
            </span>
            {product.variant === 'footwear' && (
              <Link to="/fit-guide" className="vp-guide-link">
                <Icon name="ruler" size={18} /> Size guide
              </Link>
            )}
          </legend>
          {sizeError && (
            <p className="field-error vp-error" id={errorId} role="alert">
              <Icon name="alert" size={18} /> {sizeError}
            </p>
          )}
          <div className="vp-sizes">
            {product.sizes.map((s) => {
              const stock = stockFor(product, buildSku(product.id, color.slug, s, width.code))
              const out = stock <= 0
              return (
                <label key={s} className={`vp-size${out ? ' vp-size--out' : ''}`}>
                  <input
                    type="radio"
                    name={name('size')}
                    value={s}
                    checked={size === s}
                    disabled={out}
                    onChange={() => onSize(s)}
                  />
                  <span aria-hidden="true">{product.variant === 'footwear' ? formatSize(s) : sizeLabel(product, s)}</span>
                  <span className="visually-hidden">
                    {product.variant === 'footwear' ? `US men's ${formatSize(s)}` : `Size ${sizeLabel(product, s)}`}
                    {out ? ', sold out' : ''}
                  </span>
                </label>
              )
            })}
          </div>
          {product.variant === 'footwear' && (
            <p className="vp-help">
              {conv ? (
                <>
                  US M {fmt(conv.usM)} ≈ US W {fmt(conv.usW)} · UK {fmt(conv.uk)} · EU {fmt(conv.eu)} · {fmt(conv.cm)} cm
                </>
              ) : (
                <>Women's: choose 1.5 sizes smaller than your usual size (US W 10 → US M 8.5).</>
              )}
            </p>
          )}
          {product.variant === 'apparel' && <p className="vp-help">Jacket sizes. This is not a shoe size.</p>}
          {selectedStock != null && selectedStock > 0 && selectedStock <= LOW_STOCK_THRESHOLD && (
            <p className="vp-stock" role="status">
              Only {selectedStock} left in stock
            </p>
          )}
        </fieldset>
      )}
      {product.variant === 'simple' && selectedStock != null && selectedStock > 0 && selectedStock <= LOW_STOCK_THRESHOLD && (
        <p className="vp-stock" role="status">
          Only {selectedStock} left in stock
        </p>
      )}
    </div>
  )
})
