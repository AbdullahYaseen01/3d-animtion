import { useState } from 'react'
import { Link } from 'react-router'
import { getProductById } from '../catalog'
import { ProductCard } from '../components/product/ProductCard'
import { QuickShop, type QuickShopTarget } from '../components/product/QuickShop'
import { Seo } from '../lib/seo'
import { useWishlist } from '../state/WishlistProvider'
import '../components/product/ProductCard.css'

export default function Wishlist() {
  const { items, hydrated } = useWishlist()
  const [quick, setQuick] = useState<QuickShopTarget | null>(null)
  const products = items.map((i) => getProductById(i.productId)).filter((p) => !!p)

  return (
    <>
      <Seo title="Saved Items" description="Shoes you have saved on NOVA." path="/wishlist" noindex />
      <div className="container" style={{ paddingBottom: 'var(--space-section)' }}>
        <div className="page-head">
          <h1>Saved items</h1>
          <p className="muted">Saved on this device. Select a size with Quick shop when you are ready.</p>
        </div>
        {!hydrated ? (
          <p className="muted">Loading saved items…</p>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h2>Nothing saved yet</h2>
            <p>Tap the heart on a product to keep it here while you decide.</p>
            <Link to="/shop" className="btn">
              Shop all
            </Link>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} headingLevel="h2" onQuickShop={(product, colorSlug) => setQuick({ product, colorSlug })} />
            ))}
          </div>
        )}
      </div>
      <QuickShop target={quick} onClose={() => setQuick(null)} />
    </>
  )
}
