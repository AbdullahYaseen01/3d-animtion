import { motion, useScroll, useTransform } from 'framer-motion'
import './Navigation.css'

export function Navigation() {
  const { scrollY } = useScroll()
  const bgOpacity = useTransform(scrollY, [0, 120], [0, 0.95])
  const borderOpacity = useTransform(scrollY, [0, 120], [0, 1])
  const backgroundColor = useTransform(bgOpacity, (v) => `rgba(5, 5, 5, ${v})`)
  const borderBottomColor = useTransform(borderOpacity, (v) => `rgba(201, 169, 98, ${v * 0.12})`)

  return (
    <motion.header
      className="nav"
      style={{ backgroundColor, borderBottomColor }}
    >
      <nav className="nav-inner container">
        <motion.a
          href="#"
          className="nav-logo"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          NOVA
        </motion.a>

        <motion.ul
          className="nav-links"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <li><a href="#showcase">Collection</a></li>
          <li><a href="#process">Craft</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#contact">Contact</a></li>
        </motion.ul>

        <motion.a
          href="#contact"
          className="btn btn-primary nav-cta"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          Shop Now
        </motion.a>
      </nav>
    </motion.header>
  )
}
