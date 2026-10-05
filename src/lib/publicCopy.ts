import type { Product } from '../catalog/types.js'

/** Source labels that must not appear in customer-facing copy. Watch brands stay. */
const SUPPLIERS = ['Bag X', 'Meerzah', 'Ndure', 'Metro', 'ZED'] as const

const BRAND = '(?:Bag X|Meerzah|Ndure|Metro|ZED)'

export function isSupplierBrand(name: string): boolean {
  const n = name.trim().toLowerCase()
  return SUPPLIERS.some((b) => b.toLowerCase() === n)
}

function tidy(text: string): string {
  return text
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([–-])/g, ' $1')
    .trim()
}

function scrubPlain(text: string): string {
  let out = text
  const rules: [RegExp, string][] = [
    [new RegExp(`\\b${BRAND}'s\\b`, 'gi'), "the maker's"],
    [new RegExp(`\\bas listed by ${BRAND}\\b`, 'gi'), 'as listed on the product'],
    [new RegExp(`\\bwhen ${BRAND} published them\\b`, 'gi'), 'when they are published'],
    [new RegExp(`\\bwhere ${BRAND} published\\b`, 'gi'), 'where the listing published'],
    [new RegExp(`\\b${BRAND} does not publish\\b`, 'gi'), 'the listing does not publish'],
    [new RegExp(`\\b${BRAND} lists\\b`, 'gi'), 'the listing shows'],
    [new RegExp(`\\b${BRAND} describes\\b`, 'gi'), 'the listing describes'],
    [new RegExp(`\\b${BRAND} notes\\b`, 'gi'), 'the listing notes'],
    [new RegExp(`\\b${BRAND} prints\\b`, 'gi'), 'the listing prints'],
    [new RegExp(`\\b${BRAND} listed\\b`, 'gi'), 'the listing shows'],
    [new RegExp(`\\bfrom ${BRAND}\\b`, 'gi'), ''],
    [new RegExp(`\\bby ${BRAND}\\b`, 'gi'), ''],
    [new RegExp(`\\bour ${BRAND}\\b`, 'gi'), 'our'],
    [new RegExp(`\\ba ${BRAND}\\b`, 'gi'), 'a'],
    [new RegExp(`\\bthe ${BRAND}\\b`, 'gi'), 'the'],
    [new RegExp(`\\b${BRAND} men'?s\\b`, 'gi'), "men's"],
    [new RegExp(`\\b${BRAND} women'?s\\b`, 'gi'), "women's"],
    [new RegExp(`\\b${BRAND}\\b`, 'gi'), ''],
  ]
  for (const [re, rep] of rules) out = out.replace(re, rep)
  out = tidy(out).replace(/(^|[.!?]\s+)([a-z])/g, (_, lead: string, ch: string) => lead + ch.toUpperCase())
  return out
}

/** Removes supplier brand names, including inside [label](/path) links. */
export function publicText(input: string): string {
  const links: string[] = []
  const parked = input.replace(/\[[^\]]+\]\([^)]+\)/g, (token) => {
    const match = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (!match) return token
    const label = scrubPlain(match[1])
    const slot = `\u0000${links.length}\u0000`
    links.push(`[${label || match[1]}](${match[2]})`)
    return slot
  })
  return scrubPlain(parked).replace(/\u0000(\d+)\u0000/g, (_, i: string) => links[Number(i)])
}

function padDescription(text: string): string {
  if (text.length >= 100) return text
  return `${text} Free US shipping and 30-day returns on unused items.`
}

/** Customer-facing product: supplier brand is Westora's own catalog, not the source label. */
export function asStoreProduct(product: Product): Product {
  return {
    ...product,
    name: publicText(product.name),
    description: padDescription(publicText(product.description)),
    tagline: publicText(product.tagline),
    care: publicText(product.care),
    materials: publicText(product.materials),
    highlights: product.highlights.map((h) => publicText(h)),
    bestFor: product.bestFor.map((b) => publicText(b)),
    fit: { summary: publicText(product.fit.summary), advice: publicText(product.fit.advice) },
    specs: product.specs
      .filter((s) => !(s.label === 'Brand' && isSupplierBrand(s.value)))
      .map((s) => ({ ...s, value: publicText(s.value) })),
    traits: product.traits
      ?.filter((t) => !(t.group === 'Brand' && isSupplierBrand(t.value)))
      .map((t) => ({ ...t, value: publicText(t.value) })),
  }
}
