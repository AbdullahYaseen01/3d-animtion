import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { getCategory, getProduct } from '../catalog'
import { getGuide } from '../data/guides'
import { ProductCard } from '../components/product/ProductCard'
import { QuickShop, type QuickShopTarget } from '../components/product/QuickShop'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Icon } from '../components/ui/Icon'
import { breadcrumbLd, absoluteUrl, orgRef, Seo } from '../lib/seo'
import { store } from '../config/store'
import NotFound from './NotFound'
import '../components/product/ProductCard.css'

const formatDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

export default function Guide() {
  const { slug = '' } = useParams()
  const guide = getGuide(slug)
  const [quick, setQuick] = useState<QuickShopTarget | null>(null)
  if (!guide) return <NotFound />
  const products = guide.relatedProducts.map((s) => getProduct(s)).filter((p) => !!p)
  const collections = guide.categories.map((c) => getCategory(c)).filter((c) => !!c)
  const nextGuides = (guide.relatedGuides ?? []).map(getGuide).filter((g) => !!g)
  const path = `/guides/${guide.slug}`
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/guides' },
    { name: guide.title, path },
  ]
  const wasUpdated = guide.updated !== guide.published
  const aboutShoes = collections.some((c) => c.slug === 'shoes' || c.kind === 'shoe-use')

  return (
    <>
      <Seo
        title={guide.title}
        description={guide.description}
        path={path}
        type="article"
        image={guide.image}
        imageAlt={guide.imageAlt}
        published={guide.published}
        modified={guide.updated}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: guide.title,
            description: guide.description,
            image: [absoluteUrl(guide.image)],
            datePublished: guide.published,
            dateModified: guide.updated,
            inLanguage: store.locale,
            mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(path) },
            author: orgRef(),
            publisher: { ...orgRef(), logo: { '@type': 'ImageObject', url: absoluteUrl('/favicon.svg') } },
          },
          breadcrumbLd(crumbs),
        ]}
      />
      <article className="container info-page">
        <Breadcrumbs items={crumbs} />
        <header className="page-head info-page__head">
          <p className="eyebrow eyebrow--ember">Guide</p>
          <h1>{guide.title}</h1>
          <p className="lede">{guide.intro}</p>
          <p className="guide-byline">
            {`By the ${store.name} team · `}
            {wasUpdated ? (
              <>
                Updated <time dateTime={guide.updated}>{formatDate(guide.updated)}</time>
              </>
            ) : (
              <>
                Published <time dateTime={guide.published}>{formatDate(guide.published)}</time>
              </>
            )}
          </p>
        </header>
        <div className="prose">
          {guide.sections.map((s) => (
            <section key={s.heading}>
              <h2>{s.heading}</h2>
              {s.body.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
              {s.list && (
                <ul>
                  {s.list.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          {collections.length > 0 && (
            <p>
              Ready to compare styles?{' '}
              {collections.map((c, i) => (
                <span key={c.slug}>
                  {i > 0 && ' or '}
                  <Link to={`/collections/${c.slug}`}>browse {c.name.toLowerCase()}</Link>
                </span>
              ))}
              .
            </p>
          )}
        </div>
        {nextGuides.length > 0 && (
          <nav className="guide-next" aria-labelledby="guide-next-title">
            <h2 id="guide-next-title" className="eyebrow">
              Keep reading
            </h2>
            <ul role="list">
              {nextGuides.map((g) => (
                <li key={g.slug}>
                  <Link to={`/guides/${g.slug}`} className="link-arrow">
                    {g.title} <Icon name="arrow" size={16} />
                  </Link>
                </li>
              ))}
              {aboutShoes && (
                <li>
                  <Link to="/fit-guide" className="link-arrow">
                    Shoe size & fit guide <Icon name="arrow" size={16} />
                  </Link>
                </li>
              )}
              <li>
                <Link to="/guides" className="link-arrow">
                  All guides <Icon name="arrow" size={16} />
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </article>
      {products.length > 0 && (
        <section className="section" aria-labelledby="guide-products" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head">
              <h2 id="guide-products">{guide.productsHeading ?? 'Styles mentioned in this guide'}</h2>
            </div>
            <div className="product-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} onQuickShop={(product, colorSlug) => setQuick({ product, colorSlug })} />
              ))}
            </div>
          </div>
        </section>
      )}
      <QuickShop target={quick} onClose={() => setQuick(null)} />
    </>
  )
}
