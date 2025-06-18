<script>
  export let product;
</script>

<a href="/products/{product.id}" class="card w-80 bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
  <figure class="px-4 pt-4">
    {#if product.thumbnail}
      <img 
        src={product.thumbnail} 
        alt={product.title} 
        class="rounded-xl h-48 w-full object-cover"
      />
    {:else}
      <div class="bg-gray-200 w-full h-48 rounded-xl flex items-center justify-center">
        <span class="text-gray-400">No image</span>
      </div>
    {/if}
  </figure>
  <div class="card-body p-6">
    <h2 class="card-title">
      {product.title}
      {#if product.collection}
        <div class="badge badge-secondary">{product.collection.title}</div>
      {/if}
    </h2>
    <p class="line-clamp-2 text-gray-600">
      {product.description || 'No description available'}
    </p>
    <div class="card-actions justify-between items-center mt-4">
      <div class="text-xl font-bold">
        {#if product.variants?.length > 0}
          {#if product.variants[0].calculated_price_set?.amount}
            <!-- Use calculated_price_set structure -->
            ${((product.variants[0].calculated_price_set.amount.calculated_amount || 
               product.variants[0].calculated_price_set.amount.original_amount) / 100).toFixed(2)}
          {:else if product.variants[0]?.prices?.length > 0}
            <!-- Fallback to prices array -->
            ${(product.variants[0].prices[0].amount / 100).toFixed(2)}
          {:else if typeof product.variants[0].calculated_price === 'number'}
            <!-- Fallback to calculated_price -->
            ${(product.variants[0].calculated_price / 100).toFixed(2)}
          {:else if typeof product.variants[0].original_price === 'number'}
            <!-- Fallback to original_price -->
            ${(product.variants[0].original_price / 100).toFixed(2)}
          {:else}
            Price not available
          {/if}
        {:else}
          Price not available
        {/if}
      </div>
      <button class="btn btn-primary">
        Add to cart
      </button>
    </div>
  </div>
</a>
