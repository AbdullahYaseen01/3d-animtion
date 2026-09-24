import { Link } from 'react-router'

export interface Crumb {
  name: string
  path: string
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol role="list">
        {items.map((item, i) => (
          <li key={item.path}>
            {i < items.length - 1 ? (
              <Link to={item.path}>{item.name}</Link>
            ) : (
              <span aria-current="page">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
