import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { CATEGORY_SIZES, campaignCategories, campaignHero, campaignSrcSet } from '../campaign/styleInMotion'
import { activeCategories, getProduct } from '../catalog'
import { store } from '../config/store'
import { productItem, track } from '../lib/analytics'
import { organizationLd, Seo, websiteLd } from '../lib/seo'
import { pageKeywords, seasonalLinksFor } from '../lib/seoKeywords'
import { EditorialOpening } from '../components/home/EditorialOpening'
import { editorialOpening, editorialSrcSet, HERO_SIZES } from '../components/home/cityEdit'
import { ProductCard } from '../components/product/ProductCard'
import { QuickShop, type QuickShopTarget } from '../components/product/QuickShop'
import { Icon } from '../components/ui/Icon'
import './Home.css'
import '../components/product/ProductCard.css'

const FEATURED = ['ndure-kay-0003-black', 'bagx-monaco-choco', 'mz-solid-925-chandi-2-3-grams-18k-gold-plated', 'naviforce-nf5053g-ch-wht']

export default function Home() {
  const [quick, setQuick] = useState<QuickShopTarget | null>(null)
  const featured = useMemo(() => FEATURED.map((id) => getProduct(id)).filter((p) => !!p), [])
  const bags = ['bagx-monaco-choco', 'bagx-leo-maroon', 'metro-21-75-12-10'].map((id) => getProduct(id)).filter((p) => !!p)
  const jewels = ['mz-solid-925-chandi-2-3-grams-18k-gold-plated', 'naviforce-nf5053g-ch-wht'].map((id) => getProduct(id)).filter((p) => !!p)
  const categories = campaignCategories.filter((category) => activeCategories().some((item) => category.href === `/collections/${item.slug}`))

  useEffect(() => {
    track('view_item_list', { item_list_id: 'home_featured', item_list_name: 'Featured picks', items: featured.map((p) => productItem(p)) })
  }, [featured])

  return (
    <>
      <Seo
        title={pageKeywords.home.title}
        description={pageKeywords.home.description}
        path="/"
        image="/og/home.jpg"
        imageAlt={campaignHero.alt}
        jsonLd={[organizationLd(), websiteLd()]}
        preloadImage={{
          type: 'image/avif',
          srcSet: editorialSrcSet(editorialOpening.model.src, editorialOpening.model.width, 'avif'),
          sizes: HERO_SIZES,
        }}
      />

      <EditorialOpening />

      <section className="edit-cats" aria-labelledby="cats-title">
        <h2 id="cats-title" className="visually-hidden">
          Shop by category
        </h2>
        <div className="edit-cats__viewport">
          <div className="edit-cats__track">
            {[0, 1].map((copy) => (
              <ul key={copy} role="list" className="edit-cats__list" aria-hidden={copy === 1 || undefined}>
                {categories.map((category) => (
                  <li key={`${copy}-${category.href}`}>
                    <Link to={category.href} className="edit-cats__link" tabIndex={copy === 1 ? -1 : undefined}>
                      <span className="edit-cats__media">
                        <picture>
                          <source type="image/avif" srcSet={campaignSrcSet(category.src, category.widths, 'avif')} sizes={CATEGORY_SIZES} />
                          <source type="image/webp" srcSet={campaignSrcSet(category.src, category.widths, 'webp')} sizes={CATEGORY_SIZES} />
                          <img
                            src={category.src}
                            alt={category.alt}
                            width={category.width}
                            height={category.height}
                            sizes={CATEGORY_SIZES}
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
            ))}
          </div>
        </div>
      </section>

      <section id="edit" className="section" aria-labelledby="featured-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">From the edit</p>
              <h2 id="featured-title">Featured picks</h2>
            </div>
            <p>A few styles across shoes, bags, jewelry, and watches.</p>
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

      {seasonalLinksFor().length > 0 && (
        <section className="section section--tight" aria-labelledby="season-title">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow">This season</p>
                <h2 id="season-title">Guides and collections to open now</h2>
              </div>
            </div>
            <ul role="list" className="chip-list">
              {seasonalLinksFor().map((entry) => (
                <li key={entry.id}>
                  <Link className="chip" to={entry.href}>
                    {entry.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section section--tight assurance" aria-labelledby="assure-title">
        <div className="container">
          <h2 id="assure-title" className="visually-hidden">
            Buying with confidence
          </h2>
          <ul role="list" className="assurance__grid">
            <li>
              <Icon name="ruler" size={28} />
              <h3>Shoe sizing stays with shoes</h3>
              <p>The size chart is for footwear. Bags, jewelry, and watches list the measurements that apply.</p>
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
