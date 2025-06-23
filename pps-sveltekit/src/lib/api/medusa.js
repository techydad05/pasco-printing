import { cacheProducts, cacheProduct, getCachedProduct } from '$lib/stores/productStore';
import Medusa from '@medusajs/medusa-js';

// Environment configuration
const MEDUSA_BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL || 'http://192.168.4.138:9000';
const PUBLISHABLE_KEY = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || '';
const REGION_ID = 'reg_01JY9JGHDM5K7N01GSW2ES3JFT';

// Initialize Medusa client
let medusaClient = null;

/**
 * Initialize the Medusa client
 */
async function initMedusaClient() {
	if (!medusaClient) {
		try {
			medusaClient = new Medusa({
				baseUrl: MEDUSA_BACKEND_URL,
				maxRetries: 3
			});

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
 * Fetches products from the Medusa API with region ID
 * @returns {Promise<any[]>}
 */
export async function fetchProducts() {
  console.log('Fetching products from Medusa...');
  console.log('Using backend URL:', MEDUSA_BACKEND_URL);
  console.log('Using publishable key:', PUBLISHABLE_KEY);
  
  try {
    // Initialize the Medusa client before using it
    const client = await initMedusaClient();

    // Use the correct API call format for the medusa-js client with region ID
    // Keep the API call simple to avoid 400 Bad Request errors

    const response = await client.products.list({
      region_id: REGION_ID
    });
    console.log('Medusa response:', response);

    const { products } = response;

    // Cache products as-is (no price modification)
    if (products && products.length > 0) {
      cacheProducts(products);
      console.log('Products cached***', getCachedProduct(products[0].id));
    }

    return products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
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
