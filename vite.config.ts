/// <reference types="vitest/config" />
import type { IncomingMessage, ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite'

export const API_ROUTES: Record<string, string> = {
  '/api/checkout': 'checkout',
  '/api/order': 'order',
  '/api/stripe-webhook': 'stripeWebhook',
  '/api/newsletter': 'newsletter',
  '/api/contact': 'contact',
}

/** Bridges Node requests to the Web-standard handlers in server/handlers (same code Vercel runs). */
export function createApiMiddleware(load: (id: string) => Promise<Record<string, unknown>>) {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
    const name = API_ROUTES[url.pathname]
    if (!name) return next()
    try {
      const mod = await load(`/server/handlers/${name}.ts`)
      const handler = mod[req.method ?? 'GET'] as ((r: Request) => Promise<Response> | Response) | undefined
      if (typeof handler !== 'function') {
        res.statusCode = 405
        return res.end()
      }
      const headers = new Headers()
      for (const [k, v] of Object.entries(req.headers)) {
        if (typeof v === 'string') headers.set(k, v)
        else if (Array.isArray(v)) v.forEach((x) => headers.append(k, x))
      }
      let body: Buffer | undefined
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)
        body = Buffer.concat(chunks)
      }
      const response = await handler(new Request(url, { method: req.method, headers, body }))
      res.statusCode = response.status
      response.headers.forEach((v, k) => res.setHeader(k, v))
      res.end(Buffer.from(await response.arrayBuffer()))
    } catch (err) {
      console.error(err)
      res.statusCode = 500
      res.end('API error')
    }
  }
}

function apiDevPlugin(): Plugin {
  return {
    name: 'nova-api-dev',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(createApiMiddleware((id) => server.ssrLoadModule(id)))
    },
  }
}

export default defineConfig(({ mode, isSsrBuild }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const [k, v] of Object.entries(env)) if (process.env[k] === undefined) process.env[k] = v

  const indexingOverride = process.env.ALLOW_INDEXING
  const allowIndexing = indexingOverride ? indexingOverride === 'true' : process.env.VERCEL_ENV === 'production'

  return {
    plugins: [react(), apiDevPlugin()],
    define: {
      __ALLOW_INDEXING__: JSON.stringify(allowIndexing),
    },
    build: {
      // The prerender reads the client manifest to add modulepreload hints per page.
      manifest: !isSsrBuild,
      // Framework code changes far less often than the app, so it gets its own long-cached chunk.
      rollupOptions: isSsrBuild
        ? undefined
        : { output: { manualChunks: (id) => (/node_modules[\\/](react|react-dom|react-router|scheduler|cookie|set-cookie-parser)[\\/]/.test(id) ? 'vendor' : undefined) } },
      cssCodeSplit: false,
      assetsInlineLimit: 0,
      chunkSizeWarningLimit: 300,
    },
    test: {
      environment: 'node',
      include: ['tests/**/*.test.ts'],
      // SEO tests render every prerendered route several times.
      testTimeout: 30_000,
    },
  }
})
