<script lang="ts">
  import { onMount } from 'svelte';
  import type { LandmarkWithRegion } from '$lib/type';
  import { tripPlans, addToTripPlan, removeFromTripPlan } from '$lib/module/travelPlan';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';
  import TripPlanSelector from './TripPlanSelector.svelte';

  export let landmark: LandmarkWithRegion;

  let showSelector = false;
  let plans: any[] = [];

  onMount(() => {
    const unsubscribe = tripPlans.subscribe((value) => {
      plans = value;
    });
    return unsubscribe;
  });

  $: isInAnyPlan = plans.some((plan) =>
    plan.items.some((item: any) => item.id === landmark.id && item.type === 'landmark')
  );

  function handleTravelPlanClick() {
    if (isInAnyPlan) {
      // すべてのプランから削除
      plans.forEach((plan) => {
        removeFromTripPlan(plan.id, landmark.id, 'landmark');
      });
    } else {
      showSelector = true;
    }
  }

  function handleSelectPlan(planId: string) {
    addToTripPlan(planId, landmark.id, 'landmark', landmark.name, landmark.latitude, landmark.longitude);
    showSelector = false;
  }

  function handleCancelSelector() {
    showSelector = false;
  }
</script>

<div class="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-orange-100">
  {#if landmark.image}
    <img src={landmark.image} alt={landmark.name} class="w-full h-48 object-cover rounded mb-2" />
  {:else}
    <div class="w-full h-48 bg-orange-100 rounded mb-2 flex items-center justify-center text-orange-400">
      画像なし
    </div>
  {/if}
  <h3 class="text-xl font-bold text-orange-600 mb-2">{landmark.name}</h3>
  {#if landmark.region}
    <p class="text-gray-600 text-sm mb-2">
      <a href="/regions/{landmark.regionId}" class="hover:text-orange-500 hover:underline transition-colors">{landmark.region.name}</a>
    </p>
  {:else}
    <p class="text-gray-600 text-sm mb-2">
      <a href="/regions/{landmark.regionId}" class="hover:text-orange-500 hover:underline transition-colors">地域ID: {landmark.regionId}</a>
    </p>
  {/if}
  {#if landmark.description}
    <p class="text-gray-600 text-xs mb-2">{landmark.description}</p>
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

