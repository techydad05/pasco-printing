// @ts-check

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
let MEDUSA_BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL || 'http://192.168.4.138:9000';

// Handle SSL protocol issues by ensuring we use the right protocol
if (typeof window !== 'undefined') {
	// If we're in the browser
	const isLocalIP = MEDUSA_BACKEND_URL.includes('192.168.') || 
		MEDUSA_BACKEND_URL.includes('localhost') || 
		MEDUSA_BACKEND_URL.includes('127.0.0.1');
	
	// For local development, ensure we use HTTP
	if (isLocalIP && MEDUSA_BACKEND_URL.startsWith('https://')) {
		MEDUSA_BACKEND_URL = MEDUSA_BACKEND_URL.replace('https://', 'http://');
		console.log('Switched to HTTP for local development');
	}
	
	// For production (non-local IPs), ensure we use HTTPS if the page is served over HTTPS
	if (!isLocalIP && window.location.protocol === 'https:' && MEDUSA_BACKEND_URL.startsWith('http://')) {
		MEDUSA_BACKEND_URL = MEDUSA_BACKEND_URL.replace('http://', 'https://');
		console.log('Switched to HTTPS for production');
	}
}

console.log('MEDUSA_BACKEND_URL (final):', MEDUSA_BACKEND_URL);

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
