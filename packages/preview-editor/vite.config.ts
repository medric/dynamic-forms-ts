import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: '../../node_modules/@swc/wasm-web/*.wasm',
          dest: './node_modules/.vite/deps',
        },
      ],
    }),
  ],
  // WebAssembly handling options
  build: {
    target: 'esnext',
    assetsInlineLimit: 0, // Ensure Wasm files are not inlined
    rollupOptions: {
      external: ['fs'],
    },
  },
  resolve: {
    alias: {
      '~ui': path.resolve(__dirname, '../../packages/ui'),
      '~core': path.resolve(__dirname, '../../packages/core'),
      '~utils': path.resolve(__dirname, '../../packages/utils'),
    },
  },
  optimizeDeps: {
    exclude: ['@swc/core-darwin-arm64'],
  },
});
