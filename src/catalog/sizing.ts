/**
 * Approximate unisex conversions from US men's sizes.
 * LAUNCH BLOCKER: confirm against NOVA's actual lasts and foot-length measurements.
 */
export interface SizeRow {
  usM: number
  usW: number
  uk: number
  eu: number
  cm: number
}

export const SIZE_CHART: SizeRow[] = [
  { usM: 7, usW: 8.5, uk: 6, eu: 40, cm: 25 },
  { usM: 7.5, usW: 9, uk: 6.5, eu: 40.5, cm: 25.5 },
  { usM: 8, usW: 9.5, uk: 7, eu: 41, cm: 26 },
  { usM: 8.5, usW: 10, uk: 7.5, eu: 42, cm: 26.5 },
  { usM: 9, usW: 10.5, uk: 8, eu: 42.5, cm: 27 },
  { usM: 9.5, usW: 11, uk: 8.5, eu: 43, cm: 27.5 },
  { usM: 10, usW: 11.5, uk: 9, eu: 44, cm: 28 },
  { usM: 10.5, usW: 12, uk: 9.5, eu: 44.5, cm: 28.5 },
  { usM: 11, usW: 12.5, uk: 10, eu: 45, cm: 29 },
  { usM: 11.5, usW: 13, uk: 10.5, eu: 45.5, cm: 29.5 },
  { usM: 12, usW: 13.5, uk: 11, eu: 46, cm: 30 },
  { usM: 13, usW: 14.5, uk: 12, eu: 47.5, cm: 31 },
]

export function conversionFor(usM: number): SizeRow | undefined {
  return SIZE_CHART.find((r) => r.usM === usM)
}

export const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))
