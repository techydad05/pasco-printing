// @ts-check

// Use environment variable for the backend URL with fallback to localhost for development
const MEDUSA_BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL || 'http://192.168.4.138:9000';

// Get the publishable key from environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || '';

/**
 * @typedef {import('@medusajs/medusa-js').default} MedusaClient
 */

// Initialize Medusa client with proper configuration
// Using dynamic import to ensure it works in both development and production
/** @type {MedusaClient|null} */
let medusaClient = null;

/**
 * Function to initialize the Medusa client
 * @returns {Promise<MedusaClient>} The initialized Medusa client
 */
async function initMedusaClient() {
	if (!medusaClient) {
		try {
			// Dynamically import the Medusa client
			const Medusa = (await import('@medusajs/medusa-js')).default;
			
			// Create a new client instance
			medusaClient = new Medusa({
				baseUrl: MEDUSA_BACKEND_URL,
				maxRetries: 3
			});
			
			// If we have a publishable key, set it on the client
			if (PUBLISHABLE_KEY) {
				medusaClient.setPublishableKey(PUBLISHABLE_KEY);
			}
		} catch (error) {
			console.error('Failed to initialize Medusa client:', error);
			throw error;
		}
	}
	return medusaClient;
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
 * Helper function to extract price information from a product
 * @param {any} product - The product to check for prices
 * @returns {{hasPrices: boolean, priceInfo: {amount: number, currency: string} | null}}
 */
export function checkProductPrices(product) {
	if (!product) return { hasPrices: false, priceInfo: null };
	
	// Check if product has variants
	if (product.variants && product.variants.length > 0) {
		for (const variant of product.variants) {
			// Check for calculated_price_set structure (based on the actual API response)
			if (variant.calculated_price_set) {
				const priceSet = variant.calculated_price_set;
				if (priceSet.amount) {
					// Extract the calculated_amount or original_amount
					const amount = priceSet.amount.calculated_amount || priceSet.amount.original_amount;
					if (amount !== undefined) {
						return {
							hasPrices: true,
							priceInfo: {
								amount: amount,
								currency: priceSet.amount.currency_code || 'USD'
							}
						};
					}
				}
			}
			
			// Fallback to prices array if available
			if (variant.prices && variant.prices.length > 0) {
				return { 
					hasPrices: true, 
					priceInfo: {
						amount: variant.prices[0].amount,
						currency: variant.prices[0].currency_code
					}
				};
			}
			
			// Check for direct price properties as last resort
			if (variant.price || variant.calculated_price) {
				const amount = variant.price || variant.calculated_price;
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
		// Initialize the Medusa client before using it
		const client = await initMedusaClient();
		
		// Use the correct API call format for the medusa-js client with region ID
		const { products } = await client.products.list({
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

/**
 * Fetches collections from the Medusa API
 * @returns {Promise<any[]>}
 */
export async function fetchCollections() {
	try {
		// Initialize the Medusa client before using it
		const client = await initMedusaClient();
		
		const { collections } = await client.collections.list();
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
		// Initialize the Medusa client before using it
		const client = await initMedusaClient();
		
		const { product } = await client.products.retrieve(id);
		return product || null;
	} catch (error) {
		console.error(`Error fetching product ${id}:`, error);
		return null;
	}
}
