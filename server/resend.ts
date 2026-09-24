import { env } from './http.js'

export type ResendResult = { ok: true; status: number; data: Record<string, unknown> } | { ok: false; status: number; message: string }

export async function resendRequest(path: string, body: unknown, idempotencyKey?: string): Promise<ResendResult> {
  const key = env('RESEND_API_KEY')
  if (!key) return { ok: false, status: 503, message: 'RESEND_API_KEY is not set' }
  const headers: Record<string, string> = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey.slice(0, 256)
  try {
    const res = await fetch(`https://api.resend.com${path}`, { method: 'POST', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(8000) })
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
    if (res.ok) return { ok: true, status: res.status, data }
    return { ok: false, status: res.status, message: typeof data.message === 'string' ? data.message : `Resend responded ${res.status}` }
  } catch (err) {
    return { ok: false, status: 502, message: err instanceof Error ? err.name : 'network error' }
  }
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}
