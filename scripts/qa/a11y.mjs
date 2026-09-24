/**
 * Runs axe-core (WCAG 2.0/2.1/2.2 A + AA rules) on each route at mobile and desktop widths.
 * Automated checks catch only part of WCAG; keyboard and screen-reader review is still required.
 * Usage: node scripts/qa/a11y.mjs [baseUrl]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { chromium } from 'playwright'

const require = createRequire(import.meta.url)
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')
const base = process.argv[2] || 'http://localhost:4173'
const routes = [
  '/', '/shop', '/collections/trail', '/search?q=leather', '/products/stride-runner', '/products/arc-high',
  '/cart', '/wishlist', '/checkout/success', '/about', '/fit-guide', '/shipping', '/returns', '/faq',
  '/contact', '/privacy', '/terms', '/guides', '/guides/how-to-measure-your-feet', '/missing-page',
]

const browser = await chromium.launch({ channel: 'chrome' })
const summary = []
for (const width of [390, 1280]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } })
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: 'networkidle' })
    await page.addScriptTag({ content: axeSource })
    const res = await page.evaluate(async () =>
      axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } }),
    )
    for (const v of res.violations) {
      summary.push({ width, route, id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) })
    }
  }
  await page.close()
}
await browser.close()
mkdirSync('docs/qa', { recursive: true })
writeFileSync('docs/qa/axe-report.json', JSON.stringify({ base, routes, widths: [390, 1280], violations: summary }, null, 2))
if (!summary.length) console.log(`axe: 0 violations across ${routes.length} routes x 2 widths`)
else for (const s of summary) console.log(`${s.width} ${s.route} [${s.impact}] ${s.id}: ${s.help}\n    ${s.nodes.join('\n    ')}`)
