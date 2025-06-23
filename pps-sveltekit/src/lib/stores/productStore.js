// @ts-check
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * @typedef {Object} ProductVariant
 * @property {string} [id]
 * @property {Array<{amount: number, currency_code: string}>} [prices]
 * @property {number|null} [calculated_price]
 * @property {number|null} [original_price]
 */

/**
 * @typedef {Object} Product
 * @property {string} [id]
 * @property {string} [title]
 * @property {string|null} [description]
 * @property {string|null} [thumbnail]
 * @property {Array<ProductVariant>} [variants]
 */

/**
 * @typedef {Object<string, Product>} ProductCache
 */

/**
 * Store for caching products data
 * This helps ensure price data is available across the application
 * @type {import('svelte/store').Writable<ProductCache>}
 */
export const productsCache = writable({});

// Initialize cache from localStorage on browser load
if (browser) {
  try {
    const stored = localStorage.getItem('productsCache');
    if (stored) {
      const parsedCache = JSON.parse(stored);
      productsCache.set(parsedCache);
    }
  } catch (error) {
    console.warn('Failed to load products cache from localStorage:', error);
  }
}

// Subscribe to cache changes and persist to localStorage
if (browser) {
  productsCache.subscribe(cache => {
    try {
      localStorage.setItem('productsCache', JSON.stringify(cache));
    } catch (error) {
      console.warn('Failed to save products cache to localStorage:', error);
    }
  });
}

/**
 * Add a product to the cache
 * @param {Product} product - The product to cache
 */
export function cacheProduct(product) {
  if (!product || !product.id) return;
  
  productsCache.update(cache => {
    const productId = product.id;
    if (productId) {
      cache[productId] = product;
    }
    return cache;
  });
}

/**
 * Add multiple products to the cache
 * @param {Array<Product>} products - Array of products to cache
 */
export function cacheProducts(products) {
  if (!Array.isArray(products)) return;
  
  productsCache.update(cache => {
    products.forEach(product => {
      if (product && product.id) {
        const productId = product.id;
        if (productId) {
          cache[productId] = product;
        }
      }
    });
    return cache;
  });
}

/**
 * Get a product from the cache by ID, with localStorage fallback
 * @param {string} id - The product ID
 * @returns {Product|null} The cached product or null if not found
 */
export function getCachedProduct(id) {
  if (!id) return null;
  
  /** @type {Product|null} */
  let result = null;
  productsCache.subscribe(cache => {
    result = cache[id] || null;
  })();
  
  // If not in memory cache and we're in browser, try localStorage
  if (!result && browser) {
    try {
      const stored = localStorage.getItem('productsCache');
      if (stored) {
        const parsedCache = JSON.parse(stored);
        /** @type {Product|null} */
        const localStorageResult = parsedCache[id] || null;
        
        // If found in localStorage, update memory cache
        if (localStorageResult) {
          result = localStorageResult;
          productsCache.update(cache => {
            cache[id] = localStorageResult;
            return cache;
          });
        }
      }
    } catch (error) {
      console.warn('Failed to retrieve product from localStorage:', error);
    }
  }
  
  return result;
}

/**
 * Get a product by ID with localStorage persistence (no API fallback)
 * Since products.retrieve doesn't include pricing data, we rely only on cached products from products.list
 * @param {string} id - The product ID
 * @returns {Promise<Product|null>} The product or null if not found
 */
export async function getProduct(id) {
  if (!id) return null;
  
  // Try cache first (includes localStorage fallback)
  const cached = getCachedProduct(id);
  if (cached) {
    return cached;
  }
  
  // If not found in cache/localStorage, the product needs to be loaded via products.list first
  // This ensures we get the proper pricing data
  console.warn(`Product ${id} not found in cache. Make sure products.list is called first to populate the cache with pricing data.`);
  return null;
}
