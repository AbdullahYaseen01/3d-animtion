import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { allProducts, getCategory, getColor, getProduct, isProductAvailable, productImagePath, type Product as ProductT } from '../catalog'
import { store } from '../config/store'
import { getGuide } from '../data/guides'
import { productItem, track } from '../lib/analytics'
import { formatMoney } from '../lib/money'
import { productGroupLd } from '../lib/productLd'
import { breadcrumbLd, Seo } from '../lib/seo'
import { useWishlist } from '../state/WishlistProvider'
import { Gallery } from '../components/product/Gallery'
import { ProductCard } from '../components/product/ProductCard'
import { QuickShop, type QuickShopTarget } from '../components/product/QuickShop'
import { useVariantSelection } from '../components/product/useVariantSelection'
import { VariantPicker } from '../components/product/VariantPicker'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Icon } from '../components/ui/Icon'
import { Price } from '../components/ui/Price'
import { useCart } from '../state/CartProvider'
import NotFound from './NotFound'
import './Product.css'

export default function Product() {
  const { slug = '' } = useParams()
  const product = getProduct(slug)
  if (!product) return <NotFound />
  return <ProductView key={product.id} product={product} />
}

function ProductView({ product }: { product: ProductT }) {
  const [params, setParams] = useSearchParams()
  const sel = useVariantSelection(product, params.get('color'))
  const color = getColor(product, sel.colorSlug)
  const category = getCategory(product.category)!
  const wishlist = useWishlist()
  const { openCart } = useCart()
  const saved = wishlist.hydrated && wishlist.has(product.id)
  const available = isProductAvailable(product)
  const buyRef = useRef<HTMLButtonElement>(null)
  const [showBar, setShowBar] = useState(false)
  const [quick, setQuick] = useState<QuickShopTarget | null>(null)
  const s = store.shipping.standard

  useEffect(() => {
    track('view_item', { currency: 'USD', value: product.priceCents / 100, items: [productItem(product, { item_variant: sel.colorSlug })] })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id])

  useEffect(() => {
    const el = buyRef.current
    if (!el) return
    let frame = 0
    const update = () => {
      frame = 0
      setShowBar(el.getBoundingClientRect().bottom < 0)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => {
    document.body.classList.toggle('has-buy-bar', showBar)
    return () => document.body.classList.remove('has-buy-bar')
  }, [showBar])

  const onColor = (slug: string) => {
    sel.setColor(slug)
    const next = new URLSearchParams(params)
    if (slug === product.colors[0].slug) next.delete('color')
    else next.set('color', slug)
    setParams(next, { replace: true, preventScrollReset: true })
  }

  const handleAdd = () => {
    if (sel.addToCart()) openCart()
  }

  const related = [
    ...allProducts().filter((p) => p.id !== product.id && p.category === product.category),
    ...allProducts().filter((p) => p.id !== product.id && p.category !== product.category),
  ].slice(0, 4)
  const guides = (product.relatedGuides ?? []).map(getGuide).filter((g) => !!g)
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: category.name, path: `/collections/${category.slug}` },
    { name: product.name, path: `/products/${product.slug}` },
  ]

  return (
    <>
      <Seo
        title={`${product.name} – ${product.tagline}`}
        description={
          `Shop the NOVA ${product.name}, ${product.tagline.toLowerCase()}. ` +
          `${formatMoney(product.priceCents)}, US sizes ${product.sizes[0]}–${product.sizes[product.sizes.length - 1]}${product.widths.length > 1 ? ' in standard and wide' : ''}. ` +
          `${s.priceCents === 0 ? 'Free US shipping and ' : ''}${store.returns.windowDays}-day returns.`
        }
        path={`/products/${product.slug}`}
        type="product"
        image={productImagePath(product.colors[0].images[0], 1024)}
        imageAlt={`${product.name} in ${product.colors[0].name}`}
        jsonLd={[productGroupLd(product), breadcrumbLd(crumbs)]}
      />

      <div className="container">
        <div className="pdp-crumbs">
          <Breadcrumbs items={crumbs} />
        </div>

        <div className="pdp">
          <div className="pdp__gallery">
            <Gallery product={product} color={color} />
          </div>

          <div className="pdp__buy">
            <div className="pdp__title">
              <p className="eyebrow">
                <Link to={`/collections/${category.slug}`}>{category.name}</Link>
                {product.isNew && <span className="badge badge--ink">New</span>}
              </p>
              <h1>{product.name}</h1>
              <p className="pdp__tagline">{product.tagline}</p>
              <Price cents={product.priceCents} compareAtCents={product.compareAtPriceCents} className="pdp__price" />
            </div>

            {available ? (
              <>
                <VariantPicker
                  ref={sel.sizeRef}
                  product={product}
                  colorSlug={sel.colorSlug}
                  widthCode={sel.widthCode}
                  size={sel.size}
                  onColor={onColor}
                  onWidth={sel.setWidth}
                  onSize={sel.setSize}
                  sizeError={sel.error}
                  idPrefix="pdp"
                />
                <p className="pdp__fit">
                  <strong>Fit:</strong> {product.fit.summary} {product.fit.advice}
                </p>
                <div className="pdp__actions">
                  <button ref={buyRef} type="button" className="btn btn--lg pdp__add" onClick={handleAdd}>
                    {sel.justAdded ? (
                      <>
                        <Icon name="check" size={18} /> Added to cart
                      </>
                    ) : (
                      <>
                        <Icon name="bag" size={18} /> Add to cart · {formatMoney(product.priceCents)}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className={`btn btn--lg btn--secondary pdp__save${saved ? ' is-saved' : ''}`}
                    aria-pressed={saved}
                    onClick={() => wishlist.toggle(product.id, sel.colorSlug)}
                  >
                    <Icon name="heart" size={18} filled={saved} />
                    <span className="visually-hidden">Save {product.name}</span>
                    <span aria-hidden="true">{saved ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="notice notice--warning" role="status">
                <Icon name="alert" size={18} />
                <span>This style is currently sold out in every size. Save it to find it again later, or explore similar styles below.</span>
              </div>
            )}

            <ul role="list" className="assurance-list pdp__assure">
              <li>
                <Icon name="truck" size={20} />
                <span>
                  <strong>{s.priceCents === 0 ? 'Free standard shipping' : s.label}</strong> to US addresses. Processed within{' '}
                  {store.shipping.processingBusinessDays} business {store.shipping.processingBusinessDays === 1 ? 'day' : 'days'}, then arrives in{' '}
                  {s.minBusinessDays}–{s.maxBusinessDays} business days. <Link to="/shipping">Details</Link>
                </span>
              </li>
              <li>
                <Icon name="return" size={20} />
                <span>
                  <strong>{store.returns.windowDays}-day returns</strong> on unworn pairs. <Link to="/returns">Return policy</Link>
                </span>
              </li>
              <li>
                <Icon name="ruler" size={20} />
                <span>
                  Unsure about size? <Link to="/fit-guide">Use the size & fit guide</Link> or <Link to="/contact">ask us</Link>.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <section className="pdp-details" aria-labelledby="details-title">
          <div className="pdp-details__overview">
            <h2 id="details-title">About the {product.name}</h2>
            <p className="lede">{product.description}</p>
            <ul role="list" className="pdp-highlights">
              {product.highlights.map((h) => (
                <li key={h}>
                  <Icon name="check" size={18} /> {h}
                </li>
              ))}
            </ul>
            <p className="pdp-bestfor">
              <strong>Best for:</strong> {product.bestFor.join(' · ')}
            </p>
          </div>

          <div className="pdp-details__more">
            <details className="accordion" open>
              <summary>
                <h3>Specifications</h3>
              </summary>
              <dl className="spec-table">
                {product.specs.map((sp) => (
                  <div key={sp.label}>
                    <dt>{sp.label}</dt>
                    <dd>{sp.value}</dd>
                  </div>
                ))}
                <div>
                  <dt>Sizes</dt>
                  <dd>
                    US men's {product.sizes[0]}–{product.sizes[product.sizes.length - 1]}
                  </dd>
                </div>
                <div>
                  <dt>Widths</dt>
                  <dd>{product.widths.map((w) => `${w.label} (${w.code})`).join(', ')}</dd>
                </div>
              </dl>
            </details>
            <details className="accordion">
              <summary>
                <h3>Fit & sizing</h3>
              </summary>
              <p>
                {product.fit.summary} {product.fit.advice}
              </p>
              <p>
                Sizes are US men's. For US women's, choose 1.5 sizes smaller than your usual size. <Link to="/fit-guide">Full size chart and measuring guide</Link>.
              </p>
            </details>
            <details className="accordion">
              <summary>
                <h3>Materials & care</h3>
              </summary>
              <p>{product.materials}</p>
              <p>{product.care}</p>
            </details>
            <details className="accordion">
              <summary>
                <h3>Shipping & returns</h3>
              </summary>
              <p>
                {s.priceCents === 0 ? 'Standard shipping is free' : `${s.label} is ${formatMoney(s.priceCents)}`} to US addresses and typically arrives in{' '}
                {s.minBusinessDays}–{s.maxBusinessDays} business days after dispatch. Sales tax, where applicable, is calculated at checkout.
              </p>
              <p>
                Return unworn pairs within {store.returns.windowDays} days of delivery. <Link to="/returns">Read the return policy</Link>.
              </p>
            </details>
          </div>
        </section>

        {guides.length > 0 && (
          <section className="pdp-guides" aria-labelledby="pdp-guides-title">
            <h2 id="pdp-guides-title" className="eyebrow">
              Helpful guides
            </h2>
            <ul role="list" className="chip-list">
              {guides.map((g) => (
                <li key={g.slug}>
                  <Link className="chip" to={`/guides/${g.slug}`}>
                    {g.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="section" aria-labelledby="related-title">
          <div className="section-head">
            <h2 id="related-title">You may also like</h2>
            <Link to={`/collections/${category.slug}`} className="link-arrow">
              More {category.name.toLowerCase()} <Icon name="arrow" size={18} />
            </Link>
          </div>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} onQuickShop={(pp, c) => setQuick({ product: pp, colorSlug: c })} />
            ))}
          </div>
        </section>
      </div>

      {available && (
        <div className={`buy-bar${showBar ? ' is-visible' : ''}`} aria-hidden={!showBar} inert={!showBar}>
          <div className="buy-bar__info">
            <strong>{product.name}</strong>
            <span>
              {color.name} · {formatMoney(product.priceCents)}
            </span>
          </div>
          <button
            type="button"
            className="btn"
            onClick={() => {
              if (sel.size == null) {
                sel.sizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                handleAdd()
              } else handleAdd()
            }}
          >
            {sel.size == null ? 'Select size' : 'Add to cart'}
          </button>
        </div>
      )}

      <QuickShop target={quick} onClose={() => setQuick(null)} />
    </>
  )
}
