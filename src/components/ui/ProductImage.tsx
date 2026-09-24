import { useState } from 'react'
import manifest from '../../data/imageManifest.json'

type ManifestEntry = { w: number; h: number; widths: number[]; bg: string }
const images = manifest as Record<string, ManifestEntry>

interface Props {
  image: string
  alt: string
  sizes: string
  priority?: boolean
  className?: string
  group?: 'products' | 'editorial'
  objectPosition?: string
}

/** Responsive AVIF/WebP picture with intrinsic dimensions and a graceful failure state. */
export function ProductImage({ image, alt, sizes, priority = false, className, group = 'products', objectPosition }: Props) {
  const entry = images[image]
  const [failed, setFailed] = useState(false)
  if (!entry || failed) {
    return (
      <div className={`img-fallback ${className ?? ''}`} role="img" aria-label={alt}>
        <span aria-hidden="true">NOVA</span>
      </div>
    )
  }
  const src = (w: number, ext: string) => `/images/${group}/${image}-${w}.${ext}`
  const set = (ext: string) => entry.widths.map((w) => `${src(w, ext)} ${w}w`).join(', ')
  const fallbackWidth = entry.widths[Math.min(1, entry.widths.length - 1)]
  return (
    <picture>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img
        className={className}
        src={src(fallbackWidth, 'webp')}
        alt={alt}
        width={entry.w}
        height={entry.h}
        style={objectPosition ? { objectPosition } : undefined}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onError={() => setFailed(true)}
      />
    </picture>
  )
}

export function imageBg(image: string): string {
  return images[image]?.bg ?? 'var(--color-stone)'
}
