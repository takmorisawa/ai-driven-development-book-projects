<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { page } from '$app/stores';
  import { get } from 'svelte/store';
  import type { ProductWithRegion } from '$lib/type';

  let products = writable<ProductWithRegion[]>([]);
  let showModal = writable(false);
  let showEditModal = writable(false);
  let newProductName = '';
  let newProductionAmount = '';
  let newRanking = '';
  let newDescription = '';
  let newLatitude = '';
  let newLongitude = '';
  let newProductImage: File | null = null;
  let editProductId: string | null = null;
  let editProductName = '';
  let editProductionAmount = '';
  let editRanking = '';
  let editDescription = '';
  let editLatitude = '';
  let editLongitude = '';
  let editProductImage: File | null = null;

  $: regionId = parseInt(get(page).params.id, 10);

  const fetchProducts = async () => {
    const response = await fetch(`/api/products?regionId=${regionId}`);
    const data = await response.json();
    products.set(data);
  };

  const addProduct = async () => {
    const formData = new FormData();
    formData.append('name', newProductName);
    formData.append('regionId', regionId.toString());
    if (newProductionAmount) {
      formData.append('productionAmount', newProductionAmount);
    }
    if (newRanking) {
      formData.append('ranking', newRanking);
    }
    if (newDescription) {
      formData.append('description', newDescription);
    }
    if (newLatitude) {
      formData.append('latitude', newLatitude);
    }
    if (newLongitude) {
      formData.append('longitude', newLongitude);
    }
    if (newProductImage) {
      formData.append('image', newProductImage);
    }

    const response = await fetch('/admin/api/products', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      fetchProducts();
      showModal.set(false);
      newProductName = '';
      newProductionAmount = '';
      newRanking = '';
      newDescription = '';
      newLatitude = '';
      newLongitude = '';
      newProductImage = null;
      alert('名産品が追加されました');
    } else {
      console.error('Failed to add product');
    }
  };

  const editProduct = async () => {
    const formData = new FormData();
    if (editProductId) {
      formData.append('id', editProductId);
    }
    formData.append('name', editProductName);
    formData.append('regionId', regionId.toString());
    if (editProductionAmount) {
      formData.append('productionAmount', editProductionAmount);
    }
    if (editRanking) {
      formData.append('ranking', editRanking);
    }
    if (editDescription) {
      formData.append('description', editDescription);
    }
    if (editLatitude) {
      formData.append('latitude', editLatitude);
    }
    if (editLongitude) {
      formData.append('longitude', editLongitude);
    }
    if (editProductImage) {
      formData.append('image', editProductImage);
    }

    const response = await fetch('/admin/api/products', {
      method: 'PUT',
      body: formData,
    });

    if (response.ok) {
      fetchProducts();
      showEditModal.set(false);
      alert('名産品が更新されました');
    } else {
      console.error('Failed to edit product');
    }
  };

  const openEditModal = (product: ProductWithRegion) => {
    editProductId = product.id.toString();
    editProductName = product.name;
    editProductionAmount = product.productionAmount?.toString() || '';
    editRanking = product.ranking?.toString() || '';
    editDescription = product.description || '';
    editLatitude = product.latitude?.toString() || '';
    editLongitude = product.longitude?.toString() || '';
    editProductImage = null;
    showEditModal.set(true);
  };

  const handleFileChange = (e: Event, setImage: (file: File | null) => void) => {
    const target = e.target as HTMLInputElement;
    setImage(target.files?.[0] || null);
  };

  onMount(fetchProducts);
</script>

<div class="bg-gray-700 min-h-screen p-4">
  <a href="/admin/regions" class="text-blue-500 hover:underline mb-4 inline-block">← 地域一覧に戻る</a>
  <button
    class="bg-blue-500 text-white p-2 rounded float-right mb-4"
    on:click={() => showModal.set(true)}
  >
    新規名産品追加
  </button>

  {#if $showModal}
    <div class="fixed inset-0 bg-gray-700 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-gray-800 p-4 rounded shadow-lg w-1/3">
        <h2 class="text-xl mb-4 text-white">新規名産品追加</h2>
        <label class="block mb-2 text-white">
          名産品名:
          <input type="text" bind:value={newProductName} class="border p-2 w-full bg-gray-700 text-white" />
        </label>
        <label class="block mb-2 text-white">
          生産量:
          <input type="number" bind:value={newProductionAmount} class="border p-2 w-full bg-gray-700 text-white" />
        </label>
        <label class="block mb-2 text-white">
          ランキング:
          <input type="number" bind:value={newRanking} class="border p-2 w-full bg-gray-700 text-white" />
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
            on:change={(e) => handleFileChange(e, (file) => (newProductImage = file))}
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
          <button class="bg-blue-500 text-white p-2 rounded" on:click={addProduct}>追加</button>
        </div>
      </div>
    </div>
  {/if}

  {#if $showEditModal}
    <div class="fixed inset-0 bg-gray-700 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-gray-800 p-4 rounded shadow-lg w-1/3">
        <h2 class="text-xl mb-4 text-white">名産品情報編集</h2>
        <label class="block mb-2 text-white">
          名産品名:
          <input type="text" bind:value={editProductName} class="border p-2 w-full bg-gray-700 text-white" />
        </label>
        <label class="block mb-2 text-white">
          生産量:
          <input type="number" bind:value={editProductionAmount} class="border p-2 w-full bg-gray-700 text-white" />
        </label>
        <label class="block mb-2 text-white">
          ランキング:
          <input type="number" bind:value={editRanking} class="border p-2 w-full bg-gray-700 text-white" />
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
            on:change={(e) => handleFileChange(e, (file) => (editProductImage = file))}
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
          <button class="bg-blue-500 text-white p-2 rounded" on:click={editProduct}>保存</button>
        </div>
      </div>
    </div>
  {/if}

  {#if $products.length === 0}
    <p class="text-center text-gray-500">名産品が登録されていません</p>
  {:else}
    <table class="min-w-full bg-gray-800 text-white">
      <thead>
        <tr>
          <th class="py-2 px-4 border-b">名産品名</th>
          <th class="py-2 px-4 border-b">地域名</th>
          <th class="py-2 px-4 border-b">生産量</th>
          <th class="py-2 px-4 border-b">ランキング</th>
          <th class="py-2 px-4 border-b">編集</th>
        </tr>
      </thead>
      <tbody>
        {#each $products as product}
          <tr>
            <td class="py-2 px-4 border-b">{product.name}</td>
            <td class="py-2 px-4 border-b">{product.region.name}</td>
            <td class="py-2 px-4 border-b">{product.productionAmount || '-'}</td>
            <td class="py-2 px-4 border-b">{product.ranking || '-'}</td>
            <td class="py-2 px-4 border-b text-center">
              <button
                class="bg-yellow-500 text-white p-2 rounded"
                on:click={() => openEditModal(product)}
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

