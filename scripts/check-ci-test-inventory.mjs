#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

async function discover(directory, root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return discover(path, root);
    const testFile = /(?:\.test\.mjs|\.spec\.mjs|\/test_[^/]+\.py)$/u.test(path.replaceAll('\\', '/'));
    return testFile ? [relative(root, path).replaceAll('\\', '/')] : [];
  }));
  return nested.flat();
}

export async function validateTestInventory(root, manifestPath) {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const discovered = (await discover(resolve(root, 'tests'), root)).sort();
  const declared = manifest.tests.map(({ path }) => path).sort();
  const duplicates = declared.filter((path, index) => path === declared[index - 1]);
  const missing = discovered.filter((path) => !declared.includes(path));
  const stale = declared.filter((path) => !discovered.includes(path));
  const invalid = manifest.tests.filter((entry) => !entry.owner
    || !manifest.tiers.includes(entry.tier)
    || !['editorial', 'application', 'ontology', 'infrastructure'].includes(entry.lane));
  return { discovered, declared, duplicates, missing, stale, invalid };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = process.cwd();
  const result = await validateTestInventory(root, resolve(root, 'config/ci-test-tiers.json'));
  for (const [name, values] of Object.entries(result).filter(([name]) => !['discovered', 'declared'].includes(name))) {
    if (values.length) console.error(`[test-inventory] ${name}: ${values.map((value) => value.path ?? value).join(', ')}`);
  }
  if (result.duplicates.length || result.missing.length || result.stale.length || result.invalid.length) process.exitCode = 1;
  else console.log(`[test-inventory] PASS — ${result.discovered.length} test files have one owner, tier and lane`);
}
