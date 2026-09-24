import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { activeCategories, getColor, getProduct, productsInCategory } from '../catalog'
import { store } from '../config/store'
import { productItem, track } from '../lib/analytics'
import { formatMoney } from '../lib/money'
import { organizationLd, Seo, websiteLd } from '../lib/seo'
import { ProductCard } from '../components/product/ProductCard'
import { QuickShop, type QuickShopTarget } from '../components/product/QuickShop'
import { Icon } from '../components/ui/Icon'
import { ProductImage, imageBg } from '../components/ui/ProductImage'
import './Home.css'
import '../components/product/ProductCard.css'

const FEATURED = ['stride-runner', 'mini-crossbody', 'day-jacket', 'line-watch']

export default function Home() {
  const flagship = getProduct('stride-runner')!
  const [heroColor, setHeroColor] = useState(flagship.colors[0].slug)
  const [quick, setQuick] = useState<QuickShopTarget | null>(null)
  const categories = activeCategories()
  const color = getColor(flagship, heroColor)
  const heroImage = color.images[0]
  const featured = useMemo(() => FEATURED.map((id) => getProduct(id)).filter((p) => !!p), [])
  const bags = ['mini-crossbody', 'slim-wallet', 'commute-pack'].map((id) => getProduct(id)).filter((p) => !!p)
  const jewels = ['arc-earrings', 'line-watch'].map((id) => getProduct(id)).filter((p) => !!p)

  useEffect(() => {
    track('view_item_list', { item_list_id: 'home_featured', item_list_name: 'Featured picks', items: featured.map((p) => productItem(p)) })
  }, [featured])

  return (
    <>
      <Seo
        title="NOVA | Shoes, Bags, Jackets, Jewelry & Watches"
        rawTitle
        description="Shop the NOVA edit: shoes, handbags, wallets, jackets, women's jewelry, backpacks and watches. US shipping and 30-day returns."
        path="/"
        jsonLd={[organizationLd(), websiteLd()]}
      />

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__canvas">
          <div className="hero__copy">
            <p className="eyebrow eyebrow--ember">The NOVA edit</p>
            <h1 id="hero-title" className="hero__title">
              Make your
              <br />
              next move.
            </h1>
            <p className="hero__lede">Discover standout footwear and everyday essentials.</p>
            <div className="hero__ctas">
              <Link to="/collections/shoes" className="btn btn--lg">
                Shop shoes <Icon name="arrow" size={18} />
              </Link>
              <Link to="/shop" className="btn btn--lg btn--secondary">
                Explore all
              </Link>
            </div>
            <ul role="list" className="hero__facts">
              {store.shipping.standard.priceCents === 0 && (
                <li>
                  <Icon name="check" size={16} /> Free US shipping
                </li>
              )}
              <li>
                <Icon name="check" size={16} /> {store.returns.windowDays}-day returns
              </li>
            </ul>
          </div>
          <div className="hero__visual">
            <Link
              to={`/products/${flagship.slug}?color=${color.slug}`}
              className="hero__plate"
              style={{ background: imageBg(heroImage) }}
            >
              <ProductImage
                key={heroImage}
                image={heroImage}
                alt={`${flagship.name} in ${color.name}`}
                sizes="(min-width: 64rem) 42vw, 92vw"
                priority
              />
            </Link>
            <div className="hero__meta">
              <Link to={`/products/${flagship.slug}?color=${color.slug}`} className="hero__caption">
                <span className="hero__caption-name">{flagship.name}</span>
                <span className="muted">
                  {color.name} · {formatMoney(flagship.priceCents)}
                </span>
              </Link>
              <div className="hero__swatches" role="group" aria-label={`${flagship.name} colors`}>
                {flagship.colors.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    className={`product-card__swatch${c.slug === color.slug ? ' is-active' : ''}`}
                    aria-pressed={c.slug === color.slug}
                    aria-label={c.name}
                    onClick={() => setHeroColor(c.slug)}
                  >
                    <span className="swatch" style={{ '--swatch-a': c.swatch[0], '--swatch-b': c.swatch[1] ?? c.swatch[0] } as React.CSSProperties} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="shop-categories" className="section section--tight" aria-labelledby="cats-title">
        <div className="container">
          <div className="section-head">
            <h2 id="cats-title">Shop by category</h2>
            <Link to="/shop" className="link-arrow">
              Shop all <Icon name="arrow" size={18} />
            </Link>
          </div>
          <ul role="list" className="cat-tiles">
            {categories.map((c) => {
              const lead = productsInCategory(c.slug)[0]
              const img = lead?.colors[0].images[0]
              return (
                <li key={c.slug}>
                  <Link to={`/collections/${c.slug}`} className="cat-tile">
                    <span className="cat-tile__media" style={img ? { background: imageBg(img) } : undefined}>
                      {img && <ProductImage image={img} alt="" sizes="(min-width: 64rem) 14vw, 46vw" />}
                    </span>
                    <span className="cat-tile__name">{c.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="featured-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">From the edit</p>
              <h2 id="featured-title">Featured picks</h2>
            </div>
            <p>A few styles across shoes, bags, jackets and watches. Prices and stock on each page come from the catalog.</p>
          </div>
          <div className="product-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} onQuickShop={(product, colorSlug) => setQuick({ product, colorSlug })} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tight edit-band" aria-labelledby="bags-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Carry</p>
              <h2 id="bags-title">Bags and everyday pieces</h2>
            </div>
            <Link to="/collections/handbags" className="link-arrow">
              Handbags <Icon name="arrow" size={18} />
            </Link>
          </div>
          <div className="product-grid">
            {bags.map((p) => (
              <ProductCard key={p.id} product={p} onQuickShop={(product, colorSlug) => setQuick({ product, colorSlug })} />
            ))}
          </div>
        </div>
      </section>

      <section className="section jewelry-band" aria-labelledby="jewel-title">
        <div className="container jewelry-band__grid">
          <div>
            <p className="eyebrow">Finish the outfit</p>
            <h2 id="jewel-title">Watches and jewelry</h2>
            <p className="lede">Small pieces with the measurements and materials written on the product, including strap fit and finish.</p>
            <div className="hero__ctas">
              <Link to="/collections/watches" className="btn">
                Shop watches
              </Link>
              <Link to="/collections/womens-jewelry" className="btn btn--secondary">
                Shop jewelry
              </Link>
            </div>
          </div>
          <div className="product-grid">
            {jewels.map((p) => (
              <ProductCard key={p.id} product={p} onQuickShop={(product, colorSlug) => setQuick({ product, colorSlug })} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tight assurance" aria-labelledby="assure-title">
        <div className="container">
          <h2 id="assure-title" className="visually-hidden">
            Buying with confidence
          </h2>
          <ul role="list" className="assurance__grid">
            <li>
              <Icon name="ruler" size={28} />
              <h3>Shoe sizing stays with shoes</h3>
              <p>The size chart is for footwear. Jackets use their own sizes. Bags, jewelry and watches list the measurements that apply.</p>
              <Link to="/fit-guide">Shoe size & fit guide</Link>
            </li>
            <li>
              <Icon name="truck" size={28} />
              <h3>{store.shipping.standard.priceCents === 0 ? 'Free standard shipping' : 'US shipping'}</h3>
              <p>
                Orders ship to US addresses in {store.shipping.standard.minBusinessDays}–{store.shipping.standard.maxBusinessDays} business days after
                processing.
              </p>
              <Link to="/shipping">Shipping details</Link>
            </li>
            <li>
              <Icon name="return" size={28} />
              <h3>{store.returns.windowDays}-day returns</h3>
              <p>Return eligible items in original condition within {store.returns.windowDays} days. Shoes still need to be unworn.</p>
              <Link to="/returns">Return policy</Link>
            </li>
            <li>
              <Icon name="mail" size={28} />
              <h3>Questions before you buy?</h3>
              <p>Ask about a product or an order and we will reply by email.</p>
              <Link to="/contact">Contact us</Link>
            </li>
          </ul>
        </div>
      </section>

      <QuickShop target={quick} onClose={() => setQuick(null)} />
    </>
  )
}
