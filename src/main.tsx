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

// Pages are prerendered without query strings, so URLs with filters or a selected
// color would not match the static HTML; render those fresh instead of hydrating.
if (container.hasChildNodes() && !window.location.search) {
  hydrateRoot(container, tree)
} else {
  createRoot(container).render(tree)
}

initAnalytics()
