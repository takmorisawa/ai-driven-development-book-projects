<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { page } from '$app/stores';
  import { get } from 'svelte/store';
  import type { LandmarkWithRegion } from '$lib/type';

  let landmarks = writable<LandmarkWithRegion[]>([]);
  let showModal = writable(false);
  let showEditModal = writable(false);
  let newLandmarkName = '';
  let newDescription = '';
  let newLatitude = '';
  let newLongitude = '';
  let newLandmarkImage: File | null = null;
  let editLandmarkId: string | null = null;
  let editLandmarkName = '';
  let editDescription = '';
  let editLatitude = '';
  let editLongitude = '';
  let editLandmarkImage: File | null = null;

  $: regionId = parseInt(get(page).params.id, 10);

  const fetchLandmarks = async () => {
    const response = await fetch(`/api/landmarks?regionId=${regionId}`);
    const data = await response.json();
    landmarks.set(data);
  };

  const addLandmark = async () => {
    const formData = new FormData();
    formData.append('name', newLandmarkName);
    formData.append('regionId', regionId.toString());
    formData.append('latitude', newLatitude);
    formData.append('longitude', newLongitude);
    if (newDescription) {
      formData.append('description', newDescription);
    }
    if (newLandmarkImage) {
      formData.append('image', newLandmarkImage);
    }

    const response = await fetch('/admin/api/landmarks', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      fetchLandmarks();
      showModal.set(false);
      newLandmarkName = '';
      newDescription = '';
      newLatitude = '';
      newLongitude = '';
      newLandmarkImage = null;
      alert('名所が追加されました');
    } else {
      console.error('Failed to add landmark');
    }
  };

  const editLandmark = async () => {
    const formData = new FormData();
    if (editLandmarkId) {
      formData.append('id', editLandmarkId);
    }
    formData.append('name', editLandmarkName);
    formData.append('regionId', regionId.toString());
    formData.append('latitude', editLatitude);
    formData.append('longitude', editLongitude);
    if (editDescription) {
      formData.append('description', editDescription);
    }
    if (editLandmarkImage) {
      formData.append('image', editLandmarkImage);
    }

    const response = await fetch('/admin/api/landmarks', {
      method: 'PUT',
      body: formData,
    });

    if (response.ok) {
      fetchLandmarks();
      showEditModal.set(false);
      alert('名所が更新されました');
    } else {
      console.error('Failed to edit landmark');
    }
  };

  const openEditModal = (landmark: LandmarkWithRegion) => {
    editLandmarkId = landmark.id.toString();
    editLandmarkName = landmark.name;
    editDescription = landmark.description || '';
    editLatitude = landmark.latitude.toString();
    editLongitude = landmark.longitude.toString();
    editLandmarkImage = null;
    showEditModal.set(true);
  };

  const handleFileChange = (e: Event, setImage: (file: File | null) => void) => {
    const target = e.target as HTMLInputElement;
    setImage(target.files?.[0] || null);
  };

  onMount(fetchLandmarks);
</script>

<div class="bg-orange-50 min-h-screen p-4">
  <a href="/admin/regions" class="text-orange-500 hover:text-orange-600 hover:underline mb-4 inline-block transition-colors">← 地域一覧に戻る</a>
  <button
    class="bg-orange-400 text-white p-2 rounded float-right mb-4 hover:bg-orange-500 transition-colors font-semibold shadow-sm"
    on:click={() => showModal.set(true)}
  >
    新規名所追加
  </button>

  {#if $showModal}
    <div class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-4 rounded-lg shadow-xl w-1/3 border-2 border-orange-200">
        <h2 class="text-xl mb-4 text-orange-600 font-bold">新規名所追加</h2>
        <label class="block mb-2 text-gray-700">
          名所名:
          <input type="text" bind:value={newLandmarkName} class="border-2 border-orange-200 p-2 w-full bg-white text-gray-800 rounded focus:border-orange-400 focus:outline-none" />
        </label>
        <label class="block mb-2 text-gray-700">
          説明:
          <textarea bind:value={newDescription} class="border-2 border-orange-200 p-2 w-full bg-white text-gray-800 rounded focus:border-orange-400 focus:outline-none"></textarea>
        </label>
        <label class="block mb-2 text-gray-700">
          緯度:
          <input type="number" step="0.0001" bind:value={newLatitude} class="border-2 border-orange-200 p-2 w-full bg-white text-gray-800 rounded focus:border-orange-400 focus:outline-none" />
        </label>
        <label class="block mb-2 text-gray-700">
          経度:
          <input type="number" step="0.0001" bind:value={newLongitude} class="border-2 border-orange-200 p-2 w-full bg-white text-gray-800 rounded focus:border-orange-400 focus:outline-none" />
        </label>
        <label class="block mb-4 text-gray-700">
          画像:
          <input
            type="file"
            accept="image/*"
            on:change={(e) => handleFileChange(e, (file) => (newLandmarkImage = file))}
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
          <button class="bg-orange-400 text-white p-2 rounded hover:bg-orange-500 transition-colors font-semibold shadow-sm" on:click={addLandmark}>追加</button>
        </div>
      </div>
    </div>
  {/if}

  {#if $showEditModal}
    <div class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-4 rounded-lg shadow-xl w-1/3 border-2 border-orange-200">
        <h2 class="text-xl mb-4 text-orange-600 font-bold">名所情報編集</h2>
        <label class="block mb-2 text-gray-700">
          名所名:
          <input type="text" bind:value={editLandmarkName} class="border-2 border-orange-200 p-2 w-full bg-white text-gray-800 rounded focus:border-orange-400 focus:outline-none" />
        </label>
        <label class="block mb-2 text-gray-700">
          説明:
          <textarea bind:value={editDescription} class="border-2 border-orange-200 p-2 w-full bg-white text-gray-800 rounded focus:border-orange-400 focus:outline-none"></textarea>
        </label>
        <label class="block mb-2 text-gray-700">
          緯度:
          <input type="number" step="0.0001" bind:value={editLatitude} class="border-2 border-orange-200 p-2 w-full bg-white text-gray-800 rounded focus:border-orange-400 focus:outline-none" />
        </label>
        <label class="block mb-2 text-gray-700">
          経度:
          <input type="number" step="0.0001" bind:value={editLongitude} class="border-2 border-orange-200 p-2 w-full bg-white text-gray-800 rounded focus:border-orange-400 focus:outline-none" />
        </label>
        <label class="block mb-4 text-gray-700">
          画像:
          <input
            type="file"
            accept="image/*"
            on:change={(e) => handleFileChange(e, (file) => (editLandmarkImage = file))}
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
          <button class="bg-orange-400 text-white p-2 rounded hover:bg-orange-500 transition-colors font-semibold shadow-sm" on:click={editLandmark}>保存</button>
        </div>
      </div>
    </div>
  {/if}

  {#if $landmarks.length === 0}
    <p class="text-center text-gray-600">名所が登録されていません</p>
  {:else}
    <table class="min-w-full bg-white text-gray-800 shadow-md rounded-lg border-2 border-orange-200">
      <thead>
        <tr class="bg-orange-100">
          <th class="py-2 px-4 border-b border-orange-200 text-orange-700 font-bold">名所名</th>
          <th class="py-2 px-4 border-b border-orange-200 text-orange-700 font-bold">地域名</th>
          <th class="py-2 px-4 border-b border-orange-200 text-orange-700 font-bold">緯度</th>
          <th class="py-2 px-4 border-b border-orange-200 text-orange-700 font-bold">経度</th>
          <th class="py-2 px-4 border-b border-orange-200 text-orange-700 font-bold">編集</th>
        </tr>
      </thead>
      <tbody>
        {#each $landmarks as landmark}
          <tr class="hover:bg-orange-50 transition-colors">
            <td class="py-2 px-4 border-b border-orange-200">{landmark.name}</td>
            <td class="py-2 px-4 border-b border-orange-200">{landmark.region.name}</td>
            <td class="py-2 px-4 border-b border-orange-200">{landmark.latitude}</td>
            <td class="py-2 px-4 border-b border-orange-200">{landmark.longitude}</td>
            <td class="py-2 px-4 border-b border-orange-200 text-center">
              <button
                class="bg-yellow-400 text-white p-2 rounded hover:bg-yellow-500 transition-colors font-semibold shadow-sm"
                on:click={() => openEditModal(landmark)}
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

