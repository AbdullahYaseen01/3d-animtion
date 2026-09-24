# NOVA storefront

US footwear store for NOVA. The stack is React 19, react-router 7 and Vite 6, with every public route prerendered to
static HTML. Server functions for Stripe Checkout, Resend email and order status run on Vercel.

> **Status: not launch-ready.** The catalog is sample data, and several business policies need confirmation. See
> [Launch blockers](#launch-blockers). Payments are wired for **Stripe test mode** only.

## Quick start

```bash
npm install
cp .env.example .env.local   # optional; every integration degrades honestly when unset
npm run dev                  # http://localhost:5173 (API routes are served by the dev middleware)
```

Node 20+ is required.

| Script | What it does |
|--------|--------------|
| `npm run dev` | Vite dev server plus `/api/*` handlers |
| `npm run build` | Typecheck, client build, SSR build, prerender of 28 routes + 404, sitemap and robots into `dist/` |
| `npm run serve` | Serves `dist/` like Vercel: clean URLs, real 404s, gzip, API handlers (port 4173) |
| `npm run lint` / `npm run typecheck` / `npm test` | ESLint, `tsc -b`, Vitest (51 tests) |
| `npm run images` | Regenerates AVIF/WebP product imagery and the campaign film from `assets-src/` (sharp + ffmpeg-static) |
| `node scripts/qa/flows.mjs` | 15 Playwright journey checks against `npm run serve` (uses installed Chrome) |
| `node scripts/qa/a11y.mjs` | axe-core WCAG 2.2 A/AA scan, 20 routes × 390/1280px → `docs/qa/axe-report.json` |
| `node scripts/qa/screenshots.mjs <base> <outDir> <paths> <widths>` | Screenshots plus a horizontal-overflow report |
| `node scripts/qa/perf.mjs <url…>` | Lab FCP/LCP/CLS probe with throttled network and CPU (not field data) |

## Architecture

```
src/
  catalog/        products, categories, filters (prices in integer cents)
  commerce/       cart model and validation (shared by client and server)
  config/store.ts business policies: shipping, returns, support email, legal review flag
  pages/          one component per route
  components/     layout, product, catalog, home, ui
  state/          cart, wishlist, announcer providers
  lib/            seo (meta + JSON-LD), analytics, money
  entry-server.tsx  render(url) for prerendering
server/           Web-standard Request → Response handlers + Stripe/Resend helpers
api/              Vercel function entry points (re-export server/handlers)
scripts/          prerender, local server, image pipeline, QA
tests/            Vitest
```

- **Rendering.** `scripts/prerender.mjs` renders every route in `prerenderRoutes()` to `dist/<route>.html`.
  Vercel's `cleanUrls` serves them. The client hydrates prerendered pages, or renders fresh when the URL has a query string.
- **Imports reachable from `/api` must use explicit `.js` paths.** The package is ESM, and Vercel's Node runtime
  does not resolve extensionless paths. `tests/server-imports.test.ts` enforces this.
- **Indexing.** Builds are `noindex` unless `VERCEL_ENV=production` or `ALLOW_INDEXING=true`. Utility routes and any
  filtered or sorted catalog URL are always noindex, via both the meta tag and an `X-Robots-Tag` header in `vercel.json`.

## Payments (Stripe Checkout, test mode)

1. Put a **test** secret key (`sk_test_…`) in `STRIPE_SECRET_KEY`.
2. For local webhooks, run `stripe listen --forward-to localhost:5173/api/stripe-webhook` and copy the printed `whsec_…`
   into `STRIPE_WEBHOOK_SECRET`. On Vercel, add an endpoint for `https://<domain>/api/stripe-webhook` subscribed to
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`
   and `checkout.session.expired`.
3. Pay with test card `4242 4242 4242 4242`. Use `4000 0000 0000 0002` for a decline.

How it works:
- `POST /api/checkout` accepts only product ID, color, width, size and quantity. The server re-prices every line from the
  catalog in integer cents, rejects unknown, sold-out or over-limit lines, and builds Stripe `price_data` from those values.
  Client prices are never trusted. Card data is entered on Stripe's hosted page and never touches this app.
- **Idempotency:** each checkout attempt sends a client-generated attempt ID. The Stripe idempotency key is
  `checkout_<attemptId>_<cartHash>`, so double-clicks reuse one session. Sessions expire after 1 hour.
- **An order is only "paid" when Stripe says so.** `/checkout/success` calls `GET /api/order?session_id=…`, which reads the
  session from Stripe. The success URL alone never marks anything paid. Delayed payment methods show a "processing"
  state and poll. Failed, unpaid and expired sessions show recovery options. Canceling returns to `/cart?checkout=canceled`.
- **Webhook** signatures are verified. Fulfillment (the merchant email) runs once per payment. The claim is atomic via Upstash
  Redis `SET NX` when configured. Otherwise a PaymentIntent metadata flag is used, which is not atomic under concurrent retries.
- Live keys are **refused** while `CATALOG_IS_SAMPLE` is `true`.

## Email (Resend)

- Newsletter (`/api/newsletter`) adds a contact to `RESEND_SEGMENT_ID`. An existing contact counts as success.
- Contact form (`/api/contact`) emails `CONTACT_TO_EMAIL` from `CONTACT_FROM_EMAIL`, with the customer as `reply_to`.
- Both use a honeypot field, validate on the server, and show success **only after Resend accepts the request**. When they are not
  configured, the API returns 503 and the UI says the service is unavailable, offering the support email instead.

## Analytics

GA4 loads only when `VITE_GA4_ID` is set, and never when the browser sends Global Privacy Control or Do Not Track.
Events are pushed to `window.dataLayer`: `view_item_list`, `view_item`, `search`, `add_to_cart`, `remove_from_cart`,
`begin_checkout`, `purchase` (only for server-confirmed paid orders, once per order), `sign_up` and `generate_lead`.
Payloads contain product IDs, SKUs, prices and quantities only. No names, emails or addresses are sent. Server logs follow
the same rule (`logEvent` in `server/http.ts`). There is no cookie banner. Add a consent tool before enabling
ads or remarketing tags, or before serving visitors in regions that require opt-in consent.

## Environment variables

See [`.env.example`](.env.example). The keys are `VITE_SITE_URL`, `ALLOW_INDEXING`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`STRIPE_AUTOMATIC_TAX`, `RESEND_API_KEY`, `RESEND_SEGMENT_ID`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`,
`ORDER_NOTIFICATION_EMAIL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` and `VITE_GA4_ID`. `VITE_*` values are public
(bundled into the client). Everything else is server-only.

## Deploying (Vercel)

`vercel.json` sets `framework: null`, the build command and `dist` output, clean URLs, security headers (CSP included),
cache headers and noindex headers. Set env vars per environment: preview deployments should use Stripe test keys and stay
noindex.

## Launch blockers

Each of these must be resolved by the business. None can be settled in code.

1. **Real catalog.** `src/catalog/products.ts` is sample data (styles, prices, stock and sizes). The product images are
   generated renders. Replace both with real products and photography, then set `CATALOG_IS_SAMPLE = false`.
2. **Support email.** Confirm that `hello@novafootwear.com` exists and is monitored (`store.supportEmail`).
3. **Shipping.** Confirm free standard shipping, 3–7 business days, processing time (1 business day) and US-only delivery.
   All are set in `store.shipping` and shown site-wide.
4. **Returns.** Confirm the 30-day window, the "unworn" condition and the 7-day window for damaged or incorrect items
   (all stated on `/returns`). Decide who pays return shipping. The page doesn't say yet, and it should.
5. **Size chart.** `/fit-guide` uses generic US/UK/EU/cm conversions, captioned as approximate. Confirm them against the real
   lasts, along with each style's fit note.
6. **Legal.** The privacy policy and terms are drafts. Pages show a draft notice until `store.legal.reviewed = true`
   after counsel review.
7. **Resend domain.** Verify the sending domain and set the Resend variables. Until then, the forms honestly report
   they are unavailable.
8. **Stripe account.** Complete activation, set up tax (`STRIPE_AUTOMATIC_TAX`), and register the production webhook.
   Run a full test-mode purchase on the production domain before switching to live keys.
9. **Domain.** Set `VITE_SITE_URL` to the final domain and submit `sitemap.xml` in Search Console.

## Known limitations

- No inventory reservation. Stock is static catalog data, so two buyers can purchase the last unit.
- Without Upstash, webhook fulfillment deduplication is best-effort (see Payments).
- No customer accounts or order history, and no order-confirmation email of our own. Turn on Stripe's
  "Successful payments" customer emails so buyers get a receipt.
- The client JS bundle is 376 KB raw / 116.6 KB gzip. Lab-probe FCP ranged from 3.1 to 5.3 s and LCP from 3.9 to 5.3 s on
  the throttled profile across repeated runs (baseline: FCP 4388 ms, LCP 5880 ms on a loading-screen logo). These are lab
  numbers only. No Lighthouse score or field data is claimed.
- `assets-src/hero-loop.mp4` is the old source video with an Adobe watermark. It is source-only and never deployed.
- `/`-hash legacy links (`/#showcase` and similar) redirect client-side, because hashes never reach the server.

Further documentation: [`docs/inventory.md`](docs/inventory.md) covers routes and the baseline, and [`docs/research.md`](docs/research.md) covers the benchmark findings.
