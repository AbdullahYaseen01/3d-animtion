import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

interface RevealOnScrollProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  amount?: number
}

export function RevealOnScroll({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  amount = 48,
}: RevealOnScrollProps) {
  const offsets = {
    up: { y: amount, x: 0 },
    down: { y: -amount, x: 0 },
    left: { y: 0, x: amount },
    right: { y: 0, x: -amount },
  }

  const { x, y } = offsets[direction]

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

interface ParallaxImageProps {
  src: string
  alt: string
  className?: string
  scrollProgress?: MotionValue<number>
  speed?: number
}

export function ParallaxImage({
  src,
  alt,
  className = '',
  scrollProgress,
  speed = 0.15,
}: ParallaxImageProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const progress = scrollProgress ?? scrollYProgress
  const y = useTransform(progress, [0, 1], [`-${speed * 100}%`, `${speed * 100}%`])
  const scale = useTransform(progress, [0, 0.5, 1], [1.08, 1, 1.08])

  return (
    <div ref={ref} className={`parallax-image-wrap ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        className="parallax-image"
        style={{ y, scale }}
        loading="lazy"
        decoding="async"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
      <div className="parallax-image-shine" aria-hidden="true" />
    </div>
  )
}

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

export const fadeUpItem = {
  hidden: { opacity: 0, y: 40, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
}
