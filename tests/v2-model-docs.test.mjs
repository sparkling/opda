import assert from 'node:assert/strict';
import test from 'node:test';

import {
  boundaryDiagram,
  completeModelDiagram,
  contextDiagram,
  contexts,
  counts,
  coverage,
  dataPointRoute,
  resourceRoute,
  resourceByIri,
  resources,
  shapeRoute,
  shapes,
  vocabularies,
  vocabularyRoute,
} from '../src/lib/v2-model.mjs';

test('V2 documentation model has exact candidate coverage', () => {
  assert.deepEqual(counts, {
    sourceItems: 451,
    resources: 159,
    classes: 53,
    objectProperties: 77,
    datatypeProperties: 29,
    schemes: 14,
    concepts: 85,
    topicConcepts: 413,
    shapes: 45,
    constraints: 100,
    subclassEdges: 23,
    domainEdges: 100,
    rangeEdges: 106,
  });
  assert.equal(contexts.length, 8);
  assert.equal(shapes.flatMap((shape) => shape.properties).length, 100);
});

test('stable detail routes are unique and identifier-based', () => {
  const resourceRoutes = resources.map(resourceRoute);
  const sourceRoutes = coverage.map(dataPointRoute);
  const schemeRoutes = vocabularies.map(vocabularyRoute);
  const shapeRoutes = shapes.map(shapeRoute);
  assert.equal(new Set(resourceRoutes).size, 159);
  assert.equal(new Set(sourceRoutes).size, 451);
  assert.equal(new Set(schemeRoutes).size, 14);
  assert.equal(new Set(shapeRoutes).size, 45);
  assert.ok(resourceRoutes.every((route) => /^\/v2\/resources\/[a-z-]+\/[A-Za-z0-9_-]+$/.test(route)));
  assert.ok(sourceRoutes.every((route) => /^\/v2\/data-dictionary\/pp-[0-9a-f]{12}$/.test(route)));
  assert.ok(shapeRoutes.every((route) => /^\/v2\/shapes\/[a-z-]+\/[A-Za-z0-9_-]+$/.test(route)));
});

test('complete Mermaid contains every term and every asserted structural edge', () => {
  const source = completeModelDiagram();
  assert.match(source, /^---\nconfig:\n  layout: elk\n---\nflowchart LR/m);
  assert.match(source, /accTitle: Complete Property Pack candidate model/);
  assert.match(source, /accDescr:/);
  assert.doesNotMatch(source, /\\n/);
  assert.equal((source.match(/^    term_\d+\["/gm) ?? []).length, 167);
  assert.equal((source.match(/^  term_\d+ -->\|/gm) ?? []).length, 229);
  assert.equal((source.match(/^  click term_\d+ /gm) ?? []).length, 159);
  for (const resource of resources) assert.ok(source.includes(`"${resourceRoute(resource)}"`));
});

test('context diagrams and boundary map preserve semantic-home distinctions', () => {
  const boundary = boundaryDiagram();
  assert.equal((boundary.match(/interoperates through/g) ?? []).length, 7);
  assert.match(boundary, /Cross-sector scheme context/);
  assert.match(boundary, /Common boundary/);
  for (const context of contexts) {
    const source = contextDiagram(context.id);
    const owned = resources.filter((resource) => resource.semantic_home === context.id);
    const ownedIris = new Set(owned.map((resource) => resource.iri));
    const linkedNeighbours = new Set(owned.flatMap((resource) => [
      resource.domain, resource.range, resource.subclass_of,
    ]).filter((iri) => iri && !ownedIris.has(iri) && resourceByIri.has(iri)));
    assert.equal((source.match(/^  click term_\d+ /gm) ?? []).length, owned.length + linkedNeighbours.size);
    assert.match(source, /accTitle:/);
    assert.match(source, /accDescr:/);
  }
});
