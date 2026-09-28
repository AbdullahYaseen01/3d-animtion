import { Link } from 'react-router'
import { Icon } from '../ui/Icon'
import { editorialOpening as edit } from './cityEdit'
import './EditorialOpening.css'

/** Editorial homepage opening: burgundy hero, statement, and two collection panels. */
export function EditorialOpening() {
  return (
    <>
      <section className="city-hero" aria-labelledby="hero-title">
        <div className="city-hero__copy">
          <p className="city-hero__eyebrow">{edit.hero.eyebrow}</p>
          <h1 id="hero-title" className="city-hero__title">
            {edit.hero.title[0]}
            <br />
            {edit.hero.title[1]}
          </h1>
          <p className="city-hero__lede">{edit.hero.lede}</p>
          <Link className="city-hero__cta" to={edit.hero.cta.href}>
            {edit.hero.cta.label}
            <Icon name="arrow" size={18} />
          </Link>
        </div>

        <div className="city-hero__model">
          <img
            src={edit.model.src}
            alt={edit.model.alt}
            width={edit.model.width}
            height={edit.model.height}
            sizes="(min-width: 75rem) 42vw, (min-width: 48rem) 56vw, 100vw"
            fetchPriority="high"
            decoding="async"
            style={{ '--model-pos': edit.model.position, '--model-pos-mobile': edit.model.positionMobile } as React.CSSProperties}
          />
        </div>

        <article className="city-hero__aside">
          <div className="city-hero__aside-photo">
            <img
              src={edit.accessories.src}
              alt={edit.accessories.alt}
              width={edit.accessories.width}
              height={edit.accessories.height}
              sizes="(min-width: 75rem) 24vw, (min-width: 48rem) 46vw, 100vw"
              decoding="async"
              style={{ objectPosition: edit.accessories.position }}
            />
          </div>
          <div className="city-hero__aside-copy">
            <h2>{edit.accessories.title}</h2>
            <Link className="city-link" to={edit.accessories.cta.href}>
              <span>{edit.accessories.cta.label}</span>
              <Icon name="arrowNe" size={16} />
            </Link>
          </div>
        </article>
      </section>

      <section className="city-statement" aria-labelledby="statement-title">
        <h2 id="statement-title" className="city-statement__title">
          {edit.statement.title}
        </h2>
        <p>{edit.statement.copy}</p>
      </section>

      <section className="city-panels" aria-label="Collections">
        {edit.panels.map((panel, index) => (
          <article key={panel.title} className="city-panels__item">
            <div className="city-panels__media">
              <img
                src={panel.src}
                alt={panel.alt}
                width={panel.width}
                height={panel.height}
                sizes={index === 0 ? '(min-width: 48rem) 65vw, 100vw' : '(min-width: 48rem) 35vw, 100vw'}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: panel.position }}
              />
            </div>
            <div className="city-panels__copy">
              <h2>{panel.title}</h2>
              <Link className="city-link" to={panel.cta.href}>
                <span>{panel.cta.label}</span>
                <Icon name="arrow" size={16} />
              </Link>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
