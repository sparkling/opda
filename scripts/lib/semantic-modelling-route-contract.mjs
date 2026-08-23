import { sha256 } from './ia-preservation-primitives.mjs';
import {
  SEMANTIC_MODELLING_SOURCE_ROUTE_MANIFEST,
  loadSemanticModellingSourceRouteManifest,
} from './ia-prior-manifest-contract.mjs';
import {
  getLegacyCommentKey,
  getSemanticModellingReplacementRoute,
} from '../../src/lib/site-route-migrations.mjs';

export const SEMANTIC_MODELLING_ROUTE_MIGRATION = Object.freeze({
  sourceRoot: '/spdtf/ontologies',
  targetRoot: '/semantic-modelling',
  redirects: false,
});

export const SEMANTIC_MODELLING_FROZEN_RECEIPT_FIELDS = Object.freeze([
  'retiredRoutes',
  'propertyPackMigration',
  'pdtf1Migration',
  'pdtfSchemaFragmentMigration',
  'schemaToSchemeMigration',
  'pdtfSchemaInputMigration',
  'leaseTermCaseCollision',
]);

const acceptedRecords = (manifest) => [
  ...(manifest?.routes ?? []), ...(manifest?.addedRoutes ?? []),
];
const within = (route, root) => route === root || route?.startsWith(`${root}/`);
const digest = (values) => sha256([...values].sort().join('\n'));
const navigationFragment = (fragment) => fragment.startsWith('section-nav-');

function validFragments(record) {
  return Array.isArray(record?.acceptedFragments)
    && record.acceptedFragmentCount === record.acceptedFragments.length
    && new Set(record.acceptedFragments).size === record.acceptedFragments.length
    && sha256(record.acceptedFragments.join('\n')) === record.acceptedFragmentSha256;
}

function targetFile(sourceFile, migration) {
  const source = migration.sourceRoot.slice(1);
  const target = migration.targetRoot.slice(1);
  if (sourceFile === `${source}/index.html`) return `${target}/index.html`;
  return sourceFile.startsWith(`${source}/`)
    ? `${target}/${sourceFile.slice(source.length + 1)}` : null;
}

/** Bind the schema-v9 SPDTF child pages to their clean top-level hierarchy. */
export function composeSemanticModellingMigrationReceipt({
  records,
  addedRecords,
  sourceManifest,
  sourceContract = SEMANTIC_MODELLING_SOURCE_ROUTE_MANIFEST,
  migration = SEMANTIC_MODELLING_ROUTE_MIGRATION,
  replacementRoute = getSemanticModellingReplacementRoute,
  commentKey = getLegacyCommentKey,
}) {
  const source = acceptedRecords(sourceManifest);
  const accepted = [...records, ...addedRecords];
  const acceptedByRoute = new Map(accepted.map((record) => [record.acceptedRoute, record]));
  if (sourceManifest.schemaVersion !== sourceContract.schemaVersion
    || sourceManifest.baselineCommit !== sourceContract.baselineCommit
    || sourceManifest.acceptedCommit !== sourceContract.acceptedCommit
    || sourceManifest.routeCount !== sourceContract.routeCount
    || sourceManifest.addedRouteCount !== sourceContract.addedRouteCount
    || sourceManifest.retiredRouteCount !== sourceContract.retiredRouteCount
    || source.length !== sourceContract.acceptedRouteCount
    || new Set(source.map(({ acceptedRoute }) => acceptedRoute)).size !== source.length
    || new Set(source.map(({ acceptedFile }) => acceptedFile)).size !== source.length
    || acceptedByRoute.size !== accepted.length
    || new Set(accepted.map(({ acceptedFile }) => acceptedFile)).size !== accepted.length
    || migration.sourceRoot !== sourceContract.sourceRoot || migration.redirects !== false) {
    throw new Error('semantic-modelling route inventories are incomplete or duplicated');
  }

  const accounted = new Set(); const moved = []; const retained = [];
  const sourceNavigation = []; const removedNavigation = [];
  const sourceAuthored = []; const targetAuthored = []; const authoredPairs = [];
  const addedNavigation = []; const commentPairs = []; const commentKeys = [];
  for (const before of source) {
    const isMoved = within(before.acceptedRoute, migration.sourceRoot);
    const declaredTarget = replacementRoute(before.acceptedRoute);
    if (isMoved !== Boolean(declaredTarget)) {
      throw new Error(`semantic-modelling route has an undeclared disposition: ${before.acceptedRoute}`);
    }
    const targetRoute = declaredTarget ?? before.acceptedRoute;
    const after = acceptedByRoute.get(targetRoute);
    if (!after || accounted.has(targetRoute) || (isMoved && acceptedByRoute.has(before.acceptedRoute))) {
      throw new Error(`semantic-modelling route is missing, duplicated, or retained: ${before.acceptedRoute}`);
    }
    const expectedFile = isMoved ? targetFile(before.acceptedFile, migration) : before.acceptedFile;
    if (!expectedFile || after.acceptedFile !== expectedFile
      || (isMoved && !within(targetRoute, migration.targetRoot))) {
      throw new Error(`semantic-modelling file projection changed: ${before.acceptedRoute}`);
    }
    accounted.add(targetRoute);
    (isMoved ? moved : retained).push({ before, after });
    if (!isMoved) continue;
    if (before.acceptedGeneratedFamily !== 'spdtf'
      || after.acceptedGeneratedFamily !== 'semantic-modelling'
      || before.acceptedContentSha256 !== after.acceptedContentSha256
      || before.acceptedBlockInventorySha256 !== after.acceptedBlockInventorySha256) {
      throw new Error(`semantic-modelling information or route family changed: ${before.acceptedRoute}`);
    }
    if (!validFragments(before) || !validFragments(after)) {
      throw new Error(`semantic-modelling fragment inventory is invalid: ${before.acceptedRoute}`);
    }
    const beforeAuthored = before.acceptedFragments.filter((fragment) => !navigationFragment(fragment));
    const afterAuthored = after.acceptedFragments.filter((fragment) => !navigationFragment(fragment));
    const beforeNavigation = before.acceptedFragments.filter(navigationFragment);
    const afterNavigation = after.acceptedFragments.filter(navigationFragment);
    if (JSON.stringify(beforeAuthored) !== JSON.stringify(afterAuthored)
      || beforeNavigation.some((fragment) => after.acceptedFragments.includes(fragment))
      || afterNavigation.length !== 2
      || afterNavigation.some((fragment) => !fragment.startsWith('section-nav-group-semantic-modelling-'))) {
      throw new Error(`semantic-modelling authored or navigation fragments changed unexpectedly: ${before.acceptedRoute}`);
    }
    for (const fragment of beforeNavigation) {
      sourceNavigation.push(`${before.acceptedRoute}\0${fragment}`);
      removedNavigation.push(`${before.acceptedRoute}\0${targetRoute}\0${fragment}`);
    }
    for (const fragment of beforeAuthored) {
      sourceAuthored.push(`${before.acceptedRoute}\0${fragment}`);
      targetAuthored.push(`${targetRoute}\0${fragment}`);
      authoredPairs.push(`${before.acceptedRoute}\0${targetRoute}\0${fragment}`);
    }
    for (const fragment of afterNavigation) addedNavigation.push(`${targetRoute}\0${fragment}`);
    const historicalKey = commentKey(targetRoute);
    if (!within(historicalKey, '/spdtf-2/ontologies')) {
      throw new Error(`semantic-modelling comment identity changed: ${targetRoute}`);
    }
    commentPairs.push(`${targetRoute}\0${historicalKey}`);
    commentKeys.push(historicalKey);
  }

  const movedBaseline = moved.filter(({ before }) => sourceManifest.routes.includes(before));
  const movedAdded = moved.filter(({ before }) => sourceManifest.addedRoutes.includes(before));
  if (moved.length !== sourceContract.movedRouteCount || movedBaseline.length !== 0
    || movedAdded.length !== sourceContract.movedRouteCount
    || sourceNavigation.length !== sourceContract.navigationFragmentOccurrenceCount
    || new Set(sourceNavigation.map((entry) => entry.slice(entry.indexOf('\0') + 1))).size
      !== sourceContract.navigationFragmentIdCount
    || digest(sourceNavigation) !== sourceContract.navigationRoutePairsSha256
    || sourceAuthored.length !== sourceContract.authoredFragmentOccurrenceCount
    || new Set(sourceAuthored.map((entry) => entry.slice(entry.indexOf('\0') + 1))).size
      !== sourceContract.authoredFragmentIdCount
    || digest(sourceAuthored) !== sourceContract.authoredRoutePairsSha256
    || commentKeys.length !== moved.length || new Set(commentKeys).size !== moved.length) {
    throw new Error('semantic-modelling route-family counts differ from the frozen source cut');
  }
  const postSourceAdditions = accepted.filter(({ acceptedRoute }) => !accounted.has(acceptedRoute));
  if (postSourceAdditions.some(({ acceptedRoute, kind, introducedBy }) => (
    within(acceptedRoute, migration.sourceRoot) || within(acceptedRoute, migration.targetRoot)
      || kind !== 'new-authority-route' || typeof introducedBy !== 'string' || !introducedBy
  ))) throw new Error('semantic-modelling post-source additions are unclassified or unsafe');

  return {
    policy: 'semantic-modelling-route-composition-v1',
    sourceCommit: sourceContract.commit,
    sourcePath: sourceContract.path,
    sourceBlob: sourceContract.blob,
    sourceSha256: sourceContract.sha256,
    sourceSchemaVersion: sourceContract.schemaVersion,
    sourceAcceptedCommit: sourceContract.acceptedCommit,
    sourceRoot: migration.sourceRoot,
    targetRoot: migration.targetRoot,
    sourceRouteCount: source.length,
    movedRouteCount: moved.length,
    movedBaselineRouteCount: movedBaseline.length,
    movedAddedRouteCount: movedAdded.length,
    retainedRouteCount: retained.length,
    exactInformationRouteCount: moved.length,
    informationReframeRouteCount: 0,
    postSourceAdditionRouteCount: postSourceAdditions.length,
    acceptedSiteRouteCount: accepted.length,
    sourceRoutesSha256: digest(moved.map(({ before }) => before.acceptedRoute)),
    targetRoutesSha256: digest(moved.map(({ after }) => after.acceptedRoute)),
    sourceFilesSha256: digest(moved.map(({ before }) => before.acceptedFile)),
    targetFilesSha256: digest(moved.map(({ after }) => after.acceptedFile)),
    movedRoutePairsSha256: digest(moved.map(({ before, after }) => (
      `${before.acceptedRoute}\0${after.acceptedRoute}\0${before.acceptedFile}\0${after.acceptedFile}`
    ))),
    retainedRoutePairsSha256: digest(retained.map(({ before, after }) => (
      `${before.acceptedRoute}\0${after.acceptedRoute}\0${before.acceptedFile}\0${after.acceptedFile}`
    ))),
    exactInformationPairsSha256: digest(moved.map(({ before, after }) => (
      `${before.acceptedRoute}\0${after.acceptedRoute}\0${before.acceptedContentSha256}`
        + `\0${before.acceptedBlockInventorySha256}\0${after.acceptedContentSha256}`
        + `\0${after.acceptedBlockInventorySha256}`
    ))),
    sourceNavigationFragmentCount: sourceNavigation.length,
    sourceNavigationFragmentIdCount: sourceContract.navigationFragmentIdCount,
    sourceNavigationFragmentsSha256: digest(sourceNavigation),
    removedNavigationFragmentsSha256: digest(removedNavigation),
    retainedAuthoredFragmentCount: sourceAuthored.length,
    retainedAuthoredFragmentIdCount: sourceContract.authoredFragmentIdCount,
    sourceAuthoredFragmentsSha256: digest(sourceAuthored),
    targetAuthoredFragmentsSha256: digest(targetAuthored),
    authoredFragmentPairsSha256: digest(authoredPairs),
    addedNavigationFragmentCount: addedNavigation.length,
    addedNavigationFragmentIdCount: new Set(addedNavigation.map((entry) => entry.slice(entry.indexOf('\0') + 1))).size,
    addedNavigationFragmentsSha256: digest(addedNavigation),
    commentKeyCount: commentKeys.length,
    distinctCommentKeyCount: new Set(commentKeys).size,
    commentKeyPairsSha256: digest(commentPairs),
    historicalCommentKeysSha256: digest(commentKeys),
    postSourceAdditionRoutesSha256: digest(postSourceAdditions.map(({ acceptedRoute }) => acceptedRoute)),
    redirects: false,
  };
}

/** Validate only the v9 -> v10 cut and prove all earlier receipts stayed frozen. */
export function validateSemanticModellingManifest(root, manifest, records, addedRecords) {
  const { manifest: sourceManifest } = loadSemanticModellingSourceRouteManifest(root);
  for (const field of SEMANTIC_MODELLING_FROZEN_RECEIPT_FIELDS) {
    if (JSON.stringify(manifest[field]) !== JSON.stringify(sourceManifest[field])) {
      throw new Error(`schema-v9 ${field} receipt was rewritten by the semantic-modelling cut`);
    }
  }
  const actual = composeSemanticModellingMigrationReceipt({
    records, addedRecords, sourceManifest,
  });
  if (JSON.stringify(actual) !== JSON.stringify(manifest.semanticModellingMigration)) {
    throw new Error('semantic-modelling migration receipt is inconsistent');
  }
}
