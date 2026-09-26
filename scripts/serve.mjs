/**
 * Serves the production build the way Vercel does (cleanUrls, real 404 status, /api handlers),
 * so QA and performance checks run against the prerendered output. Usage: npm run serve [-- --port 4173]
 */
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createGzip } from 'node:zlib'
import { createServer as createVite } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const portArg = process.argv.indexOf('--port')
const port = Number(portArg > -1 ? process.argv[portArg + 1] : process.env.PORT || 4173)

const vite = await createVite({ root, server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
const { createApiMiddleware } = await vite.ssrLoadModule('/vite.config.ts')
const api = createApiMiddleware((id) => vite.ssrLoadModule(id))

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
}

async function isFile(p) {
  try {
    return (await stat(p)).isFile()
  } catch {
    return false
  }
}

async function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath).replace(/\/+$/, '') || '/'
  const safe = path.normalize(clean).replace(/^(\.\.[/\\])+/, '')
  const base = path.join(dist, safe)
  if (!base.startsWith(dist)) return null
  if (clean === '/') return path.join(dist, 'index.html')
  if (clean.endsWith('.html')) return null // cleanUrls: .html URLs are not served directly
  if (await isFile(base)) return base
  if (await isFile(`${base}.html`)) return `${base}.html`
  return null
}

const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json', '.xml', '.txt', '.svg', '.webmanifest'])

/** Mirrors the Cache-Control rules in vercel.json. */
function cacheControl(urlPath) {
  if (urlPath.startsWith('/assets/')) return 'public, max-age=31536000, immutable'
  if (/^\/(images|media|campaign|og)\//.test(urlPath)) return 'public, max-age=2592000, stale-while-revalidate=31536000'
  if (urlPath === '/favicon.svg' || urlPath === '/og-default.jpg') return 'public, max-age=86400, stale-while-revalidate=604800'
  return 'no-cache'
}

/** Mirrors the X-Robots-Tag rules in vercel.json. */
const FACET_KEYS = ['q', 'color', 'size', 'width', 'price', 'availability', 'sort', 'category', 'use', 'trait', 'page']
function robotsHeader(url) {
  if (/^\/(cart|wishlist|search|checkout\/success)$/.test(url.pathname)) return 'noindex, follow'
  if (url.pathname.startsWith('/api/')) return 'noindex'
  if (/^\/(shop|collections\/.+)$/.test(url.pathname) && FACET_KEYS.some((k) => url.searchParams.has(k))) return 'noindex, follow'
  return undefined
}

function send(req, res, file, status = 200) {
  const ext = path.extname(file)
  const gzip = COMPRESSIBLE.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '')
  const url = new URL(req.url ?? '/', 'http://localhost')
  const robots = robotsHeader(url)
  res.writeHead(status, {
    'Content-Type': TYPES[ext] ?? 'application/octet-stream',
    'Cache-Control': status === 200 ? cacheControl(url.pathname) : 'no-cache',
    Vary: 'Accept-Encoding',
    ...(robots ? { 'X-Robots-Tag': robots } : {}),
    ...(gzip ? { 'Content-Encoding': 'gzip' } : {}),
  })
  const stream = createReadStream(file)
  if (gzip) stream.pipe(createGzip()).pipe(res)
  else stream.pipe(res)
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    if (url.pathname !== '/' && url.pathname.endsWith('/')) {
      res.writeHead(301, { Location: url.pathname.replace(/\/+$/, '') + url.search })
      return res.end()
    }
    if (url.pathname.endsWith('.html')) {
      const dest = (url.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '') || '/') + url.search
      res.writeHead(301, { Location: dest })
      return res.end()
    }
    if (url.pathname.startsWith('/api/')) {
      return api(req, res, () => {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end('{"error":"Not found"}')
      })
    }
    const file = await resolveFile(url.pathname)
    if (file) return send(req, res, file)
    send(req, res, path.join(dist, '404.html'), 404)
  })
  .listen(port, () => console.log(`NOVA production build: http://localhost:${port}`))
