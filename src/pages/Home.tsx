import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { campaignCategories, campaignHero, campaignSrcSet } from '../campaign/styleInMotion'
import { getProduct } from '../catalog'
import { store } from '../config/store'
import { productItem, track } from '../lib/analytics'
import { organizationLd, Seo, websiteLd } from '../lib/seo'
import { ProductCard } from '../components/product/ProductCard'
import { QuickShop, type QuickShopTarget } from '../components/product/QuickShop'
import { Icon } from '../components/ui/Icon'
import './Home.css'
import '../components/product/ProductCard.css'

const FEATURED = ['stride-runner', 'mini-crossbody', 'day-jacket', 'line-watch']

export default function Home() {
  const [quick, setQuick] = useState<QuickShopTarget | null>(null)
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

      <section
        className="motion"
        aria-labelledby="hero-title"
        style={
          {
            '--motion-pos': campaignHero.focal.desktop,
            '--motion-pos-tablet': campaignHero.focal.tablet,
            '--motion-pos-mobile': campaignHero.focal.mobile,
          } as React.CSSProperties
        }
      >
        <div className="motion__photo">
          <picture>
            <source type="image/avif" srcSet={campaignSrcSet(campaignHero.src, campaignHero.widths, 'avif')} sizes="100vw" />
            <source type="image/webp" srcSet={campaignSrcSet(campaignHero.src, campaignHero.widths, 'webp')} sizes="100vw" />
            <img
              src={campaignHero.src}
              alt={campaignHero.alt}
              width={campaignHero.width}
              height={campaignHero.height}
              sizes="100vw"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
        </div>
        <div className="motion__copy">
          <p className="motion__eyebrow">The NOVA edit</p>
          <h1 id="hero-title" className="motion__title">
            Style in
            <br />
            motion.
          </h1>
          <p className="motion__lede">Everyday pieces. Extraordinary presence.</p>
          <div className="motion__actions">
            <a href="#edit" className="motion__btn motion__btn--solid">
              Shop the Edit
            </a>
            <Link to="/shop" className="motion__btn motion__btn--ghost">
              Explore All
            </Link>
          </div>
        </div>
      </section>

      <section className="edit-cats" aria-labelledby="cats-title">
        <h2 id="cats-title" className="visually-hidden">
          Shop by category
        </h2>
        <div className="edit-cats__scroller">
          <ul role="list" className="edit-cats__list">
            {campaignCategories.map((category) => (
              <li key={category.href}>
                <Link to={category.href} className="edit-cats__link">
                  <span className="edit-cats__media">
                    <picture>
                      <source type="image/avif" srcSet={campaignSrcSet(category.src, category.widths, 'avif')} sizes="(min-width: 64rem) 12vw, 42vw" />
                      <source type="image/webp" srcSet={campaignSrcSet(category.src, category.widths, 'webp')} sizes="(min-width: 64rem) 12vw, 42vw" />
                      <img
                        src={category.src}
                        alt={category.alt}
                        width={category.width}
                        height={category.height}
                        sizes="(min-width: 64rem) 12vw, 42vw"
                        loading="lazy"
                        decoding="async"
                        style={{ objectPosition: category.position }}
                      />
                    </picture>
                  </span>
                  <span className="edit-cats__label">{category.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="edit" className="section" aria-labelledby="featured-title">
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
