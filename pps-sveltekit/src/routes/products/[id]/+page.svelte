<script lang="ts">
  import { addItem } from '$lib/api/cartService';
  import { drawerOpen } from '$lib/stores/cartStore';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { getProduct } from '$lib/stores/productStore';
  import { fetchProducts } from '$lib/api/medusa';
  import { scale, fly, fade } from 'svelte/transition';
  import VariantSelector from '$lib/components/VariantSelector.svelte';

  // State
  let product = $state<Product | null>(null);
  let isLoading = $state<boolean>(true);
  let error = $state<string | null>(null);
  let selectedImage = $state<number>(0);
  let quantity = $state<number>(1);
  let isAddingToCart = $state<boolean>(false);
  let showAddedFeedback = $state<boolean>(false);
  let selectedVariant = $state<any>(null);
  
  // Price value - manually updated to avoid infinite loop
  let priceValue = $state(null);
  
  // Function to update price without reactivity
  function updatePrice() {
    if (!product) {
      priceValue = null;
      return;
    }
    
    if (selectedVariant) {
      priceValue = calculatePrice(selectedVariant);
    } else if (product?.variants?.[0]) {
      priceValue = calculatePrice(product.variants[0]);
    } else {
      priceValue = null;
    }
  }

  // Get product ID from route parameter
  const productId = $derived($page.params.id);
  console.log('Product ID:', productId);

  onMount(async () => {
    await loadProduct();
  });

  async function loadProduct() {
    try {
      isLoading = true;
      error = null;
      
      // Try to get product from cache/localStorage first
      product = await getProduct(productId);
      console.log('Product loaded from cache:', product);

      if (!product) {
        // If not in cache, try to fetch all products to populate cache
        console.log('Product not in cache, fetching all products...');
        await fetchProducts();
        
        // Try again after fetching products
        product = await getProduct(productId);
        
        if (!product) {
          error = 'Product not found';
          return;
        }
      }

      // Product loaded successfully
      updatePrice();
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

  async function handleAddToCart() {
    if (!product?.variants?.length) return;
    
    isAddingToCart = true;
    try {
      await addItem(product.variants[0].id, quantity);
      showAddedFeedback = true;
      
      // Show feedback for 2 seconds, then open cart
      setTimeout(() => {
        showAddedFeedback = false;
        drawerOpen.set(true);
      }, 1500);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      isAddingToCart = false;
    }
  }

  // Function to calculate price (not using $derived)
  function formatPrice(amount: number) {
    return (amount >= 100 ? amount / 100 : amount).toFixed(2);
  }

  function calculatePrice(variant: any) {
    if (!variant) {
      return null;
    }
    
    try {
      // Use price array first – prefer current currency (USD) if available
      if (Array.isArray(variant.prices) && variant.prices.length) {
        const currency = 'usd'; // TODO: derive dynamically from region
        const priceObj = variant.prices.find(p => p.currency_code?.toLowerCase() === currency) ?? variant.prices[0];
        if (priceObj && typeof priceObj.amount === 'number') {
          return formatPrice(priceObj.amount);
        }
      }

      // Direct access to calculated_price - handle both object and number formats
      const calculatedPrice = variant.calculated_price;
      
      if (calculatedPrice) {
        // Handle calculated_price as an object
        if (typeof calculatedPrice === 'object') {
          // Try calculated_amount first
          if (calculatedPrice.calculated_amount !== undefined) {
            return formatPrice(calculatedPrice.calculated_amount);
          }

          // Try original_amount as fallback
          if (calculatedPrice.original_amount !== undefined) {
            return formatPrice(calculatedPrice.original_amount);
          }
        }

        // Handle calculated_price as a number (legacy)
        if (typeof calculatedPrice === 'number') {
          return formatPrice(calculatedPrice);
        }
      }

      // Check original_price
      if (typeof variant.original_price === 'number') {
        return formatPrice(variant.original_price);
      }

      return null;
    } catch (error) {
      console.error('Error calculating price:', error);
      return null;
    }
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
      <div class="bg-gradient-to-br from-base-100 to-base-200 rounded-3xl shadow-2xl p-8 mb-12 border border-base-300" transition:fade={{ duration: 300 }}>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Product Images -->
          <div class="space-y-6">
            <!-- Main Image -->
            <div class="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-base-200 to-base-300 border-2 border-base-300 shadow-lg group">
              {#if productImages[selectedImage]}
                <img
                  src={productImages[selectedImage]}
                  alt={product.title}
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  transition:fade={{ duration: 200 }}
                />
                <!-- Image overlay with zoom icon -->
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              {:else}
                <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-base-300 to-base-400">
                  <div class="text-center text-base-content/50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-lg font-medium">No Image Available</span>
                  </div>
                </div>
              {/if}
            </div>

            <!-- Thumbnail Gallery -->
            <div class="flex justify-center gap-3 overflow-x-auto py-2">
              {#each productImages as image, i}
                <button
                  class="w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105 {selectedImage === i ? 'border-primary ring-4 ring-primary/30 shadow-lg' : 'border-base-300 hover:border-primary/50'}"
                  onclick={() => selectedImage = i}
                  transition:scale={{ duration: 200, delay: i * 50 }}
                >
                  <img src={image} alt={`${product.title} view ${i+1}`} class="w-full h-full object-cover" />
                </button>
              {/each}
            </div>
          </div>

          <!-- Product Info -->
          <div class="space-y-8">
            <!-- Collection Badge -->
            {#if product.collection}
              <div class="inline-flex">
                <div class="badge badge-primary badge-lg px-4 py-2 text-sm font-semibold shadow-lg" transition:fly={{ x: -20, duration: 300 }}>
                  {product.collection.title}
                </div>
              </div>
            {/if}

            <!-- Product Title & Description -->
            <div transition:fly={{ y: 20, duration: 300, delay: 100 }}>
              <h1 class="text-4xl lg:text-5xl font-bold mb-6 text-base-content bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {product.title}
              </h1>
              <p class="text-base-content/80 text-lg leading-relaxed">
                {product.description || 'Experience premium 3D printing quality with this amazing product.'}
              </p>
            </div>

            {#if product?.options?.length > 0}
              <VariantSelector
                options={product.options}
                variants={product.variants}
                bind:selectedVariant
                on:change={() => updatePrice()}
              />
            {/if}

            <!-- Price Section -->
            <div class="my-8" transition:fly={{ y: 20, duration: 300, delay: 200 }}>
              
              {#if priceValue !== null}
                <div class="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20">
                  <div class="flex items-baseline gap-3">
                    <span class="text-4xl lg:text-5xl font-bold text-primary">
                      ${priceValue}
                    </span>
                    <span class="text-lg font-medium text-base-content/70 bg-base-200 px-3 py-1 rounded-full">
                      {#if selectedVariant?.prices?.[0]?.currency_code}
                        {selectedVariant.prices[0].currency_code.toUpperCase()}
                      {:else if product?.variants?.[0]?.prices?.[0]?.currency_code}
                        {product.variants[0].prices[0].currency_code.toUpperCase()}
                      {:else}
                        USD
                      {/if}
                    </span>
                  </div>
                  <p class="text-sm text-base-content/60 mt-2">Free shipping on orders over $50</p>
                </div>
              {:else}
                <div class="bg-warning/10 border border-warning/30 rounded-2xl p-6">
                  <span class="text-2xl font-bold text-warning">Price not available</span>
                  <p class="text-sm text-base-content/60 mt-2">Contact us for pricing information</p>
                </div>
              {/if}
            </div>

            <!-- Quantity Selector -->
            <div transition:fly={{ y: 20, duration: 300, delay: 300 }}>
              <label for="product-quantity" class="block text-lg font-semibold mb-4 text-base-content">Quantity</label>
              <div class="flex items-center gap-4">
                <button
                  class="btn btn-circle btn-outline btn-lg hover:btn-primary transition-all duration-200"
                  onclick={decrementQuantity}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </button>
                
                <div class="bg-base-200 rounded-2xl px-6 py-3 border-2 border-base-300">
                  <span id="product-quantity" class="text-2xl font-bold text-center min-w-[3rem] inline-block" role="spinbutton" aria-valuenow={quantity} aria-valuemin="1" aria-valuetext="{quantity} items">
                    {quantity}
                  </span>
                </div>
                
                <button
                  class="btn btn-circle btn-outline btn-lg hover:btn-primary transition-all duration-200"
                  onclick={incrementQuantity}
                  aria-label="Increase quantity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Add to Cart Button -->
            <div transition:fly={{ y: 20, duration: 300, delay: 400 }}>
              <button
                class={`btn btn-primary btn-lg w-full h-16 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 ${isAddingToCart ? 'loading' : ''} ${showAddedFeedback ? 'btn-success' : ''}`}
                onclick={handleAddToCart}
                disabled={isAddingToCart}
              >
                {#if isAddingToCart}
                  <span class="loading loading-spinner loading-md"></span>
                  Adding to cart...
                {:else if showAddedFeedback}
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Added to cart!
                {:else}
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.68 4.32a1 1 0 00.95 1.32h9.46a1 1 0 00.95-1.32L15 13H7z" />
                  </svg>
                  Add to Cart
                {/if}
              </button>
              
              <!-- Quick Actions -->
              <div class="flex gap-3 mt-4">
                <button class="btn btn-outline flex-1 hover:btn-secondary transition-all duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Wishlist
                </button>
                <button class="btn btn-outline flex-1 hover:btn-accent transition-all duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share
                </button>
              </div>
            </div>

            <!-- Product Features -->
            <div class="grid grid-cols-2 gap-4 mt-8" transition:fly={{ y: 20, duration: 300, delay: 500 }}>
              <div class="bg-base-200 rounded-xl p-4 text-center hover:bg-base-300 transition-colors duration-200">
                <div class="text-2xl mb-2">🚚</div>
                <div class="font-semibold text-sm">Free Shipping</div>
                <div class="text-xs text-base-content/60">On orders $50+</div>
              </div>
              <div class="bg-base-200 rounded-xl p-4 text-center hover:bg-base-300 transition-colors duration-200">
                <div class="text-2xl mb-2">⚡</div>
                <div class="font-semibold text-sm">Fast Production</div>
                <div class="text-xs text-base-content/60">2-3 business days</div>
              </div>
              <div class="bg-base-200 rounded-xl p-4 text-center hover:bg-base-300 transition-colors duration-200">
                <div class="text-2xl mb-2">🎯</div>
                <div class="font-semibold text-sm">Precision Quality</div>
                <div class="text-xs text-base-content/60">0.1mm accuracy</div>
              </div>
              <div class="bg-base-200 rounded-xl p-4 text-center hover:bg-base-300 transition-colors duration-200">
                <div class="text-2xl mb-2">♻️</div>
                <div class="font-semibold text-sm">Eco Materials</div>
                <div class="text-xs text-base-content/60">Sustainable PLA</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Details Section -->
      <div class="bg-gradient-to-br from-base-100 to-base-200 rounded-3xl shadow-xl p-8 mb-12 border border-base-300" transition:fade={{ duration: 300, delay: 200 }}>
        <h2 class="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Product Details</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Specifications -->
          <div class="bg-base-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Specifications
            </h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-base-content/70">Material:</span>
                <span class="font-semibold">PLA+</span>
              </div>
              <div class="flex justify-between">
                <span class="text-base-content/70">Layer Height:</span>
                <span class="font-semibold">0.2mm</span>
              </div>
              <div class="flex justify-between">
                <span class="text-base-content/70">Infill:</span>
                <span class="font-semibold">20%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-base-content/70">Print Time:</span>
                <span class="font-semibold">2-4 hours</span>
              </div>
            </div>
          </div>

          <!-- Shipping -->
          <div class="bg-base-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
              </svg>
              Shipping
            </h3>
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm">Free shipping on orders $50+</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span class="text-sm">Standard: 3-7 business days</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span class="text-sm">Express: 1-2 business days</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span class="text-sm">Tracking included</span>
              </div>
            </div>
          </div>

          <!-- Returns -->
          <div class="bg-base-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Returns
            </h3>
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm">30-day return policy</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span class="text-sm">Free return shipping</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span class="text-sm">Full refund guarantee</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span class="text-sm">Easy return process</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products Section -->
      <div class="mb-12" transition:fade={{ duration: 300, delay: 400 }}>
        <h2 class="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">You might also like</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {#each Array(4) as _, i}
            <div class="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-base-300" transition:scale={{ duration: 200, delay: i * 100 }}>
              <figure class="px-4 pt-4">
                <div class="aspect-square w-full bg-gradient-to-br from-base-300 to-base-400 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </figure>
              <div class="card-body">
                <div class="h-6 bg-gradient-to-r from-base-300 to-base-400 rounded-lg w-3/4 mb-2 animate-pulse"></div>
                <div class="h-4 bg-gradient-to-r from-primary/30 to-secondary/30 rounded w-1/4 mb-4 animate-pulse"></div>
                <div class="h-4 bg-base-300 rounded w-full mb-2 animate-pulse"></div>
                <div class="h-4 bg-base-300 rounded w-2/3 animate-pulse"></div>
                <div class="card-actions justify-end mt-4">
                  <button class="btn btn-primary btn-sm">View Product</button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</main>
