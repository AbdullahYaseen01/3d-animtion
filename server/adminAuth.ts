import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { env } from './http.js'

export const ADMIN_COOKIE = 'nova_admin'
const MAX_AGE_SEC = 12 * 60 * 60
const MIN_PASSWORD = 10

/** A usable owner password. Short or missing values are treated as not configured. */
export function adminPassword(): string | undefined {
  const password = env('ADMIN_PASSWORD')
  if (!password || password.length < MIN_PASSWORD) return undefined
  return password
}

export function passwordsMatch(given: string, expected: string): boolean {
  const a = createHash('sha256').update(given).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

function sign(exp: string, secret: string): string {
  return createHmac('sha256', secret).update(`nova-admin:${exp}`).digest('base64url')
}

export function adminCookieValue(secret: string, now = Date.now()): string {
  const exp = String(Math.floor(now / 1000) + MAX_AGE_SEC)
  return `${exp}.${sign(exp, secret)}`
}

export function adminCookieValid(token: string | undefined, secret: string, now = Date.now()): boolean {
  if (!token) return false
  const [exp, sig] = token.split('.')
  if (!exp || !sig || !/^\d{10,12}$/.test(exp)) return false
  if (Number(exp) * 1000 < now) return false
  const expected = sign(exp, secret)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=')
    if (k === name) return rest.join('=')
  }
  return undefined
}

export function setAdminCookie(request: Request, secret: string): string {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : ''
  return `${ADMIN_COOKIE}=${adminCookieValue(secret)}; HttpOnly; Path=/; Max-Age=${MAX_AGE_SEC}; SameSite=Strict${secure}`
}

export function clearAdminCookie(): string {
  return `${ADMIN_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`
}

export function requestIsAdmin(request: Request): boolean {
  const secret = adminPassword()
  if (!secret) return false
  return adminCookieValid(readCookie(request.headers.get('cookie'), ADMIN_COOKIE), secret)
}
