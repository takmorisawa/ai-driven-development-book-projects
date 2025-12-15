<script>
  let secretKey = '';

  import { page } from '$app/stores';
  const errorMessage = $page.url.searchParams.get('error') || '';
  
</script>

<div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg border-2 border-orange-200">
  <h1 class="text-2xl font-bold text-orange-600 mb-6 text-center">まなび旅マップ - 管理画面</h1>
  {#if errorMessage}
    <div class="mb-4 text-red-500 bg-red-50 p-3 rounded border border-red-200">{errorMessage}</div>
  {/if}
  <form method="POST" >
    <div class="mb-4">
      <label for="secretKey" class="block text-sm font-medium text-gray-700 mb-2">シークレットキー</label>
      <input type="password" id="secretKey" name="key" bind:value={secretKey} class="mt-1 p-2 w-full border-2 border-orange-200 rounded bg-white text-gray-800 focus:border-orange-400 focus:outline-none" required>
    </div>
    <button type="submit" class="w-full bg-orange-400 text-white p-2 rounded hover:bg-orange-500 transition-colors font-semibold shadow-sm">ログイン</button>
  </form>
</div>