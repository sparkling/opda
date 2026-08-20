#!/usr/bin/env node
/** Fail-closed route, information, artefact and runtime preservation gate. */
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  blockInventory, existingRetiredPropertyPackOutputs, fileInventory, filesUnder, fragmentContract,
  informationContract, inventoryDigest, isRetiredPropertyPackRoute, linkedInformationBlocks,
  nonInformationBlocksDigest,
  parsePreservationArgs, propertyPackMigrationReceipt, routeFromFile, semanticBlocksDigest, sha256,
} from './lib/ia-preservation-contract.mjs';
import {
  loadPriorIaFamilyManifest, loadPriorIaRouteManifest, manifestRetainedRecordMatches,
  priorFamilyMatches, validatePriorFamilyReceipt, validatePriorManifestReceipt,
  verifyBaselineRootCommit,
} from './lib/ia-prior-manifest-contract.mjs';
import {
  IA_STATUS_REGISTRY_VERSION, PRESERVATION_LEDGER, ROUTE_DISPOSITION_LEDGER,
  getContentOwner, getRouteDisposition, getRouteStatus, validateIaContract,
} from '../src/lib/site-ia.mjs';
import { PROPERTY_PACK_ROUTE_MIGRATION, getPropertyPackReplacementRoute } from '../src/lib/property-pack-routes.mjs';
import { validateLeaseTermCaseCollisionReceipt } from '../src/lib/ontology-case-collision.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXPECTED_FAMILY_COUNTS = Object.freeze({
  'source-archive': { baseline: 1620 },
  'council-markdown': { baseline: 261 },
  'ontology-artefacts': { baseline: 27 },
  'deployed-data': { baseline: 46 },
  'ui-assets': { baseline: 53 },
  'image-assets': { baseline: 5 },
  'ontology-tools': { baseline: 837 },
  'property-pack-canonical': { baseline: 690, accepted: 693 },
});
const HASH = /^[a-f0-9]{64}$/u;
const failures = [];
const notes = [];
const fail = (message) => failures.push(message);
let options;
try { options = parsePreservationArgs(process.argv.slice(2)); }
catch (error) {
  console.error(`FAIL usage: ${error.message}`);
  process.exit(2);
}
function readJson(relative) {
  const file = path.isAbsolute(relative) ? relative : path.join(ROOT, relative);
  try { return JSON.parse(readFileSync(file, 'utf8')); }
  catch (error) { fail(`${relative}: invalid or unreadable JSON (${error.message})`); return null; }
}
function safeRelative(value) {
  return typeof value === 'string' && value.length > 0 && !path.isAbsolute(value)
    && !value.split('/').includes('..');
}
function statusId(route) {
  return `${IA_STATUS_REGISTRY_VERSION}:${sha256(JSON.stringify(getRouteStatus(route))).slice(0, 16)}`;
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
function validateRouteMetadata(record, baselineRecord) {
  const required = [
    'acceptedRoute', 'acceptedFile', 'kind', 'acceptedGeneratedFamily', 'contentOwner', 'governanceOwner',
    'statusId', 'searchFacet', 'preservedDestination',
  ];
  if (required.some((field) => typeof record[field] !== 'string' || !record[field])) {
    fail(`route record is incomplete: ${record.acceptedFile ?? '(missing file)'}`);
    return;
  }
  if ((baselineRecord && (!record.baselineRoute?.startsWith('/') || !safeRelative(record.baselineFile)
      || typeof record.baselineGeneratedFamily !== 'string' || !record.baselineGeneratedFamily))
    || !safeRelative(record.acceptedFile) || !record.acceptedRoute.startsWith('/') || !record.consumers?.length
    || !record.endpoints?.length || !record.crossWorkArea?.length) {
    fail(`route record has unsafe or incomplete contracts: ${record.acceptedFile}`);
    return;
  }
  const disposition = getRouteDisposition(record.acceptedRoute);
  const owner = getContentOwner(record.acceptedRoute);
  if (!disposition || disposition.owner !== record.contentOwner || owner !== record.contentOwner) {
    fail(`route owner/disposition drift: ${record.acceptedRoute}`);
  }
  if (record.statusId !== statusId(record.acceptedRoute)) fail(`route status registry drift: ${record.acceptedRoute}`);
  if (record.searchFacet !== disposition?.search.workArea) fail(`route search facet drift: ${record.acceptedRoute}`);
}
function verifyAcceptedRoute(record, file) {
  const html = readFileSync(file, 'utf8');
  const content = informationContract(html);
  const fragments = fragmentContract(html);
  if (sha256(html) !== record.acceptedRawSha256) fail(`accepted HTML checksum changed: ${record.acceptedRoute}`);
  if (content.contentSha256 !== record.acceptedContentSha256) fail(`accepted information checksum changed: ${record.acceptedRoute}`);
  if (blockInventory(content.blockHashes).sha256 !== record.acceptedBlockInventorySha256) {
    fail(`accepted information-block inventory changed: ${record.acceptedRoute}`);
  }
  if (fragments.fragmentSha256 !== record.acceptedFragmentSha256
    || fragments.fragmentCount !== record.acceptedFragmentCount) fail(`accepted fragment contract changed: ${record.acceptedRoute}`);
  return content;
}
function verifyBaselineRoute(record, file) {
  const html = readFileSync(file, 'utf8');
  const content = informationContract(html);
  const fragments = fragmentContract(html);
  if (sha256(html) !== record.baselineRawSha256) fail(`baseline HTML checksum changed: ${record.baselineRoute}`);
  if (content.contentSha256 !== record.baselineContentSha256) fail(`baseline information checksum changed: ${record.baselineRoute}`);
  if (blockInventory(content.blockHashes).sha256 !== record.equivalenceReceipt?.baselineBlockInventorySha256) {
    fail(`baseline information-block inventory changed: ${record.baselineRoute}`);
  }
  if (fragments.fragmentSha256 !== record.baselineFragmentSha256
    || fragments.fragmentCount !== record.baselineFragmentCount) fail(`baseline fragment contract changed: ${record.baselineRoute}`);
}
const SEMANTIC_CLASSES = new Set([
  'terminology-and-scope-reframe',
  'authority-and-label-reframe',
  'decision-status-update',
  'scope-and-maturity-clarification',
]);
const NON_INFORMATION_CLASS = 'superseded-navigation-copy';
const NAVIGATION_EVIDENCE = new Set(['containing-link', 'declared-original-destination']);
const NAVIGATION_CANONICAL_EQUIVALENTS = Object.freeze({
  '/strategy': ['/programme'],
  '/model': ['/pdtf-1'],
  '/implementation': ['/pdtf-1'],
  '/library': ['/resources'],
  '/engagement': ['/resources', '/spdtf-2/working-groups'],
  '/v2': ['/spdtf-2/property-pack'],
});
function localRouteFromHref(href) {
  if (typeof href !== 'string' || !href.startsWith('/')) return null;
  const pathname = href.split(/[?#]/u, 1)[0];
  return pathname.length > 1 ? pathname.replace(/\/+$/u, '') : '/';
}
function validNavigationDestination(entry) {
  return (entry.destinationPolicy === 'same-retained-route'
    && entry.destinationRoute === entry.originalDestinationRoute)
    || (entry.destinationPolicy === 'canonical-equivalent'
      && NAVIGATION_CANONICAL_EQUIVALENTS[entry.originalDestinationRoute]?.includes(entry.destinationRoute));
}
/**
 * A route receipt is the fail-closed answer to content moving during a
 * reframe. It only trusts declared routes and exact, committed content hashes;
 * it never searches the whole site for similar text. Non-exact wording must be
 * bound block-by-block to one concrete replacement block in the committed
 * semantic-reframe ledger.
 */
function validateRetentionReceipt(record, classifiedByRoute) {
  const receipt = record.retentionReceipt;
  if (!receipt || receipt.policy !== 'explicit-route-block-retention-v1'
    || receipt.baselineBlockCount !== record.equivalenceReceipt?.baselineBlocks
    || !HASH.test(receipt.baselineBlockInventorySha256 ?? '')
    || !Array.isArray(receipt.targetEvidence) || !receipt.targetEvidence.length
    || !Array.isArray(receipt.semanticReframeBlocks)
    || !Array.isArray(receipt.nonInformationBlocks)
    || !Number.isSafeInteger(receipt.exactRetainedBlocks) || receipt.exactRetainedBlocks < 0
    || !Number.isSafeInteger(receipt.semanticReframeBlockCount) || receipt.semanticReframeBlockCount < 0
    || !Number.isSafeInteger(receipt.nonInformationBlockCount) || receipt.nonInformationBlockCount < 0
    || !HASH.test(receipt.semanticReframeBlocksSha256 ?? '')
    || !HASH.test(receipt.nonInformationBlocksSha256 ?? '')) {
    fail(`route lacks an explicit block-retention receipt: ${record.baselineRoute}`);
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
      fail(`retention target evidence is invalid: ${record.baselineRoute} -> ${target?.route ?? '(missing route)'}`);
      continue;
    }
    targetRoutes.add(target.route);
  }
  const resolutions = new Set();
  let semanticCount = 0;
  for (const entry of receipt.semanticReframeBlocks) {
    const key = `${entry?.sourceBlockSha256}\0${entry?.replacementRoute}\0${entry?.replacementBlockSha256}`;
    const target = classifiedByRoute.get(entry?.replacementRoute);
    if (!HASH.test(entry?.sourceBlockSha256 ?? '') || !HASH.test(entry?.replacementBlockSha256 ?? '')
      || !Number.isSafeInteger(entry?.occurrences) || entry.occurrences < 1
      || resolutions.has(key) || !targetRoutes.has(entry.replacementRoute)
      || entry.replacementContentSha256 !== target?.acceptedContentSha256
      || !SEMANTIC_CLASSES.has(entry.classification)
      || typeof entry.reviewNote !== 'string' || !entry.reviewNote.trim()
      || typeof entry.sourceTag !== 'string' || typeof entry.replacementTag !== 'string'
      || typeof entry.sourceText !== 'string' || typeof entry.replacementText !== 'string'
      || sha256(`${entry.sourceTag}\0${entry.sourceText}`) !== entry.sourceBlockSha256
      || sha256(`${entry.replacementTag}\0${entry.replacementText}`) !== entry.replacementBlockSha256
      || !entry.reviewNote.includes(entry.sourceText)
      || !entry.reviewNote.includes(entry.replacementText)) {
      fail(`semantic reframe block is incomplete or unbound: ${record.baselineRoute}`);
      continue;
    }
    resolutions.add(key);
    semanticCount += entry.occurrences;
  }
  if (semanticCount !== receipt.semanticReframeBlockCount
    || semanticBlocksDigest(receipt.semanticReframeBlocks) !== receipt.semanticReframeBlocksSha256) {
    fail(`semantic reframe block receipt checksum is inconsistent: ${record.baselineRoute}`);
  }
  const nonInformation = new Set();
  let nonInformationCount = 0;
  for (const entry of receipt.nonInformationBlocks) {
    const target = classifiedByRoute.get(entry?.destinationRoute);
    if (!HASH.test(entry?.sourceBlockSha256 ?? '') || !Number.isSafeInteger(entry?.occurrences) || entry.occurrences < 1
      || nonInformation.has(entry.sourceBlockSha256) || entry.classification !== NON_INFORMATION_CLASS
      || !target || entry.destinationContentSha256 !== target.acceptedContentSha256
      || typeof entry.sourceTag !== 'string' || typeof entry.sourceText !== 'string'
      || sha256(`${entry.sourceTag}\0${entry.sourceText}`) !== entry.sourceBlockSha256
      || !entry.originalDestinationRoute?.startsWith('/') || !entry.destinationRoute?.startsWith('/')
      || !validNavigationDestination(entry) || !NAVIGATION_EVIDENCE.has(entry.sourceEvidence)
      || (entry.sourceEvidence === 'containing-link'
        ? localRouteFromHref(entry.baselineLinkHref) !== entry.originalDestinationRoute
        : entry.baselineLinkHref !== null)
      || typeof entry.supersessionReason !== 'string' || !entry.supersessionReason.includes(entry.sourceText)
      || !entry.supersessionReason.includes(entry.originalDestinationRoute)
      || (!entry.supersessionReason.includes(entry.destinationRoute)
        && !getPropertyPackReplacementRoute(entry.originalDestinationRoute))) {
      fail(`non-information supersession is incomplete or unbound: ${record.baselineRoute}`);
      continue;
    }
    nonInformation.add(entry.sourceBlockSha256);
    nonInformationCount += entry.occurrences;
  }
  if (nonInformationCount !== receipt.nonInformationBlockCount
    || nonInformationBlocksDigest(receipt.nonInformationBlocks) !== receipt.nonInformationBlocksSha256) {
    fail(`non-information supersession receipt checksum is inconsistent: ${record.baselineRoute}`);
  }
  if (receipt.exactRetainedBlocks + receipt.semanticReframeBlockCount + receipt.nonInformationBlockCount !== receipt.baselineBlockCount) {
    fail(`baseline information blocks are not fully accounted for: ${record.baselineRoute}`);
  }
}
function verifyBaselineNavigationEvidence(record, html) {
  const sourceLinks = new Map();
  for (const { hash, containingLink } of linkedInformationBlocks(html)) {
    if (!sourceLinks.has(hash)) sourceLinks.set(hash, new Set());
    sourceLinks.get(hash).add(containingLink || null);
  }
  for (const entry of record.retentionReceipt?.nonInformationBlocks ?? []) {
    const hrefs = sourceLinks.get(entry.sourceBlockSha256) ?? new Set();
    const actualHref = hrefs.values().next().value;
    const supported = entry.sourceEvidence === 'containing-link'
      ? hrefs.size === 1 && actualHref === entry.baselineLinkHref
        && localRouteFromHref(actualHref) === entry.originalDestinationRoute
      : hrefs.size === 1 && actualHref === null;
    if (!supported) fail(`baseline navigation provenance changed or is ambiguous: ${record.baselineRoute}#${entry.sourceBlockSha256}`);
  }
}
validateIaContract();
if (ROUTE_DISPOSITION_LEDGER.some(({ disposition }) => disposition === 'retire')) fail('route disposition ledger contains a retire entry');
const routeManifest = readJson(options.routeManifestPath ?? 'src/data/ia-route-baseline.json');
const familyManifest = readJson('src/data/ia-preservation-baseline.json');
if (routeManifest) {
  if (routeManifest.schemaVersion !== 6 || routeManifest.routeCount !== routeManifest.routes?.length
    || routeManifest.addedRouteCount !== routeManifest.addedRoutes?.length) fail('route manifest has an invalid schema or count');
  const baselineRecords = routeManifest.routes ?? [];
  const addedRecords = routeManifest.addedRoutes ?? [];
  const all = [...baselineRecords, ...addedRecords];
  const acceptedFiles = new Set();
  const acceptedRoutes = new Set();
  const baselineFiles = new Set();
  const baselineRoutes = new Set();
  const baselineRecordSet = new Set(baselineRecords);
  const manifestRetained = baselineRecords.filter(({ baselineEvidence }) => baselineEvidence);
  const priorReceipt = routeManifest.priorManifestReceipt;
  try { validatePriorManifestReceipt(priorReceipt, manifestRetained); }
  catch (error) { fail(error.message); }
  let priorByRoute = new Map();
  try {
    const { manifest: prior } = loadPriorIaRouteManifest(ROOT);
    priorByRoute = new Map((prior.routes ?? []).map((record) => [record.route, record]));
  } catch (error) { fail(`prior IA manifest Git evidence is unavailable: ${error.message}`); }
  for (const record of manifestRetained) {
    if (!manifestRetainedRecordMatches(record, priorByRoute.get(record.baselineRoute))) {
      fail(`baseline route lacks exact prior-manifest evidence: ${record.baselineRoute}`);
    }
  }
  for (const record of all) {
    const isBaseline = baselineRecordSet.has(record);
    validateRouteMetadata(record, isBaseline);
    if (acceptedFiles.has(record.acceptedFile) || acceptedRoutes.has(record.acceptedRoute)) {
      fail(`duplicate accepted route: ${record.acceptedRoute}`);
    }
    acceptedFiles.add(record.acceptedFile);
    acceptedRoutes.add(record.acceptedRoute);
    if (isBaseline) {
      if (baselineFiles.has(record.baselineFile) || baselineRoutes.has(record.baselineRoute)) {
        fail(`duplicate baseline route: ${record.baselineRoute}`);
      }
      baselineFiles.add(record.baselineFile);
      baselineRoutes.add(record.baselineRoute);
      if (safeRelative(record.baselineFile) && routeFromFile(record.baselineFile) !== record.baselineRoute) {
        fail(`baseline route/file mismatch: ${record.baselineRoute}`);
      }
    }
    if (safeRelative(record.acceptedFile) && routeFromFile(record.acceptedFile) !== record.acceptedRoute) {
      fail(`accepted route/file mismatch: ${record.acceptedRoute}`);
    }
    for (const field of ['acceptedRawSha256', 'acceptedContentSha256', 'acceptedBlockInventorySha256', 'acceptedFragmentSha256']) {
      if (!HASH.test(record[field] ?? '')) fail(`${record.acceptedRoute} has invalid ${field}`);
    }
    if (record.acceptedFragmentCount !== record.acceptedFragments?.length
      || sha256((record.acceptedFragments ?? []).join('\n')) !== record.acceptedFragmentSha256) {
      fail(`${record.acceptedRoute} has an inconsistent accepted fragment inventory`);
    }
  }
  const classifiedByRoute = new Map(all.map((record) => [record.acceptedRoute, record]));
  for (const record of baselineRecords) {
    for (const field of ['baselineRawSha256', 'baselineContentSha256', 'baselineFragmentSha256']) {
      if (!HASH.test(record[field] ?? '')) fail(`${record.baselineRoute} has invalid ${field}`);
    }
    if (record.baselineFragmentCount !== record.baselineFragments?.length
      || sha256((record.baselineFragments ?? []).join('\n')) !== record.baselineFragmentSha256) {
      fail(`${record.baselineRoute} has an inconsistent baseline fragment inventory`);
    }
    const receipt = record.equivalenceReceipt;
    if (!receipt || !['byte-normalized-equivalent', 'reviewed-reframe-equivalent'].includes(receipt.policy)
      || !receipt.reviewEvidence || !Number.isFinite(receipt.retentionRatio)
      || !HASH.test(receipt.baselineBlockInventorySha256 ?? '')
      || !HASH.test(receipt.acceptedBlockInventorySha256 ?? '')) fail(`route lacks an exact equivalence receipt: ${record.baselineRoute}`);
    validateRetentionReceipt(record, classifiedByRoute);
    const acceptedFragments = new Set(record.acceptedFragments ?? []);
    for (const fragment of record.baselineFragments ?? []) {
      if (!acceptedFragments.has(fragment)) fail(`deep-linked fragment was not preserved: ${record.baselineRoute}#${fragment}`);
    }
  }
  try {
    const actual = propertyPackMigrationReceipt(
      baselineRecords, addedRecords, PROPERTY_PACK_ROUTE_MIGRATION, getPropertyPackReplacementRoute,
    );
    if (JSON.stringify(actual) !== JSON.stringify(routeManifest.propertyPackMigration)) {
      fail('Property Pack migration receipt is inconsistent');
    }
  } catch (error) { fail(`Property Pack migration contract failed: ${error.message}`); }
  try {
    validateLeaseTermCaseCollisionReceipt(
      options.manifestOnly ? null : ROOT,
      routeManifest.leaseTermCaseCollision, baselineRecords, addedRecords,
    );
  } catch (error) { fail(`LeaseTerm case-collision migration contract failed: ${error.message}`); }
  if (PROPERTY_PACK_ROUTE_MIGRATION.redirects !== false
    || getPropertyPackReplacementRoute('/api/v2/comments') !== null) {
    fail('Property Pack migration affects redirects or /api/v2');
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
      for (const output of existingRetiredPropertyPackOutputs(dist, PROPERTY_PACK_ROUTE_MIGRATION)) {
        fail(`retired Property Pack output still exists: ${path.relative(dist, output)}`);
      }
      const currentFiles = filesUnder(dist).filter((file) => file.endsWith('.html'))
        .map((file) => path.relative(dist, file).split(path.sep).join('/'));
      for (const file of currentFiles) {
        const route = routeFromFile(file);
        if (isRetiredPropertyPackRoute(route)) fail(`retired Property Pack output still exists: ${route}`);
        if (!acceptedFiles.has(file)) fail(`unclassified built route: ${route}`);
      }
      const acceptedBlockHashes = new Map();
      for (const record of all) {
        if (!safeRelative(record.acceptedFile)) continue;
        const current = path.join(dist, record.acceptedFile);
        if (!existsSync(current)) {
          if (record.kind !== 'external-retain') fail(`classified bundled route is missing: ${record.acceptedRoute}`);
        } else acceptedBlockHashes.set(record.acceptedRoute, new Set(verifyAcceptedRoute(record, current).blockHashes));
      }
      for (const record of baselineRecords) {
        for (const semantic of record.retentionReceipt?.semanticReframeBlocks ?? []) {
          if (!acceptedBlockHashes.get(semantic.replacementRoute)?.has(semantic.replacementBlockSha256)) {
            fail(`semantic replacement block is absent from accepted route: ${record.baselineRoute} -> ${semantic.replacementRoute}`);
          }
        }
      }
      notes.push(`accepted routes: ${currentFiles.length}/${all.length} built HTML records verified`);
    }
  }
  if (options.strict) {
    try { verifyBaselineRootCommit(options.baselineRoot); }
    catch (error) { fail(error.message); }
    if (!existsSync(options.baselineRoot) || !statSync(options.baselineRoot).isDirectory()) fail(`baseline root is not a directory: ${options.baselineRoot}`);
    else for (const record of baselineRecords) {
      if (!safeRelative(record.baselineFile)) continue;
      if (record.baselineEvidence) continue;
      const baselineFile = path.join(options.baselineRoot, 'dist', record.baselineFile);
      if (!existsSync(baselineFile)) fail(`baseline route is missing: ${record.baselineRoute}`);
      else {
        verifyBaselineRoute(record, baselineFile);
        verifyBaselineNavigationEvidence(record, readFileSync(baselineFile, 'utf8'));
      }
    }
    notes.push(`baseline routes: ${routeManifest.routeCount} before-state records verified`);
  }
}
if (familyManifest) {
  if (familyManifest.schemaVersion !== 1 || !Array.isArray(familyManifest.families)) fail('family manifest has an invalid schema');
  try { validatePriorFamilyReceipt(familyManifest.priorManifestReceipt, familyManifest.families); }
  catch (error) { fail(error.message); }
  let priorFamilies = new Map();
  try {
    const { manifest } = loadPriorIaFamilyManifest(ROOT);
    priorFamilies = new Map(manifest.families.map((family) => [family.id, family]));
  } catch (error) { fail(`prior IA family Git evidence is unavailable: ${error.message}`); }
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
    const expectedCounts = EXPECTED_FAMILY_COUNTS[family.id];
    if (family.baseline?.count !== expectedCounts?.baseline) fail(`${family.id} baseline count is not the frozen exact count`);
    if (expectedCounts?.accepted !== undefined && family.accepted?.count !== expectedCounts.accepted) {
      fail(`${family.id} accepted count is not the canonical exact count`);
    }
    if (family.id === 'property-pack-canonical'
      && (family.technicalMappedRouteCount !== 690 || family.canonicalContentRouteCount !== 691
        || family.lifecyclePageCount !== 2 || family.baselinePath !== 'dist/v2'
        || family.acceptedPath !== 'dist/spdtf-2/property-pack')) {
      fail('Property Pack family does not declare the 690 → 691 + 2 migration cut');
    }
    if (family.policy === 'byte-identical' && family.baseline?.treeSha256 !== family.accepted?.treeSha256) {
      fail(`${family.id} violates byte-identical policy`);
    }
    if (!options.manifestOnly && family.ciMode === 'verify-current') {
      compareInventory(`${family.id} accepted tree`, ROOT, family.acceptedPath, family.accepted);
    }
    if (!priorFamilyMatches(family, priorFamilies.get(family.baselineEvidence?.sourceFamilyId))) {
      fail(`${family.id} baseline differs from prior family evidence`);
    }
    if (options.strict) {
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
