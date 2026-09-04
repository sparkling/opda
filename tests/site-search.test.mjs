import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { PDTF1_ROUTES } from '../src/lib/pdtf1-routes.mjs';
import { getActiveDestination, getRouteStatus } from '../src/lib/site-ia.mjs';
import {
  SITE_SEARCH_ENTRIES,
  describeRecord,
  normaliseSearchRecord,
  searchEntries,
} from '../src/lib/site-search.mjs';
import {
  DESTINATIONS,
  FACETS,
  SEARCH_TABS,
  parseSearchParams,
  searchMetaEntries,
  searchParamsFor,
} from '../src/lib/site-search-model.mjs';

const expectedDestinations = [
  ['programme', 'Programme'],
  ['governance', 'Governance'],
  ['semantic-modelling', 'Modelling'],
  ['spdtf', 'Development'],
  ['working-groups', 'Groups'],
  ['resources', 'Resources'],
];

test('site-search facets use Section once and preserve legacy page-type URLs', () => {
  assert.deepEqual(DESTINATIONS.map(({ key, label }) => [key, label]), expectedDestinations);
  const sectionFacet = FACETS.find(({ key }) => key === 'destination');
  assert.equal(sectionFacet?.label, 'Section');
  assert.equal(sectionFacet?.param, 'section');
  assert.equal(FACETS.some(({ key }) => key === 'pageType'), false);
  assert.deepEqual(SEARCH_TABS.find(({ key }) => key === 'all')?.facets, FACETS.map(({ key }) => key));
  assert.deepEqual(SEARCH_TABS.slice(1).map(({ key, facets }) => [key, facets]), [
    ['ontology', ['collection', 'kind', 'domain']],
    ['decision', ['collection', 'status']],
    ['programme', []],
    ['governance', ['collection']],
    ['modelling', []],
    ['development', ['type', 'collection', 'kind', 'domain']],
    ['working-groups', ['type', 'domain']],
    ['resources', []],
  ]);

  const typeParams = searchParamsFor('', { type: ['ontology', 'page'] });
  assert.deepEqual(parseSearchParams(typeParams).filters.type, ['ontology', 'page']);
  const legacy = parseSearchParams('q=rules&section=governance&pagetype=governance');
  assert.equal(legacy.query, 'rules');
  assert.deepEqual(legacy.filters.destination, ['governance']);
  assert.deepEqual(legacy.filters.pageType, ['governance']);
  assert.equal(searchParamsFor(legacy.query, legacy.filters).toString(), 'q=rules&section=governance&pagetype=governance');
  assert.deepEqual(searchMetaEntries({ pageType: 'model-documentation' }), [
    ['opda:search-page-type', 'model-documentation'],
  ]);

  const compatiblePage = normaliseSearchRecord({
    title: 'Governance', url: '/governance', type: 'page', pageType: 'governance',
  });
  assert.equal(compatiblePage.pageType, 'governance');
  assert.equal(describeRecord(compatiblePage).eyebrow, 'Governance');
  assert.ok(searchEntries('', { pageType: ['governance'] }).every(({ pageType }) => pageType === 'governance'));
});

test('the page controller exposes legacy page type only as removable compatibility state', async () => {
  const controller = await readFile(new URL('../src/scripts/site-search-page.ts', import.meta.url), 'utf8');
  assert.match(controller, /let legacyPageTypes: string\[\] = \[\]/u);
  assert.match(controller, /`Legacy page type: \$\{labelFor\(PAGE_TYPES, pageType\) \|\| pageType\}`/u);
  assert.match(controller, /legacyPageTypes = legacyPageTypes\.filter/u);
  assert.match(controller, /form\.addEventListener\('reset',[\s\S]*legacyPageTypes = \[\]/u);
});

test('site-search entries use canonical destinations and deterministic relevance', () => {
  assert.equal(new Set(SITE_SEARCH_ENTRIES.map(({ url }) => url)).size, SITE_SEARCH_ENTRIES.length);
  for (const record of SITE_SEARCH_ENTRIES) {
    assert.equal(record.destination, getActiveDestination(record.url), `${record.url} has a stale destination`);
  }

  assert.deepEqual(searchEntries('').map(({ url }) => url), SITE_SEARCH_ENTRIES.map(({ url }) => url));
  assert.equal(searchEntries('governance')[0]?.url, '/governance');
  assert.equal(searchEntries('PDTF schema')[0]?.url, PDTF1_ROUTES.root);
  assert.ok(searchEntries('semantic mapping')
    .some(({ url }) => url === '/semantic-modelling/evidence-and-mappings'));
  assert.equal(searchEntries('join working group')[0]?.url, '/join');
  assert.ok(SITE_SEARCH_ENTRIES.some(({ url, destination }) => (
    url === '/join/privacy' && destination === 'working-groups'
  )));
  assert.ok(SITE_SEARCH_ENTRIES.some(({ url, destination }) => (
    url === '/accessibility' && destination === 'resources'
  )));
  assert.ok(SITE_SEARCH_ENTRIES.every(({ url }) => (
    !url.startsWith('/working-groups/join') && !url.startsWith('/spdtf/working-groups/join')
  )));

  const governance = searchEntries('', { type: 'page', destination: ['governance'] });
  assert.ok(governance.length > 1);
  assert.ok(governance.every(({ destination }) => destination === 'governance'));
  assert.deepEqual(searchEntries('', { type: 'decision' }), []);

  const distinctWorkAreas = new Set([
    PDTF1_ROUTES.root,
    PDTF1_ROUTES.extracted,
    '/development',
  ].map((url) => getRouteStatus(url).workArea));
  assert.equal(distinctWorkAreas.size, 3);
});
