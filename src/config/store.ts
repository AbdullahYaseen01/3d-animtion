/**
 * Business configuration shared by the storefront and the server functions.
 * Every value marked `LAUNCH BLOCKER` must be confirmed by the business
 * before production launch (see README → Launch checklist).
 */

export const store = {
  name: 'Westora Style',
  legalName: 'Westora Style',
  tagline: 'Style for every side of you.',
  /** LAUNCH BLOCKER: confirm this mailbox exists and is monitored. It must stay on the store's own domain. */
  supportEmail: 'hello@westorastyle.com',
  /** Only list profiles that exist. Empty entries are hidden. */
  social: [] as { label: string; href: string }[],
  currency: 'USD',
  locale: 'en-US',
  country: 'US',

  shipping: {
    /** LAUNCH BLOCKER: "Free shipping" was claimed on the previous site; confirm. */
    standard: { label: 'Standard shipping', priceCents: 0, minBusinessDays: 3, maxBusinessDays: 7 },
    /** Optional paid express rate. Disabled until the business supplies a real rate. */
    express: null as null | { label: string; priceCents: number; minBusinessDays: number; maxBusinessDays: number },
    /** When set, standard shipping is only free at or above this subtotal. */
    freeThresholdCents: null as null | number,
    /** LAUNCH BLOCKER: confirm order processing time. */
    processingBusinessDays: 1,
    allowedCountries: ['US'] as const,
  },

  returns: {
    /** LAUNCH BLOCKER: "30-day returns" was claimed on the previous site; confirm the terms below. */
    windowDays: 30,
    condition: 'unused or unworn, in original condition and packaging',
  },

  checkout: {
    maxQuantityPerLine: 10,
    maxLines: 20,
  },

  /**
   * Reference-price rules (FTC Guides Against Deceptive Pricing, 16 CFR 233; Google Merchant Center "sale price" policy).
   * A struck-through price may only be shown when it is a price Westora Style itself charged for that product, openly and
   * for a reasonable period, immediately before the markdown. The `compareAtPriceCents` values currently in the catalog
   * were imported from the brands' own stores (converted from PKR, and for ZED multiplied like the selling price), so they
   * fail that test. They stay in the data for bookkeeping but are hidden until the rule below is met.
   */
  pricing: {
    /** Set to true only after a real markdown from a price this store charged. Never for imported brand list prices. */
    showCompareAt: false,
    /** Minimum number of days the higher price must have been the live price before it can be shown as a former price. */
    formerPriceMinDays: 30,
  },

  /**
   * Preview purchase lines and card scarcity counts are generated per product so every listing shows activity.
   * A real paid order still replaces the preview line in this browser.
   */
  socialProof: {
    generated: true,
  },

  legal: {
    /** LAUNCH BLOCKER: set to true only after counsel has reviewed the privacy policy and terms. */
    reviewed: false,
    updated: 'September 24, 2026',
    updatedIso: '2026-09-24',
  },

  /** Sitemap lastmod for shop, collection, product and help pages. Bump when their content changes. */
  contentUpdated: '2026-10-04',
} as const

export type StoreConfig = typeof store
