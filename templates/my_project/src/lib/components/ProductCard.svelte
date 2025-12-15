<script lang="ts">
  import type { ProductWithRegion } from '$lib/type';
  import { addToTravelPlan, removeFromTravelPlan, travelPlanItems } from '$lib/module/travelPlan';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';

  export let product: ProductWithRegion;

  $: isInTravelPlan = get(travelPlanItems).some(
    (item) => item.id === product.regionId && item.type === 'region'
  );

  function handleTravelPlanClick() {
    if (isInTravelPlan) {
      removeFromTravelPlan(product.regionId, 'region');
    } else {
      addToTravelPlan(
        product.regionId,
        'region',
        product.region.name,
        product.region.latitude,
        product.region.longitude
      );
    }
  }
</script>

<div class="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-orange-100">
  {#if product.image}
    <img src={product.image} alt={product.name} class="w-full h-48 object-cover rounded mb-2" />
  {:else}
    <div class="w-full h-48 bg-orange-100 rounded mb-2 flex items-center justify-center text-orange-400">
      画像なし
    </div>
  {/if}
  <h3 class="text-xl font-bold text-orange-600 mb-2">{product.name}</h3>
  <p class="text-gray-600 text-sm mb-2">
    <a href="/regions/{product.regionId}" class="hover:text-orange-500 hover:underline transition-colors">{product.region.name}</a>
  </p>
  {#if product.ranking}
    <p class="text-yellow-500 text-sm mb-2 font-semibold">⭐ 生産量ランキング: {product.ranking}位</p>
  {/if}
  {#if product.productionAmount}
    <p class="text-gray-500 text-xs mb-2">生産量: {product.productionAmount}</p>
  {/if}
  {#if product.description}
    <p class="text-gray-600 text-xs mb-2">{product.description}</p>
  {/if}
  <button
    class="mt-2 px-4 py-2 bg-orange-400 text-white rounded hover:bg-orange-500 transition-colors font-semibold shadow-sm"
    on:click={handleTravelPlanClick}
  >
    {isInTravelPlan ? '旅行プランから削除' : '旅行プランに追加'}
  </button>
</div>

