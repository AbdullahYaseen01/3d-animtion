import { store } from '../config/store'

/** Skips Saturdays and Sundays. Uses the shopper's local calendar date. */
export function addBusinessDays(start: Date, days: number): Date {
  const d = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  let left = days
  while (left > 0) {
    d.setDate(d.getDate() + 1)
    const day = d.getDay()
    if (day !== 0 && day !== 6) left -= 1
  }
  return d
}

const dayLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

/**
 * US standard window from store.shipping: processing days, then the transit range.
 * Shipping settings do not vary by state, so the window is the same for every US address.
 */
export function deliveryWindow(now = new Date()): { start: Date; end: Date; label: string } {
  const ship = store.shipping.standard
  const process = store.shipping.processingBusinessDays
  const start = addBusinessDays(now, process + ship.minBusinessDays)
  const end = addBusinessDays(now, process + ship.maxBusinessDays)
  const label =
    start.getTime() === end.getTime()
      ? dayLabel.format(start)
      : `${dayLabel.format(start)} – ${dayLabel.format(end)}`
  return { start, end, label }
}
