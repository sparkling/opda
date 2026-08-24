import { execFileSync } from 'node:child_process';

import { sha256 } from './ia-preservation-contract.mjs';

export const PRIOR_IA_ROUTE_MANIFEST = Object.freeze({
  commit: '487f6a4ba2684a75d30c0699823de7f5d4f4e121',
  path: 'src/data/ia-route-baseline.json',
  blob: '5c4443134d55a4718b51af471d977abd77c840d1',
  sha256: '84fa44000acf4a780faf4b9930d208807247756acf7868149c53c2e4a344132a',
  schemaVersion: 5,
  baselineCommit: 'bab150838f86c07edc758545dd88c07d89eb5d8a',
  acceptedCommit: 'd896b0d1b743078ca55649403b4337c638a5af38',
  routeCount: 3436,
  externalRetainCount: 650,
  missingPhysicalRouteCount: 651,
  missingPhysicalRecordsSha256: '0a8b78f893bcf85a063e06a8a97fe823a657cf94a5cf4d1ab0420bc7725bc93b',
  manifestRetainedRouteCount: 658,
  manifestRetainedRecordsSha256: '4b5d98709ee6709ccf208e83fda65ed168f36ca186755d987887557c102bcdb6',
});
export const PRIOR_IA_FAMILY_MANIFEST = Object.freeze({
  commit: PRIOR_IA_ROUTE_MANIFEST.commit,
  path: 'src/data/ia-preservation-baseline.json',
  blob: '104daa7acf9f3ef3d6540b85124186cd00834843',
  sha256: '04c162bbb4f53609044ff5574b7f8c66dec5285028871f70bc6d8be32874d7b7',
  schemaVersion: 1,
  familyCount: 8,
});
export const PDTF1_SOURCE_ROUTE_MANIFEST = Object.freeze({
  commit: 'ad17818e2e95b75663e7ca648e91e8a60cf27bd8',
  path: 'src/data/ia-route-baseline.json',
  blob: '815b4f5438054610a30bd7fd8621cd47d90b58d3',
  sha256: '77d2c7b96f77a6ece9f54f3857fed62d07078391416d768d3f6bb6f6f3d553a5',
  schemaVersion: 6,
  baselineCommit: PRIOR_IA_ROUTE_MANIFEST.baselineCommit,
  acceptedCommit: '4d4942b2bba05a9bdefc5d615adca7b15f971f20',
  routeCount: 3436,
  addedRouteCount: 64,
  acceptedRouteCount: 3500,
});
export const SCHEMA_TO_SCHEME_SOURCE_ROUTE_ADDITIONS = Object.freeze([
  ['/spdtf-2/working-groups/member-guide', 'spdtf-2/working-groups/member-guide/index.html', 'src/pages/spdtf-2/working-groups/member-guide/index.astro', 'c1d0168a17068d1b05e71fe8a188f5956987b094'],
  ['/spdtf-2/working-groups/member-guide/getting-started', 'spdtf-2/working-groups/member-guide/getting-started/index.html', 'src/pages/spdtf-2/working-groups/member-guide/getting-started.astro', '968fe95c9a94d85cfe26de8e388c6c5735d2a577'],
  ['/spdtf-2/working-groups/member-guide/meetings-and-records', 'spdtf-2/working-groups/member-guide/meetings-and-records/index.html', 'src/pages/spdtf-2/working-groups/member-guide/meetings-and-records.astro', '4b9eab6a25bc9719b0b01923f3c48069117f20fa'],
  ['/spdtf-2/working-groups/member-guide/model-review-and-decisions', 'spdtf-2/working-groups/member-guide/model-review-and-decisions/index.html', 'src/pages/spdtf-2/working-groups/member-guide/model-review-and-decisions.astro', 'dc484578fae524400dc78df26e7dc012ad47558c'],
  ['/spdtf-2/working-groups/member-guide/source-material-and-sharepoint', 'spdtf-2/working-groups/member-guide/source-material-and-sharepoint/index.html', 'src/pages/spdtf-2/working-groups/member-guide/source-material-and-sharepoint.astro', 'cd3d94e41a2c64cd0c2b0f8835521a01d3af3043'],
  ['/spdtf-2/working-groups/member-guide/teams-and-discussions', 'spdtf-2/working-groups/member-guide/teams-and-discussions/index.html', 'src/pages/spdtf-2/working-groups/member-guide/teams-and-discussions.astro', '3822167b31ad496fd37a02e89c2084f85e01d5ac'],
].map(([acceptedRoute, acceptedFile, sourceFile, sourceBlob]) => Object.freeze({
  acceptedRoute, acceptedFile, sourceFile, sourceBlob,
})));
export const SCHEMA_TO_SCHEME_SOURCE_ROUTE_MANIFEST = Object.freeze({
  commit: '3a52e644c57d2b4eed33d78e3a10810cc7a29171',
  path: 'src/data/ia-route-baseline.json',
  blob: 'c114dcc4d91706d122492e5bb57fa01cab5c74c6',
  sha256: 'fa51038160b4921916aa22d365e420e9e641613509f3cf052c96d34f6316dee2',
  schemaVersion: 7,
  baselineCommit: PRIOR_IA_ROUTE_MANIFEST.baselineCommit,
  acceptedCommit: '08c39c898883352339dc1ea001e2992611700faf',
  routeCount: 3209,
  addedRouteCount: 65,
  retiredRouteCount: 227,
  manifestAcceptedRouteCount: 3274,
  supplementalRouteCount: 6,
  supplementalRoutesSha256: '9ad56c09d1057762cd959b64c9ca614dad3b949a1ec96a2edd3143ee59241ab1',
  acceptedRouteCount: 3280,
  pdtfSchemaSourceRouteCount: 1264,
  spdtfSourceRouteCount: 747,
  pdtfIdentifierRouteCount: 1090,
  propertyPackSourceRouteCount: 693,
});
export const PDTF_SCHEMA_INPUT_SOURCE_ROUTE_MANIFEST = Object.freeze({
  commit: 'b827653b2c5b600120c36a2535b35b25da826902',
  path: 'src/data/ia-route-baseline.json',
  blob: '9f2a79f934ba8c885f960b17788bf2a0b07a96b9',
  sha256: '3a75aa2889d64d9529ad554dee126888b9795ddd94318cc3188fe04a9b5d2732',
  schemaVersion: 8,
  baselineCommit: PRIOR_IA_ROUTE_MANIFEST.baselineCommit,
  acceptedCommit: '2689f79920da57cb5bd6db0ed6165299b5c9b0d0',
  routeCount: 3209,
  addedRouteCount: 76,
  retiredRouteCount: 227,
  acceptedRouteCount: 3285,
  pdtfSchemaRoot: '/pdtf-schema',
  pdtfSchemaRouteCount: 1264,
  pdtfSchemaBaselineRouteCount: 1255,
  pdtfSchemaAddedRouteCount: 9,
  retainedRouteCount: 2021,
  pdtfIdentifierRouteCount: 1090,
  generatedToolRouteCount: 652,
  navigationFragmentIdCount: 37,
  navigationFragmentOccurrenceCount: 22607,
  navigationFragmentInventorySha256: '6a67a1671b894042c8a7325d09db682ed8397b4b4884499e4da7adedfa23ede9',
  commentKeyCount: 1264,
  commentKeyPairsSha256: '5d840155c49723947dc9ba271d078bb25255a04cd37473969372ac9971c85447',
  historicalCommentKeysSha256: '34fcab218a3856c0d54f5ff5fe0d8ea610b536f16a98eb2a94b238ee66364fce',
});
export const SEMANTIC_MODELLING_SOURCE_ROUTE_MANIFEST = Object.freeze({
  commit: '30b420160f931826ed1aef73a8a7a7f2aa1c54a1',
  path: 'src/data/ia-route-baseline.json',
  blob: '148354f8996459454ff56098fdf8634fc99c5554',
  sha256: 'de975cdb2a028e6cf4287948a99667de16b20a0d19e3c80b825a3c28d9d66672',
  schemaVersion: 9,
  baselineCommit: PRIOR_IA_ROUTE_MANIFEST.baselineCommit,
  acceptedCommit: '0f42f5ee923a79576fd31e0f186a23e67aa16548',
  routeCount: 3209,
  addedRouteCount: 87,
  retiredRouteCount: 227,
  acceptedRouteCount: 3296,
  sourceRoot: '/spdtf/ontologies',
  movedRouteCount: 11,
  navigationFragmentIdCount: 48,
  navigationFragmentOccurrenceCount: 528,
  navigationFragmentInventorySha256: 'abee58f64b0cff6fbb2fac4525caeb96e88557ff085b5b731813f6e4921b0dd7',
  navigationRoutePairsSha256: '94059c7dbb2ffa8c11c9d70bcc702dd57a34aebdadb193d50ed8c840410126b6',
  authoredFragmentIdCount: 105,
  authoredFragmentOccurrenceCount: 209,
  authoredFragmentInventorySha256: 'cbc11b257fec34b450fd5b28974243a8b794b5b4989f65e9538f3eff3f8e17dd',
  authoredRoutePairsSha256: 'eac8e3eadef88001321f1ee6bc588642568e1a751028bd6297d7ab055937de5c',
});
export const SITE_ROUTE_RETIREMENT_SOURCE_ROUTE_MANIFEST = Object.freeze({
  commit: 'f1aa9d17c94b0ca177ae6c7e16e05976295217d6',
  path: 'src/data/ia-route-baseline.json',
  blob: '75d33f86743916dcbf1beca380b27e403414282e',
  sha256: '4fbeed921d767c0283eec72a825ab41a6971c0e951311b4ae1634204b9cf6ecb',
  schemaVersion: 10,
  baselineCommit: PRIOR_IA_ROUTE_MANIFEST.baselineCommit,
  acceptedCommit: '30b420160f931826ed1aef73a8a7a7f2aa1c54a1',
  routeCount: 3209,
  addedRouteCount: 87,
  retiredRouteCount: 227,
  acceptedRouteCount: 3296,
});

const gitOptions = (root) => ({
  cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
  env: { ...process.env, GIT_NO_REPLACE_OBJECTS: '1' },
});
const git = (root, args) => execFileSync('git', args, gitOptions(root)).trim();

function requireAncestor(root, ancestor, descendant) {
  try { execFileSync('git', ['merge-base', '--is-ancestor', ancestor, descendant], gitOptions(root)); }
  catch { throw new Error(`required Git ancestry is absent: ${ancestor} -> ${descendant}`); }
}

function loadPinnedManifest(root, source) {
  const object = `${source.commit}:${source.path}`;
  if (git(root, ['rev-parse', object]) !== source.blob) throw new Error(`prior IA manifest blob changed: ${source.path}`);
  const raw = execFileSync('git', ['show', object], gitOptions(root));
  if (sha256(raw) !== source.sha256) throw new Error(`prior IA manifest bytes changed: ${source.path}`);
  return { raw, manifest: JSON.parse(raw) };
}

export function loadPriorIaRouteManifest(root) {
  requireAncestor(root, PRIOR_IA_ROUTE_MANIFEST.baselineCommit, PRIOR_IA_ROUTE_MANIFEST.commit);
  requireAncestor(root, PRIOR_IA_ROUTE_MANIFEST.acceptedCommit, PRIOR_IA_ROUTE_MANIFEST.commit);
  requireAncestor(root, PRIOR_IA_ROUTE_MANIFEST.commit, git(root, ['rev-parse', 'HEAD']));
  const result = loadPinnedManifest(root, PRIOR_IA_ROUTE_MANIFEST);
  const { manifest } = result;
  const routes = manifest.routes ?? [];
  if (manifest.schemaVersion !== PRIOR_IA_ROUTE_MANIFEST.schemaVersion
    || manifest.baselineCommit !== PRIOR_IA_ROUTE_MANIFEST.baselineCommit
    || manifest.acceptedCommit !== PRIOR_IA_ROUTE_MANIFEST.acceptedCommit
    || manifest.routeCount !== PRIOR_IA_ROUTE_MANIFEST.routeCount || routes.length !== manifest.routeCount
    || manifest.externalRetainCount !== PRIOR_IA_ROUTE_MANIFEST.externalRetainCount
    || new Set(routes.map(({ route }) => route)).size !== routes.length
    || new Set(routes.map(({ file }) => file)).size !== routes.length) {
    throw new Error('prior IA route manifest does not match its frozen contract');
  }
  return result;
}

export function loadPriorIaFamilyManifest(root) {
  const result = loadPinnedManifest(root, PRIOR_IA_FAMILY_MANIFEST);
  if (result.manifest.schemaVersion !== PRIOR_IA_FAMILY_MANIFEST.schemaVersion
    || result.manifest.families?.length !== PRIOR_IA_FAMILY_MANIFEST.familyCount) {
    throw new Error('prior IA family manifest does not match its frozen contract');
  }
  return result;
}

/** Load the accepted cut before the PDTF schema documentation URLs moved. */
export function loadPdtf1SourceRouteManifest(root) {
  requireAncestor(root, PDTF1_SOURCE_ROUTE_MANIFEST.commit, git(root, ['rev-parse', 'HEAD']));
  const result = loadPinnedManifest(root, PDTF1_SOURCE_ROUTE_MANIFEST);
  const { manifest } = result;
  const routes = manifest.routes ?? [];
  const additions = manifest.addedRoutes ?? [];
  const all = [...routes, ...additions];
  if (manifest.schemaVersion !== PDTF1_SOURCE_ROUTE_MANIFEST.schemaVersion
    || manifest.baselineCommit !== PDTF1_SOURCE_ROUTE_MANIFEST.baselineCommit
    || manifest.acceptedCommit !== PDTF1_SOURCE_ROUTE_MANIFEST.acceptedCommit
    || manifest.routeCount !== PDTF1_SOURCE_ROUTE_MANIFEST.routeCount
    || routes.length !== manifest.routeCount
    || manifest.addedRouteCount !== PDTF1_SOURCE_ROUTE_MANIFEST.addedRouteCount
    || additions.length !== manifest.addedRouteCount
    || all.length !== PDTF1_SOURCE_ROUTE_MANIFEST.acceptedRouteCount
    || new Set(all.map(({ acceptedRoute }) => acceptedRoute)).size !== all.length
    || new Set(all.map(({ acceptedFile }) => acceptedFile)).size !== all.length) {
    throw new Error('PDTF schema source route manifest does not match its frozen contract');
  }
  return result;
}

function routeWithin(route, root) {
  return route === root || route?.startsWith(`${root}/`);
}

/** Load the immutable reader-route cut immediately before schema-to-scheme renaming. */
export function loadSchemaToSchemeSourceRouteManifest(root) {
  requireAncestor(root, SCHEMA_TO_SCHEME_SOURCE_ROUTE_MANIFEST.commit, git(root, ['rev-parse', 'HEAD']));
  const result = loadPinnedManifest(root, SCHEMA_TO_SCHEME_SOURCE_ROUTE_MANIFEST);
  const { manifest } = result;
  const routes = manifest.routes ?? [];
  const additions = manifest.addedRoutes ?? [];
  const retired = manifest.retiredRoutes ?? [];
  const all = [...routes, ...additions];
  const countWithin = (routeRoot) => all.filter(({ acceptedRoute }) => (
    routeWithin(acceptedRoute, routeRoot)
  )).length;
  const supplemental = SCHEMA_TO_SCHEME_SOURCE_ROUTE_ADDITIONS;
  const supplementalDigest = sha256(supplemental.map((record) => [
    record.acceptedRoute, record.acceptedFile, record.sourceFile, record.sourceBlob,
  ].join('\0')).sort().join('\n'));
  const supplementalInvalid = supplemental.some((record) => (
    git(root, ['rev-parse', `${SCHEMA_TO_SCHEME_SOURCE_ROUTE_MANIFEST.commit}:${record.sourceFile}`])
      !== record.sourceBlob
  ));
  if (manifest.schemaVersion !== SCHEMA_TO_SCHEME_SOURCE_ROUTE_MANIFEST.schemaVersion
    || manifest.baselineCommit !== SCHEMA_TO_SCHEME_SOURCE_ROUTE_MANIFEST.baselineCommit
    || manifest.acceptedCommit !== SCHEMA_TO_SCHEME_SOURCE_ROUTE_MANIFEST.acceptedCommit
    || manifest.routeCount !== SCHEMA_TO_SCHEME_SOURCE_ROUTE_MANIFEST.routeCount
    || routes.length !== manifest.routeCount
    || manifest.addedRouteCount !== SCHEMA_TO_SCHEME_SOURCE_ROUTE_MANIFEST.addedRouteCount
    || additions.length !== manifest.addedRouteCount
    || manifest.retiredRouteCount !== SCHEMA_TO_SCHEME_SOURCE_ROUTE_MANIFEST.retiredRouteCount
    || retired.length !== manifest.retiredRouteCount
    || all.length !== SCHEMA_TO_SCHEME_SOURCE_ROUTE_MANIFEST.manifestAcceptedRouteCount
    || new Set(all.map(({ acceptedRoute }) => acceptedRoute)).size !== all.length
    || new Set(all.map(({ acceptedFile }) => acceptedFile)).size !== all.length
    || countWithin('/pdtf-1') !== SCHEMA_TO_SCHEME_SOURCE_ROUTE_MANIFEST.pdtfSchemaSourceRouteCount
    || countWithin('/spdtf-2') + supplemental.length
      !== SCHEMA_TO_SCHEME_SOURCE_ROUTE_MANIFEST.spdtfSourceRouteCount
    || countWithin('/pdtf') !== SCHEMA_TO_SCHEME_SOURCE_ROUTE_MANIFEST.pdtfIdentifierRouteCount
    || countWithin('/spdtf-2/property-pack')
      !== SCHEMA_TO_SCHEME_SOURCE_ROUTE_MANIFEST.propertyPackSourceRouteCount
    || supplemental.length !== SCHEMA_TO_SCHEME_SOURCE_ROUTE_MANIFEST.supplementalRouteCount
    || supplementalDigest !== SCHEMA_TO_SCHEME_SOURCE_ROUTE_MANIFEST.supplementalRoutesSha256
    || supplementalInvalid
    || supplemental.some(({ acceptedRoute, acceptedFile }) => (
      all.some((record) => record.acceptedRoute === acceptedRoute || record.acceptedFile === acceptedFile)
    ))) {
    throw new Error('schema-to-scheme source route manifest does not match its frozen contract');
  }
  return { ...result, supplementalRoutes: supplemental };
}

/** Load the immutable schema-v8 cut before PDTF schema became an SPDTF input. */
export function loadPdtfSchemaInputSourceRouteManifest(root) {
  const contract = PDTF_SCHEMA_INPUT_SOURCE_ROUTE_MANIFEST;
  requireAncestor(root, contract.commit, git(root, ['rev-parse', 'HEAD']));
  const result = loadPinnedManifest(root, contract);
  const { manifest } = result;
  const routes = manifest.routes ?? [];
  const additions = manifest.addedRoutes ?? [];
  const retired = manifest.retiredRoutes ?? [];
  const all = [...routes, ...additions];
  const within = (route, routeRoot) => route === routeRoot || route?.startsWith(`${routeRoot}/`);
  const pdtfSchema = all.filter(({ acceptedRoute }) => within(
    acceptedRoute, contract.pdtfSchemaRoot,
  ));
  const pdtfSchemaBaseline = routes.filter(({ acceptedRoute }) => within(
    acceptedRoute, contract.pdtfSchemaRoot,
  ));
  const pdtfSchemaAdded = additions.filter(({ acceptedRoute }) => within(
    acceptedRoute, contract.pdtfSchemaRoot,
  ));
  const stablePdtf = all.filter(({ acceptedRoute }) => within(acceptedRoute, '/pdtf'));
  const navigationFragments = new Map();
  for (const record of pdtfSchema) {
    for (const fragment of record.acceptedFragments ?? []) {
      if (!fragment.startsWith('section-nav-group-pdtf-schema-')
        && !fragment.startsWith('section-nav-pdtf-schema-')) continue;
      navigationFragments.set(fragment, (navigationFragments.get(fragment) ?? 0) + 1);
    }
  }
  const navigationFragmentInventorySha256 = sha256([...navigationFragments]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([fragment, count]) => `${fragment}\0${count}`).join('\n'));
  if (manifest.schemaVersion !== contract.schemaVersion
    || manifest.baselineCommit !== contract.baselineCommit
    || manifest.acceptedCommit !== contract.acceptedCommit
    || manifest.routeCount !== contract.routeCount || routes.length !== contract.routeCount
    || manifest.addedRouteCount !== contract.addedRouteCount
    || additions.length !== contract.addedRouteCount
    || manifest.retiredRouteCount !== contract.retiredRouteCount
    || retired.length !== contract.retiredRouteCount
    || all.length !== contract.acceptedRouteCount
    || new Set(all.map(({ acceptedRoute }) => acceptedRoute)).size !== all.length
    || new Set(all.map(({ acceptedFile }) => acceptedFile)).size !== all.length
    || pdtfSchema.length !== contract.pdtfSchemaRouteCount
    || pdtfSchemaBaseline.length !== contract.pdtfSchemaBaselineRouteCount
    || pdtfSchemaAdded.length !== contract.pdtfSchemaAddedRouteCount
    || all.length - pdtfSchema.length !== contract.retainedRouteCount
    || stablePdtf.length !== contract.pdtfIdentifierRouteCount
    || pdtfSchema.filter(({ acceptedGeneratedFamily }) => (
      acceptedGeneratedFamily === 'ontology/tools'
    )).length !== contract.generatedToolRouteCount
    || navigationFragments.size !== contract.navigationFragmentIdCount
    || [...navigationFragments.values()].reduce((sum, count) => sum + count, 0)
      !== contract.navigationFragmentOccurrenceCount
    || navigationFragmentInventorySha256 !== contract.navigationFragmentInventorySha256) {
    throw new Error('PDTF schema input source manifest does not match its frozen contract');
  }
  return result;
}

/** Load the immutable schema-v9 cut before semantic modelling became a peer section. */
export function loadSemanticModellingSourceRouteManifest(root) {
  const contract = SEMANTIC_MODELLING_SOURCE_ROUTE_MANIFEST;
  requireAncestor(root, contract.commit, git(root, ['rev-parse', 'HEAD']));
  const result = loadPinnedManifest(root, contract);
  const { manifest } = result;
  const routes = manifest.routes ?? [];
  const additions = manifest.addedRoutes ?? [];
  const retired = manifest.retiredRoutes ?? [];
  const all = [...routes, ...additions];
  const moved = all.filter(({ acceptedRoute }) => routeWithin(acceptedRoute, contract.sourceRoot));
  const navigation = new Map(); const navigationPairs = [];
  const authored = new Map(); const authoredPairs = [];
  for (const record of moved) for (const fragment of record.acceptedFragments ?? []) {
    const isNavigation = fragment.startsWith('section-nav-');
    const inventory = isNavigation ? navigation : authored;
    const pairs = isNavigation ? navigationPairs : authoredPairs;
    inventory.set(fragment, (inventory.get(fragment) ?? 0) + 1);
    pairs.push(`${record.acceptedRoute}\0${fragment}`);
  }
  const inventoryDigest = (inventory) => sha256([...inventory]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([fragment, count]) => `${fragment}\0${count}`).join('\n'));
  const pairsDigest = (pairs) => sha256([...pairs].sort().join('\n'));
  const valid = manifest.schemaVersion === contract.schemaVersion
    && manifest.baselineCommit === contract.baselineCommit
    && manifest.acceptedCommit === contract.acceptedCommit
    && manifest.routeCount === contract.routeCount && routes.length === contract.routeCount
    && manifest.addedRouteCount === contract.addedRouteCount && additions.length === contract.addedRouteCount
    && manifest.retiredRouteCount === contract.retiredRouteCount && retired.length === contract.retiredRouteCount
    && all.length === contract.acceptedRouteCount
    && new Set(all.map(({ acceptedRoute }) => acceptedRoute)).size === all.length
    && new Set(all.map(({ acceptedFile }) => acceptedFile)).size === all.length
    && moved.length === contract.movedRouteCount
    && moved.every((record) => additions.includes(record))
    && navigation.size === contract.navigationFragmentIdCount
    && navigationPairs.length === contract.navigationFragmentOccurrenceCount
    && inventoryDigest(navigation) === contract.navigationFragmentInventorySha256
    && pairsDigest(navigationPairs) === contract.navigationRoutePairsSha256
    && authored.size === contract.authoredFragmentIdCount
    && authoredPairs.length === contract.authoredFragmentOccurrenceCount
    && inventoryDigest(authored) === contract.authoredFragmentInventorySha256
    && pairsDigest(authoredPairs) === contract.authoredRoutePairsSha256;
  if (!valid) throw new Error('semantic-modelling source manifest does not match its frozen contract');
  return result;
}

/** Load the immutable schema-v10 cut before the duplicate /home route retired. */
export function loadSiteRouteRetirementSourceRouteManifest(root) {
  const contract = SITE_ROUTE_RETIREMENT_SOURCE_ROUTE_MANIFEST;
  requireAncestor(root, contract.commit, git(root, ['rev-parse', 'HEAD']));
  const result = loadPinnedManifest(root, contract);
  const { manifest } = result;
  const routes = manifest.routes ?? [];
  const additions = manifest.addedRoutes ?? [];
  const retired = manifest.retiredRoutes ?? [];
  const all = [...routes, ...additions];
  const home = all.filter(({ acceptedRoute }) => acceptedRoute === '/home');
  const valid = manifest.schemaVersion === contract.schemaVersion
    && manifest.baselineCommit === contract.baselineCommit
    && manifest.acceptedCommit === contract.acceptedCommit
    && manifest.routeCount === contract.routeCount && routes.length === contract.routeCount
    && manifest.addedRouteCount === contract.addedRouteCount && additions.length === contract.addedRouteCount
    && manifest.retiredRouteCount === contract.retiredRouteCount && retired.length === contract.retiredRouteCount
    && all.length === contract.acceptedRouteCount
    && new Set(all.map(({ acceptedRoute }) => acceptedRoute)).size === all.length
    && new Set(all.map(({ acceptedFile }) => acceptedFile)).size === all.length
    && home.length === 1 && home[0].acceptedFile === 'home/index.html'
    && home[0].retentionReceipt?.policy === 'explicit-route-block-retention-v1';
  if (!valid) throw new Error('site-route retirement source manifest does not match its frozen contract');
  return result;
}

export function verifyBaselineRootCommit(root) {
  if (git(root, ['rev-parse', 'HEAD']) !== PRIOR_IA_ROUTE_MANIFEST.baselineCommit) {
    throw new Error('baseline root is not the frozen IA baseline commit');
  }
}

/** Verify the built source cut used when historical pages were manifest-retained. */
export function verifyPdtf1SourceRootCommit(root) {
  if (git(root, ['rev-parse', 'HEAD']) !== PDTF1_SOURCE_ROUTE_MANIFEST.acceptedCommit) {
    throw new Error('PDTF schema source root is not the frozen pre-migration accepted commit');
  }
}

export function priorRouteRecordDigest(record) {
  return sha256(JSON.stringify(record));
}

export function missingPhysicalRecordsDigest(records) {
  return sha256([...records].sort((a, b) => a.route.localeCompare(b.route))
    .map((record) => [record.route, record.file, record.kind, record.baselineRawSha256].join('\0')).join('\n'));
}

export function manifestRetainedRecordsDigest(records) {
  return sha256([...records].sort((a, b) => a.baselineRoute.localeCompare(b.baselineRoute))
    .map((record) => [record.baselineRoute, record.baselineFile,
      record.baselineEvidence?.policy, record.baselineEvidence?.sourceRecordSha256].join('\0')).join('\n'));
}

export function composePriorManifestReceipt(records, missingRecords) {
  const receipt = {
    policy: 'composed-schema-v5-baseline-v1', commit: PRIOR_IA_ROUTE_MANIFEST.commit,
    path: PRIOR_IA_ROUTE_MANIFEST.path, blob: PRIOR_IA_ROUTE_MANIFEST.blob,
    sha256: PRIOR_IA_ROUTE_MANIFEST.sha256, routeCount: PRIOR_IA_ROUTE_MANIFEST.routeCount,
    missingPhysicalRouteCount: missingRecords.length,
    missingPhysicalRecordsSha256: missingPhysicalRecordsDigest(missingRecords),
    manifestRetainedRouteCount: records.length,
    manifestRetainedRecordsSha256: manifestRetainedRecordsDigest(records),
  };
  validatePriorManifestReceipt(receipt, records);
  if (receipt.missingPhysicalRouteCount !== PRIOR_IA_ROUTE_MANIFEST.missingPhysicalRouteCount
    || receipt.missingPhysicalRecordsSha256 !== PRIOR_IA_ROUTE_MANIFEST.missingPhysicalRecordsSha256) {
    throw new Error('prior IA missing-physical receipt is invalid');
  }
  return receipt;
}

export function validatePriorManifestReceipt(receipt, records) {
  for (const field of ['commit', 'path', 'blob', 'sha256', 'routeCount', 'missingPhysicalRouteCount',
    'missingPhysicalRecordsSha256', 'manifestRetainedRouteCount', 'manifestRetainedRecordsSha256']) {
    if (receipt?.[field] !== PRIOR_IA_ROUTE_MANIFEST[field]) {
      throw new Error(`prior IA manifest composition receipt has invalid ${field}`);
    }
  }
  const byteEvidence = records.filter(({ baselineEvidence }) => (
    baselineEvidence?.policy === 'prior-schema-v5-byte-identity-v1'
  ));
  const informationEvidence = records.filter(({ baselineEvidence }) => (
    baselineEvidence?.policy === 'prior-schema-v5-information-identity-v1'
  ));
  if (receipt.policy !== 'composed-schema-v5-baseline-v1' || records.length !== receipt.manifestRetainedRouteCount
    || byteEvidence.length !== PRIOR_IA_ROUTE_MANIFEST.missingPhysicalRouteCount
    || informationEvidence.length !== PRIOR_IA_ROUTE_MANIFEST.manifestRetainedRouteCount
      - PRIOR_IA_ROUTE_MANIFEST.missingPhysicalRouteCount
    || manifestRetainedRecordsDigest(records) !== receipt.manifestRetainedRecordsSha256) {
    throw new Error('prior IA manifest composition receipt is invalid');
  }
}

export function manifestRetainedBaselineProjectionMatches(record, prior) {
  const evidence = record.baselineEvidence;
  return priorRouteRecordDigest(prior) === evidence?.sourceRecordSha256
    && record.baselineRoute === prior?.route && record.baselineFile === prior?.file
    && evidence.sourceKind === prior?.kind && record.baselineCommit === prior?.baselineCommit
    && record.baselineGeneratedFamily === prior?.generatedFamily
    && record.baselineRawSha256 === prior?.baselineRawSha256
    && record.baselineContentSha256 === prior?.baselineContentSha256
    && record.baselineFragmentSha256 === prior?.baselineFragmentSha256
    && record.baselineFragmentCount === prior?.baselineFragmentCount
    && JSON.stringify(record.baselineFragments) === JSON.stringify(prior?.baselineFragments)
    && record.equivalenceReceipt?.baselineBlockInventorySha256
      === prior?.equivalenceReceipt?.baselineBlockInventorySha256;
}

/**
 * Attest the frozen pre-migration source cut independently of any later move
 * receipt. A final accepted receipt must never excuse drift in this source.
 */
export function manifestRetainedSourceRecordMatches(record, prior) {
  if (!manifestRetainedBaselineProjectionMatches(record, prior)) return false;
  const evidence = record.baselineEvidence;
  if (evidence.policy === 'prior-schema-v5-byte-identity-v1') {
    return record.acceptedRawSha256 === record.baselineRawSha256;
  }
  if (evidence.policy !== 'prior-schema-v5-information-identity-v1') return false;
  return record.acceptedContentSha256 === record.baselineContentSha256
    && record.acceptedBlockInventorySha256 === prior.equivalenceReceipt.baselineBlockInventorySha256;
}

function retainedFamiliesDigest(families) {
  return sha256(families.map((family) => [family.id, family.baselineEvidence?.sourceFamilyId,
    family.baselineEvidence?.sourceFamilySha256].join('\0')).sort().join('\n'));
}

export function composePriorFamilyReceipt(families) {
  return {
    policy: 'composed-schema-v1-family-baseline-v1', commit: PRIOR_IA_FAMILY_MANIFEST.commit,
    path: PRIOR_IA_FAMILY_MANIFEST.path, blob: PRIOR_IA_FAMILY_MANIFEST.blob,
    sha256: PRIOR_IA_FAMILY_MANIFEST.sha256, familyCount: PRIOR_IA_FAMILY_MANIFEST.familyCount,
    retainedFamiliesSha256: retainedFamiliesDigest(families),
  };
}

export function validatePriorFamilyReceipt(receipt, families) {
  for (const field of ['commit', 'path', 'blob', 'sha256', 'familyCount']) {
    if (receipt?.[field] !== PRIOR_IA_FAMILY_MANIFEST[field]) throw new Error('prior IA family composition receipt is invalid');
  }
  if (receipt.policy !== 'composed-schema-v1-family-baseline-v1' || families.length !== receipt.familyCount
    || receipt.retainedFamiliesSha256 !== retainedFamiliesDigest(families)) {
    throw new Error('prior IA family composition receipt is invalid');
  }
}

export function priorFamilyMatches(family, prior) {
  return family.baselineEvidence?.policy === 'prior-schema-v1-family-v1'
    && family.baselineEvidence.sourceFamilySha256 === sha256(JSON.stringify(prior))
    && JSON.stringify(family.baseline) === JSON.stringify(prior?.baseline);
}
