import { allProducts, getProductById } from '../catalog/index.js'
import type { PurchaseActivity } from './purchaseActivity.js'

interface SampleBuyer {
  firstName: string
  region: string
  minutesAgo: number
}

/** No invented buyers. A note appears only after a real paid order. */
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
