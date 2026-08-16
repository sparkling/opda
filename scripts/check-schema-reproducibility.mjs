#!/usr/bin/env node
/**
 * Reconstruct the local-only schema inputs from their tracked public bundles,
 * then run the strict generated-page reproducibility gate.
 *
 * The original upstream checkout and canonical dictionary are intentionally
 * gitignored. Their deterministic JSON projections are already tracked for the
 * resource viewer, so CI can use those exact bytes without network access.
 */

import { execFile } from 'node:child_process';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inputs = [
  {
    bundle: 'public/data/resources/source/03-standards/schemas/src/schemas/v3/pdtf-transaction.json.js',
    target: 'source/03-standards/schemas/src/schemas/v3/pdtf-transaction.json',
  },
  {
    bundle: 'public/data/resources/source/00-deliverables/semantic-models/data-dictionary-canonical.json.js',
    target: 'source/00-deliverables/semantic-models/data-dictionary-canonical.json',
  },
];

function bundledJson(source, bundle) {
  const assignment = source.match(/window\.__OPDA_RESOURCE\[[^\n]+\]=(.*);\s*$/su);
  if (!assignment) throw new Error(`${bundle} is not a recognised resource bundle`);
  return JSON.parse(assignment[1]);
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

async function materialise({ bundle, target }) {
  const bundlePath = path.join(root, bundle);
  const targetPath = path.join(root, target);
  const expected = bundledJson(await readFile(bundlePath, 'utf8'), bundle);
  if (await exists(targetPath)) {
    const actual = JSON.parse(await readFile(targetPath, 'utf8'));
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`${target} differs from its tracked resource projection`);
    }
    return;
  }
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, `${JSON.stringify(expected, null, 2)}\n`);
}

async function main() {
  if (!process.env.SOURCE_DATE_EPOCH) {
    throw new Error('SOURCE_DATE_EPOCH is required by the schema reproducibility gate');
  }
  for (const input of inputs) await materialise(input);
  await run('python3', ['scripts/walk_schema.py'], { cwd: root, maxBuffer: 10 * 1024 * 1024 });
  const { stdout, stderr } = await run('python3', ['scripts/drift_check.py', '--strict'], {
    cwd: root,
    env: process.env,
    maxBuffer: 10 * 1024 * 1024,
  });
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
}

main().catch((error) => {
  if (error.stdout) process.stderr.write(error.stdout);
  if (error.stderr) process.stderr.write(error.stderr);
  console.error(`[schema-reproducibility] ${error.message}`);
  process.exitCode = 1;
});
