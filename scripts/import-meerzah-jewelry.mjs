/**
 * Pulls women's jewelry listed between 1,000 and 25,000 PKR on Meerzah.
 * The store price is five times that listing, converted to USD.
 */
import fs from 'node:fs'
import https from 'node:https'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
const MIN_PKR = 1000
const MAX_PKR = 25000
const TARGET = 50
const COLLECTIONS = [
  '925-chandi',
  'australian-pearl-collection',
  'stainless-steel',
  'bracelets',
  'pendants',
  'rings',
  'necklace-sets',
  'earings',
  'bangles',
  'tradional-sets',
  'best-seller',
]

const QUOTA = {
  sterling: 9,
  pearl: 4,
  kundan: 4,
  bracelet: 6,
  ring: 6,
  necklace: 7,
  earring: 5,
  bangle: 5,
  pendant: 4,
}

const SWATCH = {
  black: '#161616',
  white: '#f4f1ea',
  grey: '#8d8a84',
  gray: '#8d8a84',
  silver: '#c5c7c9',
  zinc: '#8d8a84',
  navy: '#1d4e89',
  blue: '#1d4e89',
  green: '#3e5c45',
  mint: '#8eae96',
  red: '#8d3a32',
  maroon: '#6e2e33',
  pink: '#e7b7c6',
  baby: '#f3c6d0',
  purple: '#6e4a78',
  ruby: '#8d3a32',
  rubi: '#8d3a32',
  feroza: '#1f8a8a',
  firoza: '#1f8a8a',
  yellow: '#d6b15a',
  gold: '#c6a15b',
  orange: '#c45a2c',
  pearl: '#f3ead7',
  cream: '#f3ead7',
  beige: '#d8cbb8',
}

function get(url, { maxBytes = 2_000_000, timeoutMs = 25000 } = {}, attempt = 0) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': UA, Accept: '*/*' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume()
        resolve(get(new URL(res.headers.location, url).href, { maxBytes, timeoutMs }, attempt))
        return
      }
      if ((res.statusCode === 429 || res.statusCode >= 500) && attempt < 3) {
        res.resume()
        setTimeout(() => resolve(get(url, { maxBytes, timeoutMs }, attempt + 1)), 800 * (attempt + 1))
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
    req.on('error', (error) => {
      if (attempt < 3) setTimeout(() => resolve(get(url, { maxBytes, timeoutMs }, attempt + 1)), 800 * (attempt + 1))
      else reject(error)
    })
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
    .replace(/\s+/g, ' ')
    .trim()
}

function pkr(amount) {
  const rounded = Number.isInteger(amount) ? amount : Math.round(amount * 100) / 100
  return `Rs${rounded.toLocaleString('en-US')} PKR`
}

function titleWord(word) {
  const lower = word.toLowerCase()
  if (lower === 'rubi' || lower === 'ruby') return 'Ruby'
  if (lower === 'feroza' || lower === 'firoza') return 'Feroza'
  if (lower === 'k' || /^\d/.test(lower)) return word.toUpperCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

function cleanColor(value) {
  const text = String(value || '')
    .replace(/\./g, ' ')
    .replace(/\+/g, ' / ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!text || /^default title$/i.test(text)) return ''
  return text
    .split(' ')
    .map((word) => (word === '/' ? '/' : titleWord(word)))
    .join(' ')
    .replace(/\s+\/\s+/g, ' / ')
}

function colorSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 16) || 'color'
}

function familyOf(name) {
  const text = name.toLowerCase()
  if (/black/.test(text)) return 'black'
  if (/white|cream|pearl/.test(text)) return 'white'
  if (/grey|gray|silver|zinc/.test(text)) return 'grey'
  if (/navy|blue/.test(text)) return 'blue'
  if (/green|mint/.test(text)) return 'green'
  if (/purple|plum|pink|red|maroon|ruby|rubi/.test(text)) return 'red'
  if (/feroza|firoza|turquoise/.test(text)) return 'blue'
  if (/gold/.test(text)) return 'gold'
  return 'neutral'
}

function swatchOf(name) {
  const words = name.toLowerCase().split(/[^a-z]+/).filter(Boolean)
  const colors = words.map((word) => SWATCH[word]).filter(Boolean)
  if (colors.length >= 2) return [colors[0], colors[1]]
  if (colors.length === 1) return [colors[0]]
  return familyOf(name) === 'gold' ? ['#c6a15b'] : ['#c4b8a8']
}

function listedPrice(product) {
  const variant = product.variants.find((item) => item.available) || product.variants[0]
  return {
    price: Number(variant?.price),
    compare: Number(variant?.compare_at_price) || 0,
    available: product.variants.some((item) => item.available),
    sku: variant?.sku || '',
  }
}

function excluded(product) {
  const text = `${product.title} ${product.product_type || ''} ${(product.tags || []).join(' ')}`.toLowerCase()
  if (/kid|child|\bboys?\b/.test(text)) return true
  if (/\bmen\b|\bmens\b/.test(text) && !/women|girls/.test(text)) return true
  return /shirt|skirt|cosmetic|button|handbag|\bbag\b/.test(text)
}

function jewelryType(product) {
  const title = product.title.toLowerCase()
  const typed = `${product.product_type || ''}`.toLowerCase()
  const blob = `${title} ${typed}`
  if (/earring|earing/.test(title) || /earing/.test(typed)) return 'Earrings'
  if (/bracelet/.test(title)) return 'Bracelet'
  if (/bangle/.test(title)) return 'Bangle'
  if (/pendant/.test(title)) return 'Pendant'
  if (/anklet/.test(title)) return 'Anklet'
  if (/necklace|choker/.test(title)) return 'Necklace set'
  if (/\bring\b/.test(title)) return 'Ring'
  if (/earring|earing/.test(blob)) return 'Earrings'
  if (/bracelet/.test(blob)) return 'Bracelet'
  if (/bangle/.test(blob)) return 'Bangle'
  if (/pendant/.test(blob)) return 'Pendant'
  if (/necklace|choker/.test(blob)) return 'Necklace set'
  if (/\bring\b/.test(blob)) return 'Ring'
  return 'Jewelry'
}

function bucketFor(product, type, text) {
  const blob = `${product.title} ${text}`.toLowerCase()
  if (/925|sterling/.test(blob)) return 'sterling'
  if (/pearl/.test(blob)) return 'pearl'
  if (/kundan/.test(blob)) return 'kundan'
  if (type === 'Bracelet') return 'bracelet'
  if (type === 'Bangle') return 'bangle'
  if (type === 'Earrings') return 'earring'
  if (type === 'Necklace set') return 'necklace'
  if (type === 'Pendant') return 'pendant'
  if (type === 'Ring') return 'ring'
  return 'necklace'
}

function styleKey(title) {
  const stop = new Set(
    'elegant unique luxury sparkling gorgeous charming glamorous fancy beautiful dazzling luminous stylish design crystal stones stone for girls women the a an of and with set'.split(
      ' ',
    ),
  )
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((word) => word && !stop.has(word) && word !== 'girl' && word !== 'woman')
  return words.sort().join(' ') || title.toLowerCase()
}

function seoName(name, type) {
  const max = 60 - type.length - ' – '.length
  if (name.length <= max) return name
  const cut = name.slice(0, max)
  const word = cut.slice(0, cut.lastIndexOf(' ')).trim()
  return word.length >= 18 ? word : cut.trim()
}

function tidyName(title) {
  const raw = title.replace(/\s+/g, ' ').replace(/\s+for\s+girls\s*\/\s*women\.*/i, '').trim()
  const letters = raw.replace(/[^a-zA-Z]/g, '')
  const lower = (letters.match(/[a-z]/g) || []).length
  const cased = letters.length && lower / letters.length > 0.75 ? raw.replace(/\b[a-z]/g, (letter) => letter.toUpperCase()) : raw
  const name = cased === cased.toUpperCase() ? cased.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) : cased
  if (name.length <= 72) return name
  return name.slice(0, 72).replace(/\s+\S*$/, '').trim()
}

function fitId(name) {
  return `mz-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 46)
    .replace(/-$/g, '')
}

function uniqueText(text) {
  return text
    .toLowerCase()
    .replace(/unique design|open shipment(?: parcel)?|cheap in price|colou?r warranty|best gift for your partner|stylish design|elegant design|girls\/women|for girls|with stylish|an elegant design/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function optionValue(variant, index) {
  return [variant.option1, variant.option2, variant.option3][index]
}

function parseSize(value) {
  const text = String(value || '').trim()
  if (!text || /^default title$/i.test(text)) return null
  if (!/^\d+(?:\.\d+)?$/.test(text)) return { label: cleanColor(text) || text, numeric: false }
  const number = Number(text)
  if (!(number > 0 && number < 20)) return { label: text, numeric: false }
  return { label: Number.isInteger(number) ? String(number) : String(number), number, numeric: true }
}

function roles(product) {
  let colorIndex = null
  let sizeIndex = null
  for (const option of product.options || []) {
    const name = option.name.toLowerCase()
    const values = option.values.filter((value) => !/^default title$/i.test(value))
    if (!values.length) continue
    if (/colou?r/.test(name)) colorIndex = option.position - 1
    else if (/size/.test(name)) sizeIndex = option.position - 1
  }
  return { colorIndex, sizeIndex }
}

function materialOf(text) {
  const lower = text.toLowerCase().replace(/gold coated/g, 'gold plated')
  if (/925|sterling/.test(lower)) return 'Sterling silver (925)'
  if (/chandi plated|chandi coated|silver plated/.test(lower)) return 'Silver plated metal'
  if (/stainless/.test(lower)) return 'Stainless steel'
  if (/kundan/.test(lower) && /gold plated/.test(lower)) return 'Gold plated metal with kundan'
  if (/pearl/.test(lower) && /gold plated/.test(lower)) return 'Pearls with gold plated metal'
  if (/pearl/.test(lower)) return 'Pearls'
  if (/zircon/.test(lower) && /gold plated/.test(lower)) return 'Gold plated metal with zircon'
  if (/crystal/.test(lower) && /gold plated/.test(lower)) return 'Gold plated metal with crystal stones'
  if (/real stones?/.test(lower) && /gold plated/.test(lower)) return 'Gold plated metal with real stones'
  if (/silver plated/.test(lower)) return 'Silver plated metal'
  if (/gold plated/.test(lower)) return 'Gold plated metal'
  if (/kundan/.test(lower)) return 'Kundan'
  return ''
}

function finishOf(title, body) {
  const titled = title.replace(/gold coated/gi, 'gold plated')
  if (/silver plated|chandi plated|chandi coated/i.test(titled) && !/gold plated/i.test(titled)) return 'Silver plated'
  const source = `${titled} ${body || ''}`.replace(/gold coated/gi, 'gold plated')
  if (/18\s*k gold/i.test(source)) return '18K gold plated'
  if (/24\s*k gold/i.test(source)) return '24K gold plated'
  if (/22\s*k/i.test(source)) return '22K gold plated'
  if (/chandi plated|chandi coated|silver plated/i.test(source)) return 'Silver plated'
  if (/gold plated/i.test(source)) return 'Gold plated'
  return ''
}

function stonesOf(text) {
  const found = []
  if (/kundan/i.test(text)) found.push('Kundan')
  if (/zircon/i.test(text)) found.push('Zircon')
  if (/crystal/i.test(text)) found.push('Crystal')
  if (/pearl/i.test(text)) found.push('Pearls')
  if (/real stones?/i.test(text)) found.push('Real stones')
  return found.join(', ')
}

function gramsOf(text) {
  const match = text.match(/(\d+(?:\.\d+)?)\s*grams?\b/i)
  return match ? `${match[1]} g` : ''
}

function warrantyOf(text) {
  const lower = text.toLowerCase()
  const parts = []
  if (/chandi life\s*time|lifetime/.test(lower) && /925|sterling/.test(lower)) parts.push('Sterling silver for the life of the piece')
  const plating = lower.match(/plating\s*(\d+)\s*months?/)
  if (plating) parts.push(`plating for ${plating[1]} months`)
  const years = lower.match(/(\d+)\s*years?\s*colou?r\s*warranty/)
  if (years) parts.push(`${years[1]}-year color warranty`)
  return parts.join(', ')
}

function impliedColor(text, type) {
  if (/silver plated/i.test(text) && !/gold plated/i.test(text)) return 'Silver'
  if (/pearl/i.test(text) && !/gold plated/i.test(text)) return 'Pearl'
  if (/gold plated|18\s*k|24\s*k/i.test(text)) return 'Gold'
  if (type === 'Earrings' || type === 'Ring' || type === 'Bracelet') return 'Gold'
  return 'Multi'
}

function canonicalSize(raw) {
  const parsed = parseSize(raw)
  if (!parsed) return null
  if (parsed.numeric) return { key: parsed.number, label: parsed.label }
  const norm = parsed.label.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const open = /\bopen/.test(norm)
  const sawa = /sawa/.test(norm)
  const dhai = /dhai/.test(norm)
  const ponay = /ponay|paune|paunay/.test(norm)
  if (/adjust/.test(norm) && !sawa && !dhai && !ponay) return { key: 1, label: 'Adjustable' }
  if (open && ponay) return { key: 8, label: 'Ponay teen openable' }
  if (open && sawa) return { key: 7, label: 'Sawa do openable' }
  if (open && dhai) return { key: 6, label: 'Dhai openable' }
  if (ponay) return { key: 5, label: 'Ponay teen' }
  if (dhai) return { key: 4, label: 'Dhai' }
  if (sawa) return { key: 3, label: 'Sawa do' }
  if (/^do$/.test(norm)) return { key: 9, label: 'Do' }
  if (open) return { key: 2, label: 'Openable' }
  return { key: null, label: parsed.label }
}

function sizePlan(product) {
  const empty = { kind: 'simple', sizes: [0], labels: undefined, labelsList: [], note: '' }
  const { sizeIndex } = roles(product)
  if (sizeIndex == null) return empty
  const raw = [...new Set((product.options[sizeIndex].values || []).map((value) => String(value).trim()).filter((value) => !/^default title$/i.test(value)))]
  const used = new Set()
  const mapped = []
  let spare = 9
  for (const value of raw) {
    const item = canonicalSize(value)
    if (!item) continue
    let key = item.key
    if (key == null) {
      while (used.has(spare)) spare += 1
      if (spare > 14) continue
      key = spare
      spare += 1
    }
    if (used.has(key)) continue
    used.add(key)
    mapped.push({ key, label: item.label })
  }
  if (mapped.length <= 1) return { ...empty, note: mapped[0]?.label || '' }
  return {
    kind: 'apparel',
    sizes: mapped.map((item) => item.key),
    labels: Object.fromEntries(mapped.map((item) => [item.key, item.label])),
    labelsList: mapped.map((item) => item.label),
    note: mapped.map((item) => item.label).join(' · '),
  }
}

function hidesLetterVariants(product) {
  for (const option of product.options || []) {
    if (!/style|letter|alphabet/i.test(option.name)) continue
    const values = option.values.filter((value) => !/^default title$/i.test(value))
    if (values.length > 8 && values.every((value) => /^[A-Za-z]$/.test(String(value).trim()))) return true
  }
  return false
}

function noun(type) {
  if (type === 'Earrings') return 'pair of earrings'
  return type.toLowerCase()
}

function colorPlan(product, text, type) {
  const { colorIndex } = roles(product)
  if (colorIndex == null) {
    const name = impliedColor(text, type)
    return [{ name, variants: product.variants }]
  }
  const groups = new Map()
  for (const variant of product.variants) {
    const name = cleanColor(optionValue(variant, colorIndex)) || impliedColor(text, type)
    const list = groups.get(name) || []
    list.push(variant)
    groups.set(name, list)
  }
  const colors = [...groups].map(([name, variants]) => ({ name, variants }))
  colors.sort((a, b) => Number(b.variants.some((variant) => variant.available)) - Number(a.variants.some((variant) => variant.available)))
  return colors.slice(0, 6)
}

function imageSrc(image) {
  const src = image?.src || ''
  return src.startsWith('https://cdn.shopify.com/') ? src : ''
}

function downloadSrc(src) {
  const url = new URL(src)
  if (!url.searchParams.has('width')) url.searchParams.set('width', '1400')
  return url.href
}

function imagesFor(product, variants) {
  const ids = new Set(variants.map((variant) => variant.id))
  const linked = []
  for (const image of product.images || []) {
    const src = imageSrc(image)
    if (!src) continue
    const tied = image.variant_ids || []
    if (tied.some((id) => ids.has(id))) linked.push(src)
  }
  if (linked.length) return [...new Set(linked)]
  return []
}

function joinList(items) {
  if (items.length <= 1) return items[0] || ''
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`
}

function build(product, index, rate, bestSeller) {
  const text = strip(product.body_html)
  const { price, compare, available, sku } = listedPrice(product)
  const type = jewelryType(product)
  const bucket = bucketFor(product, type, text)
  const material = materialOf(`${product.title} ${text}`)
  const finish = finishOf(product.title, text)
  const stones = stonesOf(`${product.title} ${text}`)
  const grams = gramsOf(`${product.title} ${text}`)
  const warranty = warrantyOf(text)
  const sizes = sizePlan(product)
  const colors = colorPlan(product, `${product.title} ${text}`, type)
  const looseImages = (product.images || []).map(imageSrc).filter(Boolean)
  const colorModels = colors.map((color) => {
    const own = imagesFor(product, color.variants)
    return { ...color, images: own }
  })
  if (colorModels.every((color) => color.images.length === 0)) {
    colorModels[0].images = looseImages.slice(0, 3)
    for (let i = 1; i < colorModels.length; i++) colorModels[i].images = looseImages.slice(0, 1)
  } else {
    for (const color of colorModels) {
      if (!color.images.length) color.images = looseImages.slice(0, 1)
    }
  }
  for (let i = 0; i < colorModels.length; i++) {
    colorModels[i].images = colorModels[i].images.slice(0, i === 0 ? 3 : 2)
  }
  const fullName = tidyName(product.title)
  const name = seoName(fullName, type)
  const colorNames = colorModels.map((color) => color.name)
  const facts = [
    material ? `Material: ${material}.` : '',
    grams ? `Weight: ${grams}.` : '',
    finish && material.toLowerCase().indexOf(finish.toLowerCase().replace(' plated', '')) === -1 ? `Finish: ${finish}.` : '',
    stones && !material.toLowerCase().includes(stones.split(',')[0].toLowerCase()) ? `Stones: ${stones}.` : '',
    sizes.labelsList?.length && sizes.kind === 'apparel' ? `Sizes: ${joinList(sizes.labelsList)}.` : '',
    sizes.note && sizes.kind === 'simple' ? `Size: ${sizes.note}.` : '',
    warranty ? `Warranty: ${warranty}.` : '',
    `Original price: ${pkr(price)}.`,
  ].filter(Boolean)
  const description = [`${name} is a ${noun(type)} from Meerzah, shown in ${joinList(colorNames.map((item) => item.toLowerCase()))}.`, ...facts].join(' ')
  const specs = [
    { label: 'Brand', value: 'Meerzah' },
    { label: 'SKU', value: sku || product.handle },
    { label: 'Jewelry type', value: type },
    { label: 'Original price', value: pkr(price) },
  ]
  if (compare > price) specs.push({ label: 'Regular price', value: pkr(compare) })
  if (material) specs.push({ label: 'Material', value: material })
  if (grams) specs.push({ label: 'Weight', value: grams })
  if (finish) specs.push({ label: 'Finish', value: finish })
  if (stones) specs.push({ label: 'Stones', value: stones })
  if (sizes.note) specs.push({ label: 'Size', value: sizes.note })
  specs.push({ label: 'Color', value: colorNames.join(', ') })
  if (warranty) specs.push({ label: 'Warranty', value: warranty })
  const highlights = [...new Set([type, material, grams ? `${grams} weight` : '', stones, sizes.kind === 'apparel' ? `Sizes ${sizes.note}` : sizes.note, finish].filter(Boolean))].slice(0, 3)
  const imageCount = colorModels.reduce((sum, color) => sum + color.images.length, 0)
  const stock = {}
  for (const color of colorModels) {
    const slug = colorSlug(color.name)
    if (sizes.kind === 'simple') {
      const inStock = color.variants.some((variant) => variant.available)
      if (!inStock) stock[`${slug}:0`] = 0
    } else {
      const { sizeIndex } = roles(product)
      for (const size of sizes.sizes) {
        const label = sizes.labels[size]
        const matched = color.variants.filter((variant) => canonicalSize(optionValue(variant, sizeIndex))?.key === size || canonicalSize(optionValue(variant, sizeIndex))?.label === label)
        const inStock = matched.length ? matched.some((variant) => variant.available) : color.variants.some((variant) => variant.available)
        if (!inStock) stock[`${slug}:${size}`] = 0
      }
    }
  }
  return {
    id: fitId(fullName),
    name,
    type,
    bucket,
    description,
    priceCents: toCents(price, rate),
    compareAtPriceCents: compare > price ? toCents(compare, rate) : undefined,
    colors: colorModels.map((color) => ({
      name: color.name,
      slug: colorSlug(color.name),
      swatch: swatchOf(color.name),
      family: familyOf(color.name),
      images: color.images,
    })),
    variant: sizes.kind,
    sizes: sizes.sizes,
    sizeLabels: sizes.labels,
    specs,
    material: material || finish || 'Metal and stones are listed when Meerzah published them.',
    highlights,
    available,
    sku,
    sourcePkr: price,
    comparePkr: compare > price ? compare : 0,
    index,
    styleKey: styleKey(product.title),
    bestSeller: bestSeller.has(product.id),
    uniqueText: uniqueText(text),
    grams,
    warranty,
    imageCount,
    stock,
    handle: product.handle,
  }
}

function score(item) {
  let value = 0
  if (item.available) value += 240
  value += Math.min(item.imageCount, 4) * 16
  if (item.imageCount >= 2 && item.imageCount <= 8) value += 24
  value += Math.min(item.uniqueText.length, 220) / 4
  if (item.grams) value += 90
  if (item.bucket === 'sterling') value += 80
  if (item.bucket === 'kundan') value += 36
  if (item.bucket === 'pearl') value += 28
  if (item.colors.length > 1) value += 22
  if (item.sizes.length > 1) value += 22
  if (item.warranty) value += 12
  if (item.bestSeller) value += 30
  if (/ayat|tennis|tulip|heart|flower|butterfly|alphabet|jarao|zircon|pearl|chandi|925/.test(item.name.toLowerCase())) value += 34
  return value
}

function skuOk(item) {
  const width = 'OS'
  for (const color of item.colors) {
    for (const size of item.sizes) {
      const sizeText = Number.isInteger(size) ? String(size) : size.toFixed(1)
      if (`${item.id}:${color.slug}:${sizeText}:${width}`.length > 80) return false
    }
  }
  return item.colors.every((color) => color.images.length > 0)
}

function pick(items) {
  const ranked = [...items].sort((a, b) => score(b) - score(a) || a.index - b.index)
  const chosen = []
  const counts = new Map()
  const styles = new Map()
  const prices = new Map()
  const take = (styleCap, priceCap) => {
    for (const item of ranked) {
      if (chosen.length >= TARGET) break
      if (chosen.includes(item)) continue
      const used = counts.get(item.bucket) || 0
      if (used >= (QUOTA[item.bucket] || 0)) continue
      if ((styles.get(item.styleKey) || 0) >= styleCap) continue
      if ((prices.get(`${item.bucket}:${item.sourcePkr}`) || 0) >= priceCap) continue
      chosen.push(item)
      counts.set(item.bucket, used + 1)
      styles.set(item.styleKey, (styles.get(item.styleKey) || 0) + 1)
      prices.set(`${item.bucket}:${item.sourcePkr}`, (prices.get(`${item.bucket}:${item.sourcePkr}`) || 0) + 1)
    }
  }
  take(1, 2)
  for (const item of ranked) {
    if (chosen.length >= TARGET) break
    if (chosen.includes(item)) continue
    if ((styles.get(item.styleKey) || 0) >= 1) continue
    chosen.push(item)
    styles.set(item.styleKey, 1)
  }
  take(2, 4)
  return chosen.slice(0, TARGET)
}

function tsString(value) {
  return JSON.stringify(value)
}

function render(products, rate) {
  const body = products
    .map((product) => {
      const stockLines = Object.entries(product.stock)
        .filter(([, qty]) => qty === 0)
        .map(([key]) => `      ${tsString(`${product.id}:${key}:OS`)}: 0,`)
      const compare = product.compareAtPriceCents ? `\n    compareAtPriceCents: ${product.compareAtPriceCents},` : ''
      const labels = product.sizeLabels
        ? `\n    sizeLabels: {${Object.entries(product.sizeLabels)
            .map(([key, label]) => ` ${key}: ${tsString(label)},`)
            .join('') } },`
        : ''
      const fit =
        product.variant === 'apparel'
          ? {
              summary: `Sizes ${product.specs.find((spec) => spec.label === 'Size')?.value || 'are listed on the piece'}.`,
              advice: 'Choose the size stamped on a piece you already wear. These are jewelry sizes, not shoe sizes.',
            }
          : product.specs.some((spec) => spec.label === 'Size' && /adjust|open/i.test(spec.value))
            ? { summary: 'Adjustable.', advice: 'This piece opens or adjusts. No shoe size applies.' }
            : { summary: 'One size.', advice: 'This piece is one size. No shoe size applies.' }
      return `  {
    id: ${tsString(product.id)},
    slug: ${tsString(product.id)},
    name: ${tsString(product.name)},
    category: 'womens-jewelry',
    variant: ${tsString(product.variant)},
    tagline: ${tsString(product.type)},
    description: ${tsString(product.description)},
    priceCents: ${product.priceCents},${compare}
    isNew: true,
    colors: [
${product.colors
  .map(
    (color) => `      {
        slug: ${tsString(color.slug)},
        name: ${tsString(color.name)},
        swatch: ${tsString(color.swatch)},
        images: ${tsString(color.imageKeys)},
        family: ${tsString(color.family)},
      },`,
  )
  .join('\n')}
    ],
    sizes: ${tsString(product.sizes)},${labels}
    widths: [ONE],
    highlights: ${tsString(product.highlights)},
    specs: [
${product.specs.map((spec) => `      { label: ${tsString(spec.label)}, value: ${tsString(spec.value)} },`).join('\n')}
    ],
    traits: [
      { group: 'Brand', value: 'Meerzah' },
      { group: 'Jewelry type', value: ${tsString(product.type)} },
    ],
    materials: ${tsString(product.material)},
    care: 'Wipe with a soft dry cloth. Keep plated jewelry away from water, perfume, and lotion, and take it off before swimming.',
    fit: {
      summary: ${tsString(fit.summary)},
      advice: ${tsString(fit.advice)},
    },
    bestFor: ${tsString(product.bucket === 'kundan' ? ['Occasion', 'Gift'] : ['Everyday', 'Gift'])},
    defaultStock: 8,
    stock: {
${stockLines.join('\n')}
    },
  }`
    })
    .join(',\n')

  return `import type { Product, WidthOption } from './types.js'

const ONE: WidthOption = { code: 'OS', label: 'One size' }

/**
 * Women's jewelry listed between ${MIN_PKR.toLocaleString('en-US')} and ${MAX_PKR.toLocaleString('en-US')} PKR on Meerzah.
 * Each price is five times that listing, converted at ${rate.toFixed(2)} PKR per USD on 2026-09-27 and rounded to the nearest dollar.
 * Original price on each product is the Meerzah listing that was multiplied.
 */
export const meerzahJewelry: Product[] = [
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

async function collectionProducts(handle) {
  const out = []
  for (let page = 1; page <= 8; page++) {
    const data = JSON.parse((await get(`https://meerzah.pk/collections/${handle}/products.json?limit=250&page=${page}`)).toString())
    const products = data.products || []
    out.push(...products)
    if (products.length < 250) break
  }
  return out
}

async function main() {
  const rate = await pkrPerUsd()
  const bestSeller = new Set()
  const seen = new Set()
  const products = []
  for (const handle of COLLECTIONS) {
    const batch = await collectionProducts(handle)
    console.log(`${handle} ${batch.length}`)
    for (const product of batch) {
      if (handle === 'best-seller') bestSeller.add(product.id)
      if (seen.has(product.id)) continue
      seen.add(product.id)
      products.push(product)
    }
  }
  const eligible = []
  for (const [index, product] of products.entries()) {
    if (!product?.title || excluded(product) || hidesLetterVariants(product)) continue
    const { price } = listedPrice(product)
    if (!(price >= MIN_PKR && price <= MAX_PKR)) continue
    const item = build(product, index, rate, bestSeller)
    if (!skuOk(item)) continue
    eligible.push(item)
  }
  const chosen = pick(eligible)
  console.log(`PKR per USD: ${rate}`)
  console.log(`eligible ${eligible.length} selected ${chosen.length}`)
  const tally = {}
  for (const item of chosen) tally[item.bucket] = (tally[item.bucket] || 0) + 1
  console.log(tally)
  if (chosen.length < TARGET) throw new Error(`Only ${chosen.length} jewelry pieces in the price band`)

  const ids = new Set()
  for (const product of chosen) {
    let id = product.id
    while (ids.has(id)) id = `${id.slice(0, 42)}-${ids.size.toString(36)}`
    product.id = id
    ids.add(id)
    if (!skuOk(product)) throw new Error(`SKU too long after rename ${id}`)
  }

  if (process.argv.includes('--count')) {
    for (const item of chosen) {
      console.log(`${item.available ? 'in' : 'out'}\t${item.bucket}\t${item.sourcePkr}\t$${item.priceCents / 100}\t${item.variant}\timg ${item.imageCount}\t${item.name}`)
      console.log(`  ${item.description}`)
    }
    return
  }

  const srcDir = path.join(root, 'assets-src', 'generated')
  fs.mkdirSync(srcDir, { recursive: true })
  await mapPool(chosen, 3, async (product) => {
    const used = new Set()
    for (const color of product.colors) {
      const keys = []
      for (let i = 0; i < color.images.length; i++) {
        let key = `${product.id}-${color.slug}-${i + 1}`
        while (used.has(key)) key = `${key}-b`
        used.add(key)
        const file = path.join(srcDir, `${key}.png`)
        if (!fs.existsSync(file)) {
          try {
            const bytes = await get(downloadSrc(color.images[i]), { maxBytes: 12_000_000, timeoutMs: 30000 })
            const fitted = await sharp(bytes)
              .rotate()
              .resize(1200, 1200, { fit: 'contain', background: { r: 244, g: 241, b: 234, alpha: 1 } })
              .png({ compressionLevel: 9 })
              .toBuffer()
            fs.writeFileSync(file, fitted)
            console.log(`image ${key} ${Math.round(fitted.length / 1024)} KB`)
          } catch (error) {
            console.log(`skip ${key} ${error.message}`)
            continue
          }
        }
        keys.push(key)
      }
      color.imageKeys = keys
    }
  })

  for (const product of chosen) {
    product.colors = product.colors.filter((color) => color.imageKeys.length)
    if (!product.colors.length) throw new Error(`no images for ${product.name}`)
  }

  const manifestPath = path.join(root, 'src', 'data', 'imageManifest.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const outDir = path.join(root, 'public', 'images', 'products')
  fs.mkdirSync(outDir, { recursive: true })
  await mapPool(
    chosen.flatMap((product) => product.colors.flatMap((color) => color.imageKeys)),
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
  fs.writeFileSync(path.join(root, 'src', 'catalog', 'meerzahJewelry.ts'), render(chosen, rate))
  console.log(`wrote ${chosen.length} jewelry products`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
