import { Link } from 'react-router'
import { store } from '../config/store'
import { InfoPage } from '../components/layout/InfoPage'

export default function Returns() {
  const { windowDays, condition } = store.returns
  return (
    <InfoPage
      seo={{
        title: 'Returns Policy',
        description: `Return eligible NOVA items within ${windowDays} days of delivery. Shoes must be unworn. How to start a return and when to expect your refund.`,
        path: '/returns',
      }}
      eyebrow="Help"
      title="Returns"
      intro={<p>If an item is not right, you can return it within {windowDays} days of delivery for a refund to your original payment method.</p>}
    >
      <h2>What can be returned</h2>
      <ul>
        <li>Items returned within {windowDays} days of the delivery date.</li>
        <li>Items that are {condition}.</li>
        <li>Shoes: try them on indoors on a clean surface. Pairs with outdoor wear on the outsole cannot be accepted.</li>
        <li>Bags, jackets, jewelry and watches: unused, with tags and packaging. Worn or damaged items cannot be accepted.</li>
      </ul>

      <h2>How to start a return</h2>
      <ol>
        <li>
          Email <a href={`mailto:${store.supportEmail}`}>{store.supportEmail}</a> or use the <Link to="/contact">contact form</Link> with your order number and the item you want to
          return.
        </li>
        <li>We will reply with return instructions and the shipping address.</li>
        <li>Pack the item in its original packaging inside a shipping box, and send it using a tracked service.</li>
      </ol>

      <h2>Refunds</h2>
      <p>
        Once your return arrives and is inspected, we will email you and issue a refund to your original payment method. Banks usually take 5–10 business days to show the
        refund on your statement.
      </p>

      <h2>Need a different size?</h2>
      <p>
        Return the original pair using the steps above and place a new order for the size you need, so you are not waiting on the return to arrive. Our <Link to="/fit-guide">size
        & fit guide</Link> can help you choose.
      </p>

      <h2>Damaged or incorrect items</h2>
      <p>If your order arrives damaged, faulty or incorrect, contact us within 7 days of delivery with your order number and a photo, and we will put it right.</p>
    </InfoPage>
  )
}
