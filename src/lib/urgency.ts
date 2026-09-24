/** Display-only shopper prompts. Checkout still uses catalog stock. */

const NAMES = ['Sarah', 'James', 'Maya', 'Daniel', 'Priya', 'Chris', 'Elena', 'Noah', 'Aisha', 'Liam', 'Hannah', 'Omar']
const PLACES = ['Texas', 'Ohio', 'California', 'Colorado', 'New York', 'Illinois', 'Arizona', 'Washington', 'Georgia', 'Oregon', 'Michigan', 'Florida']
const MINUTES_AGO = [2, 4, 6, 8, 11, 14, 17, 23, 28, 36, 41, 52]

function hashString(value: string): number {
  let h = 2166136261
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** A different recent-purchase line for each product. */
export function purchaseMessage(productId: string): string {
  const name = NAMES[hashString(`name:${productId}`) % NAMES.length]
  const place = PLACES[hashString(`place:${productId}`) % PLACES.length]
  const minutes = MINUTES_AGO[hashString(`mins:${productId}`) % MINUTES_AGO.length]
  return `${name} from ${place} purchased this ${minutes} minutes ago`
}

/** A low count from 1 to 7, stable for the same product or size. */
export function urgencyLeft(seed: string): number {
  return (hashString(`stock:${seed}`) % 7) + 1
}
