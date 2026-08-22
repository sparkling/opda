#!/usr/bin/env node
/** Fail-closed route, information, artefact and runtime preservation gate. */
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  blockInventory, existingRetiredPdtf1Outputs, existingRetiredPropertyPackOutputs,
  fileInventory, filesUnder, fragmentContract, informationContract, inventoryDigest,
  isRetiredPropertyPackRoute, parsePreservationArgs, pdtf1MigrationReceipt,
  propertyPackMigrationReceipt, routeFromFile, sha256,
} from './lib/ia-preservation-contract.mjs';
import { baselineNavigationEvidenceFailures, retentionReceiptFailures } from './lib/ia-retention-validator.mjs';
import { composeSchemaToSchemeRouteReceipt } from './lib/schema-to-scheme-route-contract.mjs';
import {
  SCHEMA_TO_SCHEME_SOURCE_ROUTE_MANIFEST, loadPdtf1SourceRouteManifest,
  loadPriorIaFamilyManifest, loadPriorIaRouteManifest, loadSchemaToSchemeSourceRouteManifest,
  manifestRetainedBaselineProjectionMatches, priorFamilyMatches, validatePriorFamilyReceipt, validatePriorManifestReceipt, verifyBaselineRootCommit,
} from './lib/ia-prior-manifest-contract.mjs';
import { composePdtf1ToolReframeReceipt } from './lib/pdtf1-tool-reframes.mjs';
import { validatePdtfSchemaFragmentMigrationReceipt } from './lib/pdtf-schema-fragment-migration.mjs';
import {
  IA_STATUS_REGISTRY_VERSION, PRESERVATION_LEDGER, ROUTE_DISPOSITION_LEDGER, getContentOwner,
  getRouteDisposition, getRouteStatus, validateIaContract,
} from '../src/lib/site-ia.mjs';
import { PROPERTY_PACK_ROUTE_MIGRATION, getPropertyPackReplacementRoute } from '../src/lib/property-pack-routes.mjs';
import {
  PDTF1_ROUTE_MIGRATION, fragmentsPreservedByPdtfSchemaMigration, getPdtf1ReplacementRoute,
  isRetiredPdtf1DocumentationRoute,
  isRetiredPdtf1ManualAlias, isStablePdtfIdentifierRoute } from '../src/lib/pdtf1-routes.mjs';
import { validateLeaseTermCaseCollisionReceipt } from '../src/lib/ontology-case-collision.mjs';
import { getDeclaredRouteReplacement } from '../src/lib/site-route-migrations.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXPECTED_FAMILY_COUNTS = Object.freeze({
  'source-archive': { baseline: 1620 }, 'council-markdown': { baseline: 261 },
  'ontology-artefacts': { baseline: 27, accepted: 27 }, 'deployed-data': { baseline: 46 },
  'ui-assets': { baseline: 53 }, 'image-assets': { baseline: 5 },
  'ontology-tools': { baseline: 837, accepted: 837 }, 'property-pack-canonical': { baseline: 690, accepted: 693 },
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
validateIaContract();
if (ROUTE_DISPOSITION_LEDGER.some(({ disposition }) => disposition === 'retire')) fail('route disposition ledger contains a retire entry');
const routeManifest = readJson(options.routeManifestPath ?? 'src/data/ia-route-baseline.json');
const familyManifest = readJson('src/data/ia-preservation-baseline.json');
let pdtf1SourceManifest = null;
try { ({ manifest: pdtf1SourceManifest } = loadPdtf1SourceRouteManifest(ROOT)); }
catch (error) { fail(`PDTF schema source-route Git evidence is unavailable: ${error.message}`); }
let schemaToSchemeSourceManifest = null;
let schemaToSchemeSourceAdditions = [];
try {
  ({ manifest: schemaToSchemeSourceManifest, supplementalRoutes: schemaToSchemeSourceAdditions }
    = loadSchemaToSchemeSourceRouteManifest(ROOT));
}
catch (error) { fail(`schema-to-scheme source-route Git evidence is unavailable: ${error.message}`); }
let hasPdtf1CutReceipt = false;
let hasSchemaToSchemeReceipt = false;
if (routeManifest) {
  hasPdtf1CutReceipt = routeManifest.schemaVersion === 7 || routeManifest.schemaVersion === 8;
  hasSchemaToSchemeReceipt = routeManifest.schemaVersion === 8;
  const validLegacy = routeManifest.schemaVersion === 6
    && routeManifest.retiredRoutes === undefined && routeManifest.retiredRouteCount === undefined;
  const validCut = hasPdtf1CutReceipt
    && routeManifest.retiredRouteCount === routeManifest.retiredRoutes?.length;
  if ((!validLegacy && !validCut) || routeManifest.routeCount !== routeManifest.routes?.length
    || routeManifest.addedRouteCount !== routeManifest.addedRoutes?.length) {
    fail('route manifest has an invalid schema or count');
  }
  const baselineRecords = routeManifest.routes ?? [];
  const addedRecords = routeManifest.addedRoutes ?? [];
  const retiredRecords = routeManifest.retiredRoutes ?? [];
  const all = [...baselineRecords, ...addedRecords];
  const acceptedFiles = new Set(); const acceptedRoutes = new Set();
  const baselineFiles = new Set(); const baselineRoutes = new Set();
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
    if (!manifestRetainedBaselineProjectionMatches(record, priorByRoute.get(record.baselineRoute))) {
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
    retentionReceiptFailures(record, classifiedByRoute).forEach(fail);
    if (!fragmentsPreservedByPdtfSchemaMigration(record.baselineFragments, record.acceptedFragments)) fail(`deep-linked fragments were not preserved: ${record.baselineRoute}`);
  }
  try {
    const actual = propertyPackMigrationReceipt(baselineRecords, addedRecords,
      PROPERTY_PACK_ROUTE_MIGRATION, getDeclaredRouteReplacement);
    if (JSON.stringify(actual) !== JSON.stringify(routeManifest.propertyPackMigration)) {
      fail('Property Pack migration receipt is inconsistent');
    }
  } catch (error) { fail(`Property Pack migration contract failed: ${error.message}`); }
  if (hasPdtf1CutReceipt && pdtf1SourceManifest) {
    try {
      const actual = pdtf1MigrationReceipt({
        records: baselineRecords,
        addedRecords,
        retiredAliases: retiredRecords,
        migration: PDTF1_ROUTE_MIGRATION,
        replacementRoute: getPdtf1ReplacementRoute,
        sourceManifest: pdtf1SourceManifest,
      });
      if (JSON.stringify(actual) !== JSON.stringify(routeManifest.pdtf1Migration)) {
        fail('PDTF schema source migration receipt is inconsistent');
      }
    } catch (error) { fail(`PDTF schema source migration contract failed: ${error.message}`); }
    const sourceReceiptTargets = new Set();
    for (const source of [...pdtf1SourceManifest.routes, ...pdtf1SourceManifest.addedRoutes]) {
      if (isRetiredPdtf1ManualAlias(source.acceptedRoute)) continue;
      const targetRoute = isStablePdtfIdentifierRoute(source.acceptedRoute)
        ? source.acceptedRoute : getPdtf1ReplacementRoute(source.acceptedRoute);
      if (!targetRoute) continue;
      const target = classifiedByRoute.get(targetRoute);
      const needsReceipt = source.acceptedContentSha256 !== target?.acceptedContentSha256
        || source.acceptedBlockInventorySha256 !== target?.acceptedBlockInventorySha256;
      if (!needsReceipt) {
        if (target?.pdtf1SourceRetentionReceipt) {
          fail(`PDTF schema source receipt is unnecessary: ${source.acceptedRoute}`);
        }
        continue;
      }
      sourceReceiptTargets.add(targetRoute);
      retentionReceiptFailures(target, classifiedByRoute, {
        receipt: target?.pdtf1SourceRetentionReceipt,
        policy: 'explicit-pdtf1-source-block-retention-v1',
        baselineBlockCount: source.equivalenceReceipt?.acceptedBlocks,
        baselineBlockInventorySha256: source.acceptedBlockInventorySha256,
        sourceRoute: source.acceptedRoute,
        label: `PDTF schema source ${source.acceptedRoute}`,
      }).forEach(fail);
    }
    for (const record of all) {
      if (record.pdtf1SourceRetentionReceipt && !sourceReceiptTargets.has(record.acceptedRoute)) {
        fail(`PDTF schema source receipt is orphaned: ${record.acceptedRoute}`);
      }
    }
  }
  if (hasSchemaToSchemeReceipt && pdtf1SourceManifest) {
    try {
      validatePdtfSchemaFragmentMigrationReceipt(
        routeManifest.pdtfSchemaFragmentMigration, baselineRecords, addedRecords,
        [...pdtf1SourceManifest.routes, ...pdtf1SourceManifest.addedRoutes],
      );
    } catch (error) { fail(`PDTF schema fragment migration contract failed: ${error.message}`); }
  }
  if (hasSchemaToSchemeReceipt && schemaToSchemeSourceManifest) {
    try {
      const actual = composeSchemaToSchemeRouteReceipt({
        records: baselineRecords,
        addedRecords,
        sourceManifest: schemaToSchemeSourceManifest,
        sourceAdditions: schemaToSchemeSourceAdditions,
        sourceContract: SCHEMA_TO_SCHEME_SOURCE_ROUTE_MANIFEST,
        replacementRoute: getDeclaredRouteReplacement,
      });
      if (JSON.stringify(actual) !== JSON.stringify(routeManifest.schemaToSchemeMigration)) {
        fail('schema-to-scheme route-composition receipt is inconsistent');
      }
    } catch (error) { fail(`schema-to-scheme route-composition contract failed: ${error.message}`); }
  }
  try {
    validateLeaseTermCaseCollisionReceipt(
      options.manifestOnly ? null : ROOT,
      routeManifest.leaseTermCaseCollision, baselineRecords, addedRecords,
    );
  } catch (error) { fail(`LeaseTerm case-sensitive stable-resource contract failed: ${error.message}`); }
  if (PROPERTY_PACK_ROUTE_MIGRATION.redirects !== false
    || getPropertyPackReplacementRoute('/api/v2/comments') !== null) {
    fail('Property Pack migration affects redirects or /api/v2');
  }
  const workflow = readFileSync(path.join(ROOT, '.github/workflows/deploy-aws.yml'), 'utf8');
  const retainedPdtfPrefixes = [
    'pdtf-schema/schema-derived-ontology/use-and-tooling/tools/ontospy/',
    'pdtf-schema/schema-derived-ontology/use-and-tooling/tools/pylode/',
    'pdtf-schema/schema-derived-ontology/use-and-tooling/tools/shaclplay/',
    'pdtf-schema/schema-derived-ontology/use-and-tooling/tools/widoco/',
  ];
  for (const prefix of retainedPdtfPrefixes) {
    if (!workflow.includes(`--exclude "${prefix}*"`)) fail(`deployment does not protect externally retained ${prefix}`);
  }
  if (!workflow.includes('--exclude "pdtf-schema/schema-derived-ontology/use-and-tooling/artefacts/*"')) {
    fail('deployment does not protect frozen ontology artefacts at their canonical path');
  }
  for (const oldPrefix of ['ontology/artefacts/', 'ontology/tools/ontospy/', 'ontology/tools/pylode/',
    'ontology/tools/shaclplay/', 'ontology/tools/widoco/']) {
    if (workflow.includes(`--exclude "${oldPrefix}*"`)) fail(`deployment still protects retired ${oldPrefix}`);
  }
  if (!options.manifestOnly) {
    const dist = path.join(ROOT, 'dist');
    if (!existsSync(dist) || !statSync(dist).isDirectory()) fail('built dist/ is required for the release preservation gate');
    else {
      for (const output of existingRetiredPropertyPackOutputs(dist, PROPERTY_PACK_ROUTE_MIGRATION)) {
        fail(`retired Property Pack output still exists: ${path.relative(dist, output)}`);
      }
      if (hasPdtf1CutReceipt && pdtf1SourceManifest) {
        for (const output of existingRetiredPdtf1Outputs(
          dist, pdtf1SourceManifest, getPdtf1ReplacementRoute,
        )) fail(`retired PDTF schema output still exists: ${path.relative(dist, output)}`);
      }
      const currentFiles = filesUnder(dist).filter((file) => file.endsWith('.html'))
        .map((file) => path.relative(dist, file).split(path.sep).join('/'));
      for (const file of currentFiles) {
        const route = routeFromFile(file);
        if (isRetiredPropertyPackRoute(route)) fail(`retired Property Pack output still exists: ${route}`);
        if (hasPdtf1CutReceipt && isRetiredPdtf1DocumentationRoute(route)) {
          fail(`retired PDTF schema output still exists: ${route}`);
        }
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
        for (const receipt of [record.retentionReceipt, record.pdtf1SourceRetentionReceipt]) {
          for (const semantic of receipt?.semanticReframeBlocks ?? []) {
            if (!acceptedBlockHashes.get(semantic.replacementRoute)?.has(semantic.replacementBlockSha256)) {
              fail(`semantic replacement block is absent from accepted route: ${record.baselineRoute} -> ${semantic.replacementRoute}`);
            }
          }
        }
      }
      for (const record of addedRecords) {
        for (const semantic of record.pdtf1SourceRetentionReceipt?.semanticReframeBlocks ?? []) {
          if (!acceptedBlockHashes.get(semantic.replacementRoute)?.has(semantic.replacementBlockSha256)) {
            fail(`PDTF schema source replacement block is absent: ${record.acceptedRoute} -> ${semantic.replacementRoute}`);
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
        baselineNavigationEvidenceFailures(record, readFileSync(baselineFile, 'utf8')).forEach(fail);
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
        || family.acceptedPath !== 'dist/spdtf/property-pack')) {
      fail('Property Pack family does not declare the 690 → 691 + 2 migration cut');
    }
    const movedFamilyPath = family.id === 'ontology-tools'
      ? 'public/pdtf-schema/schema-derived-ontology/use-and-tooling/tools'
      : family.id === 'ontology-artefacts'
        ? 'public/pdtf-schema/schema-derived-ontology/use-and-tooling/artefacts' : null;
    if (hasPdtf1CutReceipt && movedFamilyPath
      && (family.baselinePath !== `public/ontology/${family.id.slice('ontology-'.length)}`
        || family.acceptedPath !== movedFamilyPath
        || family.assetClass !== (family.id === 'ontology-tools' ? 'tool-rendering' : 'ontology-serialization'))) {
      fail(`${family.id} does not declare its exact PDTF schema asset move`);
    }
    if (hasPdtf1CutReceipt && family.id === 'ontology-tools') {
      try {
        const receipt = composePdtf1ToolReframeReceipt(family.baseline, family.accepted);
        if (family.policy !== 'reframe-equivalent'
          || JSON.stringify(receipt) !== JSON.stringify(family.reframeReceipt)) {
          fail('ontology-tools reviewed file-reframe receipt is inconsistent');
        }
      } catch (error) { fail(error.message); }
    }
    if (family.policy === 'byte-identical' && family.baseline?.treeSha256 !== family.accepted?.treeSha256) {
      fail(`${family.id} violates byte-identical policy`);
    }
    if (hasPdtf1CutReceipt && movedFamilyPath && !options.manifestOnly) {
      const retiredRoot = path.join(ROOT, family.baselinePath.replace(/^public\//u, 'dist/'));
      for (const record of family.baseline.records) {
        if (existsSync(path.join(retiredRoot, record.path))) {
          fail(`${family.id} still emits retired asset ${record.path}`);
        }
      }
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
    fail(`committed public source index differs from its exact ${sourceContract?.indexedCount ?? 'unknown'}-record contract`);
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
