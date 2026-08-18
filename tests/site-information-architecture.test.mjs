import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  AUTHORITY_BY_DESTINATION,
  DESTINATION_SHORTCUTS,
  GLOBAL_DESTINATIONS,
  IA_STATUS_FIELDS,
  PRESERVATION_LEDGER,
  ROUTE_DISPOSITION_LEDGER,
  ROUTE_FAMILY_OWNERS,
  findForbiddenIaLabels,
  getContentOwner,
  getActiveDestination,
  validateIaContract,
} from '../src/lib/site-ia.mjs';

const expectedDestinations = [
  ['programme', 'Programme', '/programme'],
  ['spdtf-2', 'SPDTF 2.0 Development', '/spdtf-2'],
  ['working-groups', 'Working groups', '/spdtf-2/working-groups'],
  ['pdtf-1', 'PDTF 1.0', '/pdtf-1'],
  ['governance', 'Governance', '/governance'],
  ['resources', 'Resources', '/resources'],
];

const preservationScript = fileURLToPath(new URL('../scripts/check-ia-preservation.mjs', import.meta.url));
const projectRoot = fileURLToPath(new URL('..', import.meta.url));

test('the global information architecture has exactly the six accepted destinations', () => {
  assert.deepEqual(
    GLOBAL_DESTINATIONS.map(({ key, title, url }) => [key, title, url]),
    expectedDestinations,
  );
  assert.equal(new Set(GLOBAL_DESTINATIONS.map(({ url }) => url)).size, 6);
  assert.equal(new Set(GLOBAL_DESTINATIONS.map(({ title }) => title)).size, 6);
  assert.equal(validateIaContract(), true);
});

test('working groups is a shortcut into the canonical SPDTF 2.0 workspace', () => {
  const workingGroups = GLOBAL_DESTINATIONS.find(({ key }) => key === 'working-groups');
  assert.equal(workingGroups.url, '/spdtf-2/working-groups');
  assert.equal(getActiveDestination('/spdtf-2/working-groups'), 'working-groups');
  assert.equal(getActiveDestination('/spdtf-2/working-groups/estate-agency'), 'working-groups');
  assert.equal(getActiveDestination('/spdtf-2/working-groups/?view=records'), 'working-groups');
  assert.equal(getActiveDestination('/spdtf-2/ontology'), 'spdtf-2');
  assert.equal(getContentOwner('/spdtf-2/working-groups/estate-agency'), 'spdtf-2');
  assert.deepEqual(DESTINATION_SHORTCUTS['working-groups'], {
    target: '/spdtf-2/working-groups', contentOwner: 'spdtf-2',
  });
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
  for (const { key } of GLOBAL_DESTINATIONS) {
    assert.deepEqual(Object.keys(AUTHORITY_BY_DESTINATION[key]), IA_STATUS_FIELDS);
    for (const field of IA_STATUS_FIELDS) assert.ok(AUTHORITY_BY_DESTINATION[key][field]);
  }
});

test('every audited route family has a deterministic owner and disposition', () => {
  const entries = new Map(ROUTE_DISPOSITION_LEDGER.map((entry) => [entry.currentPath, entry]));
  for (const path of [
    '/programme/**', '/spdtf-2/**', '/spdtf-2/working-groups/**', '/pdtf-1/**',
    '/resources/**', '/strategy/**', '/governance/**',
    '/dbt-smart-data/**', '/engagement/**', '/modelling/**', '/model/**', '/v2/**',
    '/ontology/**', '/mapping/**', '/schema/**', '/implementation/**', '/adoption/**',
    '/library/**', '/', '/home', '/glossary', '/design-system', '/resource', '/404',
    '/pdtf/**', '/ontology/artefacts/**', '/ontology/tools/**', '/data/**', '/ui/**',
    '/images/**', '/council/**',
  ]) {
    const entry = entries.get(path);
    assert.ok(entry, `${path} has no disposition`);
    assert.ok(entry.owner, `${path} has no owner`);
    assert.notEqual(entry.disposition, 'retire', `${path} is marked retire`);
  }
  assert.ok(ROUTE_DISPOSITION_LEDGER.every(({ preservedAt, statusSource }) => preservedAt && statusSource));
});

test('the migration ledger preserves every audited high-risk information family', () => {
  const paths = PRESERVATION_LEDGER.map(({ currentPath }) => currentPath).join('\n');
  for (const required of [
    '/resources/**', '/council/**', '/ontology/artefacts/**', '/data/**',
    '/pdtf/**', '/v2/**', 'authentication', '/ui/**',
  ]) assert.ok(paths.includes(required), `${required} is missing from the preservation ledger`);

  assert.ok(PRESERVATION_LEDGER.every(({ disposition }) => disposition !== 'retire'));
  assert.ok(PRESERVATION_LEDGER.every(({ consumers, verification }) => consumers.length && verification));
  const v2 = PRESERVATION_LEDGER.find(({ currentPath }) => currentPath === '/v2/**');
  assert.deepEqual(
    { owner: v2.owner, preservedAt: v2.preservedAt, disposition: v2.disposition },
    { owner: 'spdtf-2', preservedAt: '/v2/**', disposition: 'reframe-equivalent' },
  );
});

test('preservation checker validates clean and strict CLI boundaries', () => {
  const run = (...args) => spawnSync(process.execPath, [preservationScript, ...args], {
    cwd: projectRoot, encoding: 'utf8',
  });
  const clean = run();
  assert.equal(clean.status, 0, clean.stderr || clean.stdout);

  const strictWithoutBaseline = run('--strict');
  assert.notEqual(strictWithoutBaseline.status, 0);
  assert.match(`${strictWithoutBaseline.stdout}${strictWithoutBaseline.stderr}`, /baseline-root/u);

  const unknown = run('--unexpected');
  assert.notEqual(unknown.status, 0);
  assert.match(`${unknown.stdout}${unknown.stderr}`, /unknown/u);

  const duplicate = run('--strict', '--strict');
  assert.notEqual(duplicate.status, 0);
  assert.match(`${duplicate.stdout}${duplicate.stderr}`, /duplicate/u);
});

test('reader-facing IA vocabulary rejects stale labels but exempts immutable records', () => {
  assert.equal(findForbiddenIaLabels('Develop SPDTF · Property Pack V2').length, 2);
  assert.deepEqual(findForbiddenIaLabels('Published baseline from Phase 1/2', { historical: true }), []);
  assert.deepEqual(findForbiddenIaLabels('SPDTF 2.0 development input · machine-generated pre-draft'), []);
});
