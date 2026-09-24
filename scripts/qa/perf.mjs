/**
 * Lab performance probe (not field data). Loads each URL in Chrome with
 * simulated mobile throttling and reports FCP, LCP, CLS and transfer sizes.
 * Usage: node scripts/qa/perf.mjs <url> [url...]
 */
import { chromium } from 'playwright'

const urls = process.argv.slice(2)
const browser = await chromium.launch({ channel: 'chrome' })
const results = []

for (const url of urls) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true })
  const page = await context.newPage()
  const cdp = await context.newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
  // Approximates Lighthouse "Slow 4G" + 4x CPU slowdown.
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  })
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })

  let bytes = 0
  let jsBytes = 0
  let requests = 0
  cdp.on('Network.loadingFinished', (e) => {
    bytes += e.encodedDataLength
    requests++
  })
  const types = new Map()
  cdp.on('Network.responseReceived', (e) => types.set(e.requestId, e.type))
  cdp.on('Network.loadingFinished', (e) => {
    if (types.get(e.requestId) === 'Script') jsBytes += e.encodedDataLength
  })

  await page.addInitScript(() => {
    window.__vitals = { lcp: 0, cls: 0, fcp: 0, lcpEl: '' }
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        window.__vitals.lcp = e.startTime
        window.__vitals.lcpEl = e.element ? e.element.tagName + '.' + (e.element.className || '') : e.url
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true })
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__vitals.cls += e.value
    }).observe({ type: 'layout-shift', buffered: true })
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') window.__vitals.fcp = e.startTime
    }).observe({ type: 'paint', buffered: true })
  })

  const t0 = Date.now()
  await page.goto(url, { waitUntil: 'load', timeout: 120000 })
  await page.waitForTimeout(5000)
  const v = await page.evaluate(() => window.__vitals)
  results.push({
    url,
    fcpMs: Math.round(v.fcp),
    lcpMs: Math.round(v.lcp),
    lcpElement: v.lcpEl,
    cls: Number(v.cls.toFixed(3)),
    transferKB: Math.round(bytes / 1024),
    jsTransferKB: Math.round(jsBytes / 1024),
    requests,
    loadEventMs: Date.now() - t0,
  })
  await context.close()
}

await browser.close()
console.log(JSON.stringify(results, null, 2))
