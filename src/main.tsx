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
import { preloadAllPages, preloadPage } from './routes'

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

// Let the prerendered HTML paint before the main thread is taken by hydration.
const afterPaint = () =>
  new Promise<void>((resolve) => {
    if (document.visibilityState === 'hidden') return resolve()
    requestAnimationFrame(() => setTimeout(resolve, 0))
  })

// The current page's code must be loaded before hydrating, or React would replace
// the prerendered markup with the Suspense fallback.
Promise.all([preloadPage(window.location.pathname).catch(() => undefined), afterPaint()])
  .then(() => {
    if (prerendered) {
      hydrateRoot(container, tree)
    } else {
      container.replaceChildren()
      createRoot(container).render(tree)
    }
    initAnalytics()
    // Fetch the other pages after load, once idle, so later navigation does not wait on the network.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500))
    const warm = () => idle(() => void preloadAllPages().catch(() => undefined))
    if (document.readyState === 'complete') warm()
    else window.addEventListener('load', warm, { once: true })
  })
