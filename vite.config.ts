import { defineConfig } from 'vite';

export default defineConfig({
  // Caminhos relativos: funciona em GitHub Pages, Netlify e Cloudflare Pages.
  base: './',
  server: { port: 5173, open: false },
  build: {
    target: 'es2022',
    outDir: 'dist',
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: { phaser: ['phaser'] },
      },
    },
  },
});
