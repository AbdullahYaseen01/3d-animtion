import { Link } from 'react-router'
import { store } from '../config/store'
import { DraftNotice, InfoPage } from '../components/layout/InfoPage'
import { pageKeywords } from '../lib/seoKeywords'

export default function Privacy() {
  return (
    <InfoPage
      seo={{ title: pageKeywords.privacy.title, description: pageKeywords.privacy.description, path: '/privacy' }}
      eyebrow="Legal"
      title={pageKeywords.privacy.h1}
      intro={<p>Last updated {store.legal.updated}</p>}
    >
      <DraftNotice />
      <p>
        This policy explains what personal information {store.legalName} (“we”) collects when you use this website, how we use it, and the choices you have.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Orders.</strong> When you check out, we collect your name, phone number, and delivery address (country, house or apartment number, street, city, state or province, and postal code), plus any delivery note you add. Our payment provider Polar also collects your email, billing address, and payment details. We use this information to ship the order. We never receive or store your full card number.
        </li>
        <li>
          <strong>Email sign-up.</strong> If you join our list, we store your email address with our email provider, Resend, together with your consent.
        </li>
        <li>
          <strong>Messages.</strong> If you contact us, we receive your name, email, and the contents of your message.
        </li>
        <li>
          <strong>On your device.</strong> Your cart and saved items are stored in your browser’s local storage so they persist between visits. They are not sent to us until
          you check out.
        </li>
        <li>
          <strong>Usage analytics.</strong> If analytics is enabled, Vercel Web Analytics records page views, and Google Analytics may record shopping events (such as adding to cart), without your name, email or address. We do
          not load analytics when your browser sends a Global Privacy Control or Do Not Track signal. Visits to the private order desk are not measured.
        </li>
      </ul>

      <h2>How we use information</h2>
      <ul>
        <li>To process, ship and support your orders, including returns.</li>
        <li>To reply to your messages.</li>
        <li>To send marketing emails, only if you have opted in. Every email includes an unsubscribe link.</li>
        <li>To understand how the site is used and improve it.</li>
        <li>To prevent fraud and meet legal obligations.</li>
      </ul>

      <h2>Service providers</h2>
      <p>
        We share information only with providers that help us run the store: Polar (payments), Resend (email), and Vercel (website hosting and page-view analytics), and, if enabled, Google Analytics
        (shopping events). We do not sell your personal information.
      </p>

      <h2>Your choices and rights</h2>
      <p>
        You can unsubscribe from marketing emails at any time. Depending on where you live, including California, you may have the right to access, correct, or delete your
        personal information, and to opt out of certain sharing. To make a request, email <a href={`mailto:${store.supportEmail}`}>{store.supportEmail}</a>. We will not
        discriminate against you for exercising these rights.
      </p>

      <h2>Retention</h2>
      <p>We keep order records as long as needed for accounting, tax and legal purposes, and marketing contacts until you unsubscribe or ask us to delete them.</p>

      <h2>Children</h2>
      <p>This site is not directed to children under 13, and we do not knowingly collect their personal information.</p>

      <h2>Changes</h2>
      <p>We will post any changes to this policy on this page and update the date above.</p>

      <h2>Contact</h2>
      <p>
        Questions about privacy? Email <a href={`mailto:${store.supportEmail}`}>{store.supportEmail}</a> or <Link to="/contact">contact us</Link>.
      </p>
    </InfoPage>
  )
}
