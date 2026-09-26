/** sitemap.xml and robots.txt builders, shared by the prerender and the tests. */

export const xml = (v) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** @param {{ path: string, sitemap: boolean, lastmod?: string, images?: string[] }[]} routes */
export function buildSitemap(routes, siteUrl) {
  const entry = (r) => {
    const parts = [`<loc>${xml(siteUrl + r.path)}</loc>`]
    if (r.lastmod) parts.push(`<lastmod>${r.lastmod}</lastmod>`)
    for (const img of r.images ?? []) parts.push(`<image:image><image:loc>${xml(siteUrl + img)}</image:loc></image:image>`)
    return `  <url>\n    ${parts.join('\n    ')}\n  </url>`
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${routes
  .filter((r) => r.sitemap)
  .map(entry)
  .join('\n')}
</urlset>
`
}

export function buildRobots(allowIndexing, siteUrl) {
  return allowIndexing
    ? `User-agent: *
Disallow: /cart
Disallow: /checkout
Disallow: /search
Disallow: /wishlist
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml
`
    : `# Non-production build: keep out of search engines.
User-agent: *
Disallow: /
`
}
