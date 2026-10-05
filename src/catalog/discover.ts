import { brandKeywords, specOf, subCollectionKeywords } from '../lib/seoKeywords.js'
import { brandOf } from '../lib/productText.js'
import { products } from './products.js'
import type { Category, DepartmentSlug, Product, StyleSlug } from './types.js'

const MIN_STYLE_PRODUCTS = 8

export function brandSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export interface BrandInfo {
  slug: string
  name: string
  products: Product[]
}

export function allBrandGroups(): BrandInfo[] {
  const groups = new Map<string, BrandInfo>()
  for (const product of products) {
    const name = brandOf(product)
    const slug = brandSlug(name)
    const existing = groups.get(slug)
    if (existing) existing.products.push(product)
    else groups.set(slug, { slug, name, products: [product] })
  }
  return [...groups.values()].sort((a, b) => b.products.length - a.products.length)
}

/** Brand pages are an allowlist in brandKeywords, including labels with fewer than five products. */
export function liveBrands(): BrandInfo[] {
  return allBrandGroups().filter((b) => brandKeywords[b.slug])
}

export function getBrand(slug: string): BrandInfo | undefined {
  return liveBrands().find((b) => b.slug === slug)
}

export function productsForBrand(slug: string): Product[] {
  return getBrand(slug)?.products ?? []
}

export function moreFromBrand(product: Product, limit = 4): Product[] {
  const slug = brandSlug(brandOf(product))
  return productsForBrand(slug)
    .filter((p) => p.id !== product.id)
    .slice(0, limit)
}

function styleOf(product: Product): string {
  return (specOf(product, /^Style$|^Type$/) ?? '').toLowerCase()
}

function strapOf(product: Product): string {
  return (
    specOf(product, /^Strap$|^Band Material$/) ??
    product.traits?.find((t) => t.group === 'Strap')?.value ??
    ''
  ).toLowerCase()
}

function movementOf(product: Product): string {
  return (specOf(product, /^Movement$/) ?? product.traits?.find((t) => t.group === 'Movement')?.value ?? '').toLowerCase()
}

export interface StyleCollectionDef {
  slug: StyleSlug
  parent: DepartmentSlug
  name: string
  summary: string
  match: (product: Product) => boolean
}

export const STYLE_COLLECTION_DEFS: StyleCollectionDef[] = [
  {
    slug: 'shoulder-bags',
    parent: 'handbags',
    name: 'Shoulder Bags',
    summary: "Women's shoulder bags",
    match: (p) => p.category === 'handbags' && styleOf(p).includes('shoulder'),
  },
  {
    slug: 'crossbody-bags',
    parent: 'handbags',
    name: 'Crossbody Bags',
    summary: "Women's crossbody bags",
    match: (p) => p.category === 'handbags' && styleOf(p).includes('crossbody'),
  },
  {
    slug: 'digital-watches',
    parent: 'watches',
    name: 'Digital Watches',
    summary: "Men's digital watches",
    match: (p) => p.category === 'watches' && /digital/.test(movementOf(p) + p.tagline + p.name),
  },
  {
    slug: 'leather-strap-watches',
    parent: 'watches',
    name: 'Leather Strap Watches',
    summary: "Men's leather-strap watches",
    match: (p) => p.category === 'watches' && /leather/.test(strapOf(p)),
  },
  {
    slug: 'metal-bracelet-watches',
    parent: 'watches',
    name: 'Metal Bracelet Watches',
    summary: "Men's metal-bracelet watches",
    match: (p) => p.category === 'watches' && /metal|steel|bracelet/.test(strapOf(p)),
  },
  {
    slug: 'watches-under-50',
    parent: 'watches',
    name: 'Watches Under $50',
    summary: "Men's watches under $50",
    match: (p) => p.category === 'watches' && p.priceCents < 5000,
  },
]

export function productsInStyle(slug: StyleSlug): Product[] {
  const def = STYLE_COLLECTION_DEFS.find((d) => d.slug === slug)
  return def ? products.filter(def.match) : []
}

export function liveStyleCollections(): (Category & { count: number; parent: DepartmentSlug })[] {
  return STYLE_COLLECTION_DEFS.flatMap((def) => {
    const items = products.filter(def.match)
    const seo = subCollectionKeywords[def.slug]
    if (items.length < MIN_STYLE_PRODUCTS || !seo) return []
    return [
      {
        slug: def.slug,
        name: def.name,
        kind: 'style' as const,
        parent: def.parent,
        summary: def.summary,
        intro: '',
        seoTitle: seo.title,
        seoDescription: seo.description,
        count: items.length,
      },
    ]
  })
}

export function styleCollectionsFor(parent: DepartmentSlug): (Category & { count: number })[] {
  return liveStyleCollections().filter((c) => c.parent === parent)
}
