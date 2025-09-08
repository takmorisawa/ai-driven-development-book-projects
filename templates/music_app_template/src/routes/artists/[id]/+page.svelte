<script>
	import SongCard from '$lib/components/SongCard.svelte';

	// 仮のアーティスト情報
	const artist = {
		id: 1,
		name: "サンプルアーティスト",
		profile: "これはサンプルアーティストのプロフィールです。素晴らしい音楽を作り続けているアーティストで、多くのファンに愛されています。",
		imagePath: "/img/artist_default.webp"
	};

	// 仮の曲一覧
	const songs = [
		{
			id: 1,
			title: "サンプル曲1",
			imagePath: "/img/song_default.webp",
			audioPath: "/audio/sample1.mp3",
			artist: artist
		},
		{
			id: 2,
			title: "サンプル曲2",
			imagePath: "/img/song_default.webp",
			audioPath: "/audio/sample2.mp3",
			artist: artist
		},
		{
			id: 3,
			title: "サンプル曲3",
			imagePath: "/img/song_default.webp",
			audioPath: "/audio/sample3.mp3",
			artist: artist
		}
	];
</script>

<div class="bg-gray-700 min-h-screen p-6">
	<!-- アーティスト情報セクション -->
	<div class="bg-gray-800 rounded-lg p-6 mb-8">
		<div class="flex items-start gap-6">
			<!-- アーティスト画像 -->
			<div class="flex-shrink-0">
				<img 
					src={artist.imagePath} 
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
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{#each songs as song}
				<SongCard {song} />
			{/each}
		</div>
	</div>
</div>
