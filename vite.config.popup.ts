import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],  // Enable React support
  build: {
    emptyOutDir: false,  // Prevent Vite from clearing the dist folder
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),  // Content script entry point
      output: {
        format: 'iife',
        entryFileNames: 'popup.js',
        dir: 'dist',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
