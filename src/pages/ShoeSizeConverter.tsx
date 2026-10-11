import { Link } from 'react-router'
import { fmt, SIZE_CHART } from '../catalog/sizing'
import { InfoPage } from '../components/layout/InfoPage'
import { CONVERTER_EMBED_PATH, CONVERTER_PATH, SizeConverterForm } from '../components/tools/SizeConverterForm'
import { EmbedThis } from '../components/ui/EmbedThis'
import { LinkToThis } from '../components/ui/LinkToThis'
import { pageKeywords } from '../lib/seoKeywords'

const kw = pageKeywords.shoeSizeConverter

export default function ShoeSizeConverter() {
  return (
    <InfoPage
      seo={{ title: kw.title, description: kw.description, path: '/tools/shoe-size-converter' }}
      eyebrow="Tool"
      title={kw.h1}
      intro={
        <p>
          Convert a shoe size between US men, US women, UK, EU, and foot length in centimeters. The table is the same chart we use for{' '}
          <Link to="/collections/shoes">men&apos;s sneakers</Link>. Conversions are approximate. Confirm against a pair you already own
          when you can.
        </p>
      }
    >
      <SizeConverterForm />

      <h2 id="chart">Full conversion chart</h2>
      <div className="table-wrap" tabIndex={0} role="region" aria-labelledby="chart">
        <table className="data-table">
          <caption>Approximate unisex conversions. Foot length is heel to longest toe.</caption>
          <thead>
            <tr>
              <th scope="col">US men</th>
              <th scope="col">US women</th>
              <th scope="col">UK</th>
              <th scope="col">EU</th>
              <th scope="col">cm</th>
            </tr>
          </thead>
          <tbody>
            {SIZE_CHART.map((r) => (
              <tr key={r.usM}>
                <th scope="row">{fmt(r.usM)}</th>
                <td>{fmt(r.usW)}</td>
                <td>{fmt(r.uk)}</td>
                <td>{fmt(r.eu)}</td>
                <td>{fmt(r.cm)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>How to measure</h2>
      <p>
        Stand on paper with your heel against a wall, mark the longest toe, and measure in centimeters. Use the longer foot.{' '}
        <Link to="/guides/how-to-measure-your-feet">Full measuring guide</Link> · <Link to="/fit-guide">Size and fit notes by sneaker</Link>.
      </p>
      <p>Every sneaker we sell is standard width (D). We do not stock wide (2E) sizes.</p>

      <EmbedThis embedPath={CONVERTER_EMBED_PATH} toolPath={CONVERTER_PATH} label="Shoe size converter: US, UK, EU and cm" title="Shoe size converter" />
      <LinkToThis path={CONVERTER_PATH} label="Shoe size converter: US, UK, EU and cm" noun="this converter" />
    </InfoPage>
  )
}
