<script>
	import { page } from '$app/stores';
</script>

<header class="bg-gray-800 text-white p-4">
	<div class="container mx-auto flex items-center justify-between">
		<!-- ロゴ -->
		<a href="/" class="text-2xl hover:text-gray-300 transition-colors">
			🚀
		</a>

		<!-- グローバルナビゲーションメニュー -->
		<nav>
			<ul class="flex space-x-6">
				<li>
					<a 
						href="/" 
						class="hover:text-gray-300 transition-colors {$page.url.pathname === '/' ? 'text-white font-semibold' : 'text-gray-300'}"
					>
						ホーム
					</a>
				</li>
				<li>
					<a 
						href="/favorite" 
						class="hover:text-gray-300 transition-colors {$page.url.pathname === '/favorite' ? 'text-white font-semibold' : 'text-gray-300'}"
					>
						お気に入り
					</a>
				</li>
			</ul>
		</nav>
	</div>
</header>
