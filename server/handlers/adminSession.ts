import { adminPassword, clearAdminCookie, passwordsMatch, setAdminCookie } from '../adminAuth.js'
import { isSameOrigin, json, methodNotAllowed, readJson } from '../http.js'

export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: 'Forbidden' }, { status: 403 })
  const secret = adminPassword()
  if (!secret) return json({ error: 'Admin access is not configured yet.', code: 'unconfigured' }, { status: 503 })

  const body = await readJson(request)
  const password = typeof body?.password === 'string' ? body.password : ''
  if (!password || password.length > 200 || !passwordsMatch(password, secret)) {
    return json({ error: 'That password is not correct.' }, { status: 401 })
  }

  return new Response(null, {
    status: 204,
    headers: { 'Set-Cookie': setAdminCookie(request, secret), 'Cache-Control': 'no-store' },
  })
}

export function DELETE(request: Request): Response {
  if (!isSameOrigin(request)) return json({ error: 'Forbidden' }, { status: 403 })
  return new Response(null, {
    status: 204,
    headers: { 'Set-Cookie': clearAdminCookie(), 'Cache-Control': 'no-store' },
  })
}

export const GET = () => methodNotAllowed(['POST', 'DELETE'])
