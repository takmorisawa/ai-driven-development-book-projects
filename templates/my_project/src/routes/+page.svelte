<script lang="ts">
  import { onMount } from 'svelte';
  import MapWidget from '$lib/components/MapWidget.svelte';
  import RegionCard from '$lib/components/RegionCard.svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import LandmarkCard from '$lib/components/LandmarkCard.svelte';
  import TerrainCard from '$lib/components/TerrainCard.svelte';
  import { markers, currentFilter, viewportBounds } from '$lib/module/map';
  import type { RegionWithRelations, ProductWithRegion, LandmarkWithRegion, TerrainWithRegion } from '$lib/type';
  import type { ViewportBounds } from '$lib/module/map';

  import { get } from 'svelte/store';

  let regions: RegionWithRelations[] = [];
  let products: ProductWithRegion[] = [];
  let landmarks: LandmarkWithRegion[] = [];
  let terrains: TerrainWithRegion[] = [];
  let showProducts = true;
  let showLandmarks = true;
  let showTerrains = true;

  onMount(async () => {
    await loadData();
    
    // フィルターの変更を監視
    const unsubscribeFilter = currentFilter.subscribe((filter) => {
      showProducts = filter.showProducts;
      showLandmarks = filter.showLandmarks;
      showTerrains = filter.showTerrains;
    });
    
    return () => {
      unsubscribeFilter();
    };
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

  // ビューポート内かどうかを判定する関数（ストアを直接参照）
  function isInViewport(latitude: number, longitude: number, currentBounds: ViewportBounds): boolean {
    if (!currentBounds) return true; // ビューポートが設定されていない場合はすべて表示
    
    return (
      latitude >= currentBounds.south &&
      latitude <= currentBounds.north &&
      longitude >= currentBounds.west &&
      longitude <= currentBounds.east
    );
  }

  // フィルタリングされたデータを計算（フィルター + ビューポート）
  // $viewportBoundsを使用してリアクティブに更新されるようにする
  $: filteredProducts = (showProducts ? products : []).filter((product) => {
    if (!product.latitude || !product.longitude) return false;
    return isInViewport(product.latitude, product.longitude, $viewportBounds);
  });
  
  $: filteredLandmarks = (showLandmarks ? landmarks : []).filter((landmark) => {
    return isInViewport(landmark.latitude, landmark.longitude, $viewportBounds);
  });
  
  $: filteredTerrains = (showTerrains ? terrains : []).filter((terrain) => {
    return isInViewport(terrain.latitude, terrain.longitude, $viewportBounds);
  });

  // フィルタリングされた地域（関連する名産品・名所・地形が表示されている地域）
  $: filteredRegions = regions.filter((region) => {
    if (!showProducts && !showLandmarks && !showTerrains) {
      return true; // すべて非表示の場合はすべて表示
    }
    
    // ビューポート内の関連データがあるかチェック
    const hasVisibleProducts = showProducts && 
      region.products.some((p) => p.latitude && p.longitude && isInViewport(p.latitude, p.longitude, $viewportBounds));
    const hasVisibleLandmarks = showLandmarks && 
      region.landmarks.some((l) => isInViewport(l.latitude, l.longitude, $viewportBounds));
    const hasVisibleTerrains = showTerrains && 
      region.terrains.some((t) => isInViewport(t.latitude, t.longitude, $viewportBounds));
    
    // 地域自体がビューポート内にあるか、または関連データがビューポート内にあるか
    const regionInViewport = isInViewport(region.latitude, region.longitude, $viewportBounds);
    
    return regionInViewport || hasVisibleProducts || hasVisibleLandmarks || hasVisibleTerrains;
  });
</script>

<div class="space-y-4">
  <h1 class="text-3xl font-bold text-orange-600 mb-4">まなび旅マップ - 日本地図で地域の魅力を発見</h1>

  <div class="bg-white p-4 rounded-lg mb-4 shadow-md border-2 border-orange-200">
    <h2 class="text-xl font-bold text-orange-600 mb-2">フィルター</h2>
    <div class="flex gap-4">
      <label class="flex items-center text-gray-700 cursor-pointer hover:text-orange-600 transition-colors">
        <input type="checkbox" bind:checked={showProducts} on:change={handleFilterChange} class="mr-2" />
        <div class="w-6 h-6 rounded-full bg-green-500 border-2 border-white shadow-md flex items-center justify-center text-xs mr-2">
          🍎
        </div>
        名産品
      </label>
      <label class="flex items-center text-gray-700 cursor-pointer hover:text-orange-600 transition-colors">
        <input type="checkbox" bind:checked={showLandmarks} on:change={handleFilterChange} class="mr-2" />
        <div class="w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-md flex items-center justify-center text-xs mr-2">
          🏛️
        </div>
        名所
      </label>
      <label class="flex items-center text-gray-700 cursor-pointer hover:text-orange-600 transition-colors">
        <input type="checkbox" bind:checked={showTerrains} on:change={handleFilterChange} class="mr-2" />
        <div class="w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-md flex items-center justify-center text-xs mr-2">
          ⛰️
        </div>
        地形
      </label>
    </div>
  </div>

  <div class="bg-white p-4 rounded-lg mb-4 shadow-md border-2 border-orange-200">
    <MapWidget />
  </div>

  {#if filteredRegions.length > 0}
    <h2 class="text-2xl font-bold text-orange-600 mt-8 mb-4">地域</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each filteredRegions as region}
        <RegionCard {region} />
      {/each}
    </div>
  {/if}

  {#if filteredProducts.length > 0}
    <h2 class="text-2xl font-bold text-orange-600 mt-8 mb-4">名産品</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each filteredProducts as product}
        <ProductCard {product} />
      {/each}
    </div>
  {/if}

  {#if filteredLandmarks.length > 0}
    <h2 class="text-2xl font-bold text-orange-600 mt-8 mb-4">名所</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each filteredLandmarks as landmark}
        <LandmarkCard {landmark} />
      {/each}
    </div>
  {/if}

  {#if filteredTerrains.length > 0}
    <h2 class="text-2xl font-bold text-orange-600 mt-8 mb-4">地形</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each filteredTerrains as terrain}
        <TerrainCard {terrain} />
      {/each}
    </div>
  {/if}

  {#if filteredRegions.length === 0 && filteredProducts.length === 0 && filteredLandmarks.length === 0 && filteredTerrains.length === 0}
    <div class="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 text-center mt-8">
      <p class="text-orange-600">フィルター条件に一致する項目がありません。</p>
    </div>
  {/if}
</div>

