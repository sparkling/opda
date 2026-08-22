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
import { composeSchemaToSchemeRouteReceipt } from '../scripts/lib/schema-to-scheme-route-contract.mjs';
import { composePdtfSchemaFragmentMigrationReceipt } from '../scripts/lib/pdtf-schema-fragment-migration.mjs';
import {
  SCHEMA_TO_SCHEME_SOURCE_ROUTE_MANIFEST,
  loadPdtf1SourceRouteManifest,
  loadPriorIaRouteManifest,
  loadSchemaToSchemeSourceRouteManifest,
  manifestRetainedBaselineProjectionMatches,
  manifestRetainedSourceRecordMatches,
} from '../scripts/lib/ia-prior-manifest-contract.mjs';
import {
  PDTF1_ROUTE_MIGRATION,
  PDTF1_ROUTES,
  PDTF_SCHEMA_FRAGMENT_REPLACEMENTS,
  fragmentsPreservedByPdtfSchemaMigration,
  getPdtf1LegacyCommentKey,
  getPdtf1ReplacementRoute,
  getPdtfSchemaFragmentReplacement,
  isRetiredPdtf1DocumentationRoute,
  isRetiredPdtf1ManualAlias,
  isStablePdtfIdentifierRoute,
} from '../src/lib/pdtf1-routes.mjs';
import {
  getAcceptedRoute,
  getAcceptedRouteFile,
  getDeclaredRouteReplacement,
  getLegacyCommentKey,
} from '../src/lib/site-route-migrations.mjs';
const projectRoot = new URL('..', import.meta.url).pathname;
const { manifest: sourceManifest } = loadPdtf1SourceRouteManifest(projectRoot);
const {
  manifest: schemaToSchemeSource,
  supplementalRoutes: schemaToSchemeSourceAdditions,
} = loadSchemaToSchemeSourceRouteManifest(projectRoot);

test('PDTF schema documentation routes move beneath their full reader hierarchy', () => {
  assert.deepEqual(PDTF1_ROUTE_MIGRATION, {
    canonicalRoot: '/pdtf-schema',
    intermediateRoot: '/pdtf-1',
    retiredRoots: ['/schema', '/implementation', '/adoption', '/model', '/ontology', '/mapping', '/manual'],
    sourceRouteCount: 3500,
    movedCanonicalRouteCount: 1264,
    movedBaselineRouteCount: 1255,
    movedAddedRouteCount: 9,
    movedFamilyRouteCounts: {
      adoption: 6,
      implementation: 6,
      mapping: 163,
      model: 227,
      modelling: 10,
      ontology: 746,
      'pdtf-1': 2,
      schema: 104,
    },
    retiredAliasRouteCount: 227,
    stableIdentifierRouteCount: 1090,
    generatedToolRouteCount: 652,
    ontologyArtefactHtmlRouteCount: 1,
    canonicalFamilyRouteCount: 1264,
    sourceReframeRouteCount: 47,
    sourceReframeTotalBlockCount: 6251,
    sourceReframeExactBlockCount: 6132,
    sourceReframeSemanticBlockCount: 119,
    sourceReframeNonInformationBlockCount: 0,
    sourceReframeRoutesSha256: '021f6ab746f1210bea1819266d7102a1a1e63707fb9609416a202a2228116a5c',
    outOfScopeSourceRouteCount: 919,
    outOfScopeSourceRoutesSha256: 'e9c7cfdbabac6c676e0560925d70b627af7d0a50e2d23f18957e1345187cd49c',
    redirects: false,
    stableIdentifierRoot: '/pdtf',
  });
  for (const [before, after, commentKey = before] of [
    ['/pdtf-1', PDTF1_ROUTES.root],
    ['/pdtf-1/original-standard/data-dictionary', `${PDTF1_ROUTES.original}/data-dictionary`, '/modelling/data-dictionary'],
    ['/pdtf-1/extracted-ontology/use-and-tooling', PDTF1_ROUTES.use],
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
    assert.equal(getPdtf1LegacyCommentKey(after), commentKey);
  }
  assert.equal(generatedFamily(`${PDTF1_ROUTES.use}/tools/widoco/index.html`), 'ontology/tools');
  assert.equal(getPdtf1ReplacementRoute(PDTF1_ROUTES.root), null);
});

test('renamed PDTF schema fragments have one explicit canonical replacement', () => {
  const expected = new Map([
    ['-current-scheme-definitive--2026-06-02', '-current-identifier-scheme-definitive--amended-2026-08-22'],
    ['dbt-smart-data-top-level-section--track-the-guidebook-and-the-pdtf-overlap-it-creates', 'dbt-smart-data-implications-for-spdtf-and-pdtf-schema-lineage'],
    ['domain-led-bounded-context-working-groups-for-the-next-modelling-phase', 'domain-led-bounded-context-working-groups-for-spdtf-development'],
    ['legacy', 'identifiers'],
    ['linked-data-model-as-the-foundation-and-direction-of-pdtf-standards-development', 'linked-data-model-as-the-foundation-and-direction-of-spdtf-development'],
    ['organise-the-site-around-spdtf-20-and-pdtf-10', 'organise-the-site-around-spdtf-and-the-pdtf-schema'],
    ['continuation', 'progression'],
    ['pdtf-10-to-property-pack-crosswalk', 'pdtf-schema-to-property-pack-crosswalk'],
    ['treat-the-property-pack-ontology-as-an-accelerated-spdtf-20-component', 'treat-the-property-pack-ontology-as-an-accelerated-spdtf-component'],
    ['use-the-standard', 'use-the-schema'],
    ['section-nav-group-governance-modelling-adr', 'section-nav-governance-modelling-adr'],
    ['section-nav-group-governance-modelling-odr', 'section-nav-governance-modelling-odr'],
    ['section-nav-group-pdtf-1-adoption', 'section-nav-group-pdtf-schema-usage'],
    ['section-nav-group-pdtf-1-implementation', 'section-nav-group-pdtf-schema-implementation'],
    ['section-nav-group-pdtf-1-mapping', 'section-nav-group-pdtf-schema-mapping'],
    ['section-nav-group-pdtf-1-model', 'section-nav-group-pdtf-schema-model'],
    ['section-nav-group-pdtf-1-modelling', 'section-nav-group-pdtf-schema-modelling'],
    ['section-nav-group-pdtf-1-ontology', 'section-nav-group-pdtf-schema-schema-derived-ontology'],
    ['section-nav-group-pdtf-1-pdtf-1-original-standard', 'section-nav-group-pdtf-schema-schema-and-supporting-material'],
    ['section-nav-group-pdtf-1-schema', 'section-nav-group-pdtf-schema-schema'],
    ['section-nav-ontology-concepts-and-architecture', 'section-nav-pdtf-schema-schema-derived-ontology-concepts-and-architecture'],
    ['section-nav-ontology-lineage-and-verification', 'section-nav-pdtf-schema-schema-derived-ontology-lineage-provenance-and-verification'],
    ['section-nav-ontology-terms-and-model-resources', 'section-nav-pdtf-schema-schema-derived-ontology-terms-and-model-resources'],
    ['section-nav-ontology-trust-and-governance', 'section-nav-pdtf-schema-schema-derived-ontology-trust-governance-and-limitations'],
    ['section-nav-ontology-use-and-tooling', 'section-nav-pdtf-schema-schema-derived-ontology-use-and-tooling'],
    ['section-nav-ontology-validation-and-examples', 'section-nav-pdtf-schema-schema-derived-ontology-validation-and-examples'],
    ...['concept', 'logical', 'physical-database', 'physical-ontology', 'physical-relational']
      .map((suffix) => [`section-nav-model-${suffix}`,
        `section-nav-pdtf-schema-schema-derived-ontology-model-views-by-audience-${suffix}`]),
    ...['built-form', 'built-form-fixtures', 'built-form-surveys', 'encumbrances', 'evidence',
      'legal-estate', 'legal-estate-ownership', 'legal-estate-ownership-leasehold',
      'legal-estate-ownership-leasehold-lease-charges', 'legal-estate-ownership-leasehold-lease-legal',
      'legal-estate-ownership-leasehold-lease-misc', 'legal-estate-ownership-managed',
      'legal-estate-title', 'legal-estate-title-oc-summary', 'local-context', 'local-context-con29r',
      'local-context-con29r-searches', 'local-context-environmental']
      .map((suffix) => [`section-nav-schema-${suffix}`,
        `section-nav-pdtf-schema-schema-and-supporting-material-schema-${suffix}`]),
    ...['section-nav-group-spdtf-2-spdtf-2', 'section-nav-group-spdtf-2-spdtf-2-ontologies',
      'section-nav-group-spdtf-2-spdtf-2-property-pack',
      'section-nav-spdtf-2-ontologies-modelling-method', 'section-nav-spdtf-2-ontologies-why-ontologies',
      'section-nav-spdtf-2-property-pack-contexts', 'section-nav-spdtf-2-property-pack-coverage',
      'section-nav-spdtf-2-property-pack-model', 'section-nav-group-working-groups-spdtf-2-working-groups',
      ...['conveyancing', 'dbt-smart-data', 'estate-agency', 'finance-and-banking', 'interoperability',
        'property-data-services', 'property-technology', 'surveying-and-valuation']
        .map((suffix) => `section-nav-spdtf-2-working-groups-${suffix}`)]
      .map((source) => [source, source.replaceAll('spdtf-2', 'spdtf')]),
  ]);

  assert.deepEqual(new Map(PDTF_SCHEMA_FRAGMENT_REPLACEMENTS), expected);
  assert.equal(new Set(expected.values()).size, expected.size);
  assert.ok([...expected.values()].every((fragment) => !fragment.includes('pdtf-1')));
  for (const [source, accepted] of expected) {
    assert.equal(getPdtfSchemaFragmentReplacement(source), accepted);
    assert.equal(fragmentsPreservedByPdtfSchemaMigration([source], [accepted]), true);
    assert.equal(fragmentsPreservedByPdtfSchemaMigration([source], []), false);
  }
  assert.equal(getPdtfSchemaFragmentReplacement('unrelated-fragment'), null);
  assert.equal(fragmentsPreservedByPdtfSchemaMigration(
    ['unchanged-fragment'], ['unchanged-fragment'],
  ), true);

  const sourceFragments = [...expected.keys()];
  const acceptedFragments = [...expected.values()];
  const receipt = composePdtfSchemaFragmentMigrationReceipt({
    records: [{
      baselineRoute: '/old', acceptedRoute: '/pdtf-schema',
      baselineFragments: sourceFragments, acceptedFragments,
    }],
    addedRecords: [],
    sourceRecords: [{ acceptedRoute: '/source', acceptedFragments: sourceFragments }],
    sourceTargetRoute: () => '/pdtf-schema',
  });
  assert.deepEqual({
    policy: receipt.policy,
    mappings: receipt.mappingCount,
    baselineRoutes: receipt.baselineRouteCount,
    sourceRoutes: receipt.sourceRouteCount,
    baselineOccurrences: receipt.baselineMigratedFragmentCount,
    sourceOccurrences: receipt.sourceMigratedFragmentCount,
  }, {
    policy: 'explicit-schema-to-scheme-fragment-replacement-v1',
    mappings: 66,
    baselineRoutes: 1,
    sourceRoutes: 1,
    baselineOccurrences: 66,
    sourceOccurrences: 66,
  });
  assert.throws(() => composePdtfSchemaFragmentMigrationReceipt({
    records: [{
      baselineRoute: '/old', acceptedRoute: '/pdtf-schema',
      baselineFragments: ['undeclared'], acceptedFragments: [],
    }],
    addedRecords: [], sourceRecords: [], sourceTargetRoute: () => null,
  }), /no declared replacement/u);
});

test('the frozen intermediate route cut composes into schema-to-scheme routes', () => {
  const projected = [
    ...schemaToSchemeSource.routes,
    ...schemaToSchemeSource.addedRoutes,
    ...schemaToSchemeSourceAdditions,
  ]
    .map((record) => {
      const acceptedRoute = getDeclaredRouteReplacement(record.acceptedRoute) ?? record.acceptedRoute;
      return {
        ...record,
        acceptedRoute,
        acceptedFile: getAcceptedRouteFile(record.acceptedRoute, record.acceptedFile),
      };
    });
  const receipt = composeSchemaToSchemeRouteReceipt({
    records: projected,
    addedRecords: [],
    sourceManifest: schemaToSchemeSource,
    sourceAdditions: schemaToSchemeSourceAdditions,
    sourceContract: SCHEMA_TO_SCHEME_SOURCE_ROUTE_MANIFEST,
    replacementRoute: getDeclaredRouteReplacement,
  });

  assert.deepEqual(receipt, {
    policy: 'schema-to-scheme-route-composition-v1',
    sourceCommit: '3a52e644c57d2b4eed33d78e3a10810cc7a29171',
    sourcePath: 'src/data/ia-route-baseline.json',
    sourceBlob: 'c114dcc4d91706d122492e5bb57fa01cab5c74c6',
    sourceSha256: 'fa51038160b4921916aa22d365e420e9e641613509f3cf052c96d34f6316dee2',
    sourceSupplementalRoutesSha256: '9ad56c09d1057762cd959b64c9ca614dad3b949a1ec96a2edd3143ee59241ab1',
    sourceManifestRouteCount: 3274,
    sourceSupplementalRouteCount: 6,
    sourceRouteCount: 3280,
    movedRouteCount: 2011,
    pdtfSchemaRouteCount: 1264,
    spdtfRouteCount: 747,
    propertyPackRouteCount: 693,
    pdtfIdentifierRouteCount: 1090,
    retainedRouteCount: 1269,
    postSourceAdditionRouteCount: 0,
    acceptedSiteRouteCount: 3280,
    routePairsSha256: '76f64dd380bd1d044a74d17c40ad4651dfda63857bda1b8fdd1820fc874bd93a',
    pdtfIdentifierRoutesSha256: 'cf2e83c5290fe5b5b2fe2f5b25e31d2d8f53d8be90cd533e5e43de8ff30a88be',
    postSourceAdditionRoutesSha256: sha256(''),
    redirects: false,
  });
  assert.ok(projected.every(({ acceptedRoute }) => (
    acceptedRoute !== '/pdtf-1' && !acceptedRoute.startsWith('/pdtf-1/')
      && acceptedRoute !== '/spdtf-2' && !acceptedRoute.startsWith('/spdtf-2/')
  )));
  assert.ok(schemaToSchemeSource.routes
    .filter(({ acceptedRoute }) => isStablePdtfIdentifierRoute(acceptedRoute))
    .every(({ acceptedRoute }) => projected.some((record) => record.acceptedRoute === acceptedRoute)));
  assert.throws(() => composeSchemaToSchemeRouteReceipt({
    records: projected,
    addedRecords: [],
    sourceManifest: schemaToSchemeSource,
    sourceAdditions: schemaToSchemeSourceAdditions,
    sourceContract: SCHEMA_TO_SCHEME_SOURCE_ROUTE_MANIFEST,
    replacementRoute: (route) => route === '/pdtf/LeaseTerm'
      ? '/pdtf/leaseTerm' : getDeclaredRouteReplacement(route),
  }), /stable PDTF identifier route moved/u);
  const arbitrary = structuredClone(projected);
  const unrelated = arbitrary.find(({ acceptedRoute }) => acceptedRoute === '/design-system');
  unrelated.acceptedRoute = '/arbitrary-undocumented-move';
  unrelated.acceptedFile = 'anything/random.html';
  assert.throws(() => composeSchemaToSchemeRouteReceipt({ records: arbitrary, addedRecords: [],
    sourceManifest: schemaToSchemeSource, sourceAdditions: schemaToSchemeSourceAdditions,
    sourceContract: SCHEMA_TO_SCHEME_SOURCE_ROUTE_MANIFEST,
    replacementRoute: (route) => route === '/design-system'
      ? unrelated.acceptedRoute : getDeclaredRouteReplacement(route) }), /undeclared disposition/u);
});

test('PDTF term IRIs and governance-owned decisions are not compatibility routes', () => {
  for (const route of [
    '/pdtf/Property', '/pdtf/Property.ttl', '/pdtf/LeaseTerm', '/pdtf/leaseTerm',
    '/modelling/adr/adr-0075', '/modelling/odr/odr-0035',
    '/api/v2/sso/exchange', '/schemas/v2/example',
  ]) {
    assert.equal(getPdtf1ReplacementRoute(route), null, route);
    assert.equal(getDeclaredRouteReplacement(route), null, route);
  }
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
  assert.equal(moved.length, 1264);
  assert.equal(moved.filter((record) => baselineSet.has(record)).length, 1255);
  assert.equal(moved.filter((record) => !baselineSet.has(record)).length, 9);
  assert.equal(manual.length, 227);
  assert.equal(stable.length, 1090);
  assert.ok(manual.every((record) => record.equivalenceReceipt.acceptedBlocks === 0
    && record.acceptedFragmentCount === 0 && record.acceptedFragments.length === 0));
  assert.ok(stable.every(({ acceptedRoute }) => (
    getPdtf1ReplacementRoute(acceptedRoute) === null
      && getDeclaredRouteReplacement(acceptedRoute) === null
  )));
  const targets = moved.map(({ acceptedRoute }) => getPdtf1ReplacementRoute(acceptedRoute));
  assert.equal(new Set(targets).size, 1264);
  assert.ok(targets.every((route) => (
    route === '/pdtf-schema' || route.startsWith('/pdtf-schema/')
  )));
  const intermediateCommentKeys = new Map([
    ['/ontology/concepts-and-architecture', '/pdtf-1/extracted-ontology/concepts-and-architecture'],
    ['/ontology/contexts', '/pdtf-1/extracted-ontology/concepts-and-architecture/contexts'],
    ['/ontology/lineage-and-verification', '/pdtf-1/extracted-ontology/lineage-provenance-and-verification'],
    ['/ontology/terms-and-model-resources', '/pdtf-1/extracted-ontology/terms-and-model-resources'],
    ['/ontology/trust-and-governance', '/pdtf-1/extracted-ontology/trust-governance-and-limitations'],
    ['/ontology/use-and-tooling', '/pdtf-1/extracted-ontology/use-and-tooling'],
    ['/ontology/validation-and-examples', '/pdtf-1/extracted-ontology/validation-and-examples'],
  ]);
  assert.ok(moved.every(({ acceptedRoute }) => (
    getPdtf1LegacyCommentKey(getPdtf1ReplacementRoute(acceptedRoute))
      === (intermediateCommentKeys.get(acceptedRoute) ?? acceptedRoute)
  )));
  assert.equal(isRetiredPdtf1DocumentationRoute('/ontology/classes'), true);
  assert.equal(isRetiredPdtf1DocumentationRoute('/manual/logical/property'), true);
  assert.equal(isRetiredPdtf1DocumentationRoute('/pdtf/Property'), false);
  assert.equal(isRetiredPdtf1DocumentationRoute('/modelling/adr/adr-0075'), false);
});

test('the complete PDTF migration receipt is bijective and preserves information and fragments', () => {
  const project = (record) => {
    const sourceRoute = record.acceptedRoute;
    const acceptedRoute = getAcceptedRoute(sourceRoute);
    return {
      ...record,
      acceptedRoute,
      acceptedFile: acceptedRoute !== sourceRoute
        ? getAcceptedRouteFile(sourceRoute, record.acceptedFile) : record.acceptedFile,
    };
  };
  const records = sourceManifest.routes
    .filter(({ acceptedRoute }) => !isRetiredPdtf1ManualAlias(acceptedRoute))
    .map(project);
  const addedRecords = sourceManifest.addedRoutes.map(project);
  const retiredAliases = composePdtf1RetiredAliases(sourceManifest, getPdtf1ReplacementRoute);
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
    replacementRoute: getPdtf1ReplacementRoute,
    sourceManifest,
  });
  assert.deepEqual(receipt, {
    policy: 'scoped-pdtf-schema-move-with-retired-aliases-v2',
    sourceRouteCount: 3500,
    movedCanonicalRouteCount: 1264,
    movedBaselineRouteCount: 1255,
    movedAddedRouteCount: 9,
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
    outOfScopeSourceRouteCount: 919,
    outOfScopeSourceRoutesSha256: 'e9c7cfdbabac6c676e0560925d70b627af7d0a50e2d23f18957e1345187cd49c',
    movedRoutePairsSha256: 'adaa5ec24650f79b650b4c0f748ec9e7b9bde1e295d32e95785f8e1dd810f82b',
    retiredAliasesSha256: '35894b714f3562508cd1b4dcaf09c2505efa9956473cf1f343d08c5a450403fa',
    stableIdentifierRoutesSha256: 'cf2e83c5290fe5b5b2fe2f5b25e31d2d8f53d8be90cd533e5e43de8ff30a88be',
    redirects: false,
    canonicalRoot: '/pdtf-schema',
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
    replacementRoute: getPdtf1ReplacementRoute, sourceManifest,
  }), /information or fragments changed/u);

  const sourceBakeOff = [...sourceManifest.routes, ...sourceManifest.addedRoutes]
    .find(({ acceptedRoute }) => acceptedRoute === '/ontology/bake-off');
  const forgedExact = structuredClone(records);
  const forgedTarget = forgedExact.find(({ acceptedRoute }) => (
    acceptedRoute === getPdtf1ReplacementRoute(sourceBakeOff.acceptedRoute)
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
    replacementRoute: getPdtf1ReplacementRoute, sourceManifest,
  }), /information or fragments changed/u);

  const forgedStable = structuredClone(records);
  const stableTarget = forgedStable.find(({ acceptedRoute }) => acceptedRoute === '/pdtf/Property');
  stableTarget.pdtf1SourceRetentionReceipt = { policy: 'forged' };
  assert.throws(() => pdtf1MigrationReceipt({
    records: forgedStable, addedRecords, retiredAliases, migration: exactMigration,
    replacementRoute: getPdtf1ReplacementRoute, sourceManifest,
  }), /information or fragments changed/u);
  assert.throws(() => pdtf1MigrationReceipt({
    records, addedRecords, retiredAliases: retiredAliases.slice(1), migration: exactMigration,
    replacementRoute: getPdtf1ReplacementRoute, sourceManifest,
  }), /retired alias contract/u);
});

test('composed comment identities retain Property Pack and PDTF threads', () => {
  assert.equal(getLegacyCommentKey('/spdtf/property-pack/pdtf-schema-lineage'), '/v2/comparison');
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
