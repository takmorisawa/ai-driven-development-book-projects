<script lang="ts">
  import { onMount } from 'svelte';
  import MapWidget from '$lib/components/MapWidget.svelte';
  import RegionCard from '$lib/components/RegionCard.svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import LandmarkCard from '$lib/components/LandmarkCard.svelte';
  import TerrainCard from '$lib/components/TerrainCard.svelte';
  import { markers, currentFilter } from '$lib/module/map';
  import type { RegionWithRelations, ProductWithRegion, LandmarkWithRegion, TerrainWithRegion } from '$lib/type';

  let regions: RegionWithRelations[] = [];
  let products: ProductWithRegion[] = [];
  let landmarks: LandmarkWithRegion[] = [];
  let terrains: TerrainWithRegion[] = [];
  let showProducts = true;
  let showLandmarks = true;
  let showTerrains = true;

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    const [regionsRes, productsRes, landmarksRes, terrainsRes] = await Promise.all([
      fetch('/api/regions'),
      fetch('/api/products'),
      fetch('/api/landmarks'),
      fetch('/api/terrains'),
    ]);

    regions = await regionsRes.json();
    products = await productsRes.json();
    landmarks = await landmarksRes.json();
    terrains = await terrainsRes.json();

    updateMarkers();
  }

  function updateMarkers() {
    const markerList: any[] = [];

    if (showProducts) {
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
    }

    if (showLandmarks) {
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
    }

    if (showTerrains) {
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
    }

    markers.set(markerList);
  }

  function handleFilterChange() {
    currentFilter.set({
      showProducts,
      showLandmarks,
      showTerrains,
    });
    updateMarkers();
  }
</script>

<div class="space-y-4">
  <h1 class="text-3xl font-bold text-white mb-4">日本地図 - 地域情報</h1>

  <div class="bg-gray-800 p-4 rounded-lg mb-4">
    <h2 class="text-xl font-bold text-white mb-2">フィルター</h2>
    <div class="flex gap-4">
      <label class="flex items-center text-white">
        <input type="checkbox" bind:checked={showProducts} on:change={handleFilterChange} class="mr-2" />
        名産品
      </label>
      <label class="flex items-center text-white">
        <input type="checkbox" bind:checked={showLandmarks} on:change={handleFilterChange} class="mr-2" />
        名所
      </label>
      <label class="flex items-center text-white">
        <input type="checkbox" bind:checked={showTerrains} on:change={handleFilterChange} class="mr-2" />
        地形
      </label>
    </div>
  </div>

  <div class="bg-gray-800 p-4 rounded-lg mb-4">
    <MapWidget />
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each regions as region}
      <RegionCard {region} />
    {/each}
  </div>

  <h2 class="text-2xl font-bold text-white mt-8 mb-4">名産品</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each products as product}
      <ProductCard {product} />
    {/each}
  </div>

  <h2 class="text-2xl font-bold text-white mt-8 mb-4">名所</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each landmarks as landmark}
      <LandmarkCard {landmark} />
    {/each}
  </div>

  <h2 class="text-2xl font-bold text-white mt-8 mb-4">地形</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each terrains as terrain}
      <TerrainCard {terrain} />
    {/each}
  </div>
</div>

