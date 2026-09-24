import { Link } from 'react-router'
import { useCart } from '../../state/CartProvider'
import { Dialog } from '../ui/Dialog'
import { CartLineItem } from './CartLineItem'
import { CartAssurances, CartTotals, CheckoutButton, FreeShippingProgress } from './CartSummary'
import './Cart.css'

export function MiniCart() {
  const { cart, isOpen, closeCart } = useCart()
  const empty = cart.lines.length === 0
  return (
    <Dialog
      open={isOpen}
      onClose={closeCart}
      title={empty ? 'Your cart' : `Your cart (${cart.itemCount})`}
      variant="drawer-right"
      className="mini-cart"
      footer={
        empty ? undefined : (
          <div className="mini-cart__footer">
            <CartTotals compact />
            <CheckoutButton />
            <Link to="/cart" className="link-arrow mini-cart__view" onClick={closeCart}>
              View full cart
            </Link>
          </div>
        )
      }
    >
      {empty ? (
        <div className="empty-state">
          <h3 className="display">Your cart is empty</h3>
          <p>Find a pair for your next run, commute or weekend.</p>
          <Link to="/shop" className="btn" onClick={closeCart}>
            Shop all shoes
          </Link>
          <Link to="/wishlist" className="link-arrow" onClick={closeCart}>
            View saved items
          </Link>
        </div>
      ) : (
        <>
          <FreeShippingProgress />
          <ul role="list" className="cart-lines">
            {cart.lines.map((line) => (
              <CartLineItem key={line.sku} line={line} compact onNavigate={closeCart} />
            ))}
          </ul>
          <CartAssurances />
        </>
      )}
    </Dialog>
  )
}
