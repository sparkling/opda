import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  changedKindLexicalMatches,
  comparisonDimensions,
  lexicalMatches,
  sameKindLexicalMatches,
  schemaDerivedCounts,
  propertyPackCounts,
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
  diagramCounts,
  resourceRoute,
  resourceByIri,
  resources,
  shapeRoute,
  shapes,
  vocabularies,
  vocabularyRoute,
  workPackageDiagram,
  workPackageDiagramProjection,
  workPackageRoute,
  workPackages,
} from '../src/lib/property-pack-model.mjs';
import {
  DEFAULT_MERMAID_PROPERTY_LAYERS,
  filterMermaidPropertyLayers,
  mermaidPropertyLayerCapabilities,
} from '../src/lib/mermaid-property-layers.mjs';

test('Property Pack review lists use the shared prose rhythm and an in-measure marker', async () => {
  const [page, styles] = await Promise.all([
    readFile(new URL('../src/pages/development/property-pack/coverage.astro', import.meta.url), 'utf8'),
    readFile(new URL('../src/styles/property-pack.css', import.meta.url), 'utf8'),
  ]);
  assert.match(page, /<ul class="v2-review-list">/u);
  assert.match(styles, /\.prose > \.v2-review-list\s*\{[^}]*margin-block:\s*var\(--space-5\)[^}]*padding-inline-start:\s*calc\(var\(--space-7\) \+ var\(--space-5\)\)/su);
});

test('complete trace register is server-rendered before interactive enhancement', async () => {
  const page = await readFile(new URL('../src/pages/development/property-pack/coverage.astro', import.meta.url), 'utf8');
  assert.doesNotMatch(page, /<details>/u);
  assert.match(page, /id="property-pack-trace-register"/u);
  assert.match(page, /data-static-trace-register/u);
  assert.match(page, /coverage\.map\(\(item\) => <tr>/u);
  assert.match(page, /item\.semantic_home/u);
  assert.match(page, /OPDA\.DataBrowser\.mount/u);
  assert.match(page, /pageSize:\s*25/u);
  assert.match(page, /searchKeys:\s*\['label', 'sourceId', 'semanticHome', 'workPackage', 'disposition'\]/u);
});

test('PDTF schema and Property Pack comparison uses generated model projections', () => {
  assert.deepEqual(schemaDerivedCounts, {
    resources: 321,
    classes: 41,
    objectProperties: 75,
    datatypeProperties: 205,
    shapes: 402,
    constraints: 66,
    schemes: 48,
    concepts: 319,
    domainModules: 7,
    overlayProfiles: 31,
    exemplars: 17,
  });
  assert.deepEqual(propertyPackCounts, {
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
    assert.ok(dimension.schemaDerived);
    assert.ok(dimension.propertyPack);
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

test('lineage name-match views explain their limited evidence', async () => {
  const page = await readFile(new URL('../src/pages/development/property-pack/pdtf-schema-lineage.astro', import.meta.url), 'utf8');
  assert.match(page, /mechanical identifier check/u);
  assert.match(page, /does\s*<strong>not<\/strong> establish/u);
  assert.match(page, /reclassification questions/u);
  assert.match(page, /Property Pack candidate<\/span>/u);
  assert.equal((page.match(/class="v2-name-matrix__name"/gu) ?? []).length, 2);
  assert.match(page, /kindLabel\(item\.schemaDerivedKind\)/u);
});

test('semantic-home count pills retain their complete information text', async () => {
  const page = await readFile(new URL('../src/pages/development/property-pack/definition-and-scope.astro', import.meta.url), 'utf8');
  assert.match(page, /<p\s+class="pill pill--info context-card__count"/u);
  assert.match(page, /source data point\$\{context\.source_item_count === 1 \? '' : 's'\}/u);
  assert.doesNotMatch(page, /<span class="pill pill--info context-card__count"/u);
});

test('candidate artefacts are a six-link desktop grid', async () => {
  const page = await readFile(new URL('../src/pages/development/property-pack/definition-and-scope.astro', import.meta.url), 'utf8');
  const styles = await readFile(new URL('../src/styles/property-pack.css', import.meta.url), 'utf8');
  assert.match(page, /class="v2-card-grid v2-card-grid--artefacts"/u);
  assert.equal((page.match(/Open artefact/g) ?? []).length, 6);
  assert.match(styles, /\.v2-card-grid--artefacts\s*\{\s*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/su);
});

test('Property Pack documentation model has exact candidate coverage', () => {
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
  assert.ok(resourceRoutes.every((route) => /^\/development\/property-pack\/resources\/[a-z-]+\/[A-Za-z0-9_-]+$/.test(route)));
  assert.ok(sourceRoutes.every((route) => /^\/development\/property-pack\/data-dictionary\/pp-[0-9a-f]{12}$/.test(route)));
  assert.ok(shapeRoutes.every((route) => /^\/development\/property-pack\/shapes\/[a-z-]+\/[A-Za-z0-9_-]+$/.test(route)));
  assert.ok(schemeRoutes.every((route) => /^\/development\/property-pack\/vocabularies\/[a-z-]+\/[A-Za-z0-9_-]+$/.test(route)));
  const generatedRoutes = [...resourceRoutes, ...sourceRoutes, ...schemeRoutes, ...shapeRoutes];
  assert.equal(new Set(generatedRoutes).size, 669);
  assert.equal(new Set(generatedRoutes.map((route) => route.toLocaleLowerCase())).size, 669);
  assert.ok(generatedRoutes.every((route) => !route.startsWith('/v2') && route !== '/modelling/property-pack'));
});

test('work packages are source-catalogue views with class-only model diagrams', async () => {
  assert.deepEqual(workPackages.map((item) => [item.id, item.items.length]), [
    ['construction-services-energy', 74], ['evidence-declarations', 13],
    ['fixtures-fittings', 109], ['property-identity-address', 3],
    ['rights-restrictions-boundaries', 24], ['searches-notices-environment', 166],
    ['titles-ownership', 51], ['transaction-occupiers-completion', 11],
  ]);
  assert.equal(new Set(workPackages.map((item) => workPackageRoute(item.id))).size, workPackages.length);
  for (const workPackage of workPackages) {
    const source = workPackageDiagram(workPackage.id);
    const projection = workPackageDiagramProjection(workPackage.id);
    assert.match(source, /^---\nconfig:\n  layout: elk\n---\nflowchart LR/m);
    assert.doesNotMatch(source, /\|"(?:domain|range)"\|/);
    assert.equal((source.match(/^  click term_\d+ /gm) ?? []).length, projection.displayedResources.length);
    assert.equal((source.match(/^  term_\d+ -\.->\|"/gm) ?? []).length, projection.boundaryProperties.length);
    assert.equal(projection.boundaryProperties.length,
      projection.incomingProperties.length + projection.outgoingProperties.length);
    const reached = new Set(projection.reachedClasses.map((resource) => resource.iri));
    const attached = new Set(projection.attachedClasses.map((resource) => resource.iri));
    assert.ok(projection.incomingProperties.every((property) =>
      !reached.has(property.domain) && reached.has(property.range) && attached.has(property.domain)));
    assert.ok(projection.outgoingProperties.every((property) =>
      reached.has(property.domain) && !reached.has(property.range) && attached.has(property.range)));
    for (const property of projection.boundaryProperties) {
      assert.ok(source.includes(`-.->|"${property.label}"|`));
    }
  }
  const index = await readFile(new URL('../src/pages/development/property-pack/work-packages/index.astro', import.meta.url), 'utf8');
  const detail = await readFile(new URL('../src/pages/development/property-pack/work-packages/[workPackage].astro', import.meta.url), 'utf8');
  assert.match(index, /not a semantic home, ontology module or working-group decision/u);
  assert.match(detail, /Dotted lines show incoming and outgoing properties/u);
  assert.match(detail, /variant="work-package"/u);
  assert.match(detail, /graph\.incomingProperties\.length/u);
  assert.match(detail, /graph\.outgoingProperties\.length/u);
});

test('complete Mermaid uses explicit, independently filterable property layers', () => {
  const authored = completeModelDiagram();
  const source = filterMermaidPropertyLayers(authored, DEFAULT_MERMAID_PROPERTY_LAYERS);
  const withDatatypes = filterMermaidPropertyLayers(authored, {
    datatype: true, object: true, inheritance: true,
  });
  assert.match(source, /^---\nconfig:\n  layout: elk\n---\nflowchart LR/m);
  assert.match(source, /accTitle: Complete Property Pack candidate model/);
  assert.match(source, /accDescr:/);
  assert.doesNotMatch(source, /\\n/);
  assert.deepEqual(diagramCounts, {
    classNodes: 53,
    objectPropertyEdges: 30,
    subclassEdges: 23,
    datatypeProperties: 29,
    omittedCodedOrExternalProperties: 41,
    omittedDomainlessObjectProperties: 6,
  });

  const classes = resources.filter((resource) => resource.kind === 'class');
  const properties = resources.filter((resource) =>
    resource.kind === 'object-property'
    && resourceByIri.get(resource.domain)?.kind === 'class'
    && resourceByIri.get(resource.range)?.kind === 'class'
  );
  const edges = [...source.matchAll(/^  (term_\d+)\s+(-->|-\.->)\|"([^"]+)"\|\s+(term_\d+)$/gm)];
  const objectLabels = edges.filter((edge) => edge[3] !== 'isA').map((edge) => edge[3]).sort();
  const subclassEdges = edges.filter((edge) => edge[3] === 'isA');

  assert.equal((source.match(/^    term_\d+\["/gm) ?? []).length, 53);
  assert.equal((source.match(/^  click term_\d+ /gm) ?? []).length, 53);
  assert.deepEqual(objectLabels, properties.map((property) => property.label).sort());
  assert.equal(subclassEdges.length, 23);
  assert.equal((withDatatypes.match(/class=['"]gd-datatype-property['"]/gu) ?? []).length, 29);
  assert.doesNotMatch(source, /class=['"]gd-datatype-property['"]/u);
  assert.deepEqual(mermaidPropertyLayerCapabilities(authored), {
    enabled: true, datatype: true, object: true, inheritance: true,
  });
  assert.doesNotMatch(source, /\|"(?:domain|range)"\|/);
  assert.doesNotMatch(source, /xsd:|skos:Concept|dcterms:PhysicalResource/);
  for (const resource of classes) assert.ok(source.includes(`"${resourceRoute(resource)}"`));
  for (const resource of resources.filter((resource) => resource.kind !== 'class')) {
    assert.ok(!source.includes(`"${resourceRoute(resource)}"`));
  }
});

test('context diagrams and boundary map preserve semantic-home distinctions', () => {
  const boundary = boundaryDiagram();
  assert.equal((boundary.match(/supplies shared elements/g) ?? []).length, 7);
  assert.equal((boundary.match(/ctx_common -->\|"supplies shared elements"\| ctx_/g) ?? []).length, 7);
  assert.doesNotMatch(boundary, /interoperates through/u);
  assert.match(boundary, /do not represent cross-context mapping/u);
  assert.match(boundary, /Cross-sector scheme context/);
  assert.match(boundary, /Common boundary/);
  for (const context of contexts) {
    const authored = contextDiagram(context.id);
    const source = filterMermaidPropertyLayers(authored, DEFAULT_MERMAID_PROPERTY_LAYERS);
    const projection = contextDiagramProjection(context.id);
    assert.deepEqual(mermaidPropertyLayerCapabilities(authored), {
      enabled: true, datatype: projection.datatypeProperties.length > 0,
      object: projection.relationshipProperties.length > 0,
      inheritance: projection.subclassSources.length > 0,
    });
    const clickRoutes = [...source.matchAll(/^  click term_\d+ "([^"]+)"$/gm)]
      .map((match) => match[1]);
    const expectedRoutes = projection.displayedResources.map(resourceRoute);
    assert.deepEqual(new Set(clickRoutes), new Set(expectedRoutes));
    assert.equal(clickRoutes.length, new Set(clickRoutes).size);
    assert.match(source, /accTitle:/);
    assert.match(source, /accDescr:.*class-to-class object properties/i);
    assert.doesNotMatch(source, /\|"(?:domain|range)"\|/);
    assert.doesNotMatch(source, /xsd:|skos:Concept|dcterms:PhysicalResource/);

    const nodeIds = [...source.matchAll(/^    (term_\d+)\["/gm)].map((match) => match[1]);
    assert.equal(nodeIds.length, new Set(nodeIds).size);
    assert.equal(nodeIds.length, projection.displayedResources.length);
    const edges = [...source.matchAll(/^  (term_\d+)\s+(-->|-\.->)\|"([^"]+)"\|\s+(term_\d+)$/gm)];
    const objectLabels = edges.filter((edge) => edge[3] !== 'isA').map((edge) => edge[3]).sort();
    assert.deepEqual(objectLabels, projection.relationshipProperties.map((property) => property.label).sort());
    assert.equal(edges.filter((edge) => edge[3] === 'isA').length, projection.subclassSources.length);
  }
});

test('contextual-boundary register uses linked cards without losing table fields', async () => {
  const page = await readFile(new URL('../src/pages/development/property-pack/contexts/index.astro', import.meta.url), 'utf8');
  assert.match(page, /<h2 id="homes">Contextual-boundary register<\/h2>/u);
  assert.match(page, /class="v2-card v2-context-card"/u);
  for (const field of ['OWL resources', 'Source data points', 'Shapes']) assert.match(page, new RegExp(field, 'u'));
  assert.match(page, /contextKindLabels\[context\.kind\]/u);
  assert.match(page, /context\.definition/u);
  assert.match(page, /<h3>\{title\}<code class="standalone-identifier">\{context\.id\}<\/code><\/h3>/u);
  for (const label of ['Semantic home', 'Kind', 'Definition']) {
    assert.match(page, new RegExp(`<p class="v2-context-card__field-label">${label}<\\/p>`, 'u'));
  }
  assert.match(page, /<p class="pill pill--info">\{contextKindLabels\[context\.kind\]\}<\/p>/u);
  assert.doesNotMatch(page, /<table>/u);
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
  assert.ok(commonPropertyId && commonTitleId);
  assert.equal(commonRelationshipId, undefined);
  assert.match(nodeDefinition(common, commonPropertyId), /:::user$/);
  assert.match(nodeDefinition(common, commonTitleId), /Class · Conveyancing<\/small>.*:::xsection$/);
  assert.ok(common.includes(`  ${commonPropertyId} -.->|"has registered title"| ${commonTitleId}`));

  const conveyancing = contextDiagram('conveyancing');
  const conveyancingPropertyId = nodeIdForRoute(conveyancing, resourceRoute(property));
  const conveyancingRelationshipId = nodeIdForRoute(conveyancing, resourceRoute(relationship));
  const conveyancingTitleId = nodeIdForRoute(conveyancing, resourceRoute(title));
  assert.ok(conveyancingPropertyId && conveyancingTitleId);
  assert.equal(conveyancingRelationshipId, undefined);
  assert.match(nodeDefinition(conveyancing, conveyancingPropertyId), /Class · Common boundary<\/small>.*:::xsection$/);
  assert.match(nodeDefinition(conveyancing, conveyancingTitleId), /:::user$/);
  assert.ok(conveyancing.includes(`  ${conveyancingPropertyId} -.->|"has registered title"| ${conveyancingTitleId}`));
});

test('attribute-like and external value targets are omitted from class topology', () => {
  const source = filterMermaidPropertyLayers(
    contextDiagram('conveyancing'), DEFAULT_MERMAID_PROPERTY_LAYERS,
  );
  assert.doesNotMatch(source, /xsd:string|skos:Concept|dcterms:PhysicalResource/);
  assert.doesNotMatch(source, /Datatype property|Object property/);
  assert.match(source, /subgraph cross_context_refs\["Classes owned by other semantic homes"\]/);
  assert.doesNotMatch(source, /subgraph standard_refs/);
});
