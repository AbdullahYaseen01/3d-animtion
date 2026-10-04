import { Link } from 'react-router'
import { productsInCategory } from '../catalog'
import { fmt, SIZE_CHART } from '../catalog/sizing'
import { InfoPage } from '../components/layout/InfoPage'
import { pageKeywords } from '../lib/seoKeywords'

const kw = pageKeywords.fitGuide

export default function FitGuide() {
  const shoes = productsInCategory('shoes')
  return (
    <InfoPage
      seo={{ title: kw.title, description: kw.description, path: '/fit-guide' }}
      eyebrow="Size & fit"
      title={kw.h1}
      intro={<p>Our sneakers are sized in US men’s sizes. Use the chart to convert from US women’s, UK, or EU sizes, measure your feet if you are unsure, and check the fit note for the style you like.</p>}
    >
      <h2 id="chart">US, UK, and EU shoe size chart</h2>
      <p>Choose the size whose foot length is equal to or just above your measurement. Women: pick the US women’s size you normally wear.</p>
      <div className="table-wrap" tabIndex={0} role="region" aria-labelledby="chart">
        <table className="data-table">
          <caption>Conversions are approximate. Foot length is measured heel to longest toe.</caption>
          <thead>
            <tr>
              <th scope="col">US men’s</th>
              <th scope="col">US women’s</th>
              <th scope="col">UK</th>
              <th scope="col">EU</th>
              <th scope="col">Foot length</th>
            </tr>
          </thead>
          <tbody>
            {SIZE_CHART.map((r) => (
              <tr key={r.usM}>
                <th scope="row">{fmt(r.usM)}</th>
                <td>{fmt(r.usW)}</td>
                <td>{fmt(r.uk)}</td>
                <td>{fmt(r.eu)}</td>
                <td>{fmt(r.cm)} cm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>How to measure your feet</h2>
      <ol>
        <li>Measure in the evening, wearing the socks you plan to wear with the shoes.</li>
        <li>Stand on a sheet of paper with your heel against a wall and mark the tip of your longest toe.</li>
        <li>Measure from the wall to the mark in centimeters. Use the longer foot.</li>
      </ol>
      <p>
        <Link to="/tools/shoe-size-converter">Use the US, UK, EU, and cm converter</Link> ·{' '}
        <Link to="/guides/how-to-measure-your-feet">Read the full measuring guide</Link>.
      </p>

      <h2>Shoe width</h2>
      <p>
        Every sneaker we currently sell comes in standard width (D). We do not stock wide (2E) sizes yet. If standard shoes usually press on the sides of your forefoot, knit and
        slip-on styles give a little more room. Our <Link to="/guides/standard-vs-wide-shoes">width guide</Link> shows how to check your width at home.
      </p>

      <h2 id="fit-notes">Fit notes by sneaker</h2>
      <div className="table-wrap" tabIndex={0} role="region" aria-labelledby="fit-notes">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Style</th>
              <th scope="col">Fit</th>
            </tr>
          </thead>
          <tbody>
            {shoes.map((p) => (
              <tr key={p.id}>
                <th scope="row">
                  <Link to={`/products/${p.slug}`}>{p.name}</Link>
                </th>
                <td style={{ whiteSpace: 'normal', minWidth: '14rem' }}>{p.fit.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Between shoe sizes?</h2>
      <p>Choose the larger size. Feet swell during the day and on long walks, and a little room at the toe is more comfortable than a snug fit.</p>

      <h2>Jacket, hoodie, and coat sizes</h2>
      <p>
        Outerwear uses letter sizes, usually S to XL. Each product page lists the fit, such as regular or tailored, and on most styles the height and size the model wears. The
        easiest check is to measure a jacket you already own and compare. See our <Link to="/guides/mens-jacket-and-coat-size-guide">men’s jacket and coat size guide</Link>.
      </p>
      <p>
        Still unsure? Unworn items can be returned within our return window. See the <Link to="/returns">return policy</Link>.
      </p>
    </InfoPage>
  )
}
