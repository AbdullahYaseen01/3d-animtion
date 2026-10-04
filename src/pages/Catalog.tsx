import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { activeCategories, allProducts, formatSize, getCategory, productsInCategory, shoeCollections, styleCollectionsFor, type Category, type DepartmentSlug } from '../catalog'
import {
  activeFilterCount,
  applyFilters,
  COLOR_FAMILIES,
  parseFilters,
  PRICE_BUCKETS,
  serializeFilters,
  SORT_OPTIONS,
  type FilterState,
  type SortKey,
} from '../catalog/filters'
import { FilterPanel } from '../components/catalog/FilterPanel'
import { RelatedCollections } from '../components/catalog/RelatedCollections'
import { ProductCard } from '../components/product/ProductCard'
import { QuickShop, type QuickShopTarget } from '../components/product/QuickShop'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Dialog } from '../components/ui/Dialog'
import { Icon } from '../components/ui/Icon'
import { productItem, track } from '../lib/analytics'
import { breadcrumbLd, collectionPageLd, Seo } from '../lib/seo'
import { CARD_SIZES, productPreload } from '../lib/images'
import { collectionCopy } from '../lib/collectionCopy'
import { keywordsFor, pageKeywords } from '../lib/seoKeywords'
import { campaignHero, collectionOgImage } from '../campaign/styleInMotion'
import { guidesForCategory } from '../data/guides'
import { useAnnounce } from '../state/Announcer'
import NotFound from './NotFound'
import '../components/catalog/Catalog.css'
import '../components/product/ProductCard.css'

type Mode = { kind: 'shop' } | { kind: 'collection'; slug: string } | { kind: 'search' }

export default function Catalog({ mode }: { mode: Mode }) {
  const category: Category | undefined =
    mode.kind === 'collection' ? getCategory(mode.slug) : undefined
  if (mode.kind === 'collection' && !category) return <NotFound />
  return <CatalogView mode={mode} category={category} />
}

function CatalogView({ mode, category }: { mode: Mode; category?: Category }) {
  const [params, setParams] = useSearchParams()
  const state = useMemo(() => parseFilters(params), [params])
  const source = useMemo(() => (category ? productsInCategory(category.slug) : allProducts()), [category])
  const result = useMemo(() => applyFilters(source, state), [source, state])
  const allMatches = useMemo(() => applyFilters(source, { ...state, page: 1 }, Math.max(source.length, 1)), [source, state])
  const copy = category ? collectionCopy(category) : null
  const styles = category && category.kind === 'department' ? styleCollectionsFor(category.slug as DepartmentSlug) : []
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [quick, setQuick] = useState<QuickShopTarget | null>(null)
  const announce = useAnnounce()
  const firstRender = useRef(true)
  const isSearch = mode.kind === 'search'
  const filterCount = activeFilterCount(state)

  const update = (patch: Partial<FilterState>) => {
    const next = serializeFilters({ ...state, ...patch })
    setParams(next, { preventScrollReset: true })
  }

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    announce(`${result.total} ${result.total === 1 ? 'result' : 'results'}`)
  }, [result.total, announce])

  useEffect(() => {
    if (isSearch && state.q) track('search', { search_term: state.q, results: result.total })
  }, [isSearch, state.q, result.total])

  useEffect(() => {
    track('view_item_list', {
      item_list_id: category?.slug ?? mode.kind,
      item_list_name: category?.name ?? (isSearch ? 'Search results' : 'Shop all'),
      items: result.items.map((p) => productItem(p)),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.items])

  const basePath = category ? `/collections/${category.slug}` : isSearch ? '/search' : '/shop'
  const title = category ? (keywordsFor(category.slug)?.h1 ?? category.name) : isSearch ? (state.q ? `Results for “${state.q}”` : 'Search') : 'Shop all'
  const crumbs = [
    { name: 'Home', path: '/' },
    ...(category || isSearch ? [{ name: 'Shop', path: '/shop' }] : []),
    { name: category ? category.name : isSearch ? 'Search' : 'Shop all', path: basePath },
  ]
  const hasRefinements = filterCount > 0 || state.sort !== 'featured'
  const og = category ? collectionOgImage(category.slug) : { src: '/og/home.jpg', alt: campaignHero.alt }
  const seo = category
    ? { title: category.seoTitle, description: category.seoDescription }
    : isSearch
      ? { title: state.q ? `Search: ${state.q}` : 'Search', description: 'Search shoes, bags, jewelry, and watches.' }
      : {
          title: pageKeywords.shop.title,
          description: pageKeywords.shop.description,
        }
  const guideLinks = category ? guidesForCategory(category.slug) : []
  const jsonLd = isSearch
    ? undefined
    : [
        breadcrumbLd(crumbs),
        ...(hasRefinements || result.items.length === 0
          ? []
          : [
              collectionPageLd({
                name: category?.name ?? 'Shop all',
                description: seo.description,
                path: basePath,
                items: allMatches.items.map((p) => ({ name: p.name, path: `/products/${p.slug}` })),
              }),
            ]),
      ]

  const chips = [
    ...state.category.map((c) => ({ label: getCategory(c)?.name ?? c, remove: { category: state.category.filter((x) => x !== c) } })),
    ...state.use.map((u) => ({ label: shoeCollections().find((x) => x.slug === u)?.name ?? u, remove: { use: state.use.filter((x) => x !== u) } })),
    ...state.trait.map((t) => ({ label: t.split(':')[1] ?? t, remove: { trait: state.trait.filter((x) => x !== t) } })),
    ...state.size.map((s) => ({
      label: `Size ${source.find((p) => p.sizeLabels?.[s])?.sizeLabels?.[s] ?? formatSize(s)}`,
      remove: { size: state.size.filter((x) => x !== s) },
    })),
    ...state.width.map((w) => ({ label: w === '2E' ? 'Wide (2E)' : w === 'D' ? 'Standard (D)' : w, remove: { width: state.width.filter((x) => x !== w) } })),
    ...state.color.map((c) => ({ label: COLOR_FAMILIES.find((x) => x.value === c)?.label ?? c, remove: { color: state.color.filter((x) => x !== c) } })),
    ...state.price.map((p) => ({ label: PRICE_BUCKETS.find((x) => x.value === p)?.label ?? p, remove: { price: state.price.filter((x) => x !== p) } })),
    ...(state.inStock ? [{ label: 'In stock', remove: { inStock: false } }] : []),
  ]

  const clearAll = () => update({ category: [], size: [], width: [], color: [], price: [], use: [], trait: [], inStock: false, page: 1 })
  const pageHref = (page: number) => {
    const qs = serializeFilters({ ...state, page }).toString()
    return `${basePath}${qs ? `?${qs}` : ''}`
  }

  return (
    <>
      <Seo
        title={seo.title}
        description={seo.description}
        path={basePath}
        noindex={isSearch || hasRefinements || state.page > 1}
        prev={result.pageCount > 1 && state.page > 1 ? pageHref(state.page - 1) : undefined}
        next={result.pageCount > 1 && state.page < result.pageCount ? pageHref(state.page + 1) : undefined}
        image={og?.src}
        imageAlt={og?.alt}
        preloadImage={productPreload(result.items[0]?.colors[0].images[0], CARD_SIZES)}
        jsonLd={jsonLd}
      />
      <div className="container">
        <div className="page-head catalog-head">
          <Breadcrumbs items={crumbs} />
          <h1>{title}</h1>
          {copy?.intro.map((p) => (
            <p key={p.slice(0, 28)} className="lede">
              {p}
            </p>
          ))}
          {styles.length > 0 && (
            <nav aria-label="Styles in this collection" className="catalog-cats">
              <ul role="list" className="chip-list">
                {styles.map((c) => (
                  <li key={c.slug}>
                    <Link className="chip" to={`/collections/${c.slug}`}>
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {category?.slug === 'shoes' && (
            <nav aria-label="Shoe types" className="catalog-cats">
              <ul role="list" className="chip-list">
                {shoeCollections().map((c) => (
                  <li key={c.slug}>
                    <Link className="chip" to={`/collections/${c.slug}`}>
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {!category && !isSearch && (
            <p className="lede">Men’s sneakers, jackets, hoodies, and coats, plus women’s handbags and jewelry, wallets, and watches. Filter by what each category actually offers.</p>
          )}
          {isSearch && <SearchBox initial={state.q} onSearch={(q) => update({ q, page: 1 })} />}
        </div>

        {!category && !isSearch && (
          <nav aria-label="Collections" className="catalog-cats">
            <ul role="list" className="chip-list">
              {activeCategories().map((c) => (
                <li key={c.slug}>
                  <Link className="chip" to={`/collections/${c.slug}`}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="catalog-toolbar">
          <button type="button" className="btn btn--secondary catalog-toolbar__filters" onClick={() => setDrawerOpen(true)} aria-haspopup="dialog">
            <Icon name="filter" size={18} /> Filters{filterCount ? ` (${filterCount})` : ''}
          </button>
          <p className="catalog-toolbar__count" aria-hidden="true">
            {result.total} {result.total === 1 ? 'style' : 'styles'}
          </p>
          <label className="catalog-sort">
            <span>Sort by</span>
            <select className="select" value={state.sort} onChange={(e) => update({ sort: e.target.value as SortKey, page: 1 })}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {chips.length > 0 && (
          <div className="catalog-chips">
            <ul role="list" className="chip-list" aria-label="Active filters">
              {chips.map((c) => (
                <li key={c.label}>
                  <button type="button" className="chip chip--active" onClick={() => update({ ...c.remove, page: 1 })}>
                    {c.label}
                    <Icon name="close" size={14} />
                    <span className="visually-hidden">Remove filter</span>
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="catalog-chips__clear" onClick={clearAll}>
              Clear all
            </button>
          </div>
        )}

        <div className="catalog-layout">
          <aside className="catalog-sidebar" aria-label="Filters">
            <h2 className="visually-hidden">Filters</h2>
            <FilterPanel source={source} state={state} onChange={update} showCategory={!category} idPrefix="side" />
          </aside>

          <div className="catalog-results">
            <p className="visually-hidden" aria-live="off">
              {result.total} results
            </p>
            {result.total === 0 ? (
              <div className="empty-state">
                <h2>{isSearch && state.q ? `No results for “${state.q}”` : 'Nothing matches these filters'}</h2>
                <p>
                  {filterCount
                    ? 'Try removing a filter. Size filters only list options this category actually sells.'
                    : 'Try a broader term, or browse the collections below.'}
                </p>
                <div className="hero__ctas" style={{ justifyContent: 'center' }}>
                  {filterCount > 0 && (
                    <button type="button" className="btn" onClick={clearAll}>
                      Clear filters
                    </button>
                  )}
                  <Link to="/shop" className="btn btn--secondary">
                    Shop all
                  </Link>
                </div>
                <ul role="list" className="chip-list" style={{ justifyContent: 'center' }}>
                  {activeCategories().map((c) => (
                    <li key={c.slug}>
                      <Link className="chip" to={`/collections/${c.slug}`}>
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="product-grid product-grid--catalog">
                {result.items.map((p, i) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    headingLevel="h2"
                    priority={i === 0}
                    onQuickShop={(product, colorSlug) => setQuick({ product, colorSlug })}
                  />
                ))}
              </div>
            )}

            {category && allMatches.items.length > result.items.length && state.page === 1 && !hasRefinements && (
              <section className="catalog-more" aria-labelledby="collection-all">
                <h2 id="collection-all" className="eyebrow">
                  All {category.name.toLowerCase()} styles
                </h2>
                <ul role="list" className="chip-list">
                  {allMatches.items.map((p) => (
                    <li key={p.id}>
                      <Link className="chip" to={`/products/${p.slug}`}>
                        {p.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {result.pageCount > 1 && (
              <nav className="pagination" aria-label="Pagination">
                <ul role="list">
                  {Array.from({ length: result.pageCount }, (_, i) => i + 1).map((n) => (
                    <li key={n}>
                      <Link to={pageHref(n)} aria-current={n === state.page ? 'page' : undefined} className="pagination__link">
                        <span className="visually-hidden">Page </span>
                        {n}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </div>

        {category && copy?.footer.map((p) => (
          <p key={p.slice(0, 20)} className="lede">
            {p}
          </p>
        ))}

        {category && <RelatedCollections slug={category.slug} title={`Shop related to ${category.name.toLowerCase()}`} />}

        {guideLinks.length > 0 && (
          <section className="catalog-more" aria-labelledby="collection-guides">
            <h2 id="collection-guides" className="eyebrow">
              Guides for {category?.name.toLowerCase()}
            </h2>
            <ul role="list" className="chip-list">
              {guideLinks.map((g) => (
                <li key={g.slug}>
                  <Link className="chip" to={`/guides/${g.slug}`}>
                    {g.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {category && (
          <section className="catalog-more" aria-labelledby="more-cats">
            <h2 id="more-cats" className="eyebrow">
              More collections
            </h2>
            <ul role="list" className="chip-list">
              {activeCategories()
                .filter((c) => c.slug !== category.slug)
                .map((c) => (
                  <li key={c.slug}>
                    <Link className="chip" to={`/collections/${c.slug}`}>
                      {c.name}
                    </Link>
                  </li>
                ))}
              {category.slug === 'shoes' || category.kind === 'shoe-use' ? (
                <li>
                  <Link className="chip" to="/fit-guide">
                    Shoe size & fit guide
                  </Link>
                </li>
              ) : null}
            </ul>
          </section>
        )}
      </div>

      <Dialog
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Filters"
        variant="drawer-left"
        className="filter-drawer"
        footer={
          <div className="filter-drawer__footer">
            <button type="button" className="btn btn--secondary" onClick={clearAll} disabled={!filterCount}>
              Clear all
            </button>
            <button type="button" className="btn" onClick={() => setDrawerOpen(false)}>
              Show {result.total} {result.total === 1 ? 'result' : 'results'}
            </button>
          </div>
        }
      >
        <FilterPanel source={source} state={state} onChange={update} showCategory={!category} idPrefix="drawer" />
      </Dialog>

      <QuickShop target={quick} onClose={() => setQuick(null)} />
    </>
  )
}

function SearchBox({ initial, onSearch }: { initial: string; onSearch: (q: string) => void }) {
  const [q, setQ] = useState(initial)
  useEffect(() => setQ(initial), [initial])
  return (
    <form
      role="search"
      className="catalog-search"
      onSubmit={(e) => {
        e.preventDefault()
        onSearch(q.trim())
      }}
    >
      <label htmlFor="catalog-q" className="visually-hidden">
        Search the edit
      </label>
      <input
        id="catalog-q"
        type="search"
        className="input"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Try: black handbag under $100"
        maxLength={80}
        enterKeyHint="search"
      />
      <button type="submit" className="btn">
        <Icon name="search" size={18} /> Search
      </button>
    </form>
  )
}
