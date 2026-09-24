import { useId, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { activeCategories, allProducts } from '../../catalog'
import { searchScore } from '../../catalog/filters'
import { formatMoney } from '../../lib/money'
import { Dialog } from '../ui/Dialog'
import { Icon } from '../ui/Icon'
import { ProductImage } from '../ui/ProductImage'

const POPULAR = ['Running', 'Wide', 'Leather', 'Slip-on', 'Trail']

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const inputId = useId()
  const matches = useMemo(
    () =>
      q.trim()
        ? allProducts()
            .map((p) => ({ p, score: searchScore(p, q) }))
            .filter((x) => x.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 4)
            .map((x) => x.p)
        : [],
    [q],
  )
  const cats = useMemo(
    () => (q.trim() ? activeCategories().filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase())) : []),
    [q],
  )

  const submit = (term: string) => {
    const value = term.trim()
    if (!value) return
    onClose()
    navigate(`/search?q=${encodeURIComponent(value)}`)
  }

  return (
    <Dialog open={open} onClose={onClose} title="Search" hideTitle variant="sheet" className="search-dialog">
      <form
        role="search"
        className="search-dialog__form"
        onSubmit={(e) => {
          e.preventDefault()
          submit(q)
        }}
      >
        <label htmlFor={inputId} className="visually-hidden">
          Search NOVA
        </label>
        <Icon name="search" />
        <input
          id={inputId}
          type="search"
          className="search-dialog__input"
          placeholder="Try: black handbag under $100"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoComplete="off"
          enterKeyHint="search"
          autoFocus
          maxLength={80}
        />
        <button type="submit" className="btn">
          Search
        </button>
      </form>

      {!q.trim() ? (
        <div className="search-dialog__section">
          <p className="eyebrow">Popular searches</p>
          <ul role="list" className="chip-list">
            {POPULAR.map((term) => (
              <li key={term}>
                <button type="button" className="chip" onClick={() => submit(term)}>
                  {term}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="search-dialog__section" aria-live="polite">
          {cats.length > 0 && (
            <ul role="list" className="chip-list">
              {cats.map((c) => (
                <li key={c.slug}>
                  <Link className="chip" to={`/collections/${c.slug}`} onClick={onClose}>
                    {c.name} collection
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {matches.length > 0 ? (
            <ul role="list" className="search-suggest">
              {matches.map((p) => (
                <li key={p.id}>
                  <Link to={`/products/${p.slug}`} className="search-suggest__item" onClick={onClose}>
                    <span className="search-suggest__img">
                      <ProductImage image={p.colors[0].images[0]} alt="" sizes="64px" />
                    </span>
                    <span>
                      <strong>{p.name}</strong>
                      <span className="muted">{p.tagline}</span>
                    </span>
                    <span className="search-suggest__price">{formatMoney(p.priceCents)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">
              No matches yet. Press Search to see all results, or <Link to="/shop" onClick={onClose}>browse the edit</Link>.
            </p>
          )}
        </div>
      )}
    </Dialog>
  )
}
