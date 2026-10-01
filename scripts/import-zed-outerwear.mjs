/**
 * Pulls jackets, hoodies, and coats from ZED and prices each at five times the listed PKR amount, in USD.
 * A product is filed only by its name: hoodie, coat/parka, or jacket/shacket/blazer/bomber.
 */
import fs from 'node:fs'
import https from 'node:https'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
const PER_CATEGORY = 50

const SWATCH = {
  black: '#161616',
  white: '#f4f1ea',
  grey: '#8d8a84',
  gray: '#8d8a84',
  charcoal: '#4a4a48',
  navy: '#1d4e89',
  blue: '#1d4e89',
  green: '#3e5c45',
  olive: '#5c6140',
  khaki: '#b7a27a',
  red: '#8d3a32',
  maroon: '#6e2e33',
  burgundy: '#6e2e33',
  brown: '#6b4a32',
  beige: '#d8cbb8',
  cream: '#f3ead7',
  stone: '#c4b8a8',
  tan: '#c4a574',
  gold: '#c6a15b',
  royal: '#1d4e89',
}

function get(url, { maxBytes = 4_000_000, timeoutMs = 30000 } = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': UA, Accept: '*/*' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume()
        resolve(get(new URL(res.headers.location, url).href, { maxBytes, timeoutMs }))
        return
      }
      if (res.statusCode !== 200) {
        res.resume()
        reject(new Error(`${res.statusCode} ${url}`))
        return
      }
      const chunks = []
      let size = 0
      res.on('data', (chunk) => {
        size += chunk.length
        if (size > maxBytes) {
          req.destroy()
          reject(new Error(`too large ${url}`))
          return
        }
        chunks.push(chunk)
      })
      res.on('end', () => resolve(Buffer.concat(chunks)))
    })
    req.setTimeout(timeoutMs, () => req.destroy(new Error(`timeout ${url}`)))
    req.on('error', reject)
  })
}

async function pkrPerUsd() {
  const existing = path.join(root, 'src', 'catalog', 'zedOuterwear.ts')
  if (!process.argv.includes('--fresh-rate') && fs.existsSync(existing)) {
    const pinned = Number(fs.readFileSync(existing, 'utf8').match(/converted at ([\d.]+) PKR per USD/)?.[1])
    if (pinned > 50 && pinned < 1000) return pinned
  }
  try {
    const data = JSON.parse((await get('https://open.er-api.com/v6/latest/USD', { maxBytes: 20_000 })).toString())
    const rate = Number(data?.rates?.PKR)
    if (rate > 50 && rate < 1000) return rate
  } catch {
    /* use the same fallback as the sneaker import */
  }
  return 277
}

function toCents(pkr, rate) {
  return Math.max(100, Math.round((Number(pkr) * 5) / rate) * 100)
}

function strip(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function tagList(product) {
  const tags = product.tags
  if (Array.isArray(tags)) return tags.map((tag) => String(tag).toLowerCase())
  return String(tags || '')
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
}

/** Title decides the category. Sweaters and cardigans stay out. */
function categoryOf(product) {
  const title = String(product.title || '').toLowerCase()
  if (/\bhoodies?\b/.test(title)) return 'hoodies'
  if (/\b(cardigans?|sweaters?|jumpers?)\b/.test(title)) return null
  if (/\b(coats?|parkas?|overcoats?)\b/.test(title) || /\bover\s+coats?\b/.test(title)) return 'coats'
  if (/\b(jackets?|shackets?|blazers?|bombers?)\b/.test(title)) return 'jackets'
  return null
}

function sizeOf(label) {
  const text = String(label || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
  const phrases = [
    ['extra extra small', 1, 'XXS'],
    ['extra extra large', 7, 'XXL'],
    ['extra small', 2, 'XS'],
    ['extra large', 6, 'XL'],
    ['xxs', 1, 'XXS'],
    ['xxl', 7, 'XXL'],
    ['2xl', 7, 'XXL'],
    ['xs', 2, 'XS'],
    ['xl', 6, 'XL'],
    ['small', 3, 'S'],
    ['medium', 4, 'M'],
    ['large', 5, 'L'],
  ]
  for (const [needle, num, name] of phrases) {
    if (text === needle || text.includes(needle)) return { num, name }
  }
  if (text === 's') return { num: 3, name: 'S' }
  if (text === 'm') return { num: 4, name: 'M' }
  if (text === 'l') return { num: 5, name: 'L' }
  return null
}

function colorName(product) {
  const option = product.options?.find((item) => /colou?r/i.test(item.name))
  const value = product.variants?.[0]?.option2 || option?.values?.[0] || ''
  const raw = String(value || 'Black')
  return raw
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function colorSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 16) || 'color'
}

function familyOf(name) {
  const text = name.toLowerCase()
  if (/black|blk/.test(text)) return 'black'
  if (/white|cream/.test(text)) return 'white'
  if (/grey|gray|charcoal|silver/.test(text)) return 'grey'
  if (/navy|blue/.test(text)) return 'blue'
  if (/green|olive/.test(text)) return 'green'
  if (/red|maroon|burgundy/.test(text)) return 'red'
  if (/gold/.test(text)) return 'gold'
  return 'neutral'
}

function swatchOf(name) {
  const words = name.toLowerCase().split(/[^a-z]+/).filter(Boolean)
  const colors = words.map((word) => SWATCH[word]).filter(Boolean)
  if (colors.length >= 2) return [colors[0], colors[1]]
  if (colors.length === 1) return [colors[0]]
  return familyOf(name) === 'black' ? ['#161616'] : ['#c4b8a8']
}

function listedPrice(product) {
  const variant = product.variants.find((item) => item.available) || product.variants[0]
  return { price: Number(variant?.price), compare: Number(variant?.compare_at_price) || 0 }
}

function specsFrom(html) {
  const specs = []
  for (const match of String(html || '').matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)) {
    const text = strip(match[1])
    const split = text.indexOf(':')
    if (split < 1 || split > 40) continue
    const label = text.slice(0, split).trim()
    const value = text.slice(split + 1).trim()
    if (label && value && value.length < 80) specs.push({ label, value })
  }
  return specs.slice(0, 4)
}

function noun(category) {
  if (category === 'hoodies') return 'hoodie'
  if (category === 'coats') return 'coat'
  return 'jacket'
}

const FIBERS = /^(cotton|polyester|wool|viscose|nylon|polyamide|elastane|spandex|acrylic|linen|rayon|lycra|modal|cashmere)$/i
const TYPES = [
  [/double breasted wool over ?coat/i, 'double-breasted wool overcoat'],
  [/over ?coat/i, 'overcoat'],
  [/pea ?coat/i, 'pea coat'],
  [/cropped trench/i, 'cropped trench coat'],
  [/trench/i, 'trench coat'],
  [/parka/i, 'hooded parka'],
  [/funnel neck coat/i, 'funnel-neck coat'],
  [/bomber/i, 'bomber jacket'],
  [/denim jacket/i, 'denim jacket'],
  [/trucker/i, 'trucker jacket'],
  [/racer/i, 'racer jacket'],
  [/biker/i, 'biker jacket'],
  [/field jacket/i, 'field jacket'],
  [/safari/i, 'belted safari jacket'],
  [/harrington/i, 'Harrington jacket'],
  [/puffer/i, 'puffer jacket'],
  [/workwear/i, 'workwear jacket'],
  [/shacket/i, 'shirt-jacket (shacket)'],
  [/blazer/i, 'blazer'],
  [/caban/i, 'caban jacket'],
  [/raglan/i, 'raglan-sleeve jacket'],
  [/henley hoodie/i, 'pullover henley hoodie'],
  [/long line hoodie/i, 'long-line hoodie'],
  [/cropped .*hoodie/i, 'cropped hoodie'],
  [/essential hoodie/i, 'pullover hoodie'],
]
const DETAILS = [
  'lightly padded shoulders',
  'storm tab',
  'single vent',
  'ribbed cuffs',
  'spread collar',
  'funnel neck',
  'drawstring hood',
  'kangaroo pocket',
  'welted pockets',
  'inside pockets',
  'belted waist',
  'detachable hood',
  'contrast collar',
  'shoulder epaulettes',
  'buttoned cuffs',
]

/** Facts only, taken from ZED's product copy. Their marketing prose is not reused. */
function factsFrom(html, name, category) {
  const text = strip(html)
  const lower = text.toLowerCase()
  const facts = {}
  const parts = [...text.matchAll(/(\d{1,3})\s?%\s?([A-Za-z]+)/g)].filter((m) => FIBERS.test(m[2]))
  const total = parts.reduce((sum, m) => sum + Number(m[1]), 0)
  if (parts.length && total > 0 && total <= 100) facts.composition = parts.map((m) => `${m[1]}% ${m[2].toLowerCase()}`).join(', ')
  const fabric = text.match(/\b(faux leather|suede|canvas|twill|denim|fleece|corduroy|polyamide|nylon|wool|cotton|woven)\b/i)
  if (fabric) facts.fabric = fabric[1].toLowerCase()
  if (/tailored closer to the chest and waist/i.test(text)) facts.fit = 'Tailored fit, closer to the chest and waist with slimmer arms'
  else {
    const fit = text.match(/\b(regular|slim|relaxed|oversized|boxy|cropped)\s+fit\b/i)
    if (fit) facts.fit = `${fit[1][0].toUpperCase()}${fit[1].slice(1).toLowerCase()} fit`
  }
  if (/double[- ]breasted/i.test(text) || /double breasted/i.test(name)) facts.closure = 'double-breasted button front'
  else if (/popper/i.test(text) || /popper/i.test(name)) facts.closure = 'snap (popper) front'
  else if (/zip(?:per)?[- ]?(?:front|fastening|through|up)|zip front/i.test(text) || /zip/i.test(name)) facts.closure = 'zip front'
  else if (/button(?:ed)?[- ](?:down )?front|front buttons/i.test(text)) facts.closure = 'button front'
  else if (category === 'hoodies' && /pullover|henley|essential/i.test(name)) facts.closure = 'pullover'
  const pockets = text.match(/\b(two|three|four|2|3|4)\s+(side|front|chest|flap|patch|zip)?\s?pockets\b/i)
  if (pockets) facts.pockets = pockets[0].replace(/\s+/g, ' ').toLowerCase()
  facts.details = DETAILS.filter((d) => lower.includes(d) && !(facts.pockets && d.includes('pocket') && facts.pockets.includes(d.split(' ')[0])))
  const care = text.match(/\b(dry clean(?: only)?|machine wash(?: cold| warm| at \d+\s?°?c)?|hand wash(?: cold)?)\b/i)
  if (care) facts.care = care[1].toLowerCase()
  const model = text.match(/model is (\d['’]\s?\d{1,2}["”]?)\s*(?:tall\s*)?and is (?:a )?wearing (?:a |size )?(small|medium|large|extra large|x-?large|xl|s|m|l)\b/i)
  if (model) facts.model = { height: model[1].replace('’', "'").replace(/\s/g, ''), size: model[2].toLowerCase() }
  facts.type = TYPES.find(([re]) => re.test(name))?.[1] ?? noun(category)
  return facts
}

function sizeRange(sizes, labels) {
  const names = sizes.map((size) => labels[size])
  return names.length > 1 ? `${names[0]} to ${names[names.length - 1]}` : names[0]
}

function describe(name, color, category, facts, sizes, labels) {
  const lines = [`The ${name} is a men's ${facts.type} from ZED in ${color.toLowerCase()}.`]
  if (facts.composition) lines.push(`ZED lists the fabric as ${facts.composition}.`)
  else if (facts.fabric && !name.toLowerCase().includes(facts.fabric)) lines.push(`It is cut from ${facts.fabric}.`)
  if (facts.fit) lines.push(`${facts.fit}.`)
  const build = [facts.closure, facts.pockets, ...facts.details].filter(Boolean)
  if (build.length) lines.push(`Details: ${build.slice(0, 4).join(', ')}.`)
  lines.push(`Offered in sizes ${sizeRange(sizes, labels)}.`)
  if (facts.model) lines.push(`The model is ${facts.model.height} and wears a ${facts.model.size}.`)
  if (facts.care) lines.push(`Care: ${facts.care}.`)
  if (category === 'hoodies') lines.push('Wear it on its own or under a jacket.')
  return lines.join(' ')
}

async function loadProducts() {
  const all = []
  for (let page = 1; page <= 12; page++) {
    const body = JSON.parse((await get(`https://zed.com.pk/products.json?limit=250&page=${page}`)).toString())
    const products = body.products ?? []
    all.push(...products)
    if (products.length < 250) break
  }
  return all
}

function pick(products) {
  const groups = { jackets: [], hoodies: [], coats: [] }
  const seen = new Set()
  for (const product of products) {
    if (seen.has(product.id)) continue
    seen.add(product.id)
    const category = categoryOf(product)
    if (!category) continue
    const { price } = listedPrice(product)
    if (!(price > 0)) continue
    const recognized = product.variants.filter((variant) => sizeOf(variant.option1))
    if (!recognized.length) continue
    const images = (product.images || []).map((image) => image.src).filter((src) => String(src).startsWith('https://'))
    if (!images.length) continue
    const tags = tagList(product)
    const available = recognized.filter((variant) => variant.available).length
    groups[category].push({
      product,
      category,
      score: (tags.includes('hoodies-jackets') ? 1000 : 0) + available * 10 + Math.min(images.length, 6),
    })
  }
  const chosen = {}
  for (const category of Object.keys(groups)) {
    groups[category].sort((a, b) => b.score - a.score || a.product.title.localeCompare(b.product.title))
    chosen[category] = groups[category].slice(0, PER_CATEGORY)
  }
  return { groups, chosen }
}

function fitId(handle, slug) {
  let id = `zed-${handle}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 46)
    .replace(/-$/g, '')
  while (`${id}:${slug}:7:R`.length > 80) id = id.slice(0, -1).replace(/-$/g, '')
  return id
}

function tidyName(title) {
  return strip(title).replace(/[’]/g, "'").replace(/\s+/g, ' ').trim()
}

function build(item, rate) {
  const product = item.product
  const category = item.category
  const specs = specsFrom(product.body_html)
  const { price, compare } = listedPrice(product)
  const color = colorName(product)
  const slug = colorSlug(color)
  const id = fitId(product.handle, slug)
  const sizeLabels = {}
  const sizes = []
  for (const variant of product.variants) {
    const size = sizeOf(variant.option1)
    if (!size) continue
    if (!sizes.includes(size.num)) sizes.push(size.num)
    sizeLabels[size.num] = size.name
  }
  sizes.sort((a, b) => a - b)
  const stock = {}
  for (const variant of product.variants) {
    const size = sizeOf(variant.option1)
    if (!size) continue
    if (!variant.available) stock[`${id}:${slug}:${size.num}:R`] = 0
  }
  const name = tidyName(product.title)
  const facts = factsFrom(product.body_html, name, category)
  const listedFabric = specs.find((spec) => /fabric|material|composition/i.test(spec.label))?.value
  const fabric = facts.composition ?? listedFabric ?? (facts.fabric ? facts.fabric[0].toUpperCase() + facts.fabric.slice(1) : undefined)
  const description = describe(name, color, category, facts, sizes, sizeLabels)
  const factSpecs = [
    { label: 'Type', value: facts.type[0].toUpperCase() + facts.type.slice(1) },
    fabric ? { label: 'Fabric', value: fabric } : null,
    facts.fit ? { label: 'Fit', value: facts.fit } : null,
    facts.closure ? { label: 'Closure', value: facts.closure[0].toUpperCase() + facts.closure.slice(1) } : null,
    facts.care ? { label: 'Care', value: facts.care[0].toUpperCase() + facts.care.slice(1) } : null,
    facts.model ? { label: 'Model', value: `${facts.model.height}, wearing ${facts.model.size}` } : null,
  ].filter(Boolean)
  const imageUrls = (product.images || [])
    .map((image) => image.src)
    .filter((src) => String(src).startsWith('https://'))
    .slice(0, 2)
  const compareCents = compare > price ? toCents(compare, rate) : undefined
  const priceCents = toCents(price, rate)
  return {
    id,
    slug: id,
    name,
    category,
    facts,
    tagline: category === 'hoodies' ? 'Hooded sweatshirt' : category === 'coats' ? 'Outer coat' : 'Outer jacket',
    description,
    priceCents,
    compareAtPriceCents: compareCents && compareCents > priceCents ? compareCents : undefined,
    color,
    colorSlug: slug,
    swatch: swatchOf(color),
    family: familyOf(color),
    sizes,
    sizeLabels,
    stock,
    specs: [{ label: 'Brand', value: 'ZED' }, { label: 'Color', value: color }, ...factSpecs, ...specs.filter((s) => !factSpecs.some((f) => f.label === s.label))],
    fabric,
    imageUrls,
    sourcePkr: price,
  }
}

function tsString(value) {
  return JSON.stringify(value)
}

function render(products, rate, counts) {
  const body = products
    .map((product) => {
      const facts = product.facts
      const cap = (s) => s[0].toUpperCase() + s.slice(1)
      const highlights = [cap(facts.type), product.fabric, facts.fit ?? product.color].filter(Boolean).slice(0, 3)
      const care = facts.care
        ? `${cap(facts.care)}, as listed by ZED. Check the garment label before cleaning.`
        : 'Brush off dry dirt and spot-clean with a damp cloth. Hang dry away from direct heat. Do not machine wash unless the care label says you can.'
      const fitSummary = `${facts.fit ? `${facts.fit}. ` : ''}Offered in ${product.sizes.map((size) => product.sizeLabels[size]).join(', ')}.`
      const fitAdvice = `Order the size you usually wear in this kind of layer.${facts.model ? ` The model is ${facts.model.height} and wears a ${facts.model.size}.` : ''} These are not shoe sizes.`
      const stockLines = Object.entries(product.stock)
        .map(([sku, qty]) => `      ${tsString(sku)}: ${qty},`)
        .join('\n')
      const sizeLabelLines = Object.entries(product.sizeLabels)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([size, label]) => `      ${size}: ${tsString(label)},`)
        .join('\n')
      return `  {
    id: ${tsString(product.id)},
    slug: ${tsString(product.slug)},
    name: ${tsString(product.name)},
    category: ${tsString(product.category)},
    variant: 'apparel',
    tagline: ${tsString(product.tagline)},
    description: ${tsString(product.description)},
    priceCents: ${product.priceCents},${product.compareAtPriceCents ? `\n    compareAtPriceCents: ${product.compareAtPriceCents},` : ''}
    colors: [
      {
        slug: ${tsString(product.colorSlug)},
        name: ${tsString(product.color)},
        swatch: ${tsString(product.swatch)},
        images: ${tsString(product.imageKeys)},
        family: ${tsString(product.family)},
      },
    ],
    sizes: ${tsString(product.sizes)},
    sizeLabels: {
${sizeLabelLines}
    },
    widths: [REGULAR],
    highlights: ${tsString(highlights)},
    specs: [
${product.specs.map((spec) => `      { label: ${tsString(spec.label)}, value: ${tsString(spec.value)} },`).join('\n')}
    ],
    traits: [
      { group: 'Brand', value: 'ZED' },
      { group: 'Type', value: ${tsString(product.tagline)} },
    ],
    materials: ${tsString(product.fabric || 'Fabric is listed on the garment label.')},
    care: ${tsString(care)},
    fit: {
      summary: ${tsString(fitSummary)},
      advice: ${tsString(fitAdvice)},
    },
    bestFor: ${tsString(product.category === 'hoodies' ? ['Everyday wear', 'Cool weather'] : ['Cool weather', 'Layering'])},
    defaultStock: 8,
    stock: {
${stockLines}
    },
  }`
    })
    .join(',\n')

  return `import type { Product, WidthOption } from './types.js'

const REGULAR: WidthOption = { code: 'R', label: 'Regular' }

/**
 * Jackets, hoodies, and coats from ZED's public catalog.
 * Each price is five times the listed PKR price, converted at ${rate.toFixed(2)} PKR per USD and rounded to the nearest dollar.
 * ZED listed ${counts.jackets} jackets, ${counts.hoodies} hoodies, and ${counts.coats} coats, so each category below is capped at ${PER_CATEGORY}.
 */
export const zedOuterwear: Product[] = [
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
  const rate = await pkrPerUsd()
  const products = await loadProducts()
  const { groups, chosen } = pick(products)
  console.log(`PKR per USD: ${rate}`)
  for (const category of ['jackets', 'hoodies', 'coats']) {
    console.log(`${category}: available ${groups[category].length}, selected ${chosen[category].length}`)
  }
  const selected = [...chosen.jackets, ...chosen.hoodies, ...chosen.coats]
  if (process.argv.includes('--count')) {
    for (const item of selected) {
      const built = build(item, rate)
      console.log(`${built.category}\t${built.sourcePkr}\t$${built.priceCents / 100}\t${built.name}`)
    }
    return
  }

  const built = []
  const seen = new Set()
  for (const item of selected) {
    const product = build(item, rate)
    if (!product.sizes.length || !product.imageUrls.length) continue
    let id = product.id
    let n = 2
    while (seen.has(id)) {
      id = `${product.id.slice(0, 42)}-${n}`
      n += 1
    }
    product.id = id
    product.slug = id
    const slug = product.colorSlug
    product.stock = Object.fromEntries(
      Object.entries(product.stock).map(([sku, qty]) => {
        const parts = sku.split(':')
        parts[0] = id
        return [parts.join(':'), qty]
      }),
    )
    if (`${id}:${slug}:7:R`.length > 80) {
      console.log('skip long sku', id)
      continue
    }
    seen.add(id)
    built.push(product)
  }

  const srcDir = path.join(root, 'assets-src', 'generated')
  fs.mkdirSync(srcDir, { recursive: true })
  await mapPool(built, 4, async (product) => {
    const keys = []
    for (let i = 0; i < product.imageUrls.length; i++) {
      const key = `${product.id}-${i + 1}`
      const file = path.join(srcDir, `${key}.png`)
      if (!fs.existsSync(file)) {
        const bytes = await get(product.imageUrls[i], { maxBytes: 8_000_000, timeoutMs: 40000 })
        const fitted = await sharp(bytes)
          .rotate()
          .resize(1200, 1200, { fit: 'contain', background: { r: 244, g: 241, b: 234, alpha: 1 } })
          .png({ compressionLevel: 9 })
          .toBuffer()
        fs.writeFileSync(file, fitted)
        console.log(`image ${key} ${Math.round(fitted.length / 1024)} KB`)
      }
      keys.push(key)
    }
    product.imageKeys = keys
  })

  const manifestPath = path.join(root, 'src', 'data', 'imageManifest.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const outDir = path.join(root, 'public', 'images', 'products')
  await mapPool(built.flatMap((product) => product.imageKeys), 3, async (key) => {
    const png = path.join(srcDir, `${key}.png`)
    const meta = await sharp(png).metadata()
    const sample = await sharp(png).extract({ left: 8, top: 8, width: 40, height: 40 }).resize(1, 1).raw().toBuffer()
    const bg = `#${[...sample.subarray(0, 3)].map((value) => value.toString(16).padStart(2, '0')).join('')}`
    const widths = [400, 700, 1024].filter((width) => width <= (meta.width ?? 0))
    for (const width of widths) {
      const base = path.join(outDir, `${key}-${width}`)
      if (!fs.existsSync(`${base}.webp`)) await sharp(png).resize({ width }).webp({ quality: 78 }).toFile(`${base}.webp`)
      if (!fs.existsSync(`${base}.avif`)) await sharp(png).resize({ width }).avif({ quality: 55, effort: 4 }).toFile(`${base}.avif`)
    }
    manifest[key] = { w: meta.width, h: meta.height, widths, bg }
  })
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
  const counts = {
    jackets: groups.jackets.length,
    hoodies: groups.hoodies.length,
    coats: groups.coats.length,
  }
  fs.writeFileSync(path.join(root, 'src', 'catalog', 'zedOuterwear.ts'), render(built, rate, counts))
  const tally = { jackets: 0, hoodies: 0, coats: 0 }
  for (const product of built) tally[product.category] += 1
  console.log(`wrote jackets ${tally.jackets}, hoodies ${tally.hoodies}, coats ${tally.coats}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
