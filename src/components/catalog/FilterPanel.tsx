import type { Product } from '../../catalog'
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

      {facets.sizes.length > 0 && (
        <details className="filter-group" open>
          <summary>
            Size{' '}
            <span className="muted">{source.every((p) => p.variant === 'footwear') ? '(US men\'s, in stock)' : '(in stock)'}</span>
          </summary>
          <div className="filter-sizes" role="group" aria-label="Sizes">
            {facets.sizes.map((s) => {
              const on = state.size.includes(s.value)
              return (
                <button
                  key={s.value}
                  type="button"
                  className={`filter-size${on ? ' is-on' : ''}`}
                  aria-pressed={on}
                  aria-label={`Size ${s.label}`}
                  onClick={() => onChange({ size: toggle(state.size, s.value), page: 1 })}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
        </details>
      )}

      {facets.uses.length > 1 && (
        <details className="filter-group" open>
          <summary>Use</summary>
          <ul role="list" className="filter-options">
            {facets.uses.map((u) => (
              <li key={u.slug}>
                <label className="checkbox filter-check">
                  <input
                    type="checkbox"
                    checked={state.use.includes(u.slug as 'running')}
                    onChange={() => onChange({ use: toggle(state.use, u.slug as 'running'), page: 1 })}
                  />
                  <span>
                    {u.name} <span className="muted">({countWith({ use: [u.slug as 'running'] })})</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </details>
      )}

      {facets.traits.map((group) => (
        <details key={group.group} className="filter-group" open>
          <summary>{group.group}</summary>
          <ul role="list" className="filter-options">
            {group.values.map((value) => {
              const key = `${group.group}:${value}`
              return (
                <li key={key}>
                  <label className="checkbox filter-check">
                    <input
                      type="checkbox"
                      checked={state.trait.includes(key)}
                      onChange={() => onChange({ trait: toggle(state.trait, key), page: 1 })}
                    />
                    <span>
                      {value} <span className="muted">({countWith({ trait: [key] })})</span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </details>
      ))}

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
