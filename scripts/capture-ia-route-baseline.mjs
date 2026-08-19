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
const externalPrefixes = [
  'ontology/tools/ontospy/',
  'ontology/tools/pylode/',
  'ontology/tools/shaclplay/',
  'ontology/tools/widoco/',
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

function reframeEvidence(route) {
  if (route === '/' || route === '/home') return 'Task-gateway recomposition; every former destination route remains classified and reachable';
  if (route === '/v2' || route.startsWith('/v2/')) return 'Atomic Property Pack seed retained; authority terminology corrected and the 690-file seed family frozen';
  if (route === '/dbt-smart-data' || route.startsWith('/dbt-smart-data/')) return 'Authority and continuation terminology corrected without removing the source analysis';
  if (route === '/mapping' || route.startsWith('/mapping/')) return 'Legacy RML verification distinguished from SPDTF 2.0 semantic mapping';
  if (route === '/modelling' || route.startsWith('/modelling/')) return 'PDTF 1.0 historical modelling scope and child maturity made explicit';
  return 'ADR-0074 route disposition plus exact before/after information and fragment checksums';
}

const baselineCommit = commit(baselineRoot);
const acceptedCommit = commit(acceptedRoot);
const baselineFiles = htmlFiles(baselineRoot);
const acceptedFiles = htmlFiles(acceptedRoot);
const acceptedSet = new Set(acceptedFiles);
const baselineSet = new Set(baselineFiles);

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
    baselineFragmentSha256: beforeFragments.fragmentSha256,
    acceptedFragmentSha256: afterFragments.fragmentSha256,
    baselineFragmentCount: beforeFragments.fragmentCount,
    acceptedFragmentCount: afterFragments.fragmentCount,
    baselineFragments: beforeFragments.fragments,
    acceptedFragments: afterFragments.fragments,
    ...routeMetadata(route),
    equivalenceReceipt: equivalenceReceipt(beforeContent, afterContent, reframeEvidence(route)),
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
      acceptedFragmentSha256: fragments.fragmentSha256,
      acceptedFragmentCount: fragments.fragmentCount,
      acceptedFragments: fragments.fragments,
      ...routeMetadata(route),
    };
  });

const missingAccepted = baselineFiles.filter((file) => !acceptedSet.has(file));
const missingBundle = missingAccepted.filter((file) => !externalPrefixes.some((prefix) => file.startsWith(prefix)));
if (missingBundle.length) throw new Error(`accepted tree omits ${missingBundle.length} bundled routes`);

const routeManifest = {
  schemaVersion: 2,
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
