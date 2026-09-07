import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

const page = (name) => readFileSync(new URL(`../src/pages/semantic-modelling/method/${name}.astro`, import.meta.url), 'utf8');
const chapters = ['vocabularies-and-classification', 'meaning-checks-and-delivery', 'mapping-records', 'sensitivity-and-policy'];

// These contracts protect visible teaching content; they are not RDF/SHACL execution receipts.
test('ontology enrichment uses existing layouts and preserves its illustrative boundary', () => {
  for (const name of chapters) {
    const source = page(name);
    assert.ok(source.split('\n').length < 500, `${name} exceeds the file limit`);
    assert.match(source, /<ModellingLayout[^>]+claim="method"/u);
    assert.match(source, /example\.org|fictional/u);
    assert.doesNotMatch(source, /<details\b|<style\b|JourneyNav|ChapterEnd|Hennes|Mauritz/iu);
    for (const [, odr] of source.matchAll(/href="\/modelling\/odr\/(odr-\d{4})"/gu)) {
      assert.ok(readdirSync(new URL('../docs/ontology/odr/', import.meta.url))
        .some((file) => file.toLowerCase().startsWith(`${odr}-`) && file.endsWith('.md')), `${odr} has no adopted local record`);
    }
    assert.match(source, /67174057e6384b79d0b28b7736fe70a66e112895/u);
  }
});

const literalExample = (source, name) => {
  const start = source.indexOf(`const ${name} = \``);
  assert.notEqual(start, -1, `missing ${name} literal`);
  const valueStart = start + `const ${name} = \``.length;
  const end = source.indexOf('`;', valueStart);
  assert.notEqual(end, -1, `unterminated ${name} literal`);
  assert.ok(source.includes(`<code>{${name}}</code>`), `${name} must be visibly escaped`);
  return source.slice(valueStart, end);
};

// Opt-in execution against an already installed Jena distribution. No downloads,
// browser, triplestore, inferred graph or modification of the candidate corpus.
const jenaHome = process.env.OPDA_TEACHING_JENA_HOME;
test('illustrative Core examples have ordinary and adverse Jena execution evidence', { skip: !jenaHome }, () => {
  const cli = path.join(jenaHome, 'bin/shacl');
  const riot = path.join(jenaHome, 'bin/riot');
  assert.ok(existsSync(cli) && existsSync(riot), 'declared Jena tools must exist');
  const temporary = mkdtempSync(path.join(tmpdir(), 'opda-ontology-teaching-'));
  const run = (command, args) => execFileSync(command, args, { encoding: 'utf8', timeout: 30000 });
  const write = (name, data) => {
    const filename = path.join(temporary, name);
    writeFileSync(filename, data);
    return filename;
  };
  const validate = (shapes, data) => {
    const result = run(cli, ['validate', '--shapes', write('shapes.ttl', shapes), '--data', write('data.ttl', data)]);
    return run(riot, ['--output=NTRIPLES', write('result.ttl', result)]);
  };
  const sh = 'http://www.w3.org/ns/shacl#';
  const count = (result, predicate, object) => result.split('\n').filter((line) =>
    line.includes(`<${sh}${predicate}> <${sh}${object}>`)).length;
  try {
    const vocabularyPage = page('vocabularies-and-classification');
    const checksPage = page('meaning-checks-and-delivery');
    const vocabulary = literalExample(vocabularyPage, 'closedVocabulary');
    const outcomeShape = literalExample(vocabularyPage, 'closedShape');
    const open = literalExample(vocabularyPage, 'openValues');
    const reportShape = literalExample(checksPage, 'shape');
    const reportData = literalExample(checksPage, 'reviewData');
    const warning = literalExample(checksPage, 'warningShape');
    for (const [index, source] of [vocabulary, outcomeShape, open, reportShape, reportData, warning].entries()) {
      run(riot, ['--validate', write(`snippet-${index}.ttl`, source)]);
    }
    const prelude = '@prefix model: <https://example.org/property-model/> .\n@prefix ex: <https://example.org/harbour-court/> .\n@prefix outcome: <https://example.org/vocabulary/inspection-outcome/> .\n';
    const inspection = (value) => `${prelude} ex:inspection a model:Inspection ${value ? `; model:outcome ${value}` : ''} .`;
    assert.equal(count(validate(outcomeShape, inspection('outcome:Completed')), 'resultSeverity', 'Violation'), 0);
    const outside = validate(outcomeShape, `${inspection('outcome:Cancelled')} outcome:Cancelled a model:InspectionOutcome .`);
    assert.equal(count(outside, 'sourceConstraintComponent', 'InConstraintComponent'), 1);
    assert.equal(count(validate(outcomeShape, inspection('')), 'sourceConstraintComponent', 'MinCountConstraintComponent'), 1);
    assert.equal(count(validate(outcomeShape, inspection('outcome:Completed, outcome:Limited')), 'sourceConstraintComponent', 'MaxCountConstraintComponent'), 1);
    const newSurveyor = `${prelude} ex:inspection a model:Inspection ; model:performedBy ex:surveyor-c . ex:surveyor-c a model:Surveyor .`;
    assert.equal(count(validate(open, newSurveyor), 'resultSeverity', 'Violation'), 0);
    assert.equal(count(validate(open, newSurveyor.replace('ex:surveyor-c a model:Surveyor .', '')), 'sourceConstraintComponent', 'ClassConstraintComponent'), 1);
    const missing = validate(reportShape, reportData);
    assert.equal(count(missing, 'sourceConstraintComponent', 'MinCountConstraintComponent'), 1);
    assert.match(missing, /resultPath> <https:\/\/example\.org\/property-model\/reportsInspection>/u);
    assert.match(missing, /focusNode> <https:\/\/example\.org\/harbour-court\/report-missing>/u);
    const lostTarget = validate(reportShape.replace('sh:targetClass model:ReportVersion', 'sh:targetSubjectsOf model:reportsInspection'), reportData);
    assert.equal(count(lostTarget, 'resultSeverity', 'Violation'), 0, 'bad target must demonstrate the missed defect');
    const contradiction = reportShape.replace('sh:minCount 1', 'sh:minCount 2');
    assert.equal(count(validate(contradiction, reportData), 'sourceConstraintComponent', 'MinCountConstraintComponent'), 2);
    const twoLinks = reportData.replace('model:reportsInspection ex:inspection .', 'model:reportsInspection ex:inspection, ex:inspection-2 .\nex:inspection-2 a model:Inspection .');
    assert.equal(count(validate(contradiction, twoLinks), 'sourceConstraintComponent', 'MaxCountConstraintComponent'), 1);
    const advisory = validate(warning, reportData);
    assert.equal(count(advisory, 'resultSeverity', 'Warning'), 2);
    assert.equal(count(advisory, 'resultSeverity', 'Violation'), 0);
  } finally {
    rmSync(temporary, { recursive: true });
  }
});

test('vocabulary decisions separate four representations and profile-specific completeness', () => {
  const source = page('vocabularies-and-classification');
  for (const anchor of ['representation', 'closed-values', 'open-values', 'maintain-values', 'absence', 'facets', 'completeness-profiles', 'administrative-metadata', 'worked-review']) {
    assert.ok(source.includes(`id="${anchor}"`), `missing ${anchor}`);
  }
  for (const rule of ['sh:in', 'sh:class', 'skos:broader', 'skos:altLabel', 'skos:notation', 'skos:scopeNote', 'Closed', 'OpenEnded', 'Classification']) assert.ok(source.includes(rule));
  assert.match(source, /multi-typing, not punning/u);
  assert.match(source, /value-chain position is optional/iu);
  assert.match(source, /complete seven-facet/iu);
  for (const term of ['title', 'creator', 'issued', 'modified', 'identifier', 'subject']) assert.ok(source.includes(`dct:${term}`));
  for (const odr of ['0036', '0039', '0040', '0048', '0049', '0055']) assert.ok(source.includes(`href="/modelling/odr/odr-${odr}"`));
  for (const name of ['languages-and-profiles', 'scope-and-package', 'index']) assert.ok(page(name).includes('/semantic-modelling/method/vocabularies-and-classification'));
});

test('constraint authoring exposes target, contradiction and severity failures', () => {
  const source = page('meaning-checks-and-delivery');
  for (const anchor of ['author-constraints', 'target-missing-data', 'contradictory-constraints', 'authoring-profile']) assert.ok(source.includes(`id="${anchor}"`));
  for (const token of ['sh:targetClass', 'sh:targetSubjectsOf', 'sh:MinCountConstraintComponent', 'sh:Warning', 'sh:PropertyShape', 'sh:ConstraintComponent', 'ShapeClass', 'DASH']) assert.ok(source.includes(token));
  assert.match(source, /sh:minCount 2/u);
  assert.match(source, /sh:maxCount 1/u);
  assert.match(source, /meta-validation alone does not prove/iu);
  assert.match(source, /JSON-LD artefacts are generated from the ontology/u);
});

test('mapping curation preserves distinct verdicts and change in both directions', () => {
  const source = page('mapping-records');
  for (const anchor of ['verdicts', 'exact-match-chain', 'retraction-and-reopening', 'curation-register']) assert.ok(source.includes(`id="${anchor}"`));
  for (const token of ['skos:relatedMatch', 'predicate_modifier', 'Not', 'negative/unrelated', 'not yet reviewed', 'superseded', 'rigidity retyping', 'coherence regression']) assert.ok(source.includes(token));
  assert.match(source, /mandatory human reinspection/u);
  assert.match(source, /proposed round-two refinement/u);
  assert.doesNotMatch(source, /sssom:author_id/u);
});

test('privacy lessons concern model semantics rather than permission or programme operations', () => {
  const source = page('sensitivity-and-policy');
  for (const anchor of ['model-contribution', 'model-and-instance', 'scoped-role', 'qualified-bindings', 'staged-profile']) assert.ok(source.includes(`id="${anchor}"`));
  assert.match(source, /href="\/dbt-smart-data\/.*?"/u);
  for (const token of ['Category 1', 'Category 8', 'Category 9', 'Category 10', 'Category 11', 'human-curated', 'annotation-first', 'DPV-typed', 'scheme permission', 'legal basis', 'model-authoring history']) assert.ok(source.includes(token));
  assert.match(source, /Seller.*not.*authorised reader/su);
  assert.match(source, /newer upstream.*separate.*adoption/su);
});
