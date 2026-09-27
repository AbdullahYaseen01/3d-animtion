/**
 * Pulls men's wallets from Metro Shoes whose listed price is between ₹1,000 and ₹25,000.
 * The store price is five times that listed rupee price, converted to USD.
 *
 * Listed price is the regular price on the product. When that regular price is inside
 * the band, it is used even if a lower promotional price is also shown. When only one
 * price is published, that price is used.
 */
import fs from 'node:fs'
import https from 'node:https'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
const LIST_URL = 'https://www.metroshoes.com/accessories/shop-by/mens-wallets.html'
const MIN_INR = 1000
const MAX_INR = 25000
const TARGET = 50

const SWATCHES = {
  black: { name: 'Black', slug: 'black', swatch: ['#1C1C1C'], family: 'black' },
  brown: { name: 'Brown', slug: 'brown', swatch: ['#6B4423'], family: 'neutral' },
  tan: { name: 'Tan', slug: 'tan', swatch: ['#C4A574'], family: 'neutral' },
  olive: { name: 'Olive', slug: 'olive', swatch: ['#6B7040'], family: 'green' },
  green: { name: 'Green', slug: 'green', swatch: ['#3E5C45'], family: 'green' },
  'light green': { name: 'Light green', slug: 'light-green', swatch: ['#8FA57A'], family: 'green' },
  grey: { name: 'Grey', slug: 'grey', swatch: ['#8A8A86'], family: 'grey' },
  gray: { name: 'Grey', slug: 'grey', swatch: ['#8A8A86'], family: 'grey' },
  blue: { name: 'Blue', slug: 'blue', swatch: ['#1D4E89'], family: 'blue' },
  'navy blue': { name: 'Navy', slug: 'navy', swatch: ['#1B2A4A'], family: 'blue' },
  navy: { name: 'Navy', slug: 'navy', swatch: ['#1B2A4A'], family: 'blue' },
  'blue navy': { name: 'Navy', slug: 'navy', swatch: ['#1B2A4A'], family: 'blue' },
  maroon: { name: 'Maroon', slug: 'maroon', swatch: ['#6B1F26'], family: 'red' },
  'rose gold': { name: 'Rose gold', slug: 'rose-gold', swatch: ['#B76E79', '#C6A15B'], family: 'gold' },
  beige: { name: 'Beige', slug: 'beige', swatch: ['#D9C7A7'], family: 'neutral' },
  white: { name: 'White', slug: 'white', swatch: ['#F4F1EA'], family: 'white' },
  'off white': { name: 'Off white', slug: 'off-white', swatch: ['#F3EDE4'], family: 'white' },
  red: { name: 'Red', slug: 'red', swatch: ['#8E2F2F'], family: 'red' },
  orange: { name: 'Orange', slug: 'orange', swatch: ['#C46A2D'], family: 'red' },
  pink: { name: 'Pink', slug: 'pink', swatch: ['#C48B96'], family: 'red' },
  purple: { name: 'Purple', slug: 'purple', swatch: ['#5C4A72'], family: 'neutral' },
  yellow: { name: 'Yellow', slug: 'yellow', swatch: ['#D4B15A'], family: 'gold' },
  gold: { name: 'Gold', slug: 'gold', swatch: ['#C6A15B'], family: 'gold' },
  silver: { name: 'Silver', slug: 'silver', swatch: ['#C5C7C9'], family: 'grey' },
  cream: { name: 'Cream', slug: 'cream', swatch: ['#F3E6D0'], family: 'neutral' },
  khaki: { name: 'Khaki', slug: 'khaki', swatch: ['#B7A57A'], family: 'neutral' },
  wine: { name: 'Wine', slug: 'wine', swatch: ['#6B2D3C'], family: 'red' },
  coffee: { name: 'Coffee', slug: 'coffee', swatch: ['#5C4033'], family: 'neutral' },
  cognac: { name: 'Cognac', slug: 'cognac', swatch: ['#8A5A32'], family: 'neutral' },
}

function get(url, { maxBytes = 2_000_000, timeoutMs = 30000 } = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': UA, Accept: '*/*', 'Accept-Language': 'en-IN,en;q=0.9' } }, (res) => {
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
        if (size > 50_000) finish()
        else reject(new Error(`response error ${url}`))
      })
    })
    req.setTimeout(timeoutMs, () => req.destroy(new Error(`timeout ${url}`)))
    req.on('error', reject)
  })
}

async function getText(url, opts) {
  const buf = await get(url, opts)
  return buf.toString('utf8')
}

async function inrPerUsd() {
  const urls = ['https://open.er-api.com/v6/latest/USD', 'https://api.exchangerate-api.com/v4/latest/USD']
  for (const url of urls) {
    try {
      const data = JSON.parse(await getText(url, { maxBytes: 200_000, timeoutMs: 15000 }))
      const rate = data?.rates?.INR
      if (typeof rate === 'number' && rate > 20 && rate < 200) return rate
    } catch {
      /* try the next source */
    }
  }
  return 83.5
}

function rupees(value) {
  const n = Number(String(value ?? '').replace(/,/g, '').replace(/[^\d.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

/** Regular listed price inside the band, otherwise the only published price inside the band. */
function listedInr(regular, selling) {
  const list = rupees(regular)
  const sell = rupees(selling)
  if (list >= MIN_INR && list <= MAX_INR) return list
  if (sell >= MIN_INR && sell <= MAX_INR) return sell
  return 0
}

function toCents(inr, rate) {
  if (inr <= 0) return 0
  return Math.max(100, Math.round((inr * 5) / rate) * 100)
}

function decode(text) {
  return String(text ?? '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseListing(html) {
  const products = []
  const chunks = html.split('class="product-box"').slice(1)
  for (const chunk of chunks) {
    const href = chunk.match(/href="(\/metro-[^"]+\.html)"/)?.[1]
    const name = decode(chunk.match(/class="brand_name"[^>]*>([^<]+)</)?.[1])
    const brand = decode(chunk.match(/class="product-name productBrandName"[^>]*>([^<]+)</)?.[1]) || 'Metro'
    const selling = chunk.match(/class="price font-bold"[^>]*>\s*Rs\.\s*([\d,]+(?:\.\d+)?)/)?.[1]
    const regular = chunk.match(/class="old-price"[^>]*>\s*Rs\.\s*([\d,]+(?:\.\d+)?)/)?.[1]
    if (!href || !name) continue
    products.push({
      href,
      url: `https://www.metroshoes.com${href}`,
      name,
      brand,
      selling: rupees(selling),
      regular: rupees(regular) || rupees(selling),
    })
  }
  return products
}

function styleOf(href, name, attrs) {
  const text = `${href} ${name} ${attrs.map((row) => `${row.label} ${row.value}`).join(' ')}`.toLowerCase()
  if (/passport/.test(text)) return 'Passport holder'
  if (/card[- ]holder/.test(text)) return 'Card holder'
  if (/money[- ]clip/.test(text)) return 'Money clip'
  if (/trifold|tri-fold/.test(text)) return 'Trifold'
  if (/bifold|bi-fold/.test(text)) return 'Bifold'
  if (/zip/.test(text)) return 'Zip-around wallet'
  return 'Wallet'
}

function modelCode(sku) {
  const match = String(sku ?? '').match(/^(\d+-\d+)/)
  return match?.[1] ?? ''
}

function colorMeta(raw) {
  const key = decode(raw).toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim()
  if (SWATCHES[key]) return { ...SWATCHES[key] }
  const slug = key.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'neutral'
  return { name: decode(raw) || 'Neutral', slug, swatch: ['#8A8A86'], family: 'neutral' }
}

function formatDimensions(raw) {
  const text = decode(raw)
  const match = text.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)(?:\s*\((cm|mm|in)\))?/i)
  if (!match) return ''
  const nums = [match[1], match[2], match[3]].map(Number)
  if (nums.some((n) => !Number.isFinite(n) || n <= 0)) return ''
  const unit = (match[4] || 'cm').toLowerCase()
  return `${match[1]} × ${match[2]} × ${match[3]} ${unit}`
}

function loadNuxt(html) {
  const start = html.indexOf('__NUXT__=')
  if (start < 0) return null
  const end = html.indexOf('</script>', start)
  let code = html.slice(start, end)
  if (!code.startsWith('window.')) code = `window.${code}`
  const sandbox = { window: {} }
  vm.createContext(sandbox)
  vm.runInContext(code, sandbox, { timeout: 8000 })
  const fetch = sandbox.window.__NUXT__?.fetch ?? {}
  return Object.values(fetch).find((value) => value && typeof value === 'object' && value.gallery && (value.selling_price || value.price)) ?? null
}

function specRows(detail) {
  const rows = []
  const push = (label, value) => {
    let clean = decode(value).replace(/,\s*/g, ', ').replace(/\s+/g, ' ').trim()
    if (/^mens wallet$/i.test(clean)) clean = "Men's wallet"
    if (!clean || clean === 'null' || clean === '—' || rows.some((row) => row.label === label)) return
    rows.push({ label, value: clean.slice(0, 180) })
  }
  const attrs = Array.isArray(detail.product_attr) ? detail.product_attr : []
  for (const attr of attrs) {
    if (!attr?.label || !attr?.value) continue
    if (/gender/i.test(attr.label)) continue
    push(attr.label, attr.value)
  }
  push('Dimensions', detail.dimensions ? formatDimensions(detail.dimensions) : '')
  push('SKU', detail.master_sku || detail.sku)
  push('Size', detail.variation ? Object.keys(detail.variation)[0] : 'One Size')
  push('Net quantity', String(detail.net_quantity ?? '').replace(/\s*number\s*/i, '').trim())
  if (detail.manufacture && String(detail.manufacture).length < 160) push('Manufacturer', detail.manufacture)
  return rows
}

function buildRecord(summary, detail, rate) {
  const attrs = Array.isArray(detail.product_attr) ? detail.product_attr : []
  const style = styleOf(summary.href, detail.name || summary.name, attrs)
  const color = colorMeta(detail.productColor || summary.name.replace(/^Men\s+/i, '').replace(/\s+Wallet.*/i, ''))
  const brand = decode(detail.brand || detail.product_brand || summary.brand || 'Metro')
  const sku = decode(detail.master_sku || detail.sku)
  const model = modelCode(sku)
  const listed = listedInr(detail.price, detail.selling_price)
  const inStock = String(detail.stock_status || detail.stockStatus || '').toLowerCase() !== 'out-of-stock' && String(detail.stock_status || '').toLowerCase() !== 'out of stock'
  const images = []
  for (const shot of detail.gallery ?? []) {
    if (!shot?.image || shot.vedio === true || shot.vedio === 'true') continue
    const url = String(shot.image).split('?')[0]
    if (!url.startsWith('https://image.metroshoes.com/products/')) continue
    if (!images.includes(url)) images.push(url)
  }
  const specs = specRows(detail)
  const dimensions = specs.find((row) => row.label === 'Dimensions')?.value ?? ''
  const material = specs.find((row) => /material/i.test(row.label))?.value ?? ''
  const origin = specs.find((row) => /origin/i.test(row.label))?.value || decode(detail.country_of_origin)
  const closure = specs.find((row) => /closure/i.test(row.label))?.value ?? ''
  const slots = specs.find((row) => /card/i.test(row.label))?.value ?? ''
  return {
    brand,
    style,
    model,
    sku,
    color,
    listed,
    priceCents: toCents(listed, rate),
    inStock,
    dimensions,
    material,
    origin,
    closure,
    slots,
    specs,
    imageUrls: images.slice(0, 3),
    gender: decode(detail.gender || ''),
    popularity: summary.popularity,
    sourceUrl: summary.url,
  }
}

function styleTitle(style) {
  return style.replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
}

function displayName(product) {
  const styleLabel = product.style === 'Wallet' ? 'Wallet' : styleTitle(product.style)
  const colorLabel = styleTitle(product.color.name)
  const base = `${product.brand} ${colorLabel} ${styleLabel}`.replace(/\s+/g, ' ').trim()
  return product.model ? `${base} ${product.model}` : base
}

function taglineFor(product) {
  if (!product.dimensions) return product.style
  const tagline = `${product.style} · ${product.dimensions}`
  return tagline.length <= 42 ? tagline : product.style
}

function descriptionFor(product, name) {
  const style = product.style.toLowerCase()
  const sentences = [
    `${name} is a men's ${style} in ${product.color.name.toLowerCase()} from ${product.brand}.`,
    product.dimensions ? `Listed dimensions are ${product.dimensions}.` : '',
    product.material ? `The published material is ${product.material}.` : 'Metro does not publish a material for this style.',
    product.closure ? `Closure: ${product.closure}.` : '',
    product.slots ? `Card storage listed: ${product.slots}.` : 'It is made to carry cards and folded cash.',
    product.origin ? `Country of origin: ${product.origin}.` : '',
    product.sku ? `SKU ${product.sku}.` : '',
  ]
  return sentences.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
}

function materialsFor(product) {
  if (product.material) return `${product.material}.`
  return `Material is not published for this style. Colour: ${product.color.name}.`
}

function tsString(value) {
  return JSON.stringify(value)
}

function renderModule(products, rate) {
  const body = products
    .map((product) => {
      const specs = product.specs.map((row) => `      { label: ${tsString(row.label)}, value: ${tsString(row.value)} },`).join('\n')
      const highlights = product.highlights.map((item) => `      ${tsString(item)},`).join('\n')
      const traits = product.traits.map(([group, value]) => `      { group: ${tsString(group)}, value: ${tsString(value)} },`).join('\n')
      return `  {
    id: ${tsString(product.id)},
    slug: ${tsString(product.slug)},
    name: ${tsString(product.name)},
    category: 'wallets',
    variant: 'simple',
    tagline: ${tsString(product.tagline)},
    description: ${tsString(product.description)},
    priceCents: ${product.priceCents},
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
${traits}
    ],
    materials: ${tsString(product.materials)},
    care: 'Wipe with a soft dry cloth. Keep the wallet away from prolonged rain and do not machine wash it.',
    fit: {
      summary: 'One size.',
      advice: 'Built for cards and folded cash. Use the dimensions in the specifications to check pocket fit.',
    },
    bestFor: [${tsString(product.style === 'Card holder' ? 'Cards' : 'Everyday carry')}],
    defaultStock: ${product.inStock ? 8 : 0},
    stock: {},
    relatedGuides: ['what-fits-in-a-crossbody-bag'],
  }`
    })
    .join(',\n')

  return `import type { Product, WidthOption } from './types.js'

const ONE: WidthOption = { code: 'OS', label: 'One size' }

/**
 * Men's wallets listed between ${MIN_INR.toLocaleString('en-US')} and ${MAX_INR.toLocaleString('en-US')} INR on Metro Shoes.
 * Each price is five times that listed price, converted at ${rate.toFixed(2)} INR per USD on 2026-09-27 and rounded to the nearest dollar.
 * The listed price is Metro's regular rupee price when it falls in that band. A lower promotional price is not used.
 */
export const mensWallets: Product[] = [
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

function rank(product) {
  const styleScore = product.style === 'Bifold' || product.style === 'Trifold' || product.style === 'Wallet' ? 30 : product.style === 'Money clip' || product.style === 'Card holder' ? 10 : 0
  return (product.inStock ? 1000 : 0) + styleScore + (product.dimensions ? 15 : 0) + Math.min(product.imageUrls.length, 3) * 5 - product.popularity
}

async function main() {
  const rate = await inrPerUsd()
  console.log(`INR per USD: ${rate}`)

  const seen = new Set()
  const listed = []
  for (let page = 1; page <= 12; page++) {
    const url = page === 1 ? LIST_URL : `${LIST_URL}?page=${page}`
    const html = await getText(url)
    const batch = parseListing(html).filter((product) => {
      if (seen.has(product.href)) return false
      seen.add(product.href)
      return true
    })
    console.log(`page ${page}: ${batch.length} new`)
    if (!batch.length) break
    listed.push(...batch)
  }

  const qualified = []
  for (const product of listed) {
    const listedPrice = listedInr(product.regular, product.selling)
    if (!listedPrice) continue
    if (/passport/.test(product.href)) continue
    qualified.push({ ...product, listedPrice, popularity: qualified.length })
  }
  const skipped = listed.filter((product) => !qualified.some((item) => item.href === product.href))
  console.log(`listing ${listed.length}, in band ${qualified.length}, skipped ${skipped.length}`)
  if (skipped.length) console.log(skipped.map((p) => `skip ₹${p.regular || p.selling} ${p.href}`).join('\n'))
  if (process.argv.includes('--scan')) {
    console.log(qualified.slice(0, 15).map((p) => `${p.listedPrice}\t${p.selling}\t${p.name}\t${p.href}`).join('\n'))
    return
  }
  if (!qualified.length) throw new Error('No wallets in the ₹1,000–₹25,000 band')

  const details = await mapPool(qualified, 4, async (product, index) => {
    try {
      const html = await getText(product.url)
      const detail = loadNuxt(html)
      console.log(`${index + 1}/${qualified.length} ${product.href} ${detail ? 'ok' : 'no-data'}`)
      return detail
    } catch (error) {
      console.log(`${index + 1}/${qualified.length} FAILED ${product.href} ${error.message}`)
      return null
    }
  })

  const built = []
  for (let i = 0; i < qualified.length; i++) {
    const detail = details[i]
    if (!detail) continue
    const product = buildRecord(qualified[i], detail, rate)
    if (!product.listed || product.priceCents <= 0) continue
    if (/women|woman/i.test(product.gender)) continue
    if (product.style === 'Passport holder') continue
    if (!product.imageUrls.length) {
      console.log('skip no photos', product.sku, product.sourceUrl)
      continue
    }
    built.push(product)
  }

  built.sort((a, b) => rank(b) - rank(a) || a.popularity - b.popularity)
  const chosen = built.slice(0, TARGET)
  if (!chosen.length) throw new Error('No in-stock wallets left after reading product pages')
  console.log(`chosen ${chosen.length} of ${built.length} in-stock matches`)

  const usedNames = new Set()
  for (const product of chosen) {
    let name = displayName(product)
    if (usedNames.has(name)) name = `${name} ${product.sku}`.replace(/\s+/g, ' ').trim()
    usedNames.add(name)
    const id = `metro-${product.sku || product.model || name}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48)
    product.id = id
    product.slug = id
    product.name = name
    product.tagline = taglineFor(product)
    const title = `${product.name} – ${product.tagline}`
    if (title.length > 60) product.tagline = product.style
    product.description = descriptionFor(product, product.name)
    product.materials = materialsFor(product)
    product.highlights = [product.style, product.color.name, product.dimensions, product.material].filter(Boolean).slice(0, 4)
    const traitPairs = [
      ['Style', product.style],
      ['Brand', product.brand],
      ['Color', product.color.name],
      product.material ? ['Material', product.material.slice(0, 40)] : null,
    ].filter(Boolean)
    product.traits = traitPairs.filter(([, value]) => value.length <= 40)
    const byLabel = new Map(product.specs.map((row) => [row.label, row]))
    if (!byLabel.has('Brand')) byLabel.set('Brand', { label: 'Brand', value: product.brand })
    if (!byLabel.has('Style')) byLabel.set('Style', { label: 'Style', value: product.style })
    byLabel.set('Colour', { label: 'Colour', value: styleTitle(product.color.name) })
    byLabel.delete('Color')
    const order = ['Brand', 'Style', 'Colour', 'Color', 'Dimensions', 'SKU', 'Size', 'Country of Origin', 'Net quantity', 'Occasion', 'Manufacturer']
    const ordered = []
    for (const label of order) {
      if (byLabel.has(label)) ordered.push(byLabel.get(label))
    }
    for (const row of byLabel.values()) {
      if (!ordered.some((item) => item.label === row.label)) ordered.push(row)
    }
    product.specs = ordered
  }

  const seenIds = new Set()
  for (const product of chosen) {
    let id = product.id
    while (seenIds.has(id)) id = `${id.slice(0, 44)}-b`
    product.id = id
    product.slug = id
    const sku = `${id}:${product.color.slug}:0:OS`
    if (sku.length > 80) throw new Error(`SKU too long (${sku.length}) ${sku}`)
    seenIds.add(id)
  }

  const srcDir = path.join(root, 'assets-src', 'generated')
  fs.mkdirSync(srcDir, { recursive: true })
  await mapPool(chosen, 3, async (product) => {
    const keys = []
    for (let i = 0; i < product.imageUrls.length; i++) {
      const key = `${product.id}-${i + 1}`
      const file = path.join(srcDir, `${key}.png`)
      if (!fs.existsSync(file)) {
        let bytes
        try {
          bytes = await get(product.imageUrls[i], { maxBytes: 8_000_000, timeoutMs: 25000 })
        } catch (error) {
          console.log(`image failed ${key} ${error.message}`)
          continue
        }
        try {
          const fitted = await sharp(bytes)
            .rotate()
            .resize(1200, 1200, { fit: 'contain', background: { r: 244, g: 241, b: 234, alpha: 1 } })
            .png({ compressionLevel: 9 })
            .toBuffer()
          fs.writeFileSync(file, fitted)
          console.log(`image ${key} ${Math.round(fitted.length / 1024)} KB`)
        } catch (error) {
          console.log(`image decode failed ${key} ${error.message}`)
          continue
        }
      }
      keys.push(key)
    }
    product.imageKeys = keys
  })

  const finalProducts = chosen.filter((product) => product.imageKeys?.length)
  if (finalProducts.length < Math.min(TARGET, chosen.length)) {
    console.log(`photos missing for ${chosen.length - finalProducts.length}`)
  }
  if (!finalProducts.length) throw new Error('No wallet photos downloaded')

  const manifestPath = path.join(root, 'src', 'data', 'imageManifest.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const outDir = path.join(root, 'public', 'images', 'products')
  fs.mkdirSync(outDir, { recursive: true })
  await mapPool(
    finalProducts.flatMap((product) => product.imageKeys),
    3,
    async (key) => {
      const png = path.join(srcDir, `${key}.png`)
      const meta = await sharp(png).metadata()
      const sample = await sharp(png).extract({ left: 8, top: 8, width: 40, height: 40 }).resize(1, 1).raw().toBuffer()
      const bg = `#${[...sample.subarray(0, 3)].map((v) => v.toString(16).padStart(2, '0')).join('')}`
      const widths = [400, 700, 1024].filter((w) => w <= (meta.width ?? 0))
      for (const w of widths) {
        const base = path.join(outDir, `${key}-${w}`)
        if (!fs.existsSync(`${base}.webp`)) await sharp(png).resize({ width: w }).webp({ quality: 78 }).toFile(`${base}.webp`)
        if (!fs.existsSync(`${base}.avif`)) await sharp(png).resize({ width: w }).avif({ quality: 55, effort: 4 }).toFile(`${base}.avif`)
      }
      manifest[key] = { w: meta.width, h: meta.height, widths, bg }
    },
  )
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  fs.writeFileSync(path.join(root, 'src', 'catalog', 'mensWallets.ts'), renderModule(finalProducts, rate))
  console.log(`wrote ${finalProducts.length} wallets`)
  console.log(finalProducts.map((p) => `${p.style}\t₹${p.listed}\t$${(p.priceCents / 100).toFixed(0)}\t${p.name}`).join('\n'))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
