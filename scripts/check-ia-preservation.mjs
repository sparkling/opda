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
import { parse } from 'parse5';
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
function treeDigest(relative, root = ROOT) {
  const base = path.join(root, relative);
  const files = filesUnder(relative, root).sort();
  const hash = createHash('sha256');
  for (const file of files) {
    hash.update(path.relative(base, file));
    hash.update(readFileSync(file));
  }
  return hash.digest('hex');
}
function fragmentContract(file) {
  const ids = [];
  const shellIds = new Set(['app', 'app-sidebar', 'global-nav-panel', 'global-nav-toggle', 'main-content', 'menu-toggle', 'sidebar-collapse', 'theme-toggle']);
  const visit = (node) => {
    const id = node.attrs?.find(({ name }) => name === 'id')?.value;
    if (id && !shellIds.has(id)) ids.push(id);
    node.childNodes?.forEach(visit);
  };
  visit(parse(readFileSync(file, 'utf8')));
  const unique = [...new Set(ids)].sort();
  return {
    fragmentCount: unique.length,
    fragmentHash: createHash('sha256').update(unique.join('\n')).digest('hex'),
  };
}
function preservation(kind) {
  const entry = PRESERVATION_LEDGER.find((record) => record.kind === kind);
  if (!entry) throw new Error(`missing preservation ledger entry: ${kind}`);
  return entry;
}

validateIaContract();
if (ROUTE_DISPOSITION_LEDGER.some(({ disposition }) => disposition === 'retire')) {
  fail('route disposition ledger contains a retire entry');
}

const resources = readJson('src/data/resources-manifest.json');
if (Array.isArray(resources)) {
  const contract = preservation('source-records');
  const paths = resources.map((entry) => entry?.path);
  if (paths.some((entry) => typeof entry !== 'string' || !entry.startsWith('source/'))) {
    fail('resources manifest contains a non-source or malformed path');
  }
  if (new Set(paths).size !== paths.length) fail('resources manifest contains duplicate paths');
  if (resources.length < contract.indexedCount) {
    fail(`resources manifest has ${resources.length} records; indexed baseline is ${contract.indexedCount}`);
  }
  notes.push(`committed source manifest: ${resources.length} records (sha256 ${digest('src/data/resources-manifest.json').slice(0, 12)})`);
}

const council = readJson('src/data/council-manifest.json');
if (Array.isArray(council)) {
  const contract = preservation('generated-records');
  const markdown = council.filter((entry) => entry?.type === 'file' && entry?.ext === 'md');
  if (markdown.length < contract.expectedCount) {
    fail(`council manifest has ${markdown.length} markdown files; minimum is ${contract.expectedCount}`);
  }
  const paths = council.map((entry) => entry?.path);
  if (new Set(paths).size !== paths.length) fail('council manifest contains duplicate paths');
  notes.push(`committed council manifest: ${markdown.length} markdown files (${council.length} entries; sha256 ${digest('src/data/council-manifest.json').slice(0, 12)})`);
}

const routeBaseline = readJson('src/data/ia-route-baseline.json');
if (routeBaseline) {
  if (routeBaseline.schemaVersion !== 1 || routeBaseline.routeCount !== routeBaseline.routes?.length) {
    fail('route baseline manifest has an invalid schema or count');
  }
  const external = routeBaseline.routes?.filter(({ mode }) => mode === 'external-retain') ?? [];
  if (external.length !== routeBaseline.externalRetainCount) fail('route baseline external-retain count is inconsistent');
  const workflow = readFileSync(path.join(ROOT, '.github/workflows/deploy-aws.yml'), 'utf8');
  for (const prefix of routeBaseline.externalPrefixes ?? []) {
    if (!workflow.includes(`--exclude "${prefix}*"`)) fail(`deployment does not protect externally retained ${prefix}`);
  }
  if (exists('dist')) {
    let bundleChecked = 0;
    let externalChecked = 0;
    for (const record of routeBaseline.routes ?? []) {
      const current = path.join(ROOT, 'dist', record.file);
      if (!existsSync(current)) {
        if (record.mode === 'bundle' || options.strict) fail(`frozen route is missing from dist: ${record.file}`);
        continue;
      }
      const actual = fragmentContract(current);
      if (actual.fragmentCount !== record.fragmentCount || actual.fragmentHash !== record.fragmentHash) {
        fail(`frozen fragment contract changed: ${record.file}`);
      }
      record.mode === 'bundle' ? bundleChecked++ : externalChecked++;
    }
    notes.push(`frozen route inventory: ${bundleChecked} bundled + ${externalChecked}/${external.length} externally retained routes verified`);
  } else {
    notes.push(`frozen route inventory: ${routeBaseline.routeCount} records; dist verification deferred to build gate`);
  }
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
    const sourceContract = preservation('source-records');
    const ontologyContract = preservation('machine-representations');
    const dataContract = preservation('generated-data');
    const councilContract = preservation('generated-records');
    const sourceCount = allFilesUnder('source', BASELINE).length;
    if (sourceCount < sourceContract.expectedCount) {
      fail(`hydrated source archive has ${sourceCount} files; minimum baseline is ${sourceContract.expectedCount}`);
    }
    const ontologyCount = filesUnder('public/ontology/artefacts', BASELINE).length;
    if (ontologyCount < ontologyContract.expectedCount) {
      fail(`hydrated ontology artefacts have ${ontologyCount} files; minimum baseline is ${ontologyContract.expectedCount}`);
    }
    // The historical IA inventory records 46 outputs; one output is optional in
    // a hydrated tree when build-only generation is not run, so 45 is the strict
    // pre-build floor and the report retains the 46 audit expectation.
    const dataCount = filesUnder('public/data', BASELINE).length;
    if (dataCount < dataContract.minimumCount) {
      fail(`hydrated data output tree has ${dataCount} files; minimum pre-build floor is ${dataContract.minimumCount}`);
    }
    const councilMarkdown = filesUnder('docs/ontology/odr/council', BASELINE)
      .filter((file) => file.toLowerCase().endsWith('.md')).length;
    if (councilMarkdown < councilContract.expectedCount) {
      fail(`hydrated council corpus has ${councilMarkdown} markdown files; minimum is ${councilContract.expectedCount}`);
    }
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
    notes.push(`hydrated checksums: source=${treeDigest('source', BASELINE).slice(0, 12)}, ontology=${treeDigest('public/ontology/artefacts', BASELINE).slice(0, 12)}, data=${treeDigest('public/data', BASELINE).slice(0, 12)}`);
  }
}

const ontologyContract = preservation('machine-representations');
const ontologyFiles = filesUnder('public/ontology/artefacts');
if (ontologyFiles.length < ontologyContract.expectedCount) {
  fail(`committed ontology artefacts have ${ontologyFiles.length} files; minimum is ${ontologyContract.expectedCount}`);
}
if (ontologyFiles.length) notes.push(`ontology artefacts: ${ontologyFiles.length} files (sha256 ${treeDigest('public/ontology/artefacts').slice(0, 12)})`);

const dataContract = preservation('generated-data');
const outputRoot = filesUnder('dist/data').length ? 'dist/data' : 'public/data';
const outputCount = filesUnder(outputRoot).length;
const outputFloor = outputRoot === 'dist/data' ? dataContract.expectedCount : dataContract.minimumCount;
if (outputCount < outputFloor) fail(`${outputRoot} has ${outputCount} files; minimum is ${outputFloor}`);
if (outputCount) notes.push(`${outputRoot}: ${outputCount} files (sha256 ${treeDigest(outputRoot).slice(0, 12)})`);

const publicFamilies = ['/ui', '/images', '/ontology/tools'];
for (const family of publicFamilies) {
  if (!filesUnder(`public${family}`).length) fail(`preserved support family is empty or missing: ${family}/**`);
  else notes.push(`${family}/**: ${filesUnder(`public${family}`).length} files (sha256 ${treeDigest(`public${family}`).slice(0, 12)})`);
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exitCode = 1;
} else {
  console.log('PASS IA preservation contract');
  for (const note of notes) console.log(`  ${note}`);
}
