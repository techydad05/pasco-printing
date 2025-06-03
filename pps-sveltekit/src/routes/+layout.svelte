<script>
	import '../app.css';

	let { children } = $props();
</script>

<header class="bg-base-100 shadow-sm sticky top-0 z-50">
  <div class="container mx-auto px-4">
    <div class="navbar">
      <div class="flex-1">
        <a href="/" class="flex items-center gap-2">
          <img src="/favicon.png" alt="Pasco 3D Printing" class="h-10 w-auto" />
          <span class="text-xl font-bold">Pasco 3D Printing</span>
        </a>
      </div>
      <div class="flex-none">
        <ul class="menu menu-horizontal px-1 gap-2">
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
