#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();

const { spawn } = require('node:child_process');

program
  .name('dynamic-forms-ts')
  .description('CLI for generating dynamic forms')
  .version('0.1.0');

function runPreviewEditor() {
  try {
    // Run vite app in packages/preview
    const install = spawn('npm', ['install'], {
      cwd: 'packages/preview-editor',
    });

    // @todo: run local prod build instead
    const run = spawn('npx', ['npm run dev'], {
      cwd: 'packages/preview-editor',
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
  } catch (error) {
    console.error(error);
  }
}

program
  .command('preview-editor')
  .description('Run the form editor')
  .action(runPreviewEditor);

program.parse();
