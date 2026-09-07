#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

import { routesForPaths } from './lib/changed-routes.mjs';

const pathFile = process.argv[2];
if (!pathFile) {
  console.error('Usage: node scripts/changed-routes.mjs <changed-paths-file>');
  process.exit(2);
}
const paths = (await readFile(pathFile, 'utf8')).split(/\r?\n/u);
console.log(routesForPaths(paths).join('\n'));
