// @ts-check

// Add type declaration for window.__env
/**
 * @typedef {Object} EnvConfig
 * @property {string} [VITE_MEDUSA_BACKEND_URL]
 * @property {string} [VITE_MEDUSA_PUBLISHABLE_KEY]
 */

/**
 * @typedef {Object} CustomWindow
 * @property {EnvConfig} [__env]
 */

// In SvelteKit, we need to handle environment variables differently for SSR vs client
// For client-side, we use import.meta.env
// For server-side, we would use process.env, but we're focusing on client-side here

// Debug environment variables
console.log('Environment variables available in client:', import.meta.env);

// Use environment variable for the backend URL with fallback to localhost for development
// In production, this will use the VITE_MEDUSA_BACKEND_URL that was available at BUILD time
let MEDUSA_BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000';

// For runtime override in production (if needed)
// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  // Try to get from window.__env if it exists (can be injected at runtime)
  // @ts-ignore - window.__env is defined in static/env-config.js
  if (window.__env && window.__env.VITE_MEDUSA_BACKEND_URL) {
    // @ts-ignore - window.__env is defined in static/env-config.js
    MEDUSA_BACKEND_URL = window.__env.VITE_MEDUSA_BACKEND_URL;
  }
}

console.log('MEDUSA_BACKEND_URL (after all logic):', MEDUSA_BACKEND_URL);

// Get the publishable key from environment variables with similar logic
let PUBLISHABLE_KEY = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || '';

// For runtime override in production (if needed)
if (typeof window !== 'undefined') {
  // @ts-ignore - window.__env is defined in static/env-config.js
  if (window.__env && window.__env.VITE_MEDUSA_PUBLISHABLE_KEY) {
    // @ts-ignore - window.__env is defined in static/env-config.js
    PUBLISHABLE_KEY = window.__env.VITE_MEDUSA_PUBLISHABLE_KEY;
  }
}

/**
 * Creates headers for API requests
 * @returns {Record<string, string>}
 */
function createHeaders() {
	/** @type {Record<string, string>} */
	const headers = {
		'Content-Type': 'application/json'
	};

	if (PUBLISHABLE_KEY) {
		headers['x-publishable-api-key'] = PUBLISHABLE_KEY;
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
