import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  SITE_ROUTE_RETIREMENTS,
  composeSiteRouteRetirementReceipt,
  isSiteRouteRetired,
  validateSiteRouteRetirementManifest,
} from '../scripts/lib/site-route-retirement-contract.mjs';
import { loadSiteRouteRetirementSourceRouteManifest } from '../scripts/lib/ia-prior-manifest-contract.mjs';

const root = new URL('..', import.meta.url).pathname.replace(/\/$/u, '');
const manifest = JSON.parse(readFileSync(
  new URL('../src/data/ia-route-baseline.json', import.meta.url), 'utf8',
));
const source = loadSiteRouteRetirementSourceRouteManifest(root).manifest;
const currentRoutes = manifest.routes.filter(({ acceptedRoute }) => acceptedRoute !== '/home');

test('retired standalone routes have explicit, non-redirect replacements', () => {
  assert.deepEqual(SITE_ROUTE_RETIREMENTS, [
    { sourceRoute: '/home', replacementRoute: '/' },
    { sourceRoute: '/working-groups/join', replacementRoute: '/join' },
    { sourceRoute: '/working-groups/join/privacy', replacementRoute: '/join/privacy' },
  ]);
  assert.equal(isSiteRouteRetired('/home'), true);
  assert.equal(isSiteRouteRetired('/working-groups/join'), true);
  assert.equal(isSiteRouteRetired('/working-groups/join/privacy'), true);
  assert.equal(isSiteRouteRetired('/home/child'), false);
  assert.equal(isSiteRouteRetired('/working-groups/join/child'), false);
  assert.equal(isSiteRouteRetired('/'), false);
  const receipt = composeSiteRouteRetirementReceipt({
    records: currentRoutes,
    addedRecords: manifest.addedRoutes,
    sourceManifest: source,
  });
  assert.equal(receipt.policy, 'site-route-retirement-composition-v1');
  assert.equal(receipt.retirementCount, 3);
  assert.equal(receipt.retiredOutputCount, 0);
  assert.equal(receipt.redirects, false);
  assert.deepEqual(receipt.retirements.map(({ sourceRoute, replacementRoute, redirects }) => (
    { sourceRoute, replacementRoute, redirects }
  )), [
    { sourceRoute: '/home', replacementRoute: '/', redirects: false },
    { sourceRoute: '/working-groups/join', replacementRoute: '/join', redirects: false },
    { sourceRoute: '/working-groups/join/privacy', replacementRoute: '/join/privacy', redirects: false },
  ]);
  assert.equal(receipt.retirements[0].informationRetention.baselineBlockCount, 50);
  assert.equal(receipt.retirements[0].informationRetention.exactRetainedBlocks, 9);
  const v11 = { ...manifest, schemaVersion: 11, routes: currentRoutes, routeCount: currentRoutes.length,
    siteRouteRetirements: receipt };
  assert.doesNotThrow(() => validateSiteRouteRetirementManifest(
    root, v11, currentRoutes, manifest.addedRoutes,
  ));
});

test('the receipt fails closed if the retired output or its replacement is absent', () => {
  assert.throws(() => composeSiteRouteRetirementReceipt({
    records: source.routes,
    addedRecords: source.addedRoutes,
    sourceManifest: source,
  }), /missing or retained/u);
  assert.throws(() => composeSiteRouteRetirementReceipt({
    records: currentRoutes.filter(({ acceptedRoute }) => acceptedRoute !== '/'),
    addedRecords: manifest.addedRoutes,
    sourceManifest: source,
  }), /lacks a replacement/u);
});
