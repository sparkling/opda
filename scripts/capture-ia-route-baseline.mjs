#!/usr/bin/env node
/** Capture frozen before/after information and artefact preservation contracts. */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  blockInventory, composePdtf1RetiredAliases, equivalenceReceipt,
  existingRetiredPdtf1Outputs, existingRetiredPropertyPackOutputs,
  fileInventory, filesUnder, fragmentContract, generatedFamily,
  informationContract, isRetiredPropertyPackRoute,
  pdtf1MigrationReceipt, propertyPackMigrationReceipt, routeFromFile,
  sha256,
} from './lib/ia-preservation-contract.mjs';
import { createCaptureEvidence } from './lib/ia-capture-evidence.mjs';
import { composePdtf1ToolReframeReceipt } from './lib/pdtf1-tool-reframes.mjs';
import {
  PRIOR_IA_ROUTE_MANIFEST,
  composePriorFamilyReceipt, composePriorManifestReceipt,
  loadPdtf1SourceRouteManifest, loadPriorIaFamilyManifest, loadPriorIaRouteManifest,
  manifestRetainedSourceRecordMatches,
  missingPhysicalRecordsDigest,
  priorRouteRecordDigest, verifyBaselineRootCommit, verifyPdtf1SourceRootCommit,
} from './lib/ia-prior-manifest-contract.mjs';
import {
  IA_STATUS_REGISTRY_VERSION,
  getContentOwner,
  getRouteDisposition,
  getRouteStatus,
} from '../src/lib/site-ia.mjs';
import { PROPERTY_PACK_ROUTE_MIGRATION, getPropertyPackReplacementRoute } from '../src/lib/property-pack-routes.mjs';
import {
  PDTF1_ROUTE_MIGRATION, isRetiredPdtf1ManualAlias, isStablePdtfIdentifierRoute,
} from '../src/lib/pdtf1-routes.mjs';
import { composeLeaseTermCaseCollisionReceipt } from '../src/lib/ontology-case-collision.mjs';
import {
  getAcceptedRoute, getAcceptedRouteFile, getDeclaredRouteReplacement,
} from '../src/lib/site-route-migrations.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Map(process.argv.slice(2).map((arg) => {
  const offset = arg.indexOf('=');
  if (offset < 0) return [arg, ''];
  return [arg.slice(0, offset), arg.slice(offset + 1)];
}));
const baselineRoot = args.get('--baseline-root');
const sourceRoot = args.get('--source-root');
const acceptedRoot = args.get('--accepted-root') || ROOT;
for (const key of args.keys()) {
  if (!['--baseline-root', '--source-root', '--accepted-root'].includes(key)) {
    throw new Error(`unknown argument: ${key}`);
  }
}
for (const [label, value] of [['baseline', baselineRoot], ['PDTF 1.0 source', sourceRoot], ['accepted', acceptedRoot]]) {
  if (!value || !path.isAbsolute(value) || !existsSync(value)) {
    throw new Error(`${label} root must be an existing absolute path`);
  }
}
const output = path.join(ROOT, 'src/data/ia-route-baseline.json');
const familyOutput = path.join(ROOT, 'src/data/ia-preservation-baseline.json');
const semanticLedgerPath = path.join(ROOT, 'src/data/ia-semantic-reframe-ledger.json');
const externalPrefixes = [
  'pdtf-1/extracted-ontology/use-and-tooling/tools/ontospy/',
  'pdtf-1/extracted-ontology/use-and-tooling/tools/pylode/',
  'pdtf-1/extracted-ontology/use-and-tooling/tools/shaclplay/',
  'pdtf-1/extracted-ontology/use-and-tooling/tools/widoco/',
];
function commit(root) {
  return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
}
function htmlFiles(root) {
  const dist = path.join(root, 'dist');
  return filesUnder(dist)
    .filter((file) => file.endsWith('.html'))
    .map((file) => path.relative(dist, file).split(path.sep).join('/'));
}
function routeMetadata(route) {
  const disposition = getRouteDisposition(route);
  if (!disposition) throw new Error(`route has no migration disposition: ${route}`);
  const contentOwner = getContentOwner(route) ?? disposition.owner;
  if (contentOwner !== disposition.owner) {
    throw new Error(`route owner conflict for ${route}: ${contentOwner} != ${disposition.owner}`);
  }
  const status = getRouteStatus(route);
  const statusId = `${IA_STATUS_REGISTRY_VERSION}:${sha256(JSON.stringify(status)).slice(0, 16)}`;
  return {
    disposition: disposition.disposition,
    contentOwner,
    governanceOwner: disposition.governanceOwner,
    statusId,
    searchFacet: disposition.search.workArea,
    crossWorkArea: disposition.crossWorkArea,
    preservedDestination: disposition.preservedAt,
    consumers: disposition.consumers,
    endpoints: disposition.endpoints,
  };
}
function acceptedRouteFor(route) {
  return getAcceptedRoute(route);
}
function reframeEvidence(route) {
  if (route === '/' || route === '/home') return 'Task-gateway recomposition; every former destination route remains classified and reachable';
  if (route === '/v2' || route.startsWith('/v2/')) return 'The 690-page Property Pack technical cut moves atomically to its canonical SPDTF 2.0 route family';
  if (route === '/dbt-smart-data' || route.startsWith('/dbt-smart-data/')) return 'Authority and continuation terminology corrected without removing the source analysis';
  if (route === '/mapping' || route.startsWith('/mapping/')) return 'Legacy RML verification distinguished from SPDTF 2.0 semantic mapping';
  if (route === '/modelling' || route.startsWith('/modelling/')) return 'PDTF 1.0 historical modelling scope and child maturity made explicit';
  return 'ADR-0074 route disposition plus exact before/after information and fragment checksums';
}
const baselineCommit = commit(baselineRoot);
const acceptedCommit = commit(acceptedRoot);
const { baselineLinkEvidence, captureRetentionReceipt, semanticReframes } = createCaptureEvidence({
  semanticLedgerPath, baselineCommit,
});
verifyBaselineRootCommit(baselineRoot);
verifyPdtf1SourceRootCommit(sourceRoot);
const { manifest: priorManifest } = loadPriorIaRouteManifest(ROOT);
const { manifest: pdtf1SourceManifest } = loadPdtf1SourceRouteManifest(ROOT);
if (priorManifest.baselineCommit !== baselineCommit) throw new Error('prior manifest baseline commit changed');
const priorByFile = new Map(priorManifest.routes.map((record) => [record.file, record]));
const pdtf1SourceByBaselineFile = new Map(
  [...pdtf1SourceManifest.routes, ...pdtf1SourceManifest.addedRoutes]
    .filter((record) => record.baselineFile)
    .map((record) => [record.baselineFile, record]),
);
const pdtf1SourceByAcceptedRoute = new Map();
for (const sourceRecord of [...pdtf1SourceManifest.routes, ...pdtf1SourceManifest.addedRoutes]) {
  const sourceRoute = sourceRecord.acceptedRoute;
  if (isRetiredPdtf1ManualAlias(sourceRoute)) continue;
  const replacement = isStablePdtfIdentifierRoute(sourceRoute)
    ? sourceRoute : getDeclaredRouteReplacement(sourceRoute);
  if (!replacement) continue;
  if (pdtf1SourceByAcceptedRoute.has(replacement)) {
    throw new Error(`PDTF 1.0 source routes do not map bijectively: ${replacement}`);
  }
  pdtf1SourceByAcceptedRoute.set(replacement, sourceRecord);
}
const physicalBaselineFiles = htmlFiles(baselineRoot);
const physicalBaselineSet = new Set(physicalBaselineFiles);
const missingPhysicalRecords = priorManifest.routes.filter(({ file }) => !physicalBaselineSet.has(file));
const unexpectedPhysicalFiles = physicalBaselineFiles.filter((file) => !priorByFile.has(file));
if (missingPhysicalRecords.length !== PRIOR_IA_ROUTE_MANIFEST.missingPhysicalRouteCount
  || missingPhysicalRecordsDigest(missingPhysicalRecords) !== PRIOR_IA_ROUTE_MANIFEST.missingPhysicalRecordsSha256
  || unexpectedPhysicalFiles.length) {
  throw new Error('physical plus manifest-retained baseline does not reconstruct the frozen route cut');
}
const manifestRetainedRecords = priorManifest.routes.filter((prior) => {
  if (!physicalBaselineSet.has(prior.file)) return true;
  const html = readFileSync(path.join(baselineRoot, 'dist', prior.file), 'utf8');
  return blockInventory(informationContract(html).blockHashes).sha256
    !== prior.equivalenceReceipt.baselineBlockInventorySha256;
});
if (manifestRetainedRecords.length !== PRIOR_IA_ROUTE_MANIFEST.manifestRetainedRouteCount) {
  throw new Error('manifest-retained information cut differs from the pinned prior evidence');
}
const manifestRetainedFiles = new Set(manifestRetainedRecords.map(({ file }) => file));
const baselineFiles = priorManifest.routes.map(({ file }) => file).sort();
const acceptedFiles = htmlFiles(acceptedRoot);
if (PROPERTY_PACK_ROUTE_MIGRATION.redirects !== false
  || getPropertyPackReplacementRoute('/api/v2/comments') !== null) {
  throw new Error('Property Pack migration must remove old content routes without affecting /api/v2');
}
const retiredOutputs = acceptedFiles.filter((file) => isRetiredPropertyPackRoute(routeFromFile(file)));
if (retiredOutputs.length) throw new Error(`accepted tree emits ${retiredOutputs.length} retired Property Pack routes`);
const retiredTrees = existingRetiredPropertyPackOutputs(path.join(acceptedRoot, 'dist'), PROPERTY_PACK_ROUTE_MIGRATION);
if (retiredTrees.length) throw new Error(`accepted tree retains retired Property Pack output: ${retiredTrees.join(', ')}`);
const retiredPdtf1Outputs = existingRetiredPdtf1Outputs(
  path.join(acceptedRoot, 'dist'), pdtf1SourceManifest, getDeclaredRouteReplacement,
);
if (retiredPdtf1Outputs.length) {
  throw new Error(`accepted tree retains retired PDTF 1.0 output: ${retiredPdtf1Outputs.join(', ')}`);
}
const acceptedContracts = new Map(acceptedFiles.map((file) => {
  const route = routeFromFile(file);
  return [route, informationContract(readFileSync(path.join(acceptedRoot, 'dist', file), 'utf8'))];
}));
const routes = baselineFiles.filter((file) => !isRetiredPdtf1ManualAlias(routeFromFile(file))).map((file) => {
  const baselineRoute = routeFromFile(file);
  const acceptedRoute = acceptedRouteFor(baselineRoute);
  const acceptedFile = getAcceptedRouteFile(baselineRoute, file);
  const acceptedPath = path.join(acceptedRoot, 'dist', acceptedFile);
  const priorRecord = priorByFile.get(file);
  const baselinePath = path.join(baselineRoot, 'dist', file);
  const missingPhysical = !existsSync(baselinePath);
  const manifestRetained = manifestRetainedFiles.has(file);
  const mode = missingPhysical ? 'external-retain'
    : priorRecord?.kind ?? (externalPrefixes.some((prefix) => file.startsWith(prefix)) ? 'external-retain' : 'bundle');
  if (!existsSync(acceptedPath) && mode === 'bundle') throw new Error(`accepted bundle omits ${acceptedFile}`);
  const sourceRecord = manifestRetained ? pdtf1SourceByBaselineFile.get(file) : null;
  const sourcePath = sourceRecord ? path.join(sourceRoot, 'dist', sourceRecord.acceptedFile) : null;
  if (manifestRetained && (!sourceRecord || !sourcePath || !existsSync(sourcePath)
    || !manifestRetainedSourceRecordMatches(sourceRecord, priorRecord))) {
    throw new Error(`manifest-retained source evidence is unavailable: ${baselineRoute}`);
  }
  const beforeHtml = manifestRetained ? readFileSync(sourcePath, 'utf8') : readFileSync(baselinePath, 'utf8');
  const beforeContent = informationContract(beforeHtml);
  const beforeFragments = fragmentContract(beforeHtml);
  const priorInventory = priorRecord?.equivalenceReceipt?.baselineBlockInventorySha256;
  if (manifestRetained && (!priorRecord
    || sha256(beforeHtml) !== sourceRecord.acceptedRawSha256
    || beforeContent.contentSha256 !== sourceRecord.acceptedContentSha256
    || blockInventory(beforeContent.blockHashes).sha256 !== sourceRecord.acceptedBlockInventorySha256
    || beforeFragments.fragmentSha256 !== sourceRecord.acceptedFragmentSha256
    || (missingPhysical
      ? sourceRecord.acceptedRawSha256 !== priorRecord.baselineRawSha256
      : sourceRecord.acceptedContentSha256 !== priorRecord.baselineContentSha256
        || sourceRecord.acceptedBlockInventorySha256 !== priorInventory))) {
    throw new Error(`manifest-retained baseline evidence is not unchanged: ${baselineRoute}`);
  }
  const afterHtml = existsSync(acceptedPath) ? readFileSync(acceptedPath, 'utf8') : beforeHtml;
  const afterContent = informationContract(afterHtml);
  const afterFragments = fragmentContract(afterHtml);
  return {
    baselineRoute,
    baselineFile: file,
    acceptedRoute,
    acceptedFile,
    kind: mode,
    baselineGeneratedFamily: generatedFamily(baselineRoute),
    acceptedGeneratedFamily: generatedFamily(acceptedRoute),
    baselineCommit,
    acceptedCommit,
    ...(manifestRetained ? { baselineEvidence: {
      policy: missingPhysical ? 'prior-schema-v5-byte-identity-v1' : 'prior-schema-v5-information-identity-v1',
      sourceRecordSha256: priorRouteRecordDigest(priorRecord),
      sourceKind: priorRecord.kind,
    } } : {}),
    baselineRawSha256: manifestRetained ? priorRecord.baselineRawSha256 : sha256(beforeHtml),
    acceptedRawSha256: sha256(afterHtml),
    baselineContentSha256: manifestRetained ? priorRecord.baselineContentSha256 : beforeContent.contentSha256,
    acceptedContentSha256: afterContent.contentSha256,
    acceptedBlockInventorySha256: blockInventory(afterContent.blockHashes).sha256,
    baselineFragmentSha256: manifestRetained ? priorRecord.baselineFragmentSha256 : beforeFragments.fragmentSha256,
    acceptedFragmentSha256: afterFragments.fragmentSha256,
    baselineFragmentCount: manifestRetained ? priorRecord.baselineFragmentCount : beforeFragments.fragmentCount,
    acceptedFragmentCount: afterFragments.fragmentCount,
    baselineFragments: manifestRetained ? priorRecord.baselineFragments : beforeFragments.fragments,
    acceptedFragments: afterFragments.fragments,
    ...routeMetadata(acceptedRoute),
    equivalenceReceipt: equivalenceReceipt(beforeContent, afterContent, reframeEvidence(baselineRoute)),
    retentionReceipt: captureRetentionReceipt(baselineRoute, beforeContent, acceptedContracts, baselineLinkEvidence(beforeHtml)),
  };
});
const mappedAcceptedFiles = new Set(routes.map(({ acceptedFile }) => acceptedFile));
const addedRoutes = acceptedFiles
  .filter((file) => !mappedAcceptedFiles.has(file))
  .map((file) => {
    const acceptedRoute = routeFromFile(file);
    const html = readFileSync(path.join(acceptedRoot, 'dist', file), 'utf8');
    const content = informationContract(html);
    const fragments = fragmentContract(html);
    return {
      acceptedRoute,
      acceptedFile: file,
      kind: 'new-authority-route',
      acceptedGeneratedFamily: generatedFamily(acceptedRoute),
      introducedBy: acceptedCommit,
      acceptedRawSha256: sha256(html),
      acceptedContentSha256: content.contentSha256,
      acceptedBlockInventorySha256: blockInventory(content.blockHashes).sha256,
      acceptedFragmentSha256: fragments.fragmentSha256,
      acceptedFragmentCount: fragments.fragmentCount,
      acceptedFragments: fragments.fragments,
      ...routeMetadata(acceptedRoute),
    };
  });
for (const acceptedRecord of [...routes, ...addedRoutes]) {
  const sourceRecord = pdtf1SourceByAcceptedRoute.get(acceptedRecord.acceptedRoute);
  if (!sourceRecord) continue;
  const acceptedFragments = new Set(acceptedRecord.acceptedFragments);
  if (sourceRecord.acceptedFragments.some((fragment) => !acceptedFragments.has(fragment))) {
    throw new Error(`PDTF 1.0 source fragment is absent after the canonical move: ${sourceRecord.acceptedRoute}`);
  }
  const exactInformation = sourceRecord.acceptedContentSha256 === acceptedRecord.acceptedContentSha256
    && sourceRecord.acceptedBlockInventorySha256 === acceptedRecord.acceptedBlockInventorySha256;
  if (exactInformation) continue;
  const sourcePath = path.join(sourceRoot, 'dist', sourceRecord.acceptedFile);
  if (!existsSync(sourcePath)) {
    throw new Error(`PDTF 1.0 source page is unavailable: ${sourceRecord.acceptedRoute}`);
  }
  const sourceHtml = readFileSync(sourcePath, 'utf8');
  const sourceContent = informationContract(sourceHtml);
  const sourceFragments = fragmentContract(sourceHtml);
  if (sha256(sourceHtml) !== sourceRecord.acceptedRawSha256
    || sourceContent.contentSha256 !== sourceRecord.acceptedContentSha256
    || blockInventory(sourceContent.blockHashes).sha256 !== sourceRecord.acceptedBlockInventorySha256
    || sourceFragments.fragmentSha256 !== sourceRecord.acceptedFragmentSha256
    || sourceFragments.fragmentCount !== sourceRecord.acceptedFragmentCount
    || JSON.stringify(sourceFragments.fragments) !== JSON.stringify(sourceRecord.acceptedFragments)) {
    throw new Error(`PDTF 1.0 source page differs from its frozen manifest: ${sourceRecord.acceptedRoute}`);
  }
  const sourceInventory = blockInventory(sourceContent.blockHashes);
  const sourceReceipt = captureRetentionReceipt(
    sourceRecord.acceptedRoute, sourceContent, acceptedContracts, baselineLinkEvidence(sourceHtml),
    { exactTargetRoute: acceptedRecord.acceptedRoute, includeAllocation: true },
  );
  acceptedRecord.pdtf1SourceRetentionReceipt = {
    ...sourceReceipt,
    policy: 'explicit-pdtf1-source-block-retention-v1',
    sourceRoute: sourceRecord.acceptedRoute,
    sourceFile: sourceRecord.acceptedFile,
    sourceRecordSha256: sha256(JSON.stringify(sourceRecord)),
    sourceContentSha256: sourceRecord.acceptedContentSha256,
    sourceBlockInventorySha256: sourceRecord.acceptedBlockInventorySha256,
    sourceBlockInventoryRecords: sourceInventory.records,
    sourceFragmentSha256: sourceRecord.acceptedFragmentSha256,
    sourceFragmentCount: sourceRecord.acceptedFragmentCount,
    sourceFragments: sourceRecord.acceptedFragments,
    acceptedRoute: acceptedRecord.acceptedRoute,
    exactTargetRoute: acceptedRecord.acceptedRoute,
    targetBlockInventories: sourceReceipt.targetEvidence.map(({ route: targetRoute }) => {
      const inventory = blockInventory(acceptedContracts.get(targetRoute).blockHashes);
      return { route: targetRoute, sha256: inventory.sha256, records: inventory.records };
    }),
  };
}
const propertyPackMigration = propertyPackMigrationReceipt(
  routes, addedRoutes, PROPERTY_PACK_ROUTE_MIGRATION, getDeclaredRouteReplacement,
);
const retiredRoutes = composePdtf1RetiredAliases(pdtf1SourceManifest, getDeclaredRouteReplacement);
const pdtf1Migration = pdtf1MigrationReceipt({
  records: routes,
  addedRecords: addedRoutes,
  retiredAliases: retiredRoutes,
  migration: PDTF1_ROUTE_MIGRATION,
  replacementRoute: getDeclaredRouteReplacement,
  sourceManifest: pdtf1SourceManifest,
});
const usedSemanticReframes = new Set([...routes, ...addedRoutes].flatMap((record) => (
  [record.retentionReceipt, record.pdtf1SourceRetentionReceipt]
    .filter(Boolean)
    .flatMap((receipt) => [
      ...receipt.semanticReframeBlocks,
      ...receipt.nonInformationBlocks,
    ].map(({ sourceRoute, sourceBlockSha256 }) => `${sourceRoute}\0${sourceBlockSha256}`))
)));
const declaredSemanticReframes = new Set([...semanticReframes.values()].flatMap((entry) => (
  entry.sourceRoutes.map((sourceRoute) => `${sourceRoute}\0${entry.sourceBlockSha256}`)
)));
if (usedSemanticReframes.size !== declaredSemanticReframes.size
  || [...declaredSemanticReframes].some((pair) => !usedSemanticReframes.has(pair))) {
  throw new Error('semantic reframe ledger contains unused or unaccounted source blocks');
}
const routeManifest = {
  schemaVersion: 7,
  baselineCommit,
  acceptedCommit,
  routeCount: routes.length,
  addedRouteCount: addedRoutes.length,
  retiredRouteCount: retiredRoutes.length,
  externalRetainCount: routes.filter(({ kind }) => kind === 'external-retain').length,
  externalPrefixes,
  priorManifestReceipt: composePriorManifestReceipt(
    routes.filter(({ baselineEvidence }) => baselineEvidence), missingPhysicalRecords,
  ),
  propertyPackMigration,
  pdtf1Migration,
  leaseTermCaseCollision: composeLeaseTermCaseCollisionReceipt(acceptedRoot, routes, addedRoutes),
  routes,
  addedRoutes,
  retiredRoutes,
};
const familySpecs = [
  { id: 'source-archive', path: 'source', policy: 'byte-identical', owner: 'resources', dataOwner: 'resources', ciMode: 'manifest-only-in-ci', consumers: ['resource viewer', 'source citations', 'downloads'], endpoints: ['/resources/**', '/resource?path=source/**'], journeyTests: ['resource-open-download'] },
  { id: 'council-markdown', path: 'docs/ontology/odr/council', policy: 'regenerate-equivalent', owner: 'governance', dataOwner: 'resources', ciMode: 'verify-current', consumers: ['decision records', 'raw session evidence'], endpoints: ['/council/**'], journeyTests: ['route-crawl'] },
  { id: 'ontology-artefacts', assetClass: 'ontology-serialization', baselinePath: 'public/ontology/artefacts', acceptedPath: 'public/pdtf-1/extracted-ontology/use-and-tooling/artefacts', policy: 'byte-identical', owner: 'pdtf-1', dataOwner: 'pdtf-1', ciMode: 'manifest-only-in-ci', consumers: ['ontology downloads', 'technical references'], endpoints: ['/pdtf-1/extracted-ontology/use-and-tooling/artefacts/**'], journeyTests: ['route-crawl'] },
  { id: 'deployed-data', path: 'dist/data', policy: 'regenerate-equivalent', owner: 'resources', dataOwner: 'resources', ciMode: 'verify-current', consumers: ['generated pages', 'client-side data views', 'validation'], endpoints: ['/data/**'], journeyTests: ['route-crawl'] },
  { id: 'ui-assets', path: 'public/ui', policy: 'reframe-equivalent', owner: 'resources', dataOwner: 'resources', ciMode: 'verify-current', consumers: ['all rendered route families'], endpoints: ['/ui/**'], journeyTests: ['visual-regression', 'accessibility'] },
  { id: 'image-assets', path: 'public/images', policy: 'byte-identical', owner: 'resources', dataOwner: 'resources', ciMode: 'verify-current', consumers: ['branded pages'], endpoints: ['/images/**'], journeyTests: ['visual-regression'] },
  { id: 'ontology-tools', assetClass: 'tool-rendering', baselinePath: 'public/ontology/tools', acceptedPath: 'public/pdtf-1/extracted-ontology/use-and-tooling/tools', policy: 'reframe-equivalent', owner: 'pdtf-1', dataOwner: 'pdtf-1', ciMode: 'manifest-only-in-ci', consumers: ['linked-data implementers', 'technical citations'], endpoints: ['/pdtf-1/extracted-ontology/use-and-tooling/tools/**'], journeyTests: ['route-crawl'] },
  { id: 'property-pack-canonical', baselinePath: 'dist/v2', acceptedPath: 'dist/spdtf-2/property-pack', policy: 'reframe-equivalent', owner: 'spdtf-2', dataOwner: 'spdtf-2', ciMode: 'verify-current', consumers: ['Technical Working Group review', 'candidate register', 'ontology reference'], endpoints: ['/spdtf-2/property-pack/**'], journeyTests: ['route-crawl', 'ia-navigation'], technicalMappedRouteCount: 690, canonicalContentRouteCount: 691, lifecyclePageCount: 2 },
];
const { manifest: priorFamilyManifest } = loadPriorIaFamilyManifest(ROOT);
const priorFamilies = new Map(priorFamilyManifest.families.map((family) => [family.id, family]));
const families = familySpecs.map(({ path: familyPath, baselinePath = familyPath, acceptedPath = familyPath, ...spec }) => {
  const sourceFamilyId = spec.id === 'property-pack-canonical' ? 'v2-atomic-seed' : spec.id;
  const prior = priorFamilies.get(sourceFamilyId);
  if (!prior) throw new Error(`prior family evidence is missing: ${sourceFamilyId}`);
  const family = { ...spec, baselinePath, acceptedPath, baseline: prior.baseline,
    baselineEvidence: { policy: 'prior-schema-v1-family-v1', sourceFamilyId,
      sourceFamilySha256: sha256(JSON.stringify(prior)) },
    accepted: fileInventory(acceptedRoot, acceptedPath) };
  if (family.id === 'ontology-tools') {
    family.reframeReceipt = composePdtf1ToolReframeReceipt(family.baseline, family.accepted);
  }
  return family;
});
const familyManifest = {
  schemaVersion: 1,
  baselineCommit,
  acceptedCommit,
  priorManifestReceipt: composePriorFamilyReceipt(families),
  families,
  runtimeJourneys: [
    { id: 'auth-endpoint-and-return', test: 'tests/e2e/runtime-continuity.spec.mjs', endpoint: '/api/auth/**' },
    { id: 'comments-graceful-gate', test: 'tests/e2e/runtime-continuity.spec.mjs', endpoint: 'comments service' },
    { id: 'resource-open-download', test: 'tests/e2e/runtime-continuity.spec.mjs', endpoint: '/resources/**' },
    { id: 'working-group-submit', test: 'tests/e2e/runtime-continuity.spec.mjs', endpoint: '/api/working-group-interest' },
  ],
};
writeFileSync(output, `${JSON.stringify(routeManifest)}\n`);
writeFileSync(familyOutput, `${JSON.stringify(familyManifest)}\n`);
console.log(`captured ${routes.length} baseline routes, ${addedRoutes.length} classified additions`);
for (const family of families) {
  console.log(`${family.id}: ${family.baseline.count} baseline → ${family.accepted.count} accepted files`);
}
