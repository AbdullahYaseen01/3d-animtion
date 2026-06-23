import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, useScroll, useTransform } from 'framer-motion'
import { RevealOnScroll } from './motion/MotionPrimitives'
import showcaseImages from '../data/showcaseImages.json'
import './HorizontalScrollSection.css'
import './motion/MotionPrimitives.css'

const { process: imgs } = showcaseImages

const panels = [
  {
    number: '01',
    title: 'Design',
    description: 'Original sketches and inspiration shape every curve, color, and contour.',
    tag: 'Sketch',
    image: imgs.concept,
  },
  {
    number: '02',
    title: 'Materials',
    description: 'Premium leather, mesh, and rubber selected for durability and all-day comfort.',
    tag: 'Sourcing',
    image: imgs.modeling,
  },
  {
    number: '03',
    title: 'Construction',
    description: 'Hand-finished stitching and layered build — quality you can see and feel.',
    tag: 'Build',
    image: imgs.texturing,
  },
  {
    number: '04',
    title: 'Comfort',
    description: 'Responsive foam cushioning engineered for miles of effortless wear.',
    tag: 'Cushion',
    image: imgs.rigging,
  },
  {
    number: '05',
    title: 'Performance',
    description: 'Grip outsole and lightweight frame tested on streets, tracks, and everywhere between.',
    tag: 'Testing',
    image: imgs.animation,
  },
  {
    number: '06',
    title: 'Launch',
    description: 'The finished pair — ready to wear, built to turn heads wherever you go.',
    tag: 'Release',
    image: imgs.render,
  },
]

function ProcessPanel({
  panel,
  isActive,
}: {
  panel: (typeof panels)[0]
  isActive: boolean
}) {
  const panelRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: panelRef,
    offset: ['start end', 'end start'],
  })
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1.14, 1.08])

  return (
    <motion.article
      ref={panelRef}
      className={`horizontal-panel${isActive ? ' horizontal-panel--active' : ''}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{
        scale: isActive ? 1 : 0.96,
        opacity: isActive ? 1 : 0.55,
        y: 0,
      }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="panel-image-wrap">
        <motion.img
          src={panel.image}
          alt={`${panel.title} — ${panel.tag}`}
          className="panel-image"
          style={{ scale: imageScale }}
          loading="lazy"
          decoding="async"
        />
        <div className="panel-image-shine" aria-hidden="true" />
        <div className="panel-image-vignette" aria-hidden="true" />
        <span className="panel-tag panel-tag--overlay">{panel.tag}</span>
        <span className="panel-step-badge">{panel.number}</span>
      </div>

      <div className="panel-body">
        <span className="panel-number">{panel.number}</span>
        <h3 className="panel-title">{panel.title}</h3>
        <p className="panel-desc">{panel.description}</p>
        <div className="panel-line" />
      </div>
    </motion.article>
  )
}

export function HorizontalScrollSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [scrollPct, setScrollPct] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    const scrollWidth = track.scrollWidth - window.innerWidth

    gsap.to(track, {
      x: -scrollWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${scrollWidth}`,
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          setScrollPct(Math.round(self.progress * 100))
          const idx = Math.round(self.progress * (panels.length - 1))
          setActiveStep(idx)
        },
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === section) t.kill()
      })
    }
  }, [])

  return (
    <section id="process" className="horizontal-scroll" ref={sectionRef}>
      <div className="horizontal-scroll-header container">
        <div className="horizontal-scroll-header-row">
          <div>
            <RevealOnScroll>
              <span className="section-label">How It's Made</span>
            </RevealOnScroll>
            <RevealOnScroll delay={0.08}>
              <h2 className="section-title">Our Craft</h2>
            </RevealOnScroll>
          </div>

          <RevealOnScroll delay={0.12} className="process-meta">
            <span className="process-step-counter">
              {String(activeStep + 1).padStart(2, '0')}
              <span className="process-step-total"> / {String(panels.length).padStart(2, '0')}</span>
            </span>
            <div className="process-progress-bar">
              <motion.div
                className="process-progress-fill"
                animate={{ width: `${scrollPct}%` }}
                transition={{ duration: 0.15, ease: 'linear' }}
              />
            </div>
          </RevealOnScroll>
        </div>

        <div className="process-dots" aria-hidden="true">
          {panels.map((panel, i) => (
            <span
              key={panel.number}
              className={`process-dot${i === activeStep ? ' process-dot--active' : ''}${i < activeStep ? ' process-dot--done' : ''}`}
            />
          ))}
        </div>
      </div>

      <div className="horizontal-scroll-track" ref={trackRef}>
        {panels.map((panel, i) => (
          <ProcessPanel key={panel.number} panel={panel} isActive={i === activeStep} />
        ))}
      </div>

      <p className="process-scroll-hint" aria-hidden="true">
        Scroll to explore
      </p>
    </section>
  )
}
