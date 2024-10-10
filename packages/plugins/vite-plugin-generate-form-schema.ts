import { writeFileSync, watch } from 'fs';
import path from 'path';
import { ViteDevServer } from 'vite';

import { DynamicForm } from '../core/dynamic-form';

export function generateFormSchemaPlugin() {
  return {
    name: 'generate-form-schema-plugin',

    configureServer(server: ViteDevServer) {
      const currentDir = process.cwd();
      const tsSchemaPath =
        process.env.TS_SCHEMA_PATH ?? path.resolve(currentDir, 'schema.ts');

      watch(tsSchemaPath, () => {
        // Trigger server reload when the file changes
        console.log(`${tsSchemaPath} has changed. Reloading...`);
        server.restart(); // Vite's restart function to trigger the plugin again
      });
    },

    // Hook into the Vite build process
    async buildStart() {
      const currentDir = process.cwd();
      console.log('Generating form schema...', currentDir);
      const tsSchemaPath =
        process.env.TS_SCHEMA_PATH ?? path.resolve(currentDir, 'schema.ts');

      const dynamicForm = new DynamicForm({
        filename: tsSchemaPath,
      });

      const data = await dynamicForm.parse();

      const filePath = path.resolve(
        currentDir,
        'src/generated-form-schema.json'
      ); // Path to the JSON file in the public folder

      // Write the JSON file to the specified path
      writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Generated JSON file at: ${filePath}`);
    },
  };
}
