import { buildSku, LOW_STOCK_THRESHOLD, stockFor, type Product } from './index.js'

/** In-stock quantities for one color, across every size and width. */
export function inStockQuantities(product: Product, colorSlug: string): number[] {
  return product.sizes.flatMap((size) =>
    product.widths
      .map((width) => stockFor(product, buildSku(product.id, colorSlug, size, width.code)))
      .filter((qty) => qty > 0),
  )
}

/**
 * Remaining units for the selected SKU, or the scarcest in-stock unit of the color
 * when a size has not been chosen yet.
 */
export function urgencyQuantity(product: Product, colorSlug: string, size: number | null, widthCode: string): number | null {
  if (product.variant === 'simple' || size != null) {
    const qty = stockFor(product, buildSku(product.id, colorSlug, size ?? 0, widthCode))
    return qty > 0 ? qty : null
  }
  const quantities = inStockQuantities(product, colorSlug)
  if (quantities.length === 0) return null
  return Math.min(...quantities)
}

/** Stock copy tied to the catalog quantity. Never invents a count. */
export function stockUrgencyLabel(product: Product, colorSlug: string, size: number | null, widthCode: string): string | null {
  const qty = urgencyQuantity(product, colorSlug, size, widthCode)
  if (qty == null) return null
  const specific = product.variant === 'simple' || size != null
  if (qty <= LOW_STOCK_THRESHOLD) {
    return specific ? `Only ${qty} left in stock` : `Only ${qty} left in a size`
  }
  return specific ? `${qty} in stock` : 'In stock'
}
