export type CategorySlug = 'running' | 'trail' | 'lifestyle' | 'everyday'

export interface Category {
  slug: CategorySlug
  name: string
  /** Short line used on tiles and in navigation. */
  summary: string
  /** Intro paragraph rendered at the top of the collection page. */
  intro: string
  seoTitle: string
  seoDescription: string
}

export interface ColorOption {
  slug: string
  name: string
  /** One or two hex values used to draw the swatch. */
  swatch: [string] | [string, string]
  /** Keys in the image manifest, first image is the primary card image. */
  images: string[]
  /** Base color family for filtering. */
  family: 'white' | 'black' | 'grey' | 'green' | 'red' | 'neutral'
}

export interface WidthOption {
  code: string
  label: string
}

export interface ProductSpec {
  label: string
  value: string
}

export interface Product {
  id: string
  slug: string
  name: string
  category: CategorySlug
  /** Short benefit line shown on cards. */
  tagline: string
  description: string
  priceCents: number
  /** Only set for a genuine markdown from a previously charged price. */
  compareAtPriceCents?: number
  colors: ColorOption[]
  /** US men's sizes. */
  sizes: number[]
  widths: WidthOption[]
  highlights: string[]
  specs: ProductSpec[]
  materials: string
  care: string
  fit: { summary: string; advice: string }
  bestFor: string[]
  isNew?: boolean
  /** Stock per SKU. Missing SKUs use `defaultStock`. */
  defaultStock: number
  stock: Record<string, number>
  relatedGuides?: string[]
}

export interface Variant {
  sku: string
  productId: string
  colorSlug: string
  size: number
  widthCode: string
}
