<script lang="ts">
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { page } from '$app/stores';
    import type { Song } from '@prisma/client';

    let songs = writable<Song[]>([]);
    let showModal = writable(false);
    let showEditModal = writable(false);
    let newSongTitle = '';
    let newSongAudio: File | null = null;
    let newSongImage: File | null = null;
    let editSongId: string | null = null;
    let editSongTitle = '';
    let editSongAudio: File | null = null;
    let editSongImage: File | null = null;
    let artistId: string;

    $: artistId = $page.params.id;

    const fetchSongs = async () => {
        const response = await fetch(`/api/songs?artistId=${artistId}`);
        const data = await response.json();
        songs.set(data);
    };

    const addSong = async () => {
        const formData = new FormData();
        formData.append('title', newSongTitle);
        formData.append('artistId', artistId);
        if (newSongAudio) {
            formData.append('audio', newSongAudio);
        }
        if (newSongImage) {
            formData.append('image', newSongImage);
        }

        const response = await fetch('/admin/api/songs', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            fetchSongs();
            showModal.set(false);
            newSongTitle = '';
            newSongAudio = null;
            newSongImage = null;
            alert('曲が追加されました');
        } else {
            console.error('Failed to add song');
        }
    };

    const editSong = async () => {
        const formData = new FormData();
        if (editSongId) {
            formData.append('id', editSongId);
        }
        formData.append('title', editSongTitle);
        formData.append('artistId', artistId);
        if (editSongAudio) {
            formData.append('audio', editSongAudio);
        }
        if (editSongImage) {
            formData.append('image', editSongImage);
        }

        const response = await fetch('/admin/api/songs', {
            method: 'PUT',
            body: formData
        });

        if (response.ok) {
            fetchSongs();
            showEditModal.set(false);
            alert('曲情報が更新されました');
        } else {
            console.error('Failed to edit song');
        }
    };

    const openEditModal = (song: Song) => {
        editSongId = song.id.toString();
        editSongTitle = song.title;
        editSongAudio = null;
        editSongImage = null;
        showEditModal.set(true);
    };

    const handleFileChange = (e: Event, setFile: (file: File | null) => void) => {
        const target = e.target as HTMLInputElement;
        setFile(target.files?.[0] || null);
    };

    onMount(fetchSongs);
</script>

<button class="bg-blue-500 text-white p-2 rounded float-right mb-4" on:click={() => showModal.set(true)}>新規曲追加</button>

{#if $showModal}
    <div class="fixed inset-0 bg-gray-700 bg-opacity-75 flex items-center justify-center">
        <div class="bg-white p-4 rounded shadow-lg w-1/3">
            <h2 class="text-xl mb-4">新規曲追加</h2>
            <label class="block mb-2">
                曲名:
                <input type="text" bind:value={newSongTitle} class="border p-2 w-full" />
            </label>
            <label class="block mb-2">
                音声ファイル:
                <input type="file" accept="audio/*" on:change={(e) => handleFileChange(e, (file) => newSongAudio = file)} class="border p-2 w-full" />
            </label>
            <label class="block mb-4">
                曲画像:
                <input type="file" accept="image/*" on:change={(e) => handleFileChange(e, (file) => newSongImage = file)} class="border p-2 w-full" />
            </label>
            <div class="flex justify-end">
                <button class="bg-gray-500 text-white p-2 rounded mr-2" on:click={() => showModal.set(false)}>キャンセル</button>
                <button class="bg-blue-500 text-white p-2 rounded" on:click={addSong}>追加</button>
            </div>
        </div>
    </div>
{/if}

{#if $showEditModal}
    <div class="fixed inset-0 bg-gray-700 bg-opacity-75 flex items-center justify-center">
        <div class="bg-white p-4 rounded shadow-lg w-1/3">
            <h2 class="text-xl mb-4">曲情報編集</h2>
            <label class="block mb-2">
                曲名:
                <input type="text" bind:value={editSongTitle} class="border p-2 w-full" />
            </label>
            <label class="block mb-2">
                音声ファイル:
                <input type="file" accept="audio/*" on:change={(e) => handleFileChange(e, (file) => editSongAudio = file)} class="border p-2 w-full" />
            </label>
            <label class="block mb-4">
                曲画像:
                <input type="file" accept="image/*" on:change={(e) => handleFileChange(e, (file) => editSongImage = file)} class="border p-2 w-full" />
            </label>
            <div class="flex justify-end">
                <button class="bg-gray-500 text-white p-2 rounded mr-2" on:click={() => showEditModal.set(false)}>キャンセル</button>
                <button class="bg-blue-500 text-white p-2 rounded" on:click={editSong}>保存</button>
            </div>
        </div>
    </div>
{/if}

{#if $songs.length === 0}
    <p class="text-center text-gray-500">曲が登録されていません</p>
{:else}
    <table class="min-w-full bg-white">
        <thead>
            <tr>
                <th class="py-2 px-4 border-b">曲名</th>
                <th class="py-2 px-4 border-b">アートワーク</th>
                <th class="py-2 px-4 border-b">再生プレビュー</th>
                <th class="py-2 px-4 border-b">編集</th>
            </tr>
        </thead>
        <tbody>
            {#each $songs as song}
                <tr>
                    <td class="py-2 px-4 border-b">{song.title}</td>
                    <td class="py-2 px-4 border-b">
                        {#if song.image}
                            <img src={song.image} alt={song.title} class="h-16 w-16 object-cover rounded" />
                        {:else}
                            <div class="h-16 w-16 bg-gray-200 rounded flex items-center justify-center">
                                <span class="text-gray-500 text-xs">画像なし</span>
                            </div>
                        {/if}
                    </td>
                    <td class="py-2 px-4 border-b">
                        <audio controls class="w-full">
                            <source src={song.audio} type="audio/mpeg">
                            お使いのブラウザは音声再生をサポートしていません。
                        </audio>
                    </td>
                    <td class="py-2 px-4 border-b text-center">
                        <button class="bg-yellow-500 text-white p-2 rounded" on:click={() => openEditModal(song)}>編集</button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
{/if}
