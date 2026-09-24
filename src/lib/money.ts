const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const usdWhole = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

/** All money values are integer US cents. */
export function formatMoney(cents: number): string {
  return cents % 100 === 0 ? usdWhole.format(cents / 100) : usd.format(cents / 100)
}

/** Decimal string for structured data and analytics (e.g. "145.00"). */
export function centsToDecimal(cents: number): string {
  return (cents / 100).toFixed(2)
}
