import { motion } from 'framer-motion'
import './CTASection.css'

export function CTASection() {
  return (
    <section id="contact" className="cta">
      <div className="cta-bg">
        <div className="cta-orb cta-orb--1" />
        <div className="cta-orb cta-orb--2" />
      </div>

      <div className="container cta-content">
        <motion.span
          className="section-label"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Join The Movement
        </motion.span>

        <motion.h2
          className="cta-title"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.8 }}
        >
          Ready to step
          <br />
          <span>into NOVA?</span>
        </motion.h2>

        <motion.p
          className="cta-subtitle"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Discover our latest drops, exclusive releases, and limited-edition
          colorways — built for those who never stand still.
        </motion.p>

        <motion.div
          className="cta-actions"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <a href="mailto:hello@novafootwear.com" className="btn btn-primary">
            Shop Now
          </a>
          <a href="#showcase" className="btn">
            View Collection
          </a>
        </motion.div>
      </div>
    </section>
  )
}
