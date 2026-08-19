/**
 * Build-time view model for the renewed Property Pack ontology candidate.
 *
 * This module reads only the isolated candidate corpus. It deliberately never
 * imports the current published ontology, Fuseki data, or legacy JSON-schema
 * model. Astro pages and tests share these joins so labels, routes, counts and
 * Mermaid diagrams cannot drift independently.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

export const CANDIDATE_ROOT = path.resolve(
  process.cwd(), 'source/03-standards/ontology-candidates/property-pack/0.1',
);
export const PROPERTY_PACK_ROUTE = '/spdtf-2/property-pack';

function readJson(relative) {
  return JSON.parse(readFileSync(path.join(CANDIDATE_ROOT, relative), 'utf8'));
}

export const candidateManifest = readJson('candidate-manifest.json');
export const candidateSummary = readJson('candidate-summary.json');
export const contextMap = readJson('projections/context-map.json');
export const resources = readJson('projections/resource-register.json');
export const coverage = readJson('projections/coverage.json');
export const dictionary = readJson('projections/data-dictionary.json');
export const vocabularies = readJson('projections/controlled-vocabularies.json');
export const shapes = readJson('projections/shapes.json');
export const standardsProfile = readJson('standards-profile.json');
export const validationReport = readJson('validation/report.json');

export const propertyPackLifecycleStatus = Object.freeze({
  sourceDefinition: '451 required Property Pack items — source scope validated',
  ontologyCandidate: `${candidateManifest.candidate_version} — machine-proposed and non-normative`,
  technicalDetermination: 'Pending — milestone: end of September 2026',
  laterDomainReview: 'Pending — follows the Technical Working Group determination',
  implementationRelease: 'Not released or adopted as SPDTF 2.0',
  externalAuthority: 'No government approval or delegated authority recorded',
});

const contextRank = new Map([
  ['common', 0], ['conveyancing', 1], ['estate-agency', 2],
  ['finance-and-banking', 3], ['property-data-services', 4],
  ['property-technology', 5], ['surveying-and-valuation', 6],
  ['dbt-smart-data', 7],
]);

export const contexts = [...contextMap.contexts].sort((a, b) =>
  (contextRank.get(a.id) ?? 99) - (contextRank.get(b.id) ?? 99)
);
export const resourceByKey = new Map(resources.map((resource) => [resource.key, resource]));
export const resourceByIri = new Map(resources.map((resource) => [resource.iri, resource]));
export const coverageById = new Map(coverage.map((item) => [item.item_id, item]));
export const dictionaryById = new Map(dictionary.map((item) => [item.item_id, item]));
export const contextById = new Map(contexts.map((context) => [context.id, context]));
export const vocabularyByKey = new Map(vocabularies.map((scheme) => [scheme.key, scheme]));
export const vocabularyByIri = new Map(vocabularies.map((scheme) => [scheme.iri, scheme]));

export const resourcesByContext = new Map(contexts.map((context) => [
  context.id, resources.filter((resource) => resource.semantic_home === context.id),
]));
export const shapesByContext = new Map(contexts.map((context) => [
  context.id, shapes.filter((shape) => shape.semantic_home === context.id),
]));
export const vocabulariesByContext = new Map(contexts.map((context) => [
  context.id, vocabularies.filter((scheme) => scheme.semantic_home === context.id),
]));

export const kindLabels = {
  class: 'Class',
  'object-property': 'Object property',
  'datatype-property': 'Datatype property',
};

export const contextKindLabels = {
  'common-boundary': 'Common boundary',
  'bounded-context': 'Bounded context',
  'scheme-context': 'Cross-sector scheme context',
};

export function localName(key) {
  return key.split(':', 2)[1];
}

export function resourceRoute(resource) {
  return `${PROPERTY_PACK_ROUTE}/resources/${resource.semantic_home}/${localName(resource.key)}`;
}

export function contextRoute(context) {
  return `${PROPERTY_PACK_ROUTE}/contexts/${context.id}`;
}

export function dataPointRoute(item) {
  return `${PROPERTY_PACK_ROUTE}/data-dictionary/${item.item_id}`;
}

export function vocabularyRoute(scheme) {
  return `${PROPERTY_PACK_ROUTE}/vocabularies/${scheme.semantic_home}/${localName(scheme.key)}`;
}

export function shapeRoute(shape) {
  return `${PROPERTY_PACK_ROUTE}/shapes/${shape.semantic_home}/${localName(shape.target_key)}`;
}

const standardPrefixes = new Map([
  ['http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'rdf:'],
  ['http://www.w3.org/2000/01/rdf-schema#', 'rdfs:'],
  ['http://www.w3.org/2001/XMLSchema#', 'xsd:'],
  ['http://www.w3.org/2002/07/owl#', 'owl:'],
  ['http://www.w3.org/2004/02/skos/core#', 'skos:'],
  ['http://purl.org/dc/terms/', 'dcterms:'],
  ['http://www.w3.org/ns/prov#', 'prov:'],
]);

export function compactIri(iri) {
  if (!iri) return '';
  const local = resourceByIri.get(iri);
  if (local) return local.key;
  for (const [base, prefix] of standardPrefixes) {
    if (iri.startsWith(base)) return prefix + iri.slice(base.length);
  }
  return iri;
}

export function cardinality(property) {
  const min = property.min_count;
  const max = property.max_count;
  if (min == null && max == null) return 'Not constrained';
  return `${min ?? 0}..${max ?? '*'}`;
}

export const counts = Object.freeze({
  sourceItems: coverage.length,
  resources: resources.length,
  classes: resources.filter((item) => item.kind === 'class').length,
  objectProperties: resources.filter((item) => item.kind === 'object-property').length,
  datatypeProperties: resources.filter((item) => item.kind === 'datatype-property').length,
  schemes: vocabularies.length,
  concepts: vocabularies.reduce((sum, scheme) => sum + scheme.concepts.length, 0),
  topicConcepts: coverage.filter((item) => item.topic_iri).length,
  shapes: shapes.length,
  constraints: shapes.reduce((sum, shape) => sum + shape.properties.length, 0),
  subclassEdges: resources.filter((item) => item.subclass_of).length,
  domainEdges: resources.filter((item) => item.domain).length,
  rangeEdges: resources.filter((item) => item.range).length,
});

export function contextStats(contextId) {
  const owned = resourcesByContext.get(contextId) ?? [];
  const ownedShapes = shapesByContext.get(contextId) ?? [];
  const ownedSchemes = vocabulariesByContext.get(contextId) ?? [];
  return {
    resources: owned.length,
    classes: owned.filter((item) => item.kind === 'class').length,
    objectProperties: owned.filter((item) => item.kind === 'object-property').length,
    datatypeProperties: owned.filter((item) => item.kind === 'datatype-property').length,
    shapes: ownedShapes.length,
    constraints: ownedShapes.reduce((sum, shape) => sum + shape.properties.length, 0),
    schemes: ownedSchemes.length,
    concepts: ownedSchemes.reduce((sum, scheme) => sum + scheme.concepts.length, 0),
    sourceItems: contextById.get(contextId)?.source_item_count ?? 0,
    topicConcepts: coverage.filter((item) => item.semantic_home === contextId && item.topic_iri).length,
  };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function wrapLabel(value, width = 26) {
  const words = String(value).trim().split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    if (line && `${line} ${word}`.length > width) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines.map(escapeHtml).join('<br/>');
}

function diagramPreamble(title, description, direction = 'LR') {
  return [
    '---', 'config:', '  layout: elk', '---', `flowchart ${direction}`,
    `  accTitle: ${title}`, `  accDescr: ${description}`, '',
  ];
}

function diagramNodeId(index) {
  return `term_${index}`;
}

function externalReferences(selected) {
  const selectedIris = new Set(selected.map((resource) => resource.iri));
  const references = new Set();
  for (const resource of selected) {
    for (const iri of [resource.domain, resource.range, resource.subclass_of]) {
      if (iri && !selectedIris.has(iri)) references.add(iri);
    }
  }
  return [...references].sort();
}

function addTermNodes(lines, selected, nodeIds, activeContextId = '') {
  for (const resource of selected) {
    const foreign = activeContextId && resource.semantic_home !== activeContextId;
    const className = foreign ? 'xsection' : resource.kind === 'class'
      ? 'user' : resource.kind === 'object-property' ? 'process' : 'infra';
    const kind = kindLabels[resource.kind];
    const home = contextById.get(resource.semantic_home)?.label ?? resource.semantic_home;
    const detail = foreign ? `${kind} · ${escapeHtml(home)}` : kind;
    lines.push(`    ${nodeIds.get(resource.iri)}["${wrapLabel(resource.label)}<br/><small>${detail}</small>"]:::${className}`);
  }
}

function addExternalNodes(lines, external, nodeIds) {
  if (!external.length) return;
  lines.push('  subgraph external_refs["Referenced standards or neighbouring contexts"]');
  for (const iri of external) {
    const resource = resourceByIri.get(iri);
    const label = resource ? `${resource.label} · ${resource.semantic_home}` : compactIri(iri);
    lines.push(`    ${nodeIds.get(iri)}["${wrapLabel(label)}"]:::external`);
  }
  lines.push('  end', '');
}

function addStructuralEdges(lines, selected, nodeIds, activeContextId = '') {
  const selectedIris = new Set(selected.map((resource) => resource.iri));
  const arrow = (fromIri, toIri) => {
    if (!activeContextId) return '-->';
    const from = resourceByIri.get(fromIri);
    const to = resourceByIri.get(toIri);
    return [from, to].some((item) => item && item.semantic_home !== activeContextId)
      ? '-.->' : '-->';
  };
  for (const resource of selected) {
    const source = nodeIds.get(resource.iri);
    if (resource.subclass_of && nodeIds.has(resource.subclass_of)) {
      lines.push(`  ${source} ${arrow(resource.iri, resource.subclass_of)}|"subclass of"| ${nodeIds.get(resource.subclass_of)}`);
    }
    if (resource.kind === 'class') continue;
    if (resource.domain && nodeIds.has(resource.domain)) {
      lines.push(`  ${nodeIds.get(resource.domain)} ${arrow(resource.domain, resource.iri)}|"domain"| ${source}`);
    }
    if (resource.range && nodeIds.has(resource.range)) {
      lines.push(`  ${source} ${arrow(resource.iri, resource.range)}|"range"| ${nodeIds.get(resource.range)}`);
    }
    // A local property can reference another local resource not selected only
    // when a caller requests an invalid subset; fail visibly during generation.
    for (const iri of [resource.domain, resource.range, resource.subclass_of]) {
      if (iri && selectedIris.has(iri) && !nodeIds.has(iri)) {
        throw new Error(`diagram reference is missing: ${iri}`);
      }
    }
  }
}

function addClicks(lines, selected, external, nodeIds) {
  lines.push('');
  for (const resource of selected) {
    lines.push(`  click ${nodeIds.get(resource.iri)} "${resourceRoute(resource)}"`);
  }
  for (const iri of external) {
    const resource = resourceByIri.get(iri);
    if (resource) lines.push(`  click ${nodeIds.get(iri)} "${resourceRoute(resource)}"`);
  }
}

export function boundaryDiagram() {
  const lines = diagramPreamble(
    'Candidate contextual boundaries',
    'Seven declared contexts interoperate through a deliberately small common boundary. The lines are architectural connections, not reviewed cross-domain mappings or control relationships.',
  );
  for (const context of contexts) {
    const style = context.kind === 'common-boundary'
      ? 'security' : context.kind === 'scheme-context' ? 'external' : 'user';
    lines.push(`  ctx_${context.id.replaceAll('-', '_')}["${wrapLabel(context.label)}<br/><small>${escapeHtml(contextKindLabels[context.kind])}</small>"]:::${style}`);
  }
  lines.push('');
  for (const connection of contextMap.connections) {
    const from = connection.from.replaceAll('-', '_');
    const to = connection.to.replaceAll('-', '_');
    lines.push(`  ctx_${from} -.->|"interoperates through"| ctx_${to}`);
  }
  lines.push('');
  for (const context of contexts) {
    lines.push(`  click ctx_${context.id.replaceAll('-', '_')} "${contextRoute(context)}"`);
  }
  return lines.join('\n');
}

export function completeModelDiagram() {
  const selected = [...resources];
  const external = externalReferences(selected);
  const allIris = [...selected.map((resource) => resource.iri), ...external];
  const nodeIds = new Map(allIris.map((iri, index) => [iri, diagramNodeId(index)]));
  const lines = diagramPreamble(
    'Complete Property Pack candidate model',
    'All 159 candidate OWL resources are grouped by their single semantic home. The graph also shows asserted subclass, domain and range links plus eight referenced standard terms. Source rows, SKOS instances and generator metadata are not nodes.',
  );
  for (const context of contexts) {
    const selectedContext = selected.filter((resource) => resource.semantic_home === context.id);
    lines.push(`  subgraph context_${context.id.replaceAll('-', '_')}["${escapeHtml(context.label)}"]`);
    addTermNodes(lines, selectedContext, nodeIds);
    lines.push('  end', '');
  }
  addExternalNodes(lines, external, nodeIds);
  addStructuralEdges(lines, selected, nodeIds);
  addClicks(lines, selected, external, nodeIds);
  return lines.join('\n');
}

export function contextDiagramProjection(contextId) {
  const context = contextById.get(contextId);
  if (!context) throw new Error(`unknown context: ${contextId}`);
  const owned = resourcesByContext.get(contextId) ?? [];
  const ownedIris = new Set(owned.map((resource) => resource.iri));
  const incidentForeignProperties = resources.filter((resource) =>
    resource.semantic_home !== contextId
    && resource.kind !== 'class'
    && (ownedIris.has(resource.domain) || ownedIris.has(resource.range))
  );
  const carriers = [...owned, ...incidentForeignProperties];
  const references = externalReferences(carriers);
  const displayedIris = new Set([
    ...carriers.map((resource) => resource.iri),
    ...references.filter((iri) => resourceByIri.has(iri)),
  ]);
  const displayedResources = resources.filter((resource) => displayedIris.has(resource.iri));
  const foreignResources = displayedResources.filter((resource) => resource.semantic_home !== contextId);
  const standardIris = references.filter((iri) => !resourceByIri.has(iri));
  return {
    context,
    owned,
    carriers,
    displayedResources,
    foreignResources,
    standardIris,
    displayedNodeCount: displayedResources.length + standardIris.length,
  };
}

export function contextDiagram(contextId) {
  const projection = contextDiagramProjection(contextId);
  const { context, owned, carriers, displayedResources, foreignResources, standardIris } = projection;
  const allIris = [...displayedResources.map((resource) => resource.iri), ...standardIris];
  const nodeIds = new Map(allIris.map((iri, index) => [iri, diagramNodeId(index)]));
  const lines = diagramPreamble(
    `${context.label} candidate model`,
    `All ${owned.length} resources whose single semantic home is ${context.label}, plus one-hop incoming and outgoing properties and their attached resources. Resources from different semantic homes and their asserted cross-boundary links are dotted; referenced standard terms are shown separately.`,
  );
  lines.push(`  subgraph local_context["${escapeHtml(context.label)} · semantic home"]`);
  addTermNodes(lines, owned, nodeIds, contextId);
  lines.push('  end', '');
  if (foreignResources.length) {
    lines.push('  subgraph cross_context_refs["Resources owned by other semantic homes"]');
    addTermNodes(lines, foreignResources, nodeIds, contextId);
    lines.push('  end', '');
  }
  if (standardIris.length) {
    lines.push('  subgraph standard_refs["Referenced standards"]');
    for (const iri of standardIris) {
      lines.push(`    ${nodeIds.get(iri)}["${wrapLabel(compactIri(iri))}"]:::external`);
    }
    lines.push('  end', '');
  }
  addStructuralEdges(lines, carriers, nodeIds, contextId);
  addClicks(lines, displayedResources, [], nodeIds);
  return lines.join('\n');
}

export function structuralRows(selected = resources) {
  const rows = [];
  for (const resource of selected) {
    if (resource.subclass_of) {
      rows.push({
        source: resource, relationship: 'subclass of', target: resourceByIri.get(resource.subclass_of),
        targetIri: resource.subclass_of, edgeKind: 'subclass',
      });
    }
    if (resource.kind !== 'class') {
      rows.push({
        source: resource.domain ? resourceByIri.get(resource.domain) : undefined,
        sourceIri: resource.domain, relationship: resource,
        target: resource.range ? resourceByIri.get(resource.range) : undefined,
        targetIri: resource.range, edgeKind: resource.kind,
      });
    }
  }
  return rows;
}

export function resourceShapes(resource) {
  return shapes.filter((shape) =>
    shape.target_class === resource.iri || shape.properties.some((property) => property.path_iri === resource.iri)
  );
}

export function resourceSchemes(resource) {
  const sourceIds = new Set(resource.source_item_ids);
  return vocabularies.filter((scheme) => scheme.source_item_ids.some((id) => sourceIds.has(id)));
}

export function generatedFilesForContext(contextId, family) {
  const prefix = family === 'ontology' ? `ontology/${contextId}`
    : family === 'shapes' ? `shapes/${contextId}.ttl`
      : `vocabularies/${contextId}`;
  return candidateManifest.files
    .map((file) => file.path)
    .filter((file) => family === 'ontology' ? file.startsWith(prefix) : file.startsWith(prefix));
}
