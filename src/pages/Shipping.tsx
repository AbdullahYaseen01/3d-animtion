import { Link } from 'react-router'
import { store } from '../config/store'
import { InfoPage } from '../components/layout/InfoPage'
import { formatMoney } from '../lib/money'
import { pageKeywords } from '../lib/seoKeywords'

export default function Shipping() {
  const { standard, express, freeThresholdCents, processingBusinessDays: proc } = store.shipping
  const rates = [standard, express].filter((r) => r != null)
  const price = (cents: number) => (cents === 0 ? 'Free' : formatMoney(cents))
  return (
    <InfoPage
      seo={{
        title: pageKeywords.shipping.title,
        description: pageKeywords.shipping.description,
        path: '/shipping',
      }}
      eyebrow="Help"
      title={pageKeywords.shipping.h1}
      intro={<p>Choose your country at checkout. Rates and delivery estimates are shown below and again before you pay.</p>}
    >
      <h2 id="rates">Rates and delivery times</h2>
      <div className="table-wrap" tabIndex={0} role="region" aria-labelledby="rates">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Method</th>
              <th scope="col">Cost</th>
              <th scope="col">Time in transit</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((r) => (
              <tr key={r.label}>
                <th scope="row">{r.label}</th>
                <td>
                  {freeThresholdCents != null && r === standard ? `${price(r.priceCents)}; free on orders over ${formatMoney(freeThresholdCents)}` : price(r.priceCents)}
                </td>
                <td>
                  {r.minBusinessDays}–{r.maxBusinessDays} business days
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Processing</h2>
      <p>
        Orders are usually processed and handed to the carrier within {proc} business {proc === 1 ? 'day' : 'days'}. Orders placed on weekends or US public holidays are
        processed on the next business day. Delivery times are estimates from the carrier and are not guaranteed.
      </p>

      <h2>Where we ship</h2>
      <p>Choose any country at checkout. Include the house or apartment number, street, city, state or province, and postal code so the parcel can be delivered to the right door.</p>

      <h2>Sales tax</h2>
      <p>Where sales tax applies, it is calculated at checkout based on your shipping address and shown before you pay.</p>

      <h2>Tracking</h2>
      <p>Once your order ships, you will receive an email with tracking details from us or the carrier.</p>

      <h2>Problems with delivery</h2>
      <p>
        If your tracking shows delivered but you cannot find your parcel, or it arrives damaged, <Link to="/contact">contact us</Link> with your order number and we will help.
      </p>
    </InfoPage>
  )
}
