#!/usr/bin/env node
/**
 * Fail-closed IA preservation contract.
 *
 * A clean checkout can verify committed manifests and dependency contracts. The
 * source archive and generated ontology mirror are intentionally ignored, so
 * their hydrated counts are checked only when an explicit --baseline-root is
 * supplied (normally the maintainer's full working tree). No files are written.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PRESERVATION_LEDGER,
  ROUTE_DISPOSITION_LEDGER,
  validateIaContract,
} from '../src/lib/site-ia.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(args) {
  let strict = false;
  let baselineRoot = null;
  for (const arg of args) {
    if (arg === '--strict') {
      if (strict) throw new Error('duplicate --strict flag');
      strict = true;
      continue;
    }
    if (arg.startsWith('--baseline-root=')) {
      if (baselineRoot) throw new Error('duplicate --baseline-root flag');
      const value = arg.slice('--baseline-root='.length);
      if (!value || !path.isAbsolute(value)) {
        throw new Error('--baseline-root must contain a non-empty absolute path');
      }
      baselineRoot = value;
      continue;
    }
    if (arg === '--baseline-root' || arg.startsWith('--baseline-root')) {
      throw new Error('malformed --baseline-root flag; use --baseline-root=/absolute/path');
    }
    throw new Error(`unknown argument: ${arg}`);
  }
  if (strict && !baselineRoot) {
    throw new Error('--strict requires --baseline-root=/absolute/path');
  }
  return { strict, baselineRoot };
}

let options;
try {
  options = parseArgs(process.argv.slice(2));
} catch (error) {
  console.error(`FAIL usage: ${error.message}`);
  process.exit(2);
}

const BASELINE = options.baselineRoot;
const failures = [];
const notes = [];

function fail(message) { failures.push(message); }
function exists(relative, root = ROOT) { return existsSync(path.join(root, relative)); }
function filesUnder(relative, root = ROOT) {
  const absolute = path.join(root, relative);
  if (!existsSync(absolute)) return [];
  const out = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const item = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(item);
      else if (entry.isFile()) out.push(item);
    }
  };
  walk(absolute);
  return out;
}
function allFilesUnder(relative, root = ROOT) {
  const absolute = path.join(root, relative);
  if (!existsSync(absolute)) return [];
  const out = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const item = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(item);
      else if (entry.isFile()) out.push(item);
    }
  };
  walk(absolute);
  return out;
}
function readJson(relative) {
  try { return JSON.parse(readFileSync(path.join(ROOT, relative), 'utf8')); }
  catch (error) { fail(`${relative}: invalid or unreadable JSON (${error.message})`); return null; }
}
function digest(relative) {
  return createHash('sha256').update(readFileSync(path.join(ROOT, relative))).digest('hex');
}

validateIaContract();
if (ROUTE_DISPOSITION_LEDGER.some(({ disposition }) => disposition === 'retire')) {
  fail('route disposition ledger contains a retire entry');
}

const resources = readJson('src/data/resources-manifest.json');
if (Array.isArray(resources)) {
  const paths = resources.map((entry) => entry?.path);
  if (paths.some((entry) => typeof entry !== 'string' || !entry.startsWith('source/'))) {
    fail('resources manifest contains a non-source or malformed path');
  }
  if (new Set(paths).size !== paths.length) fail('resources manifest contains duplicate paths');
  notes.push(`committed source manifest: ${resources.length} records (sha256 ${digest('src/data/resources-manifest.json').slice(0, 12)})`);
}

const council = readJson('src/data/council-manifest.json');
if (Array.isArray(council)) {
  const markdown = council.filter((entry) => entry?.type === 'file' && entry?.ext === 'md');
  if (markdown.length < 261) fail(`council manifest has ${markdown.length} markdown files; minimum is 261`);
  const paths = council.map((entry) => entry?.path);
  if (new Set(paths).size !== paths.length) fail('council manifest contains duplicate paths');
  notes.push(`committed council manifest: ${markdown.length} markdown files (${council.length} entries; sha256 ${digest('src/data/council-manifest.json').slice(0, 12)})`);
}

// These contracts are runtime dependencies, not page content. Keep alternatives
// explicit so a future implementation can move them without silently dropping one.
const dependencyGroups = [
  ['authentication', ['src/components/AuthButton.astro', 'src/pages/api/auth/[...slug].js']],
  ['comments', ['src/components/Comments.astro']],
  ['working-group submissions', ['src/pages/working-groups/join/index.astro', 'src/pages/api/working-group-interest.js']],
];
for (const [label, candidates] of dependencyGroups) {
  if (!candidates.some((candidate) => exists(candidate))) fail(`${label} dependency contract has no known implementation`);
}

const viewerSource = readFileSync(path.join(ROOT, 'src/pages/resource.astro'), 'utf8');
for (const marker of ['source/', '/resources/', 'council-manifest', 'path=']) {
  if (!viewerSource.includes(marker)) fail(`source viewer contract is missing ${marker}`);
}

if (!BASELINE) {
  notes.push('hydrated baseline checks skipped: pass --baseline-root=/absolute/path to enable strict archive/output verification');
} else {
  if (!existsSync(BASELINE) || !statSync(BASELINE).isDirectory()) {
    fail(`baseline root is not a directory: ${BASELINE}`);
  } else {
    // The explicit hydrated baseline is a physical archive inventory. Count
    // every regular file (including nested mirrored repositories) so this
    // check cannot silently mistake a partial hydration for the baseline.
    const sourceCount = allFilesUnder('source', BASELINE).length;
    if (sourceCount < 1620) fail(`hydrated source archive has ${sourceCount} files; minimum baseline is 1620`);
    const ontologyCount = filesUnder('public/ontology/artefacts', BASELINE).length;
    if (ontologyCount < 27) fail(`hydrated ontology artefacts have ${ontologyCount} files; minimum baseline is 27`);
    // The historical IA inventory records 46 outputs; one output is optional in
    // a hydrated tree when build-only generation is not run, so 45 is the strict
    // pre-build floor and the report retains the 46 audit expectation.
    const dataCount = filesUnder('public/data', BASELINE).length;
    if (dataCount < 45) fail(`hydrated data output tree has ${dataCount} files; minimum pre-build floor is 45`);
    const councilMarkdown = filesUnder('docs/ontology/odr/council', BASELINE)
      .filter((file) => file.toLowerCase().endsWith('.md')).length;
    if (councilMarkdown < 261) fail(`hydrated council corpus has ${councilMarkdown} markdown files; minimum is 261`);
    const routeFamilies = [
      ['/pdtf/**', ['dist/pdtf', 'public/pdtf']],
      ['/ontology/tools/**', ['dist/ontology/tools', 'public/ontology/tools']],
      ['/ui/**', ['dist/ui', 'public/ui']],
      ['/images/**', ['dist/images', 'public/images']],
      ['/resources/**', ['public/data/resources', 'dist/resources', 'public/resources']],
    ];
    for (const [label, candidates] of routeFamilies) {
      if (!candidates.some((candidate) => filesUnder(candidate, BASELINE).length)) {
        fail(`hydrated baseline has no emitted files for ${label}`);
      }
    }
    notes.push(`hydrated baseline: source=${sourceCount}, ontology artefacts=${ontologyCount}, data=${dataCount}, council markdown=${councilMarkdown}`);
  }
}

const publicFamilies = ['/ui', '/images', '/ontology/tools'];
for (const family of publicFamilies) {
  if (!filesUnder(`public${family}`).length) fail(`preserved support family is empty or missing: ${family}/**`);
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exitCode = 1;
} else {
  console.log('PASS IA preservation contract');
  for (const note of notes) console.log(`  ${note}`);
}
