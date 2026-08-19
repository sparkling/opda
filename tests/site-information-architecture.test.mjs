import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { SECTIONS } from '../src/lib/site.ts';
import { comparisonDimensions } from '../src/lib/model-comparison.mjs';

import {
  AUTHORITY_BY_DESTINATION,
  DESTINATION_SHORTCUTS,
  GLOBAL_DESTINATIONS,
  IA_STATUS_FIELDS,
  IA_STATUS_REGISTRY_VERSION,
  PRESERVATION_LEDGER,
  ROUTE_DISPOSITION_LEDGER,
  ROUTE_FAMILY_OWNERS,
  findForbiddenIaLabels,
  getContentOwner,
  getActiveDestination,
  getRouteDisposition,
  getRouteStatus,
  validateIaContract,
} from '../src/lib/site-ia.mjs';
import { searchEntries } from '../src/lib/site-search.mjs';
import {
  ALLOWED_DISPOSITIONS,
  FORMAL_CONCERNS,
  SEMANTIC_PACKAGE_MANIFEST,
  WORKSPACE_SLUGS,
  getWorkspaceRecord,
} from '../src/lib/spdtf-workspace.mjs';
import {
  STANDARDS_MECHANISMS,
  STANDARDS_PROFILE,
  validateStandardsProfile,
} from '../src/lib/spdtf-standards-profile.mjs';

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
const routeBaseline = JSON.parse(readFileSync(new URL('../src/data/ia-route-baseline.json', import.meta.url), 'utf8'));
const preservationBaseline = JSON.parse(readFileSync(new URL('../src/data/ia-preservation-baseline.json', import.meta.url), 'utf8'));

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

test('specific route ownership overrides broad legacy families deterministically', () => {
  assert.equal(getActiveDestination('/modelling/property-pack'), 'spdtf-2');
  assert.equal(getActiveDestination('/modelling/adr/adr-0074'), 'governance');
  assert.equal(getActiveDestination('/modelling/odr/odr-0001'), 'governance');
  assert.equal(getActiveDestination('/engagement/meetings-decisions'), 'governance');
  assert.equal(getActiveDestination('/engagement/working-groups'), 'programme');
  assert.equal(getActiveDestination('/engagement/transcripts'), 'resources');
  assert.equal(getRouteDisposition('/modelling/property-pack').owner, 'spdtf-2');
  assert.equal(getRouteDisposition('/modelling/adr/adr-0074').owner, 'governance');
  for (const path of [
    '/spdtf-2/working-groups/estate-agency',
    '/working-groups/join',
    '/presentation/working-group-kickoff',
    '/engagement/transcripts',
    '/engagement/meetings-decisions',
    '/engagement/working-groups',
  ]) {
    assert.equal(
      getRouteDisposition(path).owner,
      getContentOwner(path),
      `${path} has contradictory navigation and migration ownership`,
    );
  }
});

test('every current header section has one retained global owner', () => {
  const currentSections = [
    'strategy', 'governance', 'dbt-smart-data', 'engagement', 'modelling', 'model',
    'v2', 'ontology', 'mapping', 'schema', 'implementation', 'adoption', 'library',
    'manual', 'presentations',
  ];
  for (const section of currentSections) {
    assert.ok(ROUTE_FAMILY_OWNERS[section], `${section} has no global owner`);
  }
  assert.equal(getActiveDestination('/v2/contexts/estate-agency'), 'spdtf-2');
  assert.equal(getActiveDestination('/ontology/classes'), 'pdtf-1');
  assert.equal(getActiveDestination('/manual/concept/agent/buyer'), 'pdtf-1');
  assert.equal(getContentOwner('/presentations/finance-banking-kickoff'), 'spdtf-2');
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
    '/manual/**', '/presentations/**',
  ]) {
    const entry = entries.get(path);
    assert.ok(entry, `${path} has no disposition`);
    assert.ok(entry.owner, `${path} has no owner`);
    assert.notEqual(entry.disposition, 'retire', `${path} is marked retire`);
  }
  assert.ok(ROUTE_DISPOSITION_LEDGER.every(({ preservedAt, statusSource }) => preservedAt && statusSource));
  assert.ok(ROUTE_DISPOSITION_LEDGER.every(({ consumers, endpoints, crossWorkArea, checksumPolicy, search }) => (
    consumers.length && endpoints.length && crossWorkArea.length && checksumPolicy && search.workArea
  )));
});

test('the migration ledger preserves every audited high-risk information family', () => {
  const paths = PRESERVATION_LEDGER.map(({ currentPath }) => currentPath).join('\n');
  for (const required of [
    '/resources/**', '/council/**', '/ontology/artefacts/**', '/data/**',
    '/pdtf/**', '/v2/**', 'authentication', '/ui/**',
  ]) assert.ok(paths.includes(required), `${required} is missing from the preservation ledger`);

  assert.ok(PRESERVATION_LEDGER.every(({ disposition }) => disposition !== 'retire'));
  assert.ok(PRESERVATION_LEDGER.every(({ consumers, verification, checksumSource }) => consumers.length && verification && checksumSource));
  const v2 = PRESERVATION_LEDGER.find(({ currentPath }) => currentPath === '/v2/**');
  assert.deepEqual(
    { owner: v2.owner, preservedAt: v2.preservedAt, disposition: v2.disposition },
    { owner: 'spdtf-2', preservedAt: '/v2/**', disposition: 'reframe-equivalent' },
  );
});

test('the frozen preservation proof resolves content, ownership and exact family checksums', () => {
  assert.equal(routeBaseline.schemaVersion, 3);
  assert.equal(routeBaseline.routeCount, 3436);
  assert.equal(routeBaseline.addedRouteCount, 49);
  assert.equal(routeBaseline.routes.length, routeBaseline.routeCount);
  assert.equal(routeBaseline.addedRoutes.length, routeBaseline.addedRouteCount);
  const requiredRouteFields = [
    'baselineContentSha256', 'acceptedContentSha256', 'acceptedBlockInventorySha256', 'baselineFragmentSha256',
    'acceptedFragmentSha256', 'contentOwner', 'governanceOwner', 'statusId',
    'baselineFragments', 'acceptedFragments', 'searchFacet', 'crossWorkArea',
    'preservedDestination', 'consumers', 'endpoints',
  ];
  assert.ok(routeBaseline.routes.every((record) => requiredRouteFields.every((field) => record[field])));
  assert.ok(routeBaseline.routes.every(({ equivalenceReceipt }) => (
    equivalenceReceipt?.reviewEvidence && Number.isFinite(equivalenceReceipt.retentionRatio)
    && /^[a-f0-9]{64}$/u.test(equivalenceReceipt.baselineBlockInventorySha256)
    && /^[a-f0-9]{64}$/u.test(equivalenceReceipt.acceptedBlockInventorySha256)
  )));
  assert.ok(routeBaseline.routes.every(({ retentionReceipt, equivalenceReceipt }) => (
    retentionReceipt?.policy === 'explicit-route-block-retention-v1'
    && retentionReceipt.baselineBlockCount === equivalenceReceipt.baselineBlocks
    && retentionReceipt.targetEvidence.length
    && retentionReceipt.exactRetainedBlocks + retentionReceipt.reviewedReframeBlockCount
      === retentionReceipt.baselineBlockCount
    && /^[a-f0-9]{64}$/u.test(retentionReceipt.baselineBlockInventorySha256)
    && /^[a-f0-9]{64}$/u.test(retentionReceipt.reviewedReframeBlocksSha256)
    && retentionReceipt.reviewedReframeBlocks.every((entry) => (
      /^[a-f0-9]{64}$/u.test(entry.baselineBlockSha256)
      && entry.occurrences > 0 && entry.replacementRoute && entry.replacementContentSha256
      && entry.reviewEvidence && entry.reviewer
    ))
  )));
  assert.ok(routeBaseline.routes.every(({ baselineFragments, acceptedFragments }) => (
    baselineFragments.every((fragment) => acceptedFragments.includes(fragment))
  )));
  assert.ok(routeBaseline.addedRoutes.every(({ route }) => route !== '/v2' && !route.startsWith('/v2/')));

  assert.equal(preservationBaseline.schemaVersion, 1);
  const counts = Object.fromEntries(preservationBaseline.families.map(({ id, baseline }) => [id, baseline.count]));
  assert.deepEqual(counts, {
    'source-archive': 1620,
    'council-markdown': 261,
    'ontology-artefacts': 27,
    'deployed-data': 46,
    'ui-assets': 53,
    'image-assets': 5,
    'ontology-tools': 837,
    'v2-atomic-seed': 690,
  });
  assert.ok(preservationBaseline.families.every((family) => (
    family.owner && family.dataOwner && family.consumers.length
    && family.endpoints.length && family.journeyTests.length
    && family.baseline.records.length === family.baseline.count
    && family.accepted.records.length === family.accepted.count
  )));
  assert.equal(preservationBaseline.runtimeJourneys.length, 4);
});

test('the versioned route-status registry protects derived and pre-candidate authority', () => {
  assert.match(IA_STATUS_REGISTRY_VERSION, /^\d{4}-\d{2}-\d{2}$/u);
  assert.equal(getRouteStatus('/ontology/classes').maturity, 'Draft semantic corpus — under review');
  assert.equal(getRouteStatus('/pdtf/Seller').maturity, 'Draft semantic corpus — under review');
  assert.match(getRouteStatus('/pdtf/Seller').authority, /not part of the published JSON Schema/u);
  assert.match(getRouteStatus('/mapping').authority, /verification evidence/u);
  assert.match(getRouteStatus('/modelling').maturity, /Mixed-maturity/u);
  assert.match(getRouteStatus('/adoption').authority, /does not establish SPDTF 2\.0 adoption/u);
  assert.match(getRouteStatus('/v2/contexts/estate-agency').authority, /Machine-generated/u);
  assert.match(getRouteStatus('/spdtf-2/working-groups/estate-agency').version, /no candidate/u);
  const layout = readFileSync(new URL('../src/layouts/Layout.astro', import.meta.url), 'utf8');
  for (const field of IA_STATUS_FIELDS) assert.match(layout, new RegExp(`routeStatus\\.${field}`, 'u'));
});

test('every working group exposes one truthful workspace contract', () => {
  assert.equal(WORKSPACE_SLUGS.length, 8);
  assert.equal(FORMAL_CONCERNS.length, 8);
  assert.deepEqual(ALLOWED_DISPOSITIONS, ['model here', 'reuse shared', 'boundary contribution', 'not applicable']);
  assert.equal(SEMANTIC_PACKAGE_MANIFEST.outputs.length, 6);
  assert.ok(SEMANTIC_PACKAGE_MANIFEST.projections.length >= 6);
  for (const slug of WORKSPACE_SLUGS) {
    const record = getWorkspaceRecord(slug);
    assert.equal(record.charter.status, 'draft scope record — pre-convening');
    assert.ok(record.charter.scopeSource);
    assert.ok(record.charter.exclusions.length >= 3);
    assert.equal(record.decisionEligible, false);
    assert.equal(record.decisionOccurred, false);
    assert.equal(record.decisionOwner, null);
    assert.match(record.decisionAuthority, /No person or role may decide/u);
    assert.equal(record.participation.interestRoute, '/working-groups/join');
    assert.equal(record.participation.meetingRoute, null);
    assert.equal(record.meetings.length, 0);
    assert.equal(record.coverageReceipt.length, 8);
    assert.ok(record.coverageReceipt.every(({ disposition }) => disposition === null));
    assert.ok(record.evidence.length > 0);
    assert.ok(record.evidence.every((entry) => (
      entry.sourceType && entry.recordedDate && entry.version
      && entry.submitter && entry.permission && entry.sensitivity
    )));
    assert.ok(record.competencyQuestions.length > 0);
    assert.deepEqual(record.outputRegister.map(({ output }) => output), SEMANTIC_PACKAGE_MANIFEST.outputs);
    assert.ok(record.outputRegister.every(({ status }) => status === 'not started — no group record'));
    assert.equal(record.candidate, null);
    assert.equal(record.candidateVersions.length, 0);
    assert.equal(record.changeHistory.length, 0);
    assert.equal(record.sessionRecords.length, 0);
    assert.equal(record.technicalExports.length, 0);
    assert.equal(record.manifestVersion, SEMANTIC_PACKAGE_MANIFEST.version);
  }
});

test('standards profile is item-granular and uses only the four accepted mechanisms', () => {
  assert.equal(validateStandardsProfile(), true);
  assert.deepEqual(STANDARDS_MECHANISMS, ['reuse', 'reference', 'map', 'mint']);
  assert.ok(STANDARDS_PROFILE.length >= 20);
  assert.equal(new Set(STANDARDS_PROFILE.map(({ name }) => name)).size, STANDARDS_PROFILE.length);
  assert.ok(STANDARDS_PROFILE.every(({ mechanism }) => STANDARDS_MECHANISMS.includes(mechanism)));
});

test('historical PDTF search alias returns labelled current and historical work', () => {
  const results = searchEntries('PDTF');
  assert.ok(results.some(({ url, historicalName }) => url === '/pdtf-1' && historicalName));
  assert.ok(results.some(({ url, historicalName }) => url === '/spdtf-2' && !historicalName));
});

test('preservation is a local and deployment gate', () => {
  const makefile = readFileSync(new URL('../Makefile', import.meta.url), 'utf8');
  const workflow = readFileSync(new URL('../.github/workflows/deploy-aws.yml', import.meta.url), 'utf8');
  assert.match(makefile, /ci-browser: build check-ia-preservation check-routes test-e2e/u);
  assert.match(makefile, /ci: .*check-ia-preservation/u);
  assert.match(workflow, /Information-architecture preservation gate[\s\S]*pnpm run check:ia-preservation/u);
});

test('AWS publication is fail-closed on ADR and ontology documentation gates', () => {
  const workflow = readFileSync(new URL('../.github/workflows/deploy-aws.yml', import.meta.url), 'utf8');
  const gate = workflow.indexOf('- name: ADR and ontology documentation gates');
  const credentials = workflow.indexOf('- name: Assume deploy role (OIDC)');
  assert.ok(gate >= 0, 'workflow must run the shared documentation gates');
  assert.match(workflow.slice(gate, credentials), /run: make check-adr ci-ontology-doc/u);
  assert.ok(gate < credentials, 'documentation gates must precede AWS credentials');
  assert.doesNotMatch(workflow.slice(0, gate), /configure-aws-credentials/u);
});

test('preservation checker validates clean and strict CLI boundaries', () => {
  const run = (...args) => spawnSync(process.execPath, [preservationScript, ...args], {
    cwd: projectRoot, encoding: 'utf8',
  });
  const clean = run('--manifest-only');
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
  assert.equal(SECTIONS.v2.title, 'SPDTF 2.0 development input');
  assert.equal(SECTIONS.v2.groups[0].items[1].title, 'PDTF 1.0 and Property Pack seed compared');
  assert.deepEqual(findForbiddenIaLabels(JSON.stringify(comparisonDimensions)), []);
});
