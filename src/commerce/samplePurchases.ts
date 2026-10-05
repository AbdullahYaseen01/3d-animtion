import { allProducts, getProductById } from '../catalog/index.js'
import type { PurchaseActivity } from './purchaseActivity.js'

interface SampleBuyer {
  firstName: string
  region: string
  minutesAgo: number
}

const FIRST_NAMES = ['Sarah', 'James', 'Aisha', 'Noah', 'Maya', 'Elena', 'Omar', 'Priya', 'Lucas', 'Hannah', 'Sofia', 'Daniel']
const PLACES = ['Texas', 'California', 'New York', 'London', 'Dubai', 'Toronto', 'Paris', 'Chicago', 'Sydney', 'Florida', 'Lahore', 'Berlin']

const THING: Record<string, string> = {
  watches: 'watch',
  handbags: 'bag',
  wallets: 'wallet',
  'womens-jewelry': 'piece',
  jackets: 'jacket',
  hoodies: 'hoodie',
  coats: 'coat',
  backpacks: 'backpack',
  shoes: 'pair',
  running: 'pair',
  trail: 'pair',
  lifestyle: 'pair',
  everyday: 'pair',
}

function mix(productId: string): number {
  let hash = 2166136261
  for (let i = 0; i < productId.length; i++) {
    hash ^= productId.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** A stable line for every product, such as "Sarah from California purchased this pair". */
export function productPurchaseLine(productId: string): string | null {
  const product = getProductById(productId)
  if (!product) return null
  const n = mix(productId)
  const name = FIRST_NAMES[n % FIRST_NAMES.length]
  const place = PLACES[(n >>> 8) % PLACES.length]
  const thing = THING[product.category] ?? 'item'
  return `${name} from ${place} purchased this ${thing}`
}

/** No invented buyers for the live toast list. A toast appears only after a real paid order. */
const BUYERS: Record<string, SampleBuyer> = {}

export function samplePurchaseFor(productId: string, now = new Date()): PurchaseActivity | null {
  const product = getProductById(productId)
  const buyer = BUYERS[productId]
  if (!product || !buyer) return null
  return {
    orderNumber: `demo-${product.id}`,
    firstName: buyer.firstName,
    region: buyer.region,
    productId: product.id,
    productName: product.name,
    at: new Date(now.getTime() - buyer.minutesAgo * 60_000).toISOString(),
  }
}

/** One preview purchase per product, newest first. */
export function samplePurchases(now = new Date()): PurchaseActivity[] {
  return allProducts()
    .map((product) => samplePurchaseFor(product.id, now))
    .filter((item): item is PurchaseActivity => item !== null)
    .sort((a, b) => b.at.localeCompare(a.at))
}
