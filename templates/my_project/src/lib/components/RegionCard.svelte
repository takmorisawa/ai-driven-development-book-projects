<script lang="ts">
  import type { RegionWithRelations } from '$lib/type';
  import { goto } from '$app/navigation';

  export let region: RegionWithRelations;
</script>

<div class="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700" on:click={() => goto(`/regions/${region.id}`)}>
  <h3 class="text-xl font-bold text-white mb-2">{region.name}</h3>
  <p class="text-gray-300 text-sm mb-2">都道府県コード: {region.prefectureCode}</p>
  <p class="text-gray-400 text-xs">
    名産品: {region.products.length}件 | 名所: {region.landmarks.length}件 | 地形: {region.terrains.length}件
  </p>
</div>

