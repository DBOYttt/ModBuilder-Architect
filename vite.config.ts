import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Base path for GitHub Pages deployment
  base: '/ModBuilder-Architect/',
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('@react-three/drei')) {
            return 'r3f-drei';
          }

          if (id.includes('@react-three/fiber')) {
            return 'r3f-fiber';
          }

          if (id.includes('three-stdlib')) {
            return 'three-stdlib';
          }

          if (id.includes('/three/examples/')) {
            return 'three-examples';
          }

          if (id.includes('/three/')) {
            return 'three-core';
          }

          if (id.includes('react')) {
            return 'react-vendor';
          }

          return 'vendor';
        },
      },
    },
  }
});
