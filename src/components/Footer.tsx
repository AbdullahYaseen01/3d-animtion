import { motion } from 'framer-motion'
import './Footer.css'

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <motion.div
          className="footer-brand"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <span className="footer-logo">NOVA</span>
          <p className="footer-tagline">Premium Footwear Brand</p>
        </motion.div>

        <div className="footer-links">
          <a href="#showcase">Collection</a>
          <a href="#process">Craft</a>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
        </div>

        <p className="footer-copy">
          &copy; {new Date().getFullYear()} NOVA Footwear. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
