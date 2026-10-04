import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { getBrand, getCategory } from '../catalog'
import { ProductCard } from '../components/product/ProductCard'
import { QuickShop, type QuickShopTarget } from '../components/product/QuickShop'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { brandCopy } from '../lib/collectionCopy'
import { brandKeywords } from '../lib/seoKeywords'
import { breadcrumbLd, collectionPageLd, Seo } from '../lib/seo'
import { guidesForCategory } from '../data/guides'
import NotFound from './NotFound'
import '../components/catalog/Catalog.css'
import '../components/product/ProductCard.css'

export default function Brand() {
  const { slug = '' } = useParams()
  const brand = getBrand(slug)
  const seo = brandKeywords[slug]
  if (!brand || !seo) return <NotFound />
  return <BrandView brand={brand} seo={seo} />
}

function BrandView({
  brand,
  seo,
}: {
  brand: NonNullable<ReturnType<typeof getBrand>>
  seo: (typeof brandKeywords)[string]
}) {
  const [quick, setQuick] = useState<QuickShopTarget | null>(null)
  const path = `/brands/${brand.slug}`
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: brand.name, path },
  ]
  const departments = [...new Set(brand.products.map((p) => p.category))]
    .map((slug) => getCategory(slug))
    .filter((c): c is NonNullable<typeof c> => !!c)
  const guides = departments.flatMap((c) => guidesForCategory(c.slug)).filter((g, i, all) => all.findIndex((x) => x.slug === g.slug) === i).slice(0, 6)
  const copy = brandCopy(brand.name, brand.products)
  const cards = brand.products.slice(0, 24)

  return (
    <>
      <Seo
        title={seo.title}
        description={seo.description}
        path={path}
        jsonLd={[
          breadcrumbLd(crumbs),
          collectionPageLd({
            name: brand.name,
            description: seo.description,
            path,
            items: brand.products.map((p) => ({ name: p.name, path: `/products/${p.slug}` })),
          }),
        ]}
      />
      <div className="container">
        <div className="page-head catalog-head">
          <Breadcrumbs items={crumbs} />
          <h1>{seo.h1}</h1>
          {copy.intro.map((p) => (
            <p key={p.slice(0, 24)} className="lede">
              {p}
            </p>
          ))}
        </div>
        {departments.length > 0 && (
          <nav aria-label={`${brand.name} collections`} className="catalog-cats">
            <ul role="list" className="chip-list">
              {departments.map((c) => (
                <li key={c.slug}>
                  <Link className="chip" to={`/collections/${c.slug}`}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <div className="product-grid product-grid--catalog">
          {cards.map((p, i) => (
            <ProductCard key={p.id} product={p} headingLevel="h2" priority={i === 0} onQuickShop={(product, colorSlug) => setQuick({ product, colorSlug })} />
          ))}
        </div>
        {brand.products.length > cards.length && (
          <section className="catalog-more" aria-labelledby="brand-all">
            <h2 id="brand-all" className="eyebrow">
              All {brand.name} styles
            </h2>
            <ul role="list" className="chip-list">
              {brand.products.map((p) => (
                <li key={p.id}>
                  <Link className="chip" to={`/products/${p.slug}`}>
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {guides.length > 0 && (
          <section className="catalog-more" aria-labelledby="brand-guides">
            <h2 id="brand-guides" className="eyebrow">
              Guides
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
        {copy.footer.map((p) => (
          <p key={p.slice(0, 24)} className="lede">
            {p}
          </p>
        ))}
      </div>
      <QuickShop target={quick} onClose={() => setQuick(null)} />
    </>
  )
}
