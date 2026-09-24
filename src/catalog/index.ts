import { categories, products } from './products.js'
import type { Category, CategorySlug, ColorOption, Product, Variant } from './types.js'

export { CATALOG_IS_SAMPLE } from './products.js'
export type * from './types.js'

export const LOW_STOCK_THRESHOLD = 3

export function allProducts(): Product[] {
  return products
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

/** Categories that currently contain at least one product. */
export function activeCategories(): (Category & { count: number })[] {
  return categories
    .map((c) => ({ ...c, count: products.filter((p) => p.category === c.slug).length }))
    .filter((c) => c.count > 0)
}

export function getCategory(slug: string): Category | undefined {
  return activeCategories().find((c) => c.slug === slug)
}

export function productsInCategory(slug: CategorySlug): Product[] {
  return products.filter((p) => p.category === slug)
}

export function getColor(product: Product, colorSlug?: string | null): ColorOption {
  return product.colors.find((c) => c.slug === colorSlug) ?? product.colors[0]
}

export function formatSize(size: number): string {
  return Number.isInteger(size) ? String(size) : size.toFixed(1)
}

export function buildSku(productId: string, colorSlug: string, size: number, widthCode: string): string {
  return `${productId}:${colorSlug}:${formatSize(size)}:${widthCode}`
}

/** Resolves a SKU against the live catalog. Returns null for unknown or malformed SKUs. */
export function resolveSku(sku: string): { product: Product; color: ColorOption; variant: Variant } | null {
  if (typeof sku !== 'string' || sku.length > 80) return null
  const [productId, colorSlug, sizeRaw, widthCode, ...rest] = sku.split(':')
  if (rest.length || !productId || !colorSlug || !sizeRaw || !widthCode) return null
  const product = getProductById(productId)
  if (!product) return null
  const color = product.colors.find((c) => c.slug === colorSlug)
  const size = Number(sizeRaw)
  if (!color || !product.sizes.includes(size)) return null
  if (!product.widths.some((w) => w.code === widthCode)) return null
  if (buildSku(productId, colorSlug, size, widthCode) !== sku) return null
  return { product, color, variant: { sku, productId, colorSlug, size, widthCode } }
}

export function stockFor(product: Product, sku: string): number {
  return product.stock[sku] ?? product.defaultStock
}

export function isColorAvailable(product: Product, colorSlug: string, widthCode?: string): boolean {
  return product.sizes.some((size) =>
    product.widths
      .filter((w) => !widthCode || w.code === widthCode)
      .some((w) => stockFor(product, buildSku(product.id, colorSlug, size, w.code)) > 0),
  )
}

export function isProductAvailable(product: Product): boolean {
  return product.colors.some((c) => isColorAvailable(product, c.slug))
}

export function isSizeAvailable(product: Product, size: number, widthCode?: string, colorSlug?: string): boolean {
  return product.colors
    .filter((c) => !colorSlug || c.slug === colorSlug)
    .some((c) =>
      product.widths
        .filter((w) => !widthCode || w.code === widthCode)
        .some((w) => stockFor(product, buildSku(product.id, c.slug, size, w.code)) > 0),
    )
}

export function variantLabel(product: Product, color: ColorOption, size: number, widthCode: string): string {
  const width = product.widths.find((w) => w.code === widthCode)
  const widthText = product.widths.length > 1 && width ? `, ${width.label} (${width.code})` : ''
  return `${color.name} · US M ${formatSize(size)}${widthText}`
}

export function productImagePath(key: string, width = 700, format: 'webp' | 'avif' = 'webp'): string {
  return `/images/products/${key}-${width}.${format}`
}
