import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { HEADER_ORDER, SECTIONS } from '../src/lib/site.ts';
import { comparisonDimensions } from '../src/lib/model-comparison.mjs';
import {
  AUTHORITY_BY_DESTINATION,
  DESTINATION_SHORTCUTS,
  GLOBAL_DESTINATIONS,
  IA_STATUS_FIELDS,
  IA_STATUS_REGISTRY_VERSION,
  PRESERVATION_LEDGER,
  ROUTE_DISPOSITION_LEDGER,
  findForbiddenIaLabels,
  getContentOwner,
  getActiveDestination,
  getRouteDisposition,
  getRouteStatus,
  validateIaContract,
} from '../src/lib/site-ia.mjs';
import { searchEntries } from '../src/lib/site-search.mjs';
import { getDeclaredRouteReplacement } from '../src/lib/site-route-migrations.mjs';
import { fragmentsPreservedByPdtfSchemaMigration } from '../src/lib/pdtf1-routes.mjs';
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
  ['governance', 'Governance', '/governance'],
  ['semantic-modelling', 'Semantic modelling', '/semantic-modelling'],
  ['spdtf', 'SPDTF Development', '/spdtf'],
  ['working-groups', 'Working groups', '/spdtf/working-groups'],
  ['resources', 'Resources', '/resources'],
];
const preservationScript = fileURLToPath(new URL('../scripts/check-ia-preservation.mjs', import.meta.url));
const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const routeBaseline = JSON.parse(readFileSync(new URL('../src/data/ia-route-baseline.json', import.meta.url), 'utf8'));
const preservationBaseline = JSON.parse(readFileSync(new URL('../src/data/ia-preservation-baseline.json', import.meta.url), 'utf8'));
const filesBelow = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const entryPath = path.join(directory, entry.name);
  return entry.isDirectory() ? filesBelow(entryPath) : [entryPath];
});
test('the maintained IA source and companion stay below the project file limit', () => {
  for (const relativePath of [
    'docs/spdtf-information-architecture.md',
    'docs/spdtf-information-architecture.html',
  ]) {
    const source = readFileSync(path.join(projectRoot, relativePath), 'utf8');
    assert.ok(source.split('\n').length < 500, `${relativePath} must remain below 500 lines`);
  }
});
test('the global information architecture has exactly the six accepted destinations', () => {
  assert.deepEqual(
    GLOBAL_DESTINATIONS.map(({ key, title, url }) => [key, title, url]),
    expectedDestinations,
  );
  assert.equal(new Set(GLOBAL_DESTINATIONS.map(({ url }) => url)).size, 6);
  assert.equal(new Set(GLOBAL_DESTINATIONS.map(({ title }) => title)).size, 6);
  assert.equal(validateIaContract(), true);
});
test('working groups is a shortcut into the canonical SPDTF workspace', () => {
  const workingGroups = GLOBAL_DESTINATIONS.find(({ key }) => key === 'working-groups');
  assert.equal(workingGroups.url, '/spdtf/working-groups');
  assert.equal(getActiveDestination('/spdtf/working-groups'), 'working-groups');
  assert.equal(getActiveDestination('/spdtf/working-groups/estate-agency'), 'working-groups');
  assert.equal(getActiveDestination('/spdtf/working-groups/?view=records'), 'working-groups');
  assert.equal(getActiveDestination('/spdtf/ontology'), 'spdtf');
  assert.equal(getContentOwner('/spdtf/working-groups/estate-agency'), 'spdtf');
  assert.deepEqual(DESTINATION_SHORTCUTS['working-groups'], {
    target: '/spdtf/working-groups', contentOwner: 'spdtf',
  });
  assert.equal(getActiveDestination('/join'), 'working-groups');
  assert.equal(getActiveDestination('/join/privacy'), 'working-groups');
  assert.equal(getContentOwner('/join'), 'spdtf');
  assert.equal(getActiveDestination('/accessibility'), 'resources');
  for (const retired of [
    '/working-groups/join', '/working-groups/join/privacy',
    '/spdtf/working-groups/join', '/spdtf/working-groups/join/privacy',
  ]) {
    assert.equal(getActiveDestination(retired), null);
    assert.equal(getRouteDisposition(retired), null);
    assert.equal(getRouteStatus(retired), null);
    assert.equal(getDeclaredRouteReplacement(retired), null);
  }
});
test('specific route ownership overrides broad legacy families deterministically', () => {
  const retiredSemanticRoot = ['/spdtf', 'ontologies'].join('/');
  assert.equal(getActiveDestination(retiredSemanticRoot), null);
  assert.equal(getActiveDestination(`${retiredSemanticRoot}/standards`), null);
  assert.equal(getRouteDisposition(retiredSemanticRoot), null);
  assert.equal(getActiveDestination('/spdtf/property-pack'), 'spdtf');
  assert.equal(getActiveDestination('/modelling/adr/adr-0074'), 'governance');
  assert.equal(getActiveDestination('/modelling/odr/odr-0001'), 'governance');
  assert.equal(getActiveDestination('/engagement/meetings-decisions'), 'governance');
  assert.equal(getActiveDestination('/engagement/working-groups'), 'programme');
  assert.equal(getActiveDestination('/engagement/transcripts'), 'resources');
  assert.equal(getRouteDisposition('/spdtf/property-pack').owner, 'spdtf');
  assert.equal(getRouteDisposition('/modelling/adr/adr-0074').owner, 'governance');
  for (const path of [
    '/spdtf/working-groups/estate-agency',
    '/join',
    '/accessibility',
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
test('every current section has one retained global owner', () => {
  for (const sectionKey of HEADER_ORDER) {
    const section = SECTIONS[sectionKey];
    assert.ok(section, `${sectionKey} has no section definition`);
    const landing = section.groups[0]?.items[0]?.url;
    assert.ok(getActiveDestination(landing), `${sectionKey} has no global owner`);
  }
  assert.equal(getActiveDestination('/spdtf/property-pack/contexts/estate-agency'), 'spdtf');
  assert.equal(getActiveDestination('/semantic-modelling/standards'), 'semantic-modelling');
  assert.equal(getActiveDestination('/spdtf/inputs/pdtf-schema/schema-derived-ontology/terms-and-model-resources/classes'), 'spdtf');
  assert.equal(getActiveDestination('/spdtf/inputs/pdtf-schema/schema-derived-ontology/model-views-by-audience/concept/agent/buyer'), 'spdtf');
  assert.equal(getContentOwner('/presentations/finance-banking-kickoff'), 'spdtf');
  assert.equal(getActiveDestination('/library/resources'), 'resources');
});
test('each destination has the complete five-field authority contract', () => {
  for (const { key } of GLOBAL_DESTINATIONS) {
    assert.deepEqual(Object.keys(AUTHORITY_BY_DESTINATION[key]), IA_STATUS_FIELDS);
    for (const field of IA_STATUS_FIELDS) assert.ok(AUTHORITY_BY_DESTINATION[key][field]);
  }
  assert.equal(AUTHORITY_BY_DESTINATION['pdtf-schema'], undefined);
  assert.equal(getRouteStatus('/spdtf/inputs/pdtf-schema/schema-derived-ontology/terms-and-model-resources/classes').version, 'schema-derived draft');
  assert.match(getRouteStatus('/spdtf/inputs/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification/schema-to-ontology-verification').authority, /verification evidence/u);
  assert.match(getRouteStatus('/spdtf/inputs/pdtf-schema/schema-and-supporting-material/adoption').authority, /implementation evidence/u);
});
test('reader pages keep authority metadata without rendering an authority status panel', () => {
  const panelPath = path.join(projectRoot, 'src/components/ia/AuthorityPanel.astro');
  assert.equal(existsSync(panelPath), false, 'the removed visual panel component must not remain');

  for (const pagePath of filesBelow(path.join(projectRoot, 'src/pages')).filter((file) => file.endsWith('.astro'))) {
    const source = readFileSync(pagePath, 'utf8');
    assert.doesNotMatch(source, /AuthorityPanel|class=["'{]ia-authority|data-ia-status=/u, pagePath);
  }

  const layout = readFileSync(path.join(projectRoot, 'src/layouts/Layout.astro'), 'utf8');
  for (const field of IA_STATUS_FIELDS) assert.match(layout, new RegExp(`routeStatus\\.${field}`, 'u'));
});
test('every audited route family has a deterministic owner and disposition', () => {
  const entries = new Map(ROUTE_DISPOSITION_LEDGER.map((entry) => [entry.currentPath, entry]));
  for (const path of [
    '/programme/**', '/semantic-modelling/**', '/spdtf/**', '/spdtf/working-groups/**', '/spdtf/inputs/**',
    '/spdtf/inputs/pdtf-schema/**',
    '/resources/**', '/strategy/**', '/governance/**',
    '/dbt-smart-data/**', '/engagement/**',
    '/library/**', '/', '/join/**', '/accessibility', '/glossary', '/design-system', '/resource', '/404',
    '/spdtf/property-pack/**', '/pdtf/**',
    '/spdtf/inputs/pdtf-schema/schema-derived-ontology/use-and-tooling/artefacts/**',
    '/spdtf/inputs/pdtf-schema/schema-derived-ontology/use-and-tooling/tools/**', '/data/**', '/ui/**',
    '/images/**', '/council/**',
    '/presentations/**', '/modelling/adr/**', '/modelling/odr/**',
  ]) {
    const entry = entries.get(path);
    assert.ok(entry, `${path} has no disposition`);
    assert.ok(entry.owner, `${path} has no owner`);
    assert.notEqual(entry.disposition, 'retire', `${path} is marked retire`);
  }
  for (const retired of ['/pdtf-schema/**', '/schema/**', '/ontology/**', '/model/**', '/mapping/**', '/manual/**']) {
    assert.equal(getRouteDisposition(retired), null, `${retired} remains in the live disposition registry`);
  }
  assert.equal(getRouteDisposition('/home'), null, '/home remains in the live disposition registry');
  assert.equal(getActiveDestination('/home'), null, '/home remains in the destination registry');
  assert.equal(getRouteStatus('/home'), null, '/home remains in the status registry');
  assert.ok(ROUTE_DISPOSITION_LEDGER.every(({ preservedAt, statusSource }) => preservedAt && statusSource));
  assert.ok(ROUTE_DISPOSITION_LEDGER.every(({ consumers, endpoints, crossWorkArea, checksumPolicy, search }) => (
    consumers.length && endpoints.length && crossWorkArea.length && checksumPolicy && search.workArea
  )));
});

test('the migration ledger preserves every audited high-risk information family', () => {
  const paths = PRESERVATION_LEDGER.map(({ currentPath }) => currentPath).join('\n');
  for (const required of [
    '/resources/**', '/council/**', '/spdtf/inputs/pdtf-schema/schema-derived-ontology/use-and-tooling/artefacts/**', '/data/**',
    '/pdtf/**', 'former /v2/** and /modelling/property-pack', 'authentication', '/ui/**',
  ]) assert.ok(paths.includes(required), `${required} is missing from the preservation ledger`);

  assert.ok(PRESERVATION_LEDGER.every(({ disposition }) => disposition !== 'retire'));
  assert.ok(PRESERVATION_LEDGER.every(({ consumers, verification, checksumSource }) => consumers.length && verification && checksumSource));
  const propertyPack = PRESERVATION_LEDGER.find(({ currentPath }) => currentPath === 'former /v2/** and /modelling/property-pack');
  assert.deepEqual(
    { owner: propertyPack.owner, preservedAt: propertyPack.preservedAt, disposition: propertyPack.disposition },
    { owner: 'spdtf', preservedAt: '/spdtf/property-pack/**', disposition: 'reframe-equivalent' },
  );
});

test('the frozen preservation proof resolves content, ownership and exact family checksums', () => {
  assert.equal(routeBaseline.schemaVersion, 11);
  assert.equal(routeBaseline.routeCount, 3208);
  assert.equal(routeBaseline.addedRouteCount, 87);
  assert.equal(routeBaseline.retiredRouteCount, 227);
  assert.equal(routeBaseline.retiredRoutes.length, 227);
  assert.deepEqual({
    moved: routeBaseline.pdtf1Migration.movedCanonicalRouteCount,
    movedBaseline: routeBaseline.pdtf1Migration.movedBaselineRouteCount,
    movedAdded: routeBaseline.pdtf1Migration.movedAddedRouteCount,
    retired: routeBaseline.pdtf1Migration.retiredAliasRouteCount,
    stableIdentifiers: routeBaseline.pdtf1Migration.stableIdentifierRouteCount,
    canonicalFamily: routeBaseline.pdtf1Migration.canonicalFamilyRouteCount,
    outOfScope: routeBaseline.pdtf1Migration.outOfScopeSourceRouteCount,
  }, {
    moved: 1264, movedBaseline: 1255, movedAdded: 9, retired: 227,
    stableIdentifiers: 1090, canonicalFamily: 1264, outOfScope: 919,
  });
  assert.deepEqual({ mappings: routeBaseline.pdtfSchemaFragmentMigration.mappingCount,
    baseline: routeBaseline.pdtfSchemaFragmentMigration.baselineMigratedFragmentCount,
    source: routeBaseline.pdtfSchemaFragmentMigration.sourceMigratedFragmentCount,
  }, { mappings: 66, baseline: 5, source: 69182 });
  assert.equal(routeBaseline.routes.length, routeBaseline.routeCount);
  assert.equal(routeBaseline.addedRoutes.length, routeBaseline.addedRouteCount);
  const acceptedRecords = [...routeBaseline.routes, ...routeBaseline.addedRoutes];
  const pdtfInputNavPageCount = acceptedRecords.filter(({ acceptedFragments }) => (
    acceptedFragments.includes('section-nav-group-spdtf-inputs')
  )).length;
  assert.ok(pdtfInputNavPageCount >= routeBaseline.pdtfSchemaInputMigration.movedRouteCount);
  for (const suffix of ['schema', 'implementation', 'usage', 'modelling', 'model', 'mapping']) {
    const fragment = `section-nav-group-pdtf-schema-${suffix}`;
    assert.equal(
      acceptedRecords.filter(({ acceptedFragments }) => acceptedFragments.includes(fragment)).length,
      pdtfInputNavPageCount,
      `${fragment} must remain wherever the PDTF schema input navigation is rendered`,
    );
  }
  assert.equal(acceptedRecords.filter(({ acceptedFragments }) => (
    acceptedFragments.includes('section-nav-spdtf-inputs-pdtf-schema-schema-derived-ontology')
  )).length, pdtfInputNavPageCount);
  const requiredRouteFields = [
    'baselineRoute', 'baselineFile', 'acceptedRoute', 'acceptedFile',
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
    && retentionReceipt.exactRetainedBlocks + retentionReceipt.semanticReframeBlockCount
      + retentionReceipt.nonInformationBlockCount
      === retentionReceipt.baselineBlockCount
    && /^[a-f0-9]{64}$/u.test(retentionReceipt.baselineBlockInventorySha256)
    && /^[a-f0-9]{64}$/u.test(retentionReceipt.semanticReframeBlocksSha256)
    && retentionReceipt.semanticReframeBlocks.every((entry) => (
      /^[a-f0-9]{64}$/u.test(entry.sourceBlockSha256)
      && /^[a-f0-9]{64}$/u.test(entry.replacementBlockSha256)
      && entry.occurrences > 0 && entry.replacementRoute && entry.replacementContentSha256
      && entry.sourceText && entry.replacementText && entry.reviewNote
    ))
    && retentionReceipt.nonInformationBlocks.every((entry) => (
      /^[a-f0-9]{64}$/u.test(entry.sourceBlockSha256)
      && entry.occurrences > 0 && entry.destinationRoute && entry.destinationContentSha256
      && entry.classification === 'superseded-navigation-copy'
      && entry.sourceText && entry.originalDestinationRoute && entry.destinationPolicy
      && ['containing-link', 'declared-original-destination'].includes(entry.sourceEvidence)
      && entry.supersessionReason.includes(entry.originalDestinationRoute)
      && (entry.supersessionReason.includes(entry.destinationRoute)
        || getDeclaredRouteReplacement(entry.originalDestinationRoute) === entry.destinationRoute)
    ))
  )));
  assert.ok(routeBaseline.routes.every(({ baselineFragments, acceptedFragments }) => (
    fragmentsPreservedByPdtfSchemaMigration(baselineFragments, acceptedFragments)
  )));
  assert.ok(routeBaseline.addedRoutes.every(({ acceptedRoute }) => (
    acceptedRoute !== '/v2' && !acceptedRoute.startsWith('/v2/')
  )));

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
    'property-pack-canonical': 690,
  });
  assert.ok(preservationBaseline.families.every((family) => (
    family.owner && family.dataOwner && family.consumers.length
    && family.endpoints.length && family.journeyTests.length
    && family.baseline.records.length === family.baseline.count
    && family.accepted.records.length === family.accepted.count
  )));
  const tools = preservationBaseline.families.find(({ id }) => id === 'ontology-tools');
  const artefacts = preservationBaseline.families.find(({ id }) => id === 'ontology-artefacts');
  assert.deepEqual({
    tools: [tools.assetClass, tools.baselinePath, tools.acceptedPath, tools.accepted.count],
    artefacts: [artefacts.assetClass, artefacts.baselinePath, artefacts.acceptedPath, artefacts.accepted.count],
  }, {
    tools: ['tool-rendering', 'public/ontology/tools',
      'public/spdtf/inputs/pdtf-schema/schema-derived-ontology/use-and-tooling/tools', 837],
    artefacts: ['ontology-serialization', 'public/ontology/artefacts',
      'public/spdtf/inputs/pdtf-schema/schema-derived-ontology/use-and-tooling/artefacts', 27],
  });
  assert.equal(preservationBaseline.runtimeJourneys.length, 4);
});

test('the versioned route-status registry protects derived and pre-candidate authority', () => {
  assert.match(IA_STATUS_REGISTRY_VERSION, /^\d{4}-\d{2}-\d{2}$/u);
  assert.equal(getRouteStatus('/spdtf/inputs/pdtf-schema/schema-derived-ontology/terms-and-model-resources/classes').maturity, 'Draft semantic corpus — under review');
  assert.equal(getRouteStatus('/pdtf/Seller').maturity, 'Draft semantic corpus — under review');
  assert.match(getRouteStatus('/pdtf/Seller').authority, /OPDA-produced technical derivation/u);
  assert.match(getRouteStatus('/spdtf/inputs/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification/schema-to-ontology-verification').authority, /verification evidence/u);
  assert.match(getRouteStatus('/spdtf/inputs/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification/historical-modelling').maturity, /Mixed-maturity/u);
  assert.match(getRouteStatus('/spdtf/inputs/pdtf-schema/schema-and-supporting-material/adoption').authority, /does not establish SPDTF adoption/u);
  assert.match(getRouteStatus('/spdtf/inputs/pdtf-schema/schema-and-supporting-material/implementation').authority, /Third-party/u);
  assert.match(getRouteStatus('/spdtf/property-pack/contexts/estate-agency').authority, /Machine-generated/u);
  assert.match(getRouteStatus('/spdtf/working-groups/estate-agency').version, /no candidate/u);
  assert.match(getRouteStatus('/join').authority, /Expression-of-interest route/u);
  assert.equal(getRouteStatus('/accessibility').maturity, 'Maintained public service statement');
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
    assert.equal(record.participation.interestRoute, '/join');
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

test('PDTF search distinguishes the schema, derived evidence and SPDTF work', () => {
  const results = searchEntries('PDTF');
  assert.ok(results.some(({ url, facet }) => url === '/spdtf/inputs/pdtf-schema' && facet === 'PDTF schema'));
  assert.ok(results.some(({ url, facet }) => (
    url === '/spdtf/inputs/pdtf-schema/schema-derived-ontology' && facet === 'Schema-derived ontology'
  )));
  assert.ok(results.some(({ url, facet }) => url === '/spdtf' && facet === 'SPDTF Development'));
  assert.ok(results.every(({ url }) => url !== '/pdtf-schema' && !url.startsWith('/pdtf-schema/')));
});

test('preservation is a local and deployment gate', () => {
  const makefile = readFileSync(new URL('../Makefile', import.meta.url), 'utf8');
  const workflow = readFileSync(new URL('../.github/workflows/deploy-aws.yml', import.meta.url), 'utf8');
  assert.match(makefile, /ci-browser: build-data check-ia-preservation check-routes test-e2e/u);
  assert.match(makefile, /ci: .*check-ia-preservation/u);
  assert.match(workflow, /actions\/checkout@v6[\s\S]*?fetch-depth: 0/u);
  assert.doesNotMatch(workflow, /pnpm\/action-setup@v6\s+with:\s+version:/u);
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

test('preservation checker rejects an unbound semantic replacement mutation', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'opda-ia-preservation-'));
  const fixture = path.join(directory, 'route-baseline.json');
  try {
    const candidate = structuredClone(routeBaseline);
    const semantic = candidate.routes
      .flatMap(({ retentionReceipt }) => retentionReceipt.semanticReframeBlocks)
      .find(Boolean);
    semantic.replacementBlockSha256 = '0'.repeat(64);
    writeFileSync(fixture, JSON.stringify(candidate));
    const result = spawnSync(process.execPath, [preservationScript, '--manifest-only', `--route-manifest=${fixture}`], {
      cwd: projectRoot, encoding: 'utf8',
    });
    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}${result.stderr}`, /semantic reframe block/u);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('preservation checker rejects an unbound navigation-copy supersession', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'opda-ia-preservation-'));
  const fixture = path.join(directory, 'route-baseline.json');
  try {
    const candidate = structuredClone(routeBaseline);
    const supersession = candidate.routes
      .flatMap(({ retentionReceipt }) => retentionReceipt.nonInformationBlocks)
      .find(Boolean);
    supersession.destinationRoute = '/not-a-real-destination';
    writeFileSync(fixture, JSON.stringify(candidate));
    const result = spawnSync(process.execPath, [preservationScript, '--manifest-only', `--route-manifest=${fixture}`], {
      cwd: projectRoot, encoding: 'utf8',
    });
    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}${result.stderr}`, /non-information supersession/u);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('preservation checker rejects invalid navigation-copy provenance evidence', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'opda-ia-preservation-'));
  const fixture = path.join(directory, 'route-baseline.json');
  try {
    const candidate = structuredClone(routeBaseline);
    const supersession = candidate.routes
      .flatMap(({ retentionReceipt }) => retentionReceipt.nonInformationBlocks)
      .find(({ sourceEvidence }) => sourceEvidence === 'containing-link');
    assert.ok(supersession, 'the receipt must include baseline-link provenance');
    supersession.sourceEvidence = 'declared-original-destination';
    writeFileSync(fixture, JSON.stringify(candidate));
    const result = spawnSync(process.execPath, [preservationScript, '--manifest-only', `--route-manifest=${fixture}`], {
      cwd: projectRoot, encoding: 'utf8',
    });
    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}${result.stderr}`, /non-information supersession/u);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('reader-facing IA vocabulary rejects stale labels but exempts immutable records', () => {
  assert.equal(findForbiddenIaLabels('Develop SPDTF · Property Pack V2').length, 2);
  assert.deepEqual(findForbiddenIaLabels('Published baseline from Phase 1/2', { historical: true }), []);
  assert.deepEqual(findForbiddenIaLabels('SPDTF Property Pack ontology candidate'), []);
  assert.equal(SECTIONS['property-pack'].title, 'Property Pack ontology');
  assert.equal(SECTIONS['property-pack'].groups[0].items[1].title, 'Definition and 451-item scope');
  assert.deepEqual(findForbiddenIaLabels(JSON.stringify(comparisonDimensions)), []);
});
