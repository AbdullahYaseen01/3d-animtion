/** US delivery details collected before Polar checkout and shown on the order desk. */
export interface DeliveryDetails {
  fullName: string
  phone: string
  house: string
  street: string
  city: string
  state: string
  zip: string
  notes: string
}

export const US_STATES: { code: string; name: string }[] = [
  ['AL', 'Alabama'],
  ['AK', 'Alaska'],
  ['AZ', 'Arizona'],
  ['AR', 'Arkansas'],
  ['CA', 'California'],
  ['CO', 'Colorado'],
  ['CT', 'Connecticut'],
  ['DE', 'Delaware'],
  ['DC', 'District of Columbia'],
  ['FL', 'Florida'],
  ['GA', 'Georgia'],
  ['HI', 'Hawaii'],
  ['ID', 'Idaho'],
  ['IL', 'Illinois'],
  ['IN', 'Indiana'],
  ['IA', 'Iowa'],
  ['KS', 'Kansas'],
  ['KY', 'Kentucky'],
  ['LA', 'Louisiana'],
  ['ME', 'Maine'],
  ['MD', 'Maryland'],
  ['MA', 'Massachusetts'],
  ['MI', 'Michigan'],
  ['MN', 'Minnesota'],
  ['MS', 'Mississippi'],
  ['MO', 'Missouri'],
  ['MT', 'Montana'],
  ['NE', 'Nebraska'],
  ['NV', 'Nevada'],
  ['NH', 'New Hampshire'],
  ['NJ', 'New Jersey'],
  ['NM', 'New Mexico'],
  ['NY', 'New York'],
  ['NC', 'North Carolina'],
  ['ND', 'North Dakota'],
  ['OH', 'Ohio'],
  ['OK', 'Oklahoma'],
  ['OR', 'Oregon'],
  ['PA', 'Pennsylvania'],
  ['RI', 'Rhode Island'],
  ['SC', 'South Carolina'],
  ['SD', 'South Dakota'],
  ['TN', 'Tennessee'],
  ['TX', 'Texas'],
  ['UT', 'Utah'],
  ['VT', 'Vermont'],
  ['VA', 'Virginia'],
  ['WA', 'Washington'],
  ['WV', 'West Virginia'],
  ['WI', 'Wisconsin'],
  ['WY', 'Wyoming'],
].map(([code, name]) => ({ code, name }))

const STATE_NAMES = new Map(US_STATES.map((state) => [state.code, state.name]))

export function stateName(code: string): string {
  return STATE_NAMES.get(code) ?? code
}

const NAME_PART = /^[\p{L}][\p{L}'’.-]{0,30}$/u
const HOUSE = /^[\p{L}\p{N}#][\p{L}\p{N}\s#.,'’/-]{0,39}$/u
const STREET = /^[\p{L}\p{N}][\p{L}\p{N}\s.'’#/-]{1,79}$/u
const CITY = /^[\p{L}][\p{L}\s.'’-]*$/u

export type DeliveryErrors = Partial<Record<keyof DeliveryDetails, string>>

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : ''
}

export function formatUsPhone(value: string): string | null {
  const digits = value.replace(/\D/g, '')
  const local = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
  if (local.length !== 10) return null
  return `+1 (${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`
}

export function validateDelivery(input: unknown): { ok: true; delivery: DeliveryDetails } | { ok: false; errors: DeliveryErrors } {
  const source = input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
  const errors: DeliveryErrors = {}
  const fullName = clean(source.fullName)
  const nameParts = fullName.split(' ')
  if (nameParts.length < 2 || nameParts.some((part) => !NAME_PART.test(part)) || fullName.length > 80) {
    errors.fullName = 'Enter a first and last name.'
  }

  const phone = formatUsPhone(clean(source.phone))
  if (!phone) errors.phone = 'Enter a 10-digit US phone number.'

  const house = clean(source.house)
  if (!HOUSE.test(house) || !/\d/.test(house)) errors.house = 'Enter the house or apartment number, such as 12 or Apt 4B.'

  const street = clean(source.street)
  if (!STREET.test(street) || !/\p{L}/u.test(street)) errors.street = 'Enter the street name.'

  const city = clean(source.city)
  if (city.length < 2 || city.length > 40 || !CITY.test(city)) errors.city = 'Enter the city.'

  const state = clean(source.state).toUpperCase()
  if (!STATE_NAMES.has(state)) errors.state = 'Choose a state.'

  const zip = clean(source.zip)
  if (!/^\d{5}(?:-\d{4})?$/.test(zip)) errors.zip = 'Enter a 5-digit ZIP code.'

  const notes = clean(source.notes)
  if (notes.length > 120) errors.notes = 'Keep the delivery note under 120 characters.'

  if (Object.keys(errors).length > 0 || !phone) return { ok: false, errors }
  return { ok: true, delivery: { fullName, phone, house, street, city, state, zip, notes } }
}

const SHIP_KEY = 'ship'

/** One metadata value Polar copies onto the paid order. */
export function packDeliveryMetadata(delivery: DeliveryDetails): Record<string, string> {
  return {
    [SHIP_KEY]: JSON.stringify({
      n: delivery.fullName,
      p: delivery.phone,
      h: delivery.house,
      s: delivery.street,
      c: delivery.city,
      t: delivery.state,
      z: delivery.zip,
      o: delivery.notes,
    }),
  }
}

export function unpackDelivery(metadata: Record<string, string | null | undefined> | null | undefined): DeliveryDetails | null {
  const raw = metadata?.[SHIP_KEY]
  if (!raw) return null
  try {
    const parsed = validateDelivery(expandPacked(JSON.parse(raw)))
    return parsed.ok ? parsed.delivery : null
  } catch {
    return null
  }
}

function expandPacked(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value
  const row = value as Record<string, unknown>
  if ('fullName' in row) return row
  return {
    fullName: row.n,
    phone: row.p,
    house: row.h,
    street: row.s,
    city: row.c,
    state: row.t,
    zip: row.z,
    notes: row.o ?? '',
  }
}
