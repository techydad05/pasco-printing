import Medusa from '@medusajs/medusa-js';
import { cart } from '$lib/stores/cartStore';

// Assumes env vars already set like other API usage
const medusa = new Medusa({
  baseUrl: import.meta.env.VITE_MEDUSA_BACKEND_URL,
  maxRetries: 3,
});

// Utility: get or create cart and keep the store updated
export async function ensureCart(): Promise<string> {
  let current = null;
  cart.update((c) => {
    current = c;
    return c;
  });
  if (current?.id) return current.id;

  const { cart: newCart } = await medusa.carts.create();
  cart.set(newCart);
  return newCart.id;
}

export async function addItem(variantId: string, quantity = 1) {
  const id = await ensureCart();
  const { cart: updated } = await medusa.carts.lineItems.create(id, {
    variant_id: variantId,
    quantity,
  });
  cart.set(updated);
}

export async function updateItem(lineItemId: string, quantity: number) {
  const id = await ensureCart();
  const { cart: updated } = await medusa.carts.lineItems.update(id, lineItemId, { quantity });
  cart.set(updated);
}

export async function removeItem(lineItemId: string) {
  const id = await ensureCart();
  const { cart: updated } = await medusa.carts.lineItems.delete(id, lineItemId);
  cart.set(updated);
}

export async function refreshCart() {
  const id = await ensureCart();
  const { cart: fresh } = await medusa.carts.retrieve(id);
  cart.set(fresh);
}
