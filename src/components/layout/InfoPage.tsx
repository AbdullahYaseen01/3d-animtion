import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { store } from '../../config/store'
import { breadcrumbLd, Seo, type SeoProps } from '../../lib/seo'
import { Breadcrumbs } from '../ui/Breadcrumbs'
import { Icon } from '../ui/Icon'
import './InfoPage.css'

interface Props {
  seo: Omit<SeoProps, 'jsonLd'> & { jsonLd?: object[] }
  eyebrow?: string
  title: string
  intro?: ReactNode
  children: ReactNode
  aside?: ReactNode
  help?: boolean
}

export function InfoPage({ seo, eyebrow, title, intro, children, aside, help = true }: Props) {
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: title, path: seo.path },
  ]
  return (
    <>
      <Seo {...seo} jsonLd={[...(seo.jsonLd ?? []), breadcrumbLd(crumbs)]} />
      <div className="container info-page">
        <Breadcrumbs items={crumbs} />
        <header className="page-head info-page__head">
          {eyebrow && <p className="eyebrow eyebrow--ember">{eyebrow}</p>}
          <h1>{title}</h1>
          {intro && <div className="lede">{intro}</div>}
        </header>
        <div className={`info-page__body${aside ? ' has-aside' : ''}`}>
          <div className="prose">{children}</div>
          {aside && <aside className="info-page__aside">{aside}</aside>}
        </div>
        {help && (
          <section className="help-callout" aria-labelledby="help-title">
            <Icon name="mail" size={24} />
            <div>
              <h2 id="help-title">Still have a question?</h2>
              <p>
                Our team answers sizing, order and returns questions by email. Write to{' '}
                <a href={`mailto:${store.supportEmail}`}>{store.supportEmail}</a> or <Link to="/contact">use the contact form</Link>.
              </p>
            </div>
          </section>
        )}
      </div>
    </>
  )
}

export function DraftNotice() {
  if (store.legal.reviewed) return null
  return (
    <p className="sample-note" role="note">
      Draft policy prepared for launch review. It will be finalized by {store.legalName} before the store accepts real orders.
    </p>
  )
}
