import { store } from '../config/store'
import type { Product } from '../catalog/types'
import { formatMoney } from './money'
import { brandOf } from './productText'
import { specOf } from './seoKeywords'

function spec(p: Product, re: RegExp): string | undefined {
  return specOf(p, re)
}

export function productFaqs(p: Product): { question: string; answer: string }[] {
  const brand = brandOf(p)
  const ship = store.shipping.standard
  const items: { question: string; answer: string }[] = []

  if (p.category === 'watches') {
    const model = spec(p, /^Model$/)
    const movement = spec(p, /Movement/)
    const water = spec(p, /Water Resistance/)
    const strap = spec(p, /Band Material|^Strap$/)
    const size = spec(p, /Case Size|Case Diameter/)
    items.push({
      question: model ? `What is the ${brand} ${model}?` : `What is the ${p.name}?`,
      answer: `${p.name} is a ${brand} watch${movement ? ` with ${movement} movement` : ''}${strap ? ` on a ${strap}` : ''}. ${water ? `Water resistance is listed as ${water}.` : 'No water-resistance rating is published for this model.'}${size ? ` Case size is ${size}.` : ''}`,
    })
    items.push({
      question: 'Can I swim with this watch?',
      answer: water
        ? `The maker lists water resistance as ${water}. That is not a swim-proof claim unless the rating is high enough for swimming; we only repeat the published figure.`
        : 'The maker did not publish a water-resistance rating, so we do not claim it is suitable for swimming.',
    })
    items.push({
      question: 'Is this a men\'s or unisex watch?',
      answer: `We list the product as the brand named it: ${p.name}. We do not add a gender when the maker's specification sheet disagrees with a retailer title.`,
    })
  } else if (p.category === 'shoes') {
    items.push({
      question: `What sizes does the ${p.name} come in?`,
      answer: `US men's ${p.sizes[0]}–${p.sizes[p.sizes.length - 1]}, standard width only. We do not stock wide widths.`,
    })
    items.push({
      question: 'How does it fit?',
      answer: `${p.fit.summary} ${p.fit.advice}`,
    })
    const upper = spec(p, /Upper/)
    items.push({
      question: 'What is the upper made of?',
      answer: upper ? `${upper}. Full materials: ${p.materials}` : p.materials,
    })
  } else if (p.variant === 'apparel') {
    items.push({
      question: `What sizes are offered?`,
      answer: `${p.sizes.map((s) => p.sizeLabels?.[s] ?? s).join(', ')}. ${p.fit.summary}`,
    })
    const fabric = spec(p, /Fabric/)
    items.push({
      question: 'What is the fabric?',
      answer: fabric ? `${fabric}. ${p.materials}` : p.materials,
    })
    items.push({
      question: 'How do I care for it?',
      answer: p.care,
    })
  } else if (p.category === 'handbags') {
    items.push({
      question: `What style is the ${p.name}?`,
      answer: `${spec(p, /^Style$/) ?? p.tagline}. ${p.description.split('.').slice(0, 2).join('.')}.`,
    })
    items.push({
      question: 'What are the measurements?',
      answer: spec(p, /Dimension|Size|Measurement/) ?? 'The brand did not publish measurements for this bag.',
    })
    items.push({
      question: 'What is the closure?',
      answer: spec(p, /Closure/) ?? 'The brand did not publish a closure type.',
    })
  } else if (p.category === 'wallets') {
    items.push({
      question: 'What are the dimensions?',
      answer: spec(p, /Dimensions/) ?? 'See the specification table on this page for any published measurements.',
    })
    items.push({
      question: 'What style is it?',
      answer: spec(p, /^Style$/) ?? p.tagline,
    })
  } else if (p.category === 'womens-jewelry') {
    items.push({
      question: 'What is it made of?',
      answer: [spec(p, /^Material$/), spec(p, /Finish/), p.materials].filter(Boolean).join('. '),
    })
    items.push({
      question: 'How should I care for gold plating?',
      answer: p.care,
    })
    items.push({
      question: 'What does it weigh?',
      answer: spec(p, /Weight/) ?? 'The brand did not publish a weight for this piece.',
    })
  }

  items.push({
    question: 'How much is shipping to the US?',
    answer:
      ship.priceCents === 0
        ? `Standard shipping is free to US addresses and typically arrives in ${ship.minBusinessDays}–${ship.maxBusinessDays} business days after we process the order.`
        : `${ship.label} is ${formatMoney(ship.priceCents)}.`,
  })

  return items.slice(0, 5)
}

export function siblingComparison(product: Product, sibling: Product): string {
  const sameBrand = brandOf(product) === brandOf(sibling)
  const price =
    sibling.priceCents === product.priceCents
      ? `The same price (${formatMoney(product.priceCents)})`
      : sibling.priceCents > product.priceCents
        ? `${formatMoney(sibling.priceCents - product.priceCents)} more`
        : `${formatMoney(product.priceCents - sibling.priceCents)} less`
  const specA = spec(product, /Movement|Fabric|Style|Material|Upper/)
  const specB = spec(sibling, /Movement|Fabric|Style|Material|Upper/)
  const specLine = specA && specB && specA !== specB ? ` This one lists ${specA}; ${sibling.name} lists ${specB}.` : ''
  return `${sibling.name}${sameBrand ? `, also from ${brandOf(product)},` : ''} is ${price}.${specLine} Open that page if you want a side-by-side of the published specs.`
}

export function watchLead(p: Product): string | null {
  if (p.category !== 'watches') return null
  const brand = brandOf(p)
  const model = spec(p, /^Model$/)
  const movement = spec(p, /Movement/)
  const size = spec(p, /Case Size|Case Diameter/)
  const water = spec(p, /Water Resistance/)
  const band = spec(p, /Band Material|^Strap$/)
  const bits = [
    model && `${brand} ${model}`,
    movement && `${movement} movement`,
    size && `${size} case`,
    water && `${water} water resistance`,
    band && band,
  ].filter(Boolean)
  return bits.length ? `${bits.join('. ')}.` : null
}
