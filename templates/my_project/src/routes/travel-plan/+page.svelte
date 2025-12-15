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
  <h1 class="text-3xl font-bold text-orange-600 mb-4">旅行プラン - まなび旅マップ</h1>

  <div class="bg-white p-4 rounded-lg mb-4 shadow-md border-2 border-orange-200">
    <MapWidget />
  </div>

  {#if items.length === 0}
    <div class="bg-white p-4 rounded-lg shadow-md border-2 border-orange-200">
      <p class="text-gray-600 text-center py-4">旅行プランに追加された項目はありません。</p>
    </div>
  {:else}
    <div class="bg-white p-4 rounded-lg shadow-md border-2 border-orange-200">
      <h2 class="text-2xl font-bold text-orange-600 mb-4">旅行先候補</h2>
      <div class="space-y-2">
        {#each items as item}
          <div class="bg-orange-50 p-4 rounded flex items-center justify-between border-2 border-orange-200 hover:border-orange-400 transition-colors">
            <div>
              <h3 class="text-lg font-bold text-orange-600">{item.name}</h3>
              <p class="text-gray-600 text-sm">
                {item.type === 'region' ? '地域' : '名所'} | 緯度: {item.latitude}, 経度: {item.longitude}
              </p>
            </div>
            <button
              class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-semibold shadow-sm"
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

