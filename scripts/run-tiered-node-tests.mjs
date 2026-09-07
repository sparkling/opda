#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const BLOCKING_TIERS = new Set(['release-blocking', 'pull-request-blocking']);

export function selectNodeTests(manifest, lane) {
  if (!['application', 'ontology', 'infrastructure'].includes(lane)) {
    throw new Error(`unsupported test lane: ${lane}`);
  }
  return manifest.tests
    .filter((entry) => entry.lane === lane
      && BLOCKING_TIERS.has(entry.tier)
      && entry.path.endsWith('.test.mjs'))
    .map((entry) => entry.path);
}

async function run(files) {
  if (!files.length) throw new Error('tier selection produced no Node tests');
  const child = spawn(process.execPath, ['--test', ...files], { stdio: 'inherit' });
  const exitCode = await new Promise((resolveExit, reject) => {
    child.once('error', reject);
    child.once('exit', (code) => resolveExit(code ?? 1));
  });
  if (exitCode !== 0) process.exitCode = exitCode;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const lane = process.argv[2];
  const manifest = JSON.parse(await readFile(resolve('config/ci-test-tiers.json'), 'utf8'));
  const files = selectNodeTests(manifest, lane);
  console.log(`[tests] ${lane}: ${files.length} release/PR-blocking Node files`);
  await run(files);
}
