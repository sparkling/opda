import assert from 'node:assert/strict';
import test from 'node:test';

import {
  AUTHORITY_BY_DESTINATION,
  GLOBAL_DESTINATIONS,
  PRESERVATION_LEDGER,
  ROUTE_FAMILY_OWNERS,
  getActiveDestination,
} from '../src/lib/site-ia.mjs';

const expectedDestinations = [
  ['programme', 'Programme', '/programme'],
  ['spdtf-2', 'SPDTF 2.0 Development', '/spdtf-2'],
  ['working-groups', 'Working groups', '/spdtf-2/working-groups'],
  ['pdtf-1', 'PDTF 1.0', '/pdtf-1'],
  ['governance', 'Governance', '/governance'],
  ['resources', 'Resources', '/resources'],
];

test('the global information architecture has exactly the six accepted destinations', () => {
  assert.deepEqual(
    GLOBAL_DESTINATIONS.map(({ key, title, url }) => [key, title, url]),
    expectedDestinations,
  );
  assert.equal(new Set(GLOBAL_DESTINATIONS.map(({ url }) => url)).size, 6);
});

test('working groups is a shortcut into the canonical SPDTF 2.0 workspace', () => {
  const workingGroups = GLOBAL_DESTINATIONS.find(({ key }) => key === 'working-groups');
  assert.equal(workingGroups.url, '/spdtf-2/working-groups');
  assert.equal(getActiveDestination('/spdtf-2/working-groups/estate-agency'), 'spdtf-2');
  assert.equal(getActiveDestination('/working-groups/join'), 'working-groups');
});

test('every current header section has one retained global owner', () => {
  const currentSections = [
    'strategy', 'governance', 'dbt-smart-data', 'engagement', 'modelling', 'model',
    'v2', 'ontology', 'mapping', 'schema', 'implementation', 'adoption', 'library',
  ];
  for (const section of currentSections) {
    assert.ok(ROUTE_FAMILY_OWNERS[section], `${section} has no global owner`);
  }
  assert.equal(getActiveDestination('/v2/contexts/estate-agency'), 'spdtf-2');
  assert.equal(getActiveDestination('/ontology/classes'), 'pdtf-1');
  assert.equal(getActiveDestination('/library/resources'), 'resources');
});

test('each destination has the complete five-field authority contract', () => {
  const fields = ['workArea', 'authority', 'maturity', 'version', 'provenance'];
  for (const { key } of GLOBAL_DESTINATIONS) {
    assert.deepEqual(Object.keys(AUTHORITY_BY_DESTINATION[key]), fields);
    for (const field of fields) assert.ok(AUTHORITY_BY_DESTINATION[key][field]);
  }
});

test('the migration ledger preserves every audited high-risk information family', () => {
  const paths = PRESERVATION_LEDGER.map(({ currentPath }) => currentPath).join('\n');
  for (const required of [
    '/resources/**', '/council/**', '/ontology/artefacts/**', '/data/**',
    '/pdtf/**', 'authentication', '/ui/**',
  ]) assert.ok(paths.includes(required), `${required} is missing from the preservation ledger`);

  assert.ok(PRESERVATION_LEDGER.every(({ disposition }) => disposition !== 'retire'));
  assert.ok(PRESERVATION_LEDGER.every(({ consumers, verification }) => consumers.length && verification));
});
