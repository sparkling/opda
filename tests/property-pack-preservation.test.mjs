import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  propertyPackMigrationReceipt,
} from '../scripts/lib/ia-preservation-contract.mjs';
import {
  PRIOR_IA_ROUTE_MANIFEST,
  validatePriorFamilyReceipt,
  validatePriorManifestReceipt,
} from '../scripts/lib/ia-prior-manifest-contract.mjs';
import {
  PROPERTY_PACK_ROUTE_MIGRATION,
  getPropertyPackReplacementRoute,
} from '../src/lib/property-pack-routes.mjs';

const routeBaseline = JSON.parse(readFileSync(
  new URL('../src/data/ia-route-baseline.json', import.meta.url), 'utf8',
));
const preservationBaseline = JSON.parse(readFileSync(
  new URL('../src/data/ia-preservation-baseline.json', import.meta.url), 'utf8',
));

test('Property Pack migration is an explicit bijection from the retired route family', () => {
  const mapped = routeBaseline.routes.filter(({ baselineRoute }) => (
    baselineRoute === '/v2' || baselineRoute.startsWith('/v2/')
      || baselineRoute === '/modelling/property-pack'
  ));
  assert.equal(mapped.length, 691);
  assert.ok(mapped.every(({ baselineRoute, acceptedRoute, acceptedFile }) => (
    acceptedRoute === getPropertyPackReplacementRoute(baselineRoute)
      && acceptedFile === `${acceptedRoute.slice(1)}/index.html`
  )));
  assert.equal(new Set(mapped.map(({ acceptedRoute }) => acceptedRoute)).size, 691);
  assert.equal(new Set(mapped.map(({ acceptedFile }) => acceptedFile)).size, 691);
  assert.equal(mapped.find(({ baselineRoute }) => baselineRoute === '/v2/comparison').acceptedRoute,
    '/spdtf-2/property-pack/pdtf-1-lineage');
  assert.equal(mapped.find(({ baselineRoute }) => baselineRoute === '/modelling/property-pack').acceptedRoute,
    '/spdtf-2/property-pack/definition-and-scope');
});

test('Property Pack migration publishes one canonical 690 + 1 + 2 family', () => {
  const acceptedRoutes = new Set([
    ...routeBaseline.routes.map(({ acceptedRoute }) => acceptedRoute),
    ...routeBaseline.addedRoutes.map(({ acceptedRoute }) => acceptedRoute),
  ]);
  assert.ok([...acceptedRoutes].every((route) => route !== '/v2' && !route.startsWith('/v2/')));
  assert.ok(!acceptedRoutes.has('/modelling/property-pack'));
  assert.deepEqual(routeBaseline.propertyPackMigration, {
    policy: 'canonical-move-without-redirects-v1',
    baselineTechnicalRouteCount: 690,
    baselineCatalogueRouteCount: 1,
    canonicalContentRouteCount: 691,
    lifecyclePageCount: 2,
    acceptedFamilyRouteCount: 693,
    redirects: false,
    retiredRoutes: ['/v2/**', '/modelling/property-pack'],
    canonicalRoot: '/spdtf-2/property-pack',
    lifecycleRoutes: [
      '/spdtf-2/property-pack/review-and-releases',
      '/spdtf-2/property-pack/technical-working-group-determination',
    ],
  });

  const family = preservationBaseline.families.find(({ id }) => id === 'property-pack-canonical');
  assert.deepEqual({
    baseline: family.baseline.count,
    accepted: family.accepted.count,
    technicalMapped: family.technicalMappedRouteCount,
    canonicalContent: family.canonicalContentRouteCount,
    lifecycle: family.lifecyclePageCount,
    baselinePath: family.baselinePath,
    acceptedPath: family.acceptedPath,
  }, {
    baseline: 690,
    accepted: 693,
    technicalMapped: 690,
    canonicalContent: 691,
    lifecycle: 2,
    baselinePath: 'dist/v2',
    acceptedPath: 'dist/spdtf-2/property-pack',
  });
});

test('schema-v6 receipts compose the complete prior IA evidence without shrinking it', () => {
  const manifestRetained = routeBaseline.routes.filter(({ baselineEvidence }) => baselineEvidence);
  const byteEvidence = manifestRetained.filter(({ baselineEvidence }) => (
    baselineEvidence.policy === 'prior-schema-v5-byte-identity-v1'
  ));
  const informationEvidence = manifestRetained.filter(({ baselineEvidence }) => (
    baselineEvidence.policy === 'prior-schema-v5-information-identity-v1'
  ));
  assert.equal(manifestRetained.length, 658);
  assert.equal(byteEvidence.length, 651);
  assert.equal(informationEvidence.length, 7);
  assert.deepEqual(informationEvidence.map(({ baselineRoute }) => baselineRoute).sort(), [
    '/ontology/bake-off', '/ontology/classes', '/ontology/exemplars', '/ontology/profiles',
    '/ontology/properties', '/ontology/shapes', '/ontology/vocabularies',
  ]);
  assert.doesNotThrow(() => validatePriorManifestReceipt(
    routeBaseline.priorManifestReceipt, manifestRetained,
  ));
  assert.throws(() => validatePriorManifestReceipt({
    ...routeBaseline.priorManifestReceipt,
    manifestRetainedRouteCount: 650,
  }, manifestRetained), /composition receipt/u);
  const changedEvidence = structuredClone(manifestRetained);
  changedEvidence[0].baselineEvidence.sourceRecordSha256 = '0'.repeat(64);
  assert.throws(() => validatePriorManifestReceipt(
    routeBaseline.priorManifestReceipt, changedEvidence,
  ), /composition receipt/u);
  assert.throws(() => validatePriorManifestReceipt({
    ...routeBaseline.priorManifestReceipt,
    blob: '0'.repeat(40),
  }, manifestRetained), /invalid blob/u);
  assert.equal(routeBaseline.priorManifestReceipt.missingPhysicalRecordsSha256,
    PRIOR_IA_ROUTE_MANIFEST.missingPhysicalRecordsSha256);

  assert.equal(preservationBaseline.families.length, 8);
  assert.doesNotThrow(() => validatePriorFamilyReceipt(
    preservationBaseline.priorManifestReceipt, preservationBaseline.families,
  ));
  assert.throws(() => validatePriorFamilyReceipt({
    ...preservationBaseline.priorManifestReceipt,
    retainedFamiliesSha256: '0'.repeat(64),
  }, preservationBaseline.families), /family composition receipt is invalid/u);
});

test('Property Pack migration rejects malformed and non-bijective mappings', () => {
  const records = structuredClone(routeBaseline.routes);
  const addedRoutes = structuredClone(routeBaseline.addedRoutes);
  const originalReplacement = getPropertyPackReplacementRoute;
  assert.throws(() => propertyPackMigrationReceipt(
    records, addedRoutes, PROPERTY_PACK_ROUTE_MIGRATION,
    (route) => route === '/v2/comparison'
      ? '/spdtf-2/property-pack/comparison'
      : originalReplacement(route),
  ), /undeclared route move/u);
  const duplicateRecords = structuredClone(records);
  const comparison = duplicateRecords.find(({ baselineRoute }) => baselineRoute === '/v2/comparison');
  comparison.acceptedRoute = originalReplacement('/v2');
  comparison.acceptedFile = 'spdtf-2/property-pack/index.html';
  assert.throws(() => propertyPackMigrationReceipt(
    duplicateRecords, addedRoutes, PROPERTY_PACK_ROUTE_MIGRATION,
    (route) => route === '/v2/comparison'
      ? originalReplacement('/v2')
      : originalReplacement(route),
  ), /routes and files must be unique/u);
});
