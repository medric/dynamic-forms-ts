import { writeFileSync, watch } from 'fs';
import path from 'path';
import type { PluginOption, ViteDevServer } from 'vite';
import { DynamicFormNodeParser } from '../core/parsers/swc/dynamic-form-node-parser';

const DEFAULT_SCHEMA_FILE_PATH = './dynamic-form-ts-schema.ts';
const DEFAULT_OUTPUT_FORM_JSON_FILE_PATH =
  './.dynamic-forms-ts/output/form-schema.json';

export function generateFormSchemaVitePlugin(
  schemaFilePath: string = path.resolve(
    process.cwd(),
    DEFAULT_SCHEMA_FILE_PATH
  ),
  outputFormJsonFilePath: string = path.resolve(
    process.cwd(),
    DEFAULT_OUTPUT_FORM_JSON_FILE_PATH
  )
): PluginOption {
  return {
    name: 'generate-form-schema-vite-plugin',

    configureServer(server: ViteDevServer) {
      watch(schemaFilePath, () => {
        // Trigger server reload when the file changes
        console.log(`${schemaFilePath} has changed. Reloading...`);
        server.restart(); // Vite's restart function to trigger the plugin again
      });
    },

    // Hook into the Vite build process
    async buildStart() {
      const currentDir = process.cwd();
      console.log('Generating form schema...', currentDir);

      const dynamicFormParser = new DynamicFormNodeParser({
        formSchemaTypeDefinitionsFile: schemaFilePath,
      });

      try {
        const data = await dynamicFormParser.parse();

        const filePath =
          outputFormJsonFilePath ??
          path.resolve(currentDir, DEFAULT_OUTPUT_FORM_JSON_FILE_PATH);

        // Write the JSON file to the specified path
        writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`Generated JSON file at: ${filePath}`);
      } catch (error) {
        console.error('Error generating form schema:', error);
      }
    },
  };
}
