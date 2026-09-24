import { allProducts, getProductById } from '../catalog/index.js'
import type { PurchaseActivity } from './purchaseActivity.js'

interface SampleBuyer {
  firstName: string
  region: string
  minutesAgo: number
}

/** Preview shoppers. Each catalog product has its own name, state, and time. */
const BUYERS: Record<string, SampleBuyer> = {
  'stride-runner': { firstName: 'Sarah', region: 'Texas', minutesAgo: 8 },
  'ridge-trail': { firstName: 'Mike', region: 'California', minutesAgo: 14 },
  'court-low': { firstName: 'John', region: 'New York', minutesAgo: 23 },
  'drift-knit': { firstName: 'Emma', region: 'Florida', minutesAgo: 36 },
  'arc-high': { firstName: 'David', region: 'Illinois', minutesAgo: 47 },
  'glide-slip-on': { firstName: 'Priya', region: 'Washington', minutesAgo: 61 },
  'mini-crossbody': { firstName: 'Olivia', region: 'Georgia', minutesAgo: 84 },
  'slim-wallet': { firstName: 'James', region: 'Ohio', minutesAgo: 110 },
  'day-jacket': { firstName: 'Aisha', region: 'Arizona', minutesAgo: 150 },
  'arc-earrings': { firstName: 'Hannah', region: 'Colorado', minutesAgo: 190 },
  'commute-pack': { firstName: 'Chris', region: 'Oregon', minutesAgo: 240 },
  'line-watch': { firstName: 'Noah', region: 'Massachusetts', minutesAgo: 310 },
}

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
