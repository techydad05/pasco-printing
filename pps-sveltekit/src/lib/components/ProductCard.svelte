<script lang="ts">
  import { addItem } from '$lib/api/cartService';
  import { drawerOpen } from '$lib/stores/cartStore';
  export let product: any;

  function handleAddToCart(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    const variantId = product?.variants?.[0]?.id;
    if (variantId) {
      addItem(variantId, 1);
      drawerOpen.set(true);
    }
  }
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
          {@const v = product.variants[0]}
          {@const rawPrice =
            v.prices?.[0]?.amount ??
            (typeof v.calculated_price === 'number'
              ? v.calculated_price
              : (typeof v.calculated_price === 'object' && v.calculated_price?.calculated_amount)
                  ? v.calculated_price.calculated_amount
                  : v.original_price)}
          {#if typeof rawPrice === 'number'}
            ${(rawPrice >= 100 ? rawPrice / 100 : rawPrice).toFixed(2)}
          {:else}
            Price not available
          {/if}
        {:else}
          Price not available
        {/if}
      </div>
      <button class="btn btn-primary" on:click={handleAddToCart}>
        Add to cart
      </button>
    </div>
  </div>
</a>
