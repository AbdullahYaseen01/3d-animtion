/**
 * Homepage editorial opening. Copy, image paths, and destinations live here so they can be swapped
 * without touching the layout. Dimensions and crops follow Westora_Hero_Assets/asset-map.json.
 */
export const HERO_SIZES = '(min-width: 75rem) 42vw, (min-width: 48rem) 56vw, 100vw'

/** Widths written by scripts/build-editorial-images.mjs; only those narrower than the original exist. */
const EDITORIAL_WIDTHS = [480, 768, 1080, 1440]

export function editorialSrcSet(src: string, width: number, format: 'avif' | 'webp'): string {
  const stem = src.replace(/\.webp$/, '')
  const sizes = EDITORIAL_WIDTHS.filter((w) => w < width).map((w) => `${stem}-${w}.${format} ${w}w`)
  return (format === 'webp' ? [...sizes, `${src} ${width}w`] : sizes).join(', ')
}

export const editorialOpening = {
  hero: {
    eyebrow: 'Sneakers, coats, handbags & watches',
    title: ['Make it', 'your own.'],
    lede: 'Everyday pieces. A point of view.',
    cta: { label: 'Discover the edit', href: '/shop' },
  },
  model: {
    src: '/images/westora/city-edit-model.webp',
    alt: 'Woman in a brown leather jacket and jeans carrying a taupe shoulder bag on a city street.',
    width: 1374,
    height: 1145,
    position: '50% 42%',
    positionMobile: '52% 40%',
  },
  accessories: {
    src: '/images/westora/accessories-still-life.webp',
    alt: 'Taupe leather handbag and black loafers arranged on textured stone.',
    width: 1173,
    height: 1341,
    position: '50% 50%',
    title: 'The finishing touches',
    cta: { label: 'Shop accessories', href: '/shop?category=handbags,shoes' },
  },
  statement: {
    title: 'Less ordinary.',
    copy: 'A fresh take on the pieces you reach for every day.',
  },
  panels: [
    {
      src: '/images/westora/bags-editorial.webp',
      alt: 'Close-up of a woven brown leather shoulder bag with a cream coat.',
      width: 2172,
      height: 724,
      position: '50% 55%',
      title: 'Bags worth carrying',
      cta: { label: 'Shop bags', href: '/collections/handbags' },
    },
    {
      src: '/images/westora/jewelry-watch.webp',
      alt: 'Sculptural gold earrings beside a rectangular gold-tone watch with a black leather strap.',
      width: 1774,
      height: 887,
      position: '50% 50%',
      title: 'Details that matter',
      cta: { label: 'Shop jewelry & watches', href: '/shop?category=womens-jewelry,watches' },
    },
  ],
} as const
