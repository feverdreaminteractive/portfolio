import { useStore } from '@nanostores/react';
import { cart, isCartUpdating, addCartItem } from '../../stores/cart';

interface AddToCartButtonProps {
  variantId: string;
  availableForSale: boolean;
}

export default function AddToCartButton({ variantId, availableForSale }: AddToCartButtonProps) {
  const $cart = useStore(cart);
  const $isCartUpdating = useStore(isCartUpdating);

  // Digital, one-per-purchase goods: once a screensaver is in the cart,
  // there's nothing more to add — no "add another" for a single download.
  const alreadyInCart = $cart.lines.nodes.some((line) => line.merchandise.id === variantId);

  return (
    <button
      type="button"
      disabled={$isCartUpdating || !availableForSale || alreadyInCart}
      onClick={() => addCartItem(variantId)}
      className="inline-flex items-center gap-2 text-sm text-white bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 rounded-lg px-3 py-2 transition-all disabled:opacity-60 disabled:hover:bg-white/10 disabled:hover:border-white/10 disabled:cursor-not-allowed"
    >
      {alreadyInCart ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.755-4.766 1.869-7.264a.75.75 0 00-.738-.786H5.106M7.5 14.25L5.106 5.25M7.5 14.25L5.62 7.5m0 0h13.75"
          />
        </svg>
      )}
      {!availableForSale ? 'Sold out' : alreadyInCart ? 'In cart' : 'Add to cart'}
    </button>
  );
}
