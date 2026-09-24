import { useCallback, useRef, useState } from 'react'
import { buildSku, getColor, isColorAvailable, stockFor, type Product } from '../../catalog'
import { useCart } from '../../state/CartProvider'

export function useVariantSelection(product: Product, initialColor?: string | null) {
  const { add } = useCart()
  const [colorSlug, setColorSlug] = useState(() => getColor(product, initialColor).slug)
  const [widthCode, setWidthCode] = useState(product.widths[0].code)
  const [size, setSize] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [justAdded, setJustAdded] = useState(false)
  const sizeRef = useRef<HTMLFieldSetElement>(null)
  const addedTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const keepSizeIfAvailable = (color: string, width: string) => {
    if (size != null && stockFor(product, buildSku(product.id, color, size, width)) <= 0) setSize(null)
  }

  const setColor = (slug: string) => {
    setColorSlug(slug)
    keepSizeIfAvailable(slug, widthCode)
  }

  const setWidth = (code: string) => {
    setWidthCode(code)
    keepSizeIfAvailable(colorSlug, code)
  }

  const chooseSize = (s: number) => {
    setSize(s)
    setError(null)
  }

  const colorSoldOut = !isColorAvailable(product, colorSlug, widthCode)

  /** Validates the selection, adds to cart, and returns true on success. */
  const addToCart = useCallback((): boolean => {
    if (size == null) {
      setError(colorSoldOut ? 'This color is sold out in this width.' : 'Select a size to add this pair to your cart.')
      requestAnimationFrame(() => {
        const first = sizeRef.current?.querySelector<HTMLInputElement>('input:not(:disabled)')
        ;(first ?? sizeRef.current)?.focus()
      })
      return false
    }
    const sku = buildSku(product.id, colorSlug, size, widthCode)
    if (stockFor(product, sku) <= 0) {
      setError('That size just sold out. Please choose another size.')
      return false
    }
    add(sku, 1)
    setJustAdded(true)
    clearTimeout(addedTimer.current)
    addedTimer.current = setTimeout(() => setJustAdded(false), 2500)
    return true
  }, [size, colorSoldOut, product, colorSlug, widthCode, add])

  return {
    colorSlug,
    setColor,
    widthCode,
    setWidth,
    size,
    setSize: chooseSize,
    error,
    sizeRef,
    addToCart,
    justAdded,
    colorSoldOut,
  }
}
