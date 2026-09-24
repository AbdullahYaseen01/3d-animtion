import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { getProduct } from '../catalog'
import { getGuide } from '../data/guides'
import { ProductCard } from '../components/product/ProductCard'
import { QuickShop, type QuickShopTarget } from '../components/product/QuickShop'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { breadcrumbLd, absoluteUrl, Seo } from '../lib/seo'
import { store } from '../config/store'
import NotFound from './NotFound'

export default function Guide() {
  const { slug = '' } = useParams()
  const guide = getGuide(slug)
  const [quick, setQuick] = useState<QuickShopTarget | null>(null)
  if (!guide) return <NotFound />
  const products = guide.relatedProducts.map((s) => getProduct(s)).filter((p) => !!p)
  const path = `/guides/${guide.slug}`
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/guides' },
    { name: guide.title, path },
  ]

  return (
    <>
      <Seo
        title={guide.title}
        description={guide.description}
        path={path}
        type="article"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: guide.title,
            description: guide.description,
            mainEntityOfPage: absoluteUrl(path),
            author: { '@type': 'Organization', name: store.legalName, url: absoluteUrl('/') },
            publisher: { '@type': 'Organization', name: store.legalName, url: absoluteUrl('/') },
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
          <p>
            More help: <Link to="/fit-guide">size & fit guide</Link> · <Link to="/guides">all guides</Link>
          </p>
        </div>
      </article>
      {products.length > 0 && (
        <section className="section" aria-labelledby="guide-products" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head">
              <h2 id="guide-products">Shoes mentioned in this guide</h2>
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
