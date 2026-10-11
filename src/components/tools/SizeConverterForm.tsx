import { useMemo, useState } from 'react'
import { fmt, SIZE_CHART, sizeForLength, type SizeRow } from '../../catalog/sizing'

export const CONVERTER_PATH = '/tools/shoe-size-converter'
/** Header-less copy of the converter for iframes on other sites. */
export const CONVERTER_EMBED_PATH = '/embed/shoe-size-converter'

export type System = 'usM' | 'usW' | 'uk' | 'eu' | 'cm'

export const SYSTEMS: { value: System; label: string }[] = [
  { value: 'usM', label: 'US men' },
  { value: 'usW', label: 'US women' },
  { value: 'uk', label: 'UK' },
  { value: 'eu', label: 'EU' },
  { value: 'cm', label: 'Centimeters' },
]

export function nearestRow(system: System, raw: number): SizeRow | 'short' | 'long' | null {
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

/** The converter inputs and result line, shared by the full tool page and the embeddable widget. */
export function SizeConverterForm({ resultId = 'size-tool-result' }: { resultId?: string }) {
  const [system, setSystem] = useState<System>('usM')
  const [value, setValue] = useState('9')
  const parsed = Number(value)
  const row = useMemo(() => nearestRow(system, parsed), [system, parsed])

  return (
    <>
      <form className="size-tool" onSubmit={(e) => e.preventDefault()} aria-describedby={resultId}>
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
      <div id={resultId} className="notice" role="status">
        {row == null && <p>Enter a number to convert.</p>}
        {row === 'short' && <p>That measurement is below this chart (US men 7 / 25 cm).</p>}
        {row === 'long' && <p>That measurement is above this chart (US men 13 / 31 cm).</p>}
        {row && row !== 'short' && row !== 'long' && (
          <p>
            Closest match: US men {fmt(row.usM)}, US women {fmt(row.usW)}, UK {fmt(row.uk)}, EU {fmt(row.eu)}, {fmt(row.cm)} cm foot length.
          </p>
        )}
      </div>
    </>
  )
}
