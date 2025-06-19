<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchProductById } from '$lib/api/medusa';
  import { page } from '$app/stores';

  // Define types based on the Product type from your API
  interface Price {
    amount: number;
    currency_code: string;
  }

  interface MoneyAmount {
    amount: number;
    currency_code: string;
  }

  interface Variant {
    id: string;
    prices?: Price[];
    original_price?: number;
    calculated_price?: number;
    calculated_price_set?: {
      amount?: {
        calculated_amount?: number;
        original_amount?: number;
        currency_code?: string;
      }
    };
  }

  interface Collection {
    id: string;
    title: string;
  }

  interface Product {
    id: string;
    title: string;
    description: string | null;
    thumbnail: string | null;
    collection: Collection | null;
    variants: Variant[];
  }

  // State
  let product = $state<Product | null>(null);
  let isLoading = $state<boolean>(true);
  let error = $state<string | null>(null);
  let selectedImage = $state<number>(0);
  let quantity = $state<number>(1);

  // Get product ID from route parameter
  const productId = $derived($page.params.id);

  onMount(async () => {
    await loadProduct();
  });

  async function loadProduct() {
    try {
      isLoading = true;
      error = null;
      product = await fetchProductById(productId);
      
      // Add detailed logging for testing
      if (product) {
        console.log('Product data:', JSON.stringify(product, null, 2));
        
        if (product.variants && product.variants.length > 0) {
          console.log('First variant:', JSON.stringify(product.variants[0], null, 2));
          
          // Log price information specifically
          if (product.variants[0].calculated_price_set) {
            console.log('Price structure (calculated_price_set):', 
              JSON.stringify(product.variants[0].calculated_price_set, null, 2));
          }
          
          if (product.variants[0].prices) {
            console.log('Price structure (prices array):', 
              JSON.stringify(product.variants[0].prices, null, 2));
          }
        }
      }
      
      if (!product) {
        error = 'Product not found';
        return;
      }
      
      // Product loaded successfully
    } catch (err) {
      console.error('Failed to load product:', err);
      error = 'Failed to load product. Please try again later.';
    } finally {
      isLoading = false;
    }
  }

  function incrementQuantity() {
    quantity++;
  }

  function decrementQuantity() {
    if (quantity > 1) {
      quantity--;
    }
  }

  // Function to calculate price (not using $derived)
  function calculatePrice(prod: Product | null) {
    if (!prod) return null;
    if (!prod.variants || prod.variants.length === 0) return null;

    const variant = prod.variants[0];

    // Try different price structures based on Medusa API response
    
    // 1. Check calculated_price_set structure (based on the actual API response)
    if (variant.calculated_price_set?.amount) {
      // Safely access nested properties
      const calculatedAmount = variant.calculated_price_set.amount.calculated_amount;
      const originalAmount = variant.calculated_price_set.amount.original_amount;
      
      if (calculatedAmount !== undefined) {
        return (calculatedAmount / 100).toFixed(2);
      } else if (originalAmount !== undefined) {
        return (originalAmount / 100).toFixed(2);
      }
    }
    
    // 2. Check prices array as fallback
    if (variant.prices && variant.prices.length > 0 && variant.prices[0]?.amount !== undefined) {
      return (variant.prices[0].amount / 100).toFixed(2);
    }

    // 3. Check calculated_price (used in some Medusa responses)
    if (typeof variant.calculated_price === 'number') {
      return (variant.calculated_price / 100).toFixed(2);
    }

    // 4. Check original_price (used in some Medusa responses)
    if (typeof variant.original_price === 'number') {
      return (variant.original_price / 100).toFixed(2);
    }

    // No price available
    return null;
  }

  const productImages = $derived([
    product?.thumbnail,
    // Example of additional images - in production, these would come from the product object
    // You may need to adjust based on your actual API response structure
    product?.thumbnail,
    product?.thumbnail
  ].filter(Boolean));
</script>

<svelte:head>
  <title>{product?.title || 'Product'} | Pasco 3D Printing</title>
  <meta name="description" content={product?.description || 'View product details'} />
</svelte:head>

<main class="min-h-screen bg-base-100">
  <div class="container mx-auto px-4 py-8 md:py-12">
    <!-- Breadcrumbs -->
    <div class="text-sm breadcrumbs mb-6">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/products">Products</a></li>
        <li>{product?.title || 'Product'}</li>
      </ul>
    </div>

    {#if isLoading}
      <div class="container mx-auto px-4 py-8">
        <div class="flex justify-center items-center py-16">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    {:else if error}
      <div class="container mx-auto px-4 py-8">
        <div class="flex justify-center items-center py-16">
          <div class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-error mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 class="text-xl font-bold mb-2">Error</h2>
            <p class="mb-4">{error}</p>
            <button class="btn btn-sm btn-ghost" onclick={loadProduct}>Try Again</button>
          </div>
        </div>
      </div>
    {:else if product}
      <!-- Product Section -->
      <div class="bg-base-100 rounded-box shadow-lg p-6 mb-12">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Product Images -->
          <div class="space-y-6">
            <!-- Main Image -->
            <div class="aspect-square rounded-xl overflow-hidden bg-base-200 border border-base-300">
              {#if productImages[selectedImage]}
                <img
                  src={productImages[selectedImage]}
                  alt={product.title}
                  class="w-full h-full object-cover"
                />
              {:else}
                <div class="w-full h-full flex items-center justify-center bg-base-300">
                  <span>No Image Available</span>
                </div>
              {/if}
            </div>

            <!-- Thumbnail Gallery - Centered -->
            <div class="flex justify-center gap-4 overflow-x-auto py-2">
              {#each productImages as image, i}
                <button
                  class="w-20 h-20 rounded-md overflow-hidden border {selectedImage === i ? 'border-primary ring-2 ring-primary' : 'border-base-300'}"
                  onclick={() => selectedImage = i}
                >
                  <img src={image} alt={`${product.title} view ${i+1}`} class="w-full h-full object-cover" />
                </button>
              {/each}
            </div>
          </div>

          <!-- Product Info -->
          <div class="space-y-6">
            <!-- Collection Badge (if available) -->
            {#if product.collection}
              <div class="badge badge-primary mb-2">{product.collection.title}</div>
            {/if}

            <!-- Product Title & Description -->
            <div>
              <h1 class="text-3xl font-bold mb-4 text-base-content">{product.title}</h1>
              <p class="text-base-content/80 text-lg">{product.description || 'No description available.'}</p>
            </div>

            <!-- Price -->
            <div class="my-6">
              {#if product && product.variants && product.variants.length > 0}
                {#if product.variants[0].calculated_price_set?.amount}
                  <!-- Use calculated_price_set structure -->
                  <div class="flex items-baseline gap-2">
                    {#if product.variants[0].calculated_price_set.amount.calculated_amount !== undefined}
                      <span class="text-3xl font-bold text-primary">
                        ${(product.variants[0].calculated_price_set.amount.calculated_amount / 100).toFixed(2)}
                      </span>
                      <span class="text-sm opacity-70">
                        {(product.variants[0].calculated_price_set.amount.currency_code || 'USD').toUpperCase()}
                      </span>
                    {:else if product.variants[0].calculated_price_set.amount.original_amount !== undefined}
                      <span class="text-3xl font-bold text-primary">
                        ${(product.variants[0].calculated_price_set.amount.original_amount / 100).toFixed(2)}
                      </span>
                      <span class="text-sm opacity-70">
                        {(product.variants[0].calculated_price_set.amount.currency_code || 'USD').toUpperCase()}
                      </span>
                    {:else}
                      <span class="text-3xl font-bold text-primary">Price not available</span>
                    {/if}
                  </div>
                {:else if product.variants[0].prices && product.variants[0].prices.length > 0 && product.variants[0].prices[0]?.amount !== undefined}
                  <!-- Fallback to prices array -->
                  <div class="flex items-baseline gap-2">
                    <span class="text-3xl font-bold text-primary">
                      ${(product.variants[0].prices[0].amount / 100).toFixed(2)}
                    </span>
                    <span class="text-sm opacity-70">
                      {(product.variants[0].prices[0].currency_code || 'USD').toUpperCase()}
                    </span>
                  </div>
                {:else}
                  <span class="text-3xl font-bold text-primary">Price not available</span>
                {/if}
              {:else}
                <span class="text-3xl font-bold text-primary">Price not available</span>
              {/if}
            </div>

            <!-- Divider -->
            <div class="divider"></div>

            <!-- Quantity Selector -->
            <div>
              <label for="product-quantity" class="block text-base font-medium mb-3 text-base-content">Quantity</label>
              <div class="flex items-center">
                <button
                  class="btn btn-square"
                  onclick={decrementQuantity}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span id="product-quantity" class="mx-6 text-xl w-8 text-center font-medium" role="spinbutton" aria-valuenow={quantity} aria-valuemin="1" aria-valuetext="{quantity} items">{quantity}</span>
                <button
                  class="btn btn-square"
                  onclick={incrementQuantity}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <!-- Add to Cart Button -->
            <button class="btn btn-primary btn-lg w-full my-4">Add to Cart</button>

            <!-- Product Details -->
            <div class="mt-8">
              <details class="collapse collapse-arrow bg-base-200 mb-2 rounded-lg">
                <summary class="collapse-title text-lg font-medium text-base-content">Product Details</summary>
                <div class="collapse-content text-base-content/80">
                  <p>{product.description || 'No description available.'}</p>
                </div>
              </details>

              <!-- Shipping Info -->
              <details class="collapse collapse-arrow bg-base-200 mb-2 rounded-lg">
                <summary class="collapse-title text-lg font-medium text-base-content">Shipping Information</summary>
                <div class="collapse-content text-base-content/80">
                  <p>Standard shipping takes 3-7 business days. Express shipping options are available at checkout.</p>
                </div>
              </details>

              <!-- Returns Policy -->
              <details class="collapse collapse-arrow bg-base-200 mb-2 rounded-lg">
                <summary class="collapse-title text-lg font-medium text-base-content">Returns Policy</summary>
                <div class="collapse-content text-base-content/80">
                  <p>We accept returns within 30 days of purchase. Item must be unused and in original packaging.</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products Section -->
      <div class="mt-16 mb-12">
        <h2 class="text-3xl font-bold mb-8 text-center">You might also like</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <!-- Related Product Placeholders (4) -->
          {#each Array(4) as _, i}
            <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] h-full">
              <figure class="px-4 pt-4">
                <div class="aspect-square w-full bg-base-200 rounded-xl"></div>
              </figure>
              <div class="card-body">
                <div class="h-6 bg-base-200 rounded w-3/4 mb-2"></div>
                <div class="h-4 bg-base-200 rounded w-1/4 mb-4"></div>
                <div class="h-4 bg-base-200 rounded w-full mb-2"></div>
                <div class="h-4 bg-base-200 rounded w-2/3"></div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</main>
