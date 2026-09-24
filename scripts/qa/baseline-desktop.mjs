import { chromium } from 'playwright'

const url = process.argv[2] ?? 'https://core-seven-henna.vercel.app'
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
await page.goto(url, { waitUntil: 'networkidle' })
for (const t of [2000, 6000]) {
  await page.waitForTimeout(t)
  await page.screenshot({ path: `docs/screenshots/baseline/home-1440-after-${t}ms.png` })
}
const info = await page.evaluate(() => ({
  h1s: [...document.querySelectorAll('h1')].map((h) => h.textContent),
  links: [...document.querySelectorAll('a')].map((a) => `${a.textContent?.trim()} -> ${a.getAttribute('href')}`),
  rootChildren: document.getElementById('root')?.children.length,
  title: document.title,
}))
await page.mouse.wheel(0, 2500)
await page.waitForTimeout(1500)
await page.screenshot({ path: 'docs/screenshots/baseline/home-1440-scrolled.png' })
console.log(JSON.stringify({ errors, ...info }, null, 2))
await browser.close()
