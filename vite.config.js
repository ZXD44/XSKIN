import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
  const isVercel = Boolean(process.env.VERCEL);
  const base = isVercel ? '/' : (command === 'serve' ? '/' : './');

  return {
    base,
    server: {
      port: 3000,
      host: true
    },
    build: {
      outDir: 'dist',
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            skinview3d: ['skinview3d'],
            jszip: ['jszip', 'file-saver']
          }
        }
      }
    }
  };
});
