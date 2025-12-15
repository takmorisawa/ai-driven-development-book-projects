<script lang="ts">
  import { onMount } from 'svelte';
  import MapWidget from '$lib/components/MapWidget.svelte';
  import { travelPlanItems, removeFromTravelPlan } from '$lib/module/travelPlan';
  import { markers } from '$lib/module/map';
  import type { TravelPlanItem } from '$lib/type';

  let items: TravelPlanItem[] = [];

  onMount(() => {
    const unsubscribe = travelPlanItems.subscribe((value) => {
      items = value;
      updateMarkers();
    });
    return unsubscribe;
  });

  function updateMarkers() {
    const markerList = items.map((item) => ({
      id: item.id,
      type: item.type === 'region' ? 'product' : 'landmark',
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      data: item,
    }));
    markers.set(markerList);
  }

  function handleRemove(id: number, type: 'region' | 'landmark') {
    if (confirm('旅行プランから削除しますか？')) {
      removeFromTravelPlan(id, type);
    }
  }
</script>

<div class="space-y-4">
  <h1 class="text-3xl font-bold text-white mb-4">旅行プラン</h1>

  <div class="bg-gray-800 p-4 rounded-lg mb-4">
    <MapWidget />
  </div>

  {#if items.length === 0}
    <div class="bg-gray-800 p-4 rounded-lg">
      <p class="text-white">旅行プランに追加された項目はありません。</p>
    </div>
  {:else}
    <div class="bg-gray-800 p-4 rounded-lg">
      <h2 class="text-2xl font-bold text-white mb-4">旅行先候補</h2>
      <div class="space-y-2">
        {#each items as item}
          <div class="bg-gray-700 p-4 rounded flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-white">{item.name}</h3>
              <p class="text-gray-300 text-sm">
                {item.type === 'region' ? '地域' : '名所'} | 緯度: {item.latitude}, 経度: {item.longitude}
              </p>
            </div>
            <button
              class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              on:click={() => handleRemove(item.id, item.type)}
            >
              削除
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

