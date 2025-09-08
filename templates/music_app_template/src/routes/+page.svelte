<script>
	import SongCard from '$lib/components/SongCard.svelte';
	import ArtistCard from '$lib/components/ArtistCard.svelte';

	// 仮のアーティストデータ
	const artists = [
		{
			id: 1,
			name: 'サクラ・ハルカ',
			image: null,
			profile: '春の桜をテーマにした楽曲で人気のアーティスト'
		},
		{
			id: 2,
			name: 'ムーンライト・エコー',
			image: null,
			profile: '夜の静寂を歌声で表現するシンガーソングライター'
		},
		{
			id: 3,
			name: 'オーシャン・ブルー',
			image: null,
			profile: '海をイメージした爽やかなサウンドが特徴'
		}
	];

	// 仮の曲データ（アーティスト情報を含む）
	const songs = [
		{
			id: 1,
			title: '桜舞い散る道',
			imagePath: null,
			audioPath: '/audio/sample1.mp3',
			artist: {
				id: 1,
				name: 'サクラ・ハルカ'
			}
		},
		{
			id: 2,
			title: '月夜のセレナーデ',
			imagePath: null,
			audioPath: '/audio/sample2.mp3',
			artist: {
				id: 2,
				name: 'ムーンライト・エコー'
			}
		},
		{
			id: 3,
			title: '青い海の向こう',
			imagePath: null,
			audioPath: '/audio/sample3.mp3',
			artist: {
				id: 3,
				name: 'オーシャン・ブルー'
			}
		},
		{
			id: 4,
			title: '春風のメロディ',
			imagePath: null,
			audioPath: '/audio/sample4.mp3',
			artist: {
				id: 1,
				name: 'サクラ・ハルカ'
			}
		}
	];
</script>

<div class="bg-gray-700 min-h-screen">
	<div class="container mx-auto px-4 py-8">
		<!-- アーティスト一覧セクション -->
		<section class="mb-12">
			<h2 class="text-white text-3xl font-bold mb-6">アーティスト</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each artists as artist}
					<ArtistCard {artist} />
				{/each}
			</div>
		</section>

		<!-- 曲一覧セクション -->
		<section>
			<h2 class="text-white text-3xl font-bold mb-6">楽曲</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{#each songs as song}
					<SongCard {song} />
				{/each}
			</div>
		</section>
	</div>
</div>
