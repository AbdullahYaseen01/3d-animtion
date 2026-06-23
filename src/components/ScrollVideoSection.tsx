import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AnimatePresence, motion } from 'framer-motion'
import showcaseImages from '../data/showcaseImages.json'
import './ScrollVideoSection.css'

const gallery = showcaseImages.gallery ?? []

const slides = [
  {
    image: gallery[0] ?? '/showcase/slide-1.webp',
    tag: 'Profile',
    title: 'Bold Silhouette',
    detail: 'Sculpted lines that command attention from every angle.',
  },
  {
    image: gallery[1] ?? '/showcase/slide-2.webp',
    tag: 'Colorway',
    title: 'Signature Palette',
    detail: 'Rich tones and contrast — designed to stand out on any street.',
  },
  {
    image: gallery[2] ?? '/showcase/slide-3.webp',
    tag: 'Detail',
    title: 'Fine Craft',
    detail: 'Every stitch, panel, and texture finished by hand.',
  },
  {
    image: gallery[3] ?? '/showcase/slide-4.webp',
    tag: 'Sole',
    title: 'Built To Grip',
    detail: 'High-traction outsole engineered for city pavement and beyond.',
  },
]

export function ScrollVideoSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: `+=${slides.length * 70}%`,
      pin: true,
      scrub: 0.3,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const idx = Math.min(
          slides.length - 1,
          Math.round(self.progress * (slides.length - 1)),
        )
        setActiveSlide(idx)
      },
    })

    return () => st.kill()
  }, [])

  const active = slides[activeSlide]

  return (
    <section id="showcase" className="showcase-gallery" ref={sectionRef}>
      <div className="showcase-gallery-stage">
        <div className="showcase-slides">
          <AnimatePresence mode="sync">
            <motion.div
              key={activeSlide}
              className="showcase-slide"
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <img
                src={active.image}
                alt={active.title}
                className="showcase-slide-img"
                loading="eager"
                decoding="async"
              />
              <div className="showcase-slide-tint" aria-hidden="true" />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="showcase-grid-overlay" aria-hidden="true" />
        <div className="showcase-vignette" aria-hidden="true" />

        <div className="showcase-header">
          <span className="section-label">The Collection</span>
          <h2 className="showcase-headline">Every Angle</h2>
        </div>

        <div className="showcase-progress" aria-hidden="true">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`showcase-progress-dot${i === activeSlide ? ' showcase-progress-dot--active' : ''}${i < activeSlide ? ' showcase-progress-dot--done' : ''}`}
            />
          ))}
        </div>

        <div className="showcase-info">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="showcase-info-tag">{active.tag}</span>
              <h3 className="showcase-info-title">{active.title}</h3>
              <p className="showcase-info-desc">{active.detail}</p>
              <div className="showcase-info-counter">
                <span>{String(activeSlide + 1).padStart(2, '0')}</span>
                <span className="showcase-info-total"> / {String(slides.length).padStart(2, '0')}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
