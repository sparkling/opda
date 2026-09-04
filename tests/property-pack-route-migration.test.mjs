import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { propertyPackLifecycleStatus } from '../src/lib/property-pack-model.mjs';
import {
  PROPERTY_PACK_ROUTE_MIGRATION,
  getPropertyPackLegacyCommentKey,
  getPropertyPackReplacementRoute,
} from '../src/lib/property-pack-routes.mjs';
import { getActiveDestination, getRouteDisposition } from '../src/lib/site-ia.mjs';
import { getNavigationSection } from '../src/lib/site-navigation.ts';
import { searchEntries } from '../src/lib/site-search.mjs';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

test('Property Pack routes move once without redirects and preserve comment identities', () => {
  assert.deepEqual(PROPERTY_PACK_ROUTE_MIGRATION, {
    canonicalRoot: '/development/property-pack',
    intermediateRoot: '/spdtf-2/property-pack',
    retiredRoots: ['/v2', '/modelling/property-pack', '/spdtf-2/property-pack'],
    technicalRouteCount: 690,
    movedCatalogueRouteCount: 1,
    lifecycleAdditionCount: 2,
    redirects: false,
  });
  for (const [before, after, commentKey] of [
    ['/spdtf-2/property-pack', '/development/property-pack', '/v2'],
    ['/spdtf-2/property-pack/pdtf-1-lineage', '/development/property-pack/pdtf-schema-lineage', '/v2/comparison'],
    ['/spdtf-2/property-pack/contexts/estate-agency', '/development/property-pack/contexts/estate-agency', '/v2/contexts/estate-agency'],
    ['/v2', '/development/property-pack', '/v2'],
    ['/v2/comparison', '/development/property-pack/pdtf-schema-lineage', '/v2/comparison'],
    ['/v2/contexts/estate-agency', '/development/property-pack/contexts/estate-agency', '/v2/contexts/estate-agency'],
    ['/modelling/property-pack', '/development/property-pack/definition-and-scope', '/modelling/property-pack'],
  ]) {
    assert.equal(getPropertyPackReplacementRoute(before), after);
    assert.equal(getPropertyPackLegacyCommentKey(after), commentKey);
  }
  assert.equal(getPropertyPackReplacementRoute('/api/v2/sso/exchange'), null);
  assert.equal(getPropertyPackReplacementRoute('/schemas/v2/example'), null);
  assert.equal(getActiveDestination('/v2'), null);
  assert.equal(getNavigationSection('/v2'), null);
  assert.equal(getRouteDisposition('/v2'), null);
  assert.equal(existsSync(path.join(projectRoot, 'src/pages/v2')), false);
  assert.equal(existsSync(path.join(projectRoot, 'src/pages/modelling/property-pack.astro')), false);
  assert.equal(getActiveDestination('/spdtf-2/property-pack'), null);
  assert.equal(getNavigationSection('/spdtf-2/property-pack'), null);
  assert.equal(getRouteDisposition('/spdtf-2/property-pack'), null);
  assert.equal(existsSync(path.join(projectRoot, 'src/pages/spdtf-2')), false);
});

test('Property Pack lifecycle states remain independent and truthful', () => {
  assert.deepEqual(Object.keys(propertyPackLifecycleStatus), [
    'sourceDefinition', 'ontologyCandidate', 'technicalDetermination',
    'laterDomainReview', 'implementationRelease', 'externalAuthority',
  ]);
  assert.match(propertyPackLifecycleStatus.technicalDetermination, /Pending/u);
  assert.match(propertyPackLifecycleStatus.laterDomainReview, /Pending/u);
  assert.match(propertyPackLifecycleStatus.externalAuthority, /No government approval/u);
  const source = readFileSync(new URL('../src/components/property-pack/PropertyPackPage.astro', import.meta.url), 'utf8');
  for (const field of Object.keys(propertyPackLifecycleStatus)) {
    assert.match(source, new RegExp(`propertyPackLifecycleStatus\\.${field}`, 'u'));
  }
});

test('Property Pack search resolves only to canonical routes', () => {
  const results = searchEntries('Property Pack');
  assert.ok(results.some(({ url }) => url === '/development/property-pack'));
  assert.ok(results.every(({ url }) => url !== '/v2' && !url.startsWith('/v2/')));
  assert.ok(results.every(({ url }) => url !== '/modelling/property-pack'));
});
