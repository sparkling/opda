import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MODELLING_REDESIGN,
  MODELLING_REDESIGN_REPLACEMENTS,
  getModellingCommentKey,
  getModellingRedesignReplacementRoute,
} from '../src/lib/modelling-route-migrations.mjs';
import {
  getAcceptedRoute,
  getAcceptedRouteFile,
  getLegacyCommentKey,
  getSemanticModellingReplacementRoute,
  getSpdtfReplacementRoute,
} from '../src/lib/site-route-migrations.mjs';

const destinations = {
  'why-ontologies': 'understand/shared-meaning',
  benefits: 'understand/shared-meaning',
  'taking-part': 'contribute',
  'reading-the-model': 'understand/a-property-story',
  questions: 'understand',
  'modelling-method': 'method',
  principles: 'method',
  coverage: 'method/scope-and-package',
  'bounded-contexts': 'explore/contexts-and-connections',
  'context-maps': 'method/context-map-records',
  'identity-roles-and-phases': 'method/roles-and-phases',
  'modelling-patterns': 'method/classes-and-relationships',
  'modelling-rules': 'method/classes-and-relationships',
  'linked-data-languages': 'method/languages-and-profiles',
  'semantic-package': 'method/scope-and-package',
  'evidence-and-mappings': 'method/mapping-records',
  validation: 'method/meaning-checks-and-delivery',
  standards: 'method/languages-and-profiles',
  'decision-basis': 'method/standards-and-decisions',
};

test('the September reframe declares exactly the authorised path-only replacements', () => {
  const expected = Object.fromEntries(Object.entries(destinations).map(([from, to]) => [
    `/semantic-modelling/${from}`, `/semantic-modelling/${to}`,
  ]));
  assert.deepEqual(MODELLING_REDESIGN_REPLACEMENTS, expected);
  assert.equal(MODELLING_REDESIGN.baselineRevision, 'e1e22dc8');
  assert.equal(MODELLING_REDESIGN.scope, '/semantic-modelling');
  assert.equal(Object.isFrozen(MODELLING_REDESIGN_REPLACEMENTS), true);
  for (const [from, to] of Object.entries(expected)) {
    assert.equal(getModellingRedesignReplacementRoute(`${from}/?view=all#section`), to);
    assert.equal(/[?#]/u.test(to), false);
  }
  for (const retained of ['/', '/semantic-modelling', '/semantic-modelling/method', '/semantic-modelling/not-declared']) {
    assert.equal(getModellingRedesignReplacementRoute(retained), null);
  }
});

test('current route resolution composes the reframe without changing historical helpers', () => {
  for (const [from, to] of Object.entries(destinations)) {
    const oldPath = `/semantic-modelling/${from}`;
    const newPath = `/semantic-modelling/${to}`;
    assert.equal(getSemanticModellingReplacementRoute(`/spdtf/ontologies/${from}`), oldPath);
    assert.equal(getSpdtfReplacementRoute(`/spdtf-2/ontologies/${from}`), oldPath);
    for (const source of [oldPath, `/spdtf/ontologies/${from}`, `/spdtf-2/ontologies/${from}`]) {
      assert.equal(getAcceptedRoute(source), newPath);
      assert.equal(getAcceptedRouteFile(source, `${source.slice(1)}/index.html`), `${newPath.slice(1)}/index.html`);
    }
    assert.equal(getAcceptedRoute(newPath), newPath);
  }
});

test('new chapters own their discussion identity while historical keys remain exact', () => {
  assert.equal(getModellingCommentKey('/semantic-modelling/'), '/spdtf-2/ontologies');
  for (const from of Object.keys(destinations)) {
    const path = `/semantic-modelling/${from}`;
    assert.equal(getModellingCommentKey(path), `/spdtf-2/ontologies/${from}`);
    assert.equal(getLegacyCommentKey(path), `/spdtf-2/ontologies/${from}`);
  }
  for (const suffix of [...new Set(Object.values(destinations)), 'contribute/review-a-definition', 'unregistered']) {
    const path = `/semantic-modelling/${suffix}`;
    assert.equal(getModellingCommentKey(`${path}/#review`), path);
    assert.equal(getLegacyCommentKey(path), path);
  }
  assert.equal(getModellingCommentKey('/development/property-pack'), '/development/property-pack');
});
