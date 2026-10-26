import assert from 'node:assert/strict';
import test from 'node:test';
import { coverageById, resourceByKey, shapes, vocabularyByKey } from '../src/lib/property-pack-model.mjs';
import { PROPERTY_PACK_JOURNEY } from '../src/lib/property-pack-navigation.ts';

test('the reader journey separates source, review topics, model reference and decisions', () => {
  const base = '/development/property-pack';
  assert.deepEqual(PROPERTY_PACK_JOURNEY.children.map(({ url }) => url), [
    `${base}/definition-and-scope`, `${base}/work-packages`, `${base}/model`, `${base}/coverage`,
  ]);
  const flatten = (items) => items.flatMap((item) => [item.url, ...flatten(item.children ?? [])]);
  const routes = flatten(PROPERTY_PACK_JOURNEY.children);
  assert.equal(new Set(routes).size, routes.length);
  for (const path of ['worked-example', 'data-dictionary', 'resources', 'contexts', 'vocabularies', 'shapes', 'technical-working-group-determination', 'review-and-releases']) {
    assert.ok(routes.includes(`${base}/${path}`), path);
  }
});

test('the teaching example is supported by the current candidate edges and source traces', () => {
  const property = resourceByKey.get('common:Property');
  const certificate = resourceByKey.get('property-data-services:EnergyPerformanceCertificate');
  const link = resourceByKey.get('property-data-services:hasEnergyPerformanceCertificate');
  const rating = resourceByKey.get('property-data-services:energyRating');
  const scheme = vocabularyByKey.get('property-data-services:EnergyRatingScheme');
  assert.equal(link.domain, property.iri);
  assert.equal(link.range, certificate.iri);
  assert.equal(rating.domain, certificate.iri);
  assert.equal(certificate.direct_source_item_ids.length, 4);
  for (const id of certificate.direct_source_item_ids) {
    const source = coverageById.get(id);
    assert.ok(source.construct_refs.includes(certificate.iri));
    assert.ok(source.evidence.some((ref) => ref.startsWith('workbook:')));
  }
  const ratingSource = coverageById.get('pp-6c5fa0dc7b5f');
  assert.equal(ratingSource.vocabulary_ref, scheme.iri);
  assert.deepEqual(scheme.concepts.map((concept) => concept.notation).sort(), [...ratingSource.source_constraints.permitted_values].sort());
});

test('UPRN teaching preserves the source/candidate disagreement for human review', () => {
  const source = coverageById.get('pp-d1f058853e2f');
  const resource = resourceByKey.get('common:uprn');
  const shape = shapes.find((item) => item.target_key === 'common:Property');
  const rule = shape.properties.find((item) => item.path_key === resource.key);
  assert.equal(source.source_constraints.datatype, 'xsd:integer');
  assert.equal(source.disposition, 'challenge');
  assert.equal(resource.range, 'http://www.w3.org/2001/XMLSchema#string');
  assert.equal(rule.datatype, resource.range);
  assert.equal(rule.pattern, '^[0-9]+$');
  assert.equal(rule.min_count, 1);
  assert.equal(rule.max_count, 1);
  assert.equal(resource.candidate_status, 'machine-proposed');
});
