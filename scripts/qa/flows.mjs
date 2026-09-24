/**
 * End-to-end checks of the shopping journey against a running build (npm run serve).
 * Usage: node scripts/qa/flows.mjs [baseUrl]
 */
import { chromium } from 'playwright'

const base = process.argv[2] || 'http://localhost:4173'
const browser = await chromium.launch({ channel: 'chrome' })
const results = []
const errors = []

async function check(name, fn, viewport = { width: 1280, height: 900 }) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error' && !/status of (404|503)/.test(m.text())) errors.push(`${name}: ${m.text()}`)
  })
  try {
    await fn(page)
    results.push({ name, ok: true })
  } catch (e) {
    results.push({ name, ok: false, error: e.message.split('\n')[0] })
  }
  await context.close()
}

const cartLines = async (page) => JSON.parse((await page.evaluate(() => localStorage.getItem('nova:cart:v1'))) ?? '{"lines":[]}').lines

const assert = (cond, msg) => {
  if (!cond) throw new Error(msg)
}

await check('PDP: add to cart without size is blocked and focuses sizes', async (page) => {
  await page.goto(`${base}/products/stride-runner`)
  await page.getByRole('button', { name: /add to cart/i }).first().click()
  const alert = page.getByText(/select a size/i).first()
  await alert.waitFor({ timeout: 3000 })
  const inSizes = await page.evaluate(() => !!document.activeElement?.closest('fieldset'))
  assert(inSizes, 'focus did not move into the size fieldset')
  assert((await cartLines(page)).length === 0, 'item was added without a size')
})

await check('PDP: select size, add, mini-cart opens; Escape returns focus', async (page) => {
  await page.goto(`${base}/products/stride-runner`)
  await page.getByRole('radio', { name: "US men's 10.5", exact: true }).check({ force: true })
  const add = page.getByRole('button', { name: /add to cart/i }).first()
  await add.click()
  const dialog = page.locator('dialog[open]')
  await dialog.waitFor({ timeout: 3000 })
  assert(/stride runner/i.test(await dialog.innerText()), 'mini-cart does not show the item')
  assert(/10\.5/.test(await dialog.innerText()), 'mini-cart does not show the size')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
  assert((await page.locator('dialog[open]').count()) === 0, 'dialog did not close')
  const focused = await page.evaluate(() => document.activeElement?.textContent ?? '')
  assert(/add to cart|added/i.test(focused), `focus not restored (got "${focused.slice(0, 40)}")`)
  const stored = await cartLines(page)
  assert(stored[0].sku === 'stride-runner:chalk-ember:10.5:D', `stored ${JSON.stringify(stored)}`)
})

await check('Cart: persists, updates quantity, checkout reports missing config honestly', async (page) => {
  await page.goto(`${base}/`)
  await page.waitForTimeout(800)
  await page.evaluate(() => localStorage.setItem('nova:cart:v1', JSON.stringify({ lines: [{ sku: 'court-low:black:9:D', quantity: 1 }] })))
  await page.goto(`${base}/cart`)
  await page.getByText('Court Low').first().waitFor()
  await page.getByRole('button', { name: /increase/i }).first().click()
  await page.waitForTimeout(200)
  assert(/\$250/.test(await page.locator('.cart-page__summary').innerText()), 'subtotal did not update to $250')
  await page.getByRole('button', { name: /checkout/i }).first().click()
  const msg = page.getByText(/not configured|try again later|contact us to order/i).first()
  await msg.waitFor({ timeout: 5000 })
  assert(page.url().includes('/cart'), 'navigated away despite no payment provider')
})

await check('Cart: sold-out items are removed with a notice', async (page) => {
  await page.goto(`${base}/`)
  await page.waitForTimeout(800)
  await page.evaluate(() => localStorage.setItem('nova:cart:v1', JSON.stringify({ lines: [{ sku: 'stride-runner:carbon:7:D', quantity: 1 }] })))
  await page.goto(`${base}/cart`)
  await page.getByText(/sold out and was removed/i).waitFor({ timeout: 3000 })
})

await check('Cart: canceled checkout shows recovery message', async (page) => {
  await page.goto(`${base}/cart?checkout=canceled`)
  await page.getByText(/checkout was canceled/i).waitFor({ timeout: 3000 })
})

await check('Shop: filter updates URL and count; back restores', async (page) => {
  await page.goto(`${base}/shop`)
  const before = await page.getByText(/\d+ styles?/).first().innerText()
  await page.locator('aside').getByLabel(/^Trail/).first().check()
  await page.waitForURL(/category=trail/)
  const after = await page.getByText(/\d+ styles?/).first().innerText()
  assert(before !== after, `count unchanged (${before})`)
  await page.goBack()
  await page.waitForURL((u) => !u.search.includes('category'))
  assert((await page.getByText(/\d+ styles?/).first().innerText()) === before, 'back did not restore results')
  await page.goForward()
  await page.waitForURL(/category=trail/)
})

await check('Shop: deep-linked filter URL renders filtered results', async (page) => {
  await page.goto(`${base}/shop?category=lifestyle&sort=price-desc`)
  const names = await page.locator('.product-card__name').allInnerTexts()
  assert(names.length === 2 && /arc high/i.test(names[0]), `got ${names.join(', ')}`)
  const robots = await page.locator('meta[name="robots"]').getAttribute('content')
  assert(/noindex/.test(robots), 'filtered page not noindex')
})

await check('Quick shop requires a size before adding', async (page) => {
  await page.goto(`${base}/shop`)
  await page.getByRole('button', { name: /quick shop/i }).first().click()
  const dialog = page.locator('dialog[open]')
  await dialog.waitFor()
  await dialog.getByRole('button', { name: /add to cart/i }).click()
  await dialog.getByText(/select a size/i).first().waitFor({ timeout: 3000 })
  assert((await cartLines(page)).length === 0, 'quick shop added without size')
})

await check('Search finds trail shoes via synonym', async (page) => {
  await page.goto(`${base}/search?q=hiking`)
  await page.getByText('Ridge Trail').first().waitFor({ timeout: 3000 })
})

await check('Newsletter shows service error, never fake success', async (page) => {
  await page.goto(`${base}/`)
  const form = page.locator('footer form').first()
  await form.getByPlaceholder(/email/i).fill('test@example.com')
  await form.getByRole('checkbox').check()
  await form.getByRole('button', { name: /join/i }).click()
  await page.getByText(/not available yet/i).first().waitFor({ timeout: 5000 })
  assert(!(await page.getByText(/on the list/i).count()), 'success shown without a real subscription')
})

await check('Checkout success without session does not claim payment', async (page) => {
  await page.goto(`${base}/checkout/success`)
  await page.getByText(/could not find that order/i).waitFor({ timeout: 3000 })
  await page.goto(`${base}/checkout/success?session_id=cs_test_aaaaaaaaaaaaaaaaaaaa`)
  await page.getByText(/unavailable|could not/i).first().waitFor({ timeout: 8000 })
  assert(!(await page.getByText(/thank you/i).count()), 'showed a thank-you without a verified payment')
})

await check('Legacy #showcase anchor redirects to /shop', async (page) => {
  await page.goto(`${base}/#showcase`)
  await page.waitForURL(/\/shop$/, { timeout: 3000 })
})

await check('Keyboard: first Tab reaches the skip link', async (page) => {
  await page.goto(`${base}/`)
  await page.keyboard.press('Tab')
  const text = await page.evaluate(() => document.activeElement?.textContent)
  assert(/skip to content/i.test(text ?? ''), `first focus was "${text}"`)
})

await check(
  'Mobile: menu drawer opens and closes',
  async (page) => {
    await page.goto(`${base}/`)
    await page.getByRole('button', { name: /menu/i }).first().click()
    await page.locator('dialog[open]').waitFor()
    await page.locator('dialog[open]').getByRole('link', { name: /trail/i }).first().click()
    await page.waitForURL(/collections\/trail/)
    await page.waitForTimeout(400)
    const onMain = await page.evaluate(() => document.activeElement?.id === 'main')
    assert(onMain, 'focus did not move to main content after navigation')
    assert((await page.locator('dialog[open]').count()) === 0, 'drawer stayed open after navigation')
  },
  { width: 390, height: 812 },
)

await check(
  'Mobile PDP: purchase bar hidden at top, shown after scrolling past Add to cart',
  async (page) => {
    await page.goto(`${base}/products/ridge-trail`)
    const visible = () => page.evaluate(() => document.querySelector('.buy-bar')?.classList.contains('is-visible'))
    assert(!(await visible()), 'bar visible at top')
    await page.evaluate(() => window.scrollTo(0, 2400))
    await page.waitForTimeout(300)
    assert(await visible(), 'bar not visible after scrolling')
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(300)
    assert(!(await visible()), 'bar still visible after jumping back to top')
  },
  { width: 390, height: 812 },
)

await browser.close()
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.error ? `\n      ${r.error}` : ''}`)
if (errors.length) console.log('\nConsole/page errors:\n' + [...new Set(errors)].join('\n'))
process.exitCode = results.every((r) => r.ok) && !errors.length ? 0 : 1
