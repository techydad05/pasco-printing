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
          <span class="text-xl font-bold hidden sm:inline">Pasco 3D Printing</span>
        </a>
      </div>
      <div class="flex-none">
        <div class="dropdown dropdown-end lg:hidden">
          <label tabindex="0" class="btn btn-ghost btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </label>
          <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
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
