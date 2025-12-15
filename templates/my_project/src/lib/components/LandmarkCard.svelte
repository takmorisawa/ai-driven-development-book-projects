<script lang="ts">
  import type { LandmarkWithRegion } from '$lib/type';
  import { addToTravelPlan, removeFromTravelPlan, travelPlanItems } from '$lib/module/travelPlan';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';

  export let landmark: LandmarkWithRegion;

  $: isInTravelPlan = get(travelPlanItems).some(
    (item) => item.id === landmark.id && item.type === 'landmark'
  );

  function handleTravelPlanClick() {
    if (isInTravelPlan) {
      removeFromTravelPlan(landmark.id, 'landmark');
    } else {
      addToTravelPlan(landmark.id, 'landmark', landmark.name, landmark.latitude, landmark.longitude);
    }
  }
</script>

<div class="bg-gray-800 p-4 rounded-lg">
  {#if landmark.image}
    <img src={landmark.image} alt={landmark.name} class="w-full h-48 object-cover rounded mb-2" />
  {:else}
    <div class="w-full h-48 bg-gray-700 rounded mb-2 flex items-center justify-center text-gray-500">
      画像なし
    </div>
  {/if}
  <h3 class="text-xl font-bold text-white mb-2">{landmark.name}</h3>
  <p class="text-gray-300 text-sm mb-2">
    <a href="/regions/{landmark.regionId}" class="hover:underline">{landmark.region.name}</a>
  </p>
  {#if landmark.description}
    <p class="text-gray-400 text-xs mb-2">{landmark.description}</p>
  {/if}
  <button
    class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    on:click={handleTravelPlanClick}
  >
    {isInTravelPlan ? '旅行プランから削除' : '旅行プランに追加'}
  </button>
</div>

