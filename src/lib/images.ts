import manifest from '../data/imageManifest.json'

type ManifestEntry = { w: number; h: number; widths: number[]; bg: string }
const images = manifest as Record<string, ManifestEntry>

export const GALLERY_SIZES = '(min-width: 64rem) 58vw, 100vw'
export const CARD_SIZES = '(min-width: 90rem) 22rem, (min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 92vw'

/** Preload hint matching the AVIF source ProductImage renders, so the LCP image is fetched once. */
export function productPreload(image: string | undefined, sizes: string): { srcSet: string; sizes: string; type: string } | undefined {
  const entry = image ? images[image] : undefined
  if (!image || !entry) return undefined
  return {
    type: 'image/avif',
    srcSet: entry.widths.map((w) => `/images/products/${image}-${w}.avif ${w}w`).join(', '),
    sizes,
  }
}
