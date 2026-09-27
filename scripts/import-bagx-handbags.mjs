/**
 * Pulls handbags listed between 1,000 and 25,000 PKR on Bag X new arrivals.
 * The store price is five times that listing, converted to USD.
 */
import fs from 'node:fs'
import https from 'node:https'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
const COLLECTION = 'https://www.bagx.pk/collections/new-arrivals/products.json?limit=250'
const MIN_PKR = 1000
const MAX_PKR = 25000
const TARGET = 50
const IMAGES = 3

const SWATCH = {
  black: '#161616',
  white: '#f4f1ea',
  grey: '#8d8a84',
  gray: '#8d8a84',
  silver: '#c5c7c9',
  navy: '#1d4e89',
  blue: '#1d4e89',
  denim: '#3d5270',
  green: '#3e5c45',
  red: '#8d3a32',
  maroon: '#6e2e33',
  pink: '#c9899a',
  plum: '#6e3a55',
  lilac: '#b7a4c2',
  purple: '#5c4a6e',
  brown: '#6b4a32',
  choco: '#5c4030',
  chocolate: '#5c4030',
  coffee: '#6b4a32',
  tan: '#c4a574',
  sand: '#d7c4a3',
  khaki: '#b7a27a',
  beige: '#d8cbb8',
  cream: '#f3ead7',
  gold: '#c6a15b',
  orange: '#c45a2c',
  yellow: '#d6b15a',
}

const COLOR_WORDS = Object.keys(SWATCH).concat(['off', 'dusty', 'ofwht', 'blk', 'wht'])

const DETAIL_LABELS = [
  'Small pocket inside',
  'Inside pocket',
  'Compartments',
  'Measurements',
  'Material',
  'Closure',
  'Strap',
  'Lining',
  'Style',
  'Width',
  'Length',
  'Height',
  'Depth',
  'Weight',
  'Color',
  'Size',
]

function get(url, { maxBytes = 2_000_000, timeoutMs = 25000 } = {}) {
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
  try {
    const data = JSON.parse((await get('https://open.er-api.com/v6/latest/USD', { maxBytes: 20_000 })).toString())
    const rate = Number(data?.rates?.PKR)
    if (rate > 50 && rate < 1000) return rate
  } catch {
    /* use the same-day fallback used by the other catalog imports */
  }
  return 277.004436
}

function toCents(pkr, rate) {
  return Math.max(100, Math.round((pkr * 5) / rate) * 100)
}

function strip(html) {
  return String(html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|li|div|h\d)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

function listedPrice(product) {
  const variant = product.variants.find((item) => item.available) || product.variants[0]
  return { price: Number(variant?.price), compare: Number(variant?.compare_at_price) || 0, available: Boolean(variant?.available), sku: variant?.sku || '' }
}

function excluded(product) {
  const text = `${product.title} ${(product.tags || []).join(' ')} ${product.product_type || ''}`.toLowerCase()
  return /wallet|makeup pouch|bagpack|backpack|laptop|luggage|duffel|keychain|cushion|heel|slipper|\bshoe|\bclutch\b/.test(text)
}

function styleKey(title) {
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((word) => word && !COLOR_WORDS.includes(word) && !/^\d+$/.test(word))
  return words.join(' ') || title.toLowerCase()
}

function colorName(title) {
  const words = title.replace(/[^a-zA-Z ]+/g, ' ').split(/\s+/).filter(Boolean)
  const colors = []
  for (let i = 0; i < words.length; i++) {
    const lower = words[i].toLowerCase()
    const next = words[i + 1]?.toLowerCase()
    if (lower === 'dusty' && next === 'pink') {
      colors.push('Dusty Pink')
      i += 1
      continue
    }
    if (lower === 'off' && next === 'white') {
      colors.push('Off White')
      i += 1
      continue
    }
    if (SWATCH[lower]) colors.push(lower === 'choco' ? 'Choco' : lower.charAt(0).toUpperCase() + lower.slice(1))
  }
  if (!colors.length) return 'Multi'
  return [...new Set(colors)].slice(-2).join(' / ')
}

function colorPhrase(name) {
  const spoken = name.replace(/\bChoco\b/g, 'chocolate')
  const parts = spoken.split(/\s*\/\s*/).map((part) => part.toLowerCase())
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`
  return parts[0]
}

function cleanValue(value) {
  return String(value || '')
    .replace(/[“”]/g, '"')
    .replace(/"+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .replace(/^[,.\s]+|[,.\s]+$/g, '')
    .trim()
}

function inchNumber(value) {
  const match = String(value).match(/(\d+(?:\.\d+)?)/)
  return match ? `${match[1]} in` : cleanValue(value)
}

function formatSizeLine(fields) {
  const take = (label) => fields.find((field) => field.label === label)
  const parts = []
  const width = take('Width')
  const length = take('Length')
  const height = take('Height')
  const depth = take('Depth')
  if (width) parts.push(`${inchNumber(width.value)} wide`)
  if (length) parts.push(`${inchNumber(length.value)} long`)
  if (height) parts.push(`${inchNumber(height.value)} high`)
  if (depth) parts.push(`${inchNumber(depth.value)} deep`)
  if (parts.length) {
  if (parts.length === 1) return parts[0]
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`
  return `${parts.slice(0, -1).join(', ')}, and ${parts.at(-1)}`
  }
  const measurements = take('Measurements')
  return measurements ? cleanValue(measurements.value) : ''
}

function colorSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 18) || 'color'
}

function familyOf(name) {
  const text = name.toLowerCase()
  if (/black|blk/.test(text)) return 'black'
  if (/white|wht|cream/.test(text)) return 'white'
  if (/grey|gray|silver|lilac/.test(text)) return 'grey'
  if (/navy|blue|denim/.test(text)) return 'blue'
  if (/green|olive/.test(text)) return 'green'
  if (/red|maroon|burgundy|pink|plum/.test(text)) return 'red'
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

function detailFields(text) {
  const marker = text.search(/\bDETAILS\b/i)
  const source = marker >= 0 ? text.slice(marker) : text
  const hits = []
  for (const label of DETAIL_LABELS) {
    const match = source.match(new RegExp(`\\b${label}\\b\\s*:`, 'i'))
    if (match && match.index != null) hits.push({ label, index: match.index, valueAt: match.index + match[0].length })
  }
  hits.sort((a, b) => a.index - b.index)
  const fields = []
  for (let i = 0; i < hits.length; i++) {
    const end = i + 1 < hits.length ? hits[i + 1].index : source.length
    const value = source
      .slice(hits[i].valueAt, end)
      .replace(/\s+/g, ' ')
      .replace(/^[:\s-]+|[:\s-]+$/g, '')
      .trim()
    if (value && value.length < 120 && !/^details$/i.test(value)) fields.push({ label: hits[i].label, value })
  }
  return fields
}

function mapStyle(value) {
  const text = value.toLowerCase()
  if (/three-piece|3-piece|3 piece|handbag set/.test(text)) return 'Three-piece set'
  if (/cross[\s-]?body/.test(text)) return 'Crossbody bag'
  if (/\bhobo\b/.test(text)) return 'Hobo bag'
  if (/\btote\b/.test(text)) return 'Tote'
  if (/shoulder/.test(text)) return 'Shoulder bag'
  if (/bucket/.test(text)) return 'Bucket bag'
  if (/satchel/.test(text)) return 'Satchel'
  if (/\bmini\b/.test(text)) return 'Mini bag'
  if (/canvas/.test(text)) return 'Canvas bag'
  if (/hand\s?bag/.test(text)) return 'Handbag'
  return ''
}

function inferStyle(product, text, fields) {
  if (/three-piece|3-piece|3 piece|handbag set|the set includes/i.test(text)) return 'Three-piece set'
  const stated = mapStyle(fields.find((field) => field.label === 'Style')?.value || '')
  if (stated) return stated
  const blob = `${product.title} ${(product.tags || []).join(' ')}`
  return mapStyle(blob) || mapStyle(text) || 'Handbag'
}

function materialOf(text, fields) {
  const stated = fields.find((field) => field.label === 'Material')?.value
  if (stated) return cleanValue(stated)
  if (/faux leather/i.test(text)) return 'Faux leather'
  if (/suede/i.test(text)) return 'Suede'
  if (/canvas/i.test(text)) return 'Canvas'
  if (/\bleather\b/i.test(text)) return 'Leather'
  return ''
}

function closureOf(text, fields) {
  const stated = fields.find((field) => field.label === 'Closure')?.value
  if (stated) return cleanValue(stated)
  if (/twist-?lock/i.test(text)) return 'Flap with twist-lock'
  if (/\bflap\b/i.test(text)) return 'Flap'
  if (/drawstring/i.test(text)) return 'Drawstring'
  if (/zipper|\bzip\b/i.test(text)) return 'Zipper'
  return ''
}

function strapOf(text, fields) {
  const stated = fields.find((field) => field.label === 'Strap')?.value
  if (stated) return cleanValue(stated)
  const bits = []
  if (/adjustable strap/i.test(text)) bits.push('Adjustable strap')
  if (/top handles?/i.test(text)) bits.push('Top handle')
  if (/shoulder straps?/i.test(text)) bits.push('Shoulder strap')
  if (/cream strap/i.test(text)) bits.push('Cream strap')
  if (/chain strap/i.test(text)) bits.push('Chain strap')
  return bits.join(', ')
}

function hardwareOf(text) {
  if (/gold-tone/i.test(text)) return 'Gold-tone hardware'
  if (/silver-tone/i.test(text)) return 'Silver-tone hardware'
  return ''
}

function setPieces(text) {
  if (!/three-piece|3-piece|3 piece|set includes|handbag set/i.test(text)) return ''
  const parts = []
  if (/\btote\b/i.test(text)) parts.push('tote')
  if (/crossbody/i.test(text)) parts.push('crossbody')
  if (/\bpouch\b/i.test(text)) parts.push('pouch')
  if (parts.length < 2) return ''
  return `${parts.slice(0, -1).join(', ')}, and ${parts.at(-1)}`
}

function tidyName(title) {
  const raw = title.replace(/\s+/g, ' ').trim()
  const name = raw === raw.toUpperCase() ? raw.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) : raw
  if (name.length <= 36) return name
  return name.slice(0, 36).replace(/\s+\S*$/, '').trim()
}

function fitId(title) {
  return `bagx-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 52)
    .replace(/-$/g, '')
}

function build(product, index, rate) {
  const { price, compare, available, sku } = listedPrice(product)
  const text = strip(product.body_html)
  const fields = detailFields(text)
  const style = inferStyle(product, text, fields)
  const color = colorName(product.title)
  const slug = colorSlug(color)
  const material = materialOf(text, fields)
  const closure = closureOf(text, fields)
  const strap = strapOf(text, fields)
  const hardware = hardwareOf(text)
  const pieces = setPieces(text)
  const sizeLine = formatSizeLine(fields)
  const compartments = cleanValue(fields.find((field) => field.label === 'Compartments')?.value || '')
  const pocket = cleanValue(fields.find((field) => /pocket/i.test(field.label))?.value || '')
  const name = tidyName(product.title)
  const id = fitId(product.title)
  const pattern = !material && /quilted/i.test(text) ? 'Quilted' : ''
  const facts = [
    pieces ? `The set includes a ${pieces}.` : '',
    material ? `Material: ${material}.` : '',
    pattern ? `Pattern: ${pattern}.` : '',
    sizeLine ? `Dimensions: ${sizeLine}.` : '',
    compartments ? `Compartments: ${compartments}.` : '',
    pocket && !compartments.toLowerCase().includes('pocket') ? (pocket === '1' ? 'It has 1 inside pocket.' : `Inside pocket: ${pocket}.`) : '',
    closure ? `Closure: ${closure}.` : '',
    strap ? `Carry: ${strap}.` : '',
    hardware ? `${hardware}.` : '',
  ].filter(Boolean)
  const description = [`${name} is a ${colorPhrase(color)} ${style.toLowerCase()} from Bag X.`, ...facts].join(' ')
  const specs = [
    { label: 'Brand', value: 'Bag X' },
    { label: 'SKU', value: sku || product.handle },
    { label: 'Style', value: style },
    { label: 'Color', value: color },
  ]
  if (material) specs.push({ label: 'Material', value: material })
  if (pattern) specs.push({ label: 'Pattern', value: pattern })
  if (sizeLine) specs.push({ label: 'Dimensions', value: sizeLine })
  if (compartments) specs.push({ label: 'Compartments', value: compartments })
  if (pocket && !compartments.toLowerCase().includes('pocket')) specs.push({ label: 'Inside pocket', value: pocket })
  if (closure) specs.push({ label: 'Closure', value: closure })
  if (strap) specs.push({ label: 'Strap', value: strap })
  if (hardware) specs.push({ label: 'Hardware', value: hardware })
  if (pieces) specs.push({ label: 'Set includes', value: pieces })
  const imageUrls = (product.images || [])
    .map((image) => image.src)
    .filter((src) => String(src).startsWith('https://cdn.shopify.com/'))
    .slice(0, IMAGES)
  const tagline = style.length <= 22 ? style : 'Handbag'
  return {
    id,
    slug: id,
    name,
    tagline,
    description,
    priceCents: toCents(price, rate),
    compareAtPriceCents: compare > price ? toCents(compare, rate) : undefined,
    color,
    colorSlug: slug,
    swatch: swatchOf(color),
    family: familyOf(color),
    available,
    specs,
    style,
    material: material || pattern,
    highlights: [style, material || pattern, sizeLine || strap || closure].filter(Boolean).slice(0, 3),
    imageUrls,
    sourcePkr: price,
    index,
    styleKey: styleKey(product.title),
    hasDetails: Boolean(material || sizeLine || compartments || closure),
  }
}

function score(item) {
  let value = 0
  if (item.available) value += 200
  value += Math.min(item.imageUrls.length, IMAGES) * 12
  if (item.hasDetails) value += 40
  if (/crossbody|shoulder|tote|hobo|handbag/.test(item.style.toLowerCase())) value += 20
  value += Math.max(0, 80 - item.index)
  return value
}

function pick(products, rate) {
  const eligible = []
  for (const [index, product] of products.entries()) {
    if (!product?.handle || !product?.title) continue
    if (excluded(product)) continue
    const { price } = listedPrice(product)
    if (!(price >= MIN_PKR && price <= MAX_PKR)) continue
    const item = build(product, index, rate)
    if (!item.imageUrls.length) continue
    if (`${item.id}:${item.colorSlug}:0:OS`.length > 80) continue
    eligible.push(item)
  }
  eligible.sort((a, b) => score(b) - score(a) || a.index - b.index)
  const chosen = []
  const counts = new Map()
  const take = (cap) => {
    for (const item of eligible) {
      if (chosen.length >= TARGET) break
      if (chosen.includes(item)) continue
      const used = counts.get(item.styleKey) || 0
      if (used >= cap) continue
      chosen.push(item)
      counts.set(item.styleKey, used + 1)
    }
  }
  take(2)
  take(4)
  return { chosen: chosen.slice(0, TARGET), eligible: eligible.length }
}

function tsString(value) {
  return JSON.stringify(value)
}

function render(products, rate) {
  const body = products
    .map((product) => {
      const stock = product.available ? '' : `\n      ${tsString(`${product.id}:${product.colorSlug}:0:OS`)}: 0,`
      const compare = product.compareAtPriceCents ? `\n    compareAtPriceCents: ${product.compareAtPriceCents},` : ''
      const guide = /crossbody|shoulder|mini|hobo|handbag|tote/.test(product.style.toLowerCase()) ? "['what-fits-in-a-crossbody-bag']" : '[]'
      return `  {
    id: ${tsString(product.id)},
    slug: ${tsString(product.slug)},
    name: ${tsString(product.name)},
    category: 'handbags',
    variant: 'simple',
    tagline: ${tsString(product.tagline)},
    description: ${tsString(product.description)},
    priceCents: ${product.priceCents},${compare}
    isNew: true,
    colors: [
      {
        slug: ${tsString(product.colorSlug)},
        name: ${tsString(product.color)},
        swatch: ${tsString(product.swatch)},
        images: ${tsString(product.imageKeys)},
        family: ${tsString(product.family)},
      },
    ],
    sizes: [0],
    widths: [ONE],
    highlights: ${tsString(product.highlights)},
    specs: [
${product.specs.map((spec) => `      { label: ${tsString(spec.label)}, value: ${tsString(spec.value)} },`).join('\n')}
    ],
    traits: [
      { group: 'Brand', value: 'Bag X' },
      { group: 'Style', value: ${tsString(product.style)} },
    ],
    materials: ${tsString(product.material || 'Material is listed in the specifications when Bag X published it.')},
    care: 'Wipe with a soft dry cloth. Keep suede and canvas dry, and do not machine wash.',
    fit: {
      summary: 'One size.',
      advice: ${tsString(product.highlights.some((item) => /adjustable strap/i.test(item)) ? 'The strap is adjustable. No shoe size applies.' : 'This bag is one size. No shoe size applies.')},
    },
    bestFor: ${tsString(product.style === 'Crossbody' ? ['Everyday', 'Crossbody'] : ['Everyday'])},
    defaultStock: 8,
    stock: {${stock}
    },
    relatedGuides: ${guide},
  }`
    })
    .join(',\n')

  return `import type { Product, WidthOption } from './types.js'

const ONE: WidthOption = { code: 'OS', label: 'One size' }

/**
 * Handbags listed between ${MIN_PKR.toLocaleString('en-US')} and ${MAX_PKR.toLocaleString('en-US')} PKR on Bag X new arrivals.
 * Each price is five times that listing, converted at ${rate.toFixed(2)} PKR per USD on 2026-09-27 and rounded to the nearest dollar.
 */
export const bagxHandbags: Product[] = [
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
  const products = JSON.parse((await get(COLLECTION)).toString()).products ?? []
  const { chosen, eligible } = pick(products, rate)
  console.log(`PKR per USD: ${rate}`)
  console.log(`eligible ${eligible} selected ${chosen.length}`)
  if (chosen.length < TARGET) throw new Error(`Only ${chosen.length} handbags in the price band`)
  if (process.argv.includes('--count')) {
    for (const item of chosen) {
      console.log(`${item.available ? 'in' : 'out'}\t${item.sourcePkr}\t$${item.priceCents / 100}\t${item.style}\t${item.id}\t${item.name}`)
      console.log(`  ${item.description}`)
    }
    return
  }

  const seen = new Set()
  for (const product of chosen) {
    let id = product.id
    while (seen.has(id)) id = `${id.slice(0, 46)}-b`
    product.id = id
    product.slug = id
    seen.add(id)
  }

  const srcDir = path.join(root, 'assets-src', 'generated')
  fs.mkdirSync(srcDir, { recursive: true })
  await mapPool(chosen, 4, async (product) => {
    const keys = []
    for (let i = 0; i < product.imageUrls.length; i++) {
      const key = `${product.id}-${i + 1}`
      const file = path.join(srcDir, `${key}.png`)
      if (!fs.existsSync(file)) {
        const bytes = await get(product.imageUrls[i], { maxBytes: 8_000_000, timeoutMs: 30000 })
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
  fs.mkdirSync(outDir, { recursive: true })
  await mapPool(
    chosen.flatMap((product) => product.imageKeys),
    3,
    async (key) => {
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
    },
  )
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  fs.writeFileSync(path.join(root, 'src', 'catalog', 'bagxHandbags.ts'), render(chosen, rate))
  console.log(`wrote ${chosen.length} handbags`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
