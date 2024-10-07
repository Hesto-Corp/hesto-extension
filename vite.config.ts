import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        // Define index.html as the entry point for the popup
        popup: resolve(__dirname, 'index.html'),

        // Define background and content scripts for Chrome Extension
        background: resolve(__dirname, 'src/scripts/background.ts'),
        content: resolve(__dirname, 'src/scripts/content.ts'),
      },
      output: {
        entryFileNames: '[name].js',
      }
    },
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
