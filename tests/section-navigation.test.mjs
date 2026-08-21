import assert from 'node:assert/strict';
import test from 'node:test';

import { SECTIONS, normalizeUrl } from '../src/lib/site.ts';
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

  const legacyUrls = Object.values(SECTIONS).flatMap((section) => (
    section.groups.flatMap((group) => flattenItems(group.items).map(({ url }) => url))
  ));
  const compositeUrls = Object.values(SECTION_NAVIGATION).flatMap((section) => (
    section.groups.flatMap((group) => flattenGroup(group).map(({ url }) => url))
  ));
  assert.deepEqual(Object.fromEntries(Object.entries(SECTION_NAVIGATION).map(([key, section]) => [
    key, section.groups.flatMap(flattenGroup).length,
  ])), { programme: 18, 'spdtf-2': 39, 'working-groups': 33, 'pdtf-1': 196, governance: 137, resources: 12 });
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
    '/pdtf-1/original-standard', '/ontology/datatypes',
    '/ontology/namespaces', '/resources', '/glossary',
  ]) assert.equal(compositeUrls.filter((url) => url === required).length, 1, `${required} must appear once`);
  assert.equal(compositeUrls.filter((url) => url.startsWith('/spdtf-2/working-groups')).length, 33);
});

test('category landing pages remain in breadcrumbs and exact page sequences', () => {
  for (const [sectionKey, heading, category, firstChild] of [
    ['programme', 'Strategy', '/strategy', '/strategy/strategy-overview'],
    ['spdtf-2', 'Semantic modelling', '/spdtf-2/ontologies', '/spdtf-2/ontologies/why-ontologies'],
    ['spdtf-2', 'Property Pack ontology', '/spdtf-2/property-pack', '/spdtf-2/property-pack/definition-and-scope'],
    ['working-groups', 'Group workspaces', '/spdtf-2/working-groups', '/spdtf-2/working-groups/finance-and-banking'],
    ['pdtf-1', 'Original standard', '/pdtf-1/original-standard', '/schema'],
    ['pdtf-1', 'Extracted ontology', '/ontology', '/modelling'],
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
  assert.deepEqual(section.groups.map(({ heading, url }) => [heading, url]), [
    ['Overview', '/pdtf-1'],
    ['Original standard', '/pdtf-1/original-standard'],
    ['Extracted ontology', '/ontology'],
  ]);

  const original = section.groups[1];
  assert.deepEqual(original.items.map(({ title, url }) => [title, url]), [
    ['JSON Schemas and overlays', '/schema'],
    ['Data dictionary', '/modelling/data-dictionary'],
    ['Business glossary', '/modelling/business-glossary'],
    ['Implementation guidance', '/implementation'],
    ['Adoption evidence', '/adoption'],
  ]);
  assert.ok(flattenItems(original.items).some(({ url }) => url === '/schema/legal-estate'));
  assert.ok(flattenItems(original.items).some(({ url }) => url === '/implementation/validation'));

  const extracted = section.groups[2];
  assert.deepEqual(extracted.items.slice(0, 2).map(({ title, url }) => [title, url]), [
    ['How it was derived', '/modelling'],
    ['Model views', '/model'],
  ]);
  assert.equal(extracted.items.at(-1).url, '/mapping');
  assert.ok(flattenItems(extracted.items).some(({ url }) => url === '/ontology/classes'));
  assert.ok(flattenItems(extracted.items).some(({ url }) => url === '/mapping/coverage'));

  assert.deepEqual(
    findNavigationPage('/ontology/classes').trail.map(({ url }) => url),
    ['/ontology/classes'],
  );

  assert.equal(getNavigationPrevNext('/pdtf-1').next?.url, '/pdtf-1/original-standard');
  assert.equal(getNavigationPrevNext('/pdtf-1/original-standard').next?.url, '/schema');
  assert.equal(getNavigationPrevNext('/adoption/hmlr-llc').next?.url, '/ontology');
  assert.equal(getNavigationPrevNext('/ontology').next?.url, '/modelling');
  assert.equal(getNavigationPrevNext('/mapping/validate').next, undefined);
});

test('authority overrides and generated-route aliases resolve one terminal navigation page', () => {
  for (const [route, section] of [
    ['/strategy/strategy-overview', 'programme'],
    ['/spdtf-2/property-pack/validation', 'spdtf-2'],
    ['/spdtf-2/working-groups/estate-agency/review', 'working-groups'],
    ['/ontology/classes', 'pdtf-1'],
    ['/modelling/adr/adr-0074', 'governance'],
    ['/engagement/transcripts', 'resources'],
  ]) assert.equal(findNavigationPage(route)?.section.key, section);

  for (const [route, active] of [
    ['/ontology/category/example', '/ontology/category'], ['/ontology/context/example', '/ontology'],
    ['/ontology/exemplar/example', '/ontology/exemplars'], ['/ontology/profile/example', '/ontology/profiles'],
    ['/mapping/triplesmaps/example', '/mapping/triplesmaps'], ['/pdtf/example', '/ontology/glossary'],
  ]) {
    const match = findNavigationPage(route);
    assert.equal(match?.trail.at(-1)?.url ?? match?.group.url, active);
  }
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
