/** Smoke-checks status codes, redirects and robots headers on the served build. */
import { readdirSync } from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const base = new URL(process.argv[2] ?? 'http://127.0.0.1:4190')

const checks = [
  ['/', 200],
  ['/shop', 200],
  ['/collections/shoes', 200],
  ['/products/stride-runner', 200],
  ['/guides/standard-vs-wide-shoes', 200],
  ['/faq', 200],
  ['/privacy', 200],
  ['/not-a-page', 404],
  ['/products/not-a-shoe', 404],
  ['/collections/sandals', 404],
]
const redirects = [
  ['/shop/', 301, '/shop'],
  ['/shop.html', 301, '/shop'],
  ['/index.html', 301, '/'],
]

function probe(path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: base.hostname,
        port: base.port || 80,
        path,
        method: 'GET',
        headers: { Host: base.host, 'Accept-Encoding': 'gzip' },
      },
      (res) => {
        res.resume()
        resolve({
          status: res.statusCode,
          loc: res.headers.location,
          robots: res.headers['x-robots-tag'],
          cache: res.headers['cache-control'],
          type: res.headers['content-type'],
        })
      },
    )
    req.on('error', reject)
    req.end()
  })
}

let failed = 0
for (const [p, exp] of checks) {
  const r = await probe(p)
  const ok = r.status === exp
  if (!ok) failed++
  console.log(`${ok ? 'OK' : 'FAIL'} ${p} ${r.status} expected ${exp} ${r.robots ?? ''} ${r.type ?? ''}`)
}
for (const [p, exp, dest] of redirects) {
  const r = await probe(p)
  const ok = r.status === exp && (r.loc === dest || r.loc?.endsWith(dest))
  if (!ok) failed++
  console.log(`${ok ? 'OK' : 'FAIL'} ${p} ${r.status} -> ${r.loc} expected ${exp} ${dest}`)
}
const facet = await probe('/shop?color=black')
const facetOk = String(facet.robots ?? '').includes('noindex')
if (!facetOk) failed++
console.log(`${facetOk ? 'OK' : 'FAIL'} facet robots ${facet.robots}`)

const assetsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../dist/assets')
const css = readdirSync(assetsDir).find((f) => f.startsWith('style-') && f.endsWith('.css'))
const asset = await probe(`/assets/${css}`)
console.log(`asset ${asset.status} cache ${asset.cache}`)
const hero = await probe('/campaign/hero-style-in-motion-1600.avif')
console.log(`hero ${hero.status} ${hero.type} ${hero.cache}`)

if (failed) {
  console.error(`http-checks: ${failed} failed`)
  process.exit(1)
}
console.log('http-checks: all passed')
