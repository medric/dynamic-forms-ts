import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

import { generateFormSchemaVitePlugin } from '../../packages/plugins/generate-form-schema-vite-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), generateFormSchemaVitePlugin()],
  resolve: {
    alias: {
      '~renderers': path.resolve(__dirname, '../../packages/renderers'),
      '~core': path.resolve(__dirname, '../../packages/core'),
    },
  },
});
