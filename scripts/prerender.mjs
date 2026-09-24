/**
 * Static prerender: renders every route to HTML after `vite build` + SSR build.
 * Output files follow Vercel `cleanUrls`: /shop -> dist/shop.html, / -> dist/index.html.
 */
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const ssrDir = path.join(root, 'dist-ssr')

const siteUrl = (process.env.VITE_SITE_URL || 'https://core-seven-henna.vercel.app').replace(/\/$/, '')
const override = process.env.ALLOW_INDEXING
const allowIndexing = override ? override === 'true' : process.env.VERCEL_ENV === 'production'

const { render, prerenderRoutes } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href)
const template = await readFile(path.join(dist, 'index.html'), 'utf8')

// Preload the Latin subsets of both variable fonts so text renders in the right face on first paint.
const assets = await readdir(path.join(dist, 'assets'))
const fontPreloads = assets
  .filter((f) => /^(big-shoulders-display|instrument-sans)-latin-wght-normal-.*\.woff2$/.test(f))
  .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin>`)
  .join('\n    ')

function page(url) {
  const { html, head } = render(url)
  if (!head) throw new Error(`No <Seo> head rendered for ${url}`)
  return template.replace('<!--app-head-->', [fontPreloads, head].filter(Boolean).join('\n    ')).replace('<!--app-html-->', html)
}

function outFile(route) {
  return route === '/' ? path.join(dist, 'index.html') : path.join(dist, `${route.slice(1)}.html`)
}

const routes = prerenderRoutes()
for (const { path: route } of routes) {
  const file = outFile(route)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, page(route))
}
await writeFile(path.join(dist, '404.html'), page('/__not-found__'))

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .filter((r) => r.sitemap)
  .map((r) => `  <url><loc>${siteUrl}${r.path === '/' ? '/' : r.path}</loc></url>`)
  .join('\n')}
</urlset>
`
await writeFile(path.join(dist, 'sitemap.xml'), sitemap)

const robots = allowIndexing
  ? `User-agent: *
Disallow: /cart
Disallow: /checkout
Disallow: /search
Disallow: /wishlist
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml
`
  : `# Non-production build: keep out of search engines.
User-agent: *
Disallow: /
`
await writeFile(path.join(dist, 'robots.txt'), robots)
await rm(ssrDir, { recursive: true, force: true })

console.log(`Prerendered ${routes.length} routes + 404 (indexing ${allowIndexing ? 'ENABLED' : 'disabled'}, site ${siteUrl})`)
