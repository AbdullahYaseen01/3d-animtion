import { Link } from 'react-router'
import { allProducts } from '../catalog'
import { fmt, SIZE_CHART } from '../catalog/sizing'
import { InfoPage } from '../components/layout/InfoPage'

export default function FitGuide() {
  return (
    <InfoPage
      seo={{
        title: 'Size & Fit Guide',
        description: 'US men’s and women’s shoe size chart with UK, EU and foot length in centimeters, plus width guidance and fit notes for every NOVA style.',
        path: '/fit-guide',
      }}
      eyebrow="Size & fit"
      title="Find your size"
      intro={<p>All NOVA shoes are sized in US men’s sizes. Use the chart to convert, measure your feet if you are unsure, and check the fit note for the style you like.</p>}
    >
      <h2 id="chart">Size chart</h2>
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

      <h2>How to measure</h2>
      <ol>
        <li>Measure in the evening, wearing the socks you plan to wear with the shoes.</li>
        <li>Stand on a sheet of paper with your heel against a wall and mark the tip of your longest toe.</li>
        <li>Measure from the wall to the mark in centimeters. Use the longer foot.</li>
      </ol>
      <p>
        <Link to="/guides/how-to-measure-your-feet">Read the full measuring guide</Link>.
      </p>

      <h2>Width</h2>
      <p>
        Standard width is D. Some styles also come in Wide (2E), which adds room across the ball of the foot and toe box. If standard shoes usually press on the sides of your
        forefoot, choose Wide where it is offered.
      </p>

      <h2>Fit notes by style</h2>
      <div className="table-wrap" tabIndex={0} role="region" aria-label="Fit notes by style">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Style</th>
              <th scope="col">Fit</th>
              <th scope="col">Widths</th>
            </tr>
          </thead>
          <tbody>
            {allProducts().map((p) => (
              <tr key={p.id}>
                <th scope="row">
                  <Link to={`/products/${p.slug}`}>{p.name}</Link>
                </th>
                <td style={{ whiteSpace: 'normal', minWidth: '14rem' }}>{p.fit.summary}</td>
                <td>{p.widths.map((w) => w.code).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Between sizes?</h2>
      <p>For running and trail shoes, go up half a size to leave room for your feet to swell on longer runs. For leather styles, the smaller size is often better because leather softens with wear.</p>
      <p>
        Still unsure? Unworn pairs can be returned within our return window. See the <Link to="/returns">return policy</Link>.
      </p>
    </InfoPage>
  )
}
