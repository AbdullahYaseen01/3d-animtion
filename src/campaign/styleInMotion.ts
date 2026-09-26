/**
 * Approved “Style in motion” campaign.
 * Originals live in public/campaign. Responsive AVIF/WebP siblings are produced by
 * `node scripts/build-images.mjs --campaign` and must use these same widths.
 */
export const HERO_WIDTHS = [480, 768, 1200, 1600, 1910] as const
export const CATEGORY_WIDTHS = [320, 480, 800, 1200] as const
/** Category tiles are a fixed 8.75rem on phones and one of seven columns above that. */
export const CATEGORY_SIZES = '(max-width: 40rem) 8.75rem, (max-width: 64rem) 14vw, 12vw'

export const campaignHero = {
  src: '/campaign/hero-style-in-motion.png',
  alt: 'A woman in cream and a man in a dark jacket walking a sunlit autumn sidewalk, carrying a burgundy handbag and a backpack',
  width: 1910,
  height: 823,
  widths: HERO_WIDTHS,
  /** Couple stays right of center; the left building remains behind the headline. */
  focal: {
    desktop: '42% center',
    tablet: '58% 40%',
    mobile: '58% 42%',
  },
}

export const campaignCategories = [
  {
    label: 'Shoes',
    href: '/collections/shoes',
    src: '/campaign/category-shoes.png',
    alt: 'Cream sneakers worn on stone steps',
    width: 1536,
    height: 1024,
    widths: CATEGORY_WIDTHS,
    position: 'center 58%',
  },
  {
    label: 'Handbags',
    href: '/collections/handbags',
    src: '/campaign/category-handbags.png',
    alt: 'Burgundy structured handbag',
    width: 1536,
    height: 1024,
    widths: CATEGORY_WIDTHS,
    position: 'center',
  },
  {
    label: 'Wallets',
    href: '/collections/wallets',
    src: '/campaign/category-wallets.png',
    alt: 'Burgundy leather wallet',
    width: 1536,
    height: 1024,
    widths: CATEGORY_WIDTHS,
    position: 'center',
  },
  {
    label: 'Jackets',
    href: '/collections/jackets',
    src: '/campaign/category-jackets.png',
    alt: 'Tan jacket close-up',
    width: 1536,
    height: 1024,
    widths: CATEGORY_WIDTHS,
    position: 'center 40%',
  },
  {
    label: 'Jewelry',
    href: '/collections/womens-jewelry',
    src: '/campaign/category-jewelry.png',
    alt: 'Gold necklace worn with a cream jacket',
    width: 1536,
    height: 1024,
    widths: CATEGORY_WIDTHS,
    position: 'center 55%',
  },
  {
    label: 'Backpacks',
    href: '/collections/backpacks',
    src: '/campaign/category-backpacks.png',
    alt: 'Dark backpack',
    width: 1536,
    height: 1024,
    widths: CATEGORY_WIDTHS,
    position: 'center',
  },
  {
    label: 'Watches',
    href: '/collections/watches',
    src: '/campaign/category-watches.png',
    alt: 'Watch worn on a wrist',
    width: 1536,
    height: 1024,
    widths: CATEGORY_WIDTHS,
    position: 'center',
  },
]

/** 1200×630 share image for a collection, cut from its campaign still. Shoe types share the Shoes image. */
export function collectionOgImage(slug: string): { src: string; alt: string } | undefined {
  const category = campaignCategories.find((c) => c.href === `/collections/${slug}`) ?? (['running', 'trail', 'lifestyle', 'everyday'].includes(slug) ? campaignCategories[0] : undefined)
  if (!category) return undefined
  return { src: category.src.replace(/^\/campaign\/category-(.*)\.png$/, '/og/collection-$1.jpg'), alt: category.alt }
}

export function campaignSrcSet(src: string, widths: readonly number[], ext: 'avif' | 'webp'): string {
  const base = src.replace(/\.png$/, '')
  return widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ')
}
