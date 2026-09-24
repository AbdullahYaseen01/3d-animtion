/** Lists elements that extend past the viewport. Usage: node scripts/qa/overflow.mjs <url> [width] */
import { chromium } from 'playwright'

const [url = 'http://localhost:4173/', width = '390'] = process.argv.slice(2)
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: Number(width), height: 800 } })
await page.goto(url, { waitUntil: 'networkidle' })
const offenders = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth
  const out = []
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect()
    if (r.width && r.right > vw + 0.5) {
      out.push({
        el: `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`,
        parent: `${el.parentElement?.tagName.toLowerCase()}.${[...(el.parentElement?.classList ?? [])].join('.')}`,
        text: el.textContent?.trim().slice(0, 40),
        right: Math.round(r.right),
        width: Math.round(r.width),
      })
    }
  }
  return { vw, scroll: document.documentElement.scrollWidth, offenders: out.slice(0, 25) }
})
console.log(JSON.stringify(offenders, null, 1))
await browser.close()
