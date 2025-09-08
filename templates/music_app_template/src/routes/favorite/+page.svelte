<script>
	import SongCard from '$lib/components/SongCard.svelte';

	// 仮のお気に入り曲データ
	const favoriteSongs = [
		{
			id: 1,
			title: "夜空の星",
			imagePath: "/img/song_default.webp",
			artist: {
				id: 1,
				name: "星野アーティスト"
			}
		},
		{
			id: 2,
			title: "青い海",
			imagePath: "/img/song_default.webp",
			artist: {
				id: 2,
				name: "海野ミュージシャン"
			}
		},
		{
			id: 3,
			title: "風のうた",
			imagePath: "/img/song_default.webp",
			artist: {
				id: 3,
				name: "風田サウンド"
			}
		}
	];

	// お気に入りが空の場合のテスト用（コメントアウトを外すとテストできます）
	// const favoriteSongs = [];
</script>

<div class="bg-gray-700 min-h-screen">
	<div class="container mx-auto px-4 py-8">
		<h1 class="text-white text-3xl font-bold mb-8">お気に入り</h1>
		
		{#if favoriteSongs.length === 0}
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
