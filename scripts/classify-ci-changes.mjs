#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

import { classifyPaths } from './lib/ci-change-classifier.mjs';

const pathFile = process.argv[2];
if (!pathFile) {
  console.error('Usage: node scripts/classify-ci-changes.mjs <changed-paths-file>');
  process.exit(2);
}

const paths = (await readFile(pathFile, 'utf8')).split(/\r?\n/u);
const result = classifyPaths(paths);
if (process.env.GITHUB_OUTPUT) {
  const { appendFile } = await import('node:fs/promises');
  const output = Object.entries(result).map(([key, value]) => `${key}=${value}`).join('\n') + '\n';
  await appendFile(process.env.GITHUB_OUTPUT, output);
}
console.log(JSON.stringify({ paths: paths.filter(Boolean), ...result }, null, 2));
