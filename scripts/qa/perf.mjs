/**
 * Lab performance probe (not field data). Loads each URL in Chrome with
 * simulated throttling and reports FCP, LCP, CLS and transfer sizes.
 * Usage: node scripts/qa/perf.mjs [--desktop] [--timeline] <url> [url...]
 *   --desktop   1440x900 viewport, DPR 1, no CPU slowdown, faster network (Lighthouse desktop-like)
 *   --timeline  also print when each request finished, to see what delays first paint
 */
import { chromium } from 'playwright'

const args = process.argv.slice(2)
const desktop = args.includes('--desktop')
const timeline = args.includes('--timeline')
const urls = args.filter((a) => !a.startsWith('--'))
const browser = await chromium.launch({ channel: 'chrome' })
const results = []

for (const url of urls) {
  const context = await browser.newContext(
    desktop
      ? { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }
      : { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true },
  )
  const page = await context.newPage()
  const cdp = await context.newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
  // Mobile approximates Lighthouse "Slow 4G" + 4x CPU; desktop approximates its 10 Mbps / 40 ms profile.
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: desktop ? 40 : 150,
    downloadThroughput: ((desktop ? 10 : 1.6) * 1024 * 1024) / 8,
    uploadThroughput: ((desktop ? 5 : 0.75) * 1024 * 1024) / 8,
  })
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: desktop ? 1 : 4 })

  let bytes = 0
  let jsBytes = 0
  let requests = 0
  const types = new Map()
  const names = new Map()
  const finished = []
  let start = 0
  cdp.on('Network.requestWillBeSent', (e) => {
    if (!start) start = e.timestamp
    names.set(e.requestId, e.request.url)
  })
  cdp.on('Network.responseReceived', (e) => types.set(e.requestId, e.type))
  cdp.on('Network.loadingFinished', (e) => {
    bytes += e.encodedDataLength
    requests++
    if (types.get(e.requestId) === 'Script') jsBytes += e.encodedDataLength
    finished.push({
      at: Math.round((e.timestamp - start) * 1000),
      kb: Math.round(e.encodedDataLength / 1024),
      url: (names.get(e.requestId) ?? '').replace(/^https?:\/\/[^/]+/, ''),
    })
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
    profile: desktop ? 'desktop-1440' : 'mobile-390',
    fcpMs: Math.round(v.fcp),
    lcpMs: Math.round(v.lcp),
    lcpElement: v.lcpEl,
    cls: Number(v.cls.toFixed(3)),
    transferKB: Math.round(bytes / 1024),
    jsTransferKB: Math.round(jsBytes / 1024),
    requests,
    loadEventMs: Date.now() - t0,
    ...(timeline ? { timeline: finished.sort((a, b) => a.at - b.at).map((f) => `${f.at}ms ${f.kb}KB ${f.url}`) } : {}),
  })
  await context.close()
}

await browser.close()
console.log(JSON.stringify(results, null, 2))
