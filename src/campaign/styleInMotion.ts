/**
 * Approved “Style in motion” campaign.
 * Swap the hero file in one place when the text-free photograph is available.
 * Leave `src` empty until then — do not point it at the low-resolution mock.
 */
export const campaignHero = {
  src: '',
  alt: 'A woman in cream and a man in a dark jacket walking a sunlit autumn sidewalk, carrying a burgundy handbag and a backpack',
  width: 2400,
  height: 1039,
  /** Models sit center-right; the left side stays open for the headline. */
  position: '70% center',
}

export const campaignCategories = [
  {
    label: 'Shoes',
    href: '/collections/shoes',
    image: 'editorial-onfoot',
    group: 'editorial' as const,
    alt: 'Light sneakers worn while walking on a sunlit sidewalk',
    position: 'center 62%',
  },
  {
    label: 'Handbags',
    href: '/collections/handbags',
    image: 'nova-handbag-side',
    group: 'products' as const,
    alt: 'Mini Crossbody handbag',
    position: 'center',
  },
  {
    label: 'Wallets',
    href: '/collections/wallets',
    image: 'nova-wallet-side',
    group: 'products' as const,
    alt: 'Slim Wallet',
    position: 'center',
  },
  {
    label: 'Jackets',
    href: '/collections/jackets',
    image: 'nova-jacket-side',
    group: 'products' as const,
    alt: 'Day Jacket',
    position: 'center 40%',
  },
  {
    label: 'Jewelry',
    href: '/collections/womens-jewelry',
    image: 'nova-earrings-side',
    group: 'products' as const,
    alt: 'Arc Earrings',
    position: 'center',
  },
  {
    label: 'Backpacks',
    href: '/collections/backpacks',
    image: 'nova-backpack-side',
    group: 'products' as const,
    alt: 'Commute Pack backpack',
    position: 'center',
  },
  {
    label: 'Watches',
    href: '/collections/watches',
    image: 'nova-watch-side',
    group: 'products' as const,
    alt: 'Line Watch on a leather strap',
    position: 'center',
  },
]
