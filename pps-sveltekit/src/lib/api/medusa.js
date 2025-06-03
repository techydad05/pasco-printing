// @ts-check

const MEDUSA_BACKEND_URL = 'http://localhost:9000';

// Get the publishable key from environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || '';

/**
 * Creates headers for API requests
 * @returns {Record<string, string>}
 */
function createHeaders() {
  /** @type {Record<string, string>} */
  const headers = {
    'Content-Type': 'application/json',
  };

  if (PUBLISHABLE_KEY) {
    headers['x-publishable-key'] = PUBLISHABLE_KEY;
  }

  return headers;
}

/**
 * @typedef {Object} Price
 * @property {number} amount
 * @property {string} currency_code
 */

/**
 * @typedef {Object} Variant
 * @property {string} id
 * @property {Price[]} prices
 */

/**
 * @typedef {Object} Collection
 * @property {string} id
 * @property {string} title
 */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} title
 * @property {string | null} description
 * @property {string | null} thumbnail
 * @property {Collection | null} collection
 * @property {Variant[]} variants
 */

/**
 * Fetches products from the Medusa API
 * @returns {Promise<Product[]>}
 */
export async function fetchProducts() {
  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/products?limit=12`, {
      headers: createHeaders()
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return /** @type {Product[]} */ (data.products || []);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Fetches collections from the Medusa API
 * @returns {Promise<Collection[]>}
 */
export async function fetchCollections() {
  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/collections`, {
      headers: createHeaders()
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return /** @type {Collection[]} */ (data.collections || []);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}
