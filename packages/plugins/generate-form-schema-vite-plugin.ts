import { writeFileSync } from 'fs';
import type { PluginOption } from 'vite';
import { DynamicFormNodeParser } from '../core/parsers/swc/dynamic-form-node-parser';

export function generateFormSchemaVitePlugin(
  schemaFilePath: string,
  outputFormJsonFilePath: string
): PluginOption {
  if (!schemaFilePath) {
    console.error(
      'Please provide a schema file path. Using default schema file path.'
    );
  }

  async function regenerateFormSchema() {
    const dynamicFormParser = new DynamicFormNodeParser({
      formSchemaTypeDefinitionsFile: schemaFilePath,
    });

    try {
      const data = await dynamicFormParser.parse();

      // Write the JSON file to the specified path
      writeFileSync(
        outputFormJsonFilePath,
        JSON.stringify(data, null, 2),
        'utf-8'
      );
      console.log(`Generated JSON file at: ${outputFormJsonFilePath}`);
    } catch (error) {
      console.error('Error generating form schema:', error);
    }
  }

  return {
    name: 'generate-form-schema-vite-plugin',

    async watchChange(id: string) {
      if (id === schemaFilePath) {
        console.log(
          `Detected change in ${schemaFilePath}, regenerating form schema...`
        );
        await regenerateFormSchema();
      }
    },

    // Hook into the Vite build process
    async buildStart() {
      await regenerateFormSchema();
    },
  };
}
