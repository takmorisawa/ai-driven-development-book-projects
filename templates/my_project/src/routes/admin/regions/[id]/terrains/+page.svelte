<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { page } from '$app/stores';
  import { get } from 'svelte/store';
  import type { TerrainWithRegion } from '$lib/type';

  let terrains = writable<TerrainWithRegion[]>([]);
  let showModal = writable(false);
  let showEditModal = writable(false);
  let newTerrainName = '';
  let newDescription = '';
  let newLatitude = '';
  let newLongitude = '';
  let newTerrainImage: File | null = null;
  let editTerrainId: string | null = null;
  let editTerrainName = '';
  let editDescription = '';
  let editLatitude = '';
  let editLongitude = '';
  let editTerrainImage: File | null = null;

  $: regionId = parseInt(get(page).params.id, 10);

  const fetchTerrains = async () => {
    const response = await fetch(`/api/terrains?regionId=${regionId}`);
    const data = await response.json();
    terrains.set(data);
  };

  const addTerrain = async () => {
    const formData = new FormData();
    formData.append('name', newTerrainName);
    formData.append('regionId', regionId.toString());
    formData.append('latitude', newLatitude);
    formData.append('longitude', newLongitude);
    if (newDescription) {
      formData.append('description', newDescription);
    }
    if (newTerrainImage) {
      formData.append('image', newTerrainImage);
    }

    const response = await fetch('/admin/api/terrains', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      fetchTerrains();
      showModal.set(false);
      newTerrainName = '';
      newDescription = '';
      newLatitude = '';
      newLongitude = '';
      newTerrainImage = null;
      alert('地形が追加されました');
    } else {
      console.error('Failed to add terrain');
    }
  };

  const editTerrain = async () => {
    const formData = new FormData();
    if (editTerrainId) {
      formData.append('id', editTerrainId);
    }
    formData.append('name', editTerrainName);
    formData.append('regionId', regionId.toString());
    formData.append('latitude', editLatitude);
    formData.append('longitude', editLongitude);
    if (editDescription) {
      formData.append('description', editDescription);
    }
    if (editTerrainImage) {
      formData.append('image', editTerrainImage);
    }

    const response = await fetch('/admin/api/terrains', {
      method: 'PUT',
      body: formData,
    });

    if (response.ok) {
      fetchTerrains();
      showEditModal.set(false);
      alert('地形が更新されました');
    } else {
      console.error('Failed to edit terrain');
    }
  };

  const openEditModal = (terrain: TerrainWithRegion) => {
    editTerrainId = terrain.id.toString();
    editTerrainName = terrain.name;
    editDescription = terrain.description || '';
    editLatitude = terrain.latitude.toString();
    editLongitude = terrain.longitude.toString();
    editTerrainImage = null;
    showEditModal.set(true);
  };

  const handleFileChange = (e: Event, setImage: (file: File | null) => void) => {
    const target = e.target as HTMLInputElement;
    setImage(target.files?.[0] || null);
  };

  onMount(fetchTerrains);
</script>

<div class="bg-gray-700 min-h-screen p-4">
  <a href="/admin/regions" class="text-blue-500 hover:underline mb-4 inline-block">← 地域一覧に戻る</a>
  <button
    class="bg-blue-500 text-white p-2 rounded float-right mb-4"
    on:click={() => showModal.set(true)}
  >
    新規地形追加
  </button>

  {#if $showModal}
    <div class="fixed inset-0 bg-gray-700 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-gray-800 p-4 rounded shadow-lg w-1/3">
        <h2 class="text-xl mb-4 text-white">新規地形追加</h2>
        <label class="block mb-2 text-white">
          地形名:
          <input type="text" bind:value={newTerrainName} class="border p-2 w-full bg-gray-700 text-white" />
        </label>
        <label class="block mb-2 text-white">
          説明:
          <textarea bind:value={newDescription} class="border p-2 w-full bg-gray-700 text-white"></textarea>
        </label>
        <label class="block mb-2 text-white">
          緯度:
          <input type="number" step="0.0001" bind:value={newLatitude} class="border p-2 w-full bg-gray-700 text-white" />
        </label>
        <label class="block mb-2 text-white">
          経度:
          <input type="number" step="0.0001" bind:value={newLongitude} class="border p-2 w-full bg-gray-700 text-white" />
        </label>
        <label class="block mb-4 text-white">
          画像:
          <input
            type="file"
            accept="image/*"
            on:change={(e) => handleFileChange(e, (file) => (newTerrainImage = file))}
            class="border p-2 w-full bg-gray-700 text-white"
          />
        </label>
        <div class="flex justify-end">
          <button
            class="bg-gray-500 text-white p-2 rounded mr-2"
            on:click={() => showModal.set(false)}
          >
            キャンセル
          </button>
          <button class="bg-blue-500 text-white p-2 rounded" on:click={addTerrain}>追加</button>
        </div>
      </div>
    </div>
  {/if}

  {#if $showEditModal}
    <div class="fixed inset-0 bg-gray-700 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-gray-800 p-4 rounded shadow-lg w-1/3">
        <h2 class="text-xl mb-4 text-white">地形情報編集</h2>
        <label class="block mb-2 text-white">
          地形名:
          <input type="text" bind:value={editTerrainName} class="border p-2 w-full bg-gray-700 text-white" />
        </label>
        <label class="block mb-2 text-white">
          説明:
          <textarea bind:value={editDescription} class="border p-2 w-full bg-gray-700 text-white"></textarea>
        </label>
        <label class="block mb-2 text-white">
          緯度:
          <input type="number" step="0.0001" bind:value={editLatitude} class="border p-2 w-full bg-gray-700 text-white" />
        </label>
        <label class="block mb-2 text-white">
          経度:
          <input type="number" step="0.0001" bind:value={editLongitude} class="border p-2 w-full bg-gray-700 text-white" />
        </label>
        <label class="block mb-4 text-white">
          画像:
          <input
            type="file"
            accept="image/*"
            on:change={(e) => handleFileChange(e, (file) => (editTerrainImage = file))}
            class="border p-2 w-full bg-gray-700 text-white"
          />
        </label>
        <div class="flex justify-end">
          <button
            class="bg-gray-500 text-white p-2 rounded mr-2"
            on:click={() => showEditModal.set(false)}
          >
            キャンセル
          </button>
          <button class="bg-blue-500 text-white p-2 rounded" on:click={editTerrain}>保存</button>
        </div>
      </div>
    </div>
  {/if}

  {#if $terrains.length === 0}
    <p class="text-center text-gray-500">地形が登録されていません</p>
  {:else}
    <table class="min-w-full bg-gray-800 text-white">
      <thead>
        <tr>
          <th class="py-2 px-4 border-b">地形名</th>
          <th class="py-2 px-4 border-b">地域名</th>
          <th class="py-2 px-4 border-b">緯度</th>
          <th class="py-2 px-4 border-b">経度</th>
          <th class="py-2 px-4 border-b">編集</th>
        </tr>
      </thead>
      <tbody>
        {#each $terrains as terrain}
          <tr>
            <td class="py-2 px-4 border-b">{terrain.name}</td>
            <td class="py-2 px-4 border-b">{terrain.region.name}</td>
            <td class="py-2 px-4 border-b">{terrain.latitude}</td>
            <td class="py-2 px-4 border-b">{terrain.longitude}</td>
            <td class="py-2 px-4 border-b text-center">
              <button
                class="bg-yellow-500 text-white p-2 rounded"
                on:click={() => openEditModal(terrain)}
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

