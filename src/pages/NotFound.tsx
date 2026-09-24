import { Link, useNavigate } from 'react-router'
import { useState } from 'react'
import { activeCategories } from '../catalog'
import { Icon } from '../components/ui/Icon'
import { Seo } from '../lib/seo'

export default function NotFound() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  return (
    <>
      <Seo title="Page Not Found" description="The page you were looking for could not be found." path="/404" noindex />
      <div className="container container--narrow" style={{ paddingBlock: 'var(--space-section)' }}>
        <div className="empty-state" style={{ background: 'transparent', padding: 0 }}>
          <p className="eyebrow eyebrow--ember">Error 404</p>
          <h1 style={{ fontSize: 'var(--display-lg)' }}>Off the trail</h1>
          <p>We could not find that page. It may have moved, or the link may be mistyped. Try a search or pick a category below.</p>
          <form
            role="search"
            className="newsletter__row"
            style={{ width: '100%', maxWidth: '28rem' }}
            onSubmit={(e) => {
              e.preventDefault()
              navigate(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : '/shop')
            }}
          >
            <label htmlFor="nf-search" className="visually-hidden">
              Search shoes
            </label>
            <input id="nf-search" type="search" className="input" placeholder="Search shoes" value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: 1, minWidth: 0 }} />
            <button type="submit" className="btn">
              <Icon name="search" size={18} /> Search
            </button>
          </form>
          <ul role="list" className="chip-list" style={{ justifyContent: 'center' }}>
            <li>
              <Link to="/shop" className="chip">
                Shop all
              </Link>
            </li>
            {activeCategories().map((c) => (
              <li key={c.slug}>
                <Link to={`/collections/${c.slug}`} className="chip">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/" className="chip">
                Home
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
