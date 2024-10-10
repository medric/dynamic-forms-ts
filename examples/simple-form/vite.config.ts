import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

import { generateFormSchemaPlugin } from '../../packages/plugins/vite-plugin-generate-form-schema';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), generateFormSchemaPlugin()],
  resolve: {
    alias: {
      '~renderers': path.resolve(__dirname, '../../packages/renderers'),
    },
  },
});
