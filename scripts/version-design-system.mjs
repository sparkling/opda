#!/usr/bin/env node
/**
 * Add one content hash to every module imported by the public design facade.
 *
 * Browsers cache CSS @imports independently from their parent stylesheet. A
 * version on `/ui/design-system.css` alone therefore cannot invalidate an
 * edited child module. This script retains the facade as the human-owned module
 * list and projects a deterministic graph hash into every import URL.
 */

import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const facadePath = path.join(repoRoot, 'public', 'ui', 'design-system.css');
const importPattern = /@import\s+url\(["']([^"'?]+\.css)(?:\?v=[a-f0-9]+)?["']\);/gu;

export function stripImportVersions(source) {
  return source.replace(/(\.css)\?v=[a-f0-9]+(?=["'])/gu, '$1');
}

export async function renderVersionedFacade(source, baseDir = path.dirname(facadePath)) {
  const canonical = stripImportVersions(source);
  const imports = [...canonical.matchAll(importPattern)].map((match) => match[1]);
  if (imports.length === 0) throw new Error('design-system.css contains no CSS imports');

  const digest = createHash('sha256');
  digest.update(canonical);
  for (const relative of imports) {
    const target = path.resolve(baseDir, relative);
    const allowedRoot = path.resolve(repoRoot, 'public', 'ui') + path.sep;
    if (!target.startsWith(allowedRoot)) {
      throw new Error(`design-system import escapes public/ui: ${relative}`);
    }
    digest.update(relative);
    digest.update(await readFile(target));
  }
  const version = digest.digest('hex').slice(0, 12);
  const output = canonical.replace(importPattern, (_match, relative) =>
    `@import url("${relative}?v=${version}");`);
  return { output, version, imports };
}

async function main() {
  const source = await readFile(facadePath, 'utf8');
  const result = await renderVersionedFacade(source);
  if (process.argv.includes('--check')) {
    if (source !== result.output) {
      console.error('[design-system] facade version is stale; run pnpm run css.');
      process.exitCode = 1;
      return;
    }
    console.log(`[design-system] facade graph ${result.version} is current.`);
    return;
  }
  if (source !== result.output) await writeFile(facadePath, result.output);
  console.log(`[design-system] versioned ${result.imports.length} modules as ${result.version}.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
