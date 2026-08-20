#!/usr/bin/env node
/** Capture frozen before/after information and artefact preservation contracts. */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  blockInventory, equivalenceReceipt, existingRetiredPropertyPackOutputs,
  fileInventory, filesUnder, fragmentContract, generatedFamily, indexFileFromRoute,
  informationContract, isRetiredPropertyPackRoute, linkedInformationBlocks,
  nonInformationBlocksDigest,
  propertyPackMigrationReceipt, routeFromFile, semanticBlocksDigest, sha256,
} from './lib/ia-preservation-contract.mjs';
import {
  PRIOR_IA_ROUTE_MANIFEST, composePriorFamilyReceipt, composePriorManifestReceipt,
  loadPriorIaFamilyManifest, loadPriorIaRouteManifest, missingPhysicalRecordsDigest,
  priorRouteRecordDigest, verifyBaselineRootCommit,
} from './lib/ia-prior-manifest-contract.mjs';
import {
  IA_STATUS_REGISTRY_VERSION,
  getContentOwner,
  getRouteDisposition,
  getRouteStatus,
} from '../src/lib/site-ia.mjs';
import { PROPERTY_PACK_ROUTE_MIGRATION, getPropertyPackReplacementRoute } from '../src/lib/property-pack-routes.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Map(process.argv.slice(2).map((arg) => {
  const offset = arg.indexOf('=');
  if (offset < 0) return [arg, ''];
  return [arg.slice(0, offset), arg.slice(offset + 1)];
}));
const baselineRoot = args.get('--baseline-root');
const acceptedRoot = args.get('--accepted-root') || ROOT;
for (const key of args.keys()) {
  if (!['--baseline-root', '--accepted-root'].includes(key)) throw new Error(`unknown argument: ${key}`);
}
for (const [label, value] of [['baseline', baselineRoot], ['accepted', acceptedRoot]]) {
  if (!value || !path.isAbsolute(value) || !existsSync(value)) {
    throw new Error(`${label} root must be an existing absolute path`);
  }
}
const output = path.join(ROOT, 'src/data/ia-route-baseline.json');
const familyOutput = path.join(ROOT, 'src/data/ia-preservation-baseline.json');
const semanticLedgerPath = path.join(ROOT, 'src/data/ia-semantic-reframe-ledger.json');
const HASH = /^[a-f0-9]{64}$/u;
const externalPrefixes = [
  'ontology/tools/ontospy/',
  'ontology/tools/pylode/',
  'ontology/tools/shaclplay/',
  'ontology/tools/widoco/',
];
const semanticLedger = JSON.parse(readFileSync(semanticLedgerPath, 'utf8'));
const SEMANTIC_CLASSES = new Set([
  'terminology-and-scope-reframe',
  'authority-and-label-reframe',
  'decision-status-update',
  'scope-and-maturity-clarification',
]);
const NON_INFORMATION_CLASS = 'superseded-navigation-copy';
const NAVIGATION_EVIDENCE = new Set(['containing-link', 'declared-original-destination']);
/**
 * Old landing navigation may point at a legacy route that is deliberately
 * represented by a current canonical surface. This is a closed allow-list;
 * every other navigation destination must be the original retained route.
 */
const NAVIGATION_CANONICAL_EQUIVALENTS = Object.freeze({
  '/strategy': ['/programme'],
  '/model': ['/pdtf-1'],
  '/implementation': ['/pdtf-1'],
  '/library': ['/resources'],
  '/engagement': ['/resources', '/spdtf-2/working-groups'],
  '/v2': ['/spdtf-2/property-pack'],
});
if (semanticLedger.schemaVersion !== 1 || semanticLedger.baselineCommit !== commit(baselineRoot)
  || !Array.isArray(semanticLedger.entries)) {
  throw new Error('semantic reframe ledger has an invalid baseline contract');
}
const semanticReframes = new Map();
for (const entry of semanticLedger.entries) {
  const commonInvalid = !HASH.test(entry.sourceBlockSha256 ?? '') || typeof entry.sourceTag !== 'string'
    || typeof entry.sourceText !== 'string' || !entry.sourceRoute?.startsWith('/')
    || !Array.isArray(entry.sourceRoutes) || !entry.sourceRoutes.length
    || new Set(entry.sourceRoutes).size !== entry.sourceRoutes.length
    || entry.sourceRoutes.some((route) => typeof route !== 'string' || !route.startsWith('/'))
    || sha256(`${entry.sourceTag}\0${entry.sourceText}`) !== entry.sourceBlockSha256
    || semanticReframes.has(entry.sourceBlockSha256);
  const semanticInvalid = SEMANTIC_CLASSES.has(entry.classification) && (
    !HASH.test(entry.replacementBlockSha256 ?? '') || typeof entry.replacementTag !== 'string'
    || typeof entry.replacementText !== 'string' || !entry.replacementRoute?.startsWith('/')
    || typeof entry.reviewNote !== 'string'
    || sha256(`${entry.replacementTag}\0${entry.replacementText}`) !== entry.replacementBlockSha256
    || !entry.reviewNote.includes(entry.sourceText) || !entry.reviewNote.includes(entry.replacementText)
  );
  const nonInformationInvalid = entry.classification === NON_INFORMATION_CLASS && (
    !Array.isArray(entry.navigationDestinations) || !entry.navigationDestinations.length
    || new Set(entry.navigationDestinations.map(({ sourceRoute }) => sourceRoute)).size !== entry.navigationDestinations.length
    || entry.navigationDestinations.some((resolution) => (
      !entry.sourceRoutes.includes(resolution?.sourceRoute)
      || !resolution.originalDestinationRoute?.startsWith('/')
      || !resolution.destinationRoute?.startsWith('/')
      || !NAVIGATION_EVIDENCE.has(resolution.sourceEvidence)
      || typeof resolution.supersessionReason !== 'string'
      || !resolution.supersessionReason.includes(entry.sourceText)
      || !resolution.supersessionReason.includes(resolution.originalDestinationRoute)
      || !resolution.supersessionReason.includes(resolution.destinationRoute)
    ))
  );
  if (commonInvalid || semanticInvalid || nonInformationInvalid
    || (!SEMANTIC_CLASSES.has(entry.classification) && entry.classification !== NON_INFORMATION_CLASS)) {
    throw new Error(`semantic reframe ledger entry is invalid: ${entry.sourceBlockSha256 ?? '(missing source hash)'}`);
  }
  semanticReframes.set(entry.sourceBlockSha256, entry);
}
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
  return getPropertyPackReplacementRoute(route) ?? route;
}
function reframeEvidence(route) {
  if (route === '/' || route === '/home') return 'Task-gateway recomposition; every former destination route remains classified and reachable';
  if (route === '/v2' || route.startsWith('/v2/')) return 'The 690-page Property Pack technical cut moves atomically to its canonical SPDTF 2.0 route family';
  if (route === '/dbt-smart-data' || route.startsWith('/dbt-smart-data/')) return 'Authority and continuation terminology corrected without removing the source analysis';
  if (route === '/mapping' || route.startsWith('/mapping/')) return 'Legacy RML verification distinguished from SPDTF 2.0 semantic mapping';
  if (route === '/modelling' || route.startsWith('/modelling/')) return 'PDTF 1.0 historical modelling scope and child maturity made explicit';
  return 'ADR-0074 route disposition plus exact before/after information and fragment checksums';
}
function localRouteFromHref(href) {
  if (typeof href !== 'string' || !href.startsWith('/')) return null;
  const pathname = href.split(/[?#]/u, 1)[0];
  return pathname.length > 1 ? pathname.replace(/\/+$/u, '') : '/';
}
function navigationResolution(entry, route) {
  const resolution = entry.navigationDestinations?.find(({ sourceRoute }) => sourceRoute === route);
  if (!resolution) throw new Error(`navigation-copy supersession has no source-route resolution: ${route}#${entry.sourceBlockSha256}`);
  const destinationRoute = acceptedRouteFor(resolution.destinationRoute);
  const policy = destinationRoute === resolution.originalDestinationRoute
    ? 'same-retained-route'
    : NAVIGATION_CANONICAL_EQUIVALENTS[resolution.originalDestinationRoute]?.includes(destinationRoute)
      ? 'canonical-equivalent'
      : null;
  if (!policy) {
    throw new Error(`navigation-copy supersession has no canonical destination proof: ${route}#${entry.sourceBlockSha256}`);
  }
  return { ...resolution, destinationRoute, destinationPolicy: policy };
}
const RETENTION_TARGETS = Object.freeze({
  '/': ['/', '/spdtf-2'],
  '/home': ['/home', '/spdtf-2'],
});
function retentionTargets(route, before) {
  const targets = [
    ...(RETENTION_TARGETS[route] ?? [acceptedRouteFor(route)]),
    ...blockInventory(before.blockHashes).records
      .map(({ hash }) => {
        const resolution = semanticReframes.get(hash);
        if (resolution?.replacementRoute) return acceptedRouteFor(resolution.replacementRoute);
        return resolution?.classification === NON_INFORMATION_CLASS
          && resolution.navigationDestinations.some(({ sourceRoute }) => sourceRoute === route)
          ? navigationResolution(resolution, route).destinationRoute
          : null;
      })
      .filter(Boolean),
  ];
  const uniqueTargets = [...new Set(targets)];
  if (!uniqueTargets.length) {
    throw new Error(`retention targets must be a unique non-empty route list: ${route}`);
  }
  if (uniqueTargets.some((target) => typeof target !== 'string' || !target.startsWith('/'))) {
    throw new Error(`retention targets contain an invalid route: ${route}`);
  }
  return uniqueTargets;
}
function baselineLinkEvidence(html) {
  const evidence = new Map();
  for (const { hash, containingLink } of linkedInformationBlocks(html)) {
    if (!evidence.has(hash)) evidence.set(hash, new Set());
    evidence.get(hash).add(containingLink || null);
  }
  return evidence;
}
/**
 * Capture a multiplicity-aware receipt. Exact blocks may be satisfied at a
 * declared replacement route. Every non-exact block resolves through the
 * committed semantic ledger to one concrete target block; there are no
 * catch-all or route-wide approvals.
 */
function captureRetentionReceipt(route, before, acceptedContracts, sourceLinks) {
  const targets = retentionTargets(route, before);
  const available = new Map();
  const targetEvidence = targets.map((targetRoute) => {
    const target = acceptedContracts.get(targetRoute);
    if (!target) throw new Error(`retention target does not exist in accepted build: ${route} -> ${targetRoute}`);
    available.set(targetRoute, new Map(blockInventory(target.blockHashes).records.map(({ hash, count }) => [hash, count])));
    return {
      route: targetRoute,
      acceptedContentSha256: target.contentSha256,
      acceptedBlockInventorySha256: blockInventory(target.blockHashes).sha256,
    };
  });
  const semanticReframeBlocks = [];
  const nonInformationBlocks = [];
  let exactRetainedBlocks = 0;
  for (const { hash, count } of blockInventory(before.blockHashes).records) {
    let remaining = count;
    for (const { route: targetRoute } of targetEvidence) {
      const target = available.get(targetRoute);
      const matched = Math.min(remaining, target.get(hash) ?? 0);
      if (!matched) continue;
      exactRetainedBlocks += matched;
      remaining -= matched;
      target.set(hash, (target.get(hash) ?? 0) - matched);
      if (!remaining) break;
    }
    if (remaining) {
      const semantic = semanticReframes.get(hash);
      const navigation = semantic?.classification === NON_INFORMATION_CLASS
        ? navigationResolution(semantic, route)
        : null;
      const targetRoute = semantic?.replacementRoute
        ? acceptedRouteFor(semantic.replacementRoute)
        : navigation?.destinationRoute;
      if (!semantic || !targetEvidence.some(({ route: target }) => target === targetRoute)) {
        throw new Error(`no concrete retention resolution is declared for ${route}#${hash}`);
      }
      if (semantic.classification === NON_INFORMATION_CLASS) {
        const hrefs = sourceLinks.get(hash) ?? new Set();
        if (navigation.sourceEvidence === 'containing-link') {
          if (hrefs.size !== 1 || !hrefs.values().next().value
            || localRouteFromHref(hrefs.values().next().value) !== navigation.originalDestinationRoute) {
            throw new Error(`navigation-copy containing-link evidence does not match the baseline: ${route}#${hash}`);
          }
        } else if (hrefs.size !== 1 || hrefs.values().next().value !== null) {
          throw new Error(`navigation-copy declared destination is not allowed when baseline link evidence exists: ${route}#${hash}`);
        }
        nonInformationBlocks.push({
          sourceBlockSha256: hash,
          sourceTag: semantic.sourceTag,
          sourceText: semantic.sourceText,
          occurrences: remaining,
          classification: semantic.classification,
          originalDestinationRoute: navigation.originalDestinationRoute,
          destinationRoute: navigation.destinationRoute,
          destinationPolicy: navigation.destinationPolicy,
          sourceEvidence: navigation.sourceEvidence,
          baselineLinkHref: navigation.sourceEvidence === 'containing-link' ? hrefs.values().next().value : null,
          destinationContentSha256: targetEvidence.find(({ route: target }) => target === targetRoute).acceptedContentSha256,
          supersessionReason: navigation.supersessionReason,
        });
        continue;
      }
      semanticReframeBlocks.push({
        sourceBlockSha256: hash,
        sourceTag: semantic.sourceTag,
        sourceText: semantic.sourceText,
        occurrences: remaining,
        replacementRoute: targetRoute,
        replacementBlockSha256: semantic.replacementBlockSha256,
        replacementTag: semantic.replacementTag,
        replacementText: semantic.replacementText,
        replacementContentSha256: targetEvidence.find(({ route: target }) => target === targetRoute).acceptedContentSha256,
        classification: semantic.classification,
        reviewNote: semantic.reviewNote,
      });
    }
  }
  const semanticReframeBlockCount = semanticReframeBlocks.reduce((total, { occurrences }) => total + occurrences, 0);
  const nonInformationBlockCount = nonInformationBlocks.reduce((total, { occurrences }) => total + occurrences, 0);
  const semanticReframeBlocksSha256 = semanticBlocksDigest(semanticReframeBlocks);
  const nonInformationBlocksSha256 = nonInformationBlocksDigest(nonInformationBlocks);
  return {
    policy: 'explicit-route-block-retention-v1',
    baselineBlockCount: before.blockCount,
    baselineBlockInventorySha256: blockInventory(before.blockHashes).sha256,
    targetEvidence,
    exactRetainedBlocks,
    semanticReframeBlockCount,
    semanticReframeBlocks,
    semanticReframeBlocksSha256,
    nonInformationBlockCount,
    nonInformationBlocks,
    nonInformationBlocksSha256,
  };
}
const baselineCommit = commit(baselineRoot);
const acceptedCommit = commit(acceptedRoot);
verifyBaselineRootCommit(baselineRoot);
const { manifest: priorManifest } = loadPriorIaRouteManifest(ROOT);
if (priorManifest.baselineCommit !== baselineCommit) throw new Error('prior manifest baseline commit changed');
const priorByFile = new Map(priorManifest.routes.map((record) => [record.file, record]));
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
const acceptedContracts = new Map(acceptedFiles.map((file) => {
  const route = routeFromFile(file);
  return [route, informationContract(readFileSync(path.join(acceptedRoot, 'dist', file), 'utf8'))];
}));
const routes = baselineFiles.map((file) => {
  const baselineRoute = routeFromFile(file);
  const acceptedRoute = acceptedRouteFor(baselineRoute);
  const acceptedFile = acceptedRoute === baselineRoute ? file : indexFileFromRoute(acceptedRoute);
  const acceptedPath = path.join(acceptedRoot, 'dist', acceptedFile);
  const priorRecord = priorByFile.get(file);
  const baselinePath = path.join(baselineRoot, 'dist', file);
  const missingPhysical = !existsSync(baselinePath);
  const manifestRetained = manifestRetainedFiles.has(file);
  const mode = missingPhysical ? 'external-retain'
    : priorRecord?.kind ?? (externalPrefixes.some((prefix) => file.startsWith(prefix)) ? 'external-retain' : 'bundle');
  if (!existsSync(acceptedPath) && mode === 'bundle') throw new Error(`accepted bundle omits ${acceptedFile}`);
  const beforeHtml = manifestRetained ? readFileSync(acceptedPath, 'utf8') : readFileSync(baselinePath, 'utf8');
  const beforeContent = informationContract(beforeHtml);
  const priorInventory = priorRecord?.equivalenceReceipt?.baselineBlockInventorySha256;
  if (manifestRetained && (!priorRecord || (missingPhysical
    ? sha256(beforeHtml) !== priorRecord.baselineRawSha256
      || priorRecord.baselineRawSha256 !== priorRecord.acceptedRawSha256
    : beforeContent.contentSha256 !== priorRecord.baselineContentSha256
      || blockInventory(beforeContent.blockHashes).sha256 !== priorInventory))) {
    throw new Error(`manifest-retained baseline evidence is not unchanged: ${baselineRoute}`);
  }
  const afterHtml = existsSync(acceptedPath) ? readFileSync(acceptedPath, 'utf8') : beforeHtml;
  const afterContent = informationContract(afterHtml);
  const beforeFragments = fragmentContract(beforeHtml);
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
const propertyPackMigration = propertyPackMigrationReceipt(
  routes, addedRoutes, PROPERTY_PACK_ROUTE_MIGRATION, getPropertyPackReplacementRoute,
);
const usedSemanticReframes = new Set(routes.flatMap(({ retentionReceipt }) => (
  [
    ...retentionReceipt.semanticReframeBlocks,
    ...retentionReceipt.nonInformationBlocks,
  ].map(({ sourceBlockSha256 }) => sourceBlockSha256)
)));
if (usedSemanticReframes.size !== semanticReframes.size
  || [...semanticReframes.keys()].some((hash) => !usedSemanticReframes.has(hash))) {
  throw new Error('semantic reframe ledger contains unused or unaccounted source blocks');
}
const routeManifest = {
  schemaVersion: 6,
  baselineCommit,
  acceptedCommit,
  routeCount: routes.length,
  addedRouteCount: addedRoutes.length,
  externalRetainCount: routes.filter(({ kind }) => kind === 'external-retain').length,
  externalPrefixes,
  priorManifestReceipt: composePriorManifestReceipt(
    routes.filter(({ baselineEvidence }) => baselineEvidence), missingPhysicalRecords,
  ),
  propertyPackMigration,
  routes,
  addedRoutes,
};
const familySpecs = [
  { id: 'source-archive', path: 'source', policy: 'byte-identical', owner: 'resources', dataOwner: 'resources', ciMode: 'manifest-only-in-ci', consumers: ['resource viewer', 'source citations', 'downloads'], endpoints: ['/resources/**', '/resource?path=source/**'], journeyTests: ['resource-open-download'] },
  { id: 'council-markdown', path: 'docs/ontology/odr/council', policy: 'regenerate-equivalent', owner: 'governance', dataOwner: 'resources', ciMode: 'verify-current', consumers: ['decision records', 'raw session evidence'], endpoints: ['/council/**'], journeyTests: ['route-crawl'] },
  { id: 'ontology-artefacts', path: 'public/ontology/artefacts', policy: 'byte-identical', owner: 'pdtf-1', dataOwner: 'pdtf-1', ciMode: 'manifest-only-in-ci', consumers: ['ontology downloads', 'technical references'], endpoints: ['/ontology/artefacts/**'], journeyTests: ['route-crawl'] },
  { id: 'deployed-data', path: 'dist/data', policy: 'regenerate-equivalent', owner: 'resources', dataOwner: 'resources', ciMode: 'verify-current', consumers: ['generated pages', 'client-side data views', 'validation'], endpoints: ['/data/**'], journeyTests: ['route-crawl'] },
  { id: 'ui-assets', path: 'public/ui', policy: 'reframe-equivalent', owner: 'resources', dataOwner: 'resources', ciMode: 'verify-current', consumers: ['all rendered route families'], endpoints: ['/ui/**'], journeyTests: ['visual-regression', 'accessibility'] },
  { id: 'image-assets', path: 'public/images', policy: 'byte-identical', owner: 'resources', dataOwner: 'resources', ciMode: 'verify-current', consumers: ['branded pages'], endpoints: ['/images/**'], journeyTests: ['visual-regression'] },
  { id: 'ontology-tools', path: 'public/ontology/tools', policy: 'byte-identical', owner: 'pdtf-1', dataOwner: 'pdtf-1', ciMode: 'manifest-only-in-ci', consumers: ['linked-data implementers', 'technical citations'], endpoints: ['/ontology/tools/**'], journeyTests: ['route-crawl'] },
  { id: 'property-pack-canonical', baselinePath: 'dist/v2', acceptedPath: 'dist/spdtf-2/property-pack', policy: 'reframe-equivalent', owner: 'spdtf-2', dataOwner: 'spdtf-2', ciMode: 'verify-current', consumers: ['Technical Working Group review', 'candidate register', 'ontology reference'], endpoints: ['/spdtf-2/property-pack/**'], journeyTests: ['route-crawl', 'ia-navigation'], technicalMappedRouteCount: 690, canonicalContentRouteCount: 691, lifecyclePageCount: 2 },
];
const { manifest: priorFamilyManifest } = loadPriorIaFamilyManifest(ROOT);
const priorFamilies = new Map(priorFamilyManifest.families.map((family) => [family.id, family]));
const families = familySpecs.map(({ path: familyPath, baselinePath = familyPath, acceptedPath = familyPath, ...spec }) => {
  const sourceFamilyId = spec.id === 'property-pack-canonical' ? 'v2-atomic-seed' : spec.id;
  const prior = priorFamilies.get(sourceFamilyId);
  if (!prior) throw new Error(`prior family evidence is missing: ${sourceFamilyId}`);
  return { ...spec, baselinePath, acceptedPath, baseline: prior.baseline,
    baselineEvidence: { policy: 'prior-schema-v1-family-v1', sourceFamilyId,
      sourceFamilySha256: sha256(JSON.stringify(prior)) },
    accepted: fileInventory(acceptedRoot, acceptedPath) };
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
