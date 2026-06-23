import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { RevealOnScroll, staggerContainer, fadeUpItem } from './motion/MotionPrimitives'
import showcaseImages from '../data/showcaseImages.json'
import './FeatureSection.css'
import './motion/MotionPrimitives.css'

const { features: featureImages } = showcaseImages

const features = [
  {
    tag: 'Materials',
    icon: '◈',
    title: 'Premium Materials',
    description: 'Italian-grade leather and breathable mesh — soft from day one, built to last.',
    spec: 'Full-grain leather',
    image: featureImages.materials ?? '/features/materials.webp',
    accent: '#c9a962',
  },
  {
    tag: 'Comfort',
    icon: '◎',
    title: 'All-Day Comfort',
    description: 'Cloud-soft midsole with arch support — walk miles without slowing down.',
    spec: '8hr cloud cushion',
    image: featureImages.comfort ?? '/features/comfort.webp',
    accent: '#7ec8a4',
  },
  {
    tag: 'Performance',
    icon: '◇',
    title: 'Street Performance',
    description: 'High-traction rubber outsole and a lightweight frame that moves with you.',
    spec: 'Grip+ outsole',
    image: featureImages.performance ?? '/features/performance.webp',
    accent: '#ff8c42',
  },
  {
    tag: 'Style',
    icon: '◆',
    title: 'Iconic Design',
    description: 'Bold silhouettes and limited colorways — made to stand out on every street.',
    spec: 'Limited drops',
    image: featureImages.style ?? '/features/style.webp',
    accent: '#e8a040',
  },
]

function FeatureCard({
  feature,
  index,
  isActive,
  onActivate,
}: {
  feature: (typeof features)[0]
  index: number
  isActive: boolean
  onActivate: () => void
}) {
  const cardRef = useRef<HTMLElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 180, damping: 22 })
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 180, damping: 22 })
  const imgX = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 120, damping: 20 })
  const imgY = useSpring(useTransform(my, [-0.5, 0.5], [-6, 6]), { stiffness: 120, damping: 20 })

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    mx.set((e.clientX - rect.left) / rect.width - 0.5)
    my.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleLeave = () => {
    mx.set(0)
    my.set(0)
  }

  return (
    <motion.article
      ref={cardRef}
      className={`feature-card${isActive ? ' feature-card--active' : ''}`}
      variants={fadeUpItem}
      style={
        {
          '--feature-accent': feature.accent,
          rotateX,
          rotateY,
          transformPerspective: 900,
        } as React.CSSProperties
      }
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onActivate()
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={isActive}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="feature-index" aria-hidden="true">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="feature-image-wrap">
        <motion.img
          src={feature.image}
          alt={feature.title}
          className="feature-image"
          loading="lazy"
          decoding="async"
          style={{ x: imgX, y: imgY, scale: isActive ? 1.1 : 1.04 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="feature-image-overlay" aria-hidden="true" />
        <div className="feature-image-shine" aria-hidden="true" />
        <span className="feature-tag">{feature.tag}</span>
        <span className="feature-spec">{feature.spec}</span>
      </div>

      <div className="feature-content">
        <span className="feature-icon">{feature.icon}</span>
        <h3 className="feature-title">{feature.title}</h3>
        <p className="feature-desc">{feature.description}</p>
      </div>

      <div className="feature-glow" aria-hidden="true" />
      <div className="feature-line" aria-hidden="true" />
      <div className="feature-border-glow" aria-hidden="true" />
    </motion.article>
  )
}

export function FeatureSection() {
  const ref = useRef(null)
  const [active, setActive] = useState(0)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="features" className="features" ref={ref}>
      <div className="features-bg-grid" aria-hidden="true" />
      <div className="features-bg-orb features-bg-orb--1" aria-hidden="true" />
      <div className="features-bg-orb features-bg-orb--2" aria-hidden="true" />

      <div className="container">
        <RevealOnScroll className="features-header">
          <span className="section-label">Why NOVA</span>
          <h2 className="section-title">Built Different</h2>
          <p className="section-subtitle">
            Four pillars behind every pair — comfort, quality, performance, and style
            you can feel with every step.
          </p>
        </RevealOnScroll>

        <div className="features-nav" aria-hidden="true">
          {features.map((f, i) => (
            <button
              key={f.title}
              type="button"
              className={`features-nav-dot${active === i ? ' features-nav-dot--active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Highlight ${f.title}`}
            />
          ))}
        </div>

        <motion.div
          className="features-grid"
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {features.map((feature, i) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={i}
              isActive={active === i}
              onActivate={() => setActive(i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
