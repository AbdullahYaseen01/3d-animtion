import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import showcaseImages from '../data/showcaseImages.json'
import './ScrollVideoSection.css'

const gallery = showcaseImages.gallery ?? []

const slides = [
  {
    image: gallery[0] ?? '/process/concept.webp',
    tag: 'Profile',
    title: 'Bold Silhouette',
    detail: 'Sculpted lines that command attention from every angle.',
  },
  {
    image: gallery[1] ?? '/process/modeling.webp',
    tag: 'Colorway',
    title: 'Signature Palette',
    detail: 'Rich tones and contrast — designed to stand out on any street.',
  },
  {
    image: gallery[2] ?? '/process/texturing.webp',
    tag: 'Detail',
    title: 'Fine Craft',
    detail: 'Every stitch, panel, and texture finished by hand.',
  },
  {
    image: gallery[3] ?? '/process/rigging.webp',
    tag: 'Sole',
    title: 'Built To Grip',
    detail: 'High-traction outsole engineered for city pavement and beyond.',
  },
]

function slideOpacity(progress: number, index: number, total: number) {
  const seg = 1 / total
  const start = index * seg
  const end = (index + 1) * seg
  const mid = start + seg * 0.5
  if (progress <= start) return progress > start - seg * 0.15 ? (progress - (start - seg * 0.15)) / (seg * 0.15) : 0
  if (progress >= end) return progress < end + seg * 0.15 ? 1 - (progress - end) / (seg * 0.15) : 0
  const dist = Math.abs(progress - mid) / (seg * 0.5)
  return Math.max(0, 1 - dist * 0.35)
}

function GallerySlide({
  slide,
  index,
  progress,
  total,
}: {
  slide: (typeof slides)[0]
  index: number
  progress: MotionValue<number>
  total: number
}) {
  const opacity = useTransform(progress, (v) => slideOpacity(v, index, total))
  const scale = useTransform(progress, (v) => {
    const o = slideOpacity(v, index, total)
    return 1.05 + o * 0.12
  })
  const x = useTransform(progress, (v) => {
    const o = slideOpacity(v, index, total)
    return `${(1 - o) * (index % 2 === 0 ? -4 : 4)}%`
  })

  return (
    <motion.div className="showcase-slide" style={{ opacity }}>
      <motion.img
        src={slide.image}
        alt={slide.title}
        className="showcase-slide-img"
        style={{ scale, x }}
        loading={index === 0 ? 'eager' : 'lazy'}
        decoding="async"
      />
      <div className="showcase-slide-tint" aria-hidden="true" />
    </motion.div>
  )
}

export function ScrollVideoSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeSlide, setActiveSlide] = useState(0)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const headerOpacity = useTransform(scrollYProgress, [0, 0.08, 0.2], [1, 1, 0])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: `+=${slides.length * 90}%`,
      pin: true,
      scrub: 0.4,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const idx = Math.min(slides.length - 1, Math.floor(self.progress * slides.length))
        setActiveSlide(idx)
      },
    })

    return () => st.kill()
  }, [])

  const active = slides[activeSlide]

  return (
    <section id="showcase" className="showcase-gallery" ref={sectionRef}>
      <div className="showcase-gallery-stage">
        <div className="showcase-slides" aria-hidden="true">
          {slides.map((slide, i) => (
            <GallerySlide
              key={slide.title}
              slide={slide}
              index={i}
              progress={scrollYProgress}
              total={slides.length}
            />
          ))}
        </div>

        <div className="showcase-grid-overlay" aria-hidden="true" />
        <div className="showcase-vignette" aria-hidden="true" />

        <motion.div className="showcase-header" style={{ opacity: headerOpacity }}>
          <span className="section-label">The Collection</span>
          <h2 className="showcase-headline">Every Angle</h2>
        </motion.div>

        <div className="showcase-progress" aria-hidden="true">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`showcase-progress-dot${i === activeSlide ? ' showcase-progress-dot--active' : ''}${i < activeSlide ? ' showcase-progress-dot--done' : ''}`}
            />
          ))}
        </div>

        <div className="showcase-info">
          <motion.span
            key={`tag-${activeSlide}`}
            className="showcase-info-tag"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {active.tag}
          </motion.span>
          <motion.h3
            key={`title-${activeSlide}`}
            className="showcase-info-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          >
            {active.title}
          </motion.h3>
          <motion.p
            key={`desc-${activeSlide}`}
            className="showcase-info-desc"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {active.detail}
          </motion.p>
          <div className="showcase-info-counter">
            <span>{String(activeSlide + 1).padStart(2, '0')}</span>
            <span className="showcase-info-total"> / {String(slides.length).padStart(2, '0')}</span>
          </div>
        </div>

        <p className="showcase-scroll-hint">Scroll to explore angles</p>
      </div>
    </section>
  )
}
