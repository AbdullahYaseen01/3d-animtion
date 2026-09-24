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

function send(req, res, file, status = 200) {
  const ext = path.extname(file)
  const gzip = COMPRESSIBLE.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '')
  res.writeHead(status, {
    'Content-Type': TYPES[ext] ?? 'application/octet-stream',
    'Cache-Control': file.includes(`${path.sep}assets${path.sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache',
    Vary: 'Accept-Encoding',
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
      res.writeHead(308, { Location: url.pathname.replace(/\/+$/, '') + url.search })
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
