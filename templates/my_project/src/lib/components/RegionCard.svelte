<script lang="ts">
  import type { RegionWithRelations } from '$lib/type';
  import { goto } from '$app/navigation';

  export let region: RegionWithRelations;
</script>

<div class="bg-white p-4 rounded-lg cursor-pointer hover:shadow-lg transition-shadow border-2 border-orange-200 hover:border-orange-400" on:click={() => goto(`/regions/${region.id}`)}>
  <h3 class="text-xl font-bold text-orange-600 mb-2">{region.name}</h3>
  <p class="text-gray-500 text-xs">
    名産品: {region.products.length}件 | 名所: {region.landmarks.length}件 | 地形: {region.terrains.length}件
  </p>
</div>

