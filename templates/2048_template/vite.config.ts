import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	ssr: {
		noExternal: ['@prisma/client']
	},
	optimizeDeps: {
		exclude: ['@prisma/client']
	},
	define: {
		global: 'globalThis'
	}
});
