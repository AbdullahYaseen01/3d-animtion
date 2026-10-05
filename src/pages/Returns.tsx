import { Link } from 'react-router'
import { store } from '../config/store'
import { InfoPage } from '../components/layout/InfoPage'
import { pageKeywords } from '../lib/seoKeywords'

export default function Returns() {
  const { windowDays, condition } = store.returns
  const s = store.shipping.standard
  return (
    <InfoPage
      seo={{
        title: pageKeywords.returns.title,
        description: pageKeywords.returns.description,
        path: '/returns',
      }}
      eyebrow="Help"
      title={pageKeywords.returns.h1}
      intro={
        <p>
          If an item is not right, you can return it within {windowDays} days of delivery for a refund to your original payment method, as long as it is {condition}.
        </p>
      }
      aside={
        <>
          <h2>At a glance</h2>
          <p>
            <strong>{windowDays} days</strong> from the delivery date.
          </p>
          <p>Unused or unworn, with original packaging.</p>
          <p>Refund to the original payment method after we inspect the return.</p>
          <p>
            Email <a href={`mailto:${store.supportEmail}`}>{store.supportEmail}</a> to start a return, or use the <Link to="/contact">contact form</Link> and choose{' '}
            <strong>Returns</strong>.
          </p>
        </>
      }
    >
      <h2 id="eligibility">What can be returned</h2>
      <p>
        The {windowDays}-day window starts on the day the carrier marks the order as delivered. The item must still be {condition}. Try shoes on indoors on a clean surface
        only.
      </p>
      <div className="table-wrap" tabIndex={0} role="region" aria-labelledby="eligibility">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Eligible if</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Sneakers</th>
              <td style={{ whiteSpace: 'normal', minWidth: '16rem' }}>Unworn outdoors. No dirt, creases from street wear, or outsole marks.</td>
            </tr>
            <tr>
              <th scope="row">Jackets, hoodies, and coats</th>
              <td style={{ whiteSpace: 'normal' }}>Unused, with tags attached, and not washed or altered.</td>
            </tr>
            <tr>
              <th scope="row">Handbags and wallets</th>
              <td style={{ whiteSpace: 'normal' }}>Unused, with tags and the original packaging.</td>
            </tr>
            <tr>
              <th scope="row">Jewelry</th>
              <td style={{ whiteSpace: 'normal' }}>Unworn, with tags and packaging. Pieces that have been worn cannot be accepted.</td>
            </tr>
            <tr>
              <th scope="row">Watches</th>
              <td style={{ whiteSpace: 'normal' }}>Unused, with all papers, straps, and packaging that shipped with the watch.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>What we cannot accept</h2>
      <ul>
        <li>Returns started more than {windowDays} days after delivery.</li>
        <li>Worn, washed, altered, or damaged items, except when we sent the item that way.</li>
        <li>Shoes worn outdoors or with marked outsoles.</li>
        <li>Items missing tags, parts, dust bags, boxes, or other original packaging.</li>
        <li>Items returned without a tracked shipment or without the order number in your email.</li>
      </ul>

      <h2>How to start a return</h2>
      <ol>
        <li>
          Email <a href={`mailto:${store.supportEmail}`}>{store.supportEmail}</a> or use the <Link to="/contact">contact form</Link> (topic: Returns). Include your order
          number, the product name, and why you are returning it.
        </li>
        <li>We will reply with return instructions and the shipping address.</li>
        <li>Pack the item in its original packaging inside a shipping box. Do not send the product box alone through the mail.</li>
        <li>Send it with a tracked service and keep the tracking number until the refund is complete.</li>
      </ol>
      <p>
        Do not ship a return until we have replied. Parcels sent to the wrong address, or without tracking, may not be refunded.
      </p>

      <h2>Return shipping</h2>
      <p>
        For a change of mind, a different size, or any return that is not our error, you pay the return postage. Use a tracked service so we can confirm the parcel reached us.
        Original US standard shipping is {s.priceCents === 0 ? 'free' : 'charged at checkout'} and is not added back as a separate refund.
      </p>
      <p>
        If we sent the wrong item, or it arrived damaged or faulty, we cover the return shipping. Follow the damaged-item steps below before you post anything.
      </p>

      <h2>Refunds</h2>
      <p>
        After the return arrives we inspect it against this policy. If it qualifies, we email you and refund the item price to the original payment method. Banks usually take
        5–10 business days to show the credit on your statement.
      </p>
      <p>
        If the item does not meet the conditions above, we will email you before we decide whether we can refund it or need to send it back.
      </p>

      <h2>Need a different size?</h2>
      <p>
        We do not hold stock as an exchange. Place a new order for the size you need, then return the original item using the steps above so you are not waiting on the return
        to arrive. The <Link to="/fit-guide">size & fit guide</Link> and the{' '}
        <Link to="/guides/mens-jacket-and-coat-size-guide">jacket and coat size guide</Link> can help you choose.
      </p>

      <h2>Damaged, faulty, or incorrect items</h2>
      <p>
        Contact us within 7 days of delivery with your order number and a photo of the problem. We will refund or replace the item if we still have it, and we will cover the
        return shipping.
      </p>

      <h2>Gifts</h2>
      <p>
        Gift purchases follow the same {windowDays}-day window and condition. The person returning the item still needs the order number. We refund the original payment
        method, not a different card.
      </p>

      <h2>Orders shipped outside the US</h2>
      <p>
        The same {windowDays}-day window and condition apply. You are responsible for return postage, customs, and any duties on the way back, unless we sent the wrong or
        damaged item. Email us before you ship so we can confirm the address.
      </p>

      <h2>Questions</h2>
      <p>
        Write to <a href={`mailto:${store.supportEmail}`}>{store.supportEmail}</a> or <Link to="/contact">contact us</Link>. For delivery times see{' '}
        <Link to="/shipping">shipping</Link>. For other store questions see the <Link to="/faq">FAQ</Link>.
      </p>
    </InfoPage>
  )
}
