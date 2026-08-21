import assert from 'node:assert/strict';
import test from 'node:test';

import { SECTIONS, findPage, normalizeUrl } from '../src/lib/site.ts';
import { PDTF1_ROUTES } from '../src/lib/pdtf1-routes.mjs';
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
  ['spdtf-2', 'SPDTF 2.0 Development', '/spdtf-2'],
  ['working-groups', 'Working groups', '/spdtf-2/working-groups'],
  ['pdtf-1', 'PDTF 1.0', '/pdtf-1'],
  ['governance', 'Governance', '/governance'],
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
  for (const standalone of ['/', '/home', '/search', '/resource', '/design-system', '/404', '/working-groups/join']) {
    assert.equal(getNavigationSection(standalone), null, `${standalone} must remain a standalone surface`);
  }
  for (const retired of [
    '/schema', '/implementation', '/adoption', '/modelling', '/mapping', '/model', '/ontology', '/manual',
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
  ])), { programme: 18, 'spdtf-2': 39, 'working-groups': 33, 'pdtf-1': 203, governance: 138, resources: 12 });
  for (const url of new Set(legacyUrls)) {
    assert.equal(compositeUrls.filter((candidate) => candidate === url).length, 1, `${url} must appear once`);
  }
  for (const required of [
    '/programme', '/spdtf-2', '/spdtf-2/candidates', '/spdtf-2/questions', '/spdtf-2/outputs',
    '/spdtf-2/ontologies', '/spdtf-2/property-pack',
    '/spdtf-2/ontologies/reading-the-model', '/spdtf-2/ontologies/modelling-method',
    '/spdtf-2/ontologies/modelling-rules',
    '/spdtf-2/property-pack/definition-and-scope',
    '/spdtf-2/property-pack/technical-working-group-determination',
    '/spdtf-2/property-pack/review-and-releases', '/pdtf-1',
    PDTF1_ROUTES.original, `${PDTF1_ROUTES.terms}/datatypes`,
    `${PDTF1_ROUTES.use}/namespaces`, PDTF1_ROUTES.lineage,
    PDTF1_ROUTES.concepts, `${PDTF1_ROUTES.concepts}/contexts`,
    PDTF1_ROUTES.terms, PDTF1_ROUTES.validation,
    PDTF1_ROUTES.trust, PDTF1_ROUTES.use,
    '/resources', '/glossary',
  ]) assert.equal(compositeUrls.filter((url) => url === required).length, 1, `${required} must appear once`);
  assert.equal(compositeUrls.filter((url) => url.startsWith('/spdtf-2/working-groups')).length, 33);
});

test('category landing pages remain in breadcrumbs and exact page sequences', () => {
  for (const [sectionKey, heading, category, firstChild] of [
    ['programme', 'Strategy', '/strategy', '/strategy/strategy-overview'],
    ['spdtf-2', 'Semantic modelling', '/spdtf-2/ontologies', '/spdtf-2/ontologies/why-ontologies'],
    ['spdtf-2', 'Property Pack ontology', '/spdtf-2/property-pack', '/spdtf-2/property-pack/definition-and-scope'],
    ['working-groups', 'Group workspaces', '/spdtf-2/working-groups', '/spdtf-2/working-groups/finance-and-banking'],
    ['pdtf-1', 'Original standard', PDTF1_ROUTES.original, originalSchema],
    ['pdtf-1', 'Extracted ontology', PDTF1_ROUTES.extracted, PDTF1_ROUTES.lineage],
    ['governance', 'Governance framework', '/governance', '/governance/uk-initiative'],
    ['resources', 'Library', '/library', '/library/library-overview'],
  ]) {
    const group = SECTION_NAVIGATION[sectionKey].groups.find((candidate) => candidate.heading === heading);
    assert.equal(group?.url, category);
    assert.equal(getNavigationPrevNext(category).next?.url, firstChild);
    assert.equal(getNavigationPrevNext(firstChild).prev?.url, category);
  }
  assert.equal(getNavigationPrevNext('/programme').next?.url, '/strategy');
  assert.equal(getNavigationPrevNext('/spdtf-2/ontologies').prev?.url, '/spdtf-2/property-pack/review-and-releases');
  assert.deepEqual(getNavigationPrevNext('/spdtf-2/property-pack/resources/common/generated-term'), {});
});

test('PDTF 1.0 exposes the original standard and extracted ontology as two nested journeys', () => {
  const section = SECTION_NAVIGATION['pdtf-1'];
  const canonicalUrls = section.groups.flatMap(flattenGroup).map(({ url }) => url);
  assert.equal(canonicalUrls.length, 203);
  assert.ok(canonicalUrls.every((url) => url === PDTF1_ROUTES.root
    || url.startsWith(`${PDTF1_ROUTES.root}/`)));
  assert.deepEqual(section.groups.map(({ heading, url }) => [heading, url]), [
    ['Overview', PDTF1_ROUTES.root],
    ['Original standard', PDTF1_ROUTES.original],
    ['Extracted ontology', PDTF1_ROUTES.extracted],
  ]);

  const original = section.groups[1];
  assert.deepEqual(original.items.map(({ title, url }) => [title, url]), [
    ['JSON Schemas and overlays', originalSchema],
    ['Data dictionary', `${PDTF1_ROUTES.original}/data-dictionary`],
    ['Business glossary', `${PDTF1_ROUTES.original}/business-glossary`],
    ['Implementation guidance', originalImplementation],
    ['Adoption evidence', originalAdoption],
  ]);
  assert.ok(flattenItems(original.items).some(({ url }) => url === `${originalSchema}/legal-estate`));
  assert.ok(flattenItems(original.items).some(({ url }) => url === `${originalImplementation}/validation`));

  const extracted = section.groups[2];
  assert.deepEqual(extracted.items.map(({ title, url }) => [title, url]), [
    ['Lineage, provenance and verification', PDTF1_ROUTES.lineage],
    ['Model views by audience', PDTF1_ROUTES.modelViews],
    ['Concepts and architecture', PDTF1_ROUTES.concepts],
    ['Terms and model resources', PDTF1_ROUTES.terms],
    ['Validation and examples', PDTF1_ROUTES.validation],
    ['Trust, governance and limitations', PDTF1_ROUTES.trust],
    ['Use and tooling', PDTF1_ROUTES.use],
  ]);

  const lineage = extracted.items[0];
  assert.deepEqual(lineage.children.map(({ title, url }) => [title, url]), [
    ['Historical modelling record', PDTF1_ROUTES.historicalModelling],
    ['Schema-to-ontology verification', PDTF1_ROUTES.schemaVerification],
    ['Decision provenance', `${PDTF1_ROUTES.lineage}/decision-provenance`],
  ]);
  assert.ok(lineage.children[0].children
    .some(({ url }) => url === `${PDTF1_ROUTES.historicalModelling}/standards-stack`));
  assert.ok(lineage.children[1].children
    .some(({ url }) => url === `${PDTF1_ROUTES.schemaVerification}/coverage`));

  const modelViews = extracted.items[1];
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

  assert.deepEqual(extracted.items[2].children.map(({ url }) => url), [
    `${PDTF1_ROUTES.concepts}/foundation`, `${PDTF1_ROUTES.concepts}/identity`,
    `${PDTF1_ROUTES.concepts}/contexts`, `${PDTF1_ROUTES.concepts}/foundational-ontology`,
    `${PDTF1_ROUTES.concepts}/modelling-frameworks`,
  ]);
  assert.deepEqual(extracted.items[3].children.map(({ url }) => url), [
    `${PDTF1_ROUTES.terms}/graph`, `${PDTF1_ROUTES.terms}/classes`,
    `${PDTF1_ROUTES.terms}/categories`, `${PDTF1_ROUTES.terms}/properties`,
    `${PDTF1_ROUTES.terms}/datatypes`, `${PDTF1_ROUTES.terms}/vocabularies`,
    `${PDTF1_ROUTES.terms}/glossary`,
  ]);
  assert.deepEqual(extracted.items[4].children.map(({ url }) => url), [
    `${PDTF1_ROUTES.validation}/shapes`, `${PDTF1_ROUTES.validation}/profiles`,
    `${PDTF1_ROUTES.validation}/exemplars`,
  ]);
  assert.deepEqual(extracted.items[5].children.map(({ url }) => url), [
    `${PDTF1_ROUTES.trust}/claims`, `${PDTF1_ROUTES.trust}/governance`,
    `${PDTF1_ROUTES.trust}/known-issues`,
  ]);
  assert.deepEqual(extracted.items[6].children.map(({ url }) => url), [
    `${PDTF1_ROUTES.use}/usage`, `${PDTF1_ROUTES.use}/namespaces`,
    `${PDTF1_ROUTES.use}/bake-off`,
  ]);
  assert.ok(flattenItems(extracted.items).some(({ url }) => url === `${PDTF1_ROUTES.terms}/classes`));
  assert.ok(flattenItems(extracted.items)
    .some(({ url }) => url === `${PDTF1_ROUTES.schemaVerification}/coverage`));

  assert.deepEqual(
    findNavigationPage(`${PDTF1_ROUTES.terms}/classes`).trail.map(({ url }) => url),
    [PDTF1_ROUTES.terms, `${PDTF1_ROUTES.terms}/classes`],
  );
  assert.deepEqual(
    findNavigationPage(`${PDTF1_ROUTES.schemaVerification}/coverage`).trail.map(({ url }) => url),
    [PDTF1_ROUTES.lineage, PDTF1_ROUTES.schemaVerification, `${PDTF1_ROUTES.schemaVerification}/coverage`],
  );
  assert.deepEqual(
    findNavigationPage(`${PDTF1_ROUTES.modelViews}/logical/property`).trail.map(({ url }) => url),
    [PDTF1_ROUTES.modelViews, `${PDTF1_ROUTES.modelViews}/logical`, `${PDTF1_ROUTES.modelViews}/logical/property`],
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
    ['/spdtf-2/property-pack/validation', 'spdtf-2'],
    ['/spdtf-2/working-groups/estate-agency/review', 'working-groups'],
    [`${PDTF1_ROUTES.terms}/classes`, 'pdtf-1'],
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
  const group = SECTION_NAVIGATION['spdtf-2'].groups.find(({ heading }) => heading === 'Semantic modelling');
  assert.ok(group);
  assert.deepEqual(group.items.map(({ title, url }) => [title, url]), [
    ['Understand ontologies', '/spdtf-2/ontologies/why-ontologies'],
    ['How we model SPDTF 2.0', '/spdtf-2/ontologies/modelling-method'],
  ]);
  assert.deepEqual(group.items[0].children.map(({ url }) => url), [
    '/spdtf-2/ontologies/reading-the-model',
  ]);
  assert.deepEqual(group.items[1].children.map(({ url }) => url), [
    '/spdtf-2/ontologies/semantic-package',
    '/spdtf-2/ontologies/bounded-contexts',
    '/spdtf-2/ontologies/modelling-rules',
    '/spdtf-2/ontologies/coverage',
    '/spdtf-2/ontologies/standards',
    '/spdtf-2/ontologies/evidence-and-mappings',
    '/spdtf-2/ontologies/validation',
  ]);
  assert.deepEqual(findNavigationPage('/spdtf-2/ontologies/reading-the-model').trail.map(({ url }) => url), [
    '/spdtf-2/ontologies/why-ontologies',
    '/spdtf-2/ontologies/reading-the-model',
  ]);
  assert.equal(getNavigationPrevNext('/spdtf-2/ontologies/why-ontologies').next?.url,
    '/spdtf-2/ontologies/reading-the-model');
  assert.equal(getNavigationPrevNext('/spdtf-2/ontologies/modelling-method').next?.url,
    '/spdtf-2/ontologies/semantic-package');
});
