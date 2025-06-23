<script lang="ts">
  import { cart, lineItemCount, total, drawerOpen } from '$lib/stores/cartStore';
  import { removeItem, updateItem } from '$lib/api/cartService';
  import { onMount } from 'svelte';
  import { fly, fade, scale } from 'svelte/transition';

  let pendingDelete = $state<string | null>(null);
  let popX = $state(0);
  let popY = $state(0);
  let offsetY = $state(-100);
  let isUpdating = $state(false);

  function askDelete(e: MouseEvent, id: string) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = 220;
    const height = 90;
    const pad = 12;

    let x = e.clientX;
    let y = e.clientY;

    // horizontal clamp
    const halfW = width / 2;
    if (x < halfW + pad) x = halfW + pad;
    if (x > vw - halfW - pad) x = vw - halfW - pad;

    // decide above or below
    if (y < height + pad) {
      offsetY = 10; // below cursor
    } else if (y > vh - height - pad) {
      offsetY = -height; // shift upward
    } else {
      offsetY = -100; // default above (percentage)
    }

    popX = x;
    popY = y;
    pendingDelete = id;
  }
  
  async function confirmDelete() {
    if (pendingDelete) {
      isUpdating = true;
      try {
        await removeItem(pendingDelete);
      } catch (error) {
        console.error('Failed to remove item:', error);
      } finally {
        isUpdating = false;
        pendingDelete = null;
      }
    }
  }
  
  function cancelDelete() {
    pendingDelete = null;
  }

  async function updateQuantity(itemId: string, newQuantity: number) {
    if (newQuantity <= 0) return;
    
    isUpdating = true;
    try {
      await updateItem(itemId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      isUpdating = false;
    }
  }

  function format(amount: number) {
    if (amount === null || amount === undefined) return '$--';
    const major = amount >= 100 ? amount / 100 : amount;
    return `$${major.toFixed(2)}`;
  }

  function closeDrawer() {
    drawerOpen.set(false);
  }

  // Close drawer on escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeDrawer();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if $drawerOpen}
  <div 
    role="button" 
    tabindex="0" 
    aria-label="Close cart overlay" 
    class="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" 
    transition:fade={{ duration: 200 }}
    onclick={closeDrawer}
    onkeydown={(e) => e.key === 'Enter' && closeDrawer()}
  ></div>
  
  <aside
    class="fixed right-0 top-0 bottom-0 w-96 md:w-[28rem] bg-gradient-to-br from-base-100 to-base-200 shadow-2xl z-50 flex flex-col border-l border-base-300"
    transition:fly|local={{ x: 400, duration: 300 }}
  >
    <!-- Header -->
    <header class="p-6 bg-gradient-to-r from-primary to-primary-focus text-primary-content flex justify-between items-center shadow-lg">
      <div class="flex items-center gap-3">
        <div class="text-2xl">🛒</div>
        <div>
          <h2 class="text-xl font-bold">Shopping Cart</h2>
          <p class="text-sm opacity-90">{$lineItemCount} {$lineItemCount === 1 ? 'item' : 'items'}</p>
        </div>
      </div>
      <button 
        class="btn btn-ghost btn-sm text-primary-content hover:bg-white/20" 
        onclick={closeDrawer}
        aria-label="Close cart"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </header>

    <!-- Cart Items -->
    <section class="flex-1 overflow-y-auto p-4 space-y-4">
      {#if $cart?.items?.length}
        {#each $cart.items as item, index (item.id)}
          <div 
            class="bg-base-100 rounded-xl p-4 shadow-md border border-base-300 hover:shadow-lg transition-all duration-200"
            transition:scale={{ duration: 200, delay: index * 50 }}
          >
            <div class="flex gap-4 items-start">
              <!-- Product Image -->
              <div class="w-16 h-16 rounded-lg overflow-hidden bg-base-200 flex-shrink-0">
                {#if item.thumbnail}
                  <img src={item.thumbnail} alt={item.title} class="w-full h-full object-cover" />
                {:else}
                  <div class="w-full h-full flex items-center justify-center text-base-content/50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                {/if}
              </div>
              
              <!-- Product Details -->
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-base-content line-clamp-2 mb-1">{item.title}</h3>
                <p class="text-sm text-base-content/60 mb-2">{format(item.unit_price)} each</p>
                
                <!-- Quantity Controls -->
                <div class="flex items-center gap-2">
                  <button 
                    class="btn btn-xs btn-circle btn-outline" 
                    onclick={() => updateQuantity(item.id, item.quantity - 1)} 
                    disabled={item.quantity === 1 || isUpdating}
                    aria-label="Decrease quantity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                    </svg>
                  </button>
                  
                  <span class="px-3 py-1 bg-base-200 rounded-full text-sm font-medium min-w-[2.5rem] text-center">
                    {item.quantity}
                  </span>
                  
                  <button 
                    class="btn btn-xs btn-circle btn-outline" 
                    onclick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={isUpdating}
                    aria-label="Increase quantity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <!-- Price and Remove -->
              <div class="text-right flex flex-col items-end gap-2">
                <div class="font-bold text-primary">{format(item.unit_price * item.quantity)}</div>
                <button 
                  class="btn btn-ghost btn-xs text-error hover:bg-error/10" 
                  onclick={(e) => askDelete(e, item.id)}
                  disabled={isUpdating}
                  aria-label="Remove item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        {/each}
      {:else}
        <div class="text-center py-16">
          <div class="text-6xl mb-4">🛒</div>
          <h3 class="text-xl font-semibold text-base-content mb-2">Your cart is empty</h3>
          <p class="text-base-content/60 mb-6">Add some amazing 3D prints to get started!</p>
          <button class="btn btn-primary" onclick={closeDrawer}>
            Continue Shopping
          </button>
        </div>
      {/if}
    </section>

    <!-- Footer -->
    {#if $cart?.items?.length}
      <footer class="p-6 border-t border-base-300 bg-base-100">
        <div class="space-y-4">
          <!-- Subtotal -->
          <div class="flex justify-between text-base-content/80">
            <span>Subtotal</span>
            <span>{format($total)}</span>
          </div>
          
          <!-- Total -->
          <div class="flex justify-between text-lg font-bold text-base-content border-t border-base-300 pt-4">
            <span>Total</span>
            <span class="text-primary">{format($total)}</span>
          </div>
          
          <!-- Checkout Button -->
          <button 
            class="btn btn-primary btn-lg w-full shadow-lg hover:shadow-xl transition-all duration-200" 
            disabled={$lineItemCount === 0 || isUpdating}
          >
            {#if isUpdating}
              <span class="loading loading-spinner loading-sm"></span>
              Updating...
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Proceed to Checkout
            {/if}
          </button>
          
          <p class="text-xs text-center text-base-content/50">
            Secure checkout powered by Medusa
          </p>
        </div>
      </footer>
    {/if}
  </aside>

  <!-- Delete Confirmation Popup -->
  {#if pendingDelete}
    <div 
      class="fixed z-[60] pointer-events-none" 
      style="top:{popY}px; left:{popX}px; transform: translate(-50%, {offsetY}px);"
      transition:scale={{ duration: 150 }}
    >
      <div class="bg-base-100 shadow-2xl rounded-2xl p-4 border border-base-300 pointer-events-auto">
        <div class="flex items-center gap-3">
          <div class="text-warning text-xl">⚠️</div>
          <span class="font-medium">Remove this item?</span>
        </div>
        <div class="flex gap-2 mt-3 justify-end">
          <button 
            class="btn btn-sm btn-ghost" 
            onclick={cancelDelete}
          >
            Cancel
          </button>
          <button 
            class="btn btn-sm btn-error text-white" 
            onclick={confirmDelete}
            disabled={isUpdating}
          >
            {#if isUpdating}
              <span class="loading loading-spinner loading-xs"></span>
            {:else}
              Remove
            {/if}
          </button>
        </div>
      </div>
    </div>
  {/if}
{/if}

<style>
  .line-clamp-2 {
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    display: -webkit-box;
    overflow: hidden;
  }
</style>
