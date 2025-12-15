<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import type { RegionWithRelations } from '$lib/type';

  let regions = writable<RegionWithRelations[]>([]);
  let showModal = writable(false);
  let showEditModal = writable(false);
  let newRegionName = '';
  let newPrefectureCode = '';
  let newLatitude = '';
  let newLongitude = '';
  let newDescription = '';
  let newRegionImage: File | null = null;
  let editRegionId: string | null = null;
  let editRegionName = '';
  let editPrefectureCode = '';
  let editLatitude = '';
  let editLongitude = '';
  let editDescription = '';
  let editRegionImage: File | null = null;

  const fetchRegions = async () => {
    const response = await fetch('/api/regions');
    const data = await response.json();
    regions.set(data);
  };

  const addRegion = async () => {
    const formData = new FormData();
    formData.append('name', newRegionName);
    formData.append('prefectureCode', newPrefectureCode);
    formData.append('latitude', newLatitude);
    formData.append('longitude', newLongitude);
    if (newDescription) {
      formData.append('description', newDescription);
    }
    if (newRegionImage) {
      formData.append('image', newRegionImage);
    }

    const response = await fetch('/admin/api/regions', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      fetchRegions();
      showModal.set(false);
      newRegionName = '';
      newPrefectureCode = '';
      newLatitude = '';
      newLongitude = '';
      newDescription = '';
      newRegionImage = null;
      alert('地域が追加されました');
    } else {
      console.error('Failed to add region');
    }
  };

  const editRegion = async () => {
    const formData = new FormData();
    if (editRegionId) {
      formData.append('id', editRegionId);
    }
    formData.append('name', editRegionName);
    formData.append('prefectureCode', editPrefectureCode);
    formData.append('latitude', editLatitude);
    formData.append('longitude', editLongitude);
    if (editDescription) {
      formData.append('description', editDescription);
    }
    if (editRegionImage) {
      formData.append('image', editRegionImage);
    }

    const response = await fetch('/admin/api/regions', {
      method: 'PUT',
      body: formData,
    });

    if (response.ok) {
      fetchRegions();
      showEditModal.set(false);
      alert('地域が更新されました');
    } else {
      console.error('Failed to edit region');
    }
  };

  const openEditModal = (region: RegionWithRelations) => {
    editRegionId = region.id.toString();
    editRegionName = region.name;
    editPrefectureCode = region.prefectureCode;
    editLatitude = region.latitude.toString();
    editLongitude = region.longitude.toString();
    editDescription = region.description || '';
    editRegionImage = null;
    showEditModal.set(true);
  };

  const handleFileChange = (e: Event, setImage: (file: File | null) => void) => {
    const target = e.target as HTMLInputElement;
    setImage(target.files?.[0] || null);
  };

  onMount(fetchRegions);
</script>

<div class="bg-orange-50 min-h-screen p-4">
  <button
    class="bg-orange-400 text-white p-2 rounded float-right mb-4 hover:bg-orange-500 transition-colors font-semibold shadow-sm"
    on:click={() => showModal.set(true)}
  >
    新規地域追加
  </button>

  {#if $showModal}
    <div class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-4 rounded-lg shadow-xl w-1/3 border-2 border-orange-200">
        <h2 class="text-xl mb-4 text-orange-600 font-bold">新規地域追加</h2>
        <label class="block mb-2 text-gray-700">
          地域名:
          <input type="text" bind:value={newRegionName} class="border-2 border-orange-200 p-2 w-full bg-white text-gray-800 rounded focus:border-orange-400 focus:outline-none" />
        </label>
        <label class="block mb-2 text-gray-700">
          都道府県コード:
          <input type="text" bind:value={newPrefectureCode} class="border-2 border-orange-200 p-2 w-full bg-white text-gray-800 rounded focus:border-orange-400 focus:outline-none" />
        </label>
        <label class="block mb-2 text-gray-700">
          緯度:
          <input type="number" step="0.0001" bind:value={newLatitude} class="border-2 border-orange-200 p-2 w-full bg-white text-gray-800 rounded focus:border-orange-400 focus:outline-none" />
        </label>
        <label class="block mb-2 text-gray-700">
          経度:
          <input type="number" step="0.0001" bind:value={newLongitude} class="border-2 border-orange-200 p-2 w-full bg-white text-gray-800 rounded focus:border-orange-400 focus:outline-none" />
        </label>
        <label class="block mb-2 text-gray-700">
          説明:
          <textarea bind:value={newDescription} class="border-2 border-orange-200 p-2 w-full bg-white text-gray-800 rounded focus:border-orange-400 focus:outline-none"></textarea>
        </label>
        <label class="block mb-4 text-gray-700">
          画像:
          <input
            type="file"
            accept="image/*"
            on:change={(e) => handleFileChange(e, (file) => (newRegionImage = file))}
            class="border-2 border-orange-200 p-2 w-full bg-white text-gray-800 rounded focus:border-orange-400 focus:outline-none"
          />
        </label>
        <div class="flex justify-end">
          <button
            class="bg-gray-300 text-gray-700 p-2 rounded mr-2 hover:bg-gray-400 transition-colors font-semibold"
            on:click={() => showModal.set(false)}
          >
            キャンセル
          </button>
          <button class="bg-orange-400 text-white p-2 rounded hover:bg-orange-500 transition-colors font-semibold shadow-sm" on:click={addRegion}>追加</button>
        </div>
      </div>
    </div>
  {/if}

  {#if $showEditModal}
    <div class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-4 rounded-lg shadow-xl w-1/3 border-2 border-orange-200">
        <h2 class="text-xl mb-4 text-orange-600 font-bold">地域情報編集</h2>
        <label class="block mb-2 text-gray-700">
          地域名:
          <input type="text" bind:value={editRegionName} class="border-2 border-orange-200 p-2 w-full bg-white text-gray-800 rounded focus:border-orange-400 focus:outline-none" />
        </label>
        <label class="block mb-2 text-gray-700">
          都道府県コード:
          <input type="text" bind:value={editPrefectureCode} class="border-2 border-orange-200 p-2 w-full bg-white text-gray-800 rounded focus:border-orange-400 focus:outline-none" />
        </label>
        <label class="block mb-2 text-gray-700">
          緯度:
          <input type="number" step="0.0001" bind:value={editLatitude} class="border-2 border-orange-200 p-2 w-full bg-white text-gray-800 rounded focus:border-orange-400 focus:outline-none" />
        </label>
        <label class="block mb-2 text-gray-700">
          経度:
          <input type="number" step="0.0001" bind:value={editLongitude} class="border-2 border-orange-200 p-2 w-full bg-white text-gray-800 rounded focus:border-orange-400 focus:outline-none" />
        </label>
        <label class="block mb-2 text-gray-700">
          説明:
          <textarea bind:value={editDescription} class="border-2 border-orange-200 p-2 w-full bg-white text-gray-800 rounded focus:border-orange-400 focus:outline-none"></textarea>
        </label>
        <label class="block mb-4 text-gray-700">
          画像:
          <input
            type="file"
            accept="image/*"
            on:change={(e) => handleFileChange(e, (file) => (editRegionImage = file))}
            class="border-2 border-orange-200 p-2 w-full bg-white text-gray-800 rounded focus:border-orange-400 focus:outline-none"
          />
        </label>
        <div class="flex justify-end">
          <button
            class="bg-gray-300 text-gray-700 p-2 rounded mr-2 hover:bg-gray-400 transition-colors font-semibold"
            on:click={() => showEditModal.set(false)}
          >
            キャンセル
          </button>
          <button class="bg-orange-400 text-white p-2 rounded hover:bg-orange-500 transition-colors font-semibold shadow-sm" on:click={editRegion}>保存</button>
        </div>
      </div>
    </div>
  {/if}

  {#if $regions.length === 0}
    <p class="text-center text-gray-600">地域が登録されていません</p>
  {:else}
    <table class="min-w-full bg-white text-gray-800 shadow-md rounded-lg border-2 border-orange-200">
      <thead>
        <tr class="bg-orange-100">
          <th class="py-2 px-4 border-b border-orange-200 text-orange-700 font-bold">地域名</th>
          <th class="py-2 px-4 border-b border-orange-200 text-orange-700 font-bold">都道府県コード</th>
          <th class="py-2 px-4 border-b border-orange-200 text-orange-700 font-bold">登録日</th>
          <th class="py-2 px-4 border-b border-orange-200 text-orange-700 font-bold">名産品管理</th>
          <th class="py-2 px-4 border-b border-orange-200 text-orange-700 font-bold">名所管理</th>
          <th class="py-2 px-4 border-b border-orange-200 text-orange-700 font-bold">地形管理</th>
          <th class="py-2 px-4 border-b border-orange-200 text-orange-700 font-bold">編集</th>
        </tr>
      </thead>
      <tbody>
        {#each $regions as region}
          <tr class="hover:bg-orange-50 transition-colors">
            <td class="py-2 px-4 border-b border-orange-200">{region.name}</td>
            <td class="py-2 px-4 border-b border-orange-200">{region.prefectureCode}</td>
            <td class="py-2 px-4 border-b border-orange-200">{new Date(region.createdAt).toLocaleDateString()}</td>
            <td class="py-2 px-4 border-b border-orange-200 text-center">
              <a
                href={`/admin/regions/${region.id}/products`}
                class="text-orange-500 hover:text-orange-600 hover:underline transition-colors"
              >
                名産品管理
              </a>
            </td>
            <td class="py-2 px-4 border-b border-orange-200 text-center">
              <a
                href={`/admin/regions/${region.id}/landmarks`}
                class="text-orange-500 hover:text-orange-600 hover:underline transition-colors"
              >
                名所管理
              </a>
            </td>
            <td class="py-2 px-4 border-b border-orange-200 text-center">
              <a
                href={`/admin/regions/${region.id}/terrains`}
                class="text-orange-500 hover:text-orange-600 hover:underline transition-colors"
              >
                地形管理
              </a>
            </td>
            <td class="py-2 px-4 border-b border-orange-200 text-center">
              <button
                class="bg-yellow-400 text-white p-2 rounded hover:bg-yellow-500 transition-colors font-semibold shadow-sm"
                on:click={() => openEditModal(region)}
              >
                編集
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

