<script>
	export let artist;
</script>

<div class="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
	<!-- アーティスト画像 -->
	<div class="mb-3">
		<img 
			src={artist.image ? `/uploads/${artist.image}` : '/img/artist_default.webp'} 
			alt={artist.name}
			class="w-full h-48 object-cover rounded-lg"
		/>
	</div>
	
	<!-- アーティスト名 -->
	<div class="text-center">
		<a 
			href="/artists/{artist.id}" 
			class="text-white font-semibold text-lg hover:text-gray-300 transition-colors"
		>
			{artist.name}
		</a>
	</div>
</div>
