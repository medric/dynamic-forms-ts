#!/usr/bin/env node

const fs = require('fs');
const { Command } = require('commander');
const program = new Command();

const DynamicFormNodeParser =
  require('../dist/core/parsers/swc/dynamic-form-node-parser').DynamicFormNodeParser;

const { spawn } = require('node:child_process');

program
  .name('dynamic-forms-ts')
  .description('CLI for generating dynamic forms')
  .version('0.1.0');

function runPreviewEditor() {
  try {
    // Run vite app in packages/preview
    const install = spawn('npm', ['install'], {
      cwd: './packages/preview-editor',
    });

    // @todo: run local prod build instead
    const run = spawn('npx', ['npm run dev'], {
      cwd: './packages/preview-editor',
      shell: true,
    });

    console.log('Starting form editor...');

    [install, run].forEach((child) => {
      child.stdout.on('data', (data) => {
        console.log(data.toString());
      });

      child.stderr.on('data', (data) => {
        console.error(data.toString());
      });

      child.on('close', (code) => {
        if (code !== 0) {
          console.error(`child process exited with code ${code}`);
        }
      });
    });

    // Handle keyboard interrupt to kill the child process
    process.on('SIGINT', () => {
      console.log('Shutting down form editor...');
      run.kill();
      process.exit(0);
    });
  } catch (error) {
    console.error(error);
  }
}

async function compileForm(
  formSchemaTypeDefinitionsFile,
  outputFormJsonFilePath
) {
  try {
    console.log('Compiling form...', formSchemaTypeDefinitionsFile);
    // Validate output file path
    if (!outputFormJsonFilePath.endsWith('.json')) {
      console.error('Output file must be a JSON file');
      return;
    }

    const outputDirectory = outputFormJsonFilePath
      .split('/')
      .slice(0, -1)
      .join('/');

    const dynamicFormNodeParser = new DynamicFormNodeParser({
      formSchemaTypeDefinitionsFile,
    });

    const formSchema = await dynamicFormNodeParser.parse();

    // Write form schema to file into output directory
    // Ensure output directory exists
    fs.mkdirSync(outputDirectory, { recursive: true });

    fs.writeFileSync(
      outputFormJsonFilePath,
      JSON.stringify(formSchema, null, 2)
    );
  } catch (error) {
    console.error(error);
  }
}

program
  .command('preview-editor')
  .description('Run the form editor')
  .action(runPreviewEditor);

program
  .command('compile-form')
  .argument(
    '<formSchemaTypeDefinitionsFile>',
    'Form schema type definitions file'
  )
  .argument(
    '[outputFormJsonFilePath]',
    'Output file',
    './.dynamic-forms-ts/output/form-schema.json'
  )
  .description('Compile form')
  .action(compileForm);

program.parse();
