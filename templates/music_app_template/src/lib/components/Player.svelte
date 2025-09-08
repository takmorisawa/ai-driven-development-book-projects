<div class="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4">
	<div class="flex items-center justify-between">
		<!-- 曲情報（左） -->
		<div class="flex items-center space-x-3">
			<img 
				src="/img/song_default.webp" 
				alt="アルバムアート" 
				class="w-16 h-16 rounded"
			/>
			<div>
				<div class="font-bold text-lg">曲名</div>
				<div class="text-sm text-gray-300">アーティスト名</div>
			</div>
		</div>

		<!-- 再生コントロール（中央） -->
		<div class="flex items-center space-x-4">
			<button class="bg-white text-gray-800 rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors">
				<!-- 再生アイコン -->
				<svg class="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
					<path d="M8 5v14l11-7z"/>
				</svg>
			</button>
			
			<!-- 進行バー -->
			<div class="flex items-center space-x-2">
				<span class="text-sm">0:00</span>
				<div class="w-40 h-1 bg-gray-600 rounded">
					<div class="h-1 bg-white rounded" style="width: 0%"></div>
				</div>
				<span class="text-sm">0:00</span>
			</div>
		</div>

		<!-- 音量コントロール（右） -->
		<div class="flex items-center space-x-2">
			<!-- スピーカーアイコン -->
			<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
				<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
			</svg>
			<input 
				type="range" 
				min="0" 
				max="100" 
				value="50" 
				class="w-20 h-1 bg-gray-600 rounded appearance-none slider"
			/>
		</div>
	</div>
</div>

<style>
	.slider::-webkit-slider-thumb {
		appearance: none;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: white;
		cursor: pointer;
	}
	
	.slider::-moz-range-thumb {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: white;
		cursor: pointer;
		border: none;
	}
</style>
