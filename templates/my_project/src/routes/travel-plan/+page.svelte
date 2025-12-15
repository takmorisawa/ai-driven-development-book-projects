<script lang="ts">
  import { onMount } from 'svelte';
  import MapWidget from '$lib/components/MapWidget.svelte';
  import { tripPlans, createTripPlan, deleteTripPlan, removeFromTripPlan, updateTripPlanName } from '$lib/module/travelPlan';
  import { markers } from '$lib/module/map';
  import type { TripPlan, TravelPlanItem } from '$lib/type';
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
      updateMarkers();
    });
    return unsubscribe;
  });

  function updateMarkers() {
    const allItems: TravelPlanItem[] = plans.flatMap((plan) => plan.items);
    const markerList = allItems.map((item) => ({
      id: item.id,
      type: item.type === 'region' ? 'product' : 'landmark',
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      data: item,
    }));
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

  function handleRemoveItem(planId: string, itemId: number, type: 'region' | 'landmark') {
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
            {#if selectedPlan.items.length === 0}
              <p class="text-gray-600 text-center py-4">この旅行プランにはまだ項目が追加されていません。</p>
            {:else}
              <div class="space-y-2">
                {#each selectedPlan.items as item}
                  <div class="bg-orange-50 p-4 rounded flex items-center justify-between border-2 border-orange-200 hover:border-orange-400 transition-colors">
                    <div>
                      <h3 class="text-lg font-bold text-orange-600">{item.name}</h3>
                      <p class="text-gray-600 text-sm">
                        {item.type === 'region' ? '地域' : '名所'} | 緯度: {item.latitude.toFixed(4)}, 経度: {item.longitude.toFixed(4)}
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
          <MapWidget />
        </div>
      </div>
    </div>
  {/if}
</div>

