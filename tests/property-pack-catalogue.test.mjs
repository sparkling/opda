import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const records = JSON.parse(readFileSync('src/data/property-pack/required-properties.json', 'utf8'));
const report = JSON.parse(readFileSync('src/data/property-pack/validation-report.json', 'utf8'));

test('Property Pack catalogue contains the exact closed seed scope', () => {
  assert.equal(records.length, 451);
  assert.equal(new Set(records.map((record) => record.id)).size, 451);
  assert.equal(new Set(records.map((record) => record.source.path)).size, 451);
  assert.equal(new Set(records.map((record) => record.source.row)).size, 451);
  assert.ok(records.every((record) => /^pp-[0-9a-f]{12}$/.test(record.id)));
  assert.ok(records.every((record) => record.source.status === 'Required'));
});

test('source facts and candidate semantics remain distinguishable', () => {
  for (const record of records) {
    assert.ok(record.source.path.startsWith('propertyPack.'));
    assert.ok(record.source.field_name);
    assert.ok(record.semantic.preferred_label);
    assert.ok(record.semantic.candidate_definition);
    assert.equal(record.semantic.definition_status, 'machine-drafted-from-source');
    assert.equal(record.governance.approval_status, 'proposed');
    assert.equal(record.review.status, 'needs-semantic-review');
    assert.ok(record.evidence.some((item) => item.startsWith('workbook:')));
  }
});

test('old tree structure is not silently asserted as the new ontology', () => {
  for (const record of records) {
    assert.equal(record.model.role, 'unclassified');
    assert.equal(record.model.owning_context, 'unassigned');
    assert.equal(record.model.resource, 'unresolved');
    assert.equal(record.model.relationship, 'unresolved');
    assert.equal(record.model.attribute, 'unresolved');
    assert.equal(record.model.iri, 'unresolved');
  }
});

test('conditional requiredness and repeatable contexts are represented honestly', () => {
  assert.equal(records.filter((record) => record.value.requiredness === 'unconditional').length, 168);
  assert.equal(records.filter((record) => record.value.requiredness === 'conditional').length, 283);
  assert.equal(records.filter((record) => record.value.repeatable_context).length, 133);
  for (const record of records) {
    assert.equal(record.value.max_count, 1);
    assert.equal(record.value.min_count, record.source.condition ? 0 : 1);
  }
});

test('generated receipt records a complete workbook reconciliation', () => {
  assert.equal(report.status, 'pass');
  assert.equal(report.actual_count, 451);
  assert.deepEqual(report.source_datatypes, { boolean: 37, integer: 2, number: 2, string: 410 });
  assert.equal(report.source_descriptions_present, 211);
  assert.equal(report.source_descriptions_missing, 240);
  assert.equal(report.distinct_array_containers, 28);
  assert.equal(report.controlled_vocabulary_candidates, 320);
  assert.equal(report.legacy_formats, 17);
  assert.equal(report.legacy_min_lengths, 23);
  assert.equal(report.legacy_numeric_minimums, 2);
  assert.equal(report.source_comparison.performed, true);
  assert.equal(report.source_comparison.workbook_sha256_matches, true);
  assert.equal(report.source_comparison.legacy_schema_sha256_matches, true);
  assert.deepEqual(report.source_comparison.missing_from_catalogue, []);
  assert.deepEqual(report.source_comparison.not_required_in_workbook, []);
  assert.deepEqual(report.source_comparison.field_mismatches, []);
});

test('TOML source, generated JSON and validation receipt have no drift', () => {
  const result = spawnSync('python3', ['scripts/property_pack_catalogue.py', 'check'], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /catalogue OK: 451 records/);
});
