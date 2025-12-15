<script lang="ts">
  import { onMount } from 'svelte';
  import type { TerrainWithRegion } from '$lib/type';
  import { tripPlans, addToTripPlan, removeFromTripPlan } from '$lib/module/travelPlan';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';
  import TripPlanSelector from './TripPlanSelector.svelte';

  export let terrain: TerrainWithRegion;

  let showSelector = false;
  let plans: any[] = [];

  onMount(() => {
    const unsubscribe = tripPlans.subscribe((value) => {
      plans = value;
    });
    return unsubscribe;
  });

  $: isInAnyPlan = plans.some((plan) =>
    plan.items.some((item: any) => item.id === terrain.id && item.type === 'terrain')
  );

  function handleTravelPlanClick() {
    if (isInAnyPlan) {
      // すべてのプランから削除
      plans.forEach((plan) => {
        removeFromTripPlan(plan.id, terrain.id, 'terrain');
      });
    } else {
      showSelector = true;
    }
  }

  function handleSelectPlan(planId: string) {
    addToTripPlan(planId, terrain.id, 'terrain', terrain.name, terrain.latitude, terrain.longitude);
    showSelector = false;
  }

  function handleCancelSelector() {
    showSelector = false;
  }
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
  <button
    class="mt-2 px-4 py-2 bg-orange-400 text-white rounded hover:bg-orange-500 transition-colors font-semibold shadow-sm"
    on:click={handleTravelPlanClick}
  >
    {isInAnyPlan ? '旅行プランから削除' : '旅行プランに追加'}
  </button>
</div>

{#if showSelector}
  <TripPlanSelector onSelect={handleSelectPlan} onCancel={handleCancelSelector} />
{/if}

