import { Link } from 'react-router'
import { getColor, type Product } from '../../catalog'
import { purchaseMessage } from '../../lib/urgency'
import { useCart } from '../../state/CartProvider'
import { Dialog } from '../ui/Dialog'
import { Icon } from '../ui/Icon'
import { Price } from '../ui/Price'
import { ProductImage, imageBg } from '../ui/ProductImage'
import { useVariantSelection } from './useVariantSelection'
import { VariantPicker } from './VariantPicker'
import './QuickShop.css'

export interface QuickShopTarget {
  product: Product
  colorSlug: string
}

export function QuickShop({ target, onClose }: { target: QuickShopTarget | null; onClose: () => void }) {
  return (
    <Dialog open={!!target} onClose={onClose} title={target ? `Quick shop: ${target.product.name}` : 'Quick shop'} hideTitle variant="modal" className="quick-shop">
      {target && <QuickShopBody key={target.product.id} target={target} onClose={onClose} />}
    </Dialog>
  )
}

function QuickShopBody({ target, onClose }: { target: QuickShopTarget; onClose: () => void }) {
  const { product } = target
  const sel = useVariantSelection(product, target.colorSlug)
  const { openCart } = useCart()
  const color = getColor(product, sel.colorSlug)

  return (
    <div className="quick-shop__grid">
      <div className="quick-shop__media" style={{ background: imageBg(color.images[0]) }}>
        <ProductImage image={color.images[0]} alt={`${product.name} in ${color.name}, side view`} sizes="(min-width: 40rem) 26rem, 90vw" />
      </div>
      <div className="quick-shop__info">
        <div>
          <p className="eyebrow">{product.tagline}</p>
          <h3 className="quick-shop__name">{product.name}</h3>
          <Price cents={product.priceCents} compareAtCents={product.compareAtPriceCents} className="quick-shop__price" />
          <p className="quick-shop__purchase">{purchaseMessage(product.id)}</p>
        </div>
        <VariantPicker
          ref={sel.sizeRef}
          product={product}
          colorSlug={sel.colorSlug}
          widthCode={sel.widthCode}
          size={sel.size}
          onColor={sel.setColor}
          onWidth={sel.setWidth}
          onSize={sel.setSize}
          sizeError={sel.error}
          idPrefix={`qs-${product.id}`}
        />
        <button
          type="button"
          className="btn btn--lg btn--block"
          onClick={() => {
            if (sel.addToCart()) {
              onClose()
              requestAnimationFrame(openCart)
            }
          }}
        >
          <Icon name="bag" size={18} /> Add to cart
        </button>
        <Link to={`/products/${product.slug}?color=${sel.colorSlug}`} className="link-arrow" onClick={onClose}>
          View full details <Icon name="arrow" size={18} />
        </Link>
      </div>
    </div>
  )
}
