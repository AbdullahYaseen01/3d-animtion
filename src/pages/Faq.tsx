import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { store } from '../config/store'
import { InfoPage } from '../components/layout/InfoPage'
import { formatMoney } from '../lib/money'

interface QA {
  q: string
  a: ReactNode
}

export default function Faq() {
  const s = store.shipping.standard
  const groups: { title: string; items: QA[] }[] = [
    {
      title: 'Sizing',
      items: [
        {
          q: 'What size should I order?',
          a: (
            <p>
              Shoes use US men’s sizing. Women should pick their usual US women’s size in our <Link to="/fit-guide">size chart</Link>, which converts it for you. Jackets use their own sizes. Bags, jewelry and watches do not use a shoe size.
            </p>
          ),
        },
        {
          q: 'Do you offer wide sizes?',
          a: <p>Yes, several styles come in Wide (2E) as well as Standard (D). Width options appear on the product page when available.</p>,
        },
        { q: 'I’m between sizes. What should I do?', a: <p>For running and trail styles, choose the larger size. For leather styles, the smaller size usually works better as leather softens.</p> },
      ],
    },
    {
      title: 'Orders & payment',
      items: [
        {
          q: 'How do I pay?',
          a: <p>Checkout is hosted by Stripe, a secure payment provider. The payment methods available are shown on the checkout page. NOVA never sees or stores your full card details.</p>,
        },
        { q: 'Is sales tax included?', a: <p>Prices are shown before tax. Where sales tax applies, it is calculated at checkout from your shipping address before you pay.</p> },
        {
          q: 'Can I change or cancel my order?',
          a: (
            <p>
              Contact us as soon as possible with your order number. We will do our best to update the order before it ships. Once shipped, you can use our{' '}
              <Link to="/returns">returns process</Link>.
            </p>
          ),
        },
      ],
    },
    {
      title: 'Shipping & returns',
      items: [
        {
          q: 'How much is shipping?',
          a: (
            <p>
              {s.priceCents === 0 ? 'Standard shipping is free' : `Standard shipping is ${formatMoney(s.priceCents)}`} to US addresses and takes {s.minBusinessDays}–{s.maxBusinessDays}{' '}
              business days after dispatch. See <Link to="/shipping">shipping details</Link>.
            </p>
          ),
        },
        { q: 'Do you ship internationally?', a: <p>Not yet. We currently ship to US addresses only.</p> },
        {
          q: 'What is your return policy?',
          a: (
            <p>
              Eligible items can be returned within {store.returns.windowDays} days of delivery. Shoes must be unworn. <Link to="/returns">Read the full policy</Link>.
            </p>
          ),
        },
      ],
    },
    {
      title: 'Product care',
      items: [
        {
          q: 'How do I clean my shoes?',
          a: (
            <p>
              Each product page lists care instructions for its materials. Our <Link to="/guides/how-to-care-for-leather-sneakers">leather and suede care guide</Link> covers the
              basics.
            </p>
          ),
        },
        { q: 'Can I put my shoes in the washing machine?', a: <p>We do not recommend machine washing. Heat and agitation can damage foams and adhesives. Hand clean with a soft brush and mild soap instead.</p> },
      ],
    },
  ]

  return (
    <InfoPage
      seo={{ title: 'Frequently Asked Questions', description: 'Answers about NOVA sizing, payment, shipping, returns and shoe care.', path: '/faq' }}
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
              {item.a}
            </details>
          ))}
        </section>
      ))}
    </InfoPage>
  )
}
