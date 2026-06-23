import { motion, useScroll, useTransform } from 'framer-motion'
import { HeroVideoBackground } from './HeroVideoBackground'
import './HeroSection.css'

export function HeroSection() {
  const { scrollYProgress } = useScroll()

  const topOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])
  const bottomOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])
  const topY = useTransform(scrollYProgress, [0, 0.1], [0, -40])
  const bottomY = useTransform(scrollYProgress, [0, 0.1], [0, 30])

  return (
    <section className="hero">
      <HeroVideoBackground scrollProgress={scrollYProgress} />

      <div className="hero-vignette" aria-hidden="true" />

      <motion.div className="hero-top" style={{ opacity: topOpacity, y: topY }}>
        <motion.span
          className="section-label"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Performance Footwear
        </motion.span>
        <motion.h1
          className="hero-headline hero-headline--top"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          Step
        </motion.h1>
      </motion.div>

      <motion.div className="hero-bottom" style={{ opacity: bottomOpacity, y: bottomY }}>
        <motion.h1
          className="hero-headline hero-headline--bottom"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Beyond
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75 }}
        >
          Premium sneakers engineered for comfort, style, and all-day performance —
          wherever the day takes you.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <a href="#showcase" className="btn btn-primary">
            Shop Collection
          </a>
          <a href="#process" className="btn">
            Our Craft
          </a>
        </motion.div>

        <motion.div
          className="hero-scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span>Scroll to discover</span>
          <motion.div
            className="scroll-line"
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
