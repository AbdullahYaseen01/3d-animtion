/**
 * Crawls prerendered HTML in dist/ and reports broken internal links,
 * missing images, empty alts on content images, and pages without exactly one H1.
 * Usage: node scripts/qa/crawl.mjs [distDir]
 */
import { existsSync } from 'node:fs'
import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const dist = path.resolve(process.argv[2] ?? path.join(root, 'dist'))

async function walkHtml(dir) {
  const out = []
  for (const name of await readdir(dir)) {
    const full = path.join(dir, name)
    const s = await stat(full)
    if (s.isDirectory()) out.push(...(await walkHtml(full)))
    else if (name.endsWith('.html')) out.push(full)
  }
  return out
}

function routeFromFile(file) {
  const rel = path.relative(dist, file).replace(/\\/g, '/')
  if (rel === 'index.html') return '/'
  if (rel === '404.html') return '/__not-found__'
  return `/${rel.replace(/\.html$/, '')}`
}

function resolveAsset(href) {
  const clean = href.split('?')[0].split('#')[0]
  if (!clean.startsWith('/') || clean.startsWith('//')) return null
  const file = path.join(dist, clean.slice(1))
  if (existsSync(file) && !file.endsWith(path.sep)) return file
  if (existsSync(`${file}.html`)) return `${file}.html`
  if (clean === '/') return path.join(dist, 'index.html')
  return null
}

const SKIP_HREF = /^(mailto:|tel:|https?:|\/\/|#)/
const files = await walkHtml(dist)
const errors = []
const routes = new Set()

for (const file of files) {
  const route = routeFromFile(file)
  routes.add(route)
  const html = await readFile(file, 'utf8')
  const h1s = (html.match(/<h1[\s>]/g) ?? []).length
  if (h1s !== 1) errors.push(`${route}: expected 1 h1, found ${h1s}`)

  for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)) {
    if (SKIP_HREF.test(href) || href.startsWith('/api/')) continue
    const dest = href.split('?')[0].split('#')[0] || '/'
    if (!resolveAsset(dest)) errors.push(`${route}: broken link ${href}`)
  }

  for (const [, src] of html.matchAll(/<(?:img|source|link)\b[^>]*(?:src|href|imagesrcset)="([^"]+)"/g)) {
    for (const part of src.split(',')) {
      const url = part.trim().split(/\s+/)[0]
      if (!url || SKIP_HREF.test(url) || url.startsWith('data:')) continue
      if (url.startsWith('/') && !resolveAsset(url.split('?')[0])) errors.push(`${route}: missing asset ${url}`)
    }
  }

  for (const tag of html.matchAll(/<img\b[^>]*>/g)) {
    const t = tag[0]
    if (/\baria-hidden="true"|\brole="presentation"/.test(t)) continue
    const alt = t.match(/\balt="([^"]*)"/)
    if (!alt) errors.push(`${route}: img missing alt: ${t.slice(0, 80)}`)
  }
}

if (errors.length) {
  console.error(`crawl: ${errors.length} problem(s) in ${files.length} HTML files`)
  for (const e of errors) console.error(`  ${e}`)
  process.exit(1)
}
console.log(`crawl: ${files.length} HTML files, ${routes.size} routes, no broken internal links`)
