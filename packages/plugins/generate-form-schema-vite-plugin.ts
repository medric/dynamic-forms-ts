import { writeFileSync, watch } from 'fs';
import path from 'path';
import type { ViteDevServer } from 'vite';

import { DynamicFormParser } from '../core/dynamic-form-parser';

const DEFAULT_SCHEMA_FILE_PATH = 'dynamic-form-ts-schema.ts';
const DEFAULT_OUTPUT_FILE_PATH = 'src/generated-form-schema.json';

export function generateFormSchemaVitePlugin(
  schemaFilePath: string,
  outputFilePath: string
) {
  return {
    name: 'generate-form-schema-plugin',

    configureServer(server: ViteDevServer) {
      const currentDir = process.cwd();
      const tsSchemaPath =
        schemaFilePath ?? path.resolve(currentDir, DEFAULT_SCHEMA_FILE_PATH);

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
        schemaFilePath ?? path.resolve(currentDir, DEFAULT_SCHEMA_FILE_PATH);

      const dynamicFormParser = new DynamicFormParser({
        filename: tsSchemaPath,
      });

      const data = await dynamicFormParser.parse();

      const filePath =
        outputFilePath ?? path.resolve(currentDir, DEFAULT_OUTPUT_FILE_PATH);

      // Write the JSON file to the specified path
      writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Generated JSON file at: ${filePath}`);
    },
  };
}
