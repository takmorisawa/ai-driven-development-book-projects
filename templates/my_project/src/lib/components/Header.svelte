<script lang="ts">
  import { goto } from '$app/navigation';
</script>

<header class="bg-gray-800 text-white p-4">
  <div class="container mx-auto flex items-center justify-between">
    <a href="/" class="text-2xl font-bold cursor-pointer" on:click={() => goto('/')}>
      🗾
    </a>
    <nav class="flex gap-4">
      <a href="/" class="hover:text-gray-300">ホーム</a>
      <a href="/travel-plan" class="hover:text-gray-300">旅行プラン</a>
    </nav>
  </div>
</header>

