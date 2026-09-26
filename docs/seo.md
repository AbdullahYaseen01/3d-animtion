# NOVA SEO foundation

Last updated: 2026-09-26. This store is a Vite + React 19 + React Router 7 site with static prerendering. It is not Next.js.

Indexing is off unless `ALLOW_INDEXING=true` or `VERCEL_ENV=production`. The catalog is still sample data (`CATALOG_IS_SAMPLE`).

## What changed

- Unique titles and meta descriptions on every indexable page, generated from catalog and guide data.
- Canonicals stay query-free. Search, filters, sort, and pagination (`?page=`) are `noindex, follow`.
- `sitemap.xml` includes `lastmod` and product/collection images. `robots.txt` only exposes the sitemap when indexing is on.
- JSON-LD: Organization, WebSite + SearchAction, BreadcrumbList, ItemList, ProductGroup + Offer (stock, shipping, returns), Article on guides, FAQPage only on `/faq`. No Review or AggregateRating.
- Open Graph / Twitter images per home, collection, product, and guide.
- Four new guides (width, bags/wallets, laptop backpacks, watch fit) plus cross-links from collections and product pages.
- Homepage LCP image is preloaded as AVIF. Pages are code-split. `/assets` is immutable; `/images`, `/campaign`, `/og` are cached.
- GA4 via `VITE_GA4_ID` or `VITE_GA_ID`. Search Console HTML-tag token via `VITE_GSC_VERIFICATION`.

## SEO issues fixed

- Faceted and paginated catalog URLs no longer look like indexable duplicates.
- Utility routes (`/search`, `/cart`, `/wishlist`, `/checkout/success`) stay out of the sitemap and carry `noindex`.
- Product schema now includes `returnFees`. Offers use real stock, not invented reviews.
- Guide pages have an author line, visible dates, and Article dates that match the page.
- Internal links in prerendered HTML only point at real routes.

## Performance issues fixed

- Hero uses `preload` + `fetchpriority=high` and responsive AVIF/WebP.
- Category tiles gained a 320w source for phones.
- Vendor React/router code is a separate chunk; each page is its own module.
- Fonts: only Latin variable subsets are preloaded.
- Local `npm run serve` now gzip-compresses HTML/JS/CSS and mirrors Vercel cache and robots headers.

Lab probe (`scripts/qa/perf.mjs`, Chrome, cache disabled) on 2026-09-26 against `npm run serve` on this machine:

| Page | Viewport | FCP | LCP | CLS | Transfer | JS |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 390 mobile Slow 4G + 4× CPU | 7.0 s | 7.1 s | 0 | 469 KB | 148 KB |
| `/collections/shoes` | same | 5.3 s | 6.1 s | 0 | 314 KB | 148 KB |
| `/products/stride-runner` | same | 1.8 s | 4.7 s | 0.014 | 280 KB | 148 KB |
| `/` | 1440 desktop 10 Mbps | 0.76 s | 1.14 s | 0 | 482 KB | 148 KB |

What those numbers mean: the mobile profile is Lighthouse-like Slow 4G (1.6 Mbps, 150 ms RTT) plus 4× CPU. Transfer is already small (home 469 KB, 39 requests; LCP AVIF is 29–56 KB). The remaining LCP gap is CPU decode plus the React/vendor parse (vendor 233 KB / 75 KB gzip). Unthrottled or on a CDN, LCP is expected under 2.5 s; this lab profile does not reach that on this hardware. CLS stays under 0.1. The 2.6 MB PNG originals stay on disk as fallbacks; browsers that support AVIF should not download them.

What still blocks a lab LCP under 2.5 s on Slow 4G: the full-bleed campaign photograph plus ~148 KB of JS on a 4× CPU throttle. Further cuts would mean a lighter hero crop or shipping less React on first load.

## Keyword map

| Page | Primary | Long-tail |
| --- | --- | --- |
| `/collections/shoes` | shoes, sneakers | wide width running shoes, US men’s sneakers |
| `/collections/running` | running shoes | cushioned road trainers, wide running shoes |
| `/collections/trail` | trail running shoes | lugged trail shoes |
| `/collections/lifestyle` | lifestyle sneakers | leather court sneakers, suede high-tops |
| `/collections/everyday` | everyday sneakers | knit slip-ons, all-day shoes |
| `/collections/handbags` | handbags, crossbody bags | small crossbody bag dimensions |
| `/collections/wallets` | slim wallets | bifold leather wallet card slots |
| `/collections/jackets` | lightweight jackets | fall jacket sizing XS–XL |
| `/collections/womens-jewelry` | women’s jewelry | gold-tone hoop earrings |
| `/collections/backpacks` | commuter backpacks | 15-inch laptop backpack |
| `/collections/watches` | minimalist watches | leather strap wrist size |
| Guides | how to measure feet, shoe width, bag capacity, watch strap fit | — |

Do not stuff these into body copy. Titles and first paragraphs already use them naturally.

## Backlink strategy (white-hat)

Link-worthy assets already on the site:

- Foot measuring and width guides (`/guides/how-to-measure-your-feet`, `/guides/standard-vs-wide-shoes`)
- Size chart (`/fit-guide`)
- Bag, backpack, and watch fit guides

Outreach types (ask for an editorial link, not a directory dump):

- Running and outdoor blogs covering shoe width and trail vs road
- Style editors covering “what actually fits in a small bag”
- Accessibility / adaptive-fit writers (wide widths)
- Local US lifestyle newsletters if a real store address is added later

Anchor-text mix: branded “NOVA”, partial “NOVA size chart”, and naked URLs. Avoid exact-match spam.

No guest-post networks, PBNs, or paid link schemes.

## Local SEO

Skipped. `src/config/store.ts` has no street address, phone, or Google Business Profile. Add those only when a real location exists, then LocalBusiness schema can follow.

## Remaining issues

- Catalog names, prices, and photos are still sample data. Do not enable indexing until `CATALOG_IS_SAMPLE` is false and legal pages are counsel-reviewed (`store.legal.reviewed`).
- No social profiles (`store.social` is empty), so Organization has no `sameAs`.
- No GA4 ID or Search Console token in the repo. Set `VITE_GA4_ID` and `VITE_GSC_VERIFICATION` in Vercel.
- No field Core Web Vitals until Search Console has real traffic.
- FAQPage is emitted for `/faq`. Google rich results for FAQ are limited on commercial sites; the markup still helps machines and matches visible copy.
- Trailing-slash 308s are handled by `scripts/serve.mjs` and Vercel `trailingSlash: false`. Hash URLs (`/#contact`) still redirect in the client.

## Commands to run

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm run serve -- --port 4181
node scripts/qa/validate-seo.mjs
node scripts/qa/crawl.mjs
node scripts/qa/http-checks.mjs http://127.0.0.1:4181
node scripts/qa/hydration.mjs http://127.0.0.1:4181
node scripts/qa/viewports.mjs http://127.0.0.1:4181
node scripts/qa/perf.mjs http://127.0.0.1:4181/ http://127.0.0.1:4181/collections/shoes http://127.0.0.1:4181/products/stride-runner
node scripts/qa/perf.mjs --desktop http://127.0.0.1:4181/
```

## What to watch

**Google Search Console**

- Pages: Coverage (why pages are excluded), especially filtered URLs
- Sitemaps: `https://your-domain/sitemap.xml`
- Experience → Core Web Vitals (phone first)
- Enhancements: Products, Breadcrumbs, Sitelinks search box
- Removals if a preview URL was indexed

**PageSpeed Insights**

- Home, a collection, and a product on mobile
- LCP element should be the campaign or product image, not a font
- CLS from images without dimensions should stay at 0
