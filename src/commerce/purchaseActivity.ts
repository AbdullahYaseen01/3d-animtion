import { resolveSku } from '../catalog/index.js'

const STORAGE_KEY = 'nova:purchase-activity'
const CHANGE_EVENT = 'nova:purchase-activity'
const MAX_ENTRIES = 30
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000

export interface PurchaseActivity {
  orderNumber: string
  firstName: string
  region: string
  productId: string
  productName: string
  at: string
}

export interface ConfirmedOrder {
  orderNumber: string
  status: string
  firstName: string | null
  shipTo: string | null
  lines: { sku: string | null }[]
}

const US_STATE_NAMES: Record<string, string> = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  DC: 'District of Columbia',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
}

const NAME_PATTERN = /^\p{L}[\p{L}'’.-]{0,30}$/u

/** State or region from a "City, ST" ship-to line. Returns null when it is missing. */
export function regionFromShipTo(shipTo: string | null | undefined): string | null {
  if (!shipTo) return null
  const parts = shipTo
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  const region = parts[parts.length - 1]
  if (!region || region.length > 40) return null
  return US_STATE_NAMES[region.toUpperCase()] ?? region
}

export function relativeAgo(at: Date, now: Date): string {
  const elapsed = now.getTime() - at.getTime()
  if (!Number.isFinite(elapsed) || elapsed < 60_000) return 'just now'
  const minutes = Math.floor(elapsed / 60_000)
  if (minutes < 60) return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

export function purchaseSentence(activity: PurchaseActivity, now = new Date()): string {
  return `${activity.firstName} from ${activity.region} purchased ${activity.productName} ${relativeAgo(new Date(activity.at), now)}.`
}

/** Builds activity from a paid order. Skips orders that have no verified name, region, or catalog SKU. */
export function purchasesFromOrder(order: ConfirmedOrder, at = new Date()): PurchaseActivity[] {
  if (order.status !== 'paid') return []
  const firstName = order.firstName?.trim() ?? ''
  const region = regionFromShipTo(order.shipTo)
  if (!region || !NAME_PATTERN.test(firstName)) return []
  const seen = new Set<string>()
  const activities: PurchaseActivity[] = []
  for (const line of order.lines) {
    if (!line.sku) continue
    const resolved = resolveSku(line.sku)
    if (!resolved || seen.has(resolved.product.id)) continue
    seen.add(resolved.product.id)
    activities.push({
      orderNumber: order.orderNumber,
      firstName,
      region,
      productId: resolved.product.id,
      productName: resolved.product.name,
      at: at.toISOString(),
    })
  }
  return activities
}

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

export function readPurchases(): PurchaseActivity[] {
  const raw = storage()?.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const cutoff = Date.now() - MAX_AGE_MS
    return parsed.filter((item): item is PurchaseActivity => {
      if (!item || typeof item !== 'object') return false
      const row = item as PurchaseActivity
      return (
        typeof row.orderNumber === 'string' &&
        typeof row.firstName === 'string' &&
        typeof row.region === 'string' &&
        typeof row.productId === 'string' &&
        typeof row.productName === 'string' &&
        typeof row.at === 'string' &&
        new Date(row.at).getTime() >= cutoff
      )
    })
  } catch {
    return []
  }
}

export function rememberPurchases(incoming: PurchaseActivity[]): void {
  if (incoming.length === 0) return
  const store = storage()
  if (!store) return
  const existing = readPurchases()
  const seen = new Set(existing.map((item) => `${item.orderNumber}:${item.productId}`))
  const merged = [...incoming.filter((item) => !seen.has(`${item.orderNumber}:${item.productId}`)), ...existing].slice(0, MAX_ENTRIES)
  store.setItem(STORAGE_KEY, JSON.stringify(merged))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function latestPurchaseFor(productId: string, now = new Date()): PurchaseActivity | null {
  const matches = readPurchases()
    .filter((item) => item.productId === productId && new Date(item.at).getTime() <= now.getTime())
    .sort((a, b) => b.at.localeCompare(a.at))
  return matches[0] ?? null
}

export function subscribePurchases(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onChange()
  }
  window.addEventListener('storage', onStorage)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}
