<script lang="ts">
  import { onMount } from 'svelte';
  import { tripPlans, createTripPlan } from '$lib/module/travelPlan';
  import type { TripPlan } from '$lib/type';
  import { get } from 'svelte/store';

  export let onSelect: (planId: string) => void;
  export let onCancel: () => void;

  let plans: TripPlan[] = [];
  let showCreateForm = false;
  let newPlanName = '';

  onMount(() => {
    const unsubscribe = tripPlans.subscribe((value) => {
      plans = value;
    });
    return unsubscribe;
  });

  function handleCreatePlan() {
    if (newPlanName.trim()) {
      const newPlan = createTripPlan(newPlanName.trim());
      onSelect(newPlan.id);
      newPlanName = '';
      showCreateForm = false;
    }
  }

  function handleSelect(planId: string) {
    onSelect(planId);
  }
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" on:click={onCancel}>
  <div class="bg-white rounded-lg shadow-xl border-2 border-orange-200 p-6 max-w-md w-full mx-4" on:click|stopPropagation>
    <h2 class="text-2xl font-bold text-orange-600 mb-4">旅行プランを選択</h2>

    {#if plans.length === 0}
      <p class="text-gray-600 mb-4">旅行プランがありません。新しい旅行プランを作成してください。</p>
    {:else}
      <div class="space-y-2 mb-4 max-h-60 overflow-y-auto">
        {#each plans as plan}
          <button
            class="w-full p-3 text-left bg-orange-50 border-2 border-orange-200 rounded hover:bg-orange-100 hover:border-orange-400 transition-colors"
            on:click={() => handleSelect(plan.id)}
          >
            <div class="font-bold text-orange-600">{plan.name}</div>
            <div class="text-xs text-gray-500">{plan.items.length}件の項目</div>
          </button>
        {/each}
      </div>
    {/if}

    {#if showCreateForm}
      <div class="mb-4">
        <input
          type="text"
          bind:value={newPlanName}
          placeholder="旅行プラン名を入力"
          class="w-full px-4 py-2 border-2 border-orange-200 rounded focus:border-orange-400 focus:outline-none mb-2"
          on:keydown={(e) => e.key === 'Enter' && handleCreatePlan()}
        />
        <div class="flex gap-2">
          <button
            class="flex-1 px-4 py-2 bg-orange-400 text-white rounded hover:bg-orange-500 transition-colors font-semibold"
            on:click={handleCreatePlan}
          >
            作成して追加
          </button>
          <button
            class="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
            on:click={() => (showCreateForm = false)}
          >
            キャンセル
          </button>
        </div>
      </div>
    {:else}
      <button
        class="w-full px-4 py-2 bg-orange-400 text-white rounded hover:bg-orange-500 transition-colors font-semibold mb-2"
        on:click={() => (showCreateForm = true)}
      >
        + 新しい旅行プランを作成
      </button>
    {/if}

    <button
      class="w-full px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
      on:click={onCancel}
    >
      キャンセル
    </button>
  </div>
</div>

