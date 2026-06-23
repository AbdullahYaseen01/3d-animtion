import { motion, useScroll, useTransform } from 'framer-motion'
import { useState } from 'react'
import './Navigation.css'

const links = [
  { href: '#showcase', label: 'Collection' },
  { href: '#process', label: 'Craft' },
  { href: '#features', label: 'Features' },
  { href: '#contact', label: 'Contact' },
]

export function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const bgOpacity = useTransform(scrollY, [0, 80], [0.15, 0.92])
  const blur = useTransform(scrollY, [0, 80], [4, 16])
  const borderOpacity = useTransform(scrollY, [0, 80], [0.3, 1])

  const backgroundColor = useTransform(bgOpacity, (v) => `rgba(12, 10, 8, ${v})`)
  const backdropBlur = useTransform(blur, (v) => `blur(${v}px)`)
  const borderBottomColor = useTransform(
    borderOpacity,
    (v) => `rgba(232, 160, 64, ${v * 0.25})`,
  )

  const closeMenu = () => setMenuOpen(false)

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
          onClick={closeMenu}
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

        <div className="nav-actions">
          <motion.a
            href="#contact"
            className="nav-cta"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            whileHover={{ scale: 1.05, boxShadow: '0 6px 28px rgba(232, 160, 64, 0.45)' }}
            whileTap={{ scale: 0.97 }}
            onClick={closeMenu}
          >
            <span>Shop Now</span>
            <span className="nav-cta-arrow" aria-hidden="true">→</span>
          </motion.a>

          <button
            type="button"
            className={`nav-toggle${menuOpen ? ' nav-toggle--open' : ''}`}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <motion.div
        className="nav-mobile"
        initial={false}
        animate={menuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <ul className="nav-mobile-links">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={closeMenu}>{link.label}</a>
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.header>
  )
}
