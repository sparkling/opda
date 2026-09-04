import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { SECTIONS, findPage, normalizeUrl } from '../src/lib/site.ts';
import { PDTF1_ROUTES } from '../src/lib/pdtf1-routes.mjs';
import { getRouteStatus } from '../src/lib/site-ia.mjs';
import { SITE_SEARCH_ENTRIES } from '../src/lib/site-search.mjs';
import {
  SECTION_NAVIGATION,
  findNavigationPage,
  getNavigationPrevNext,
  getNavigationSection,
  validateSectionNavigation,
} from '../src/lib/site-navigation.ts';

const expectedDestinations = [
  ['programme', 'Programme', '/programme'],
  ['governance', 'Governance', '/governance'],
  ['semantic-modelling', 'Modelling', '/semantic-modelling'],
  ['spdtf', 'Development', '/development'],
  ['working-groups', 'Groups', '/development/working-groups'],
  ['resources', 'Resources', '/resources'],
];

const originalSchema = `${PDTF1_ROUTES.original}/schema`;
const originalImplementation = `${PDTF1_ROUTES.original}/implementation`;
const originalAdoption = `${PDTF1_ROUTES.original}/adoption`;

const flattenItems = (items) => items.flatMap((item) => [item, ...flattenItems(item.children ?? [])]);
const flattenGroup = (group) => [
  { url: group.url, title: group.heading },
  ...flattenItems(group.items),
];

test('category headings own canonical landing pages without duplicate landing children', () => {
  assert.equal(validateSectionNavigation(), true);
  for (const section of Object.values(SECTION_NAVIGATION)) {
    for (const group of section.groups) {
      assert.match(group.url, /^\//u, `${section.key}/${group.heading} needs a landing URL`);
      assert.equal(
        flattenItems(group.items).filter((item) => normalizeUrl(item.url) === normalizeUrl(group.url)).length,
        0,
        `${section.key}/${group.heading} repeats its category landing as a child`,
      );
      const match = findNavigationPage(group.url);
      assert.equal(match?.group, group);
      assert.deepEqual(match?.trail, []);
    }
  }
});

test('the left section navigation implements all six destinations from one registry', () => {
  assert.deepEqual(Object.keys(SECTION_NAVIGATION), expectedDestinations.map(([key]) => key));
  for (const [key, title, url] of expectedDestinations) {
    const section = SECTION_NAVIGATION[key];
    assert.equal(section.title, title);
    assert.equal(getNavigationSection(url), section);
    assert.equal(findNavigationPage(url).section.key, key);
  }
  for (const standalone of ['/', '/join', '/join/privacy', '/subscribe', '/subscribe/privacy', '/accessibility', '/search', '/resource', '/design-system', '/404']) {
    assert.equal(getNavigationSection(standalone), null, `${standalone} must remain a standalone surface`);
  }
  for (const retired of [
    '/home', '/schema', '/implementation', '/adoption', '/modelling', '/mapping', '/model', '/ontology', '/manual',
  ]) {
    assert.equal(getNavigationSection(retired), null, `${retired} must not remain a navigation surface`);
    assert.equal(findPage(retired), null, `${retired} must not remain in the canonical page registry`);
  }
  const legacyUrls = Object.values(SECTIONS).flatMap((section) => (
    section.groups.flatMap((group) => flattenItems(group.items).map(({ url }) => url))
  ));
  const compositeUrls = Object.values(SECTION_NAVIGATION).flatMap((section) => (
    section.groups.flatMap((group) => flattenGroup(group).map(({ url }) => url))
  ));
  assert.deepEqual(Object.fromEntries(Object.entries(SECTION_NAVIGATION).map(([key, section]) => [
    key, section.groups.flatMap(flattenGroup).length,
  ])), {
    programme: 18,
    governance: 32,
    'semantic-modelling': 11,
    spdtf: 241,
    'working-groups': 39,
    resources: 12,
  });
  const decisionDetail = /^\/modelling\/(?:adr|odr)\/[^/]+$/u;
  for (const url of new Set(legacyUrls.filter((url) => !decisionDetail.test(url)))) {
    assert.equal(compositeUrls.filter((candidate) => candidate === url).length, 1, `${url} must appear once`);
  }
  assert.ok(legacyUrls.filter((url) => decisionDetail.test(url)).length > 0);
  assert.ok(compositeUrls.every((url) => !decisionDetail.test(url)), 'decision details stay off the left rail');
  for (const required of [
    '/programme', '/development', '/development/candidates', '/development/questions', '/development/outputs',
    '/semantic-modelling', '/development/property-pack',
    '/semantic-modelling/reading-the-model', '/semantic-modelling/modelling-method',
    '/semantic-modelling/modelling-rules',
    '/development/property-pack/definition-and-scope',
    '/development/property-pack/technical-working-group-determination',
    '/development/property-pack/review-and-releases', PDTF1_ROUTES.inputRoot, PDTF1_ROUTES.root,
    '/development/working-groups/member-guide',
    '/development/working-groups/member-guide/teams-and-discussions',
    '/development/working-groups/member-guide/source-material-and-sharepoint',
    PDTF1_ROUTES.original, `${PDTF1_ROUTES.terms}/datatypes`,
    `${PDTF1_ROUTES.use}/namespaces`, PDTF1_ROUTES.lineage,
    PDTF1_ROUTES.concepts, `${PDTF1_ROUTES.concepts}/contexts`,
    PDTF1_ROUTES.terms, PDTF1_ROUTES.validation,
    PDTF1_ROUTES.trust, PDTF1_ROUTES.use,
    '/resources', '/glossary',
  ]) assert.equal(compositeUrls.filter((url) => url === required).length, 1, `${required} must appear once`);
  assert.equal(compositeUrls.filter((url) => url.startsWith('/development/working-groups')).length, 39);
});

test('Governance overview is a leaf and its six task branches sit at the root', () => {
  const governance = SECTION_NAVIGATION.governance;
  const overview = governance.groups.find(({ heading }) => heading === 'Overview');
  assert.ok(overview);
  assert.deepEqual(overview.items, []);
  const expected = [
    ['/governance/uk-initiative', [
      '/governance/legislation', '/governance/departments', '/governance/steering-forums',
    ]],
    ['/governance/opda-organisation', [
      '/governance/opda-members', '/governance/sandbox',
    ]],
    ['/governance/standards-landscape', [
      '/governance/toip-governance', '/governance/strategic-alignment',
    ]],
    ['/governance/opda-rules', [
      '/governance/standards-lifecycle', '/governance/change-management',
      '/governance/lifecycle-versioning', '/governance/conformance-scheme',
      '/governance/accreditation-directory', '/governance/risk-liability',
      '/governance/deferred-work', '/governance/council',
    ]],
    ['/governance/operating-model', [
      '/governance/data-stewardship', '/governance/meetings-and-feedback',
      '/governance/stakeholder-engagement', '/governance/overlay-attachments',
    ]],
    ['/governance/quality-and-security', [
      '/governance/data-quality', '/governance/data-security',
    ]],
  ];
  const branches = governance.groups.filter(({ url }) => (
    expected.some(([expectedUrl]) => expectedUrl === url)
  ));
  assert.deepEqual(branches.map(({ url, items }) => [
    url, items.map((child) => child.url),
  ]), expected);
  assert.equal([overview, ...branches]
    .reduce((count, branch) => count + flattenGroup(branch).length, 0), 28);

  const legacy = SECTIONS.governance.groups
    .flatMap(({ items }) => flattenItems(items).map(({ url }) => normalizeUrl(url)));
  const nested = branches.flatMap((branch) => flattenGroup(branch)).map(({ url }) => normalizeUrl(url));
  for (const url of new Set(legacy.filter((url) => url !== '/governance'))) {
    assert.equal(nested.filter((candidate) => candidate === url).length, 1, `${url} must remain once`);
  }
  for (const parent of expected.map(([url]) => url)) {
    assert.ok(SITE_SEARCH_ENTRIES.some(({ url }) => url === parent), `${parent} must be searchable`);
  }
});

test('new Governance gateways are substantive linked pages rather than synthetic folders', async () => {
  const gateways = [
    ['opda-organisation', ['opda-members', 'sandbox']],
    ['standards-landscape', ['toip-governance', 'strategic-alignment']],
    ['opda-rules', ['standards-lifecycle', 'change-management', 'lifecycle-versioning',
      'conformance-scheme', 'accreditation-directory', 'risk-liability', 'deferred-work', 'council']],
    ['operating-model', ['data-stewardship', 'meetings-and-feedback', 'stakeholder-engagement', 'overlay-attachments']],
    ['quality-and-security', ['data-quality', 'data-security']],
  ];
  for (const [slug, children] of gateways) {
    const source = await readFile(new URL(`../src/pages/governance/${slug}.astro`, import.meta.url), 'utf8');
    assert.match(source, /<h1>[^<]+<\/h1>/u);
    assert.match(source, /<p class="lead">/u);
    for (const child of children) assert.match(source, new RegExp(`\/governance\/${child}`, 'u'));
  }
});

test('Working groups exposes member guidance and all eight workspaces while recruitment stays standalone', () => {
  const section = SECTION_NAVIGATION['working-groups'];
  assert.deepEqual(section.groups.map(({ heading, url }) => [heading, url]), [
    ['Member guide', '/development/working-groups/member-guide'],
    ['Group workspaces', '/development/working-groups'],
  ]);
  for (const route of ['/join', '/join/privacy']) {
    assert.equal(getNavigationSection(route), null);
    assert.equal(findNavigationPage(route), null);
    assert.deepEqual(getNavigationPrevNext(route), {});
    const status = getRouteStatus(route);
    assert.match(status.authority, /Expression-of-interest route/u);
    assert.doesNotMatch(status.authority, /Workspace scope only/u);
  }
  const guide = section.groups[0];
  assert.deepEqual(guide.items.map(({ title, url }) => [title, url]), [
    ['Getting started', '/development/working-groups/member-guide/getting-started'],
    ['Teams and discussions', '/development/working-groups/member-guide/teams-and-discussions'],
    ['Source material and SharePoint', '/development/working-groups/member-guide/source-material-and-sharepoint'],
    ['Meetings and records', '/development/working-groups/member-guide/meetings-and-records'],
    ['Model review and decisions', '/development/working-groups/member-guide/model-review-and-decisions'],
  ]);
  for (const child of guide.items) {
    assert.deepEqual(findNavigationPage(child.url)?.trail.map(({ url }) => url), [child.url]);
    assert.ok(SITE_SEARCH_ENTRIES.some(({ url }) => url === child.url), `${child.url} must be searchable`);
  }
  const guideStatus = getRouteStatus('/development/working-groups/member-guide/teams-and-discussions');
  assert.equal(guideStatus.maturity, 'Current member guidance; proposed modelling and lifecycle rules are labelled');
  assert.doesNotMatch(guideStatus.authority, /Workspace scope only/iu);
  const workspaces = section.groups[1];
  assert.equal(workspaces.items.length, 8);
  assert.ok(workspaces.items.every(({ children }) => children?.map(({ title }) => title).join('|')
    === 'Evidence|Questions|Review'));
  assert.equal(flattenGroup(workspaces).length, 33);
});

test('Governance groups decision registers beneath a decisions landing page', () => {
  const governance = SECTION_NAVIGATION.governance;
  const decisions = governance.groups.find((group) => group.heading === 'Decisions');
  assert.equal(decisions?.url, '/governance/decisions');
  assert.deepEqual(decisions?.items.map(({ title, url }) => [title, url]), [
    ['Architecture decisions', '/modelling/adr'],
    ['Ontology decisions', '/modelling/odr'],
    ['Programme decisions', '/engagement/meetings-decisions'],
  ]);

  const detailRoutes = SECTIONS.modelling.groups
    .filter(({ heading }) => heading === 'ADR corpus' || heading === 'ODR corpus')
    .flatMap(({ items }) => items.slice(1).map(({ url }) => url));
  assert.ok(detailRoutes.length > 0);
  for (const route of detailRoutes) {
    const match = findNavigationPage(route);
    assert.equal(match?.section.key, 'governance');
    assert.equal(match?.trail.length, 1);
    assert.deepEqual(getNavigationPrevNext(route), {});
  }
});

test('contextual rail highlighting never claims an index is the current detail page', async () => {
  const [sidebar, item] = await Promise.all([
    readFile(new URL('../src/components/Sidebar.astro', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/SidebarItem.astro', import.meta.url), 'utf8'),
  ]);
  assert.match(sidebar, /const isActivePage = isActiveLocation && activePath === path/u);
  assert.match(sidebar, /nav-group--leaf/u);
  assert.match(sidebar, /nav-group-leaf\$\{isActiveLocation \? ' active' : ''\}/u);
  assert.match(sidebar, /nav-group-link\$\{isActiveLocation \? ' active' : ''\}/u);
  assert.match(sidebar, /aria-current=\{isActivePage \? 'page' : undefined\}/u);
  assert.match(sidebar, /'\/modelling\/adr', 'section-nav-governance-modelling-adr'/u);
  assert.match(sidebar, /'\/modelling\/odr', 'section-nav-governance-modelling-odr'/u);
  assert.match(sidebar, /id=\{leafGroupId\}/u);
  assert.match(item, /const isCurrentPage = isActive && itemPath === currentPath/u);
  assert.equal((item.match(/aria-current=\{isCurrentPage \? 'page' : undefined\}/gu) ?? []).length, 2);
});

test('category landing pages remain in breadcrumbs and exact page sequences', () => {
  for (const [sectionKey, heading, category, firstChild] of [
    ['programme', 'Strategy', '/strategy', '/strategy/strategy-overview'],
    ['semantic-modelling', 'Understand ontologies', '/semantic-modelling/why-ontologies', '/semantic-modelling/reading-the-model'],
    ['spdtf', 'Property Pack ontology', '/development/property-pack', '/development/property-pack/definition-and-scope'],
    ['working-groups', 'Member guide', '/development/working-groups/member-guide', '/development/working-groups/member-guide/getting-started'],
    ['working-groups', 'Group workspaces', '/development/working-groups', '/development/working-groups/finance-and-banking'],
    ['spdtf', 'Third-party inputs', PDTF1_ROUTES.inputRoot, PDTF1_ROUTES.root],
    ['governance', 'UK initiative context', '/governance/uk-initiative', '/governance/legislation'],
    ['resources', 'Library', '/library', '/library/library-overview'],
  ]) {
    const group = SECTION_NAVIGATION[sectionKey].groups.find((candidate) => candidate.heading === heading);
    assert.equal(group?.url, category);
    assert.equal(getNavigationPrevNext(category).next?.url, firstChild);
    assert.equal(getNavigationPrevNext(firstChild).prev?.url, category);
  }
  assert.equal(getNavigationPrevNext('/programme').next?.url, '/strategy');
  assert.equal(getNavigationPrevNext('/governance').next?.url, '/governance/uk-initiative');
  assert.equal(getNavigationPrevNext('/semantic-modelling').next?.url, '/semantic-modelling/why-ontologies');
  assert.equal(getNavigationPrevNext('/semantic-modelling').prev, undefined);
  assert.deepEqual(getNavigationPrevNext('/development/property-pack/resources/common/generated-term'), {});
});

test('PDTF schema is a third-party input with separate supporting and derived journeys', () => {
  const section = SECTION_NAVIGATION.spdtf;
  const inputGroup = section.groups.find(({ heading }) => heading === 'Third-party inputs');
  const canonicalUrls = flattenGroup(inputGroup).map(({ url }) => url);
  assert.equal(canonicalUrls.length, 204);
  assert.ok(canonicalUrls.every((url) => url === PDTF1_ROUTES.inputRoot || url === PDTF1_ROUTES.root
    || url.startsWith(`${PDTF1_ROUTES.root}/`)));
  assert.deepEqual(inputGroup.items.map(({ title, url }) => [title, url]), [
    ['PDTF schema', PDTF1_ROUTES.root],
  ]);

  const input = inputGroup.items[0];
  const [original, extracted] = input.children;
  assert.deepEqual(original.children.map(({ title, url }) => [title, url]), [
    ['JSON Schemas and overlays', originalSchema],
    ['Data dictionary', `${PDTF1_ROUTES.original}/data-dictionary`],
    ['Business glossary', `${PDTF1_ROUTES.original}/business-glossary`],
    ['Implementation guidance', originalImplementation],
    ['Usage and implementation evidence', originalAdoption],
  ]);
  assert.ok(flattenItems(original.children).some(({ url }) => url === `${originalSchema}/legal-estate`));
  assert.ok(flattenItems(original.children).some(({ url }) => url === `${originalImplementation}/validation`));

  assert.deepEqual(extracted.children.map(({ title, url }) => [title, url]), [
    ['Lineage, provenance and verification', PDTF1_ROUTES.lineage],
    ['Model views by audience', PDTF1_ROUTES.modelViews],
    ['Concepts and architecture', PDTF1_ROUTES.concepts],
    ['Terms and model resources', PDTF1_ROUTES.terms],
    ['Validation and examples', PDTF1_ROUTES.validation],
    ['Trust, governance and limitations', PDTF1_ROUTES.trust],
    ['Use and tooling', PDTF1_ROUTES.use],
  ]);

  const lineage = extracted.children[0];
  assert.deepEqual(lineage.children.map(({ title, url }) => [title, url]), [
    ['Historical modelling record', PDTF1_ROUTES.historicalModelling],
    ['Schema-to-ontology verification', PDTF1_ROUTES.schemaVerification],
    ['Decision provenance', `${PDTF1_ROUTES.lineage}/decision-provenance`],
  ]);
  assert.ok(lineage.children[0].children
    .some(({ url }) => url === `${PDTF1_ROUTES.historicalModelling}/standards-stack`));
  assert.ok(lineage.children[1].children
    .some(({ url }) => url === `${PDTF1_ROUTES.schemaVerification}/coverage`));

  const modelViews = extracted.children[1];
  assert.deepEqual(modelViews.children.map(({ title, url }) => [title, url]), [
    ['Information architecture', `${PDTF1_ROUTES.modelViews}/information-architecture`],
    ['Concept model', `${PDTF1_ROUTES.modelViews}/concept`],
    ['Logical model', `${PDTF1_ROUTES.modelViews}/logical`],
    ['Ontology implementation', `${PDTF1_ROUTES.modelViews}/physical-ontology`],
    ['Deployment topology', `${PDTF1_ROUTES.modelViews}/physical-database`],
    ['Relational projection', `${PDTF1_ROUTES.modelViews}/physical-relational`],
    ['Validation report', `${PDTF1_ROUTES.modelViews}/validation-report`],
  ]);
  assert.ok(modelViews.children.find(({ url }) => url === `${PDTF1_ROUTES.modelViews}/logical`)
    .children.some(({ url }) => url === `${PDTF1_ROUTES.modelViews}/logical/property`));
  for (const [url, childCount] of [
    [`${PDTF1_ROUTES.modelViews}/concept`, 7],
    [`${PDTF1_ROUTES.modelViews}/logical`, 7],
    [`${PDTF1_ROUTES.modelViews}/physical-ontology`, 6],
    [`${PDTF1_ROUTES.modelViews}/physical-database`, 6],
    [`${PDTF1_ROUTES.modelViews}/physical-relational`, 7],
  ]) {
    const tier = modelViews.children.find((item) => item.url === url);
    assert.equal(tier.children.length, childCount, `${url} must retain its complete tier`);
    assert.ok(tier.children.every((item) => item.url.startsWith(`${url}/`)));
  }

  assert.deepEqual(extracted.children[2].children.map(({ url }) => url), [
    `${PDTF1_ROUTES.concepts}/foundation`, `${PDTF1_ROUTES.concepts}/identity`,
    `${PDTF1_ROUTES.concepts}/contexts`, `${PDTF1_ROUTES.concepts}/foundational-ontology`,
    `${PDTF1_ROUTES.concepts}/modelling-frameworks`,
  ]);
  assert.deepEqual(extracted.children[3].children.map(({ url }) => url), [
    `${PDTF1_ROUTES.terms}/graph`, `${PDTF1_ROUTES.terms}/classes`,
    `${PDTF1_ROUTES.terms}/categories`, `${PDTF1_ROUTES.terms}/properties`,
    `${PDTF1_ROUTES.terms}/datatypes`, `${PDTF1_ROUTES.terms}/vocabularies`,
    `${PDTF1_ROUTES.terms}/glossary`,
  ]);
  assert.deepEqual(extracted.children[4].children.map(({ url }) => url), [
    `${PDTF1_ROUTES.validation}/shapes`, `${PDTF1_ROUTES.validation}/profiles`,
    `${PDTF1_ROUTES.validation}/exemplars`,
  ]);
  assert.deepEqual(extracted.children[5].children.map(({ url }) => url), [
    `${PDTF1_ROUTES.trust}/claims`, `${PDTF1_ROUTES.trust}/governance`,
    `${PDTF1_ROUTES.trust}/known-issues`,
  ]);
  assert.deepEqual(extracted.children[6].children.map(({ url }) => url), [
    `${PDTF1_ROUTES.use}/usage`, `${PDTF1_ROUTES.use}/namespaces`,
    `${PDTF1_ROUTES.use}/bake-off`,
  ]);
  assert.ok(flattenItems(extracted.children).some(({ url }) => url === `${PDTF1_ROUTES.terms}/classes`));
  assert.ok(flattenItems(extracted.children)
    .some(({ url }) => url === `${PDTF1_ROUTES.schemaVerification}/coverage`));

  assert.deepEqual(
    findNavigationPage(`${PDTF1_ROUTES.terms}/classes`).trail.map(({ url }) => url),
    [PDTF1_ROUTES.root, PDTF1_ROUTES.extracted, PDTF1_ROUTES.terms, `${PDTF1_ROUTES.terms}/classes`],
  );
  assert.deepEqual(
    findNavigationPage(`${PDTF1_ROUTES.schemaVerification}/coverage`).trail.map(({ url }) => url),
    [
      PDTF1_ROUTES.root, PDTF1_ROUTES.extracted, PDTF1_ROUTES.lineage,
      PDTF1_ROUTES.schemaVerification, `${PDTF1_ROUTES.schemaVerification}/coverage`,
    ],
  );
  assert.deepEqual(
    findNavigationPage(`${PDTF1_ROUTES.modelViews}/logical/property`).trail.map(({ url }) => url),
    [
      PDTF1_ROUTES.root, PDTF1_ROUTES.extracted, PDTF1_ROUTES.modelViews,
      `${PDTF1_ROUTES.modelViews}/logical`, `${PDTF1_ROUTES.modelViews}/logical/property`,
    ],
  );

  assert.equal(getNavigationPrevNext(PDTF1_ROUTES.root).next?.url, PDTF1_ROUTES.original);
  assert.equal(getNavigationPrevNext(PDTF1_ROUTES.original).next?.url, originalSchema);
  assert.equal(getNavigationPrevNext(`${originalAdoption}/hmlr-llc`).next?.url, PDTF1_ROUTES.extracted);
  assert.equal(getNavigationPrevNext(PDTF1_ROUTES.extracted).next?.url, PDTF1_ROUTES.lineage);
  assert.equal(getNavigationPrevNext(`${PDTF1_ROUTES.modelViews}/validation-report`).next?.url,
    PDTF1_ROUTES.concepts);
  assert.equal(getNavigationPrevNext(PDTF1_ROUTES.use).next?.url, `${PDTF1_ROUTES.use}/usage`);
  assert.equal(getNavigationPrevNext(`${PDTF1_ROUTES.use}/bake-off`).next, undefined);
});

test('authority overrides and generated-route aliases resolve one terminal navigation page', () => {
  for (const [route, section] of [
    ['/strategy/strategy-overview', 'programme'],
    ['/development/property-pack/validation', 'spdtf'],
    ['/development/working-groups/estate-agency/review', 'working-groups'],
    [`${PDTF1_ROUTES.terms}/classes`, 'spdtf'],
    ['/modelling/adr/adr-0074', 'governance'],
    ['/engagement/transcripts', 'resources'],
  ]) assert.equal(findNavigationPage(route)?.section.key, section);

  for (const [route, active] of [
    [`${PDTF1_ROUTES.terms}/categories/example`, `${PDTF1_ROUTES.terms}/categories`],
    [`${PDTF1_ROUTES.concepts}/contexts/example`, `${PDTF1_ROUTES.concepts}/contexts`],
    [`${PDTF1_ROUTES.validation}/exemplars/example`, `${PDTF1_ROUTES.validation}/exemplars`],
    [`${PDTF1_ROUTES.validation}/profiles/example`, `${PDTF1_ROUTES.validation}/profiles`],
    [`${PDTF1_ROUTES.schemaVerification}/triplesmaps/example`, `${PDTF1_ROUTES.schemaVerification}/triplesmaps`],
    ['/pdtf/example', `${PDTF1_ROUTES.terms}/glossary`],
  ]) {
    const match = findNavigationPage(route);
    assert.equal(match?.trail.at(-1)?.url ?? match?.group.url, active);
  }
});

test('every new extracted-ontology category landing is searchable', () => {
  const searchable = new Set(SITE_SEARCH_ENTRIES.map(({ url }) => url));
  for (const url of [
    PDTF1_ROUTES.lineage, PDTF1_ROUTES.concepts,
    `${PDTF1_ROUTES.concepts}/contexts`, PDTF1_ROUTES.terms,
    PDTF1_ROUTES.validation, PDTF1_ROUTES.trust, PDTF1_ROUTES.use,
  ]) assert.ok(searchable.has(url), `${url} must be in the reader search registry`);
});

test('semantic modelling exposes two nested audience journeys with linked parents', () => {
  const section = SECTION_NAVIGATION['semantic-modelling'];
  const understand = section.groups.find(({ heading }) => heading === 'Understand ontologies');
  const method = section.groups.find(({ heading }) => heading === 'How we model SPDTF');
  assert.ok(understand);
  assert.ok(method);
  assert.equal(SECTION_NAVIGATION.spdtf.groups.some(({ heading }) => heading === 'Semantic modelling'), false);
  assert.deepEqual(understand.items.map(({ url }) => url), [
    '/semantic-modelling/reading-the-model',
    '/semantic-modelling/semantic-package',
    '/semantic-modelling/bounded-contexts',
    '/semantic-modelling/standards',
    '/semantic-modelling/evidence-and-mappings',
    '/semantic-modelling/validation',
  ]);
  assert.deepEqual(method.items.map(({ url }) => url), [
    '/semantic-modelling/modelling-rules',
    '/semantic-modelling/coverage',
  ]);
  assert.deepEqual(findNavigationPage('/semantic-modelling/reading-the-model').trail.map(({ url }) => url), [
    '/semantic-modelling/reading-the-model',
  ]);
  assert.equal(getNavigationPrevNext('/semantic-modelling/why-ontologies').next?.url,
    '/semantic-modelling/reading-the-model');
  assert.equal(getNavigationPrevNext('/semantic-modelling/modelling-method').next?.url,
    '/semantic-modelling/modelling-rules');
});

test('Property Pack work-package coverage exposes all eight source-catalogue views', () => {
  const propertyPack = SECTION_NAVIGATION.spdtf.groups
    .find(({ heading }) => heading === 'Property Pack ontology');
  const currentModel = propertyPack.items.find(({ url }) => url === '/development/property-pack/model');
  const workPackages = currentModel.children.find(({ url }) => url === '/development/property-pack/work-packages');
  assert.equal(workPackages.children.length, 8);
  assert.ok(workPackages.children.every(({ url }) => url.startsWith('/development/property-pack/work-packages/')));
  assert.deepEqual(findNavigationPage('/development/property-pack/work-packages/fixtures-fittings').trail
    .map(({ url }) => url), [
    '/development/property-pack/model', '/development/property-pack/work-packages',
    '/development/property-pack/work-packages/fixtures-fittings',
  ]);
});

test('Property Pack navigation calls its semantic homes contextual boundaries', () => {
  const propertyPack = SECTION_NAVIGATION.spdtf.groups
    .find(({ heading }) => heading === 'Property Pack ontology');
  const currentModel = propertyPack.items.find(({ url }) => url === '/development/property-pack/model');
  assert.equal(currentModel.children.find(({ url }) => url === '/development/property-pack/contexts').title,
    'Contextual boundaries');
});
