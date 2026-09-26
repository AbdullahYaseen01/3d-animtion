/**
 * Loads key routes at several viewports and reports failed requests,
 * page errors, and horizontal page overflow (document scrollWidth > viewport).
 * Usage: node scripts/qa/viewports.mjs [baseUrl]
 */
import { chromium } from 'playwright'

const base = (process.argv[2] ?? 'http://127.0.0.1:4190').replace(/\/$/, '')
const widths = [375, 390, 768, 1440, 1920]
const paths = ['/', '/shop', '/collections/shoes', '/products/stride-runner', '/guides', '/faq', '/cart']

const browser = await chromium.launch({ channel: 'chrome' })
const failures = []

for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: width < 800 ? 844 : 900 } })
  const failed = []
  const pageErrors = []
  page.on('requestfailed', (r) => failed.push(`${r.method()} ${r.url()} ${r.failure()?.errorText}`))
  page.on('pageerror', (e) => pageErrors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error' && /hydrat|#418|#423|#425|did not match/i.test(m.text())) pageErrors.push(m.text())
  })
  for (const p of paths) {
    await page.goto(base + p, { waitUntil: 'networkidle', timeout: 60000 })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    const h1 = await page.locator('h1').count()
    if (overflow > 1) failures.push({ width, path: p, overflow })
    if (h1 !== 1) failures.push({ width, path: p, h1 })
    if (failed.length) failures.push({ width, path: p, failed: [...failed] })
    if (pageErrors.length) failures.push({ width, path: p, pageErrors: [...pageErrors] })
    failed.length = 0
    pageErrors.length = 0
  }
  await page.close()
}

await browser.close()
if (failures.length) {
  console.error(JSON.stringify({ failures }, null, 2))
  process.exit(1)
}
console.log(JSON.stringify({ widths, paths, failures: [] }, null, 2))
