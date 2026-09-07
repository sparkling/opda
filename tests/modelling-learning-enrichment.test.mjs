import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (relative) => readFileSync(path.join(root, relative), 'utf8');
const page = (journey, name) => read(`src/pages/semantic-modelling/${journey}/${name}.astro`);

test('shared meaning compares one fictional account across complementary views', () => {
  const source = page('understand', 'shared-meaning');

  assert.match(source, /import EnrichmentVisual from ['"]@\/components\/modelling\/EnrichmentVisual\.astro['"]/u);
  assert.match(source, /<EnrichmentVisual kind="connected-views"\s*\/>/u);
  for (const value of [
    'Flat 1',
    '12 August 2026',
    '14 August 2026',
    '20 August 2026',
    'Report version 1',
    'Report version 2',
  ]) assert.ok(source.includes(value), `connected views omit ${value}`);
  for (const relationship of ['concerns', 'describes', 'revises']) {
    assert.ok(source.includes(relationship), `connected views omit ${relationship}`);
  }
  assert.match(source, /tree[^.]*chosen place[^.]*description/iu);
  assert.match(source, /graph makes the\s+subjects\s+and relationships/iu);
  assert.match(source, /no second visit/iu);
  assert.match(source, /what evidence would change/iu);
  assert.match(source, /JSON-LD[^.]*generated output/iu);
  assert.equal([...source.matchAll(/JSON-LD/gu)].length, 1, 'JSON-LD should be mentioned once, not taught');
  assert.match(source, /does not claim that a tree cannot use references/iu);
  assert.match(source, /graph automatically removes duplication/iu);
  assert.doesNotMatch(source, /every (?:form )?field becomes/iu);
});

test('identity, role and phase practice stays intuitive and delegates formal rules', () => {
  const source = page('explore', 'things-and-identities');

  assert.match(source, /<ModellingVisual kind="role-phase"\s*\/>/u);
  for (const heading of [
    'What is being identified?',
    'In what setting does the description apply?',
    'What changes while the subject continues?',
  ]) assert.ok(source.includes(heading), `missing practice question: ${heading}`);
  assert.match(source, /seller[^.]*transaction A/iu);
  assert.match(source, /buyer[^.]*transaction B/iu);
  assert.match(source, /subdivision[^.]*not[^.]*phase/iu);
  assert.match(source, /report correction[^.]*not automatically[^.]*phase/iu);
  assert.match(source, /seller[^.]*does not[^.]*permission/iu);
  assert.match(source, /href="\/semantic-modelling\/method\/roles-and-phases"/u);
  for (const shortcut of ['kind means permanent', 'role means temporary', 'every status is a phase']) {
    assert.ok(source.includes(`“${shortcut}”`) || source.includes(`“${shortcut}`), `missing warning against ${shortcut}`);
  }
});

test('the real-candidate scaffold verifies route, version, status and evidence boundaries', () => {
  const source = page('understand', 'a-property-story');
  const candidate = read('src/data/property-pack/candidate-model/manifest.toml');
  const common = read('src/data/property-pack/candidate-model/contexts/common.toml');

  const version = candidate.match(/^candidate_version = "([^"]+)"/mu)?.[1];
  const candidateId = candidate.match(/^candidate_id = "([^"]+)"/mu)?.[1];
  assert.equal(version, '0.1.0-draft');
  assert.equal(candidateId, 'property-pack-0.1');
  assert.match(common, /^id = "Property"/mu);
  assert.match(common, /^kind = "class"/mu);
  assert.match(common, /identity = "Candidate identity[^\n]+lifecycle rules remain for working-group review\."/u);

  const target = '/development/property-pack/resources/common/Property';
  for (const anchor of ['identity', 'structure', 'constraints', 'evidence']) {
    assert.ok(source.includes(`href="${target}#${anchor}"`), `candidate guide omits #${anchor}`);
  }
  assert.ok(source.includes(version), 'candidate guide does not identify the checked version');
  assert.match(source, /machine-proposed/iu);
  assert.match(source, /public review only/iu);
  for (const status of ['technical determination', 'later domain review', 'release', 'external recognition']) {
    assert.ok(source.toLowerCase().includes(status), `candidate guide conflates or omits ${status}`);
  }
  assert.match(source, /direct source trace/iu);
  assert.match(source, /structural source trace/iu);
  assert.match(source, /provenance[^.]*not[^.]*semantic truth/iu);
  assert.match(source, /placement in[^.]*common[^.]*candidate/iu);
  assert.match(source, /technical “Kind”[\s\S]{0,180}not a foundational/iu);
  assert.match(source, /does not implement the Harbour\s+Court/iu);
});

test('cross-profession prompts ask for reasoning without inventing rules', () => {
  const roles = page('explore', 'things-and-identities');
  const names = page('explore', 'names-and-choices');
  const contexts = page('explore', 'contexts-and-connections');
  const combined = `${roles}\n${names}\n${contexts}`;

  assert.match(roles, /borrower[^.]*guarantor/iu);
  assert.match(contexts, /completion[^.]*transaction event/iu);
  assert.match(contexts, /system task/iu);
  assert.match(contexts, /context boundaries[^.]*established inputs/iu);
  assert.doesNotMatch(contexts, /Try a boundary test/iu);
  assert.match(names, /under offer/iu);
  assert.match(names, /absent[^.]*explicitly stated/iu);
  for (const step of ['Subject', 'Context', 'Statement', 'Ordinary case', 'Counterexample', 'Evidence needed', 'Review question']) {
    assert.ok(combined.includes(step), `transfer prompts omit ${step}`);
  }
  assert.match(combined, /fictional[^.]*not[^.]*agreed/iu);
  assert.doesNotMatch(combined, /approved (?:status|completion|lending) (?:rule|vocabulary|policy)/iu);
});

test('practice framing tells readers to write, compare and revise without simulating submission', () => {
  const source = page('contribute', 'review-a-definition');

  assert.match(source, /Write a question in your own notes; then compare the responses below/u);
  assert.match(source, /Could the receiver think a new inspection happened\?/u);
  assert.match(source, /inspection spans two days/iu);
  assert.match(source, /what remains undecided/iu);
  assert.match(source, /not a scored test/iu);
  assert.doesNotMatch(source, /Before opening an answer|disclosures below/iu);
  assert.doesNotMatch(source, /<details\b|<form\b|<button\b|client:/iu);
});

test('the optional formal handoff is short, sentence-led and syntax-free', () => {
  const source = page('understand', 'shared-meaning');

  assert.match(source, /Report version 2 describes the 12 August inspection/u);
  assert.match(source, /href="\/semantic-modelling\/method\/classes-and-relationships"/u);
  assert.match(source, /optional technical handoff/iu);
  assert.doesNotMatch(source, /@prefix|rdf:type|sh:NodeShape|JSON-LD document/iu);
});

test('first-use term links point to the one canonical glossary', () => {
  const combined = [
    page('understand', 'shared-meaning'),
    page('understand', 'a-property-story'),
    page('explore', 'things-and-identities'),
    page('explore', 'contexts-and-connections'),
  ].join('\n');

  for (const anchor of [
    'ontology', 'semantic-home', 'resource', 'relationship', 'kind', 'role', 'phase',
    'claim', 'evidence', 'mapping', 'bounded-context',
  ]) assert.ok(combined.includes(`href="/glossary#${anchor}"`), `missing canonical glossary link #${anchor}`);
  assert.doesNotMatch(combined, /learning glossary|beginner glossary/iu);
});

test('enriched learning pages remain bounded editorial documents', () => {
  const paths = [
    'src/pages/semantic-modelling/understand/shared-meaning.astro',
    'src/pages/semantic-modelling/understand/a-property-story.astro',
    'src/pages/semantic-modelling/explore/things-and-identities.astro',
    'src/pages/semantic-modelling/explore/names-and-choices.astro',
    'src/pages/semantic-modelling/explore/contexts-and-connections.astro',
    'src/pages/semantic-modelling/contribute/review-a-definition.astro',
  ];

  for (const relative of paths) {
    const source = read(relative);
    assert.ok(source.split('\n').length < 500, `${relative} exceeds the file limit`);
    assert.doesNotMatch(source, /Learning management|certificate|progress dashboard|create an account/iu);
    assert.doesNotMatch(source, /H\s*&(?:amp;)?\s*M|Hennes|Mauritz/iu);
  }
});
