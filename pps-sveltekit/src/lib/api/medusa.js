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

/**
 * @typedef {Object} Price
 * @property {number} amount
 * @property {string} currency_code
 */

/**
 * @typedef {Object} Variant
 * @property {string} [id]
 * @property {Price[]} [prices]
 * @property {number} [price]
 * @property {number} [calculated_price]
 */

/**
 * @typedef {Object} Product
 * @property {string} [id]
 * @property {string} [title]
 * @property {Variant[]} [variants]
 */

/**
 * Helper function to check for prices in a product
 * @param {any} product - The product to check for prices
 * @returns {{hasPrices: boolean, priceInfo: {amount: number, currency: string} | null}}
 */
export function checkProductPrices(product) {
	if (!product) return { hasPrices: false, priceInfo: null };
	
	// Check if product has variants with prices
	if (product.variants && product.variants.length > 0) {
		for (const variant of product.variants) {
			// Check for prices array
			if (variant.prices && variant.prices.length > 0) {
				return { 
					hasPrices: true, 
					priceInfo: {
						amount: variant.prices[0].amount,
						currency: variant.prices[0].currency_code
					}
				};
			}
			
			// Check for direct price properties
			if (variant.price || variant.calculated_price) {
				const amount = variant.price || variant.calculated_price;
				// Only proceed if amount is not undefined
				if (amount !== undefined) {
					return { 
						hasPrices: true, 
						priceInfo: {
							amount: amount,
							currency: 'USD' // Default if not specified
						}
					};
				}
			}
		}
	}
	
	return { hasPrices: false, priceInfo: null };
}

/**
 * Fetches products from the Medusa API with region ID
 * @returns {Promise<any[]>}
 */
export async function fetchProducts() {
	try {
		// Use the correct API call format for the medusa-js client with region ID
		const { products } = await medusaClient.products.list({
			region_id: 'reg_01JXZM573HHVG3EKVVZCTNSE38'
		});
		
		// Check the first product for prices
		if (products && products.length > 0) {
			// Use type assertion to avoid TypeScript errors
			const priceCheck = checkProductPrices(/** @type {Product} */ (products[0]));
			console.log('First product has prices:', priceCheck.hasPrices);
			if (priceCheck.priceInfo) {
				console.log('Price info:', priceCheck.priceInfo.amount / 100, priceCheck.priceInfo.currency);
			}
		}
		
		return products || [];
	} catch (error) {
		console.error('Error fetching products:', error);
		return [];
	}
}

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
