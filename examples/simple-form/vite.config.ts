import { resolve } from 'path';
import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';
import react from '@vitejs/plugin-react';

import { generateFormSchemaVitePlugin } from 'ts-dynamic-forms/dist/plugins';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    commonjs(),
    // @ts-expect-error
    generateFormSchemaVitePlugin(
      resolve(__dirname, './src/dynamic-form-schema.ts'),
      resolve(__dirname, './src/generated-form-schema.json')
    ),
  ],
  assetsInclude: ['**/*.node'],
  optimizeDeps: {
    exclude: ['@swc/wasm', '@swc/core-darwin-arm64', 'fsevents'],
    include: ['ts-dynamic-forms'],
  },
});
