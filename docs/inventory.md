# Route and feature inventory

## Baseline (before the redesign)

The baseline is commit `9db37cf` on the live site https://core-seven-henna.vercel.app.

- **Single-page landing site** with a React 19 + Vite SPA, `three` / `@react-three/fiber` / `drei`, GSAP, Lenis and
  Framer Motion, a loading screen, and a scroll-driven video and frame sequence.
- **Navigation** used section anchors (`#showcase`, `#process`, `#contact`). Header and footer social links
  used `href="#"`. "Shop Now" jumped to `#contact`, and the CTA's primary button was `mailto:hello@novafootwear.com`.
- **No commerce.** There was no catalog, product IDs, cart, checkout, payment integration, accounts, or forms
  posting to a service. There was no business logic or customer data to migrate.
- **SEO:** a single client-rendered shell with no per-route meta, no structured data, no sitemap or robots.
- **Measured (lab probe, `docs/perf/baseline-lab.json`, 1.6 Mbps / 150 ms / 4× CPU):** FCP 4388 ms and LCP 5880 ms.
  The LCP element was the loading-screen logo (`DIV.loading-logo`), not content. Lighthouse against the live site
  failed with `NO_FCP` (`docs/perf/baseline-mobile.json`), so no Lighthouse score is claimed.
- The source loop `public/hero-loop.mp4` (~3.4 MB) was served on the home page. It has been moved to
  `assets-src/`. It carries an Adobe Acrobat watermark and must not be deployed.

## Routes now

| Route | Purpose | Indexed | Notes |
|-------|---------|---------|-------|
| `/` | Home: hero, lineup, activities, campaign film, guides | yes | Legacy `/#showcase` → `/shop`, `/#process` → `/about`, `/#contact` → `/contact` (client redirect, since hashes never reach the server) |
| `/shop` | All styles, filters, sort, quick shop | yes; noindex when any filter or query param is present | Filters kept in the URL |
| `/collections/:slug` | running, trail, lifestyle, everyday | yes (same param rule) | |
| `/search?q=` | Search results | no | |
| `/products/:slug` | Product page | yes | `?color=` selects a colorway; canonical has no params |
| `/wishlist`, `/cart` | Saved items, cart | no | localStorage |
| `/checkout/success?session_id=` | Order status from Stripe (server-verified) | no | paid / processing / failed / unpaid / expired states |
| `/about`, `/fit-guide`, `/shipping`, `/returns`, `/faq`, `/contact`, `/privacy`, `/terms` | Support & policy | yes | Policy values come from `src/config/store.ts` |
| `/guides`, `/guides/:slug` | Editorial buying guides | yes | Article JSON-LD |
| anything else | 404 page with HTTP 404 | no | |
| `/api/checkout`, `/api/order`, `/api/stripe-webhook`, `/api/newsletter`, `/api/contact` | Server functions | no | |

## Problems fixed → verification

| Problem | Change | How it was verified |
|---------|--------|---------------------|
| No way to buy | Catalog, product pages, cart, Stripe Checkout, webhook | Vitest (`checkout`, `webhook`, `order`, `cart`), `scripts/qa/flows.mjs` |
| Anchor-only nav, placeholder links | Real routes; social links hidden until real profiles exist | flows, screenshots |
| Two H1s in hero | One H1 per page | `tests/seo-render.test.ts` |
| Content only after JS plus a loading screen | Prerendered HTML for 28 routes | seo-render test, built HTML inspection |
| No meta, sitemap or robots | Per-route title/description/canonical/OG, JSON-LD, sitemap, robots, preview noindex | seo-render test, `dist/` inspection |
| Heavy 3D / scroll libraries | Removed. Static images plus one short, lazy, pausable film | bundle output (116.6 KB gzip JS) |
| Accessibility | Skip link, focus management, labelled controls, contrast | axe-core 0 violations (20 routes × 390/1280px), keyboard flows |
