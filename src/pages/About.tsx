import { Link } from 'react-router'
import { activeCategories } from '../catalog'
import { store } from '../config/store'
import { ProductImage } from '../components/ui/ProductImage'
import { breadcrumbLd, organizationLd, Seo } from '../lib/seo'
import { pageKeywords } from '../lib/seoKeywords'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Icon } from '../components/ui/Icon'
import './About.css'

const kw = pageKeywords.about

const LINES = [
  { name: "Men's sneakers", what: 'mesh lace-ups, low-tops, and slip-ons', href: '/collections/shoes' },
  { name: "Men's outerwear", what: 'jackets, hoodies, and coats', href: '/collections/jackets' },
  { name: "Women's handbags", what: 'hobo, shoulder, and crossbody bags', href: '/collections/handbags' },
  { name: "Women's jewelry", what: 'kundan sets, plated earrings, and silver rings', href: '/collections/womens-jewelry' },
  { name: "Men's wallets", what: 'bifold and card wallets', href: '/collections/wallets' },
  { name: 'Casio, Daniel Klein, Naviforce, Fossil, and others', what: "men's watches", href: '/collections/watches' },
]

const principles = [
  {
    title: 'Listed on the product',
    body: 'Materials, sizes, fabric blends, and care are written on the product page. When a detail was not published, we leave it off instead of guessing.',
  },
  {
    title: 'Only published facts',
    body: 'Dimensions, fabric blends, and water resistance are the facts published for that style. We do not add a measurement that is not on the listing.',
  },
  {
    title: 'Sizing that matches the product',
    body: 'Sneakers use US men’s sizes in a standard width. Jackets, hoodies, and coats use letter sizes S to XL. Bags, wallets, and watches are one size, with measurements where given.',
  },
  {
    title: 'Straight answers',
    body: 'Clear prices and delivery estimates before checkout. No fake countdown timers, no invented reviews, and no ratings we have not earned.',
  },
]

export default function About() {
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
  ]
  const s = store.shipping.standard
  return (
    <>
      <Seo
        title={kw.title}
        description={kw.description}
        path="/about"
        image="/og/home.jpg"
        imageAlt="Westora Style sneakers, bags, and accessories"
        jsonLd={[organizationLd(), breadcrumbLd(crumbs)]}
      />
      <div className="container about-head">
        <Breadcrumbs items={crumbs} />
        <div className="about-hero">
          <div>
            <p className="eyebrow eyebrow--ember">About us</p>
            <h1>{kw.h1}</h1>
            <p className="lede">
              {store.name} is a US online store. We sell men's sneakers, outerwear, and wallets, plus women's handbags and jewelry, and men's watches, with the
              measurements and materials listed on each product, and clear prices.
            </p>
          </div>
          <div className="about-hero__media">
            <ProductImage group="editorial" image="editorial-onfoot" alt="Someone walking on a sunlit city sidewalk in sneakers" sizes="(min-width: 64rem) 40vw, 100vw" priority />
          </div>
        </div>
      </div>

      <section className="section" aria-labelledby="principles-title">
        <div className="container">
          <div className="section-head">
            <h2 id="principles-title">How we run the store</h2>
          </div>
          <ol className="principles">
            {principles.map((p, i) => (
              <li key={p.title}>
                <span className="principles__num" aria-hidden="true">
                  0{i + 1}
                </span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section on-night about-materials" aria-labelledby="brands-title">
        <div className="container about-materials__grid">
          <div className="about-materials__media">
            <ProductImage group="editorial" image="editorial-materials" alt="Mesh, suede, laces, foam and outsole samples laid out beside a shoe sketch" sizes="(min-width: 64rem) 50vw, 100vw" />
          </div>
          <div className="about-materials__copy">
            <p className="eyebrow">The catalog</p>
            <h2 id="brands-title">What you can shop</h2>
            <ul role="list" className="about-materials__list">
              {LINES.map((b) => (
                <li key={b.name}>
                  <Link to={b.href}>
                    {b.name}: {b.what} <Icon name="arrow" size={16} />
                  </Link>
                </li>
              ))}
            </ul>
            <p>
              Shop by department:{' '}
              {activeCategories().map((c, i) => (
                <span key={c.slug}>
                  {i > 0 && ', '}
                  <Link to={`/collections/${c.slug}`}>{c.name.toLowerCase()}</Link>
                </span>
              ))}
              .
            </p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="promise-title">
        <div className="container container--narrow about-promise">
          <h2 id="promise-title">Our promise to you</h2>
          <p className="lede">
            {s.priceCents === 0 ? 'Free standard shipping' : 'Standard shipping'} to US addresses in {s.minBusinessDays}–{s.maxBusinessDays} business days after processing. Questions go to a real inbox: <a href={`mailto:${store.supportEmail}`}>{store.supportEmail}</a>.
          </p>
          <div className="hero__ctas" style={{ justifyContent: 'center' }}>
            <Link to="/shop" className="btn btn--lg">
              Shop the range
            </Link>
            <Link to="/guides" className="btn btn--lg btn--secondary">
              Read our guides
            </Link>
            <Link to="/press" className="btn btn--lg btn--secondary">
              Press & media
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
