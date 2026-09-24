import { formatSize, type Product } from '../../catalog'
import { applyFilters, facetsFor, type FilterState } from '../../catalog/filters'
import './Catalog.css'

interface Props {
  source: Product[]
  state: FilterState
  onChange: (next: Partial<FilterState>) => void
  showCategory: boolean
  idPrefix: string
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export function FilterPanel({ source, state, onChange, showCategory, idPrefix }: Props) {
  const facets = facetsFor(source)
  const countWith = (patch: Partial<FilterState>) => applyFilters(source, { ...state, ...patch, page: 1 }).total

  return (
    <div className="filters">
      {showCategory && facets.categories.length > 1 && (
        <details className="filter-group" open>
          <summary>Category</summary>
          <ul role="list" className="filter-options">
            {facets.categories.map((c) => {
              const n = countWith({ category: [c.slug] })
              return (
                <li key={c.slug}>
                  <label className="checkbox filter-check">
                    <input
                      type="checkbox"
                      checked={state.category.includes(c.slug)}
                      onChange={() => onChange({ category: toggle(state.category, c.slug), page: 1 })}
                    />
                    <span>
                      {c.name} <span className="muted">({n})</span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </details>
      )}

      <details className="filter-group" open>
        <summary>
          Size <span className="muted">(US men's, in stock)</span>
        </summary>
        <div className="filter-sizes" role="group" aria-label="Sizes">
          {facets.sizes.map((s) => {
            const on = state.size.includes(s)
            return (
              <button
                key={s}
                type="button"
                className={`filter-size${on ? ' is-on' : ''}`}
                aria-pressed={on}
                aria-label={`Size ${formatSize(s)}`}
                onClick={() => onChange({ size: toggle(state.size, s), page: 1 })}
              >
                {formatSize(s)}
              </button>
            )
          })}
        </div>
      </details>

      {facets.widths.length > 1 && (
        <details className="filter-group" open>
          <summary>Width</summary>
          <ul role="list" className="filter-options">
            {facets.widths.map((w) => (
              <li key={w.code}>
                <label className="checkbox filter-check">
                  <input
                    type="checkbox"
                    checked={state.width.includes(w.code)}
                    onChange={() => onChange({ width: toggle(state.width, w.code), page: 1 })}
                  />
                  <span>
                    {w.label} ({w.code}) <span className="muted">({countWith({ width: [w.code] })})</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </details>
      )}

      <details className="filter-group" open>
        <summary>Color</summary>
        <ul role="list" className="filter-options filter-options--colors">
          {facets.colors.map((c) => (
            <li key={c.value}>
              <label className="checkbox filter-check">
                <input
                  type="checkbox"
                  checked={state.color.includes(c.value)}
                  onChange={() => onChange({ color: toggle(state.color, c.value), page: 1 })}
                />
                <span className="filter-color">
                  <span className="swatch" style={{ '--swatch-a': c.hex } as React.CSSProperties} aria-hidden="true" />
                  {c.label} <span className="muted">({countWith({ color: [c.value] })})</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </details>

      {facets.prices.length > 1 && (
        <details className="filter-group" open>
          <summary>Price</summary>
          <ul role="list" className="filter-options">
            {facets.prices.map((p) => (
              <li key={p.value}>
                <label className="checkbox filter-check">
                  <input
                    type="checkbox"
                    checked={state.price.includes(p.value)}
                    onChange={() => onChange({ price: toggle(state.price, p.value), page: 1 })}
                  />
                  <span>
                    {p.label} <span className="muted">({countWith({ price: [p.value] })})</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="filter-group filter-group--plain">
        <label className="checkbox filter-check" htmlFor={`${idPrefix}-instock`}>
          <input id={`${idPrefix}-instock`} type="checkbox" checked={state.inStock} onChange={(e) => onChange({ inStock: e.target.checked, page: 1 })} />
          <span>In stock only</span>
        </label>
      </div>
    </div>
  )
}
