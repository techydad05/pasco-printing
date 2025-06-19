// @ts-check
import { fetchProductById, logProductPrices } from './medusa.js';

// Sample product ID - we'll use a placeholder that will be replaced with a real ID
// This should be a valid product ID from your Medusa store
const TEST_PRODUCT_ID = 'prod_01HPYG1JXCMF0BPNR5ZYNVQJK3';

async function testMedusaAPI() {
  console.log('Testing Medusa API integration...');
  console.log(`Fetching product with ID: ${TEST_PRODUCT_ID}`);
  
  try {
    const product = await fetchProductById(TEST_PRODUCT_ID);
    
    if (product) {
      console.log('Product fetched successfully!');
      console.log('Product details:', {
        id: product.id,
        title: product.title,
        description: product.description?.substring(0, 50) + '...',
        variantCount: product.variants?.length || 0
      });
      
      // Log product prices
      console.log('\nLogging product prices:');
      logProductPrices(product);
    } else {
      console.error('Product not found or API error occurred');
    }
  } catch (error) {
    console.error('Error testing Medusa API:', error);
  }
}

// Run the test
testMedusaAPI();

// Export the test function for use in other modules if needed
export { testMedusaAPI };
