/**
 * Checks that prerendered pages hydrate in place: no React hydration errors and
 * no prerendered DOM thrown away, then that client-side navigation still renders.
 * Usage: node scripts/qa/hydration.mjs [baseUrl]   (default http://127.0.0.1:4173)
 */
import { chromium } from 'playwright'

const base = (process.argv[2] ?? 'http://127.0.0.1:4173').replace(/\/$/, '')
const paths = ['/', '/shop', '/collections/shoes', '/collections/running', '/products/stride-runner', '/products/line-watch', '/guides', '/guides/standard-vs-wide-shoes', '/faq', '/fit-guide', '/cart', '/not-a-page']

const browser = await chromium.launch({ channel: 'chrome' })
const failures = []

for (const p of paths) {
  const page = await browser.newPage()
  const errors = []
  page.on('console', (m) => {
    if (m.type() === 'error' && /hydrat|#418|#423|#425|did not match/i.test(m.text())) errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(e.message))
  await page.addInitScript(() => {
    window.__replaced = 0
    new MutationObserver((records) => {
      const root = document.getElementById('root')
      for (const r of records) if (r.target === root && r.removedNodes.length) window.__replaced += r.removedNodes.length
    }).observe(document, { childList: true, subtree: true })
  })
  await page.goto(base + p, { waitUntil: 'networkidle' })
  const replaced = await page.evaluate(() => window.__replaced)
  const h1 = await page.locator('h1').count()
  if (errors.length || replaced || h1 !== 1) failures.push({ path: p, errors, replacedRootChildren: replaced, h1 })
  await page.close()
}

// Client-side navigation from the homepage into a product and a guide.
const page = await browser.newPage()
await page.goto(base + '/', { waitUntil: 'networkidle' })
await page.locator('a[href="/products/stride-runner"]').first().click()
// The previous page stays up (a transition) until the next page's chunk arrives, so wait for the heading.
const headingFor = async (re) => {
  await page.waitForFunction((src) => new RegExp(src, 'i').test(document.querySelector('h1')?.textContent ?? ''), re.source, { timeout: 15000 }).catch(() => {})
  return page.locator('h1').innerText()
}
await page.waitForURL('**/products/stride-runner')
const productH1 = await headingFor(/stride runner/)
await page.goto(base + '/collections/watches', { waitUntil: 'networkidle' })
await page.locator('a[href="/guides/watch-case-size-and-strap-fit"]').first().click()
await page.waitForURL('**/guides/watch-case-size-and-strap-fit')
const guideH1 = await headingFor(/watch case size/)
if (!/stride runner/i.test(productH1)) failures.push({ path: 'nav → product', h1: productH1 })
if (!/watch case size/i.test(guideH1)) failures.push({ path: 'nav → guide', h1: guideH1 })
await browser.close()

console.log(JSON.stringify({ checked: paths.length, navigation: { productH1, guideH1 }, failures }, null, 2))
if (failures.length) process.exit(1)
