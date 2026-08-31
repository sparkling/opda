#!/usr/bin/env node

import { NOTEBOOK_CONFIG_PATHS } from './lib/notebooklm-preparation.mjs';
import { executeNotebook } from './lib/notebooklm-execution.mjs';

function parseArguments(argv) {
  const options = {
    configPaths: [], profile: 'personal', concurrency: 4, notebookConcurrency: 3,
    uploadOnly: false, promptsOnly: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--config') options.configPaths.push(argv[++index]);
    else if (argument === '--profile') options.profile = argv[++index];
    else if (argument === '--concurrency') options.concurrency = Number(argv[++index]);
    else if (argument === '--notebook-concurrency') options.notebookConcurrency = Number(argv[++index]);
    else if (argument === '--upload-only') options.uploadOnly = true;
    else if (argument === '--prompts-only') options.promptsOnly = true;
    else if (argument === '--help' || argument === '-h') options.help = true;
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (options.uploadOnly && options.promptsOnly) throw new Error('Choose at most one of --upload-only and --prompts-only');
  if (!Number.isInteger(options.concurrency) || options.concurrency < 1 || options.concurrency > 8) {
    throw new Error('--concurrency must be an integer from 1 to 8');
  }
  if (!Number.isInteger(options.notebookConcurrency) || options.notebookConcurrency < 1 || options.notebookConcurrency > 6) {
    throw new Error('--notebook-concurrency must be an integer from 1 to 6');
  }
  if (!options.profile) throw new Error('--profile requires a value');
  return options;
}

function usage() {
  return [
    'Privately ingest the approved NotebookLM manifests and execute preparation prompts.',
    '',
    'Usage: node scripts/run-notebooklm-preparation.mjs [options]',
    '  --config PATH       Execute one config (repeatable; defaults to all six)',
    '  --profile NAME      Authenticated nlm profile (default: personal)',
    '  --concurrency N     Parallel source uploads, 1-8 (default: 4)',
    '  --notebook-concurrency N  Parallel notebook chains, 1-6 (default: 3)',
    '  --upload-only       Stop after verified source ingestion',
    '  --prompts-only      Require complete ingestion and run prompts only',
  ].join('\n');
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) { process.stdout.write(`${usage()}\n`); return; }
  const configPaths = options.configPaths.length ? options.configPaths : NOTEBOOK_CONFIG_PATHS;
  const results = Array(configPaths.length);
  const failures = [];
  let cursor = 0;
  const workers = Array.from({ length: Math.min(options.notebookConcurrency, configPaths.length) }, async () => {
    while (cursor < configPaths.length) {
      const index = cursor;
      cursor += 1;
      try { results[index] = await executeNotebook(configPaths[index], options); }
      catch (error) {
        failures.push({ config: configPaths[index], error });
        results[index] = { config: configPaths[index], status: 'failed', error: error.message };
        process.stderr.write(`[${configPaths[index]}] failed; continuing independent notebook chains\n`);
      }
    }
  });
  await Promise.all(workers);
  process.stdout.write(`${JSON.stringify({ status: failures.length ? 'completed-with-failures' : 'completed', notebooks: results }, null, 2)}\n`);
  if (failures.length) throw new Error(failures.map(({ config, error }) => `${config}: ${error.message}`).join('\n'));
}

main().catch((error) => {
  process.stderr.write(`NotebookLM execution failed: ${error.stack || error.message}\n`);
  process.exitCode = 1;
});
