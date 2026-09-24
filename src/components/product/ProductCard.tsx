import { useState } from 'react'
import { Link } from 'react-router'
import { getCategory, isColorAvailable, isProductAvailable, type Product } from '../../catalog'
import { useWishlist } from '../../state/WishlistProvider'
import { Icon } from '../ui/Icon'
import { Price } from '../ui/Price'
import { ProductImage, imageBg } from '../ui/ProductImage'
import './ProductCard.css'

interface Props {
  product: Product
  onQuickShop?: (product: Product, colorSlug: string) => void
  priority?: boolean
  headingLevel?: 'h2' | 'h3'
}

export function ProductCard({ product, onQuickShop, priority = false, headingLevel: H = 'h3' }: Props) {
  const [colorSlug, setColorSlug] = useState(product.colors[0].slug)
  const color = product.colors.find((c) => c.slug === colorSlug) ?? product.colors[0]
  const wishlist = useWishlist()
  const saved = wishlist.hydrated && wishlist.has(product.id)
  const available = isProductAvailable(product)
  const category = getCategory(product.category)
  const href = `/products/${product.slug}${color.slug !== product.colors[0].slug ? `?color=${color.slug}` : ''}`
  const [primary, secondary] = color.images
  const badge = !available ? 'Sold out' : product.compareAtPriceCents ? 'Sale' : product.isNew ? 'New' : null

  return (
    <article className="product-card">
      <div className="product-card__media" style={{ background: imageBg(primary) }}>
        <Link to={href} className="product-card__img-link" tabIndex={-1} aria-hidden="true">
          <ProductImage
            image={primary}
            alt=""
            sizes="(min-width: 90rem) 22rem, (min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 92vw"
            priority={priority}
            className="product-card__img"
          />
          {secondary && (
            <span className="product-card__alt" style={{ background: imageBg(secondary) }}>
              <ProductImage image={secondary} alt="" sizes="(min-width: 64rem) 30vw, 45vw" className="product-card__img" />
            </span>
          )}
        </Link>
        {badge && <span className={`badge product-card__badge${badge === 'New' ? ' badge--ink' : ''}`}>{badge}</span>}
        <button
          type="button"
          className={`icon-btn product-card__save${saved ? ' is-saved' : ''}`}
          aria-pressed={saved}
          aria-label={`Save ${product.name}`}
          onClick={() => wishlist.toggle(product.id, color.slug)}
        >
          <Icon name="heart" filled={saved} />
        </button>
        {onQuickShop && available && (
          <button type="button" className="product-card__quick" onClick={() => onQuickShop(product, color.slug)}>
            Quick shop<span className="visually-hidden"> {product.name}</span>
          </button>
        )}
      </div>

      <div className="product-card__body">
        <div className="product-card__row">
          <H className="product-card__name">
            <Link to={href}>
              {product.name}
              <span className="visually-hidden">, {color.name}</span>
            </Link>
          </H>
          <Price cents={product.priceCents} compareAtCents={product.compareAtPriceCents} />
        </div>
        <p className="product-card__meta">
          {category?.name} · {product.tagline}
        </p>
        {product.colors.length > 1 ? (
          <div className="product-card__swatches" role="group" aria-label={`${product.name} colors`}>
            {product.colors.map((c) => (
              <button
                key={c.slug}
                type="button"
                className={`product-card__swatch${c.slug === color.slug ? ' is-active' : ''}`}
                aria-pressed={c.slug === color.slug}
                aria-label={`${c.name}${isColorAvailable(product, c.slug) ? '' : ' (sold out)'}`}
                onClick={() => setColorSlug(c.slug)}
              >
                <span className="swatch" style={{ '--swatch-a': c.swatch[0], '--swatch-b': c.swatch[1] ?? c.swatch[0] } as React.CSSProperties} />
              </button>
            ))}
            <span className="product-card__color-name">{color.name}</span>
          </div>
        ) : (
          <p className="product-card__color-name product-card__color-name--solo">{color.name}</p>
        )}
        {product.widths.length > 1 && <p className="product-card__widths">Standard & wide widths</p>}
      </div>
    </article>
  )
}
