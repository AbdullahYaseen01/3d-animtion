# Benchmark research

Automated Chrome captures from 24 September 2026 at 390px and 1440px wide are in `docs/research/shots/`.
This file records what the captures actually showed and how that shaped NOVA. Patterns were
adapted, not copied: no layouts, copy, imagery or brand assets were reused.

## What was and was not inspectable

| Site | Page captured | Result |
|------|---------------|--------|
| Nike | `/men` | Blocked by a full-screen "Select your Location" picker. No storefront content was inspected. |
| On | Home, Cloud 6 listing | Loaded, but an email-capture modal covered most of the page on both widths. |
| HOKA | Home | Blocked by a bot "Verification Required" challenge. **Not inspected.** |
| Allbirds | Home | Loaded behind a "Where are we shipping to?" country modal. |
| Zappos | Women's sneakers listing | Loaded fully, with a cookie banner at the bottom. |

Product pages, carts and checkout entry points of these sites were **not** inspected. The research
starting points in the brief, such as HOKA's width choices and On's product-page structure, were
treated as leads, not verified observations.

## Observations → decisions

- **Zappos listing: filter rail, removable filter chips, "Clear Filters", item count, sort select top-right,
  wishlist heart on each card.** NOVA's `/shop` and `/collections/*` use the same shape: a left filter rail
  on desktop, a drawer on mobile, chips with "Clear all", a style count, and sort. Filter state is kept in the
  URL so it can be shared and survives the back button. Filtered URLs are noindexed.
- **Zappos splits size and width into separate filters.** NOVA filters size and width separately, and the
  product page offers Standard (D) / Wide (2E) where a style really comes in wide.
- **On's listing: category pills ("All", …) above the grid and a clean card with swatches.** NOVA's catalog
  header has category pills, and cards show color swatches.
- **On, Allbirds and Zappos all lead with interruptive modals** (email offer, country, cookies) that
  covered the content in every capture. NOVA shows **no** entry modal: newsletter sign-up lives in
  the footer, US-only shipping is stated in the announcement bar, and analytics honors GPC / Do Not Track instead of
  using a blocking banner. See the README before adding any tracking that needs opt-in consent.
- **Allbirds: announcement bar plus a full-bleed lifestyle hero with two clear shop CTAs.** NOVA uses a
  single announcement bar with real policies only (free standard shipping, 30-day returns, both marked as
  launch blockers), and a hero with two shop CTAs ("Shop all shoes" and "Shop the Stride Runner").
- **Badges such as "Best Seller" and "Limited Edition" (Zappos, On).** NOVA shows only "New", which is a catalog
  flag. There are no best-seller, low-stock or rating badges because no real data exists to back them.

## Not adopted

- Ratings and reviews (Zappos) require a real review source. They were omitted instead of invented.
- Discount-for-email offers (On) require a real promotion. None was invented.
