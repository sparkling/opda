#!/usr/bin/env node
/** Verify that built `/resource?path=source/...` links have archive receipts. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(import.meta.url), '..', '..');
const SOURCE_ARCHIVE_SENTINEL = 'INVENTORY.md';

function htmlFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) htmlFiles(target, files);
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(target);
  }
  return files;
}

function resourcePaths(html) {
  const paths = new Set();
  const pattern = /href=(?:"|')\/resource\?path=([^"'&#]+)(?:"|')/gu;
  for (const match of html.matchAll(pattern)) {
    const value = decodeURIComponent(match[1].replace(/\+/gu, ' ').replace(/&amp;/gu, '&'));
    if (value.startsWith('source/')) paths.add(value);
  }
  return paths;
}

function sourceFile(sourceDir, resourcePath) {
  const relative = resourcePath.slice('source/'.length);
  const target = path.resolve(sourceDir, relative);
  if (!target.startsWith(`${path.resolve(sourceDir)}${path.sep}`)) throw new Error(`Unsafe source resource path: ${resourcePath}`);
  return target;
}

export function checkResourceLinkCoverage({
  distDir = path.join(repoRoot, 'dist'),
  manifestPath = path.join(repoRoot, 'src/data/resources-manifest.json'),
  sourceDir = path.join(repoRoot, 'source'),
} = {}) {
  if (!fs.existsSync(distDir)) throw new Error(`Build output is missing: ${distDir}`);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const published = new Set(manifest.map(({ path: resourcePath }) => resourcePath));
  const paths = new Set(htmlFiles(distDir).flatMap((file) => [...resourcePaths(fs.readFileSync(file, 'utf8'))]));
  const missingManifest = [...paths].filter((resourcePath) => !published.has(resourcePath));
  // A clean checkout contains tracked source/ subtrees, but not the complete
  // gitignored archive. Its ignored master inventory is the archive-completeness
  // sentinel; only then is file-by-file local verification meaningful.
  const hasSource = fs.existsSync(path.join(sourceDir, SOURCE_ARCHIVE_SENTINEL));
  const missingSource = hasSource
    ? [...paths].filter((resourcePath) => !fs.existsSync(sourceFile(sourceDir, resourcePath)))
    : [];
  if (missingManifest.length || missingSource.length) {
    const messages = [];
    if (missingManifest.length) messages.push(`not in resources manifest:\n${missingManifest.map((p) => `  - ${p}`).join('\n')}`);
    if (missingSource.length) messages.push(`missing from local source archive:\n${missingSource.map((p) => `  - ${p}`).join('\n')}`);
    throw new Error(`Resource-link coverage failed; ${messages.join('\n')}`);
  }
  return { linkedResourceCount: paths.size, verifiedSourceArchive: hasSource };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = checkResourceLinkCoverage();
  console.log(`✓ ${result.linkedResourceCount} built source-resource links are listed${result.verifiedSourceArchive ? ' and exist locally' : ''}.`);
}
