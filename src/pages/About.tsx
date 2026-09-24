import { Link } from 'react-router'
import { activeCategories } from '../catalog'
import { ProductImage } from '../components/ui/ProductImage'
import { breadcrumbLd, organizationLd, Seo } from '../lib/seo'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Icon } from '../components/ui/Icon'
import './About.css'

const principles = [
  {
    title: 'Fit first',
    body: 'Every style is offered in half sizes, and our running and everyday styles also come in wide. Each product page tells you honestly how it fits.',
  },
  {
    title: 'Fewer, better materials',
    body: 'We choose materials for how they wear: breathable engineered mesh, full-grain leather and suede, and rubber where you need grip. Each product page lists exactly what the shoe is made of.',
  },
  {
    title: 'Built for everyday miles',
    body: 'A shoe that sits in the closet is wasted. We design for the walk to work, the weekend run and the long day on your feet, then tune each style for the ground it is made for.',
  },
  {
    title: 'Straight answers',
    body: 'Clear prices, delivery estimates and return terms before checkout. No countdown timers and no invented reviews.',
  },
]

export default function About() {
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Our craft', path: '/about' },
  ]
  return (
    <>
      <Seo
        title="Our Craft"
        description="How NOVA designs shoes, bags and the rest of the edit: considered materials, clear measurements and straight answers."
        path="/about"
        image="/images/editorial/editorial-materials-1024.webp"
        imageAlt="Shoe materials laid out on a workbench"
        jsonLd={[organizationLd(), breadcrumbLd(crumbs)]}
      />
      <div className="container about-head">
        <Breadcrumbs items={crumbs} />
        <div className="about-hero">
          <div>
            <p className="eyebrow eyebrow--ember">Our craft</p>
            <h1>Shoes for people who never stand still</h1>
            <p className="lede">
              NOVA started with a simple idea: a small range of shoes, each designed for a clear job, that fits well and holds up to real days. Here is how we approach
              every pair.
            </p>
          </div>
          <div className="about-hero__media">
            <ProductImage group="editorial" image="editorial-onfoot" alt="Someone walking on a sunlit city sidewalk wearing the NOVA Stride Runner" sizes="(min-width: 64rem) 40vw, 100vw" priority />
          </div>
        </div>
      </div>

      <section className="section" aria-labelledby="principles-title">
        <div className="container">
          <div className="section-head">
            <h2 id="principles-title">What we believe</h2>
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

      <section className="section on-night about-materials" aria-labelledby="materials-title">
        <div className="container about-materials__grid">
          <div className="about-materials__media">
            <ProductImage group="editorial" image="editorial-materials" alt="Mesh, suede, laces, foam and outsole samples laid out beside a shoe sketch" sizes="(min-width: 64rem) 50vw, 100vw" />
          </div>
          <div className="about-materials__copy">
            <p className="eyebrow">From sketch to shoe</p>
            <h2 id="materials-title">Designed around the ground you cover</h2>
            <p>
              A road shoe needs a smooth, cushioned ride. A trail shoe needs grip and protection. A leather court shoe needs structure that softens with wear. We start with
              where a shoe will be worn and choose foams, uppers and outsoles to suit.
            </p>
            <ul role="list" className="about-materials__list">
              {activeCategories().map((c) => (
                <li key={c.slug}>
                  <Link to={`/collections/${c.slug}`}>
                    {c.name} <Icon name="arrow" size={16} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="promise-title">
        <div className="container container--narrow about-promise">
          <h2 id="promise-title">Our promise to you</h2>
          <p className="lede">If a pair is not right, tell us. Our fit guide helps you choose, and our returns process is there when it does not work out.</p>
          <div className="hero__ctas" style={{ justifyContent: 'center' }}>
            <Link to="/shop" className="btn btn--lg">
              Shop the range
            </Link>
            <Link to="/fit-guide" className="btn btn--lg btn--secondary">
              Size & fit guide
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
