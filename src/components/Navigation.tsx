import { motion, useScroll, useTransform } from 'framer-motion'
import './Navigation.css'

const links = [
  { href: '#showcase', label: 'Collection' },
  { href: '#process', label: 'Craft' },
  { href: '#features', label: 'Features' },
  { href: '#contact', label: 'Contact' },
]

export function Navigation() {
  const { scrollY } = useScroll()
  const bgOpacity = useTransform(scrollY, [0, 80], [0.15, 0.92])
  const blur = useTransform(scrollY, [0, 80], [4, 16])
  const borderOpacity = useTransform(scrollY, [0, 80], [0.3, 1])

  const backgroundColor = useTransform(
    bgOpacity,
    (v) => `rgba(12, 10, 8, ${v})`,
  )
  const backdropBlur = useTransform(blur, (v) => `blur(${v}px)`)
  const borderBottomColor = useTransform(
    borderOpacity,
    (v) => `rgba(232, 160, 64, ${v * 0.25})`,
  )

  return (
    <motion.header
      className="nav"
      style={{ backgroundColor, backdropFilter: backdropBlur, borderBottomColor }}
    >
      <div className="nav-accent" aria-hidden="true" />

      <nav className="nav-inner container">
        <motion.a
          href="#"
          className="nav-logo"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          whileHover={{ scale: 1.04 }}
        >
          <span className="nav-logo-text">NOVA</span>
          <span className="nav-logo-dot" aria-hidden="true" />
        </motion.a>

        <motion.ul
          className="nav-links"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          {links.map((link, i) => (
            <li key={link.href}>
              <motion.a
                href={link.href}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 + i * 0.06, duration: 0.5 }}
                whileHover={{ y: -2 }}
              >
                <span className="nav-link-text">{link.label}</span>
                <span className="nav-link-line" aria-hidden="true" />
              </motion.a>
            </li>
          ))}
        </motion.ul>

        <motion.a
          href="#contact"
          className="nav-cta"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          whileHover={{ scale: 1.05, boxShadow: '0 6px 28px rgba(232, 160, 64, 0.45)' }}
          whileTap={{ scale: 0.97 }}
        >
          <span>Shop Now</span>
          <span className="nav-cta-arrow" aria-hidden="true">→</span>
        </motion.a>
      </nav>
    </motion.header>
  )
}
