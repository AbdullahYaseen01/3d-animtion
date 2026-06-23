import { motion } from 'framer-motion'
import './Footer.css'

const navLinks = [
  { href: '#showcase', label: 'Collection' },
  { href: '#process', label: 'Craft' },
  { href: '#features', label: 'Features' },
  { href: '#contact', label: 'Contact' },
]

const socialLinks = [
  { href: '#', label: 'Instagram', icon: '◉' },
  { href: '#', label: 'Twitter', icon: '◎' },
  { href: '#', label: 'YouTube', icon: '◈' },
]

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-glow footer-glow--1" aria-hidden="true" />
      <div className="footer-glow footer-glow--2" aria-hidden="true" />
      <div className="footer-accent-bar" aria-hidden="true" />

      <div className="container footer-inner">
        <motion.div
          className="footer-top"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="footer-brand">
            <span className="footer-logo">NOVA</span>
            <p className="footer-tagline">
              Premium footwear for those who{' '}
              <span className="footer-tagline-accent">never stand still.</span>
            </p>
          </div>

          <div className="footer-columns">
            <div className="footer-col">
              <span className="footer-col-label">Explore</span>
              <nav className="footer-links">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.5 }}
                    whileHover={{ x: 4, color: 'var(--accent)' }}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>
            </div>

            <div className="footer-col">
              <span className="footer-col-label">Follow</span>
              <div className="footer-social">
                {socialLinks.map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    className="footer-social-link"
                    aria-label={link.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
                    whileHover={{ scale: 1.12, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="footer-social-icon">{link.icon}</span>
                    <span>{link.label}</span>
                  </motion.a>
                ))}
              </div>
            </div>

            <div className="footer-col footer-col--cta">
              <span className="footer-col-label">Stay Updated</span>
              <p className="footer-cta-text">Get drops, restocks & exclusive colorways first.</p>
              <motion.a
                href="#contact"
                className="footer-cta-btn"
                whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(201, 169, 98, 0.35)' }}
                whileTap={{ scale: 0.98 }}
              >
                Join The List
              </motion.a>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="footer-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} NOVA Footwear. All rights reserved.
          </p>
          <div className="footer-badges">
            <span className="footer-badge">Free Shipping</span>
            <span className="footer-badge footer-badge--accent">Premium Craft</span>
            <span className="footer-badge">30-Day Returns</span>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
