import '@fontsource-variable/big-shoulders-display/wght'
import '@fontsource-variable/instrument-sans/wght'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { App } from './App'
import { initAnalytics } from './lib/analytics'

const container = document.getElementById('root')!
const tree = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)

// Element children mean this HTML was prerendered. The dev placeholder is only a
// comment, and query URLs are not prerendered, so those render from scratch.
const prerendered = container.children.length > 0 && !window.location.search
if (prerendered) {
  hydrateRoot(container, tree)
} else {
  container.replaceChildren()
  createRoot(container).render(tree)
}

initAnalytics()
