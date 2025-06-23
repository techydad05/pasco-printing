import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// The active cart object returned from Medusa
export const cart = writable<any>(null);

// Initialize cart from localStorage if available
if (browser) {
  try {
    const storedCart = localStorage.getItem('medusa_cart');
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      cart.set(parsedCart);
    }
  } catch (error) {
    console.warn('Failed to load cart from localStorage:', error);
  }
}

// Subscribe to cart changes and persist to localStorage
if (browser) {
  cart.subscribe((currentCart) => {
    try {
      if (currentCart) {
        localStorage.setItem('medusa_cart', JSON.stringify(currentCart));
      } else {
        localStorage.removeItem('medusa_cart');
      }
    } catch (error) {
      console.warn('Failed to save cart to localStorage:', error);
    }
  });
}

// Simple derived helpers
export const cartId = derived(cart, ($cart) => $cart?.id ?? null);

export const lineItemCount = derived(cart, ($cart) =>
  $cart?.items?.reduce((sum: number, i: any) => sum + (i.quantity ?? 0), 0) ?? 0
);

export const subtotal = derived(cart, ($cart) => $cart?.subtotal ?? 0);

export const total = derived(cart, ($cart) => $cart?.total ?? 0);

// UI state: whether the cart drawer is open
export const drawerOpen = writable(false);
