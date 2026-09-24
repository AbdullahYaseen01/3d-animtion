/**
 * Captures full-page screenshots of a list of paths at several viewport widths.
 * Usage: node scripts/qa/screenshots.mjs <baseUrl> <outDir> [path1,path2,...] [width1,width2,...]
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const [baseUrl = 'http://localhost:4173', outDir = 'docs/screenshots/current', pathsArg = '/', widthsArg = '375,1440'] =
  process.argv.slice(2)
const paths = pathsArg.split(',')
const widths = widthsArg.split(',').map(Number)

fs.mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
const report = []

for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: width < 768 ? 812 : 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

  for (const p of paths) {
    const url = new URL(p, baseUrl).toString()
    const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch((e) => ({ status: () => String(e) }))
    // Scroll through the page so lazy images and observers fire, then return to the top.
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight * 0.8) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 120))
      }
      window.scrollTo(0, 0)
    })
    await page.waitForLoadState('networkidle').catch(() => {})
    await page.waitForTimeout(800)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    const name = `${(p === '/' ? 'home' : p.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, ''))}-${width}.png`
    await page.screenshot({ path: path.join(outDir, name), fullPage: process.env.FULL !== '0' })
    report.push({ path: p, width, status: res?.status?.(), horizontalOverflowPx: overflow, errors: [...errors] })
    errors.length = 0
  }
  await context.close()
}

await browser.close()
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
