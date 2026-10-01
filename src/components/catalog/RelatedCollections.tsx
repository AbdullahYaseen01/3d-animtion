import { Link } from 'react-router'
import { getCategory } from '../../catalog'
import { relatedCollections } from '../../lib/seoKeywords'

/** Descriptive links to sibling collections. Empty collections are skipped so no link lands on a 404. */
export function RelatedCollections({ slug, title, extra = [] }: { slug: string; title: string; extra?: { href: string; label: string }[] }) {
  const links = [
    ...(relatedCollections[slug] ?? []).filter((l) => {
      const target = l.href.replace('/collections/', '')
      return target !== slug && !!getCategory(target)
    }),
    ...extra,
  ]
  if (!links.length) return null
  const id = `related-${slug}`
  return (
    <section className="catalog-more" aria-labelledby={id}>
      <h2 id={id} className="eyebrow">
        {title}
      </h2>
      <ul role="list" className="chip-list">
        {links.map((l) => (
          <li key={l.href}>
            <Link className="chip" to={l.href}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
