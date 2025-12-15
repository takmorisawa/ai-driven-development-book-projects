<script lang="ts">
  import { goto } from '$app/navigation';
</script>

<header class="bg-orange-400 text-white p-4 shadow-md">
  <div class="container mx-auto flex items-center justify-between">
    <a href="/" class="text-2xl font-bold cursor-pointer flex items-center gap-2 hover:opacity-90 transition-opacity" on:click={() => goto('/')}>
      <span>🗾</span>
      <span>まなび旅マップ</span>
    </a>
    <nav class="flex gap-4">
      <a href="/" class="hover:text-orange-100 transition-colors">ホーム</a>
      <a href="/travel-plan" class="hover:text-orange-100 transition-colors">旅行プラン</a>
    </nav>
  </div>
</header>

