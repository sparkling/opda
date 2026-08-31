#!/usr/bin/env node

import path from 'node:path';

import {
  NOTEBOOK_CONFIG_PATHS,
  loadNotebookConfigs,
  prepareNotebook,
  prepareSharedFacts,
} from './lib/notebooklm-preparation.mjs';

function parseArguments(argv) {
  const options = {
    configPaths: [],
    siteBaseUrl: 'http://127.0.0.1:4331',
    write: true,
    json: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--config') options.configPaths.push(argv[++index]);
    else if (argument === '--site-base-url') options.siteBaseUrl = argv[++index];
    else if (argument === '--validate-only') options.write = false;
    else if (argument === '--json') options.json = true;
    else if (argument === '--help' || argument === '-h') options.help = true;
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (options.configPaths.some((item) => !item)) throw new Error('--config requires a path');
  if (!options.siteBaseUrl) throw new Error('--site-base-url requires a URL');
  const parsedUrl = new URL(options.siteBaseUrl);
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('Site base URL must use HTTP or HTTPS');
  options.siteBaseUrl = parsedUrl.href;
  return options;
}

function usage() {
  return [
    'Build the discrete NotebookLM source manifests and one-to-one conversions.',
    '',
    'Usage:',
    '  node scripts/build-notebooklm-prepared-sources.mjs [options]',
    '',
    'Options:',
    '  --config PATH         Build one config (repeatable; defaults to all six)',
    '  --site-base-url URL   Local site used for rendered routes (default :4331)',
    '  --validate-only       Resolve, fetch and validate without writing outputs',
    '  --json                Emit a JSON summary',
  ].join('\n');
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(`${usage()}\n`);
    return;
  }
  const configPaths = options.configPaths.length ? options.configPaths : NOTEBOOK_CONFIG_PATHS;
  const shared = await prepareSharedFacts(options);
  options.virtualFiles = new Map([[shared.manifest.output, shared.content]]);
  const configs = await loadNotebookConfigs(configPaths);
  const results = [];
  for (const entry of configs) {
    const result = await prepareNotebook(entry, options);
    results.push({
      config: entry.configPath,
      notebook_id: entry.config.notebook.id,
      source_count: result.manifest.source_count,
      source_limit: result.manifest.source_limit,
      manifest: path.relative(process.cwd(), result.manifestPath),
    });
  }
  const summary = {
    mode: options.write ? 'write' : 'validate-only',
    site_base_url: options.siteBaseUrl,
    shared_facts_sha256: shared.manifest.output_sha256,
    notebooks: results,
    total_sources: results.reduce((sum, result) => sum + result.source_count, 0),
  };
  if (options.json) process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  else {
    for (const result of results) {
      process.stdout.write(`${result.config}: ${result.source_count}/${result.source_limit} sources\n`);
    }
    process.stdout.write(`Total discrete sources: ${summary.total_sources}\n`);
  }
}

main().catch((error) => {
  process.stderr.write(`NotebookLM preparation failed: ${error.message}\n`);
  process.exitCode = 1;
});
