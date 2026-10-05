import { Link } from 'react-router'
import { store } from '../config/store'
import { InfoPage } from '../components/layout/InfoPage'
import { faqLd } from '../lib/seo'
import { pageKeywords } from '../lib/seoKeywords'
import { formatMoney } from '../lib/money'

/** Plain text, or a link whose label reads as part of the sentence. */
type Segment = string | { to: string; label: string }

interface QA {
  q: string
  a: Segment[]
}

/** The same words feed the visible answer and the FAQPage structured data. */
const answerText = (a: Segment[]) => a.map((s) => (typeof s === 'string' ? s : s.label)).join('')

export function faqGroups(): { title: string; items: QA[] }[] {
  const s = store.shipping.standard
  return [
    {
      title: 'Sizing',
      items: [
        {
          q: 'What size should I order?',
          a: [
            'Shoes use US men’s sizing. Women should pick their usual US women’s size in our ',
            { to: '/fit-guide', label: 'size chart' },
            ', which converts it for you. Jackets, hoodies, and coats use letter sizes S to XL. Bags, wallets, jewelry, and watches do not use a shoe size.',
          ],
        },
        {
          q: 'Do you offer wide sizes?',
          a: [
            'Not at the moment. Every sneaker we sell comes in a standard (D) width. Knit and slip-on styles have a little more give. Our ',
            { to: '/guides/standard-vs-wide-shoes', label: 'shoe width guide' },
            ' explains how to check your width.',
          ],
        },
        {
          q: 'How do jackets and coats fit?',
          a: [
            'Each product lists its fit, such as regular or tailored, and on most styles the model is 5′11″ and wears a medium. Our ',
            { to: '/guides/mens-jacket-and-coat-size-guide', label: 'jacket and coat size guide' },
            ' shows how to compare with a jacket you own.',
          ],
        },
        { q: 'I’m between sizes. What should I do?', a: ['For sneakers and tailored jackets, choose the larger size. For regular-fit and boxy styles, your usual size is usually right.'] },
      ],
    },
    {
      title: 'Orders & payment',
      items: [
        {
          q: 'How do I pay?',
          a: ['Checkout is hosted by Polar, a secure payment provider. The payment methods available are shown on the checkout page. Westora Style never sees or stores your full card details.'],
        },
        { q: 'Is sales tax included?', a: ['Prices are shown before tax. Where sales tax applies, it is calculated at checkout from your shipping address before you pay.'] },
        {
          q: 'Can I change or cancel my order?',
          a: [
            'Contact us as soon as possible with your order number. We will do our best to update the order before it ships.',
          ],
        },
      ],
    },
    {
      title: 'Shipping',
      items: [
        {
          q: 'How much is shipping?',
          a: [
            `${s.priceCents === 0 ? 'Standard shipping is free' : `Standard shipping is ${formatMoney(s.priceCents)}`} to US addresses and takes ${s.minBusinessDays}–${s.maxBusinessDays} business days after dispatch. See `,
            { to: '/shipping', label: 'shipping details' },
            '.',
          ],
        },
        { q: 'Do you ship internationally?', a: ['Yes. Choose your country at checkout and enter the full street address, phone number, and postal code.'] },
      ],
    },
    {
      title: 'Product care',
      items: [
        {
          q: 'How do I clean my shoes?',
          a: ['Each product page lists care instructions for its materials. Our ', { to: '/guides/how-to-care-for-leather-sneakers', label: 'sneaker cleaning guide' }, ' covers mesh, knit, synthetic, and leather uppers.'],
        },
        {
          q: 'Can I put my shoes in the washing machine?',
          a: ['We do not recommend machine washing. Heat and agitation can damage foams and adhesives. Hand clean with a soft brush and mild soap instead.'],
        },
        {
          q: 'How do I care for gold-plated jewelry?',
          a: ['Wipe it with a soft dry cloth, keep it away from perfume and water, and store pieces separately. Our ', { to: '/guides/how-to-clean-gold-plated-jewelry', label: 'jewelry care guide' }, ' has the details.'],
        },
      ],
    },
  ]
}

export default function Faq() {
  const groups = faqGroups()
  return (
    <InfoPage
      seo={{
        title: pageKeywords.faq.title,
        description: pageKeywords.faq.description,
        path: '/faq',
        jsonLd: [faqLd(groups.flatMap((g) => g.items.map((it) => ({ question: it.q, answer: answerText(it.a) }))))],
      }}
      eyebrow="Help"
      title={pageKeywords.faq.h1}
      intro={<p>Answers to the questions we hear most. Can’t find yours? Contact us and we’ll get back to you.</p>}
    >
      {groups.map((g) => (
        <section key={g.title} className="faq-group" aria-labelledby={`faq-${g.title}`}>
          <h2 id={`faq-${g.title}`}>{g.title}</h2>
          {g.items.map((item) => (
            <details key={item.q} className="accordion">
              <summary>
                <h3>{item.q}</h3>
              </summary>
              <p>
                {item.a.map((seg, i) =>
                  typeof seg === 'string' ? (
                    seg
                  ) : (
                    <Link key={i} to={seg.to}>
                      {seg.label}
                    </Link>
                  ),
                )}
              </p>
            </details>
          ))}
        </section>
      ))}
    </InfoPage>
  )
}
