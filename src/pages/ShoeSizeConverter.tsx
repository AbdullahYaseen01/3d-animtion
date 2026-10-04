import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { fmt, SIZE_CHART, sizeForLength, type SizeRow } from '../catalog/sizing'
import { InfoPage } from '../components/layout/InfoPage'
import { pageKeywords } from '../lib/seoKeywords'

type System = 'usM' | 'usW' | 'uk' | 'eu' | 'cm'

const SYSTEMS: { value: System; label: string }[] = [
  { value: 'usM', label: 'US men' },
  { value: 'usW', label: 'US women' },
  { value: 'uk', label: 'UK' },
  { value: 'eu', label: 'EU' },
  { value: 'cm', label: 'Centimeters' },
]

function nearestRow(system: System, raw: number): SizeRow | 'short' | 'long' | null {
  if (!Number.isFinite(raw) || raw <= 0) return null
  if (system === 'cm') return sizeForLength(raw)
  const exact = SIZE_CHART.find((r) => r[system] === raw)
  if (exact) return exact
  const sorted = [...SIZE_CHART].sort((a, b) => Math.abs(a[system] - raw) - Math.abs(b[system] - raw))
  const best = sorted[0]
  if (raw < SIZE_CHART[0][system] - 0.6) return 'short'
  if (raw > SIZE_CHART[SIZE_CHART.length - 1][system] + 0.6) return 'long'
  return best
}

const kw = pageKeywords.shoeSizeConverter

export default function ShoeSizeConverter() {
  const [system, setSystem] = useState<System>('usM')
  const [value, setValue] = useState('9')
  const parsed = Number(value)
  const row = useMemo(() => nearestRow(system, parsed), [system, parsed])

  return (
    <InfoPage
      seo={{ title: kw.title, description: kw.description, path: '/tools/shoe-size-converter' }}
      eyebrow="Tool"
      title={kw.h1}
      intro={
        <p>
          Convert a shoe size between US men, US women, UK, EU, and foot length in centimeters. The table is the same chart we use for{' '}
          <Link to="/collections/shoes">Ndure men&apos;s sneakers</Link>. Conversions are approximate. Confirm against a pair you already own
          when you can.
        </p>
      }
    >
      <form className="size-tool" onSubmit={(e) => e.preventDefault()} aria-describedby="size-tool-result">
        <label>
          Starting system
          <select className="select" value={system} onChange={(e) => setSystem(e.target.value as System)}>
            {SYSTEMS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Size or length
          <input className="input" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
      </form>
      <div id="size-tool-result" className="notice" role="status">
        {row == null && <p>Enter a number to convert.</p>}
        {row === 'short' && <p>That measurement is below this chart (US men 7 / 25 cm).</p>}
        {row === 'long' && <p>That measurement is above this chart (US men 13 / 31 cm).</p>}
        {row && row !== 'short' && row !== 'long' && (
          <p>
            Closest match: US men {fmt(row.usM)}, US women {fmt(row.usW)}, UK {fmt(row.uk)}, EU {fmt(row.eu)}, {fmt(row.cm)} cm foot length.
          </p>
        )}
      </div>

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
    </InfoPage>
  )
}
