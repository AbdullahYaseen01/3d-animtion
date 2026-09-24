import { store } from '../config/store.js'
import { resolveSku, stockFor, type ColorOption, type Product } from '../catalog/index.js'

export interface CartLine {
  sku: string
  quantity: number
}

export type CartAction =
  | { type: 'add'; sku: string; quantity: number }
  | { type: 'set'; sku: string; quantity: number }
  | { type: 'remove'; sku: string }
  | { type: 'replace'; lines: CartLine[] }
  | { type: 'clear' }

const MAX_QTY = store.checkout.maxQuantityPerLine

function clampQty(q: number): number {
  return Math.max(0, Math.min(MAX_QTY, Math.floor(q)))
}

/** Pure cart reducer. Each SKU (product + color + size + width) is its own line. */
export function cartReducer(lines: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case 'add': {
      const existing = lines.find((l) => l.sku === action.sku)
      if (existing) {
        return lines.map((l) => (l.sku === action.sku ? { ...l, quantity: clampQty(l.quantity + action.quantity) } : l))
      }
      if (lines.length >= store.checkout.maxLines) return lines
      const quantity = clampQty(action.quantity)
      return quantity > 0 ? [...lines, { sku: action.sku, quantity }] : lines
    }
    case 'set': {
      const quantity = clampQty(action.quantity)
      return quantity === 0
        ? lines.filter((l) => l.sku !== action.sku)
        : lines.map((l) => (l.sku === action.sku ? { ...l, quantity } : l))
    }
    case 'remove':
      return lines.filter((l) => l.sku !== action.sku)
    case 'replace':
      return action.lines
    case 'clear':
      return []
  }
}

export type CartIssue =
  | { type: 'unknown'; sku: string }
  | { type: 'sold-out'; sku: string; name: string }
  | { type: 'reduced'; sku: string; name: string; available: number }

/**
 * Validates persisted or submitted lines against the current catalog:
 * drops malformed/unknown SKUs, merges duplicates, and caps quantity to stock.
 */
export function validateLines(input: unknown): { lines: CartLine[]; issues: CartIssue[] } {
  const issues: CartIssue[] = []
  if (!Array.isArray(input)) return { lines: [], issues }
  const merged = new Map<string, number>()
  for (const raw of input.slice(0, 50)) {
    if (!raw || typeof raw !== 'object') continue
    const { sku, quantity } = raw as Record<string, unknown>
    if (typeof sku !== 'string' || typeof quantity !== 'number' || !Number.isFinite(quantity)) continue
    const q = clampQty(quantity)
    if (q <= 0) continue
    merged.set(sku, clampQty((merged.get(sku) ?? 0) + q))
  }
  const lines: CartLine[] = []
  for (const [sku, quantity] of merged) {
    const resolved = resolveSku(sku)
    if (!resolved) {
      issues.push({ type: 'unknown', sku })
      continue
    }
    const available = stockFor(resolved.product, sku)
    if (available <= 0) {
      issues.push({ type: 'sold-out', sku, name: resolved.product.name })
      continue
    }
    if (quantity > available) {
      issues.push({ type: 'reduced', sku, name: resolved.product.name, available })
      lines.push({ sku, quantity: available })
      continue
    }
    lines.push({ sku, quantity })
    if (lines.length >= store.checkout.maxLines) break
  }
  return { lines, issues }
}

export interface PricedLine {
  sku: string
  product: Product
  color: ColorOption
  size: number
  widthCode: string
  quantity: number
  unitCents: number
  lineCents: number
  stock: number
}

export interface PricedCart {
  lines: PricedLine[]
  itemCount: number
  subtotalCents: number
  /** Standard shipping for this subtotal under current business rules. */
  shippingCents: number
  /** Cents remaining to reach free shipping, or null when no threshold applies. */
  freeShippingRemainingCents: number | null
  totalBeforeTaxCents: number
}

export function shippingFor(subtotalCents: number): { cents: number; remaining: number | null } {
  const { standard, freeThresholdCents } = store.shipping
  if (freeThresholdCents == null) return { cents: standard.priceCents, remaining: null }
  if (subtotalCents >= freeThresholdCents) return { cents: 0, remaining: 0 }
  return { cents: standard.priceCents, remaining: freeThresholdCents - subtotalCents }
}

/** Prices lines using catalog prices only; never trusts client-provided amounts. */
export function priceCart(lines: CartLine[]): PricedCart {
  const priced: PricedLine[] = []
  for (const line of lines) {
    const resolved = resolveSku(line.sku)
    if (!resolved) continue
    const { product, color, variant } = resolved
    priced.push({
      sku: line.sku,
      product,
      color,
      size: variant.size,
      widthCode: variant.widthCode,
      quantity: line.quantity,
      unitCents: product.priceCents,
      lineCents: product.priceCents * line.quantity,
      stock: stockFor(product, line.sku),
    })
  }
  const subtotalCents = priced.reduce((sum, l) => sum + l.lineCents, 0)
  const itemCount = priced.reduce((sum, l) => sum + l.quantity, 0)
  const ship = priced.length ? shippingFor(subtotalCents) : { cents: 0, remaining: null }
  return {
    lines: priced,
    itemCount,
    subtotalCents,
    shippingCents: ship.cents,
    freeShippingRemainingCents: ship.remaining,
    totalBeforeTaxCents: subtotalCents + ship.cents,
  }
}
