#!/usr/bin/env node
/** Capture frozen before/after information and artefact preservation contracts. */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  fileInventory,
  filesUnder,
  fragmentContract,
  generatedFamily,
  informationContract,
  blockInventory,
  equivalenceReceipt,
  routeFromFile,
  sha256,
} from './lib/ia-preservation-contract.mjs';
import {
  IA_STATUS_REGISTRY_VERSION,
  getContentOwner,
  getRouteDisposition,
  getRouteStatus,
} from '../src/lib/site-ia.mjs';

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
  'landing-page-recomposition',
  'authority-and-label-reframe',
  'decision-status-update',
  'scope-and-maturity-clarification',
]);
const NON_INFORMATION_CLASS = 'superseded-navigation-copy';
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
    !entry.destinationRoute?.startsWith('/') || typeof entry.supersessionReason !== 'string'
    || !entry.supersessionReason.includes(entry.sourceText)
    || !entry.supersessionReason.includes(entry.destinationRoute)
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

function reframeEvidence(route) {
  if (route === '/' || route === '/home') return 'Task-gateway recomposition; every former destination route remains classified and reachable';
  if (route === '/v2' || route.startsWith('/v2/')) return 'Atomic Property Pack seed retained; authority terminology corrected and the 690-file seed family frozen';
  if (route === '/dbt-smart-data' || route.startsWith('/dbt-smart-data/')) return 'Authority and continuation terminology corrected without removing the source analysis';
  if (route === '/mapping' || route.startsWith('/mapping/')) return 'Legacy RML verification distinguished from SPDTF 2.0 semantic mapping';
  if (route === '/modelling' || route.startsWith('/modelling/')) return 'PDTF 1.0 historical modelling scope and child maturity made explicit';
  return 'ADR-0074 route disposition plus exact before/after information and fragment checksums';
}

/**
 * The route ledger is deliberately explicit rather than a global text search.
 * New entries must name every current route which is allowed to satisfy a
 * baseline block. Keeping the source route in the list records that it remains
 * the canonical replacement even when its wording has been reframed.
 */
const RETENTION_TARGETS = Object.freeze({
  '/': ['/', '/spdtf-2'],
  '/home': ['/home', '/spdtf-2'],
});

function retentionTargets(route, before) {
  const targets = [
    ...(RETENTION_TARGETS[route] ?? [route]),
    ...blockInventory(before.blockHashes).records
      .map(({ hash }) => {
        const resolution = semanticReframes.get(hash);
        return resolution?.replacementRoute ?? resolution?.destinationRoute;
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

/**
 * Capture a multiplicity-aware receipt. Exact blocks may be satisfied at a
 * declared replacement route. Every non-exact block resolves through the
 * committed semantic ledger to one concrete target block; there are no
 * catch-all or route-wide approvals.
 */
function captureRetentionReceipt(route, before, acceptedContracts) {
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
      const targetRoute = semantic?.replacementRoute ?? semantic?.destinationRoute;
      if (!semantic || !targetEvidence.some(({ route: target }) => target === targetRoute)) {
        throw new Error(`no concrete retention resolution is declared for ${route}#${hash}`);
      }
      if (semantic.classification === NON_INFORMATION_CLASS) {
        if (!semantic.sourceRoutes.includes(route)) {
          throw new Error(`navigation-copy supersession is declared for the wrong source route: ${route}#${hash}`);
        }
        nonInformationBlocks.push({
          sourceBlockSha256: hash,
          sourceTag: semantic.sourceTag,
          sourceText: semantic.sourceText,
          occurrences: remaining,
          classification: semantic.classification,
          destinationRoute: semantic.destinationRoute,
          destinationContentSha256: targetEvidence.find(({ route: target }) => target === targetRoute).acceptedContentSha256,
          supersessionReason: semantic.supersessionReason,
        });
        continue;
      }
      semanticReframeBlocks.push({
        sourceBlockSha256: hash,
        sourceTag: semantic.sourceTag,
        sourceText: semantic.sourceText,
        occurrences: remaining,
        replacementRoute: semantic.replacementRoute,
        replacementBlockSha256: semantic.replacementBlockSha256,
        replacementTag: semantic.replacementTag,
        replacementText: semantic.replacementText,
        replacementContentSha256: targetEvidence.find(({ route: target }) => target === semantic.replacementRoute).acceptedContentSha256,
        classification: semantic.classification,
        reviewNote: semantic.reviewNote,
      });
    }
  }
  const semanticReframeBlockCount = semanticReframeBlocks.reduce((total, { occurrences }) => total + occurrences, 0);
  const nonInformationBlockCount = nonInformationBlocks.reduce((total, { occurrences }) => total + occurrences, 0);
  const semanticReframeBlocksSha256 = sha256(semanticReframeBlocks.map((entry) => [
    entry.sourceBlockSha256,
    entry.sourceTag,
    entry.sourceText,
    entry.occurrences,
    entry.replacementRoute,
    entry.replacementBlockSha256,
    entry.replacementTag,
    entry.replacementText,
    entry.replacementContentSha256,
    entry.classification,
    entry.reviewNote,
  ].join('\0')).join('\n'));
  const nonInformationBlocksSha256 = sha256(nonInformationBlocks.map((entry) => [
    entry.sourceBlockSha256,
    entry.sourceTag,
    entry.sourceText,
    entry.occurrences,
    entry.classification,
    entry.destinationRoute,
    entry.destinationContentSha256,
    entry.supersessionReason,
  ].join('\0')).join('\n'));
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
const baselineFiles = htmlFiles(baselineRoot);
const acceptedFiles = htmlFiles(acceptedRoot);
const acceptedSet = new Set(acceptedFiles);
const baselineSet = new Set(baselineFiles);
const acceptedContracts = new Map(acceptedFiles.map((file) => {
  const route = routeFromFile(file);
  return [route, informationContract(readFileSync(path.join(acceptedRoot, 'dist', file), 'utf8'))];
}));

const routes = baselineFiles.map((file) => {
  const route = routeFromFile(file);
  const mode = externalPrefixes.some((prefix) => file.startsWith(prefix)) ? 'external-retain' : 'bundle';
  const beforeHtml = readFileSync(path.join(baselineRoot, 'dist', file), 'utf8');
  const acceptedPath = path.join(acceptedRoot, 'dist', file);
  if (!existsSync(acceptedPath) && mode === 'bundle') throw new Error(`accepted bundle omits ${file}`);
  const afterHtml = existsSync(acceptedPath) ? readFileSync(acceptedPath, 'utf8') : beforeHtml;
  const beforeContent = informationContract(beforeHtml);
  const afterContent = informationContract(afterHtml);
  const beforeFragments = fragmentContract(beforeHtml);
  const afterFragments = fragmentContract(afterHtml);
  return {
    route,
    file,
    kind: mode,
    generatedFamily: generatedFamily(route),
    baselineCommit,
    acceptedCommit,
    baselineRawSha256: sha256(beforeHtml),
    acceptedRawSha256: sha256(afterHtml),
    baselineContentSha256: beforeContent.contentSha256,
    acceptedContentSha256: afterContent.contentSha256,
    acceptedBlockInventorySha256: blockInventory(afterContent.blockHashes).sha256,
    baselineFragmentSha256: beforeFragments.fragmentSha256,
    acceptedFragmentSha256: afterFragments.fragmentSha256,
    baselineFragmentCount: beforeFragments.fragmentCount,
    acceptedFragmentCount: afterFragments.fragmentCount,
    baselineFragments: beforeFragments.fragments,
    acceptedFragments: afterFragments.fragments,
    ...routeMetadata(route),
    equivalenceReceipt: equivalenceReceipt(beforeContent, afterContent, reframeEvidence(route)),
    retentionReceipt: captureRetentionReceipt(route, beforeContent, acceptedContracts),
  };
});

const addedRoutes = acceptedFiles
  .filter((file) => !baselineSet.has(file))
  .map((file) => {
    const route = routeFromFile(file);
    if (route === '/v2' || route.startsWith('/v2/')) {
      throw new Error(`new route violates the frozen /v2 atomic family: ${route}`);
    }
    const html = readFileSync(path.join(acceptedRoot, 'dist', file), 'utf8');
    const content = informationContract(html);
    const fragments = fragmentContract(html);
    return {
      route,
      file,
      kind: 'new-authority-route',
      generatedFamily: generatedFamily(route),
      introducedBy: acceptedCommit,
      acceptedRawSha256: sha256(html),
      acceptedContentSha256: content.contentSha256,
      acceptedBlockInventorySha256: blockInventory(content.blockHashes).sha256,
      acceptedFragmentSha256: fragments.fragmentSha256,
      acceptedFragmentCount: fragments.fragmentCount,
      acceptedFragments: fragments.fragments,
      ...routeMetadata(route),
    };
  });

const missingAccepted = baselineFiles.filter((file) => !acceptedSet.has(file));
const missingBundle = missingAccepted.filter((file) => !externalPrefixes.some((prefix) => file.startsWith(prefix)));
if (missingBundle.length) throw new Error(`accepted tree omits ${missingBundle.length} bundled routes`);
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
  schemaVersion: 4,
  baselineCommit,
  acceptedCommit,
  routeCount: routes.length,
  addedRouteCount: addedRoutes.length,
  externalRetainCount: routes.filter(({ kind }) => kind === 'external-retain').length,
  externalPrefixes,
  frozenFamilies: ['/v2/**'],
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
  { id: 'v2-atomic-seed', path: 'dist/v2', policy: 'reframe-equivalent', owner: 'spdtf-2', dataOwner: 'spdtf-2', ciMode: 'verify-current', consumers: ['candidate register', 'seed references', 'legacy links'], endpoints: ['/v2/**'], journeyTests: ['route-crawl', 'ia-navigation'] },
];
const families = familySpecs.map(({ path: familyPath, ...spec }) => ({
  ...spec,
  baselinePath: familyPath,
  acceptedPath: familyPath,
  baseline: fileInventory(baselineRoot, familyPath),
  accepted: fileInventory(acceptedRoot, familyPath),
}));
const familyManifest = {
  schemaVersion: 1,
  baselineCommit,
  acceptedCommit,
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
