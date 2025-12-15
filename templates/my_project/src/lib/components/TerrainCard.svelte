<script lang="ts">
  import type { TerrainWithRegion } from '$lib/type';
  import { goto } from '$app/navigation';

  export let terrain: TerrainWithRegion;
</script>

<div class="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-orange-100">
  {#if terrain.image}
    <img src={terrain.image} alt={terrain.name} class="w-full h-48 object-cover rounded mb-2" />
  {:else}
    <div class="w-full h-48 bg-orange-100 rounded mb-2 flex items-center justify-center text-orange-400">
      画像なし
    </div>
  {/if}
  <h3 class="text-xl font-bold text-orange-600 mb-2">{terrain.name}</h3>
  {#if terrain.region}
    <p class="text-gray-600 text-sm mb-2">
      <a href="/regions/{terrain.regionId}" class="hover:text-orange-500 hover:underline transition-colors">{terrain.region.name}</a>
    </p>
  {:else}
    <p class="text-gray-600 text-sm mb-2">
      <a href="/regions/{terrain.regionId}" class="hover:text-orange-500 hover:underline transition-colors">地域ID: {terrain.regionId}</a>
    </p>
  {/if}
  {#if terrain.description}
    <p class="text-gray-600 text-xs mb-2">{terrain.description}</p>
  {/if}
</div>

