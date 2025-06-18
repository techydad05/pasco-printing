// @ts-check
import Medusa from '@medusajs/medusa-js';

// Use environment variable for the backend URL with fallback to localhost for development
const MEDUSA_BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL || 'http://192.168.4.138:9000';

// Get the publishable key from environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || '';

// Initialize Medusa client with proper configuration
const medusaClient = new Medusa({ 
  baseUrl: MEDUSA_BACKEND_URL, 
  maxRetries: 3
});

// If we have a publishable key, set it on the client
if (PUBLISHABLE_KEY) {
  medusaClient.setPublishableKey(PUBLISHABLE_KEY);
}

// Helper functions for price formatting can be added here if needed

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
 * @returns {Promise<any[]>}
 */
export async function fetchProducts() {
	try {
		// Use the correct API call format for the medusa-js client
		const { products } = await medusaClient.products.list();
		return products || [];
	} catch (error) {
		console.error('Error fetching products:', error);
		return [];
	}
}

/**
 * Fetches collections from the Medusa API
 * @returns {Promise<any[]>}
 */
export async function fetchCollections() {
	try {
		const { collections } = await medusaClient.collections.list();
		return collections || [];
	} catch (error) {
		console.error('Error fetching collections:', error);
		return [];
	}
}

/**
 * Fetch a single product by its ID
 * @param {string} id - The product ID
 * @returns {Promise<any|null>}
 */
export async function fetchProductById(id) {
	try {
		const { product } = await medusaClient.products.retrieve(id);
		return product || null;
	} catch (error) {
		console.error(`Error fetching product ${id}:`, error);
		return null;
	}
}
