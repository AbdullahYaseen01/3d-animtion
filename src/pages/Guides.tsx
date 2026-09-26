import { Link } from 'react-router'
import { guides } from '../data/guides'
import { InfoPage } from '../components/layout/InfoPage'
import { Icon } from '../components/ui/Icon'

export default function Guides() {
  return (
    <InfoPage
      seo={{
        title: 'Shoe, Bag & Watch Buying Guides',
        description:
          'Practical NOVA guides: measure your feet, choose a shoe width and running shoe, care for leather, and check bag, backpack and watch fit before you buy.',
        path: '/guides',
        image: '/og/collection-shoes.jpg',
        imageAlt: 'Cream sneakers worn on stone steps',
      }}
      eyebrow="Guides"
      title="Guides"
      intro={<p>Practical advice for choosing the right size, fit and style, and making it last.</p>}
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
