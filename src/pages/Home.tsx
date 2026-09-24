import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { activeCategories, allProducts, getProduct, productsInCategory } from '../catalog'
import { store } from '../config/store'
import { guides } from '../data/guides'
import { productItem, track } from '../lib/analytics'
import { formatMoney } from '../lib/money'
import { organizationLd, Seo, websiteLd } from '../lib/seo'
import { CampaignFilm } from '../components/home/CampaignFilm'
import { ProductCard } from '../components/product/ProductCard'
import { QuickShop, type QuickShopTarget } from '../components/product/QuickShop'
import { Icon } from '../components/ui/Icon'
import { ProductImage, imageBg } from '../components/ui/ProductImage'
import './Home.css'
import '../components/product/ProductCard.css'

const FLAGSHIP = 'stride-runner'

export default function Home() {
  const flagship = getProduct(FLAGSHIP)!
  const [heroColor, setHeroColor] = useState(flagship.colors[0].slug)
  const [quick, setQuick] = useState<QuickShopTarget | null>(null)
  const products = allProducts()
  const categories = activeCategories()
  const heroImage = flagship.colors.find((c) => c.slug === heroColor)!.images[0]
  const drop = flagship.specs.find((s) => s.label === 'Heel-to-toe drop')?.value
  const weight = flagship.specs.find((s) => s.label === 'Weight')?.value

  useEffect(() => {
    track('view_item_list', { item_list_id: 'home_lineup', item_list_name: 'Home lineup', items: products.map((p) => productItem(p)) })
  }, [products])

  const facts = useMemo(
    () => [
      store.shipping.standard.priceCents === 0 ? 'Free US shipping' : null,
      `${store.returns.windowDays}-day returns`,
      products.some((p) => p.widths.length > 1) ? 'Standard & wide widths' : null,
    ].filter(Boolean) as string[],
    [products],
  )

  return (
    <>
      <Seo
        title="NOVA | Running, Trail & Everyday Sneakers"
        rawTitle
        description="Shop NOVA sneakers: cushioned running shoes, grippy trail shoes, leather lifestyle styles and lightweight everyday knits. US sizing, wide widths and 30-day returns."
        path="/"
        jsonLd={[organizationLd(), websiteLd()]}
      />

      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero__grid">
          <div className="hero__copy">
            <p className="eyebrow eyebrow--ember">New season · {products.length} styles</p>
            <h1 id="hero-title" className="hero__title">
              Step beyond <span>the everyday</span>
            </h1>
            <p className="lede hero__lede">
              Cushioned runners, grippy trail shoes and easy everyday sneakers, in US sizing with standard and wide options.
            </p>
            <div className="hero__ctas">
              <Link to="/shop" className="btn btn--lg">
                Shop all shoes <Icon name="arrow" size={18} />
              </Link>
              <Link to={`/products/${flagship.slug}`} className="btn btn--lg btn--secondary">
                Shop the {flagship.name}
              </Link>
            </div>
            <ul role="list" className="hero__facts">
              {facts.map((f) => (
                <li key={f}>
                  <Icon name="check" size={16} /> {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="hero__stage">
            <Link
              to={`/products/${flagship.slug}?color=${heroColor}`}
              className="hero__plate"
              style={{ background: imageBg(heroImage) }}
              aria-label={`${flagship.name}, ${formatMoney(flagship.priceCents)}. View product`}
            >
              {flagship.colors.map((c) => (
                <span key={c.slug} className={`hero__shot${c.slug === heroColor ? ' is-active' : ''}`} aria-hidden={c.slug !== heroColor}>
                  <ProductImage
                    image={c.images[0]}
                    alt={c.slug === heroColor ? `${flagship.name} in ${c.name}` : ''}
                    sizes="(min-width: 64rem) 48vw, 100vw"
                    priority={c.slug === flagship.colors[0].slug}
                  />
                </span>
              ))}
            </Link>
            <div className="hero__caption">
              <div>
                <p className="hero__caption-name">{flagship.name}</p>
                <p className="muted">
                  {flagship.tagline} · {formatMoney(flagship.priceCents)}
                </p>
              </div>
              <div className="hero__swatches" role="group" aria-label="Preview colors">
                {flagship.colors.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    className={`product-card__swatch${c.slug === heroColor ? ' is-active' : ''}`}
                    aria-pressed={c.slug === heroColor}
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

      <section className="section section--tight" aria-labelledby="cats-title">
        <div className="container">
          <div className="section-head">
            <h2 id="cats-title">Shop by activity</h2>
            <Link to="/shop" className="link-arrow">
              View all shoes <Icon name="arrow" size={18} />
            </Link>
          </div>
          <ul role="list" className="cat-tiles">
            {categories.map((c) => {
              const lead = productsInCategory(c.slug)[0]
              const img = lead.colors[0].images[0]
              return (
                <li key={c.slug}>
                  <Link to={`/collections/${c.slug}`} className="cat-tile">
                    <span className="cat-tile__media" style={{ background: imageBg(img) }}>
                      <ProductImage image={img} alt="" sizes="(min-width: 64rem) 22vw, 46vw" />
                    </span>
                    <span className="cat-tile__text">
                      <span className="cat-tile__name">{c.name}</span>
                      <span className="cat-tile__summary">{c.summary}</span>
                      <span className="cat-tile__count">
                        {c.count} {c.count === 1 ? 'style' : 'styles'} <Icon name="arrow" size={16} />
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="lineup-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">The lineup</p>
              <h2 id="lineup-title">Find your next pair</h2>
            </div>
            <p>Every style, with real-time size availability. Use Quick shop to pick your size without leaving the page.</p>
          </div>
          <div className="product-grid product-grid--3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onQuickShop={(product, colorSlug) => setQuick({ product, colorSlug })} />
            ))}
          </div>
        </div>
      </section>

      <section className="campaign on-night" aria-labelledby="campaign-title">
        <div className="container campaign__grid">
          <CampaignFilm />
          <div className="campaign__copy">
            <p className="eyebrow">Stride Runner</p>
            <h2 id="campaign-title" className="campaign__title">
              Built for daily miles
            </h2>
            <p className="campaign__lede">{flagship.description}</p>
            <dl className="campaign__specs">
              {drop && (
                <div>
                  <dt>Drop</dt>
                  <dd>{drop}</dd>
                </div>
              )}
              {weight && (
                <div>
                  <dt>Weight</dt>
                  <dd>{weight.replace(/\s*\(.+\)/, '')}</dd>
                </div>
              )}
              <div>
                <dt>Widths</dt>
                <dd>{flagship.widths.map((w) => w.code).join(' / ')}</dd>
              </div>
            </dl>
            <div className="hero__ctas">
              <Link to={`/products/${flagship.slug}`} className="btn btn--light btn--lg">
                Shop Stride Runner
              </Link>
              <Link to="/collections/running" className="btn btn--ghost-light btn--lg">
                All running
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="section section--tight assurance" aria-labelledby="assure-title">
        <div className="container">
          <h2 id="assure-title" className="visually-hidden">
            Buying with confidence
          </h2>
          <ul role="list" className="assurance__grid">
            <li>
              <Icon name="ruler" size={28} />
              <h3>Find your fit</h3>
              <p>US men's sizing with women's, UK and EU conversions, plus wide widths on select styles.</p>
              <Link to="/fit-guide">Size & fit guide</Link>
            </li>
            <li>
              <Icon name="truck" size={28} />
              <h3>{store.shipping.standard.priceCents === 0 ? 'Free standard shipping' : 'Fast US shipping'}</h3>
              <p>
                Orders ship to US addresses in {store.shipping.standard.minBusinessDays}–{store.shipping.standard.maxBusinessDays} business days after
                processing.
              </p>
              <Link to="/shipping">Shipping details</Link>
            </li>
            <li>
              <Icon name="return" size={28} />
              <h3>{store.returns.windowDays}-day returns</h3>
              <p>Changed your mind or need another size? Return unworn pairs within {store.returns.windowDays} days of delivery.</p>
              <Link to="/returns">Return policy</Link>
            </li>
            <li>
              <Icon name="mail" size={28} />
              <h3>Questions before you buy?</h3>
              <p>Ask about sizing, materials or an order and we will reply by email.</p>
              <Link to="/contact">Contact us</Link>
            </li>
          </ul>
        </div>
      </section>

      <section className="section story" aria-labelledby="story-title">
        <div className="container story__grid">
          <div className="story__media">
            <ProductImage group="editorial" image="editorial-materials" alt="Mesh, suede, laces, foam and outsole samples laid out beside a shoe sketch" sizes="(min-width: 64rem) 50vw, 100vw" />
          </div>
          <div className="story__copy">
            <p className="eyebrow">Our craft</p>
            <h2 id="story-title">Considered from the sole up</h2>
            <p className="lede">
              Every NOVA shoe starts with the job it has to do: absorb road miles, grip loose trail, or look sharp through a full day. We choose each
              material for that job, then remove anything that does not earn its place.
            </p>
            <Link to="/about" className="link-arrow">
              How we make our shoes <Icon name="arrow" size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--tight guides-teaser" aria-labelledby="guides-title">
        <div className="container">
          <div className="section-head">
            <h2 id="guides-title">Guides</h2>
            <Link to="/guides" className="link-arrow">
              All guides <Icon name="arrow" size={18} />
            </Link>
          </div>
          <ul role="list" className="guide-cards">
            {guides.map((g, i) => (
              <li key={g.slug}>
                <Link to={`/guides/${g.slug}`} className="guide-card">
                  <span className="guide-card__num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="guide-card__title">{g.title}</span>
                  <span className="guide-card__desc">{g.description}</span>
                  <span className="guide-card__more">
                    Read guide <Icon name="arrow" size={16} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <QuickShop target={quick} onClose={() => setQuick(null)} />
    </>
  )
}
