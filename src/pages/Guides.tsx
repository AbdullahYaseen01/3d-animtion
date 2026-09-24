import { Link } from 'react-router'
import { guides } from '../data/guides'
import { InfoPage } from '../components/layout/InfoPage'
import { Icon } from '../components/ui/Icon'

export default function Guides() {
  return (
    <InfoPage
      seo={{ title: 'Shoe Guides', description: 'Practical guides to measuring your feet, choosing running shoes and caring for leather sneakers.', path: '/guides' }}
      eyebrow="Guides"
      title="Guides"
      intro={<p>Practical advice for choosing the right pair and making it last.</p>}
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
