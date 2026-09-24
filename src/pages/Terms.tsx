import { Link } from 'react-router'
import { store } from '../config/store'
import { DraftNotice, InfoPage } from '../components/layout/InfoPage'

export default function Terms() {
  return (
    <InfoPage
      seo={{ title: 'Terms of Service', description: 'The terms that apply when you use the NOVA website and buy from us.', path: '/terms' }}
      eyebrow="Legal"
      title="Terms of service"
      intro={<p>Last updated {store.legal.updated}</p>}
    >
      <DraftNotice />
      <p>These terms apply when you use this website or place an order with {store.legalName}. By placing an order, you agree to them.</p>

      <h2>Orders</h2>
      <p>
        Your order is an offer to buy. We accept it when we confirm your order by email. We may decline or cancel an order, for example if an item is unavailable or a pricing
        error occurred, in which case we will refund any payment in full.
      </p>

      <h2>Prices and payment</h2>
      <p>
        Prices are in US dollars and exclude sales tax, which is calculated at checkout where applicable. Payment is processed securely by Stripe. The total you pay is shown
        before you confirm your order.
      </p>

      <h2>Shipping</h2>
      <p>
        We ship to US addresses only. Delivery estimates are provided in good faith but are not guaranteed. See <Link to="/shipping">shipping information</Link>.
      </p>

      <h2>Returns</h2>
      <p>
        Returns are handled under our <Link to="/returns">returns policy</Link>.
      </p>

      <h2>Product information</h2>
      <p>We try to describe and display products accurately. Colors can vary slightly between screens, and sizing conversions are approximate.</p>

      <h2>Website use</h2>
      <p>Content on this site, including images and text, belongs to NOVA and may not be reused without permission. Do not misuse the site or attempt to interfere with its operation.</p>

      <h2>Limitation of liability</h2>
      <p>To the extent permitted by law, our liability for any order is limited to the amount you paid for it. Nothing in these terms limits rights you have under consumer protection law.</p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Email <a href={`mailto:${store.supportEmail}`}>{store.supportEmail}</a>.
      </p>
    </InfoPage>
  )
}
