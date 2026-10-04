import { productsInCategory, type Category } from '../catalog'
import { store } from '../config/store'
import { formatMoney } from './money'
import { brandOf } from './productText'
import { specOf } from './seoKeywords'

function words(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function unique(values: (string | undefined)[]): string[] {
  return [...new Set(values.filter((v): v is string => !!v && v.trim().length > 0))]
}

function list(items: string[], max = 6): string {
  const slice = items.slice(0, max)
  if (slice.length === 0) return ''
  if (slice.length === 1) return slice[0]
  if (slice.length === 2) return `${slice[0]} and ${slice[1]}`
  return `${slice.slice(0, -1).join(', ')}, and ${slice[slice.length - 1]}`
}

export function brandCopy(name: string, items: import('../catalog').Product[]): { intro: string[]; footer: string[] } {
  if (items.length === 0) return { intro: [], footer: [] }
  const prices = items.map((p) => p.priceCents)
  const departments = unique(items.map((p) => p.category.replace(/-/g, ' ')))
  const ship =
    store.shipping.standard.priceCents === 0
      ? `Standard shipping is free to US addresses and usually arrives in ${store.shipping.standard.minBusinessDays}–${store.shipping.standard.maxBusinessDays} business days after we process the order.`
      : `Orders ship to US addresses.`
  const intro = [
    `${name} has ${items.length} styles in this store, priced from ${formatMoney(Math.min(...prices))} to ${formatMoney(Math.max(...prices))}. Westora Style is a US retailer, not ${name}; we sell these pieces and list the specifications the brand published.`,
    `You will find ${list(departments)} from this brand below. Open a product for the model or style name, materials, and care. We do not add reviews, ratings, or facts the listing does not support.`,
    `${ship} Unused items can be returned within ${store.returns.windowDays} days in original condition. If ${name} did not publish a measurement or water-resistance rating, that field is omitted.`,
  ]
  const footer = [
    `More ${name} pieces may be added when the catalog is updated. Until then, this page is the complete list we sell. Questions about a model or an order go to ${store.supportEmail}.`,
  ]
  return { intro, footer }
}

export function collectionCopy(category: Category): { intro: string[]; footer: string[] } {
  const items = productsInCategory(category.slug)
  if (items.length === 0) {
    return {
      intro: [category.intro],
      footer: [`This collection is empty. We do not list products we do not stock.`],
    }
  }
  const prices = items.map((p) => p.priceCents)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const brands = unique(items.map(brandOf))
  const materials = unique(items.map((p) => specOf(p, /^Fabric$|^Material$|^Upper$/) ?? p.materials.split('.')[0]))
  const styles = unique(items.map((p) => specOf(p, /^Style$|^Type$/)))
  const shoe = items[0].variant === 'footwear'
  const apparel = items[0].variant === 'apparel'
  const sizes = shoe
    ? `US men's sizes ${Math.min(...items.flatMap((p) => p.sizes))}–${Math.max(...items.flatMap((p) => p.sizes))}, standard width only`
    : apparel
      ? `letter sizes ${[...new Set(items.flatMap((p) => p.sizes.map((s) => p.sizeLabels?.[s] ?? String(s))))].join(', ')}`
      : 'one size, as listed on each product'
  const ship =
    store.shipping.standard.priceCents === 0
      ? `Standard shipping is free to US addresses and usually arrives in ${store.shipping.standard.minBusinessDays}–${store.shipping.standard.maxBusinessDays} business days after we process the order.`
      : `Orders ship to US addresses.`
  const returns = `Unused items can be returned within ${store.returns.windowDays} days in original condition.`

  const intro: string[] = []
  intro.push(
    `This collection has ${items.length} ${items.length === 1 ? 'style' : 'styles'} from ${list(brands)}. Prices run from ${formatMoney(min)} to ${formatMoney(max)}.`,
  )
  if (styles.length) intro.push(`Shapes in stock: ${list(styles, 8)}.`)
  intro.push(`Sizes: ${sizes}. We do not stock wide footwear widths.`)
  if (category.slug === 'coats' || category.slug === 'jackets' || category.slug === 'hoodies') {
    const woolish = items.filter((p) => /wool/i.test(p.name + p.materials + (specOf(p, /^Fabric$/) ?? '')))
    const cottonPoly = items.filter((p) => /80%\s*cotton/i.test(p.materials + (specOf(p, /^Fabric$/) ?? '')))
    intro.push(
      `${cottonPoly.length} of these ${category.slug} list 80% cotton and 20% polyester. ${woolish.length} names mention wool; read the fabric line on the product — a wool label in the name is not a 100% wool claim.`,
    )
  }
  if (materials.length) intro.push(`Materials that appear on the listings include ${list(materials, 5)}.`)
  intro.push(`${ship} ${returns} Every specification on a product page comes from the brand listing we imported; if a maker did not publish a fact, we leave it off.`)

  const footer: string[] = [
    `Looking for a specific model or color? Open a product for the full specification table, care notes, and a comparison with a sibling style from the same brand. ${ship} Questions about fit or an order go to ${store.supportEmail}.`,
  ]

  let text = [...intro, ...footer].join(' ')
  if (words(text) < 150) {
    intro.push(
      `Filter this page by color or sort by price. Paginated and filtered URLs stay out of the index; this clean URL is the one to share. Related guides linked below use the same catalog facts.`,
    )
  }
  text = [...intro, ...footer].join(' ')
  if (words(text) > 300) {
    intro.splice(3, intro.length - 3)
  }
  return { intro, footer }
}
