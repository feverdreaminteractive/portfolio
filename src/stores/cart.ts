import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import { getCart, createCart, addCartLines, removeCartLines } from '../lib/shopify/client';
import type { Cart } from '../lib/shopify/schemas';

export const isCartDrawerOpen = atom(false);
export const isCartUpdating = atom(false);

const emptyCart: Cart = {
  id: '',
  checkoutUrl: '',
  totalQuantity: 0,
  lines: { nodes: [] },
  cost: { subtotalAmount: { amount: '0.0', currencyCode: 'USD' } },
};

export const cart = persistentAtom<Cart>('fd_cart', emptyCart, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

// Validates the persisted cart against Shopify once per session — Shopify
// deletes carts after checkout completes or ~10 days of inactivity.
export async function initCart() {
  if (sessionStorage.getItem('fd_cart_session_checked')) return;
  sessionStorage.setItem('fd_cart_session_checked', 'true');

  const cartId = cart.get().id;
  if (!cartId) return;

  const data = await getCart(cartId);
  cart.set(data ?? emptyCart);
}

export async function addCartItem(merchandiseId: string, quantity = 1) {
  isCartUpdating.set(true);
  try {
    const cartId = cart.get().id;
    const data = cartId
      ? await addCartLines(cartId, merchandiseId, quantity)
      : await createCart(merchandiseId, quantity);
    cart.set(data);
    isCartDrawerOpen.set(true);
  } finally {
    isCartUpdating.set(false);
  }
}

export async function removeCartItems(lineIds: string[]) {
  const cartId = cart.get().id;
  if (!cartId) return;

  isCartUpdating.set(true);
  try {
    const data = await removeCartLines(cartId, lineIds);
    cart.set(data);
  } finally {
    isCartUpdating.set(false);
  }
}

// Shopify deletes the cart once checkout completes — reset local state to
// match rather than waiting for a stale cart lookup to fail on next visit.
export function clearCart() {
  cart.set(emptyCart);
}
