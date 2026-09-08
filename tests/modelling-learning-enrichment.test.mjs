import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { MODELLING_JOURNEYS, getModellingChapter } from '../src/lib/modelling-navigation.ts';

const read = (relative) => readFileSync(new URL('../' + relative, import.meta.url), 'utf8');
const page = (path) => read('src/pages/semantic-modelling/' + path + '.astro');
const groups = ['understand', 'explore', 'contribute'];
const pages = groups.flatMap((group) => readdirSync(new URL('../src/pages/semantic-modelling/' + group + '/', import.meta.url))
  .filter((name) => name.endsWith('.astro')).map((name) => group + '/' + name.slice(0, -6)));
const combined = pages.map(page).join('\n');

// Keep shared links useful while teaching moves into dedicated chapters.
const preservedFragments = {
  "understand/a-property-story": [
    "act-one",
    "identifiers",
    "classes-properties",
    "cast-caption",
    "act-two",
    "timeline-caption",
    "act-three",
    "shapes-provenance",
    "unchanged-claim",
    "changed-claim",
    "act-four",
    "act-five",
    "use-the-story",
    "vocabularies",
    "property-pack-walkthrough",
    "read-pages"
  ],
  "understand/index": [
    "starting-point",
    "training",
    "another-dictionary",
    "case-caption",
    "route",
    "questions",
    "replace-systems",
    "shared-database",
    "privacy",
    "one-definition",
    "existing-standards",
    "accuracy",
    "ai",
    "disagreement",
    "available",
    "first-action"
  ],
  "understand/shared-meaning": [
    "the-problem",
    "what",
    "beyond-fields",
    "statement-caption",
    "things",
    "worked-example",
    "connected",
    "tree-graph",
    "context-first",
    "local-precision",
    "connected-caption",
    "form-view",
    "model-view",
    "benefits",
    "why",
    "less-reinterpretation",
    "traceable-evidence",
    "change",
    "earn-benefits",
    "limits",
    "ai",
    "try-it",
    "ordinary-questions",
    "participate"
  ],
  "explore/contexts-and-connections": [
    "meaning",
    "same-label",
    "boundary",
    "discover-boundaries",
    "contexts",
    "homes",
    "semantic-home",
    "harbour-court",
    "property-pack",
    "transfer",
    "common",
    "source-contract"
  ],
  "explore/index": [
    "different-questions",
    "read-a-connection",
    "chapters",
    "layers-of-detail"
  ],
  "explore/names-and-choices": [
    "layers",
    "choices",
    "hierarchy",
    "connections",
    "source-contract"
  ],
  "explore/things-and-identities": [
    "one-address",
    "same",
    "change",
    "roles",
    "role-caption",
    "next",
    "source-contract"
  ],
  "contribute/bring-evidence": [
    "purpose",
    "envelope-caption",
    "case",
    "prepare",
    "safety",
    "intake"
  ],
  "contribute/index": [
    "expertise",
    "start-small",
    "contribution-caption",
    "choose",
    "review-questions",
    "read-diagrams",
    "send-feedback",
    "bring-evidence",
    "after-review",
    "today",
    "boundaries"
  ],
  "contribute/review-a-definition": [
    "read",
    "exercise",
    "draft-caption",
    "revision",
    "inspection-definition",
    "report-definition",
    "questions",
    "prepare",
    "feedback-caption",
    "share"
  ],
  "contribute/what-happens-next": [
    "not-a-vote",
    "journey-caption",
    "responses",
    "checks",
    "technical-answer",
    "human-answer",
    "disagreement",
    "available"
  ]
};

test('the field guide registers all 22 chapters and three landings in reading order', () => {
  assert.deepEqual(MODELLING_JOURNEYS.slice(0, 3).map((group) => group.children.length), [5, 9, 8]);
  assert.equal(pages.length, 25);
  for (const group of MODELLING_JOURNEYS.slice(0, 3)) {
    for (const chapter of [group, ...group.children]) {
      const relative = chapter.url.replace('/semantic-modelling/', '');
      const source = page(relative === group.url.replace('/semantic-modelling/', '') ? relative + '/index' : relative);
      assert.ok(source.includes('title="' + chapter.title + '"'), chapter.url + ' title differs from navigation');
      assert.ok(getModellingChapter(chapter.url)?.number > 0);
    }
  }
  assert.equal(getModellingChapter('/semantic-modelling/explore/not-a-chapter'), null);
});

test('old chapter fragments still have a useful home', () => {
  for (const [path, ids] of Object.entries(preservedFragments)) {
    const source = page(path);
    for (const id of ids) assert.ok(source.includes('id="' + id + '"'), path + ' loses #' + id);
  }
});

test('teaching pages are bounded visible documents, not interactive course machinery', () => {
  for (const path of pages) {
    const source = page(path);
    assert.ok(source.split('\n').length < 500, path + ' exceeds file limit');
    assert.match(source, /learning-document/u);
    assert.doesNotMatch(source, /<details\b|<form\b|<button\b|client:|<style\b/iu);
    assert.doesNotMatch(source, /H\s*&(?:amp;)?\s*M|Hennes|Mauritz/iu);
    const ids = [...source.matchAll(/\bid="([^"]+)"/gu)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length, path + ' has duplicate fragments');
  }
  for (const anchor of ['ontology', 'resource', 'relationship', 'role', 'phase', 'claim', 'evidence', 'mapping', 'bounded-context']) {
    assert.ok(combined.includes('href="/glossary#' + anchor + '"'), 'Missing canonical glossary link #' + anchor);
  }
});

test('the real-candidate scaffold reads maintained data and separates fictional revision', () => {
  const source = page('contribute/read-and-compare-a-candidate');
  assert.match(source, /candidateManifest, kindLabels, resourceByKey, resourceRoute/u);
  assert.match(source, /resourceByKey\.get\('common:Property'\)/u);
  for (const field of ['candidate_id', 'candidate_version', 'candidate_status', 'publication_status']) {
    assert.ok(source.includes('candidateManifest.' + field), 'Missing maintained ' + field);
  }
  assert.match(source, /!reviewedCandidate/u, 'Stale observations need an explicit warning');
  for (const anchor of ['identity', 'structure', 'constraints', 'evidence']) {
    assert.ok(source.includes('propertyHref}#' + anchor), 'Missing resource #' + anchor);
  }
  assert.ok(source.includes('id="fictional-revision"'));
  assert.match(source, /teaching draft A and teaching draft B/u);
  assert.match(source, /external recognition/u);
});

test('shared case keeps people and transaction roles coherent', () => {
  const story = page('understand/a-property-story');
  const identity = page('explore/things-and-identities');
  const permissions = page('explore/sensitivity-purpose-permissions');
  assert.match(story, /Nia participates as seller and Alex as buyer/u);
  assert.match(identity, /Alex participates as buyer in transaction T/u);
  assert.match(permissions, /Nia, separately identified; seller in fictional transaction T/u);
  assert.doesNotMatch(permissions, /Alex/u);
  assert.match(page('explore/measurements-amounts-and-values'), /same (?:source )?dimensions|unchanged geometry/iu);
  assert.match(page('contribute/bring-evidence'), /same identified observation by the same observer/u);
});

test('JSON-LD remains an artefact handoff rather than a syntax course', () => {
  assert.doesNotMatch(combined, /@prefix|sh:NodeShape|application\/ld\+json|JSON-LD document/u);
  assert.match(page('understand/what-we-are-building'), /JSON-LD/u);
  assert.match(page('explore/contexts-and-connections'), /established inputs/u);
  assert.match(page('explore/contexts-and-connections'), /contextMap\.cross_domain_mappings\.length/u);
});
