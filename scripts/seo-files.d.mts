export interface SitemapRoute {
  path: string
  sitemap: boolean
  lastmod?: string
  images?: string[]
}
export declare const xml: (v: string) => string
export declare function buildSitemap(routes: SitemapRoute[], siteUrl: string): string
export declare function buildRobots(allowIndexing: boolean, siteUrl: string): string
