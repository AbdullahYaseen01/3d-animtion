import { Link } from 'react-router'
import { guides } from '../data/guides'
import { pageKeywords } from '../lib/seoKeywords'
import { InfoPage } from '../components/layout/InfoPage'
import { Icon } from '../components/ui/Icon'

export default function Guides() {
  return (
    <InfoPage
      seo={{
        title: pageKeywords.guides.title,
        description: pageKeywords.guides.description,
        path: '/guides',
        image: '/og/collection-shoes.jpg',
        imageAlt: 'Cream sneakers worn on stone steps',
      }}
      eyebrow="Guides"
      title={pageKeywords.guides.h1}
      intro={<p>Practical advice for choosing the right size, fit, and style, caring for what you buy, and picking gifts, written around the products we actually sell.</p>}
      help={false}
    >
      <ul role="list" className="guide-list">
        {guides.map((g) => (
          <li key={g.slug}>
            <h2>
              <Link to={`/guides/${g.slug}`}>{g.title}</Link>
            </h2>
            <p>{g.description}</p>
            <span className="link-arrow" aria-hidden="true">
              Read guide <Icon name="arrow" size={16} />
            </span>
          </li>
        ))}
      </ul>
    </InfoPage>
  )
}
