import { Link } from 'react-router'
import type { PricedLine } from '../../commerce/cart'
import { formatSize, LOW_STOCK_THRESHOLD } from '../../catalog'
import { store } from '../../config/store'
import { formatMoney } from '../../lib/money'
import { useCart } from '../../state/CartProvider'
import { Icon } from '../ui/Icon'
import { ProductImage, imageBg } from '../ui/ProductImage'

export function CartLineItem({ line, compact = false, onNavigate }: { line: PricedLine; compact?: boolean; onNavigate?: () => void }) {
  const { setQuantity, remove } = useCart()
  const { product, color, size, widthCode, quantity } = line
  const width = product.widths.find((w) => w.code === widthCode)
  const max = Math.min(store.checkout.maxQuantityPerLine, line.stock)
  const href = `/products/${product.slug}?color=${color.slug}`
  const image = color.images[0]
  return (
    <li className={`cart-line${compact ? ' cart-line--compact' : ''}`}>
      <Link to={href} className="cart-line__media" style={{ background: imageBg(image) }} onClick={onNavigate} tabIndex={-1} aria-hidden="true">
        <ProductImage image={image} alt="" sizes={compact ? '96px' : '160px'} />
      </Link>
      <div className="cart-line__info">
        <div className="cart-line__top">
          <h3 className="cart-line__name">
            <Link to={href} onClick={onNavigate}>
              {product.name}
            </Link>
          </h3>
          <span className="cart-line__total">{formatMoney(line.lineCents)}</span>
        </div>
        <dl className="cart-line__meta">
          <div>
            <dt>Color</dt>
            <dd>{color.name}</dd>
          </div>
          <div>
            <dt>Size</dt>
            <dd>US M {formatSize(size)}</dd>
          </div>
          {product.widths.length > 1 && width && (
            <div>
              <dt>Width</dt>
              <dd>
                {width.label} ({width.code})
              </dd>
            </div>
          )}
          {quantity > 1 && (
            <div>
              <dt>Each</dt>
              <dd>{formatMoney(line.unitCents)}</dd>
            </div>
          )}
        </dl>
        {line.stock <= LOW_STOCK_THRESHOLD && <p className="cart-line__stock">Only {line.stock} left in this size</p>}
        <div className="cart-line__actions">
          <div className="qty" role="group" aria-label={`Quantity for ${product.name}`}>
            <button
              type="button"
              onClick={() => setQuantity(line.sku, quantity - 1)}
              disabled={quantity <= 1}
              aria-label={`Decrease quantity of ${product.name}`}
            >
              <Icon name="minus" size={16} />
            </button>
            <output aria-live="off">{quantity}</output>
            <button
              type="button"
              onClick={() => setQuantity(line.sku, quantity + 1)}
              disabled={quantity >= max}
              aria-label={`Increase quantity of ${product.name}`}
            >
              <Icon name="plus" size={16} />
            </button>
          </div>
          <button type="button" className="cart-line__remove" onClick={() => remove(line.sku)}>
            Remove<span className="visually-hidden"> {product.name}, {color.name}, size {formatSize(size)}</span>
          </button>
        </div>
      </div>
    </li>
  )
}
