<script lang="ts">
  import { onMount } from 'svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import { fetchProducts, fetchCollections } from '$lib/api/medusa';
  
  interface Price {
    amount: number;
    currency_code: string;
  }
  
  interface Variant {
    id: string;
    prices: Price[];
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
  
  let products = $state<Product[]>([]);
  let collections = $state<Collection[]>([]);
  let selectedCollection = $state<string>('');
  let isLoading = $state<boolean>(true);
  let error = $state<string | null>(null);

  async function loadProducts() {
    try {
      isLoading = true;
      products = await fetchProducts();
      collections = await fetchCollections();
      error = null;
    } catch (err) {
      console.error('Failed to load products:', err);
      error = 'Failed to load products. Please try again later.';
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    loadProducts();
  });

  const filteredProducts = $derived(
    selectedCollection 
      ? products.filter(p => p.collection?.id === selectedCollection)
      : products
  );
</script>

<main class="min-h-screen bg-base-200">
  <!-- Hero Section -->
  <div class="hero min-h-[50vh] bg-primary text-primary-content">
    <div class="hero-content text-center">
      <div class="max-w-2xl">
        <h1 class="text-5xl font-bold mb-6">Welcome to Our Store</h1>
        <p class="text-xl mb-8">Discover amazing products at great prices</p>
        <div class="flex gap-4 justify-center">
          <button class="btn btn-secondary">Shop Now</button>
          <button class="btn btn-outline btn-primary">Learn More</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Products Section -->
  <div class="container mx-auto px-4 py-12">
    <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
      <h2 class="text-3xl font-bold">Featured Products</h2>
      
      <div class="form-control w-full max-w-xs">
        <label for="collection-filter" class="label">
          <span class="label-text">Filter by Collection</span>
        </label>
        <select 
          id="collection-filter"
          class="select select-bordered w-full"
          bind:value={selectedCollection}
          aria-label="Filter by collection"
        >
          <option value="">All Collections</option>
          {#each collections as collection (collection.id)}
            <option value={collection.id}>{collection.title}</option>
          {/each}
        </select>
      </div>
    </div>

    {#if error}
      <div class="alert alert-error shadow-lg">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    {:else if isLoading}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {#each Array(4) as _}
          <div class="card w-80 bg-base-100 shadow-xl">
            <div class="h-48 bg-gray-200 rounded-t-xl animate-pulse"></div>
            <div class="card-body">
              <div class="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div class="mt-4 flex justify-between items-center">
                <div class="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div class="h-10 bg-gray-200 rounded-full w-24 animate-pulse"></div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else if filteredProducts.length === 0}
      <div class="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-xl font-medium text-gray-700">No products found</h3>
        <p class="text-gray-500 mt-2">Try selecting a different collection or check back later.</p>
        <button class="btn btn-primary mt-4" onclick={() => selectedCollection = ''}>Clear filters</button>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {#each filteredProducts as product}
          <ProductCard {product} />
        {/each}
      </div>
    {/if}
  </div>

  <!-- Newsletter Section -->
  <div class="bg-base-300 py-16">
    <div class="container mx-auto px-4 text-center">
      <h2 class="text-3xl font-bold mb-4">Stay Updated</h2>
      <p class="text-lg mb-6 max-w-2xl mx-auto">Subscribe to our newsletter for the latest products and exclusive offers.</p>
      <div class="flex flex-col sm:flex-row gap-2 justify-center max-w-md mx-auto">
        <input 
          type="email" 
          placeholder="Enter your email" 
          class="input input-bordered w-full"
        />
        <button class="btn btn-primary">Subscribe</button>
      </div>
    </div>
  </div>
</main>