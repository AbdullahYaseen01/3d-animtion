/**
 * Pulls 50 men's watches from the Rafiq Sons public catalog and writes
 * src/catalog/mensWatches.ts plus PNG sources for the image pipeline.
 *
 * Prices are converted from PKR to USD and rounded to the nearest dollar.
 */
import fs from 'node:fs'
import https from 'node:https'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
const TARGET = 50
const POOL = 64

const QUERIES = [
  ['men watch', 60],
  ['seiko men', 40],
  ['citizen men', 40],
  ['casio men', 40],
  ['edifice', 30],
  ['g-shock men', 20],
  ['tissot men', 20],
  ['rado men', 15],
  ['fossil men', 20],
  ['movado men', 10],
  ['swiss military men', 15],
  ['mathey tissot', 12],
  ['emporio armani men', 12],
  ['kenneth cole men', 10],
  ['pierre cardin men', 10],
  ['roamer men', 10],
  ['claude bernard men', 8],
]

const BRAND_PLAN = [
  { test: /rado/i, cap: 4, rank: 100, name: 'Rado' },
  { test: /mathey/i, cap: 4, rank: 80, name: 'Mathey Tissot' },
  { test: /tissot/i, exclude: /mathey/i, cap: 5, rank: 96, name: 'Tissot' },
  { test: /seiko/i, cap: 6, rank: 92, name: 'Seiko' },
  { test: /citizen/i, cap: 6, rank: 90, name: 'Citizen' },
  { test: /movado/i, cap: 3, rank: 86, name: 'Movado' },
  { test: /swiss military|hanowa/i, cap: 3, rank: 82, name: 'Swiss Military Hanowa' },
  { test: /claude bernard/i, cap: 2, rank: 80, name: 'Claude Bernard' },
  { test: /roamer/i, cap: 2, rank: 78, name: 'Roamer' },
  { test: /g-?shock/i, cap: 4, rank: 76, name: 'Casio' },
  { test: /edifice|casio/i, exclude: /g-?shock/i, cap: 6, rank: 74, name: 'Casio' },
  { test: /emporio|armani/i, cap: 3, rank: 70, name: 'Emporio Armani' },
  { test: /fossil/i, cap: 4, rank: 66, name: 'Fossil' },
  { test: /kenneth cole/i, cap: 2, rank: 60, name: 'Kenneth Cole' },
  { test: /pierre cardin/i, cap: 2, rank: 55, name: 'Pierre Cardin' },
]

const SPEC_LABELS = [
  'Case Size',
  'Case Diameter',
  'Case Material',
  'Case Shape',
  'Dial Size approx',
  'Dial Size',
  'Dial Shape',
  'Bezel Material',
  'Bezel',
  'Dial Color',
  'Movement',
  'Display Type',
  'Display',
  'Glass',
  'Crystal',
  'Band Material',
  'Band Color',
  'Strap Material',
  'Strap Color',
  'Bracelet',
  'Clasp',
  'Water Resistance',
  'Functions',
  'Function',
  'Calendar',
  'Warranty',
]

function get(url, { maxBytes = 700_000, timeoutMs = 22000 } = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': UA, Accept: '*/*' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume()
        const next = new URL(res.headers.location, url).href
        resolve(get(next, { maxBytes, timeoutMs }))
        return
      }
      if (res.statusCode !== 200) {
        res.resume()
        reject(new Error(`${res.statusCode} ${url}`))
        return
      }
      const chunks = []
      let size = 0
      let settled = false
      const finish = () => {
        if (settled) return
        settled = true
        resolve(Buffer.concat(chunks))
      }
      res.on('data', (chunk) => {
        chunks.push(chunk)
        size += chunk.length
        if (size >= maxBytes) {
          req.destroy()
          finish()
        }
      })
      res.on('end', finish)
      res.on('error', () => {
        if (size > 20_000) finish()
      })
      res.on('aborted', () => {
        if (size > 20_000) finish()
      })
    })
    req.setTimeout(timeoutMs, () => {
      req.destroy()
    })
    req.on('error', () => {
      /* Partial HTML is resolved from the response events above. */
    })
  })
}

async function getText(url, opts) {
  const buf = await get(url, opts)
  return buf.toString('utf8')
}

async function pkrPerUsd() {
  const urls = ['https://open.er-api.com/v6/latest/USD', 'https://api.exchangerate-api.com/v4/latest/USD']
  for (const url of urls) {
    try {
      const data = JSON.parse(await getText(url, { maxBytes: 200_000, timeoutMs: 15000 }))
      const rate = data?.rates?.PKR
      if (typeof rate === 'number' && rate > 50 && rate < 1000) return rate
    } catch {
      /* try the next source */
    }
  }
  return 278
}

function isMens(product) {
  const text = `${product.title} ${product.productType ?? ''} ${product.vendor ?? ''}`.toLowerCase()
  if (/women|woman|ladies|\blady\b|girl|couple|gift card|perfume/.test(text)) return false
  return /\bmen\b|mens|men's/.test(text)
}

function brandText(product) {
  return `${product.title} ${product.vendor ?? ''}`
}

function matchesBrand(product, brand) {
  const text = brandText(product)
  return brand.test.test(text) && !(brand.exclude && brand.exclude.test(text))
}

function brandOf(product) {
  return BRAND_PLAN.find((brand) => matchesBrand(product, brand)) ?? null
}

function select(pool) {
  const mens = []
  const seen = new Set()
  for (const product of pool) {
    if (!product?.handle || !product?.title || seen.has(product.id)) continue
    if (!isMens(product)) continue
    if (/women|woman|ladies|lady|couple|-copy(?:-|$)/i.test(product.handle)) continue
    if (!product.image) continue
    seen.add(product.id)
    mens.push(product)
  }

  const picked = []
  const used = new Set()
  const take = (product) => {
    if (used.has(product.id) || picked.length >= POOL) return
    used.add(product.id)
    picked.push(product)
  }

  for (const brand of BRAND_PLAN) {
    const rows = mens.filter((p) => matchesBrand(p, brand))
      .sort((a, b) => Number(b.availableForSale) - Number(a.availableForSale) || Number(b.price) - Number(a.price))
    const inStock = rows.filter((p) => p.availableForSale)
    const source = inStock.length >= Math.min(2, brand.cap) ? inStock : rows
    source.slice(0, brand.cap).forEach(take)
  }

  const rest = mens
    .filter((p) => p.availableForSale && !/skmei|skemi|mini focus|halei|fantor|curren/i.test(p.title))
    .sort((a, b) => (brandOf(b)?.rank ?? 10) - (brandOf(a)?.rank ?? 10) || Number(b.price) - Number(a.price))
  rest.forEach(take)

  mens
    .filter((p) => p.availableForSale)
    .sort((a, b) => Number(b.price) - Number(a.price))
    .forEach(take)

  return picked.slice(0, POOL)
}

function unescapeRsc(value) {
  return value
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
}

function extractBalanced(html, marker) {
  const at = html.indexOf(marker)
  if (at < 0) return null
  const start = html.indexOf('{', at)
  if (start < 0) return null
  let depth = 0
  for (let i = start; i < html.length; i++) {
    const c = html[i]
    if (c === '\\') {
      i += 1
      continue
    }
    if (c === '{') depth += 1
    else if (c === '}') {
      depth -= 1
      if (depth === 0) return html.slice(start, i + 1)
    }
  }
  return null
}

function parseShopify(html) {
  const raw = extractBalanced(html, 'productByHandle')
  if (!raw) return null
  const text = unescapeRsc(raw)
  try {
    return JSON.parse(text)
  } catch (error) {
    if (process.argv.includes('--sample')) {
      console.log('parse error', error.message)
      const at = Number(error.message.match(/position (\d+)/)?.[1] ?? 0)
      console.log(JSON.stringify(text.slice(at - 80, at + 80)))
    }
    return null
  }
}

function parseJsonLd(html) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  for (const block of blocks) {
    try {
      const data = JSON.parse(block[1])
      if (data['@type'] === 'Product') return data
    } catch {
      /* keep looking */
    }
  }
  return null
}

function specPairs(html) {
  const labels = [...SPEC_LABELS].sort((a, b) => b.length - a.length)
  const labelAlt = labels.join('|')
  const pattern = new RegExp(`(${labelAlt}):\\s*((?:(?!(?:${labelAlt}):)[^"\\\\<]){1,80})`, 'g')
  const found = new Map()
  for (const match of html.matchAll(pattern)) {
    let label = match[1].replace(/\s+/g, ' ').trim()
    if (label === 'Dial Size approx' || label === 'Dial Size') label = 'Case size'
    if (label === 'Dial Shape') label = 'Case shape'
    const value = tidy(match[2].replace(/\\u003c.*$/, ''))
    if (!value || value.length < 1 || found.has(label)) continue
    found.set(label, value)
  }
  return [...found].map(([label, value]) => ({ label, value }))
}

function stripHtml(value) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function movementFrom(tags, specs) {
  const listed = specs.find((s) => s.label === 'Movement' || s.label === 'Display' || s.label === 'Display Type')
  if (listed) return listed.value
  const text = tags.join(' ').toLowerCase()
  if (text.includes('automatic')) return 'Automatic'
  if (text.includes('digital')) return 'Digital'
  if (text.includes('quartz')) return 'Quartz'
  return 'Quartz'
}

function strapFrom(tags, specs) {
  const material = specs.find((s) => /band material|strap material|bracelet/i.test(s.label))
  const color = specs.find((s) => /band color|strap color/i.test(s.label))
  if (material) return [material.value, color?.value].filter(Boolean).join(', ')
  const text = tags.join(' ').toLowerCase()
  if (text.includes('metal') || text.includes('chain')) return 'Metal bracelet'
  if (text.includes('leather')) return 'Leather strap'
  if (text.includes('rubber') || text.includes('resin')) return 'Resin strap'
  return 'Strap listed on the model'
}

function dialFrom(specs, description) {
  const listed = specs.find((s) => /dial color|^dial$/i.test(s.label))
  if (listed) return listed.value
  const match = description.match(/\b(black|blue|white|silver|gold|green|grey|gray|brown|navy|champagne|green)\b[^.]{0,24}dial/i)
  return match ? match[0] : ''
}

const COLOR_TABLE = [
  ['navy', 'Navy', '#1B2A4A', 'blue'],
  ['blue', 'Blue', '#1D4E89', 'blue'],
  ['green', 'Green', '#2F5D50', 'green'],
  ['red', 'Red', '#8F2D2D', 'red'],
  ['burgundy', 'Burgundy', '#6B1F26', 'red'],
  ['champagne', 'Champagne', '#C6A15B', 'gold'],
  ['rose', 'Rose gold', '#B76E79', 'gold'],
  ['gold', 'Gold', '#C6A15B', 'gold'],
  ['brown', 'Brown', '#6B4A32', 'neutral'],
  ['tan', 'Tan', '#C4A574', 'neutral'],
  ['white', 'White', '#F4F1EA', 'white'],
  ['silver', 'Silver', '#C5C7C9', 'grey'],
  ['grey', 'Grey', '#8A8A86', 'grey'],
  ['gray', 'Grey', '#8A8A86', 'grey'],
  ['black', 'Black', '#1C1C1C', 'black'],
]

function lookupColor(text) {
  const hay = text.toLowerCase()
  const hit = COLOR_TABLE.find(([word]) => hay.includes(word))
  if (!hit) return null
  return { name: hit[1], swatch: hit[2], family: hit[3] }
}

function colorMeta(dial, strap) {
  const dialHit = lookupColor(dial) ?? lookupColor(strap) ?? { name: 'Silver', swatch: '#C5C7C9', family: 'grey' }
  const bandHit = lookupColor(strap)
  const swatch = bandHit && bandHit.swatch !== dialHit.swatch ? [dialHit.swatch, bandHit.swatch] : [dialHit.swatch]
  const slug = dialHit.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return { slug, name: dialHit.name, swatch, family: dialHit.family }
}

function toCents(amount, rate) {
  const pkr = Number(String(amount).replace(/,/g, ''))
  if (!Number.isFinite(pkr) || pkr <= 0) return 0
  return Math.max(100, Math.round(pkr / rate) * 100)
}

function fitId(handle) {
  let slug = handle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/-(metal|leather|resin|mesh|riser|risen)-band-(men|mens)-watch$/, '')
    .replace(/-(men|mens)-watch$/, '')
    .replace(/-for-men$/, '')
  if (slug.length > 42) slug = slug.slice(0, 42).replace(/-$/, '')
  return slug
}

function tidy(value) {
  let text = String(value)
  const cut = text.search(/[a-z)](?=[A-Z][a-z]+(?: [A-Za-z]+)?:)/)
  if (cut > 0) text = text.slice(0, cut + 1)
  return text
    .replace(/^approximately:\s*/i, '')
    .replace(/\b1 Years\b/g, '1 year')
    .replace(/\b(\d+) Years\b/g, '$1 years')
    .replace(/(\d)\s*mm/gi, '$1 mm')
    .replace(/\b(\d+)\s*meters?\b/gi, (_, n) => `${n} meters`)
    .replace(/\s+/g, ' ')
    .trim()
}

function sentence(parts) {
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
}

function buildProduct(summary, detail, rate) {
  const shopify = detail.shopify
  const ld = detail.ld
  const specs = detail.specs
  const tags = shopify?.tags ?? (typeof ld?.keywords === 'string' ? ld.keywords.split(',').map((t) => t.trim()) : [])
  const title = (shopify?.title || ld?.name || summary.title).replace(/\bEdifce\b/g, 'Edifice')
  const brand = brandOf({ title, vendor: shopify?.vendor || ld?.brand?.name || summary.vendor })?.name || shopify?.vendor || 'Watch'
  const descriptionText = stripHtml(shopify?.description || ld?.description || '')
  const movement = movementFrom(tags, specs)
  const strap = strapFrom(tags, specs)
  const dial = dialFrom(specs, descriptionText)
  const water = specs.find((s) => s.label === 'Water Resistance')
  const caseSize = specs.find((s) => /case size|case diameter/i.test(s.label))
  const caseMaterial = specs.find((s) => s.label === 'Case Material')
  const crystal = specs.find((s) => s.label === 'Glass' || s.label === 'Crystal')
  const warranty = specs.find((s) => s.label === 'Warranty')
  const color = colorMeta(dial, strap)
  const id = fitId(summary.handle)
  const priceAmount = shopify?.priceRange?.minVariantPrice?.amount || ld?.offers?.price || ld?.offers?.lowPrice || summary.price
  const compareAmount = shopify?.compareAtPriceRange?.minVariantPrice?.amount || summary.comparePrice
  const priceCents = toCents(priceAmount, rate)
  const compareAt = toCents(compareAmount, rate)
  const available = shopify ? shopify.availableForSale !== false : !String(ld?.offers?.availability ?? '').includes('OutOfStock')
  const images = []
  for (const edge of shopify?.images?.edges ?? []) {
    if (edge?.node?.url) images.push(edge.node.url)
  }
  if (!images.length && Array.isArray(ld?.image)) images.push(...ld.image)
  if (!images.length && summary.image) images.push(summary.image)

  const specRows = []
  const push = (label, value) => {
    if (!value || specRows.some((row) => row.label === label)) return
    specRows.push({ label, value: tidy(value) })
  }
  push('Brand', brand)
  push('Model', (ld?.sku || title.replace(new RegExp(`^${brand}\\s+`, 'i'), '')).trim())
  for (const row of specs) push(row.label, row.value)
  if (!specRows.some((row) => row.label === 'Movement')) push('Movement', movement)
  if (!specRows.some((row) => /band material|strap material/i.test(row.label))) push('Strap', strap)

  const highlights = [
    caseSize ? `${caseSize.value} case` : '',
    movement ? `${movement} movement` : '',
    strap,
    water ? `${water.value} water resistance` : '',
  ]
    .filter(Boolean)
    .slice(0, 4)

  const strapPhrase = /leather/i.test(strap)
    ? 'a leather strap'
    : /resin|rubber/i.test(strap)
      ? 'a resin strap'
      : /steel|metal/i.test(strap)
        ? 'a stainless steel bracelet'
        : `a ${strap.toLowerCase()}`
  const crystalText = crystal
    ? /crystal|sapphire|glass|hardlex/i.test(crystal.value)
      ? crystal.value
      : `${crystal.value} crystal`
    : ''
  const description = sentence([
    `${title} is a men's ${movement.toLowerCase()} watch from ${brand}.`,
    caseMaterial || caseSize ? `The case is ${[caseSize?.value, caseMaterial?.value].filter(Boolean).join(' ')}.` : '',
    dial ? `The dial is ${dial.replace(/\bdial\b/i, '').trim().toLowerCase()}.` : '',
    `It comes on ${strapPhrase}.`,
    water ? `Water resistance is ${water.value}.` : 'No water-resistance rating is published for this style.',
    crystalText ? `The crystal is ${crystalText}.` : '',
    warranty ? `Manufacturer warranty listed for this model: ${warranty.value}.` : '',
  ])

  const taglineParts = [movement, strap.split(',')[0]].filter(Boolean)
  const tagline = taglineParts.join(' · ').slice(0, 72)

  return {
    id,
    slug: id,
    name: title.replace(/\s+/g, ' ').trim(),
    brand,
    tagline: tagline || 'Men’s watch',
    description,
    priceCents,
    compareAtPriceCents: compareAt > priceCents ? compareAt : undefined,
    color,
    highlights,
    specs: specRows.slice(0, 12),
    movement,
    strap,
    water: water?.value ?? '',
    caseSize: caseSize?.value ?? '',
    materials: sentence([
      caseMaterial ? `${caseMaterial.value} case.` : '',
      crystal ? `${/crystal|sapphire|glass|hardlex/i.test(crystal.value) ? crystal.value : `${crystal.value} crystal`}.` : '',
      `${strap}.`,
    ]),
    available,
    imageUrls: [...new Set(images)].slice(0, 3),
    sku: `${id}:${color.slug}:0:OS`,
  }
}

function tsString(value) {
  return JSON.stringify(value)
}

function renderModule(products, rate) {
  const body = products
    .map((product) => {
      const compare = product.compareAtPriceCents ? `\n    compareAtPriceCents: ${product.compareAtPriceCents},` : ''
      const specs = product.specs.map((row) => `      { label: ${tsString(row.label)}, value: ${tsString(row.value)} },`).join('\n')
      const highlights = product.highlights.map((item) => `      ${tsString(item)},`).join('\n')
      const traits = [
        ['Brand', product.brand],
        ['Movement', product.movement],
        ['Strap', product.strap.split(',')[0]],
        product.water ? ['Water resistance', product.water] : null,
      ].filter(Boolean)
      return `  {
    id: ${tsString(product.id)},
    slug: ${tsString(product.slug)},
    name: ${tsString(product.name)},
    category: 'watches',
    variant: 'simple',
    tagline: ${tsString(product.tagline)},
    description: ${tsString(product.description)},
    priceCents: ${product.priceCents},${compare}
    colors: [
      {
        slug: ${tsString(product.color.slug)},
        name: ${tsString(product.color.name)},
        swatch: ${tsString(product.color.swatch)},
        images: ${tsString(product.imageKeys)},
        family: ${tsString(product.color.family)},
      },
    ],
    sizes: [0],
    widths: [ONE],
    highlights: [
${highlights}
    ],
    specs: [
${specs}
    ],
    traits: [
${traits.map(([group, value]) => `      { group: ${tsString(group)}, value: ${tsString(value)} },`).join('\n')}
    ],
    materials: ${tsString(product.materials || product.strap)},
    care: 'Wipe the case and bracelet with a soft dry cloth. Keep leather straps dry, rinse salt water off the case, and do not operate the crown while the watch is wet.',
    fit: {
      summary: ${tsString(product.caseSize ? `${product.caseSize} case on a ${product.strap.split(',')[0].toLowerCase()}.` : `Fitted on a ${product.strap.split(',')[0].toLowerCase()}.`)},
      advice: 'This is a one-size watch. Check the case size and strap type above before ordering. Water resistance is only the rating listed in the specifications.',
    },
    bestFor: [${tsString(product.movement === 'Digital' ? 'Everyday' : 'Dress and everyday')}],
    defaultStock: ${product.available ? 8 : 0},
    stock: {},
    relatedGuides: ['watch-case-size-and-strap-fit'],
  }`
    })
    .join(',\n')

  return `import type { Product, WidthOption } from './types.js'

const ONE: WidthOption = { code: 'OS', label: 'One size' }

/**
 * Fifty men's watches from the public Rafiq Sons catalog.
 * Prices were converted from PKR at ${rate.toFixed(2)} PKR per USD on 2026-09-27 and rounded to the nearest dollar.
 */
export const mensWatches: Product[] = [
${body},
]
`
}

async function mapPool(items, limit, worker) {
  const out = new Array(items.length)
  let next = 0
  async function run() {
    while (next < items.length) {
      const index = next
      next += 1
      out[index] = await worker(items[index], index)
    }
  }
  await Promise.all(Array.from({ length: limit }, run))
  return out
}

async function main() {
  if (process.argv.includes('--sample')) {
    const html = fs.readFileSync(path.join(os.tmpdir(), 'watch-product.html'), 'utf8')
    const shopify = parseShopify(html)
    console.log('shopify', shopify?.title, shopify?.availableForSale, shopify?.priceRange?.minVariantPrice)
    console.log('images', shopify?.images?.edges?.length)
    console.log('specs', specPairs(html))
    return
  }

  const rate = await pkrPerUsd()
  console.log(`PKR per USD: ${rate}`)

  const pool = []
  for (const [q, limit] of QUERIES) {
    const url = `https://rafiqsonsonline.com/api/search/products?q=${encodeURIComponent(q)}&limit=${limit}`
    const data = JSON.parse(await getText(url, { maxBytes: 2_000_000, timeoutMs: 20000 }))
    pool.push(...(data.products ?? []))
    console.log(`search "${q}" -> ${data.products?.length ?? 0}`)
  }

  const chosen = select(pool)
  console.log(`selected ${chosen.length}`)
  if (chosen.length < TARGET) throw new Error(`Only found ${chosen.length} men's watches`)

  const details = await mapPool(chosen, 4, async (product, index) => {
    const url = `https://rafiqsonsonline.com/product/${product.handle}`
    try {
      const html = await getText(url)
      const shopify = parseShopify(html)
      const ld = parseJsonLd(html)
      const specs = specPairs(html)
      console.log(`${index + 1}/${chosen.length} ${product.handle} specs:${specs.length} shopify:${shopify ? 'yes' : 'no'}`)
      return { shopify, ld, specs }
    } catch (error) {
      console.log(`${index + 1}/${chosen.length} FAILED ${product.handle} ${error.message}`)
      return { shopify: null, ld: null, specs: [] }
    }
  })

  const built = []
  for (let i = 0; i < chosen.length; i++) {
    const product = buildProduct(chosen[i], details[i], rate)
    if (!product.priceCents || !product.imageUrls.length) {
      console.log('skip incomplete', product.name)
      continue
    }
    if (/women|ladies|\blady\b/i.test(product.name)) {
      console.log('skip women', product.name)
      continue
    }
    if (product.sku.length > 80) {
      console.log('skip long sku', product.sku.length, product.id)
      continue
    }
    built.push(product)
  }

  const seenIds = new Set()
  for (const product of built) {
    product.imageUrls = product.imageUrls.filter((url) => url.startsWith('https://cdn.shopify.com/'))
    let id = product.id
    while (seenIds.has(id)) id = `${id.slice(0, 40)}-b`
    product.id = id
    product.slug = id
    product.sku = `${id}:${product.color.slug}:0:OS`
    seenIds.add(id)
  }

  const candidates = built.filter((product) => product.imageUrls.length).slice(0, TARGET + 4)
  if (candidates.length < TARGET) throw new Error(`Built ${candidates.length}, need ${TARGET}`)

  const srcDir = path.join(root, 'assets-src', 'generated')
  fs.mkdirSync(srcDir, { recursive: true })
  await mapPool(candidates, 4, async (product) => {
    const keys = []
    for (let i = 0; i < product.imageUrls.length; i++) {
      const key = `${product.id}${product.imageUrls.length > 1 ? `-${i + 1}` : ''}`
      const file = path.join(srcDir, `${key}.png`)
      if (fs.existsSync(file)) {
        keys.push(key)
        continue
      }
      let bytes
      try {
        bytes = await get(product.imageUrls[i], { maxBytes: 8_000_000, timeoutMs: 25000 })
      } catch (error) {
        console.log(`image failed ${product.id} ${error.message}`)
        continue
      }
      const fitted = await sharp(bytes)
        .rotate()
        .resize(1200, 1200, { fit: 'contain', background: { r: 244, g: 241, b: 234, alpha: 1 } })
        .png({ compressionLevel: 9 })
        .toBuffer()
      fs.writeFileSync(file, fitted)
      keys.push(key)
      console.log(`image ${key} ${Math.round(fitted.length / 1024)} KB`)
    }
    product.imageKeys = keys
  })

  const finalProducts = candidates.filter((product) => product.imageKeys?.length).slice(0, TARGET)
  if (finalProducts.length < TARGET) throw new Error(`Pictured ${finalProducts.length}, need ${TARGET}`)
  const out = path.join(root, 'src', 'catalog', 'mensWatches.ts')
  fs.writeFileSync(out, renderModule(finalProducts, rate))
  console.log(`wrote ${finalProducts.length} watches`)
  console.log(finalProducts.map((p) => `${p.brand}\t$${(p.priceCents / 100).toFixed(0)}\t${p.available ? 'in' : 'out'}\t${p.name}`).join('\n'))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
