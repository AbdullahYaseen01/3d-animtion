/**
 * Static prerender: renders every route to HTML after `vite build` + SSR build.
 * Output files follow Vercel `cleanUrls`: /shop -> dist/shop.html, / -> dist/index.html.
 */
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { loadEnv } from 'vite'
import { buildRobots, buildSitemap, xml } from './seo-files.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const ssrDir = path.join(root, 'dist-ssr')

// Same .env resolution as vite.config.ts, so the sitemap origin matches the canonicals in the SSR bundle.
for (const [k, v] of Object.entries(loadEnv('production', root, ''))) if (process.env[k] === undefined) process.env[k] = v

const siteUrl = (process.env.VITE_SITE_URL || 'https://core-seven-henna.vercel.app').replace(/\/$/, '')
const override = process.env.ALLOW_INDEXING
const allowIndexing = override ? override === 'true' : process.env.VERCEL_ENV === 'production'

const { render, prerenderRoutes, preloadAllPages, pageSource } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href)
await preloadAllPages()
// Vite appends the stylesheet after the entry script. It is the only render-blocking
// resource, so request it first, ahead of the image, font and module preloads.
const rawTemplate = await readFile(path.join(dist, 'index.html'), 'utf8')
const stylesheet = rawTemplate.match(/\s*<link rel="stylesheet"[^>]*>/)?.[0] ?? ''
const template = rawTemplate.replace(stylesheet, '').replace('<!--app-head-->', `${stylesheet.trim()}\n    <!--app-head-->`)

// Each page is its own chunk. Hint the current page's chunks so they download in
// parallel with the entry script instead of after it.
const manifestPath = path.join(dist, '.vite', 'manifest.json')
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
const entryFile = Object.values(manifest).find((m) => m.isEntry)?.file
function chunkFiles(key, seen = new Set()) {
  const m = manifest[key]
  if (!m || seen.has(m.file)) return seen
  seen.add(m.file)
  for (const dep of m.imports ?? []) chunkFiles(dep, seen)
  return seen
}
const alreadyLinked = new Set([...template.matchAll(/<link rel="modulepreload"[^>]*href="\/([^"]+)"/g)].map((m) => m[1]))
function modulePreloads(url) {
  return [...chunkFiles(pageSource(url))]
    .filter((f) => f !== entryFile && !alreadyLinked.has(f))
    // Quick shop and the size helper are below the fold; let the LCP image win the first round trip.
    .filter((f) => !/QuickShop|sizing-/.test(f))
    .map((f) => `<link rel="modulepreload" crossorigin href="/${f}">`)
    .join('\n    ')
}

// Preload the Latin subsets of both variable fonts so text renders in the right face on first paint.
const assets = await readdir(path.join(dist, 'assets'))
const fontPreloads = assets
  .filter((f) => /^(big-shoulders-display|instrument-sans)-latin-wght-normal-.*\.woff2$/.test(f))
  .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin>`)
  .join('\n    ')
// Search Console HTML-tag verification. Only the token goes in the env var, never a full tag.
const gscToken = (process.env.VITE_GSC_VERIFICATION || '').trim()
const verification = gscToken ? `<meta name="google-site-verification" content="${xml(gscToken)}">` : ''

function page(url) {
  const { html, head } = render(url)
  if (!head) throw new Error(`No <Seo> head rendered for ${url}`)
  // The LCP image preload (if any) goes first so it is requested ahead of the font preloads.
  const [preloads, rest] = splitPreloads(head)
  return template
    .replace('<!--app-head-->', [preloads, fontPreloads, modulePreloads(url), verification, rest].filter(Boolean).join('\n    '))
    .replace('<!--app-html-->', html)
}

function splitPreloads(head) {
  const lines = head.split('\n    ')
  const isPreload = (l) => l.startsWith('<link rel="preload"')
  return [lines.filter(isPreload).join('\n    '), lines.filter((l) => !isPreload(l)).join('\n    ')]
}

function outFile(route) {
  return route === '/' ? path.join(dist, 'index.html') : path.join(dist, `${route.slice(1)}.html`)
}

const routes = prerenderRoutes()
for (const { path: route, sitemap } of routes) {
  const file = outFile(route)
  const htmlOut = page(route)
  // With indexing on, every sitemap URL must be indexable and canonical to itself.
  if (allowIndexing && sitemap) {
    if (htmlOut.includes('content="noindex')) throw new Error(`Sitemap route ${route} renders noindex`)
    if (!htmlOut.includes(`<link rel="canonical" href="${siteUrl}${route}"`)) throw new Error(`Sitemap route ${route} has a different canonical`)
  }
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, htmlOut)
}
await writeFile(path.join(dist, '404.html'), page('/__not-found__'))

await writeFile(path.join(dist, 'sitemap.xml'), buildSitemap(routes, siteUrl))
await writeFile(path.join(dist, 'robots.txt'), buildRobots(allowIndexing, siteUrl))
await rm(ssrDir, { recursive: true, force: true })
await rm(path.join(dist, '.vite'), { recursive: true, force: true })

console.log(`Prerendered ${routes.length} routes + 404 (indexing ${allowIndexing ? 'ENABLED' : 'disabled'}, site ${siteUrl})`)
