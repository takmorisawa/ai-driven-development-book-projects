<script lang="ts">
	import { favoriteIds, addToFavorite, removeFromFavorite } from '$lib/module/favorite';
	import { playSong, stopSong, isPlaying, currentSong } from '$lib/module/player';
	import type { SongWithArtist } from '$lib/type';
	
	export let song: SongWithArtist;
	
	$: isFavorite = $favoriteIds.includes(song.id);
	$: isThisSongPlaying = $isPlaying && $currentSong?.id === song.id;
	
	function handleFavoriteToggle() {
		if (isFavorite) {
			removeFromFavorite(song.id);
			alert('お気に入りから削除しました');
		} else {
			addToFavorite(song.id);
			alert('お気に入りに追加しました');
		}
	}
	
	function handlePlayToggle() {
		if (isThisSongPlaying) {
			stopSong();
		} else {
			playSong(song);
		}
	}
</script>

<div class="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
	<!-- アートワーク -->
	<div class="mb-3">
		<img 
			src={song.image ? (song.image.startsWith('/') ? song.image : `/${song.image}`) : "/img/song_default.webp"} 
			alt={song.title}
			class="w-full h-48 object-cover rounded-lg"
		/>
	</div>

	<!-- 曲名とアーティスト名と再生数 -->
	<div class="mb-4">
		<h3 class="text-white font-bold text-lg mb-1 truncate">{song.title}</h3>
		<p class="text-gray-300 text-sm truncate mb-1">
			<a href="/artists/{song.artist.id}" class="hover:text-white transition-colors">
				{song.artist.name}
			</a>
		</p>
		<p class="text-gray-400 text-xs">再生数: {song.playCount}回</p>
	</div>

	<!-- 再生ボタンとお気に入り追加ボタン -->
	<div class="flex items-center justify-between">
		<!-- 再生ボタン -->
		<button 
			on:click={handlePlayToggle}
			class="bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
		>
			{#if isThisSongPlaying}
				<!-- 一時停止アイコン -->
				<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
					<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
				</svg>
			{:else}
				<!-- 再生アイコン -->
				<svg class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
					<path d="M8 5v14l11-7z"/>
				</svg>
			{/if}
		</button>

		<!-- お気に入り追加ボタン -->
		<button 
			on:click={handleFavoriteToggle}
			class="text-gray-300 hover:text-red-500 transition-colors"
			class:text-red-500={isFavorite}
		>
			<svg class="w-6 h-6" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
			</svg>
		</button>
	</div>
</div>
