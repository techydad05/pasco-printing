<script>
  import { onMount } from 'svelte';
  import { fetchProducts, fetchProductById } from '$lib/api/medusa';

  let products = $state([]);
  let selectedProduct = $state(null);
  let isLoading = $state(true);
  let error = $state(null);

  onMount(async () => {
    await loadProducts();
  });

  async function loadProducts() {
    try {
      isLoading = true;
      error = null;
      products = await fetchProducts();
      console.log('Products loaded:', products.length);
    } catch (err) {
      console.error('Failed to load products:', err);
      error = 'Failed to load products. Please try again later.';
    } finally {
      isLoading = false;
    }
  }

  async function loadProductDetails(productId) {
    try {
      isLoading = true;
      error = null;
      selectedProduct = await fetchProductById(productId);
      
      if (selectedProduct) {
        console.log('Product details loaded successfully');
        // This will trigger the price logging in the fetchProductById function
      } else {
        error = 'Product not found';
      }
    } catch (err) {
      console.error('Failed to load product details:', err);
      error = 'Failed to load product details. Please try again later.';
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Medusa API Test</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-6">Medusa API Test Page</h1>
  
  <div class="mb-6">
    <button class="btn btn-primary" onclick={loadProducts}>
      {isLoading ? 'Loading...' : 'Reload Products'}
    </button>
  </div>

  {#if error}
    <div class="alert alert-error mb-6">
      <p>{error}</p>
    </div>
  {/if}

  <div class="grid grid-cols-1 gap-4">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Products List</h2>
        
        {#if isLoading && !products.length}
          <div class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        {:else if products.length}
          <div class="overflow-x-auto">
            <table class="table w-full">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {#each products as product}
                  <tr>
                    <td>{product.id}</td>
                    <td>{product.title}</td>
                    <td>
                      <button 
                        class="btn btn-sm btn-primary"
                        onclick={() => loadProductDetails(product.id)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <p>No products found.</p>
        {/if}
      </div>
    </div>

    {#if selectedProduct}
      <div class="card bg-base-100 shadow-xl mt-6">
        <div class="card-body">
          <h2 class="card-title">{selectedProduct.title}</h2>
          <p>{selectedProduct.description || 'No description available'}</p>
          
          <h3 class="text-lg font-bold mt-4">Variants and Prices:</h3>
          {#if selectedProduct.variants && selectedProduct.variants.length}
            <div class="overflow-x-auto">
              <table class="table w-full">
                <thead>
                  <tr>
                    <th>Variant ID</th>
                    <th>Prices</th>
                  </tr>
                </thead>
                <tbody>
                  {#each selectedProduct.variants as variant}
                    <tr>
                      <td>{variant.id}</td>
                      <td>
                        {#if variant.prices && variant.prices.length}
                          <ul>
                            {#each variant.prices as price}
                              <li>
                                {(price.amount / 100).toFixed(2)} {price.currency_code}
                              </li>
                            {/each}
                          </ul>
                        {:else}
                          No prices available
                        {/if}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <p>No variants available</p>
          {/if}
          
          <div class="mt-4">
            <p class="text-sm opacity-70">
              Check the browser console for detailed price logging
            </p>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
