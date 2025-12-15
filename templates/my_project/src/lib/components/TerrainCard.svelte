<script lang="ts">
  import type { TerrainWithRegion } from '$lib/type';
  import { goto } from '$app/navigation';

  export let terrain: TerrainWithRegion;
</script>

<div class="bg-gray-800 p-4 rounded-lg">
  {#if terrain.image}
    <img src={terrain.image} alt={terrain.name} class="w-full h-48 object-cover rounded mb-2" />
  {:else}
    <div class="w-full h-48 bg-gray-700 rounded mb-2 flex items-center justify-center text-gray-500">
      画像なし
    </div>
  {/if}
  <h3 class="text-xl font-bold text-white mb-2">{terrain.name}</h3>
  <p class="text-gray-300 text-sm mb-2">
    <a href="/regions/{terrain.regionId}" class="hover:underline">{terrain.region.name}</a>
  </p>
  {#if terrain.description}
    <p class="text-gray-400 text-xs mb-2">{terrain.description}</p>
  {/if}
</div>

