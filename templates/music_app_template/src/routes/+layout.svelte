<script>
  import '../app.css';
	import Header from '../lib/components/Header.svelte';
	import Player from '../lib/components/Player.svelte';
</script>
<Header />
<slot />
<Player />