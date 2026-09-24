import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { activeCategories, allProducts, formatSize, getCategory, productsInCategory, type Category } from '../catalog'
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
import { ProductCard } from '../components/product/ProductCard'
import { QuickShop, type QuickShopTarget } from '../components/product/QuickShop'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Dialog } from '../components/ui/Dialog'
import { Icon } from '../components/ui/Icon'
import { productItem, track } from '../lib/analytics'
import { breadcrumbLd, Seo } from '../lib/seo'
import { useAnnounce } from '../state/Announcer'
import NotFound from './NotFound'
import '../components/catalog/Catalog.css'
import '../components/product/ProductCard.css'

type Mode = { kind: 'shop' } | { kind: 'collection'; slug: string } | { kind: 'search' }

export default function Catalog({ mode }: { mode: Mode }) {
  const category: Category | undefined = mode.kind === 'collection' ? getCategory(mode.slug) : undefined
  if (mode.kind === 'collection' && !category) return <NotFound />
  return <CatalogView mode={mode} category={category} />
}

function CatalogView({ mode, category }: { mode: Mode; category?: Category }) {
  const [params, setParams] = useSearchParams()
  const state = useMemo(() => parseFilters(params), [params])
  const source = useMemo(() => (category ? productsInCategory(category.slug) : allProducts()), [category])
  const result = useMemo(() => applyFilters(source, state), [source, state])
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
  const title = category ? `${category.name} shoes` : isSearch ? (state.q ? `Results for “${state.q}”` : 'Search') : 'Shop all shoes'
  const crumbs = [
    { name: 'Home', path: '/' },
    ...(category || isSearch ? [{ name: 'Shop', path: '/shop' }] : []),
    { name: category ? category.name : isSearch ? 'Search' : 'Shop all', path: basePath },
  ]
  const hasRefinements = filterCount > 0 || state.sort !== 'featured'
  const seo = category
    ? { title: category.seoTitle, description: category.seoDescription }
    : isSearch
      ? { title: state.q ? `Search: ${state.q}` : 'Search', description: 'Search NOVA shoes by style, color, size or activity.' }
      : {
          title: 'Shop All Shoes',
          description: 'Shop every NOVA style: running, trail, lifestyle and everyday sneakers in US sizing, with wide widths on select styles.',
        }

  const chips = [
    ...state.category.map((c) => ({ label: activeCategories().find((x) => x.slug === c)?.name ?? c, remove: { category: state.category.filter((x) => x !== c) } })),
    ...state.size.map((s) => ({ label: `Size ${formatSize(s)}`, remove: { size: state.size.filter((x) => x !== s) } })),
    ...state.width.map((w) => ({ label: w === '2E' ? 'Wide (2E)' : w === 'D' ? 'Standard (D)' : w, remove: { width: state.width.filter((x) => x !== w) } })),
    ...state.color.map((c) => ({ label: COLOR_FAMILIES.find((x) => x.value === c)?.label ?? c, remove: { color: state.color.filter((x) => x !== c) } })),
    ...state.price.map((p) => ({ label: PRICE_BUCKETS.find((x) => x.value === p)?.label ?? p, remove: { price: state.price.filter((x) => x !== p) } })),
    ...(state.inStock ? [{ label: 'In stock', remove: { inStock: false } }] : []),
  ]

  const clearAll = () => update({ category: [], size: [], width: [], color: [], price: [], inStock: false, page: 1 })
  const pageHref = (page: number) => {
    const qs = serializeFilters({ ...state, page }).toString()
    return `${basePath}${qs ? `?${qs}` : ''}`
  }

  return (
    <>
      <Seo
        title={seo.title}
        description={seo.description}
        path={state.page > 1 && !filterCount && !isSearch ? `${basePath}?page=${state.page}` : basePath}
        noindex={isSearch || hasRefinements}
        jsonLd={isSearch ? undefined : breadcrumbLd(crumbs)}
      />
      <div className="container">
        <div className="page-head catalog-head">
          <Breadcrumbs items={crumbs} />
          <h1>{title}</h1>
          {category && <p className="lede">{category.intro}</p>}
          {!category && !isSearch && (
            <p className="lede">Road runners, trail shoes, leather classics and lightweight everyday pairs. Filter by your size to see what is in stock.</p>
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
                <h2>{isSearch && state.q ? `No results for “${state.q}”` : 'No shoes match these filters'}</h2>
                <p>
                  {filterCount
                    ? 'Try removing a filter, or choose a nearby size. Sizes shown are in stock only.'
                    : 'Try a broader term like “running”, “leather” or “wide”, or browse the collections below.'}
                </p>
                <div className="hero__ctas" style={{ justifyContent: 'center' }}>
                  {filterCount > 0 && (
                    <button type="button" className="btn" onClick={clearAll}>
                      Clear filters
                    </button>
                  )}
                  <Link to="/shop" className="btn btn--secondary">
                    Shop all shoes
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
                    priority={i < 2}
                    onQuickShop={(product, colorSlug) => setQuick({ product, colorSlug })}
                  />
                ))}
              </div>
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
              <li>
                <Link className="chip" to="/fit-guide">
                  Size & fit guide
                </Link>
              </li>
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
        Search shoes
      </label>
      <input
        id="catalog-q"
        type="search"
        className="input"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Try: comfortable shoes for walking all day"
        maxLength={80}
        enterKeyHint="search"
      />
      <button type="submit" className="btn">
        <Icon name="search" size={18} /> Search
      </button>
    </form>
  )
}
