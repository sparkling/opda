import assert from 'node:assert/strict';
import test from 'node:test';

import {
  changedKindLexicalMatches,
  comparisonDimensions,
  lexicalMatches,
  sameKindLexicalMatches,
  v1Counts,
  v2Counts,
} from '../src/lib/model-comparison.mjs';
import {
  boundaryDiagram,
  completeModelDiagram,
  contextDiagram,
  contextDiagramProjection,
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
import { buildEstateAgencyMermaidDiagram } from '../src/lib/estate-agency-editorial-diagram.mjs';

test('V1 and V2 comparison uses the generated model projections', () => {
  assert.deepEqual(v1Counts, {
    resources: 321,
    classes: 41,
    objectProperties: 75,
    datatypeProperties: 205,
    shapes: 402,
    schemes: 48,
    concepts: 319,
    domainModules: 7,
    overlayProfiles: 31,
    exemplars: 17,
  });
  assert.deepEqual(v2Counts, {
    sourceItems: 451,
    resources: 159,
    classes: 53,
    objectProperties: 77,
    datatypeProperties: 29,
    shapes: 45,
    constraints: 100,
    schemes: 14,
    concepts: 85,
    topicConcepts: 413,
    semanticHomes: 8,
  });
});

test('comparison dimensions are complete, unique and evidence-linked', () => {
  assert.ok(comparisonDimensions.length >= 10);
  assert.equal(
    new Set(comparisonDimensions.map((dimension) => dimension.id)).size,
    comparisonDimensions.length,
  );
  for (const dimension of comparisonDimensions) {
    assert.match(dimension.id, /^[a-z0-9-]+$/);
    assert.ok(dimension.label);
    assert.ok(dimension.v1);
    assert.ok(dimension.v2);
    assert.ok(dimension.implication);
    assert.ok(dimension.evidence.length > 0);
    assert.ok(dimension.evidence.every((item) => item.label && item.href.startsWith('/')));
  }
});

test('lexical overlap is measured without asserting semantic equivalence', () => {
  assert.equal(lexicalMatches.length, 20);
  assert.equal(sameKindLexicalMatches.length, 16);
  assert.equal(changedKindLexicalMatches.length, 4);
  assert.deepEqual(
    changedKindLexicalMatches.map((item) => item.localName),
    ['applicationType', 'councilTaxBand', 'designationType', 'leaseTerm'],
  );
});

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
    const incidentForeignProperties = resources.filter((resource) =>
      resource.semantic_home !== context.id
      && resource.kind !== 'class'
      && (ownedIris.has(resource.domain) || ownedIris.has(resource.range))
    );
    const carriers = [...owned, ...incidentForeignProperties];
    const linkedNeighbours = new Set(carriers.flatMap((resource) => [
      resource.domain, resource.range, resource.subclass_of,
    ]).filter((iri) => iri && resourceByIri.has(iri)));
    const displayed = new Set([
      ...carriers.map((resource) => resource.iri),
      ...linkedNeighbours,
    ]);
    const clickRoutes = [...source.matchAll(/^  click term_\d+ "([^"]+)"$/gm)]
      .map((match) => match[1]);
    const expectedRoutes = resources
      .filter((resource) => displayed.has(resource.iri))
      .map(resourceRoute);
    assert.deepEqual(new Set(clickRoutes), new Set(expectedRoutes));
    assert.equal(clickRoutes.length, new Set(clickRoutes).size);
    assert.match(source, /accTitle:/);
    assert.match(source, /accDescr:.*incoming and outgoing properties/i);

    const nodeIds = [...source.matchAll(/^    (term_\d+)\["/gm)].map((match) => match[1]);
    assert.equal(nodeIds.length, new Set(nodeIds).size);
    const edges = [...source.matchAll(/^  (term_\d+)\s+(-->|-\.->)\|"(subclass of|domain|range)"\|\s+(term_\d+)$/gm)]
      .map((match) => match.slice(1).join('|'));
    assert.equal(edges.length, new Set(edges).size);
  }
});

function nodeIdForRoute(source, route) {
  const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return source.match(new RegExp(`^  click (term_\\d+) "${escapedRoute}"$`, 'm'))?.[1];
}

function nodeDefinition(source, nodeId) {
  return source.match(new RegExp(`^    ${nodeId}\\[".*$`, 'm'))?.[0] ?? '';
}

test('context diagrams show the same cross-boundary relationship from both semantic homes', () => {
  const property = resources.find((resource) => resource.key === 'common:Property');
  const relationship = resources.find((resource) => resource.key === 'conveyancing:hasRegisteredTitle');
  const title = resources.find((resource) => resource.key === 'conveyancing:RegisteredTitle');
  assert.ok(property && relationship && title);

  const common = contextDiagram('common');
  const commonPropertyId = nodeIdForRoute(common, resourceRoute(property));
  const commonRelationshipId = nodeIdForRoute(common, resourceRoute(relationship));
  const commonTitleId = nodeIdForRoute(common, resourceRoute(title));
  assert.ok(commonPropertyId && commonRelationshipId && commonTitleId);
  assert.match(nodeDefinition(common, commonPropertyId), /:::user$/);
  assert.match(nodeDefinition(common, commonRelationshipId), /Object property · Conveyancing<\/small>.*:::xsection$/);
  assert.match(nodeDefinition(common, commonTitleId), /Class · Conveyancing<\/small>.*:::xsection$/);
  assert.ok(common.includes(`  ${commonPropertyId} -.->|"domain"| ${commonRelationshipId}`));
  assert.ok(common.includes(`  ${commonRelationshipId} -.->|"range"| ${commonTitleId}`));

  const conveyancing = contextDiagram('conveyancing');
  const conveyancingPropertyId = nodeIdForRoute(conveyancing, resourceRoute(property));
  const conveyancingRelationshipId = nodeIdForRoute(conveyancing, resourceRoute(relationship));
  const conveyancingTitleId = nodeIdForRoute(conveyancing, resourceRoute(title));
  assert.ok(conveyancingPropertyId && conveyancingRelationshipId && conveyancingTitleId);
  assert.match(nodeDefinition(conveyancing, conveyancingPropertyId), /Class · Common boundary<\/small>.*:::xsection$/);
  assert.match(nodeDefinition(conveyancing, conveyancingRelationshipId), /:::process$/);
  assert.match(nodeDefinition(conveyancing, conveyancingTitleId), /:::user$/);
  assert.ok(conveyancing.includes(`  ${conveyancingPropertyId} -.->|"domain"| ${conveyancingRelationshipId}`));
  assert.ok(conveyancing.includes(`  ${conveyancingRelationshipId} -->|"range"| ${conveyancingTitleId}`));
});

test('standard references remain distinct from resources owned by another context', () => {
  const source = contextDiagram('conveyancing');
  assert.match(source, /\["xsd:string"\]:::external/);
  assert.doesNotMatch(source, /xsd:string.*:::xsection/);
  assert.match(source, /subgraph cross_context_refs\["Resources owned by other semantic homes"\]/);
  assert.match(source, /subgraph standard_refs\["Referenced standards"\]/);
});

test('estate-agency adapter preserves Mermaid/ELK geometry and validates all links', () => {
  const projection = contextDiagramProjection('estate-agency');
  const diagram = buildEstateAgencyMermaidDiagram(projection);
  const expectedLinks = Object.fromEntries(
    projection.displayedResources.map((resource, index) => [`term_${index}`, resourceRoute(resource)]),
  );

  assert.match(diagram.source, /^---\nconfig:\n  layout: elk\n---\nflowchart LR/mu);
  assert.doesNotMatch(diagram.source, /^\s*click\s+/gmu);
  assert.equal((diagram.source.match(/^    term_\d+\["/gmu) ?? []).length, 22);
  assert.equal((diagram.source.match(/^  term_\d+\s+(?:-->|-\.->)\|/gmu) ?? []).length, 25);
  assert.deepEqual(diagram.links, expectedLinks);
  assert.equal(new Set(Object.values(diagram.links)).size, 19);
  assert.equal(diagram.provenance.mode, 'preserve-renderer-layout');
  assert.match(diagram.provenance.layoutAuthority, /Mermaid 11\.16\.0.*layout-elk 0\.2\.2/u);
  assert.equal(diagram.provenance.styleAuthority, 'Diagram Design OPDA profile');
  assert.equal(diagram.receipt.integration.runtimeSourceSha256, diagram.runtimeSourceSha256);
  assert.equal(diagram.receipt.integration.projectionSha256, diagram.projectionSha256);
  assert.equal(diagram.receipt.layout.acceptedForWebsite, false);
});

test('estate-agency Mermaid adapter fails closed on candidate drift', () => {
  const projection = contextDiagramProjection('estate-agency');
  const removed = {
    ...projection,
    displayedResources: projection.displayedResources.slice(1),
  };
  assert.throws(
    () => buildEstateAgencyMermaidDiagram(removed),
    /estate-agency-diagram:projection-hash/u,
  );

  const added = {
    ...projection,
    displayedResources: [...projection.displayedResources, {
      iri: 'https://example.invalid/Unexpected',
      key: 'estate-agency:Unexpected',
      label: 'unexpected',
      local_name: 'Unexpected',
      semantic_home: 'estate-agency',
      kind: 'class',
    }],
  };
  assert.throws(
    () => buildEstateAgencyMermaidDiagram(added),
    /estate-agency-diagram:projection-hash/u,
  );

  const changedRange = {
    ...projection,
    displayedResources: projection.displayedResources.map((resource) => (
      resource.key === 'estate-agency:rentAmount' ? { ...resource, range: '' } : resource
    )),
  };
  assert.throws(
    () => buildEstateAgencyMermaidDiagram(changedRange),
    /estate-agency-diagram:projection-hash/u,
  );

  const changedKind = {
    ...projection,
    displayedResources: projection.displayedResources.map((resource) => (
      resource.key === 'estate-agency:rentAmount'
        ? { ...resource, kind: 'object-property' }
        : resource
    )),
  };
  assert.throws(
    () => buildEstateAgencyMermaidDiagram(changedKind),
    /estate-agency-diagram:projection-hash/u,
  );
});
