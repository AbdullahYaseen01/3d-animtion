import { motion, useInView, useScroll, useTransform } from 'framer-motion'
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
    image: featureImages.photoreal,
  },
  {
    tag: 'Comfort',
    icon: '◎',
    title: 'All-Day Comfort',
    description: 'Cloud-soft midsole with arch support — walk miles without slowing down.',
    image: featureImages.animation,
  },
  {
    tag: 'Performance',
    icon: '◇',
    title: 'Street Performance',
    description: 'High-traction rubber outsole and a lightweight frame that moves with you.',
    image: featureImages.interactive,
  },
  {
    tag: 'Style',
    icon: '◆',
    title: 'Iconic Design',
    description: 'Bold silhouettes and limited colorways — made to stand out on every street.',
    image: featureImages['scroll-sync'],
  },
]

export function FeatureSection() {
  const ref = useRef(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '12%'])

  return (
    <section id="features" className="features" ref={ref}>
      <motion.div className="features-bg-orb" style={{ y: bgY }} aria-hidden="true" />

      <div className="container">
        <RevealOnScroll className="features-header">
          <span className="section-label">Why NOVA</span>
          <h2 className="section-title">Built Different</h2>
          <p className="section-subtitle">
            Four pillars behind every pair — comfort, quality, performance, and style
            you can feel with every step.
          </p>
        </RevealOnScroll>

        <motion.div
          className="features-grid"
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {features.map((feature, i) => (
            <motion.article
              key={feature.title}
              className={`feature-card${hovered === i ? ' feature-card--active' : ''}`}
              variants={fadeUpItem}
              onHoverStart={() => setHovered(i)}
              onHoverEnd={() => setHovered(null)}
              whileHover={{ y: -10, transition: { duration: 0.35 } }}
            >
              <div className="feature-image-wrap">
                <motion.img
                  src={feature.image}
                  alt={feature.title}
                  className="feature-image"
                  loading="lazy"
                  decoding="async"
                  animate={{ scale: hovered === i ? 1.08 : 1 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                />
                <div className="feature-image-shine" aria-hidden="true" />
                <span className="feature-tag">{feature.tag}</span>
              </div>
              <div className="feature-content">
                <span className="feature-icon">{feature.icon}</span>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.description}</p>
              </div>
              <div className="feature-glow" />
              <div className="feature-line" aria-hidden="true" />
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
