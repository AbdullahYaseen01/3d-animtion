import { Link } from 'react-router'
import { activeCategories } from '../catalog'
import { store } from '../config/store'
import { guides } from '../data/guides'
import { InfoPage } from '../components/layout/InfoPage'
import { organizationLd } from '../lib/seo'
import { pageKeywords } from '../lib/seoKeywords'

const kw = pageKeywords.press
const ASSET_GUIDES = ['how-to-choose-a-mens-pea-coat', 'trench-coat-vs-overcoat', 'how-to-clean-gold-plated-jewelry', 'holiday-gift-guide-for-him', 'holiday-gift-guide-for-her']

export default function Press() {
  const departments = activeCategories()
  const total = departments.reduce((sum, c) => sum + c.count, 0)
  const s = store.shipping.standard
  const assets = ASSET_GUIDES.map((slug) => guides.find((g) => g.slug === slug)).filter((g) => !!g)
  return (
    <InfoPage
      seo={{ title: kw.title, description: kw.description, path: '/press', image: '/og/home.jpg', imageAlt: 'Westora Style sneakers, bags, and accessories', jsonLd: [organizationLd()] }}
      eyebrow="Press"
      title={kw.h1}
      intro={<p>Facts about {store.name} for journalists, editors, and gift-guide writers. Everything below is current and verifiable on this site.</p>}
    >
      <h2>Store facts</h2>
      <ul>
        <li>
          {store.name} is an online store at westorastyle.com serving US customers. We are a retailer: we do not design or manufacture the products we sell.
        </li>
        <li>
          We currently list {total} products across {departments.length} departments: {departments.map((c) => c.name.toLowerCase()).join(', ')}.
        </li>
        <li>Brands include Ndure, ZED, Bag X, Meerzah, and Metro, many based in Pakistan, plus watches from Casio, Daniel Klein, Naviforce, Fossil, and others.</li>
        <li>
          {s.priceCents === 0 ? 'Free standard shipping' : 'Standard shipping'} to US addresses in {s.minBusinessDays}–{s.maxBusinessDays} business days after{' '}
          {store.shipping.processingBusinessDays} business day of processing, and {store.returns.windowDays}-day returns.
        </li>
        <li>We do not publish customer ratings or reviews on product pages, and we do not run fake countdown timers.</li>
      </ul>

      <h2>Story angles we can help with</h2>
      <ul>
        <li>Reading a coat’s fabric line: why a “wool” coat can list mostly cotton and polyester, with real examples from our range.</li>
        <li>Affordable gifts that need no size: wallets, watches, and jewelry, with exact specs.</li>
        <li>Pakistani fashion brands sold to US shoppers, and what changes when a product crosses markets.</li>
      </ul>

      <h2>Guides you can cite or link</h2>
      <ul>
        {assets.map((g) => (
          <li key={g.slug}>
            <Link to={`/guides/${g.slug}`}>{g.title}</Link>
          </li>
        ))}
        <li>
          <Link to="/fit-guide">Shoe size chart: US, UK, and EU conversions with foot length</Link>
        </li>
      </ul>

      <h2>Product images</h2>
      <p>
        Product photos belong to the brands that make the products. Please ask before using them, and credit the brand. We can point you to the right source for each
        image.
      </p>

      <h2>Media contact</h2>
      <p>
        Email <a href={`mailto:${store.supportEmail}`}>{store.supportEmail}</a> with “Press” in the subject line. Tell us your deadline and we will reply with facts,
        prices, and product links.
      </p>
    </InfoPage>
  )
}
