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
    image?: string;
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
  let products = $state<Product[]>([]);
  let collections = $state<Collection[]>([]);
  let selectedCollection = $state<string>('');
  let isLoading = $state<boolean>(true);
  let error = $state<string | null>(null);
  let currentSlide = $state<number>(0);
  let email = $state<string>('');

  // Hero carousel data
  const heroSlides = [
    {
      title: 'Custom 3D Printing Services',
      subtitle: 'Bring your ideas to life with our high-quality 3D printing',
      image: '/carousel-custom.png',
      buttonText: 'Get a Quote',
      buttonVariant: 'primary'
    },
    {
      title: 'Wide Range of Materials',
      subtitle: 'From PLA to advanced engineering filaments',
      image: '/carousel-mats.png',
      buttonText: 'View Materials',
      buttonVariant: 'secondary'
    },
    {
      title: 'Fast Turnaround',
      subtitle: 'Get your custom prints in as little as 24 hours',
      image: '/carousel-fast.png',
      buttonText: 'Order Now',
      buttonVariant: 'accent'
    }
  ];

  // Categories data
  const categories = [
    { name: 'Electronics', icon: '📱', count: 12 },
    { name: 'Clothing', icon: '👕', count: 24 },
    { name: 'Home & Living', icon: '🏠', count: 18 },
    { name: 'Beauty', icon: '💄', count: 15 },
    { name: 'Sports', icon: '⚽', count: 20 },
    { name: 'Books', icon: '📚', count: 30 }
  ];

  // Auto-rotate hero carousel
  onMount(() => {
    loadProducts();

    const interval = setInterval(() => {
      currentSlide = (currentSlide + 1) % heroSlides.length;
    }, 5000);

    return () => clearInterval(interval);
  });

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

  function nextSlide() {
    currentSlide = (currentSlide + 1) % heroSlides.length;
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + heroSlides.length) % heroSlides.length;
  }

  const filteredProducts = $derived(
    selectedCollection
      ? products.filter(p => p.collection?.id === selectedCollection)
      : products
  );

  const featuredProducts = $derived(products.slice(0, 4));
  const trendingProducts = $derived(products.slice(0, 8));
  const saleProducts = $derived(products.slice(2, 6));
</script>

<svelte:head>
  <!-- Primary Meta Tags -->
  <title>Pasco 3D Printing - Custom 3D Printing Services</title>
  <meta name="title" content="Pasco 3D Printing - Custom 3D Printing Services" />
  <meta name="description" content="High-quality custom 3D printing services with fast turnaround. From prototypes to small batch production, we bring your ideas to life." />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://pasco3dprinting.com/" />
  <meta property="og:title" content="Pasco 3D Printing - Custom 3D Printing Services" />
  <meta property="og:description" content="High-quality custom 3D printing services with fast turnaround. From prototypes to small batch production, we bring your ideas to life." />
  <meta property="og:image" content="https://pasco3dprinting.com/og-image.jpg" />
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://pasco3dprinting.com/" />
  <meta property="twitter:title" content="Pasco 3D Printing - Custom 3D Printing Services" />
  <meta property="twitter:description" content="High-quality custom 3D printing services with fast turnaround. From prototypes to small batch production, we bring your ideas to life." />
  <meta property="twitter:image" content="https://pasco3dprinting.com/og-image.jpg" />
  
  <!-- Apple Mobile Web App Meta -->
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Pasco 3D Printing" />
  
  <!-- Theme Color -->
  <meta name="theme-color" content="#4f46e5" />
</svelte:head>

<main class="min-h-screen bg-base-100">
  <!-- Hero Carousel -->
  <div class="carousel w-full h-[60vh] md:h-[70vh] relative">
    {#each heroSlides as slide, i (i)}
      <div
        class="carousel-item w-full absolute inset-0 transition-opacity duration-1000 {i === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}"
      >
        <div class="absolute inset-0 bg-black/30 z-10"></div>
        <img
          src={slide.image}
          alt={slide.title}
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 flex items-center z-20">
          <div class="container mx-auto px-6 text-center md:text-left">
            <h1 class="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-2 md:mb-4">{slide.title}</h1>
            <p class="text-lg sm:text-xl md:text-2xl text-white mb-4 md:mb-8">{slide.subtitle}</p>
            <button class="btn btn-{slide.buttonVariant} btn-sm sm:btn-md md:btn-lg">
              {slide.buttonText}
            </button>
          </div>
        </div>
      </div>
    {/each}

    <!-- Carousel Controls -->
    <div class="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-4">
      {#each heroSlides as _, i (i)}
        <button
          class="w-3 h-3 rounded-full transition-all {currentSlide === i ? 'bg-white w-8' : 'bg-white/50'}"
          on:click={(e) => {
            e.preventDefault();
            currentSlide = i;
          }}
          aria-label={`Go to slide ${i + 1}`}
        ></button>
      {/each}
    </div>
  </div>

  <!-- Services Section -->
  <section class="py-16 bg-base-200">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold text-center mb-12">Our 3D Printing Services</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div class="card-body items-center text-center">
            <div class="text-5xl mb-4">🖨️</div>
            <h3 class="card-title">Rapid Prototyping</h3>
            <p class="text-gray-600">Quickly turn your ideas into physical prototypes with our fast turnaround times.</p>
          </div>
        </div>
        <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div class="card-body items-center text-center">
            <div class="text-5xl mb-4">🎨</div>
            <h3 class="card-title">Custom Designs</h3>
            <p class="text-gray-600">Need help with design? Our team can help bring your vision to life.</p>
          </div>
        </div>
        <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div class="card-body items-center text-center">
            <div class="text-5xl mb-4">🏭</div>
            <h3 class="card-title">Small Batch Production</h3>
            <p class="text-gray-600">Ideal for small businesses needing multiple copies of a part or product.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Featured Prints -->
  <section class="py-16 bg-gradient-to-b from-base-100 to-base-200">
    <div class="container mx-auto px-4">
      <div class="text-center mb-8">
        <h2 class="text-4xl font-bold mb-4">Popular 3D Prints</h2>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">Browse our collection of popular 3D printed items or upload your own design for a custom quote.</p>
      </div>
      
      <div class="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 px-2 sm:px-0">
        <div class="stats shadow bg-base-100">
          <div class="stat">
            <div class="stat-figure text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="stat-title">Available Products</div>
            <div class="stat-value text-primary">{products.length}</div>
            <div class="stat-desc">Ready to ship</div>
          </div>
        </div>
        
        <div class="join">
          <div class="join-item">
            <div class="label-text font-medium px-2">Filter by Collection</div>
          </div>
          <select
            class="select select-bordered join-item"
            bind:value={selectedCollection}
          >
            <option value="">All Collections</option>
            {#each collections as collection (collection.id)}
              <option value={collection.id}>{collection.title}</option>
            {/each}
          </select>
        </div>
      </div>

      {#if isLoading}
        <div class="flex justify-center py-12">
          <div class="flex flex-col items-center gap-4">
            <span class="loading loading-spinner loading-lg text-primary"></span>
            <span class="text-lg font-medium">Loading amazing products...</span>
          </div>
        </div>
      {:else if error}
        <div class="alert alert-error shadow-lg max-w-2xl mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
          <button class="btn btn-sm btn-ghost" on:click={loadProducts}>Try Again</button>
        </div>
      {:else}
        {#if filteredProducts.length === 0}
          <div class="alert shadow-lg max-w-2xl mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info shrink-0 w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h3 class="font-bold">No products found</h3>
              <div class="text-xs">Try selecting a different collection</div>
            </div>
            <button class="btn btn-sm btn-ghost" on:click={() => selectedCollection = ''}>Show All</button>
          </div>
        {:else}
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {#each filteredProducts as product (product.id)}
              <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] h-full touch-pan-y">
                <figure class="px-4 pt-4 relative">
                  {#if product.thumbnail}
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      class="rounded-xl h-48 w-full object-cover"
                      loading="lazy"
                    />
                  {:else}
                    <div class="bg-base-200 w-full h-48 rounded-xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-base-content opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  {/if}
                  {#if product.collection}
                    <div class="badge badge-secondary absolute top-2 right-2">{product.collection.title}</div>
                  {/if}
                </figure>
                <div class="card-body">
                  <h3 class="card-title">{product.title}</h3>
                  <p class="text-sm line-clamp-2">{product.description || 'No description available'}</p>
                  <div class="flex items-center justify-between mt-4">
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
                        <div class="flex items-baseline gap-2">
                          <span class="text-xl font-bold text-primary">
                            ${(rawPrice >= 100 ? rawPrice / 100 : rawPrice).toFixed(2)}
                          </span>
                          <span class="text-xs opacity-70">USD</span>
                        </div>
                      {:else}
                        <span class="text-gray-500">Price not available</span>
                      {/if}
                    {:else}
                      <span class="text-gray-500">Price not available</span>
                    {/if}
                  </div>
                  <div class="card-actions justify-between items-center mt-4 flex-wrap gap-y-2">
                    <div class="rating rating-sm">
                      <input type="radio" name="rating-{product.id}" class="mask mask-star-2 bg-orange-400" checked disabled />
                      <input type="radio" name="rating-{product.id}" class="mask mask-star-2 bg-orange-400" checked disabled />
                      <input type="radio" name="rating-{product.id}" class="mask mask-star-2 bg-orange-400" checked disabled />
                      <input type="radio" name="rating-{product.id}" class="mask mask-star-2 bg-orange-400" checked disabled />
                      <input type="radio" name="rating-{product.id}" class="mask mask-star-2 bg-orange-400" disabled />
                    </div>
                    <button class="btn btn-primary btn-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Add to Cart
                    </button>
                  </div>
                </div>
                <a href="/products/{product.id}" class="absolute inset-0" aria-label="View {product.title} details"></a>
              </div>
            {/each}
          </div>
        {/if}
      {/if}
  </section>

  <!-- Materials Section -->
  <section class="py-16 bg-base-200">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold text-center mb-12">Our Printing Materials</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body items-center text-center">
            <div class="text-4xl mb-4">🧵</div>
            <h3 class="card-title">PLA</h3>
            <p class="text-sm text-gray-600">Perfect for prototypes and decorative items. Eco-friendly and easy to print.</p>
          </div>
        </div>
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body items-center text-center">
            <div class="text-4xl mb-4">🔘</div>
            <h3 class="card-title">ABS</h3>
            <p class="text-sm text-gray-600">Durable and heat-resistant. Ideal for functional parts and mechanical components.</p>
          </div>
        </div>
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body items-center text-center">
            <div class="text-4xl mb-4">✨</div>
            <h3 class="card-title">PETG</h3>
            <p class="text-sm text-gray-600">Strong, flexible, and chemical resistant. Great for both indoor and outdoor use.</p>
          </div>
        </div>
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body items-center text-center">
            <div class="text-4xl mb-4">🔩</div>
            <h3 class="card-title">TPU</h3>
            <p class="text-sm text-gray-600">Flexible and durable. Perfect for phone cases, gaskets, and wearables.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Get a Quote Section -->
  <section class="py-16 bg-primary text-primary-content">
    <div class="container mx-auto px-4 text-center max-w-4xl">
      <h2 class="text-3xl font-bold mb-4">Need a Custom 3D Print?</h2>
      <p class="text-xl mb-8">Upload your design and get an instant quote. Our team is ready to bring your ideas to life!</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button class="btn btn-accent btn-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload Your Design
        </button>
        <button class="btn btn-outline btn-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Contact Us
        </button>
      </div>
    </div>
  </section>

  <!-- Testimonials -->
  <section class="py-16 bg-base-100">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
      <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
        {#each [
          {
            name: 'James Wilson',
            role: 'Product Designer',
            content: 'The print quality is exceptional. The team helped optimize my design and the final product was perfect. Highly recommend for any 3D printing needs!',
            rating: 5
          },
          {
            name: 'Emily Chen',
            role: 'Startup Founder',
            content: 'We use Pasco Printing for all our prototype needs. The attention to detail and quick turnaround times have been invaluable for our product development.',
            rating: 5
          },
          {
            name: 'Robert Taylor',
            role: 'Engineering Student',
            content: 'Great service for custom parts. The team was very helpful in material selection and the prints came out exactly as specified.',
            rating: 4
          }
        ] as testimonial}
          <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
            <div class="card-body">
              <div class="flex items-center mb-4">
                <div class="avatar placeholder">
                  <div class="bg-primary text-primary-content rounded-full w-12">
                    <span class="text-xl">{testimonial.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                </div>
                <div class="ml-4">
                  <h4 class="font-bold">{testimonial.name}</h4>
                  <p class="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
              <p class="mb-4 italic text-gray-700">"{testimonial.content}"</p>
              <div class="rating">
                {#each Array(5) as _, i}
                  <input type="radio" name="rating-{testimonial.name}" class="mask mask-star-2 bg-orange-400"
                    checked={i < testimonial.rating} disabled />
                {/each}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Call to Action -->
  <div class="bg-base-200 py-16">
    <div class="container mx-auto px-4 text-center">
      <h2 class="text-3xl font-bold mb-6">Ready to shop?</h2>
      <p class="text-xl mb-8">Join thousands of satisfied customers today</p>
      <div class="flex flex-wrap justify-center gap-4">
        <a href="/products" class="btn btn-primary btn-lg">Shop Now</a>
        <a href="/about" class="btn btn-outline btn-lg">Learn More</a>
      </div>
    </div>
  </div>

  <!-- Newsletter Section -->
  <div class="bg-base-300 py-16">
    <div class="container mx-auto px-4 text-center">
      <h2 class="text-3xl font-bold mb-4">Stay Updated</h2>
      <p class="text-lg mb-6 max-w-2xl mx-auto">Subscribe to our newsletter for the latest products and exclusive offers.</p>
      <div class="flex flex-col sm:flex-row gap-2 justify-center max-w-md mx-auto px-4 sm:px-0">
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