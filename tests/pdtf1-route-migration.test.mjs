import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  composePdtf1RetiredAliases,
  generatedFamily,
  nonInformationBlocksDigest,
  pdtf1MigrationReceipt,
  semanticBlocksDigest,
  sha256,
} from '../scripts/lib/ia-preservation-contract.mjs';
import {
  loadPdtf1SourceRouteManifest,
  loadPriorIaRouteManifest,
  manifestRetainedBaselineProjectionMatches,
  manifestRetainedSourceRecordMatches,
} from '../scripts/lib/ia-prior-manifest-contract.mjs';
import {
  PDTF1_ROUTE_MIGRATION,
  PDTF1_ROUTES,
  getPdtf1LegacyCommentKey,
  getPdtf1ReplacementRoute,
  isRetiredPdtf1DocumentationRoute,
  isRetiredPdtf1ManualAlias,
  isStablePdtfIdentifierRoute,
} from '../src/lib/pdtf1-routes.mjs';
import {
  getAcceptedRouteFile,
  getDeclaredRouteReplacement,
  getLegacyCommentKey,
} from '../src/lib/site-route-migrations.mjs';

const projectRoot = new URL('..', import.meta.url).pathname;
const { manifest: sourceManifest } = loadPdtf1SourceRouteManifest(projectRoot);

test('PDTF 1.0 documentation routes move beneath their full reader hierarchy', () => {
  assert.deepEqual(PDTF1_ROUTE_MIGRATION, {
    canonicalRoot: '/pdtf-1',
    retiredRoots: ['/schema', '/implementation', '/adoption', '/model', '/ontology', '/mapping', '/manual'],
    sourceRouteCount: 3500,
    movedCanonicalRouteCount: 1262,
    movedBaselineRouteCount: 1255,
    movedAddedRouteCount: 7,
    movedFamilyRouteCounts: {
      adoption: 6,
      implementation: 6,
      mapping: 163,
      model: 227,
      modelling: 10,
      ontology: 746,
      schema: 104,
    },
    retiredAliasRouteCount: 227,
    stableIdentifierRouteCount: 1090,
    generatedToolRouteCount: 652,
    ontologyArtefactHtmlRouteCount: 1,
    canonicalFamilyRouteCount: 1264,
    sourceReframeRouteCount: 3,
    sourceReframeTotalBlockCount: 354,
    sourceReframeExactBlockCount: 347,
    sourceReframeSemanticBlockCount: 7,
    sourceReframeNonInformationBlockCount: 0,
    sourceReframeRoutesSha256: '201b26d42fa6abec654a4a7b01b4a77da1a29cf886aa94bc7c98d46bdc81fc0f',
    postSourceAdditionRouteCount: 1,
    acceptedSiteRouteCount: 3274,
    redirects: false,
    stableIdentifierRoot: '/pdtf',
  });
  for (const [before, after] of [
    ['/schema/legal-estate/title', `${PDTF1_ROUTES.original}/schema/legal-estate/title`],
    ['/modelling/data-dictionary', `${PDTF1_ROUTES.original}/data-dictionary`],
    ['/modelling/overlays', `${PDTF1_ROUTES.original}/schema/overlays`],
    ['/modelling/standards-stack', `${PDTF1_ROUTES.historicalModelling}/standards-stack`],
    ['/mapping/triplesmaps/example', `${PDTF1_ROUTES.schemaVerification}/triplesmaps/example`],
    ['/model/logical/property', `${PDTF1_ROUTES.modelViews}/logical/property`],
    ['/ontology/context/agent', `${PDTF1_ROUTES.concepts}/contexts/agent`],
    ['/ontology/category/kind', `${PDTF1_ROUTES.terms}/categories/kind`],
    ['/ontology/profile/baspi5', `${PDTF1_ROUTES.validation}/profiles/baspi5`],
    ['/ontology/tools/widoco/index.html', `${PDTF1_ROUTES.use}/tools/widoco/index.html`],
  ]) {
    assert.equal(getPdtf1ReplacementRoute(before), after);
    assert.equal(getPdtf1LegacyCommentKey(after), before);
  }
  assert.equal(generatedFamily(`${PDTF1_ROUTES.use}/tools/widoco/index.html`), 'ontology/tools');
});

test('PDTF term IRIs and governance-owned decisions are not compatibility routes', () => {
  for (const route of [
    '/pdtf/Property', '/pdtf/Property.ttl',
    '/modelling/adr/adr-0075', '/modelling/odr/odr-0035',
    '/api/v2/sso/exchange', '/schemas/v2/example',
  ]) assert.equal(getPdtf1ReplacementRoute(route), null, route);
});

test('retired manual aliases map to the model hierarchy but never own comment identity', () => {
  const canonical = `${PDTF1_ROUTES.modelViews}/logical/property`;
  assert.equal(getPdtf1ReplacementRoute('/manual/logical/property'), canonical);
  assert.equal(getPdtf1ReplacementRoute('/model/logical/property'), canonical);
  assert.equal(getPdtf1LegacyCommentKey(canonical), '/model/logical/property');
});

test('the frozen source cut accounts for every moved, retired, and stable PDTF route', () => {
  const baselineSet = new Set(sourceManifest.routes);
  const source = [...sourceManifest.routes, ...sourceManifest.addedRoutes];
  const manual = source.filter(({ acceptedRoute }) => isRetiredPdtf1ManualAlias(acceptedRoute));
  const stable = source.filter(({ acceptedRoute }) => isStablePdtfIdentifierRoute(acceptedRoute));
  const moved = source.filter(({ acceptedRoute }) => (
    !isRetiredPdtf1ManualAlias(acceptedRoute)
      && !isStablePdtfIdentifierRoute(acceptedRoute)
      && getPdtf1ReplacementRoute(acceptedRoute)
  ));
  assert.equal(source.length, 3500);
  assert.equal(moved.length, 1262);
  assert.equal(moved.filter((record) => baselineSet.has(record)).length, 1255);
  assert.equal(moved.filter((record) => !baselineSet.has(record)).length, 7);
  assert.equal(manual.length, 227);
  assert.equal(stable.length, 1090);
  assert.ok(manual.every((record) => record.equivalenceReceipt.acceptedBlocks === 0
    && record.acceptedFragmentCount === 0 && record.acceptedFragments.length === 0));
  assert.ok(stable.every(({ acceptedRoute }) => getPdtf1ReplacementRoute(acceptedRoute) === null));
  const targets = moved.map(({ acceptedRoute }) => getPdtf1ReplacementRoute(acceptedRoute));
  assert.equal(new Set(targets).size, 1262);
  assert.ok(targets.every((route) => route.startsWith('/pdtf-1/')));
  assert.ok(moved.every(({ acceptedRoute }) => (
    getPdtf1LegacyCommentKey(getPdtf1ReplacementRoute(acceptedRoute)) === acceptedRoute
  )));
  assert.equal(isRetiredPdtf1DocumentationRoute('/ontology/classes'), true);
  assert.equal(isRetiredPdtf1DocumentationRoute('/manual/logical/property'), true);
  assert.equal(isRetiredPdtf1DocumentationRoute('/pdtf/Property'), false);
  assert.equal(isRetiredPdtf1DocumentationRoute('/modelling/adr/adr-0075'), false);
});

test('the complete PDTF migration receipt is bijective and preserves information and fragments', () => {
  const project = (record) => {
    const sourceRoute = record.acceptedRoute;
    const replacement = isStablePdtfIdentifierRoute(sourceRoute)
      ? null : getDeclaredRouteReplacement(sourceRoute);
    return {
      ...record,
      acceptedRoute: replacement ?? sourceRoute,
      acceptedFile: replacement
        ? getAcceptedRouteFile(sourceRoute, record.acceptedFile) : record.acceptedFile,
    };
  };
  const records = sourceManifest.routes
    .filter(({ acceptedRoute }) => !isRetiredPdtf1ManualAlias(acceptedRoute))
    .map(project);
  const addedRecords = [
    ...sourceManifest.addedRoutes.map(project),
    {
      acceptedRoute: '/modelling/adr/adr-0076',
      acceptedFile: 'modelling/adr/adr-0076.html',
      kind: 'new-authority-route',
      introducedBy: 'test-accepted-commit',
    },
  ];
  const retiredAliases = composePdtf1RetiredAliases(sourceManifest, getDeclaredRouteReplacement);
  const exactMigration = {
    ...PDTF1_ROUTE_MIGRATION,
    sourceReframeRouteCount: 0,
    sourceReframeTotalBlockCount: 0,
    sourceReframeExactBlockCount: 0,
    sourceReframeSemanticBlockCount: 0,
    sourceReframeNonInformationBlockCount: 0,
    sourceReframeRoutesSha256: sha256(''),
  };
  const receipt = pdtf1MigrationReceipt({
    records,
    addedRecords,
    retiredAliases,
    migration: exactMigration,
    replacementRoute: getDeclaredRouteReplacement,
    sourceManifest,
  });
  assert.deepEqual(receipt, {
    policy: 'canonical-move-with-retired-aliases-v1',
    sourceRouteCount: 3500,
    movedCanonicalRouteCount: 1262,
    movedBaselineRouteCount: 1255,
    movedAddedRouteCount: 7,
    movedFamilyRouteCounts: PDTF1_ROUTE_MIGRATION.movedFamilyRouteCounts,
    retiredAliasRouteCount: 227,
    stableIdentifierRouteCount: 1090,
    generatedToolRouteCount: 652,
    ontologyArtefactHtmlRouteCount: 1,
    canonicalFamilyRouteCount: 1264,
    sourceReframeRouteCount: 0,
    sourceReframeTotalBlockCount: 0,
    sourceReframeExactBlockCount: 0,
    sourceReframeSemanticBlockCount: 0,
    sourceReframeNonInformationBlockCount: 0,
    sourceReframeRoutesSha256: sha256(''),
    postSourceAdditionRouteCount: 1,
    acceptedSiteRouteCount: 3274,
    movedRoutePairsSha256: '1b6e16602c4c42f28d7ef02a7cb7a9eabac95312982af9f7a5dbf39b5957f518',
    retiredAliasesSha256: '69937654bff444ca07418b3ba9fe7d08df4e1e58b014cf55aceff09729a2369b',
    stableIdentifierRoutesSha256: 'cf2e83c5290fe5b5b2fe2f5b25e31d2d8f53d8be90cd533e5e43de8ff30a88be',
    redirects: false,
    canonicalRoot: '/pdtf-1',
    stableIdentifierRoot: '/pdtf',
  });
  assert.equal(getAcceptedRouteFile(
    '/ontology/tools/skosmos/schemes', 'ontology/tools/skosmos/schemes.html',
  ), `${PDTF1_ROUTES.use.slice(1)}/tools/skosmos/schemes.html`);

  const fragmentLoss = structuredClone(records);
  const changed = fragmentLoss.find(({ baselineRoute }) => baselineRoute === '/ontology/classes');
  changed.acceptedFragmentSha256 = '0'.repeat(64);
  assert.throws(() => pdtf1MigrationReceipt({
    records: fragmentLoss, addedRecords, retiredAliases, migration: exactMigration,
    replacementRoute: getDeclaredRouteReplacement, sourceManifest,
  }), /information or fragments changed/u);

  const sourceBakeOff = [...sourceManifest.routes, ...sourceManifest.addedRoutes]
    .find(({ acceptedRoute }) => acceptedRoute === '/ontology/bake-off');
  const forgedExact = structuredClone(records);
  const forgedTarget = forgedExact.find(({ acceptedRoute }) => (
    acceptedRoute === getDeclaredRouteReplacement(sourceBakeOff.acceptedRoute)
  ));
  forgedTarget.acceptedContentSha256 = '1'.repeat(64);
  forgedTarget.acceptedBlockInventorySha256 = '2'.repeat(64);
  forgedTarget.pdtf1SourceRetentionReceipt = {
    policy: 'explicit-pdtf1-source-block-retention-v1',
    sourceRoute: sourceBakeOff.acceptedRoute,
    sourceFile: sourceBakeOff.acceptedFile,
    sourceRecordSha256: sha256(JSON.stringify(sourceBakeOff)),
    sourceContentSha256: sourceBakeOff.acceptedContentSha256,
    sourceBlockInventorySha256: sourceBakeOff.acceptedBlockInventorySha256,
    sourceFragmentSha256: sourceBakeOff.acceptedFragmentSha256,
    sourceFragmentCount: sourceBakeOff.acceptedFragmentCount,
    sourceFragments: sourceBakeOff.acceptedFragments,
    acceptedRoute: forgedTarget.acceptedRoute,
    baselineBlockCount: sourceBakeOff.equivalenceReceipt.acceptedBlocks,
    baselineBlockInventorySha256: sourceBakeOff.acceptedBlockInventorySha256,
    targetEvidence: [{
      route: forgedTarget.acceptedRoute,
      acceptedContentSha256: forgedTarget.acceptedContentSha256,
      acceptedBlockInventorySha256: forgedTarget.acceptedBlockInventorySha256,
    }],
    exactRetainedBlocks: sourceBakeOff.equivalenceReceipt.acceptedBlocks,
    semanticReframeBlockCount: 0,
    semanticReframeBlocks: [],
    semanticReframeBlocksSha256: semanticBlocksDigest([]),
    nonInformationBlockCount: 0,
    nonInformationBlocks: [],
    nonInformationBlocksSha256: nonInformationBlocksDigest([]),
  };
  assert.throws(() => pdtf1MigrationReceipt({
    records: forgedExact, addedRecords, retiredAliases, migration: exactMigration,
    replacementRoute: getDeclaredRouteReplacement, sourceManifest,
  }), /information or fragments changed/u);

  const forgedStable = structuredClone(records);
  const stableTarget = forgedStable.find(({ acceptedRoute }) => acceptedRoute === '/pdtf/Property');
  stableTarget.pdtf1SourceRetentionReceipt = { policy: 'forged' };
  assert.throws(() => pdtf1MigrationReceipt({
    records: forgedStable, addedRecords, retiredAliases, migration: exactMigration,
    replacementRoute: getDeclaredRouteReplacement, sourceManifest,
  }), /information or fragments changed/u);
  assert.throws(() => pdtf1MigrationReceipt({
    records, addedRecords, retiredAliases: retiredAliases.slice(1), migration: exactMigration,
    replacementRoute: getDeclaredRouteReplacement, sourceManifest,
  }), /retired alias contract/u);
});

test('composed comment identities retain Property Pack and PDTF threads', () => {
  assert.equal(getLegacyCommentKey('/spdtf-2/property-pack/pdtf-1-lineage'), '/v2/comparison');
  assert.equal(getLegacyCommentKey(`${PDTF1_ROUTES.modelViews}/logical/property`), '/model/logical/property');
  assert.equal(getLegacyCommentKey(PDTF1_ROUTES.schemaVerification), '/mapping');
  assert.equal(getLegacyCommentKey('/pdtf/Property'), '/pdtf/Property');
  const comments = readFileSync(new URL('../src/components/Comments.astro', import.meta.url), 'utf8');
  assert.match(comments, /getLegacyCommentKey/u);
  assert.doesNotMatch(comments, /getPropertyPackLegacyCommentKey/u);
});

test('preservation capture reads manifest-retained pages from the frozen pre-migration cut', () => {
  const capture = readFileSync(new URL('../scripts/capture-ia-route-baseline.mjs', import.meta.url), 'utf8');
  assert.match(capture, /args\.get\('--source-root'\)/u);
  assert.match(capture, /verifyPdtf1SourceRootCommit\(sourceRoot\)/u);
  assert.match(capture, /manifestRetainedSourceRecordMatches\(sourceRecord, priorRecord\)/u);
  assert.match(capture, /readFileSync\(sourcePath, 'utf8'\)/u);
  assert.doesNotMatch(
    capture,
    /const beforeHtml = manifestRetained \? readFileSync\(acceptedPath/u,
    'current accepted pages must never masquerade as frozen pre-migration evidence',
  );
});

test('a final migration receipt cannot excuse drift in the frozen source cut', () => {
  const prior = loadPriorIaRouteManifest(projectRoot).manifest.routes
    .find(({ route }) => route === '/ontology/bake-off');
  const source = [...sourceManifest.routes, ...sourceManifest.addedRoutes]
    .find(({ acceptedRoute }) => acceptedRoute === '/ontology/bake-off');
  assert.equal(manifestRetainedBaselineProjectionMatches(source, prior), true);
  assert.equal(manifestRetainedSourceRecordMatches(source, prior), true);

  const forged = structuredClone(source);
  forged.acceptedContentSha256 = '1'.repeat(64);
  forged.pdtf1SourceRetentionReceipt = { policy: 'forged-final-receipt' };
  assert.equal(manifestRetainedBaselineProjectionMatches(forged, prior), true);
  assert.equal(manifestRetainedSourceRecordMatches(forged, prior), false);
});
