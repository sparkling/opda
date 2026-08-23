import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  SEMANTIC_MODELLING_FROZEN_RECEIPT_FIELDS,
  SEMANTIC_MODELLING_ROUTE_MIGRATION,
  composeSemanticModellingMigrationReceipt,
  validateSemanticModellingManifest,
} from '../scripts/lib/semantic-modelling-route-contract.mjs';
import {
  SEMANTIC_MODELLING_SOURCE_ROUTE_MANIFEST,
  loadSemanticModellingSourceRouteManifest,
} from '../scripts/lib/ia-prior-manifest-contract.mjs';
import {
  getAcceptedRoute,
  getDeclaredRouteReplacement,
  getLegacyCommentKey,
  getSemanticModellingReplacementRoute,
} from '../src/lib/site-route-migrations.mjs';
import { getActiveDestination, getRouteDisposition, getRouteStatus } from '../src/lib/site-ia.mjs';

const root = new URL('..', import.meta.url).pathname.replace(/\/$/u, '');
const manifest = JSON.parse(readFileSync(
  new URL('../src/data/ia-route-baseline.json', import.meta.url), 'utf8',
));
const source = loadSemanticModellingSourceRouteManifest(root).manifest;

test('semantic modelling has one clean canonical route family', () => {
  assert.deepEqual(SEMANTIC_MODELLING_ROUTE_MIGRATION, {
    sourceRoot: '/spdtf/ontologies', targetRoot: '/semantic-modelling', redirects: false,
  });
  assert.equal(getSemanticModellingReplacementRoute('/spdtf/ontologies'), '/semantic-modelling');
  assert.equal(getSemanticModellingReplacementRoute('/spdtf/ontologies/standards?view=all'), '/semantic-modelling/standards');
  assert.equal(getSemanticModellingReplacementRoute('/spdtf/property-pack'), null);
  assert.equal(getAcceptedRoute('/spdtf-2/ontologies/standards'), '/semantic-modelling/standards');
  assert.equal(getDeclaredRouteReplacement('/semantic-modelling/standards'), null);
  assert.equal(getLegacyCommentKey('/semantic-modelling/standards'), '/spdtf-2/ontologies/standards');
  for (const retired of ['/spdtf/ontologies', '/spdtf-2/ontologies/standards']) {
    assert.equal(getActiveDestination(retired), null);
    assert.equal(getRouteDisposition(retired), null);
    assert.equal(getRouteStatus(retired), null);
  }
});

test('the schema-v10 receipt proves the exact v9 semantic route move', () => {
  assert.equal(manifest.schemaVersion, 10);
  const actual = composeSemanticModellingMigrationReceipt({
    records: manifest.routes,
    addedRecords: manifest.addedRoutes,
    sourceManifest: source,
  });
  assert.deepEqual(manifest.semanticModellingMigration, actual);
  assert.deepEqual({
    moved: actual.movedRouteCount,
    movedBaseline: actual.movedBaselineRouteCount,
    movedAdded: actual.movedAddedRouteCount,
    exactInformation: actual.exactInformationRouteCount,
    reframedInformation: actual.informationReframeRouteCount,
    redirects: actual.redirects,
  }, {
    moved: 11, movedBaseline: 0, movedAdded: 11,
    exactInformation: 11, reframedInformation: 0, redirects: false,
  });
  assert.equal(actual.sourceRoutesSha256, '7413198cc3705b90f8a1fbb69453aeb8d642389ac6439cf288b556383b2f87ac');
  assert.equal(actual.targetRoutesSha256, 'fad48efeef1460c2d3179a4d2f98be60a70bb3a2e2e635e7d19c148dbde39576');
  assert.equal(actual.sourceFilesSha256, '991fc8b124b2590e1c1f7d7b7b4f4a0414f7d4a4c91be6da1b107c063b8186af');
  assert.equal(actual.targetFilesSha256, 'cbad9d77f3693475067a6ebf73342a5dcf2eb9e256541d0e01d453735eb7d262');
  assert.equal(actual.movedRoutePairsSha256, 'a9c72d4a62bafe86c6d04eb70715fea7f1177ee2b9729cbc61fb3f3b55d9e711');
  assert.equal(actual.sourceNavigationFragmentCount, 528);
  assert.equal(actual.sourceNavigationFragmentIdCount, 48);
  assert.equal(actual.retainedAuthoredFragmentCount, 209);
  assert.equal(actual.retainedAuthoredFragmentIdCount, 105);
  assert.equal(actual.addedNavigationFragmentCount, 22);
  assert.equal(actual.addedNavigationFragmentIdCount, 2);
});

test('the new cut freezes every prior migration receipt byte-for-byte', () => {
  assert.equal(SEMANTIC_MODELLING_SOURCE_ROUTE_MANIFEST.schemaVersion, 9);
  for (const field of SEMANTIC_MODELLING_FROZEN_RECEIPT_FIELDS) {
    assert.deepEqual(manifest[field], source[field], `${field} must remain the schema-v9 receipt`);
  }
  assert.doesNotThrow(() => validateSemanticModellingManifest(
    root, manifest, manifest.routes, manifest.addedRoutes,
  ));
});

test('the receipt fails closed when an old URL or authored fragment is retained incorrectly', () => {
  const records = structuredClone(manifest.routes);
  const additions = structuredClone(manifest.addedRoutes);
  const target = additions.find(({ acceptedRoute }) => acceptedRoute === '/semantic-modelling/standards');
  target.acceptedRoute = '/spdtf/ontologies/standards';
  assert.throws(() => composeSemanticModellingMigrationReceipt({
    records, addedRecords: additions, sourceManifest: source,
  }), /missing, duplicated, or retained/u);
});
