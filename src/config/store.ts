/**
 * Business configuration shared by the storefront and the server functions.
 * Every value marked `LAUNCH BLOCKER` must be confirmed by the business
 * before production launch (see README → Launch checklist).
 */

export const store = {
  name: 'NOVA',
  legalName: 'NOVA Footwear',
  tagline: 'Footwear for people who never stand still.',
  /** LAUNCH BLOCKER: confirm the mailbox exists and is monitored. Carried over from the previous site. */
  supportEmail: 'hello@novafootwear.com',
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
    condition: 'unworn, in original condition and packaging',
  },

  checkout: {
    maxQuantityPerLine: 10,
    maxLines: 20,
  },

  legal: {
    /** LAUNCH BLOCKER: set to true only after counsel has reviewed the privacy policy and terms. */
    reviewed: false,
    updated: 'September 24, 2026',
  },
} as const

export type StoreConfig = typeof store
