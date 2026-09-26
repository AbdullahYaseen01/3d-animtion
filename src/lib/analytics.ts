/**
 * Minimal commerce event layer. Events go to `window.dataLayer` (GTM/GA4
 * compatible) and to gtag when `VITE_GA4_ID` (or `VITE_GA_ID`) is configured. Nothing is sent
 * when analytics is unconfigured or the visitor signals Global Privacy
 * Control / Do Not Track. Payloads must never include customer PII.
 */
import { centsToDecimal } from './money'
import type { PricedLine } from '../commerce/cart'
import type { Product } from '../catalog'

type EventName =
  | 'view_item_list'
  | 'view_item'
  | 'search'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'begin_checkout'
  | 'purchase'
  | 'sign_up'
  | 'generate_lead'

interface AnalyticsItem {
  item_id: string
  item_name: string
  item_category?: string
  item_variant?: string
  price?: number
  quantity?: number
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
  interface Navigator {
    globalPrivacyControl?: boolean
  }
}

/** `VITE_GA_ID` is accepted as an alias. Only a G- measurement ID is used. */
const rawId = (import.meta.env.VITE_GA4_ID || import.meta.env.VITE_GA_ID || '').trim()
const GA_ID = /^G-[A-Z0-9]+$/i.test(rawId) ? rawId : undefined

function allowed(): boolean {
  if (typeof window === 'undefined') return false
  if (navigator.globalPrivacyControl === true || navigator.doNotTrack === '1') return false
  return true
}

let loaded = false
export function initAnalytics(): void {
  if (loaded || !GA_ID || !allowed()) return
  loaded = true
  window.dataLayer = window.dataLayer ?? []
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { send_page_view: true, allow_google_signals: false })
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`
  document.head.appendChild(s)
}

export function track(event: EventName, params: Record<string, unknown> = {}): void {
  if (!allowed()) return
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push({ event, ...params })
  if (GA_ID && window.gtag) window.gtag('event', event, params)
  if (import.meta.env.DEV) console.debug('[analytics]', event, params)
}

export function productItem(p: Product, extra: Partial<AnalyticsItem> = {}): AnalyticsItem {
  return { item_id: p.id, item_name: p.name, item_category: p.category, price: p.priceCents / 100, ...extra }
}

export function lineItem(l: PricedLine): AnalyticsItem {
  return productItem(l.product, { item_variant: l.sku, quantity: l.quantity, price: l.unitCents / 100 })
}

export function money(cents: number) {
  return { currency: 'USD', value: Number(centsToDecimal(cents)) }
}

/** Fires `purchase` at most once per order id in this browser. */
export function trackPurchaseOnce(orderId: string, params: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  const key = `nova:purchase-tracked:${orderId}`
  try {
    if (localStorage.getItem(key)) return
    localStorage.setItem(key, '1')
  } catch {
    return
  }
  track('purchase', { transaction_id: orderId, ...params })
}
