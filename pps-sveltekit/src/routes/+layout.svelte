<script lang="ts">
  import '../app.css';
  import CartDrawer from '$lib/components/CartDrawer.svelte';
  import { drawerOpen, lineItemCount } from '$lib/stores/cartStore';
  import { getCachedProduct } from '$lib/stores/productStore';


  let { children } = $props();
</script>

<header class="bg-base-100 shadow-sm sticky top-0 z-50">
  <div class="container mx-auto px-4">
    <div class="navbar">
      <div class="flex-1">
        <a href="/" class="flex items-center gap-2">
          <img src="/favicon.png" alt="Pasco 3D Printing" class="h-10 w-auto" />
          <span class="text-xl font-bold hidden sm:inline">Pasco 3D Printing</span>
        </a>
      </div>
      <div class="flex-none">
        <!-- Cart Button -->
        <button 
          class="btn btn-ghost btn-circle mr-2 relative"
          onclick={() => drawerOpen.set(true)}
          aria-label="Open cart"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.68 4.32a1 1 0 00.95 1.32h9.46a1 1 0 00.95-1.32L15 13H7z" />
          </svg>
          {#if $lineItemCount > 0}
            <span class="absolute -top-2 -right-2 bg-primary text-primary-content text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {$lineItemCount}
            </span>
          {/if}
        </button>

        <!-- Mobile Menu -->
        <div class="dropdown dropdown-end lg:hidden">
          <button class="btn btn-ghost btn-circle" aria-label="Open menu">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
          <ul class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li><a href="/products">3D Prints</a></li>
            <li><a href="/custom">Custom Orders</a></li>
            <li><a href="/materials">Materials</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact" class="text-primary font-medium">Get a Quote</a></li>
          </ul>
        </div>
        <ul class="menu menu-horizontal px-1 gap-2 hidden lg:flex">
          <li><a href="/products" class="hover:bg-primary/10">3D Prints</a></li>
          <li><a href="/custom" class="hover:bg-primary/10">Custom Orders</a></li>
          <li><a href="/materials" class="hover:bg-primary/10">Materials</a></li>
          <li><a href="/about" class="hover:bg-primary/10">About Us</a></li>
          <li><a href="/contact" class="btn btn-primary">Get a Quote</a></li>
        </ul>
      </div>
    </div>
  </div>
</header>

{@render children()}

<CartDrawer />
