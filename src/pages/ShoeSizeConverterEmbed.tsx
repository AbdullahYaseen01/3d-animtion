import { CONVERTER_EMBED_PATH, CONVERTER_PATH, SizeConverterForm } from '../components/tools/SizeConverterForm'
import { store } from '../config/store'
import { absoluteUrl, Seo } from '../lib/seo'
import { pageKeywords } from '../lib/seoKeywords'
import './ShoeSizeConverterEmbed.css'

const kw = pageKeywords.shoeSizeConverter

/**
 * Header-less version of the converter for other sites to put in an iframe.
 * Noindex: the canonical tool lives at /tools/shoe-size-converter, which the credit line links to.
 */
export default function ShoeSizeConverterEmbed() {
  const full = absoluteUrl(CONVERTER_PATH)
  return (
    <div className="embed-page">
      <Seo title={kw.title} description={kw.description} path={CONVERTER_EMBED_PATH} noindex canonical={false} />
      <h1 className="embed-page__title">Shoe size converter</h1>
      <p className="embed-page__lede">US men, US women, UK, EU, and foot length in cm. Approximate; confirm against a pair you own.</p>
      <SizeConverterForm resultId="embed-size-result" />
      <p className="embed-page__credit">
        <a href={full} target="_top" rel="noopener">
          Full chart and measuring guide
        </a>{' '}
        · a free tool by{' '}
        <a href={absoluteUrl('/')} target="_top" rel="noopener">
          {store.name}
        </a>
      </p>
    </div>
  )
}
