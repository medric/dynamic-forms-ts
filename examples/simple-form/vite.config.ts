import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { generateFormSchemaVitePlugin } from 'dynamic-forms-ts/dist/plugins/generate-form-schema-vite-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), generateFormSchemaVitePlugin()],
  optimizeDeps: { include: ['dynamic-forms-ts'] },
});
