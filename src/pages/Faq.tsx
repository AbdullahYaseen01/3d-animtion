import { Link } from 'react-router'
import { store } from '../config/store'
import { InfoPage } from '../components/layout/InfoPage'
import { faqLd } from '../lib/seo'
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
            ', which converts it for you. Jackets use their own sizes. Bags, jewelry and watches do not use a shoe size.',
          ],
        },
        {
          q: 'Do you offer wide sizes?',
          a: [
            'Yes, several styles come in Wide (2E) as well as Standard (D). Width options appear on the product page when available. Our ',
            { to: '/guides/standard-vs-wide-shoes', label: 'shoe width guide' },
            ' explains how to choose.',
          ],
        },
        { q: 'I’m between sizes. What should I do?', a: ['For running and trail styles, choose the larger size. For leather styles, the smaller size usually works better as leather softens.'] },
      ],
    },
    {
      title: 'Orders & payment',
      items: [
        {
          q: 'How do I pay?',
          a: ['Checkout is hosted by Stripe, a secure payment provider. The payment methods available are shown on the checkout page. NOVA never sees or stores your full card details.'],
        },
        { q: 'Is sales tax included?', a: ['Prices are shown before tax. Where sales tax applies, it is calculated at checkout from your shipping address before you pay.'] },
        {
          q: 'Can I change or cancel my order?',
          a: [
            'Contact us as soon as possible with your order number. We will do our best to update the order before it ships. Once shipped, you can use our ',
            { to: '/returns', label: 'returns process' },
            '.',
          ],
        },
      ],
    },
    {
      title: 'Shipping & returns',
      items: [
        {
          q: 'How much is shipping?',
          a: [
            `${s.priceCents === 0 ? 'Standard shipping is free' : `Standard shipping is ${formatMoney(s.priceCents)}`} to US addresses and takes ${s.minBusinessDays}–${s.maxBusinessDays} business days after dispatch. See `,
            { to: '/shipping', label: 'shipping details' },
            '.',
          ],
        },
        { q: 'Do you ship internationally?', a: ['Not yet. We currently ship to US addresses only.'] },
        {
          q: 'What is your return policy?',
          a: [`Eligible items can be returned within ${store.returns.windowDays} days of delivery. Shoes must be unworn. `, { to: '/returns', label: 'Read the full policy' }, '.'],
        },
      ],
    },
    {
      title: 'Product care',
      items: [
        {
          q: 'How do I clean my shoes?',
          a: ['Each product page lists care instructions for its materials. Our ', { to: '/guides/how-to-care-for-leather-sneakers', label: 'leather and suede care guide' }, ' covers the basics.'],
        },
        {
          q: 'Can I put my shoes in the washing machine?',
          a: ['We do not recommend machine washing. Heat and agitation can damage foams and adhesives. Hand clean with a soft brush and mild soap instead.'],
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
        title: 'Frequently Asked Questions',
        description: `Answers about NOVA shoe sizing and wide widths, payment, US shipping times, ${store.returns.windowDays}-day returns, and cleaning leather and suede shoes.`,
        path: '/faq',
        jsonLd: [faqLd(groups.flatMap((g) => g.items.map((it) => ({ question: it.q, answer: answerText(it.a) }))))],
      }}
      eyebrow="Help"
      title="FAQ"
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
