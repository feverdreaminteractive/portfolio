import { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { cart, isCartDrawerOpen, isCartUpdating, removeCartItems, initCart } from '../../stores/cart';
import { formatMoney } from '../../lib/shopify/format-money';

export default function CartDrawer() {
  const $cart = useStore(cart);
  const $isOpen = useStore(isCartDrawerOpen);
  const $isUpdating = useStore(isCartUpdating);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initCart();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', $isOpen);
    if ($isOpen) drawerRef.current?.focus();
  }, [$isOpen]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') isCartDrawerOpen.set(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (!$isOpen) return null;

  const hasItems = $cart.lines.nodes.length > 0;

  return (
    <div className="fixed inset-0 z-[10000]" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => isCartDrawerOpen.set(false)}
      />

      <div
        ref={drawerRef}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 w-full max-w-md bg-black border-l border-white/10 flex flex-col outline-none"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 id="cart-drawer-title" className="text-lg font-normal text-white flex items-center gap-3">
            Your cart
            {$isUpdating && (
              <svg className="animate-spin w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
          </h2>
          <button
            type="button"
            onClick={() => isCartDrawerOpen.set(false)}
            aria-label="Close cart"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto px-5 ${$isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
          {hasItems ? (
            <ul className="divide-y divide-white/10">
              {$cart.lines.nodes.map((item) => (
                <li key={item.id} className="py-6 flex gap-4">
                  {item.merchandise.image && (
                    <img
                      src={item.merchandise.image.url}
                      alt={item.merchandise.image.altText ?? ''}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">{item.merchandise.product.title}</p>
                    <p className="text-gray-400 text-xs mt-1">{formatMoney(item.cost.amountPerQuantity)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      type="button"
                      onClick={() => removeCartItems([item.id])}
                      disabled={$isUpdating}
                      aria-label="Remove item"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                    <p className="text-white text-sm font-medium">{formatMoney(item.cost.totalAmount)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center mt-20">
              <p className="text-gray-500 text-sm">Your cart is empty</p>
            </div>
          )}
        </div>

        {hasItems && (
          <div className="border-t border-white/10 p-5">
            <div className="flex justify-between text-sm text-white mb-1">
              <p>Subtotal</p>
              <p>{formatMoney($cart.cost.subtotalAmount)}</p>
            </div>
            <p className="text-xs text-gray-500 mb-4">Taxes calculated at checkout.</p>
            <a
              href={$cart.checkoutUrl}
              className="block text-center text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-lg px-4 py-3 transition-colors"
            >
              Checkout
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
