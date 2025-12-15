<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import MapWidget from '$lib/components/MapWidget.svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import LandmarkCard from '$lib/components/LandmarkCard.svelte';
  import TerrainCard from '$lib/components/TerrainCard.svelte';
  import { markers } from '$lib/module/map';
  import type { RegionWithRelations, ProductWithRegion, LandmarkWithRegion, TerrainWithRegion } from '$lib/type';

  export let data: { region: RegionWithRelations };

  let region: RegionWithRelations = data.region;
  let products: ProductWithRegion[] = region.products || [];
  let landmarks: LandmarkWithRegion[] = region.landmarks || [];
  let terrains: TerrainWithRegion[] = region.terrains || [];

  $: if (data.region) {
    region = data.region;
    products = region.products || [];
    landmarks = region.landmarks || [];
    terrains = region.terrains || [];
    updateMarkers();
  }

  onMount(() => {
    updateMarkers();
  });

  function updateMarkers() {
    const markerList: any[] = [];

    products.forEach((product) => {
      if (product.latitude && product.longitude) {
        markerList.push({
          id: product.id,
          type: 'product',
          name: product.name,
          latitude: product.latitude,
          longitude: product.longitude,
          data: product,
        });
      }
    });

    landmarks.forEach((landmark) => {
      markerList.push({
        id: landmark.id,
        type: 'landmark',
        name: landmark.name,
        latitude: landmark.latitude,
        longitude: landmark.longitude,
        data: landmark,
      });
    });

    terrains.forEach((terrain) => {
      markerList.push({
        id: terrain.id,
        type: 'terrain',
        name: terrain.name,
        latitude: terrain.latitude,
        longitude: terrain.longitude,
        data: terrain,
      });
    });

    markers.set(markerList);
  }

  $: topProducts = products.filter((p) => p.ranking && p.ranking <= 3).sort((a, b) => (a.ranking || 0) - (b.ranking || 0));
</script>

{#if region}
  <div class="space-y-4">
    <h1 class="text-3xl font-bold text-orange-600 mb-4">{region.name}</h1>

    <div class="bg-white p-4 rounded-lg shadow-md border-2 border-orange-200">
      <h2 class="text-xl font-bold text-orange-600 mb-2">地域情報</h2>
      <p class="text-gray-600">都道府県コード: {region.prefectureCode}</p>
      {#if region.description}
        <p class="text-gray-600 mt-2">{region.description}</p>
      {/if}
    </div>

    <div class="bg-white p-4 rounded-lg shadow-md border-2 border-orange-200">
      <MapWidget />
    </div>

    {#if topProducts.length > 0}
      <div class="bg-white p-4 rounded-lg shadow-md border-2 border-orange-200">
        <h2 class="text-2xl font-bold text-orange-600 mb-4">⭐ 生産量ベスト3</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          {#each topProducts as product}
            <ProductCard {product} />
          {/each}
        </div>
      </div>
    {/if}

    {#if products.length > 0}
      <h2 class="text-2xl font-bold text-orange-600 mt-8 mb-4">名産品一覧</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each products as product}
          <ProductCard {product} />
        {/each}
      </div>
    {/if}

    {#if landmarks.length > 0}
      <h2 class="text-2xl font-bold text-orange-600 mt-8 mb-4">名所一覧</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each landmarks as landmark}
          <LandmarkCard {landmark} />
        {/each}
      </div>
    {/if}

    {#if terrains.length > 0}
      <h2 class="text-2xl font-bold text-orange-600 mt-8 mb-4">地形一覧</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each terrains as terrain}
          <TerrainCard {terrain} />
        {/each}
      </div>
    {/if}

    {#if products.length === 0 && landmarks.length === 0 && terrains.length === 0}
      <div class="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 text-center">
        <p class="text-orange-600">この地域にはまだ情報が登録されていません。</p>
      </div>
    {/if}
  </div>
{/if}

