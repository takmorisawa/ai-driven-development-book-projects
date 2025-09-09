<script>
	import { onMount } from 'svelte';
	import SongCard from '$lib/components/SongCard.svelte';
	import { favoriteIds } from '$lib/module/favorite';

	let favoriteSongs = [];
	let loading = true;

	// お気に入りの曲IDが変更されたときに曲データを取得
	$: if ($favoriteIds.length > 0) {
		fetchFavoriteSongs();
	} else {
		favoriteSongs = [];
		loading = false;
	}

	async function fetchFavoriteSongs() {
		if ($favoriteIds.length === 0) {
			favoriteSongs = [];
			loading = false;
			return;
		}

		try {
			loading = true;
			const songIdsParam = $favoriteIds.join(',');
			const response = await fetch(`/api/songs?songIds=${songIdsParam}`);
			
			if (response.ok) {
				favoriteSongs = await response.json();
			} else {
				console.error('お気に入り曲の取得に失敗しました');
				favoriteSongs = [];
			}
		} catch (error) {
			console.error('お気に入り曲の取得中にエラーが発生しました:', error);
			favoriteSongs = [];
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		// 初回読み込み時にお気に入りIDがない場合の処理
		if ($favoriteIds.length === 0) {
			loading = false;
		}
	});
</script>

<div class="bg-gray-700 min-h-screen">
	<div class="container mx-auto px-4 py-8">
		<h1 class="text-white text-3xl font-bold mb-8">お気に入り</h1>
		
		{#if loading}
			<div class="text-center py-16">
				<p class="text-gray-300 text-lg">読み込み中...</p>
			</div>
		{:else if favoriteSongs.length === 0}
			<div class="text-center py-16">
				<p class="text-gray-300 text-lg">お気に入りに追加されている曲はありません</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{#each favoriteSongs as song}
					<SongCard {song} />
				{/each}
			</div>
		{/if}
	</div>
</div>
