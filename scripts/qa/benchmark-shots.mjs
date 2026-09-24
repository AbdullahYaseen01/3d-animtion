import { chromium } from 'playwright'
import fs from 'node:fs'

const targets = [
  ['nike-men', 'https://www.nike.com/men'],
  ['on-home', 'https://www.on.com/en-us/'],
  ['on-cloud6', 'https://www.on.com/en-us/products/cloud-6-m-3md3009/mens/black-white-shoes-3MD30091634'],
  ['hoka-home', 'https://www.hoka.com/en/us/'],
  ['allbirds-home', 'https://www.allbirds.com/'],
  ['zappos-sneakers', 'https://www.zappos.com/men-sneakers-athletic-shoes/CK_XARC81wHAAQHiAgMBAhg.zso'],
]
fs.mkdirSync('docs/research/shots', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const log = []
for (const [name, url] of targets) {
  for (const width of [390, 1440]) {
    const ctx = await browser.newContext({
      viewport: { width, height: width < 768 ? 844 : 900 },
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      locale: 'en-US',
    })
    const page = await ctx.newPage()
    try {
      const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
      await page.waitForTimeout(5000)
      await page.screenshot({ path: `docs/research/shots/${name}-${width}.png` })
      log.push({ name, width, status: res?.status(), title: await page.title() })
    } catch (e) {
      log.push({ name, width, error: String(e).slice(0, 120) })
    }
    await ctx.close()
  }
}
await browser.close()
console.log(JSON.stringify(log, null, 2))
