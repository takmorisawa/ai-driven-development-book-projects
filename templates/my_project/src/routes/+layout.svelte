<script>
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
</script>

<div class="bg-orange-50 min-h-screen">
  <Header />
  <main class="container mx-auto p-4">
    <slot />
  </main>
</div>
