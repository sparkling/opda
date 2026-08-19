#!/usr/bin/env node
/** Capture the pre-migration HTML route and fragment contract without copying content. */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const prefix = '--baseline-root=';
const baselineArg = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
if (!baselineArg || !path.isAbsolute(baselineArg.slice(prefix.length))) {
  throw new Error('usage: capture-ia-route-baseline.mjs --baseline-root=/absolute/path');
}
const baselineRoot = baselineArg.slice(prefix.length);
const distRoot = path.join(baselineRoot, 'dist');
const output = path.join(ROOT, 'src/data/ia-route-baseline.json');
const externalPrefixes = [
  'ontology/tools/ontospy/',
  'ontology/tools/pylode/',
  'ontology/tools/shaclplay/',
  'ontology/tools/widoco/',
];

function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const item = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(item) : [item];
  });
}

function fragmentContract(html) {
  const ids = [];
  const shellIds = new Set(['app', 'app-sidebar', 'global-nav-panel', 'global-nav-toggle', 'main-content', 'menu-toggle', 'sidebar-collapse', 'theme-toggle']);
  const visit = (node) => {
    const id = node.attrs?.find(({ name }) => name === 'id')?.value;
    if (id && !shellIds.has(id)) ids.push(id);
    node.childNodes?.forEach(visit);
  };
  visit(parse(html));
  const unique = [...new Set(ids)].sort();
  return {
    fragmentCount: unique.length,
    fragmentHash: createHash('sha256').update(unique.join('\n')).digest('hex'),
  };
}

const routes = filesUnder(distRoot)
  .filter((file) => file.endsWith('.html'))
  .map((file) => {
    const filePath = path.relative(distRoot, file).split(path.sep).join('/');
    const html = readFileSync(file, 'utf8');
    return {
      file: filePath,
      mode: externalPrefixes.some((item) => filePath.startsWith(item)) ? 'external-retain' : 'bundle',
      ...fragmentContract(html),
    };
  })
  .sort((a, b) => a.file.localeCompare(b.file));

const capturedCommit = execFileSync('git', ['rev-parse', 'HEAD'], {
  cwd: baselineRoot,
  encoding: 'utf8',
}).trim();
const manifest = {
  schemaVersion: 1,
  capturedCommit,
  routeCount: routes.length,
  externalRetainCount: routes.filter(({ mode }) => mode === 'external-retain').length,
  externalPrefixes,
  routes,
};
writeFileSync(output, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`captured ${routes.length} HTML routes (${manifest.externalRetainCount} externally retained)`);
