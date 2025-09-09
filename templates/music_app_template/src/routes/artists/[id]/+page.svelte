<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import SongCard from '$lib/components/SongCard.svelte';

	let artist = null;
	let songs = [];
	let loading = true;
	let error = null;

	onMount(async () => {
		try {
			const artistId = $page.params.id;
			
			// アーティスト情報を取得
			const artistResponse = await fetch(`/api/artists?id=${artistId}`);
			if (!artistResponse.ok) {
				throw new Error('アーティスト情報の取得に失敗しました');
			}
			const artistData = await artistResponse.json();
			artist = artistData[0]; // 配列の最初の要素を取得

			// 曲情報を取得
			const songsResponse = await fetch(`/api/songs?artistId=${artistId}`);
			if (!songsResponse.ok) {
				throw new Error('曲情報の取得に失敗しました');
			}
			songs = await songsResponse.json();
			
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	});
</script>

<div class="bg-gray-700 min-h-screen p-6">
	{#if loading}
		<div class="text-white text-center">読み込み中...</div>
	{:else if error}
		<div class="text-red-500 text-center">エラー: {error}</div>
	{:else if artist}
		<!-- アーティスト情報セクション -->
		<div class="bg-gray-800 rounded-lg p-6 mb-8">
			<div class="flex items-start gap-6">
				<!-- アーティスト画像 -->
				<div class="flex-shrink-0">
					<img 
						src={artist.image || "/img/artist_default.webp"} 
						alt={artist.name}
						class="w-48 h-48 object-cover rounded-lg"
					/>
				</div>
				
				<!-- アーティスト情報 -->
				<div class="flex-1">
					<h1 class="text-white text-4xl font-bold mb-4">{artist.name}</h1>
					<p class="text-gray-300 text-lg leading-relaxed">{artist.profile}</p>
				</div>
			</div>
		</div>

		<!-- 曲一覧セクション -->
		<div>
			<h2 class="text-white text-2xl font-bold mb-6">曲一覧</h2>
			{#if songs.length > 0}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{#each songs as song}
						<SongCard {song} />
					{/each}
				</div>
			{:else}
				<div class="text-gray-300 text-center">このアーティストの曲はまだ登録されていません。</div>
			{/if}
		</div>
	{:else}
		<div class="text-white text-center">アーティストが見つかりませんでした。</div>
	{/if}
</div>
