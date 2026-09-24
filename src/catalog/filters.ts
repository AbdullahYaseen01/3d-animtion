import { activeCategories, formatSize, isColorAvailable, isProductAvailable, isSizeAvailable } from './index'
import type { CategorySlug, ColorOption, Product } from './types'

export type SortKey = 'featured' | 'newest' | 'price-asc' | 'price-desc'

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
]

export const PRICE_BUCKETS = [
  { value: 'under-120', label: 'Under $120', min: 0, max: 11999 },
  { value: '120-140', label: '$120 – $140', min: 12000, max: 14000 },
  { value: 'over-140', label: 'Over $140', min: 14001, max: Infinity },
] as const

export const COLOR_FAMILIES: { value: ColorOption['family']; label: string; hex: string }[] = [
  { value: 'white', label: 'White', hex: '#F1EEE7' },
  { value: 'black', label: 'Black', hex: '#1C1C1C' },
  { value: 'grey', label: 'Grey', hex: '#8A8A86' },
  { value: 'green', label: 'Green', hex: '#6A7A55' },
  { value: 'red', label: 'Red', hex: '#6B1F26' },
  { value: 'neutral', label: 'Neutral', hex: '#CDB99A' },
]

export interface FilterState {
  q: string
  category: CategorySlug[]
  color: ColorOption['family'][]
  size: number[]
  width: string[]
  price: string[]
  inStock: boolean
  sort: SortKey
  page: number
}

export const PAGE_SIZE = 12

const list = (params: URLSearchParams, key: string) =>
  (params.get(key) ?? '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)

export function parseFilters(params: URLSearchParams): FilterState {
  const validCategories = new Set(activeCategories().map((c) => c.slug))
  const validColors = new Set(COLOR_FAMILIES.map((c) => c.value))
  const validPrices = new Set<string>(PRICE_BUCKETS.map((b) => b.value))
  const sort = params.get('sort') as SortKey
  const page = Number(params.get('page'))
  return {
    q: (params.get('q') ?? '').slice(0, 80),
    category: list(params, 'category').filter((c): c is CategorySlug => validCategories.has(c as CategorySlug)),
    color: list(params, 'color').filter((c): c is ColorOption['family'] => validColors.has(c as ColorOption['family'])),
    size: list(params, 'size')
      .map(Number)
      .filter((n) => Number.isFinite(n) && n > 0 && n < 20),
    width: list(params, 'width').filter((w) => /^[A-Z0-9]{1,3}$/.test(w)),
    price: list(params, 'price').filter((p) => validPrices.has(p)),
    inStock: params.get('availability') === 'in-stock',
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? sort : 'featured',
    page: Number.isInteger(page) && page > 1 ? page : 1,
  }
}

/** Serializes filters back to URL params, omitting defaults so URLs stay clean. */
export function serializeFilters(state: Partial<FilterState>): URLSearchParams {
  const p = new URLSearchParams()
  if (state.q) p.set('q', state.q)
  if (state.category?.length) p.set('category', state.category.join(','))
  if (state.color?.length) p.set('color', state.color.join(','))
  if (state.size?.length) p.set('size', [...state.size].sort((a, b) => a - b).map(formatSize).join(','))
  if (state.width?.length) p.set('width', state.width.join(','))
  if (state.price?.length) p.set('price', state.price.join(','))
  if (state.inStock) p.set('availability', 'in-stock')
  if (state.sort && state.sort !== 'featured') p.set('sort', state.sort)
  if (state.page && state.page > 1) p.set('page', String(state.page))
  return p
}

export function activeFilterCount(s: FilterState): number {
  return s.category.length + s.color.length + s.size.length + s.width.length + s.price.length + (s.inStock ? 1 : 0)
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s]/g, ' ')
}

export function searchText(product: Product): string {
  const category = activeCategories().find((c) => c.slug === product.category)
  return normalize(
    [
      product.name,
      product.tagline,
      category?.name,
      category?.summary,
      product.colors.map((c) => c.name).join(' '),
      product.bestFor.join(' '),
      product.materials,
      product.highlights.join(' '),
    ].join(' '),
  )
}

const SYNONYMS: Record<string, string[]> = {
  sneaker: ['sneakers', 'shoe', 'shoes'],
  sneakers: ['sneaker', 'shoe', 'shoes'],
  runner: ['running', 'run'],
  running: ['runner', 'run'],
  hiking: ['trail', 'hike'],
  hike: ['trail', 'hiking'],
  wide: ['wide'],
  leather: ['leather'],
  slipon: ['slip'],
  loafer: ['slip'],
  casual: ['lifestyle', 'everyday'],
  walking: ['everyday', 'walks', 'walk'],
}

export function matchesQuery(product: Product, q: string): boolean {
  const tokens = normalize(q).split(/\s+/).filter(Boolean)
  if (!tokens.length) return true
  const haystack = searchText(product)
  const generic = new Set(['shoe', 'shoes', 'sneaker', 'sneakers', 'nova', 'men', 'mens', 'women', 'womens'])
  return tokens.every(
    (t) =>
      generic.has(t) ||
      haystack.includes(t) ||
      (SYNONYMS[t] ?? []).some((s) => haystack.includes(s)) ||
      (t.length > 3 && haystack.includes(t.replace(/s$/, ''))),
  )
}

export interface FilterResult {
  items: Product[]
  total: number
  pageCount: number
}

export function applyFilters(source: Product[], s: FilterState): FilterResult {
  let items = source.filter((p) => matchesQuery(p, s.q))
  if (s.category.length) items = items.filter((p) => s.category.includes(p.category))
  if (s.color.length) items = items.filter((p) => p.colors.some((c) => s.color.includes(c.family)))
  if (s.width.length) items = items.filter((p) => p.widths.some((w) => s.width.includes(w.code)))
  if (s.price.length) {
    const buckets = PRICE_BUCKETS.filter((b) => s.price.includes(b.value))
    items = items.filter((p) => buckets.some((b) => p.priceCents >= b.min && p.priceCents <= b.max))
  }
  if (s.size.length) {
    // Shoppers filtering by size expect pairs they can actually buy in that size.
    const widths = s.width.length ? s.width : [undefined]
    items = items.filter((p) => s.size.some((size) => widths.some((w) => isSizeAvailable(p, size, w))))
  }
  if (s.inStock) {
    items = items.filter((p) =>
      s.color.length
        ? p.colors.some((c) => s.color.includes(c.family) && isColorAvailable(p, c.slug))
        : isProductAvailable(p),
    )
  }

  const order = new Map(source.map((p, i) => [p.id, i]))
  const sorted = [...items]
  switch (s.sort) {
    case 'price-asc':
      sorted.sort((a, b) => a.priceCents - b.priceCents)
      break
    case 'price-desc':
      sorted.sort((a, b) => b.priceCents - a.priceCents)
      break
    case 'newest':
      sorted.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew) || order.get(a.id)! - order.get(b.id)!)
      break
    default:
      break
  }

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const page = Math.min(s.page, pageCount)
  return {
    items: sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: sorted.length,
    pageCount,
  }
}

/** Filter facets derived from the products being browsed. */
export function facetsFor(source: Product[]) {
  const sizes = [...new Set(source.flatMap((p) => p.sizes))].sort((a, b) => a - b)
  const widthMap = new Map<string, string>()
  source.forEach((p) => p.widths.forEach((w) => widthMap.set(w.code, w.label)))
  const families = new Set(source.flatMap((p) => p.colors.map((c) => c.family)))
  const cats = new Set(source.map((p) => p.category))
  return {
    categories: activeCategories().filter((c) => cats.has(c.slug)),
    colors: COLOR_FAMILIES.filter((c) => families.has(c.value)),
    sizes,
    widths: [...widthMap].map(([code, label]) => ({ code, label })),
    prices: PRICE_BUCKETS.filter((b) => source.some((p) => p.priceCents >= b.min && p.priceCents <= b.max)),
  }
}
