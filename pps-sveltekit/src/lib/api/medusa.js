// @ts-check
import dotenv from 'dotenv';
dotenv.config();

console.log(process.env);

// Debug environment variables - extract and log all VITE_ prefixed variables
const envVars = Object.fromEntries(
	Object.entries(import.meta.env).map(([key, value]) => [
		key,
		key.includes('SECRET') || key.includes('KEY') ? '[REDACTED]' : value
	])
);

// Log all environment variables
console.log('Available environment variables:', envVars);

// Specifically log VITE_ prefixed variables
const viteVars = Object.keys(envVars).filter((key) => key.startsWith('VITE_'));
console.log('VITE_ prefixed variables available:', viteVars);

// Use environment variable for the backend URL with fallback to localhost for development
const MEDUSA_BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000';
console.log('MEDUSA_BACKEND_URL:', MEDUSA_BACKEND_URL);

// Get the publishable key from environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || '';
console.log('PUBLISHABLE_KEY available:', !!PUBLISHABLE_KEY);

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
