export type DepartmentSlug = 'shoes' | 'handbags' | 'wallets' | 'jackets' | 'womens-jewelry' | 'backpacks' | 'watches'
export type ShoeUse = 'running' | 'trail' | 'lifestyle' | 'everyday'
/** Departments plus the existing shoe-activity collections. */
export type CategorySlug = DepartmentSlug | ShoeUse
export type VariantKind = 'footwear' | 'apparel' | 'simple'

export interface Category {
  slug: CategorySlug
  name: string
  /** Short line used on tiles and in navigation. */
  summary: string
  /** Intro paragraph rendered at the top of the collection page. */
  intro: string
  seoTitle: string
  seoDescription: string
  /** Shoe-activity collections stay linked, but they are not top-level departments. */
  kind: 'department' | 'shoe-use'
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

export interface ProductTrait {
  group: string
  value: string
}

export interface Product {
  id: string
  slug: string
  name: string
  category: DepartmentSlug
  /** Set on shoes so /collections/running and the other activity URLs keep working. */
  shoeUse?: ShoeUse
  variant: VariantKind
  /** Short benefit line shown on cards. */
  tagline: string
  description: string
  priceCents: number
  /** Only set for a genuine markdown from a previously charged price. */
  compareAtPriceCents?: number
  colors: ColorOption[]
  /**
   * Selectable sizes. Footwear uses US men's sizes. Apparel uses the keys in `sizeLabels`.
   * Simple products use `[0]` internally and do not show a size picker.
   */
  sizes: number[]
  sizeLabels?: Record<number, string>
  widths: WidthOption[]
  highlights: string[]
  specs: ProductSpec[]
  traits?: ProductTrait[]
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
