export function json(body: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json; charset=utf-8')
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'no-store')
  return new Response(JSON.stringify(body), { ...init, headers })
}

export function methodNotAllowed(allowed: string[]): Response {
  return json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: allowed.join(', ') } })
}

const MAX_BODY_BYTES = 32 * 1024

/** Reads a small JSON body. Returns null for oversized, non-JSON or malformed input. */
export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  const type = request.headers.get('content-type') ?? ''
  if (!type.includes('application/json')) return null
  const text = await request.text()
  if (text.length > MAX_BODY_BYTES) return null
  try {
    const data: unknown = JSON.parse(text)
    return data && typeof data === 'object' && !Array.isArray(data) ? (data as Record<string, unknown>) : null
  } catch {
    return null
  }
}

/**
 * Rejects cross-site browser POSTs. Browsers always send Origin on POST fetches;
 * requests without it (server-to-server tools) are allowed through.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true
  try {
    return new URL(origin).host === new URL(request.url).host
  } catch {
    return false
  }
}

export function requestOrigin(request: Request): string {
  return new URL(request.url).origin
}

export function env(name: string): string | undefined {
  const v = process.env[name]
  return v && v.trim() ? v.trim() : undefined
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isEmail(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 254 && EMAIL_RE.test(value)
}

/** Log without customer data: only event names, ids and error codes. */
export function logEvent(event: string, data: Record<string, string | number | boolean | undefined> = {}): void {
  console.log(JSON.stringify({ ...data, event }))
}
