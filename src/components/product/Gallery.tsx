import { useRef, useState } from 'react'
import type { ColorOption, Product } from '../../catalog'
import { Dialog } from '../ui/Dialog'
import { Icon } from '../ui/Icon'
import { ProductImage, imageBg } from '../ui/ProductImage'
import './Gallery.css'

const VIEW_NAMES = ['side view', 'three-quarter front view']

export function Gallery({ product, color }: { product: Product; color: ColorOption }) {
  const [zoomIndex, setZoomIndex] = useState<number | null>(null)
  const [active, setActive] = useState(0)
  const track = useRef<HTMLUListElement>(null)
  const alt = (i: number) => `${product.name} in ${color.name}, ${VIEW_NAMES[i] ?? `view ${i + 1}`}`

  const goTo = (i: number) => {
    const el = track.current?.children[i] as HTMLElement | undefined
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
  }

  return (
    <div className="gallery">
      <ul
        role="list"
        className="gallery__track"
        ref={track}
        aria-label={`${product.name} images`}
        onScroll={(e) => {
          const el = e.currentTarget
          setActive(Math.round(el.scrollLeft / el.clientWidth))
        }}
      >
        {color.images.map((img, i) => (
          <li key={img} className="gallery__slide" style={{ background: imageBg(img) }}>
            <button type="button" className="gallery__zoom-btn" onClick={() => setZoomIndex(i)} aria-label={`Zoom: ${alt(i)}`}>
              <ProductImage image={img} alt={alt(i)} sizes="(min-width: 64rem) 58vw, 100vw" priority={i === 0} />
              <span className="gallery__zoom-hint" aria-hidden="true">
                <Icon name="zoom" size={18} />
              </span>
            </button>
          </li>
        ))}
      </ul>
      {color.images.length > 1 && (
        <div className="gallery__dots" role="group" aria-label="Choose image">
          {color.images.map((img, i) => (
            <button key={img} type="button" aria-label={`Show image ${i + 1} of ${color.images.length}`} aria-pressed={active === i} onClick={() => goTo(i)} />
          ))}
        </div>
      )}

      <Dialog open={zoomIndex != null} onClose={() => setZoomIndex(null)} title={zoomIndex != null ? alt(zoomIndex) : 'Image'} variant="modal" className="zoom-dialog">
        {zoomIndex != null && (
          <div className="zoom-dialog__stage" style={{ background: imageBg(color.images[zoomIndex]) }}>
            <img
              src={`/images/products/${color.images[zoomIndex]}-1024.webp`}
              alt={alt(zoomIndex)}
              width={1024}
              height={1024}
              decoding="async"
            />
            {color.images.length > 1 && (
              <div className="zoom-dialog__nav">
                {color.images.map((img, i) => (
                  <button key={img} type="button" className={`chip${i === zoomIndex ? ' chip--active' : ''}`} onClick={() => setZoomIndex(i)} aria-pressed={i === zoomIndex}>
                    {VIEW_NAMES[i] ?? `View ${i + 1}`}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  )
}
