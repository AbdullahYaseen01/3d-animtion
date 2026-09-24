import { Component, type ErrorInfo, type ReactNode } from 'react'
import { store } from '../../config/store'

interface State {
  error: Error | null
}

/** Catches render errors in a page so the header, footer and cart keep working. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Page error', error.message, info.componentStack?.split('\n')[1]?.trim())
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="container container--narrow" style={{ paddingBlock: 'var(--space-section)' }}>
        <div className="empty-state">
          <h1>Something went wrong</h1>
          <p>
            This page hit an unexpected problem. Your cart is safe. Try reloading, or email <a href={`mailto:${store.supportEmail}`}>{store.supportEmail}</a> if it keeps happening.
          </p>
          <div className="hero__ctas" style={{ justifyContent: 'center' }}>
            <button type="button" className="btn" onClick={() => window.location.reload()}>
              Reload page
            </button>
            <a href="/" className="btn btn--secondary">
              Go to homepage
            </a>
          </div>
        </div>
      </div>
    )
  }
}
