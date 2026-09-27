/**
 * Pulls men's sneakers and jogger-style shoes listed between 1,000 and 25,000 PKR
 * on Ndure's men's sneakers collection. The store price is five times that listing, converted to USD.
 */
import fs from 'node:fs'
import https from 'node:https'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
const COLLECTION = 'https://www.ndure.com/collections/men-sneakers-sports-shoes/products.json?limit=250'
const MIN_PKR = 1000
const MAX_PKR = 25000
const US_SIZES = [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13]

const SWATCH = {
  black: '#161616',
  white: '#f4f1ea',
  grey: '#8d8a84',
  gray: '#8d8a84',
  navy: '#1d4e89',
  blue: '#1d4e89',
  green: '#3e5c45',
  red: '#8d3a32',
  brown: '#6b4a32',
  tan: '#c4a574',
  sand: '#d7c4a3',
  khaki: '#b7a27a',
  beige: '#d8cbb8',
  olive: '#5c6140',
  orange: '#c45a2c',
  yellow: '#d6b15a',
  pink: '#c9899a',
  purple: '#5c4a6e',
  maroon: '#6e2e33',
  gold: '#c6a15b',
}

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
    /* use the same-day fallback */
  }
  return 277.004436
}

function toCents(pkr, rate) {
  return Math.max(100, Math.round((pkr * 5) / rate) * 100)
}

function strip(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function specsFrom(html) {
  const specs = []
  for (const match of String(html || '').matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)) {
    const text = strip(match[1])
    const split = text.indexOf(':')
    if (split < 1 || split > 40) continue
    const label = text.slice(0, split).trim()
    const value = text.slice(split + 1).trim()
    if (label && value) specs.push({ label, value })
  }
  return specs
}

function styleCode(product) {
  const sku = product.variants?.[0]?.sku || ''
  return sku.split(':')[0] || product.handle
}

function usFromLabel(label) {
  const match = String(label).match(/\/(\d+(?:\.\d+)?)/)
  if (!match) return null
  const us = Number(match[1]) + 1
  return US_SIZES.includes(us) ? us : null
}

function colorName(product) {
  const raw = product.options?.find((option) => /colou?r/i.test(option.name))
  const value = product.variants?.[0]?.option2 || raw?.values?.[0] || 'Black'
  return String(value)
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
  if (/white|wht|cream/.test(text)) return 'white'
  if (/grey|gray|silver/.test(text)) return 'grey'
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

function isJogger(product, specs) {
  const text = `${product.title} ${specs.map((spec) => spec.value).join(' ')}`.toLowerCase()
  if (/slip-?on/.test(text)) return false
  return /jog|mesh|knit|sport|run|cushion|athletic|breathable|trainer|active/.test(text)
}

function listedPrice(product) {
  const variant = product.variants.find((item) => item.available) || product.variants[0]
  return { price: Number(variant?.price), compare: Number(variant?.compare_at_price) || 0 }
}

function pick(products) {
  const groups = new Map()
  for (const product of products) {
    const { price } = listedPrice(product)
    if (!(price >= MIN_PKR && price <= MAX_PKR)) continue
    const sizes = product.variants.filter((variant) => variant.available && usFromLabel(variant.option1))
    if (!sizes.length) continue
    if (!product.images?.some((image) => String(image.src).startsWith('https://cdn.shopify.com/'))) continue
    const code = styleCode(product)
    const score = sizes.length * 10 + Math.min(product.images.length, 6)
    const current = groups.get(code)
    if (!current || score > current.score) groups.set(code, { product, score, specs: specsFrom(product.body_html) })
  }
  const styles = [...groups.values()]
  const joggers = styles.filter((item) => isJogger(item.product, item.specs)).sort((a, b) => b.score - a.score)
  const sneakers = styles.filter((item) => !isJogger(item.product, item.specs)).sort((a, b) => b.score - a.score)
  const chosen = []
  const take = (list, count) => {
    for (const item of list) {
      if (chosen.length >= 50 || count <= 0) break
      if (chosen.includes(item)) continue
      chosen.push(item)
      count -= 1
    }
  }
  take(joggers, 25)
  take(sneakers, 25)
  for (const item of [...joggers, ...sneakers]) {
    if (chosen.length >= 50) break
    if (!chosen.includes(item)) chosen.push(item)
  }
  return { chosen: chosen.slice(0, 50), joggerStyles: joggers.length, sneakerStyles: sneakers.length, styles: styles.length }
}

function fitId(style, slug) {
  const code = style
    .toLowerCase()
    .replace(/^m-(pr|sn|sc)-/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  let id = `ndure-${code}-${slug}`.replace(/--+/g, '-').slice(0, 42).replace(/-$/g, '')
  while (`${id}:${slug}:10.5:D`.length > 80) id = id.slice(0, -1).replace(/-$/g, '')
  return id
}

function tidyName(title) {
  const name = title
    .replace(/\s+/g, ' ')
    .replace(/Men’s/g, "Men's")
    .replace(/\bmens\b/i, "Men's")
    .replace(/\s*[–-]\s*Limited Edition/gi, '')
    .replace(/^NDURE X HR\s*[–-]\s*/i, 'Hasan Raheem ')
    .trim()
  if (name.length <= 42) return name
  return name.slice(0, 42).replace(/\s+\S*$/, '').trim()
}

function build(item, rate) {
  const product = item.product
  const specs = item.specs
  const { price, compare } = listedPrice(product)
  const color = colorName(product)
  const slug = colorSlug(color)
  const id = fitId(styleCode(product), slug)
  const sizes = [...new Set(product.variants.map((variant) => usFromLabel(variant.option1)).filter((size) => size != null))].sort((a, b) => a - b)
  const stock = {}
  for (const variant of product.variants) {
    const size = usFromLabel(variant.option1)
    if (size == null) continue
    if (!variant.available) stock[`${id}:${slug}:${Number.isInteger(size) ? size : size.toFixed(1)}:D`] = 0
  }
  const upper = specs.find((spec) => /upper/i.test(spec.label))?.value
  const sole = specs.find((spec) => /sole/i.test(spec.label))?.value
  const silhouette = specs.find((spec) => /silhouette/i.test(spec.label))?.value || (isJogger(product, specs) ? 'Jogger' : 'Sneaker')
  const jogger = isJogger(product, specs)
  const name = tidyName(product.title)
  const silhouettePhrase = silhouette.toLowerCase().replace(/shoes$/, 'shoe').replace(/sneakers$/, 'sneaker')
  const description = [
    `A ${color.toLowerCase()} men's ${silhouettePhrase}.`,
    upper ? `Upper: ${upper.replace(/\.$/, '')}.` : '',
    sole ? `Sole: ${sole.replace(/\.$/, '')}.` : '',
    'Sizes are US men’s, converted from the Ndure EU/UK label.',
  ]
    .filter(Boolean)
    .join(' ')
  const imageUrls = product.images
    .map((image) => image.src)
    .filter((src) => src.startsWith('https://cdn.shopify.com/'))
    .slice(0, 2)
  return {
    id,
    slug: id,
    name,
    shoeUse: jogger ? 'running' : /slip-?on/i.test(`${name} ${silhouette}`) ? 'everyday' : 'lifestyle',
    tagline: jogger ? 'Jogger-style sneaker' : /slip-?on/i.test(name + silhouette) ? 'Slip-on sneaker' : 'Everyday sneaker',
    description,
    priceCents: toCents(price, rate),
    compareAtPriceCents: compare > price ? toCents(compare, rate) : undefined,
    color,
    colorSlug: slug,
    swatch: swatchOf(color),
    family: familyOf(color),
    sizes,
    stock,
    specs: [
      { label: 'Brand', value: 'Ndure' },
      { label: 'Style', value: styleCode(product) },
      ...specs.filter((spec) => spec.label.length < 32 && spec.value.length < 80).slice(0, 6),
    ],
    upper,
    sole,
    silhouette,
    imageUrls,
    sourcePkr: price,
  }
}

function tsString(value) {
  return JSON.stringify(value)
}

function render(products, rate) {
  const body = products
    .map((product) => {
      const highlights = [product.silhouette, product.upper, product.sole].filter(Boolean).slice(0, 3)
      const stockLines = Object.entries(product.stock)
        .map(([sku, qty]) => `      ${tsString(sku)}: ${qty},`)
        .join('\n')
      return `  {
    id: ${tsString(product.id)},
    slug: ${tsString(product.slug)},
    name: ${tsString(product.name)},
    category: 'shoes',
    shoeUse: ${tsString(product.shoeUse)},
    variant: 'footwear',
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
    widths: [STANDARD],
    highlights: ${tsString(highlights)},
    specs: [
${product.specs.map((spec) => `      { label: ${tsString(spec.label)}, value: ${tsString(spec.value)} },`).join('\n')}
    ],
    traits: [
      { group: 'Brand', value: 'Ndure' },
      { group: 'Style', value: ${tsString(product.silhouette)} },
    ],
    materials: ${tsString([product.upper, product.sole].filter(Boolean).join('. ') || 'Materials listed in the specifications.')},
    care: 'Wipe the upper with a damp cloth and mild soap. Air dry away from direct heat. Do not machine wash.',
    fit: {
      summary: ${tsString(/slip-?on/i.test(product.silhouette) ? 'Slip-on, standard width.' : 'Lace-up, standard width.')},
      advice: 'Order the US men’s size converted from the Ndure label: UK 6 is US 7, UK 7 is US 8, and so on. This pair is not offered in a wide width.',
    },
    bestFor: ${tsString(product.shoeUse === 'running' ? ['Everyday training', 'All-day wear'] : ['Everyday wear'])},
    defaultStock: 8,
    stock: {
${stockLines}
    },
    relatedGuides: ['how-to-measure-your-feet'],
  }`
    })
    .join(',\n')

  return `import type { Product, WidthOption } from './types.js'

const STANDARD: WidthOption = { code: 'D', label: 'Standard' }

/**
 * Men's sneakers and jogger-style shoes listed between ${MIN_PKR.toLocaleString('en-US')} and ${MAX_PKR.toLocaleString('en-US')} PKR on Ndure.
 * Each price is five times that listing, converted at ${rate.toFixed(2)} PKR per USD on 2026-09-27 and rounded to the nearest dollar.
 */
export const mensSneakers: Product[] = [
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
  const { chosen, joggerStyles, sneakerStyles, styles } = pick(products)
  console.log(`PKR per USD: ${rate}`)
  console.log(`styles ${styles} joggers ${joggerStyles} sneakers ${sneakerStyles} selected ${chosen.length}`)
  if (process.argv.includes('--count')) {
    for (const item of chosen) {
      const built = build(item, rate)
      console.log(`${built.shoeUse}\t${built.sourcePkr}\t$${built.priceCents / 100}\t${built.id}\t${built.name}`)
    }
    return
  }

  const built = []
  const seen = new Set()
  for (const item of chosen) {
    const product = build(item, rate)
    if (!product.sizes.length || !product.imageUrls.length) continue
    let id = product.id
    while (seen.has(id)) id = `${id.slice(0, 40)}-b`
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
    if (`${id}:${slug}:10.5:D`.length > 80) {
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
        const bytes = await get(product.imageUrls[i], { maxBytes: 8_000_000, timeoutMs: 30000 })
        const fitted = await sharp(bytes).rotate().resize(1200, 1200, { fit: 'contain', background: { r: 244, g: 241, b: 234, alpha: 1 } }).png({ compressionLevel: 9 }).toBuffer()
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
  await mapPool(
    built.flatMap((product) => product.imageKeys),
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
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
  fs.writeFileSync(path.join(root, 'src', 'catalog', 'mensSneakers.ts'), render(built, rate))
  console.log(`wrote ${built.length} sneakers`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
