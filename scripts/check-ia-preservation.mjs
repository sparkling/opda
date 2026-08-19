#!/usr/bin/env node
/** Fail-closed route, information, artefact and runtime preservation gate. */
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  fileInventory,
  filesUnder,
  fragmentContract,
  informationContract,
  blockInventory,
  routeFromFile,
  sha256,
} from './lib/ia-preservation-contract.mjs';
import {
  IA_STATUS_REGISTRY_VERSION,
  PRESERVATION_LEDGER,
  ROUTE_DISPOSITION_LEDGER,
  getContentOwner,
  getRouteDisposition,
  getRouteStatus,
  validateIaContract,
} from '../src/lib/site-ia.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXPECTED_FAMILY_COUNTS = Object.freeze({
  'source-archive': 1620,
  'council-markdown': 261,
  'ontology-artefacts': 27,
  'deployed-data': 46,
  'ui-assets': 53,
  'image-assets': 5,
  'ontology-tools': 837,
  'v2-atomic-seed': 690,
});
const HASH = /^[a-f0-9]{64}$/u;
const failures = [];
const notes = [];
const fail = (message) => failures.push(message);

function parseArgs(args) {
  let strict = false;
  let manifestOnly = false;
  let baselineRoot = null;
  for (const arg of args) {
    if (arg === '--strict') {
      if (strict) throw new Error('duplicate --strict flag');
      strict = true;
    } else if (arg === '--manifest-only') {
      if (manifestOnly) throw new Error('duplicate --manifest-only flag');
      manifestOnly = true;
    } else if (arg.startsWith('--baseline-root=')) {
      if (baselineRoot) throw new Error('duplicate --baseline-root flag');
      baselineRoot = arg.slice('--baseline-root='.length);
      if (!baselineRoot || !path.isAbsolute(baselineRoot)) throw new Error('--baseline-root must contain a non-empty absolute path');
    } else if (arg === '--baseline-root' || arg.startsWith('--baseline-root')) {
      throw new Error('malformed --baseline-root flag; use --baseline-root=/absolute/path');
    } else throw new Error(`unknown argument: ${arg}`);
  }
  if (strict && !baselineRoot) throw new Error('--strict requires --baseline-root=/absolute/path');
  if (strict && manifestOnly) throw new Error('--strict and --manifest-only are mutually exclusive');
  return { strict, manifestOnly, baselineRoot };
}

let options;
try { options = parseArgs(process.argv.slice(2)); }
catch (error) {
  console.error(`FAIL usage: ${error.message}`);
  process.exit(2);
}

function readJson(relative) {
  try { return JSON.parse(readFileSync(path.join(ROOT, relative), 'utf8')); }
  catch (error) { fail(`${relative}: invalid or unreadable JSON (${error.message})`); return null; }
}

function safeRelative(value) {
  return typeof value === 'string' && value.length > 0 && !path.isAbsolute(value)
    && !value.split('/').includes('..');
}

function statusId(route) {
  return `${IA_STATUS_REGISTRY_VERSION}:${sha256(JSON.stringify(getRouteStatus(route))).slice(0, 16)}`;
}

function inventoryDigest(records) {
  return sha256(records.map((record) => `${record.path}\0${record.size}\0${record.sha256}`).join('\n'));
}

function validateInventory(label, inventory) {
  if (!inventory || inventory.count !== inventory.records?.length || !HASH.test(inventory.treeSha256 ?? '')) {
    fail(`${label} has an invalid inventory shape`);
    return;
  }
  const seen = new Set();
  for (const record of inventory.records) {
    if (!safeRelative(record.path) || !Number.isSafeInteger(record.size) || record.size < 0 || !HASH.test(record.sha256 ?? '')) {
      fail(`${label} contains an invalid file record`);
      continue;
    }
    if (seen.has(record.path)) fail(`${label} contains duplicate path ${record.path}`);
    seen.add(record.path);
  }
  if (inventoryDigest(inventory.records) !== inventory.treeSha256) fail(`${label} tree checksum is inconsistent`);
}

function compareInventory(label, root, relative, expected) {
  const actual = fileInventory(root, relative);
  if (actual.count !== expected.count || actual.treeSha256 !== expected.treeSha256) {
    fail(`${label} differs: expected ${expected.count}/${expected.treeSha256.slice(0, 12)}, got ${actual.count}/${actual.treeSha256.slice(0, 12)}`);
    return;
  }
  if (JSON.stringify(actual.records) !== JSON.stringify(expected.records)) fail(`${label} per-file manifest differs`);
}

function validateRouteMetadata(record) {
  const required = [
    'route', 'file', 'kind', 'generatedFamily', 'contentOwner', 'governanceOwner',
    'statusId', 'searchFacet', 'preservedDestination',
  ];
  if (required.some((field) => typeof record[field] !== 'string' || !record[field])) {
    fail(`route record is incomplete: ${record.file ?? '(missing file)'}`);
    return;
  }
  if (!safeRelative(record.file) || !record.route.startsWith('/') || !record.consumers?.length
    || !record.endpoints?.length || !record.crossWorkArea?.length) {
    fail(`route record has unsafe or incomplete contracts: ${record.file}`);
    return;
  }
  const disposition = getRouteDisposition(record.route);
  const owner = getContentOwner(record.route);
  if (!disposition || disposition.owner !== record.contentOwner || owner !== record.contentOwner) {
    fail(`route owner/disposition drift: ${record.route}`);
  }
  if (record.statusId !== statusId(record.route)) fail(`route status registry drift: ${record.route}`);
  if (record.searchFacet !== disposition?.search.workArea) fail(`route search facet drift: ${record.route}`);
}

function verifyAcceptedRoute(record, file) {
  const html = readFileSync(file, 'utf8');
  const content = informationContract(html);
  const fragments = fragmentContract(html);
  if (sha256(html) !== record.acceptedRawSha256) fail(`accepted HTML checksum changed: ${record.route}`);
  if (content.contentSha256 !== record.acceptedContentSha256) fail(`accepted information checksum changed: ${record.route}`);
  if (blockInventory(content.blockHashes).sha256 !== record.acceptedBlockInventorySha256) {
    fail(`accepted information-block inventory changed: ${record.route}`);
  }
  if (fragments.fragmentSha256 !== record.acceptedFragmentSha256
    || fragments.fragmentCount !== record.acceptedFragmentCount) fail(`accepted fragment contract changed: ${record.route}`);
}

function verifyBaselineRoute(record, file) {
  const html = readFileSync(file, 'utf8');
  const content = informationContract(html);
  const fragments = fragmentContract(html);
  if (sha256(html) !== record.baselineRawSha256) fail(`baseline HTML checksum changed: ${record.route}`);
  if (content.contentSha256 !== record.baselineContentSha256) fail(`baseline information checksum changed: ${record.route}`);
  if (blockInventory(content.blockHashes).sha256 !== record.equivalenceReceipt?.baselineBlockInventorySha256) {
    fail(`baseline information-block inventory changed: ${record.route}`);
  }
  if (fragments.fragmentSha256 !== record.baselineFragmentSha256
    || fragments.fragmentCount !== record.baselineFragmentCount) fail(`baseline fragment contract changed: ${record.route}`);
}

function reviewedBlocksDigest(blocks) {
  return sha256(blocks.map((entry) => [
    entry.baselineBlockSha256,
    entry.occurrences,
    entry.replacementRoute,
    entry.replacementContentSha256,
    entry.reviewEvidence,
    entry.reviewer,
  ].join('\0')).join('\n'));
}

/**
 * A route receipt is the fail-closed answer to content moving during a
 * reframe. It only trusts declared routes and exact, committed content hashes;
 * it never searches the whole site for similar text. Non-exact wording must be
 * accounted for block-by-block with a reviewed semantic-reframe entry.
 */
function validateRetentionReceipt(record, classifiedByRoute) {
  const receipt = record.retentionReceipt;
  if (!receipt || receipt.policy !== 'explicit-route-block-retention-v1'
    || receipt.baselineBlockCount !== record.equivalenceReceipt?.baselineBlocks
    || !HASH.test(receipt.baselineBlockInventorySha256 ?? '')
    || !Array.isArray(receipt.targetEvidence) || !receipt.targetEvidence.length
    || !Array.isArray(receipt.reviewedReframeBlocks)
    || !Number.isSafeInteger(receipt.exactRetainedBlocks) || receipt.exactRetainedBlocks < 0
    || !Number.isSafeInteger(receipt.reviewedReframeBlockCount) || receipt.reviewedReframeBlockCount < 0
    || !HASH.test(receipt.reviewedReframeBlocksSha256 ?? '')) {
    fail(`route lacks an explicit block-retention receipt: ${record.route}`);
    return;
  }
  const targetRoutes = new Set();
  for (const target of receipt.targetEvidence) {
    const classified = classifiedByRoute.get(target?.route);
    if (!classified || targetRoutes.has(target.route)
      || !HASH.test(target.acceptedContentSha256 ?? '')
      || !HASH.test(target.acceptedBlockInventorySha256 ?? '')
      || target.acceptedContentSha256 !== classified.acceptedContentSha256
      || target.acceptedBlockInventorySha256 !== classified.acceptedBlockInventorySha256) {
      fail(`retention target evidence is invalid: ${record.route} -> ${target?.route ?? '(missing route)'}`);
      continue;
    }
    targetRoutes.add(target.route);
  }
  const exceptions = new Set();
  let reviewedCount = 0;
  for (const entry of receipt.reviewedReframeBlocks) {
    const key = `${entry?.baselineBlockSha256}\0${entry?.replacementRoute}`;
    const target = classifiedByRoute.get(entry?.replacementRoute);
    if (!HASH.test(entry?.baselineBlockSha256 ?? '') || !Number.isSafeInteger(entry?.occurrences) || entry.occurrences < 1
      || exceptions.has(key) || !targetRoutes.has(entry.replacementRoute)
      || entry.replacementContentSha256 !== target?.acceptedContentSha256
      || typeof entry.reviewEvidence !== 'string' || !entry.reviewEvidence.trim()
      || typeof entry.reviewer !== 'string' || !entry.reviewer.trim()) {
      fail(`reviewed reframe block is incomplete or unapproved: ${record.route}`);
      continue;
    }
    exceptions.add(key);
    reviewedCount += entry.occurrences;
  }
  if (reviewedCount !== receipt.reviewedReframeBlockCount
    || reviewedBlocksDigest(receipt.reviewedReframeBlocks) !== receipt.reviewedReframeBlocksSha256) {
    fail(`reviewed reframe block receipt checksum is inconsistent: ${record.route}`);
  }
  if (receipt.exactRetainedBlocks + receipt.reviewedReframeBlockCount !== receipt.baselineBlockCount) {
    fail(`baseline information blocks are not fully accounted for: ${record.route}`);
  }
}

validateIaContract();
if (ROUTE_DISPOSITION_LEDGER.some(({ disposition }) => disposition === 'retire')) fail('route disposition ledger contains a retire entry');

const routeManifest = readJson('src/data/ia-route-baseline.json');
const familyManifest = readJson('src/data/ia-preservation-baseline.json');
if (routeManifest) {
  if (routeManifest.schemaVersion !== 3 || routeManifest.routeCount !== routeManifest.routes?.length
    || routeManifest.addedRouteCount !== routeManifest.addedRoutes?.length) fail('route manifest has an invalid schema or count');
  const all = [...(routeManifest.routes ?? []), ...(routeManifest.addedRoutes ?? [])];
  const files = new Set();
  const routes = new Set();
  for (const record of all) {
    validateRouteMetadata(record);
    if (files.has(record.file) || routes.has(record.route)) fail(`duplicate classified route: ${record.route}`);
    files.add(record.file);
    routes.add(record.route);
    for (const field of ['acceptedRawSha256', 'acceptedContentSha256', 'acceptedBlockInventorySha256', 'acceptedFragmentSha256']) {
      if (!HASH.test(record[field] ?? '')) fail(`${record.route} has invalid ${field}`);
    }
    if (record.acceptedFragmentCount !== record.acceptedFragments?.length
      || sha256((record.acceptedFragments ?? []).join('\n')) !== record.acceptedFragmentSha256) {
      fail(`${record.route} has an inconsistent accepted fragment inventory`);
    }
  }
  const classifiedByRoute = new Map(all.map((record) => [record.route, record]));
  for (const record of routeManifest.routes ?? []) {
    for (const field of ['baselineRawSha256', 'baselineContentSha256', 'baselineFragmentSha256']) {
      if (!HASH.test(record[field] ?? '')) fail(`${record.route} has invalid ${field}`);
    }
    if (record.baselineFragmentCount !== record.baselineFragments?.length
      || sha256((record.baselineFragments ?? []).join('\n')) !== record.baselineFragmentSha256) {
      fail(`${record.route} has an inconsistent baseline fragment inventory`);
    }
    const receipt = record.equivalenceReceipt;
    if (!receipt || !['byte-normalized-equivalent', 'reviewed-reframe-equivalent'].includes(receipt.policy)
      || !receipt.reviewEvidence || !Number.isFinite(receipt.retentionRatio)
      || !HASH.test(receipt.baselineBlockInventorySha256 ?? '')
      || !HASH.test(receipt.acceptedBlockInventorySha256 ?? '')) fail(`route lacks an exact equivalence receipt: ${record.route}`);
    validateRetentionReceipt(record, classifiedByRoute);
    const acceptedFragments = new Set(record.acceptedFragments ?? []);
    for (const fragment of record.baselineFragments ?? []) {
      if (!acceptedFragments.has(fragment)) fail(`deep-linked fragment was not preserved: ${record.route}#${fragment}`);
    }
  }
  for (const record of routeManifest.addedRoutes ?? []) {
    if (record.route === '/v2' || record.route.startsWith('/v2/')) fail(`frozen /v2 family contains new route ${record.route}`);
  }

  const workflow = readFileSync(path.join(ROOT, '.github/workflows/deploy-aws.yml'), 'utf8');
  for (const prefix of routeManifest.externalPrefixes ?? []) {
    if (!workflow.includes(`--exclude "${prefix}*"`)) fail(`deployment does not protect externally retained ${prefix}`);
  }
  if (!workflow.includes('--exclude "ontology/artefacts/*"')) fail('deployment does not protect frozen ontology artefacts');

  if (!options.manifestOnly) {
    const dist = path.join(ROOT, 'dist');
    if (!existsSync(dist) || !statSync(dist).isDirectory()) fail('built dist/ is required for the release preservation gate');
    else {
      const currentFiles = filesUnder(dist).filter((file) => file.endsWith('.html'))
        .map((file) => path.relative(dist, file).split(path.sep).join('/'));
      for (const file of currentFiles) if (!files.has(file)) fail(`unclassified built route: ${routeFromFile(file)}`);
      for (const record of all) {
        const current = path.join(dist, record.file);
        if (!existsSync(current)) {
          if (record.kind !== 'external-retain') fail(`classified bundled route is missing: ${record.route}`);
        } else verifyAcceptedRoute(record, current);
      }
      notes.push(`accepted routes: ${currentFiles.length}/${all.length} built HTML records verified`);
    }
  }

  if (options.strict) {
    if (!existsSync(options.baselineRoot) || !statSync(options.baselineRoot).isDirectory()) fail(`baseline root is not a directory: ${options.baselineRoot}`);
    else for (const record of routeManifest.routes ?? []) {
      const baselineFile = path.join(options.baselineRoot, 'dist', record.file);
      if (!existsSync(baselineFile)) fail(`baseline route is missing: ${record.route}`);
      else verifyBaselineRoute(record, baselineFile);
    }
    notes.push(`baseline routes: ${routeManifest.routeCount} before-state records verified`);
  }
}

if (familyManifest) {
  if (familyManifest.schemaVersion !== 1 || !Array.isArray(familyManifest.families)) fail('family manifest has an invalid schema');
  const seen = new Set();
  for (const family of familyManifest.families ?? []) {
    if (seen.has(family.id)) fail(`duplicate preservation family: ${family.id}`);
    seen.add(family.id);
    if (!['byte-identical', 'regenerate-equivalent', 'reframe-equivalent'].includes(family.policy)
      || !family.owner || !family.dataOwner || !family.consumers?.length || !family.endpoints?.length || !family.journeyTests?.length) {
      fail(`incomplete preservation family contract: ${family.id}`);
    }
    validateInventory(`${family.id} baseline`, family.baseline);
    validateInventory(`${family.id} accepted`, family.accepted);
    if (family.baseline?.count !== EXPECTED_FAMILY_COUNTS[family.id]) fail(`${family.id} baseline count is not the frozen exact count`);
    if (family.policy === 'byte-identical' && family.baseline?.treeSha256 !== family.accepted?.treeSha256) {
      fail(`${family.id} violates byte-identical policy`);
    }
    if (!options.manifestOnly && family.ciMode === 'verify-current') {
      compareInventory(`${family.id} accepted tree`, ROOT, family.acceptedPath, family.accepted);
    }
    if (options.strict) {
      compareInventory(`${family.id} baseline tree`, options.baselineRoot, family.baselinePath, family.baseline);
      compareInventory(`${family.id} accepted tree`, ROOT, family.acceptedPath, family.accepted);
    }
  }
  for (const id of Object.keys(EXPECTED_FAMILY_COUNTS)) if (!seen.has(id)) fail(`missing preservation family: ${id}`);
  for (const journey of familyManifest.runtimeJourneys ?? []) {
    if (!journey.id || !journey.endpoint || !safeRelative(journey.test) || !existsSync(path.join(ROOT, journey.test))) {
      fail(`runtime journey is not executable: ${journey.id ?? '(missing id)'}`);
    }
  }
}

const resources = readJson('src/data/resources-manifest.json');
if (Array.isArray(resources)) {
  const sourceContract = PRESERVATION_LEDGER.find(({ kind }) => kind === 'source-records');
  const paths = resources.map((entry) => entry?.path);
  if (resources.length !== sourceContract?.indexedCount || new Set(paths).size !== paths.length
    || paths.some((entry) => typeof entry !== 'string' || !entry.startsWith('source/'))) {
    fail('committed public source index differs from its exact 790-record contract');
  }
}

const council = readJson('src/data/council-manifest.json');
if (Array.isArray(council)) {
  const markdown = council.filter((entry) => entry?.type === 'file' && entry?.ext === 'md');
  if (markdown.length !== 261 || new Set(council.map((entry) => entry?.path)).size !== council.length) {
    fail('council manifest differs from its exact 261-Markdown contract');
  }
}

const viewer = readFileSync(path.join(ROOT, 'src/pages/resource.astro'), 'utf8');
for (const marker of ['source/', '/resources/', 'council-manifest', 'path=']) if (!viewer.includes(marker)) fail(`source viewer contract is missing ${marker}`);

if (failures.length) {
  for (const message of failures) console.error(`FAIL ${message}`);
  process.exitCode = 1;
} else {
  console.log('PASS IA preservation contract');
  console.log(`  route manifest: ${routeManifest?.routeCount ?? 0} baseline + ${routeManifest?.addedRouteCount ?? 0} classified additions`);
  console.log(`  family manifest: ${familyManifest?.families?.length ?? 0} exact inventories; runtime journeys=${familyManifest?.runtimeJourneys?.length ?? 0}`);
  for (const note of notes) console.log(`  ${note}`);
}
