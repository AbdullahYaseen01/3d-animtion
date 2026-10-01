import { render } from '../src/entry-server'

const cache = new Map<string, ReturnType<typeof render>>()

/** Rendering every route is the slow part of the SEO suites; each URL is rendered once per test file. */
export function cachedRender(url: string): ReturnType<typeof render> {
  let hit = cache.get(url)
  if (!hit) {
    hit = render(url)
    cache.set(url, hit)
  }
  return hit
}
