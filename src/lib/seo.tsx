import { createContext, useContext, useEffect, useMemo } from 'react'
import { store } from '../config/store'

export const SITE_URL = ((import.meta.env.VITE_SITE_URL as string | undefined) || 'https://core-seven-henna.vercel.app').replace(/\/$/, '')

/** Set at build time: true only for the intentional production deployment. */
export const ALLOW_INDEXING = __ALLOW_INDEXING__

export interface SeoProps {
  title: string
  description: string
  /** Canonical path without query string, e.g. "/products/stride-runner". */
  path: string
  image?: string
  imageAlt?: string
  type?: 'website' | 'product' | 'article'
  noindex?: boolean
  jsonLd?: object | object[]
  /** Use the title verbatim instead of appending the brand. */
  rawTitle?: boolean
}

export interface HeadData {
  title: string
  tags: HeadTag[]
}

type HeadTag =
  | { tag: 'meta'; attrs: Record<string, string> }
  | { tag: 'link'; attrs: Record<string, string> }
  | { tag: 'script'; json: object }

export interface HeadCollector {
  data?: HeadData
}

export const HeadContext = createContext<HeadCollector | null>(null)

export function absoluteUrl(path: string): string {
  return path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

export function buildHead(p: SeoProps): HeadData {
  const title = p.rawTitle ? p.title : `${p.title} | ${store.name}`
  const canonical = absoluteUrl(p.path === '/' ? '/' : p.path.replace(/\/$/, ''))
  const image = absoluteUrl(p.image ?? '/og-default.jpg')
  const robots = !ALLOW_INDEXING || p.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'
  const tags: HeadTag[] = [
    { tag: 'meta', attrs: { name: 'description', content: p.description } },
    { tag: 'meta', attrs: { name: 'robots', content: robots } },
    { tag: 'meta', attrs: { property: 'og:site_name', content: store.name } },
    { tag: 'meta', attrs: { property: 'og:type', content: p.type === 'article' ? 'article' : p.type === 'product' ? 'product' : 'website' } },
    { tag: 'meta', attrs: { property: 'og:title', content: title } },
    { tag: 'meta', attrs: { property: 'og:description', content: p.description } },
    { tag: 'meta', attrs: { property: 'og:url', content: canonical } },
    { tag: 'meta', attrs: { property: 'og:image', content: image } },
    { tag: 'meta', attrs: { property: 'og:image:alt', content: p.imageAlt ?? `${store.name} footwear` } },
    { tag: 'meta', attrs: { property: 'og:locale', content: 'en_US' } },
    { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
    { tag: 'meta', attrs: { name: 'twitter:title', content: title } },
    { tag: 'meta', attrs: { name: 'twitter:description', content: p.description } },
    { tag: 'meta', attrs: { name: 'twitter:image', content: image } },
  ]
  if (!p.noindex) tags.push({ tag: 'link', attrs: { rel: 'canonical', href: canonical } })
  const ld = p.jsonLd ? (Array.isArray(p.jsonLd) ? p.jsonLd : [p.jsonLd]) : []
  ld.forEach((json) => tags.push({ tag: 'script', json }))
  return { title, tags }
}

const escapeAttr = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const escapeText = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;')
/** JSON-LD must not be able to close its own script element. */
const safeJson = (o: object) => JSON.stringify(o).replace(/</g, '\\u003c')

export function headToString(h: HeadData): string {
  const tags = h.tags.map((t) => {
    if (t.tag === 'script') return `<script type="application/ld+json" data-seo>${safeJson(t.json)}</script>`
    const attrs = Object.entries(t.attrs)
      .map(([k, v]) => `${k}="${escapeAttr(v)}"`)
      .join(' ')
    return `<${t.tag} ${attrs} data-seo>`
  })
  return [`<title>${escapeText(h.title)}</title>`, ...tags].join('\n    ')
}

function applyHead(h: HeadData) {
  document.title = h.title
  document.head.querySelectorAll('[data-seo]').forEach((el) => el.remove())
  const frag = document.createDocumentFragment()
  for (const t of h.tags) {
    const el = document.createElement(t.tag)
    if (t.tag === 'script') {
      el.setAttribute('type', 'application/ld+json')
      el.textContent = safeJson(t.json)
    } else {
      Object.entries(t.attrs).forEach(([k, v]) => el.setAttribute(k, v))
    }
    el.setAttribute('data-seo', '')
    frag.appendChild(el)
  }
  document.head.appendChild(frag)
}

export function Seo(props: SeoProps) {
  const collector = useContext(HeadContext)
  const head = useMemo(() => buildHead(props), [props])
  if (collector && typeof window === 'undefined') collector.data = head
  const key = JSON.stringify(head)
  useEffect(() => {
    applyHead(head)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return null
}

/* ---------- Structured data builders ---------- */

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: store.legalName,
    url: SITE_URL,
    logo: absoluteUrl('/favicon.svg'),
    email: store.supportEmail,
    ...(store.social.length ? { sameAs: store.social.map((s) => s.href) } : {}),
  }
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: store.name,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  }
}
