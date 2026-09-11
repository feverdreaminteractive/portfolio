import { config } from './config';
import { CartResult, ProductResult } from './schemas';
import type { Cart, Product } from './schemas';
import {
  ProductByHandleQuery,
  CreateCartMutation,
  AddCartLinesMutation,
  RemoveCartLinesMutation,
  GetCartQuery,
} from './graphql';

async function shopifyFetch(query: string, variables: Record<string, unknown> = {}) {
  const res = await fetch(`https://${config.shopifyDomain}/api/${config.apiVersion}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': config.storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Shopify request failed: ${res.status} ${await res.text()}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors.map((e: { message: string }) => e.message).join(', '));
  }
  return json.data;
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  const data = await shopifyFetch(ProductByHandleQuery, { handle });
  if (!data.product) return null;
  return ProductResult.parse(data.product);
}

export async function getCart(id: string): Promise<Cart | null> {
  const data = await shopifyFetch(GetCartQuery, { id });
  if (!data.cart) return null;
  return CartResult.parse(data.cart);
}

export async function createCart(merchandiseId: string, quantity: number): Promise<Cart> {
  const data = await shopifyFetch(CreateCartMutation, { merchandiseId, quantity });
  const { cart, userErrors } = data.cartCreate;
  if (userErrors.length > 0) throw new Error(userErrors.map((e: { message: string }) => e.message).join(', '));
  return CartResult.parse(cart);
}

export async function addCartLines(cartId: string, merchandiseId: string, quantity: number): Promise<Cart> {
  const data = await shopifyFetch(AddCartLinesMutation, { cartId, merchandiseId, quantity });
  const { cart, userErrors } = data.cartLinesAdd;
  if (userErrors.length > 0) throw new Error(userErrors.map((e: { message: string }) => e.message).join(', '));
  return CartResult.parse(cart);
}

export async function removeCartLines(cartId: string, lineIds: string[]): Promise<Cart> {
  const data = await shopifyFetch(RemoveCartLinesMutation, { cartId, lineIds });
  const { cart, userErrors } = data.cartLinesRemove;
  if (userErrors.length > 0) throw new Error(userErrors.map((e: { message: string }) => e.message).join(', '));
  return CartResult.parse(cart);
}
