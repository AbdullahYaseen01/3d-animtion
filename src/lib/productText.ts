import type { ColorOption, DepartmentSlug, Product } from '../catalog/types'
import { store } from '../config/store.js'
import { formatMoney } from './money.js'

const NOUN: Record<DepartmentSlug, { one: string; title: string; word: RegExp }> = {
  shoes: { one: "men's sneakers", title: "Men's Sneakers", word: /sneaker|shoe/i },
  handbags: { one: 'handbag', title: "Women's Handbag", word: /bag/i },
  wallets: { one: "men's wallet", title: "Men's Wallet", word: /wallet|bifold|clip/i },
  jackets: { one: "men's jacket", title: "Men's Jacket", word: /jacket|shacket|blazer/i },
  hoodies: { one: "men's hoodie", title: "Men's Hoodie", word: /hoodie/i },
  coats: { one: "men's coat", title: "Men's Coat", word: /coat|parka/i },
  'womens-jewelry': { one: "women's jewelry", title: "Women's Jewelry", word: /ring|earring|necklace|bangle|bracelet|kara|pendant|mala|set/i },
  backpacks: { one: 'backpack', title: 'Backpack', word: /backpack|pack/i },
  watches: { one: "men's watch", title: "Men's Watch", word: /watch/i },
}

const spec = (p: Product, re: RegExp) => p.specs.find((s) => re.test(s.label))?.value

export function brandOf(p: Product): string {
  return spec(p, /^Brand$/) ?? store.name
}

function withColor(p: Product, color: ColorOption = p.colors[0]): string {
  const first = color.name.split(/[\s/]+/)[0].toLowerCase()
  return p.name.toLowerCase().includes(first) ? p.name : `${p.name} in ${color.name}`
}

/** Descriptive alt text: product name, color, and what it is. */
export function productAlt(p: Product, color: ColorOption = p.colors[0], view?: string): string {
  const base = withColor(p, color)
  const noun = NOUN[p.category]
  const kind = noun.word.test(base) ? '' : `, ${noun.one}`
  return `${base}${kind}${view ? `, ${view}` : ''}`
}

/** Unique per product because names are unique; leads with the name and leaves room for the brand suffix. */
export function productSeoTitle(p: Product): string {
  const noun = NOUN[p.category]
  const brand = brandOf(p)
  const houseBrand = brand === store.name
  if (p.category === 'watches') {
    const model = spec(p, /^Model$/)
    const movement = spec(p, /Movement/)
    const watchOptions = [
      model && `${brand} ${model} Watch`,
      model && movement && `${brand} ${model} ${movement}`,
      `${p.name} Watch`,
      p.name,
    ].filter((t): t is string => !!t)
    const brandedLen = (t: string) => (t.length + ` | ${store.name}`.length <= 60 ? t.length + ` | ${store.name}`.length : t.length)
    return watchOptions.find((t) => t.length <= 44 && brandedLen(t) >= 30) ?? watchOptions[0].slice(0, 44)
  }
  const base = withColor(p)
  const hasBrand = !houseBrand && base.toLowerCase().includes(brand.toLowerCase())
  const options = [
    houseBrand || hasBrand || noun.word.test(base) ? null : `${base} – ${brand} ${noun.title}`,
    houseBrand || hasBrand ? null : `${base} by ${brand}`,
    noun.word.test(base) ? null : `${base} – ${noun.title}`,
    base,
    p.name,
  ].filter((t): t is string => !!t)
  return options.find((t) => t.length <= 44) ?? options[options.length - 1]
}

function factLine(p: Product): string {
  switch (p.category) {
    case 'shoes': {
      const upper = spec(p, /Upper/)
      const sole = spec(p, /Sole/)
      return [upper && `${upper} upper`, sole && `${sole} sole`].filter(Boolean).join(', ')
    }
    case 'handbags':
      return [spec(p, /^Style$/), spec(p, /Material/), spec(p, /Closure/) && `${spec(p, /Closure/)} closure`].filter(Boolean).join(', ')
    case 'wallets':
      return [spec(p, /^Style$/), spec(p, /Dimensions/) && `${spec(p, /Dimensions/)}`].filter(Boolean).join(', ')
    case 'watches':
      return [
        spec(p, /Movement/) && `${spec(p, /Movement/)} movement`,
        spec(p, /Band Material|Strap/),
        spec(p, /Water Resistance/) && `${spec(p, /Water Resistance/)} water resistance`,
      ]
        .filter(Boolean)
        .join(', ')
    case 'womens-jewelry':
      return [spec(p, /^Material$/), spec(p, /Finish/), spec(p, /Weight/)].filter(Boolean).join(', ')
    default:
      return [spec(p, /Fabric/), spec(p, /^Fit$/)].filter(Boolean).join(', ')
  }
}

function sizeLine(p: Product): string {
  if (p.variant === 'footwear') return `US men's sizes ${p.sizes[0]}–${p.sizes[p.sizes.length - 1]}`
  if (p.variant === 'apparel') return `Sizes ${p.sizes.map((s) => p.sizeLabels?.[s] ?? s).join(', ')}`
  return ''
}

/** Built from the product's own data. Seo trims it to 160 characters at a word boundary. */
export function productMetaDescription(p: Product): string {
  const free = store.shipping.standard.priceCents === 0
  const facts = factLine(p)
  const sizes = sizeLine(p)
  const text = [
    `Shop the ${withColor(p)} from ${brandOf(p)}.`,
    `${formatMoney(p.priceCents)}${free ? ' with free US shipping' : ''} and ${store.returns.windowDays}-day returns.`,
    facts ? `${facts[0].toUpperCase()}${facts.slice(1)}.` : '',
    sizes ? `${sizes}.` : '',
  ]
    .filter(Boolean)
    .join(' ')
  return text.length >= 140 ? text : `${text} See photos, full specifications, and care details.`
}
