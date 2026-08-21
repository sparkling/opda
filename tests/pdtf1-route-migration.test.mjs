import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PDTF1_ROUTE_MIGRATION,
  PDTF1_ROUTES,
  getPdtf1LegacyCommentKey,
  getPdtf1ReplacementRoute,
} from '../src/lib/pdtf1-routes.mjs';

test('PDTF 1.0 documentation routes move beneath their full reader hierarchy', () => {
  assert.deepEqual(PDTF1_ROUTE_MIGRATION, {
    canonicalRoot: '/pdtf-1',
    retiredRoots: ['/schema', '/implementation', '/adoption', '/model', '/ontology', '/mapping', '/manual'],
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
