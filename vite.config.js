import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Remove or comment out the build.rollupOptions.external configuration
  // build: {
  //   rollupOptions: {
  //     external: ['dom-to-image'],  
  //   },
  // },
});
