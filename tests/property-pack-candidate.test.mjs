import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const root = 'source/03-standards/ontology-candidates/property-pack/0.1';
const manifest = JSON.parse(readFileSync(`${root}/candidate-manifest.json`, 'utf8'));
const coverage = JSON.parse(readFileSync(`${root}/projections/coverage.json`, 'utf8'));
const dictionary = JSON.parse(readFileSync(`${root}/projections/data-dictionary.json`, 'utf8'));
const glossary = JSON.parse(readFileSync(`${root}/projections/business-glossary.json`, 'utf8'));
const report = JSON.parse(readFileSync(`${root}/validation/report.json`, 'utf8'));

test('candidate covers the exact closed scope and remains explicitly non-authoritative', () => {
  assert.equal(manifest.source_item_count, 451);
  assert.equal(manifest.candidate_status, 'machine-proposed');
  assert.equal(manifest.publication_status, 'local-review-only');
  assert.equal(coverage.length, 451);
  assert.equal(dictionary.length, 451);
  assert.equal(new Set(coverage.map((entry) => entry.item_id)).size, 451);
  assert.ok(coverage.every((entry) => entry.candidate_status === 'machine-proposed'));
  assert.ok(coverage.every((entry) => entry.semantic_home && entry.semantic_home !== 'unassigned'));
  assert.ok(coverage.every((entry) => entry.construct_refs.length > 0));
});

test('source tree fields are consolidated into semantic patterns', () => {
  const fixtures = coverage.filter((entry) => entry.source_path.startsWith('propertyPack.fixturesAndFittings.'));
  const searches = coverage.filter((entry) => entry.source_path.startsWith('propertyPack.localSearches.'));
  assert.equal(fixtures.length, 109);
  assert.equal(searches.length, 148);
  assert.ok(fixtures.some((entry) => entry.construct_refs.some((iri) => iri.endsWith('/FixtureItem'))));
  assert.ok(searches.some((entry) => entry.construct_refs.some((iri) => iri.endsWith('/SearchFinding'))));
  assert.ok(new Set(fixtures.flatMap((entry) => entry.construct_refs)).size < 15);
  assert.ok(new Set(searches.flatMap((entry) => entry.construct_refs)).size < 20);
  assert.ok(glossary.length < coverage.length);
});

test('profile constraints stay attributable and controlled values reach schemes', () => {
  assert.equal(dictionary.filter((entry) => entry.conditional).length, 283);
  assert.equal(dictionary.filter((entry) => entry.repeatable_context).length, 133);
  for (const entry of dictionary) {
    if (entry.permitted_values.length) assert.ok(entry.vocabulary_ref, entry.item_id);
    assert.match(entry.datatype, /^xsd:/);
    assert.ok(['conditional', 'unconditional'].includes(entry.requiredness));
  }
});

test('the common boundary stays small and context ownership is explicit', () => {
  assert.equal(manifest.semantic_home_counts.common, 1);
  assert.deepEqual(Object.keys(manifest.semantic_home_counts).sort(), [
    'common', 'conveyancing', 'dbt-smart-data', 'estate-agency', 'finance-and-banking',
    'property-data-services', 'property-technology', 'surveying-and-valuation',
  ]);
  assert.ok(glossary.every((term) => term.semantic_home));
  assert.ok(glossary.every((term) => term.source_item_ids.length));
});

test('RDF 1.2 Basic, SHACL and SPARQL compatibility gates pass without overclaiming', () => {
  assert.equal(report.status, 'pass');
  assert.equal(report.standards_assurance.rdf_1_2_basic, 'pass');
  assert.equal(report.standards_assurance.shacl_1_2_core_target, 'implementation-tested-core-subset');
  assert.equal(report.standards_assurance.rdf_1_2_full, 'not-applicable');
  assert.equal(report.standards_assurance.shacl_1_2_union_profile, 'not-applicable');
  assert.ok(report.checks.every((check) => check.state === 'pass'));
});

test('generated candidate is byte-identical to a clean regeneration', () => {
  const result = spawnSync('python3', ['scripts/property_pack_candidate.py', 'check'], {
    cwd: process.cwd(), encoding: 'utf8', timeout: 120_000,
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /candidate OK:/);
});
