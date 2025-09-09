<script lang="ts">
	import { onMount } from 'svelte';
	import SongCard from '$lib/components/SongCard.svelte';
	import ArtistCard from '$lib/components/ArtistCard.svelte';
	import type { Artist } from '@prisma/client';
	import type { SongWithArtist } from '$lib/type';

	let artists: Artist[] = [];
	let songs: SongWithArtist[] = [];

	// アーティスト情報を取得する関数
	const fetchArtists = async () => {
		try {
			const response = await fetch('/api/artists');
			if (response.ok) {
				artists = await response.json();
			} else {
				console.error('アーティスト情報の取得に失敗しました');
			}
		} catch (error) {
			console.error('アーティスト情報の取得中にエラーが発生しました:', error);
		}
	};

	// 曲情報を取得する関数
	const fetchSongs = async () => {
		try {
			const response = await fetch('/api/songs');
			if (response.ok) {
				songs = await response.json();
			} else {
				console.error('曲情報の取得に失敗しました');
			}
		} catch (error) {
			console.error('曲情報の取得中にエラーが発生しました:', error);
		}
	};

	// コンポーネントがマウントされた時にアーティスト情報と曲情報を取得
	onMount(() => {
		fetchArtists();
		fetchSongs();
	});
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
