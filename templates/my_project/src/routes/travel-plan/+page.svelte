<script lang="ts">
  import { onMount } from 'svelte';
  import MapWidget from '$lib/components/MapWidget.svelte';
  import { tripPlans, createTripPlan, deleteTripPlan, removeFromTripPlan, updateTripPlanName } from '$lib/module/travelPlan';
  import { markers } from '$lib/module/map';
  import type { TripPlan, TravelPlanItem, RegionWithRelations, LandmarkWithRegion, TerrainWithRegion } from '$lib/type';
  import { get } from 'svelte/store';

  let plans: TripPlan[] = [];
  let selectedPlanId: string | null = null;
  let newPlanName = '';
  let showCreateForm = false;
  let editingPlanId: string | null = null;
  let editingPlanName = '';

  onMount(() => {
    const unsubscribe = tripPlans.subscribe((value) => {
      plans = value;
      if (selectedPlanId && !plans.find((p) => p.id === selectedPlanId)) {
        selectedPlanId = plans.length > 0 ? plans[0].id : null;
      } else if (!selectedPlanId && plans.length > 0) {
        selectedPlanId = plans[0].id;
      }
    });
    return unsubscribe;
  });

  // selectedPlanIdが変更されたときにマーカーを更新
  $: if (selectedPlanId) {
    updateMarkers();
  }

  function updateMarkers() {
    if (!selectedPlanId) {
      markers.set([]);
      return;
    }
    const selectedPlan = plans.find((p) => p.id === selectedPlanId);
    if (!selectedPlan) {
      markers.set([]);
      return;
    }
    const markerList = selectedPlan.items.map((item: TravelPlanItem) => {
      const markerType: 'product' | 'landmark' | 'terrain' = 
        item.type === 'region' ? 'product' : 
        item.type === 'landmark' ? 'landmark' : 
        'terrain';
      return {
        id: item.id,
        type: markerType,
        name: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
        data: item as any, // TravelPlanItemをMarkerのdata型に合わせるためanyにキャスト
      };
    });
    markers.set(markerList);
  }

  function handleCreatePlan() {
    if (newPlanName.trim()) {
      const newPlan = createTripPlan(newPlanName.trim());
      selectedPlanId = newPlan.id;
      newPlanName = '';
      showCreateForm = false;
    }
  }

  function handleDeletePlan(planId: string) {
    if (confirm('この旅行プランを削除しますか？')) {
      deleteTripPlan(planId);
      if (selectedPlanId === planId) {
        selectedPlanId = plans.length > 1 ? plans.find((p) => p.id !== planId)?.id || null : null;
      }
    }
  }

  function handleRemoveItem(planId: string, itemId: number, type: 'region' | 'landmark' | 'terrain') {
    if (confirm('旅行プランから削除しますか？')) {
      removeFromTripPlan(planId, itemId, type);
    }
  }

  function startEditPlan(plan: TripPlan) {
    editingPlanId = plan.id;
    editingPlanName = plan.name;
  }

  function saveEditPlan() {
    if (editingPlanId && editingPlanName.trim()) {
      updateTripPlanName(editingPlanId, editingPlanName.trim());
      editingPlanId = null;
      editingPlanName = '';
    }
  }

  function cancelEditPlan() {
    editingPlanId = null;
    editingPlanName = '';
  }

  $: selectedPlan = plans.find((p) => p.id === selectedPlanId);

  // サマリ用のデータ
  let regionData: Map<number, RegionWithRelations> = new Map();
  let landmarkData: Map<number, LandmarkWithRegion> = new Map();
  let terrainData: Map<number, TerrainWithRegion> = new Map();
  let summaryLoading = false;

    // 選択中のプランに含まれる地域ID、名所ID、地形IDを取得
  $: regionIds = selectedPlan
    ? [...new Set(selectedPlan.items.filter((item: TravelPlanItem) => item.type === 'region').map((item: TravelPlanItem) => item.id))]
    : [];
  $: landmarkIds = selectedPlan
    ? [...new Set(selectedPlan.items.filter((item: TravelPlanItem) => item.type === 'landmark').map((item: TravelPlanItem) => item.id))]
    : [];
  $: terrainIds = selectedPlan
    ? [...new Set(selectedPlan.items.filter((item: TravelPlanItem) => item.type === 'terrain').map((item: TravelPlanItem) => item.id))]
    : [];

  // データを取得（selectedPlanまたはIDが変更されたとき）
  $: if (selectedPlan && (regionIds.length > 0 || landmarkIds.length > 0 || terrainIds.length > 0)) {
    loadSummaryData();
  } else if (!selectedPlan) {
    regionData.clear();
    landmarkData.clear();
    terrainData.clear();
  }

  async function loadSummaryData() {
    if (!selectedPlan) return;
    summaryLoading = true;
    try {
      const promises: Promise<void>[] = [];

      // 地域データを取得
      for (const id of regionIds) {
        if (!regionData.has(id)) {
          promises.push(
            fetch(`/api/regions/${id}`)
              .then(async (response) => {
                if (response.ok) {
                  const data = await response.json();
                  regionData.set(id, data);
                }
              })
              .catch((error) => {
                console.error(`地域データの取得に失敗しました (ID: ${id}):`, error);
              })
          );
        }
      }

      // 名所データを取得（リストAPIから全件取得してフィルタリング）
      if (landmarkIds.length > 0) {
        const missingLandmarkIds = landmarkIds.filter((id) => !landmarkData.has(id));
        if (missingLandmarkIds.length > 0) {
          promises.push(
            fetch('/api/landmarks')
              .then(async (response) => {
                if (response.ok) {
                  const allLandmarks = await response.json();
                  missingLandmarkIds.forEach((id: number) => {
                    const landmark = allLandmarks.find((l: LandmarkWithRegion) => l.id === id);
                    if (landmark) {
                      landmarkData.set(id, landmark);
                    }
                  });
                }
              })
              .catch((error) => {
                console.error('名所データの取得に失敗しました:', error);
              })
          );
        }
      }

      // 地形データを取得（リストAPIから全件取得してフィルタリング）
      if (terrainIds.length > 0) {
        const missingTerrainIds = terrainIds.filter((id) => !terrainData.has(id));
        if (missingTerrainIds.length > 0) {
          promises.push(
            fetch('/api/terrains')
              .then(async (response) => {
                if (response.ok) {
                  const allTerrains = await response.json();
                  missingTerrainIds.forEach((id: number) => {
                    const terrain = allTerrains.find((t: TerrainWithRegion) => t.id === id);
                    if (terrain) {
                      terrainData.set(id, terrain);
                    }
                  });
                }
              })
              .catch((error) => {
                console.error('地形データの取得に失敗しました:', error);
              })
          );
        }
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('サマリデータの取得に失敗しました:', error);
    } finally {
      summaryLoading = false;
    }
  }

  // サマリを生成
  $: summary = selectedPlan
    ? generateSummary(selectedPlan, regionData, landmarkData, terrainData)
    : null;

  function generateSummary(
    plan: TripPlan,
    regions: Map<number, RegionWithRelations>,
    landmarks: Map<number, LandmarkWithRegion>,
    terrains: Map<number, TerrainWithRegion>
  ) {
    const regionItems = plan.items.filter((item: TravelPlanItem) => item.type === 'region');
    const landmarkItems = plan.items.filter((item: TravelPlanItem) => item.type === 'landmark');
    const terrainItems = plan.items.filter((item: TravelPlanItem) => item.type === 'terrain');

    // 地域情報を集計
    const regionNames: string[] = [];
    const allProducts: Array<{ name: string; region: string; ranking?: number }> = [];
    const allRegionLandmarks: Array<{ name: string; region: string }> = [];
    const allRegionTerrains: Array<{ name: string; region: string }> = [];

    regions.forEach((region) => {
      regionNames.push(region.name);
      region.products.forEach((product) => {
        allProducts.push({
          name: product.name,
          region: region.name,
          ranking: product.ranking || undefined,
        });
      });
      region.landmarks.forEach((landmark) => {
        allRegionLandmarks.push({
          name: landmark.name,
          region: region.name,
        });
      });
      region.terrains.forEach((terrain) => {
        allRegionTerrains.push({
          name: terrain.name,
          region: region.name,
        });
      });
    });

    // 追加された名所と地形も含める
    const addedLandmarks: Array<{ name: string; region?: string; description?: string }> = [];
    landmarkItems.forEach((item: TravelPlanItem) => {
      const landmark = landmarks.get(item.id);
      if (landmark) {
        addedLandmarks.push({
          name: landmark.name,
          region: landmark.region?.name || undefined,
          description: landmark.description || undefined,
        });
      } else {
        addedLandmarks.push({ name: item.name });
      }
    });

    const addedTerrains: Array<{ name: string; region?: string; description?: string }> = [];
    terrainItems.forEach((item: TravelPlanItem) => {
      const terrain = terrains.get(item.id);
      if (terrain) {
        addedTerrains.push({
          name: terrain.name,
          region: terrain.region?.name || undefined,
          description: terrain.description || undefined,
        });
      } else {
        addedTerrains.push({ name: item.name });
      }
    });

    // ベスト3の名産品を抽出
    const topProducts = allProducts
      .filter((p) => p.ranking && p.ranking <= 3)
      .sort((a, b) => (a.ranking || 0) - (b.ranking || 0))
      .slice(0, 5);

    return {
      regionCount: regionNames.length,
      regionNames,
      productCount: allProducts.length,
      topProducts,
      allProducts: allProducts.slice(0, 10),
      landmarkCount: allRegionLandmarks.length + addedLandmarks.length,
      allLandmarks: [...allRegionLandmarks, ...addedLandmarks].slice(0, 10),
      terrainCount: allRegionTerrains.length + addedTerrains.length,
      allTerrains: [...allRegionTerrains, ...addedTerrains].slice(0, 10),
    };
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-3xl font-bold text-orange-600">旅行プラン - まなび旅マップ</h1>
    <button
      class="px-4 py-2 bg-orange-400 text-white rounded hover:bg-orange-500 transition-colors font-semibold shadow-sm"
      on:click={() => (showCreateForm = !showCreateForm)}
    >
      {showCreateForm ? 'キャンセル' : '+ 新しい旅行プラン'}
    </button>
  </div>

  {#if showCreateForm}
    <div class="bg-white p-4 rounded-lg shadow-md border-2 border-orange-200 mb-4">
      <h2 class="text-xl font-bold text-orange-600 mb-2">新しい旅行プランを作成</h2>
      <div class="flex gap-2">
        <input
          type="text"
          bind:value={newPlanName}
          placeholder="旅行プラン名を入力（例：2024年春の旅行）"
          class="flex-1 px-4 py-2 border-2 border-orange-200 rounded focus:border-orange-400 focus:outline-none"
          on:keydown={(e) => e.key === 'Enter' && handleCreatePlan()}
        />
        <button
          class="px-4 py-2 bg-orange-400 text-white rounded hover:bg-orange-500 transition-colors font-semibold shadow-sm"
          on:click={handleCreatePlan}
        >
          作成
        </button>
      </div>
    </div>
  {/if}

  {#if plans.length === 0}
    <div class="bg-white p-4 rounded-lg shadow-md border-2 border-orange-200">
      <p class="text-gray-600 text-center py-4">旅行プランがありません。新しい旅行プランを作成してください。</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- 旅行プラン一覧 -->
      <div class="lg:col-span-1">
        <div class="bg-white p-4 rounded-lg shadow-md border-2 border-orange-200">
          <h2 class="text-xl font-bold text-orange-600 mb-4">旅行プラン一覧</h2>
          <div class="space-y-2">
            {#each plans as plan}
              <div
                class="p-3 rounded border-2 transition-colors cursor-pointer {selectedPlanId === plan.id
                  ? 'bg-orange-100 border-orange-400'
                  : 'bg-orange-50 border-orange-200 hover:border-orange-300'}"
                on:click={() => (selectedPlanId = plan.id)}
              >
                {#if editingPlanId === plan.id}
                  <div class="flex gap-2">
                    <input
                      type="text"
                      bind:value={editingPlanName}
                      class="flex-1 px-2 py-1 border-2 border-orange-200 rounded text-sm focus:border-orange-400 focus:outline-none"
                      on:keydown={(e) => e.key === 'Enter' && saveEditPlan()}
                      on:keydown={(e) => e.key === 'Escape' && cancelEditPlan()}
                    />
                    <button
                      class="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      on:click={saveEditPlan}
                    >
                      保存
                    </button>
                    <button
                      class="px-2 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                      on:click={cancelEditPlan}
                    >
                      取消
                    </button>
                  </div>
                {:else}
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <h3 class="font-bold text-orange-600">{plan.name}</h3>
                      <p class="text-xs text-gray-500">
                        {plan.items.length}件の項目 | {new Date(plan.createdAt).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    <div class="flex gap-1">
                      <button
                        class="px-2 py-1 bg-yellow-400 text-white rounded text-xs hover:bg-yellow-500"
                        on:click|stopPropagation={() => startEditPlan(plan)}
                      >
                        編集
                      </button>
                      <button
                        class="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        on:click|stopPropagation={() => handleDeletePlan(plan.id)}
                      >
                        削除
                      </button>
                    </div>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- 選択中の旅行プランの詳細 -->
      <div class="lg:col-span-2 space-y-4">
        {#if selectedPlan}
          <div class="bg-white p-4 rounded-lg shadow-md border-2 border-orange-200">
            <h2 class="text-2xl font-bold text-orange-600 mb-4">{selectedPlan.name}</h2>
            
            <!-- サマリ表示 -->
            {#if summary && selectedPlan.items.length > 0}
              <div class="bg-orange-50 p-6 rounded-lg mb-6 border-2 border-orange-200">
                <h3 class="text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
                  <span>📋</span>
                  <span>旅行プランの概要</span>
                </h3>
                {#if summaryLoading}
                  <div class="text-center py-4">
                    <p class="text-gray-600">読み込み中...</p>
                  </div>
                {:else}
                  <div class="space-y-4">
                    <!-- 訪問予定地域 -->
                    {#if summary.regionCount > 0}
                      <div class="bg-white p-4 rounded-lg border border-orange-200">
                        <h4 class="font-bold text-orange-700 mb-2 flex items-center gap-2">
                          <span>🗾</span>
                          <span>訪問予定地域 ({summary.regionCount}地域)</span>
                        </h4>
                        <p class="text-gray-700 text-sm">{summary.regionNames.join('、')}</p>
                      </div>
                    {/if}

                    <!-- 名産品 -->
                    {#if summary.productCount > 0}
                      <div class="bg-white p-4 rounded-lg border border-orange-200">
                        <h4 class="font-bold text-orange-700 mb-2 flex items-center gap-2">
                          <span>🍎</span>
                          <span>名産品 ({summary.productCount}種類)</span>
                        </h4>
                        {#if summary.topProducts.length > 0}
                          <div class="mb-2">
                            <p class="text-xs text-gray-600 mb-1 font-semibold">⭐ ベスト3:</p>
                            <ul class="list-disc list-inside text-sm text-gray-700 ml-2">
                              {#each summary.topProducts as product}
                                <li>
                                  {product.name}
                                  {#if product.ranking}
                                    <span class="text-yellow-600">({product.ranking}位)</span>
                                  {/if}
                                  <span class="text-gray-500 text-xs"> - {product.region}</span>
                                </li>
                              {/each}
                            </ul>
                          </div>
                        {/if}
                        {#if summary.allProducts.length > summary.topProducts.length}
                          <p class="text-xs text-gray-600">
                            その他: {summary.allProducts.slice(summary.topProducts.length).map(p => p.name).join('、')}
                            {#if summary.productCount > summary.allProducts.length}
                              <span class="text-gray-500">他{summary.productCount - summary.allProducts.length}種類</span>
                            {/if}
                          </p>
                        {/if}
                      </div>
                    {/if}

                    <!-- 見どころ（名所） -->
                    {#if summary.landmarkCount > 0}
                      <div class="bg-white p-4 rounded-lg border border-orange-200">
                        <h4 class="font-bold text-orange-700 mb-2 flex items-center gap-2">
                          <span>🏛️</span>
                          <span>見どころ・名所 ({summary.landmarkCount}件)</span>
                        </h4>
                        <ul class="list-disc list-inside text-sm text-gray-700 ml-2 space-y-1">
                          {#each summary.allLandmarks as landmark}
                            <li>
                              <span class="font-semibold">{landmark.name}</span>
                              {#if landmark.region}
                                <span class="text-gray-500 text-xs"> - {landmark.region}</span>
                              {/if}
                            </li>
                          {/each}
                        </ul>
                        {#if summary.landmarkCount > summary.allLandmarks.length}
                          <p class="text-xs text-gray-500 mt-2">
                            他{summary.landmarkCount - summary.allLandmarks.length}件
                          </p>
                        {/if}
                      </div>
                    {/if}

                    <!-- 特徴的な地形 -->
                    {#if summary.terrainCount > 0}
                      <div class="bg-white p-4 rounded-lg border border-orange-200">
                        <h4 class="font-bold text-orange-700 mb-2 flex items-center gap-2">
                          <span>⛰️</span>
                          <span>特徴的な地形 ({summary.terrainCount}件)</span>
                        </h4>
                        <ul class="list-disc list-inside text-sm text-gray-700 ml-2 space-y-1">
                          {#each summary.allTerrains as terrain}
                            <li>
                              <span class="font-semibold">{terrain.name}</span>
                              {#if terrain.region}
                                <span class="text-gray-500 text-xs"> - {terrain.region}</span>
                              {/if}
                            </li>
                          {/each}
                        </ul>
                        {#if summary.terrainCount > summary.allTerrains.length}
                          <p class="text-xs text-gray-500 mt-2">
                            他{summary.terrainCount - summary.allTerrains.length}件
                          </p>
                        {/if}
                      </div>
                    {/if}
                  </div>
                {/if}
              </div>
            {/if}

            {#if selectedPlan.items.length === 0}
              <p class="text-gray-600 text-center py-4">この旅行プランにはまだ項目が追加されていません。</p>
            {:else}
              <div class="space-y-2">
                {#each selectedPlan.items as item}
                  <div class="bg-orange-50 p-4 rounded flex items-center justify-between border-2 border-orange-200 hover:border-orange-400 transition-colors">
                    <div>
                      <h3 class="text-lg font-bold text-orange-600">{item.name}</h3>
                      <p class="text-gray-600 text-sm">
                        {item.type === 'region' ? '地域' : item.type === 'landmark' ? '名所' : '地形'}
                      </p>
                    </div>
                    <button
                      class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-semibold shadow-sm"
                      on:click={() => handleRemoveItem(selectedPlan.id, item.id, item.type)}
                    >
                      削除
                    </button>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {:else}
          <div class="bg-white p-4 rounded-lg shadow-md border-2 border-orange-200">
            <p class="text-gray-600 text-center py-4">旅行プランを選択してください。</p>
          </div>
        {/if}

        <div class="bg-white p-4 rounded-lg shadow-md border-2 border-orange-200">
          <MapWidget fitBounds={true} />
        </div>
      </div>
    </div>
  {/if}
</div>

