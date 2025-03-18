import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  base: './',  // Ensure base path is correct for deployment
  build: {
    outDir: 'frontend/dist',  // Ensure the output directory is correct
  },
});
