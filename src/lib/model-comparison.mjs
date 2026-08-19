/**
 * Evidence-backed comparison view model for the current ontology and Property Pack.
 *
 * This is deliberately separate from `property-pack-model.mjs`: the candidate module must
 * remain isolated from the current corpus, while this report is explicitly a
 * cross-corpus analytical view.
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { contexts, counts as candidateCounts, resources as candidateResources } from './property-pack-model.mjs';

const ROOT = process.cwd();
const CURRENT_MODEL = path.resolve(ROOT, 'src/data/ontology-model.json');
const CURRENT_ONTOLOGY = path.resolve(ROOT, 'source/03-standards/ontology');

function readJson(file) {
  const value = JSON.parse(readFileSync(file, 'utf8'));
  if (!value || typeof value !== 'object') throw new TypeError(`Expected an object in ${file}`);
  return value;
}

function countTurtleFiles(relative, predicate = () => true) {
  return readdirSync(path.join(CURRENT_ONTOLOGY, relative))
    .filter((name) => name.endsWith('.ttl') && predicate(name)).length;
}

function requiredCount(source, key) {
  const value = source[key];
  if (!Number.isInteger(value) || value < 0) throw new TypeError(`Invalid model count: ${key}`);
  return value;
}

const currentModel = readJson(CURRENT_MODEL);
const current = currentModel.counts;
const currentContextIds = Object.keys(currentModel.contexts);
const domainModules = currentContextIds.filter((id) => id !== 'annotations');

export const v1Counts = Object.freeze({
  resources:
    requiredCount(current, 'classes')
    + requiredCount(current, 'objectProperties')
    + requiredCount(current, 'datatypeProperties'),
  classes: requiredCount(current, 'classes'),
  objectProperties: requiredCount(current, 'objectProperties'),
  datatypeProperties: requiredCount(current, 'datatypeProperties'),
  shapes: requiredCount(current, 'shapes'),
  schemes: requiredCount(current, 'schemes'),
  concepts: requiredCount(current, 'concepts'),
  domainModules: domainModules.length,
  overlayProfiles: countTurtleFiles('profiles'),
  exemplars: countTurtleFiles('exemplars', (name) => !name.includes('expected-report')),
});

export const v2Counts = Object.freeze({
  sourceItems: candidateCounts.sourceItems,
  resources: candidateCounts.resources,
  classes: candidateCounts.classes,
  objectProperties: candidateCounts.objectProperties,
  datatypeProperties: candidateCounts.datatypeProperties,
  shapes: candidateCounts.shapes,
  constraints: candidateCounts.constraints,
  schemes: candidateCounts.schemes,
  concepts: candidateCounts.concepts,
  topicConcepts: candidateCounts.topicConcepts,
  semanticHomes: contexts.length,
});

const currentKinds = new Map([
  ...Object.values(currentModel.classes).map((item) => [item.localName, 'class']),
  ...Object.values(currentModel.objectProperties).map((item) => [item.localName, 'object-property']),
  ...Object.values(currentModel.datatypeProperties).map((item) => [item.localName, 'datatype-property']),
]);

export const lexicalMatches = Object.freeze(candidateResources
  .map((resource) => ({
    localName: resource.key.split(':', 2)[1],
    v2Kind: resource.kind,
  }))
  .filter((item) => currentKinds.has(item.localName))
  .map((item) => ({ ...item, v1Kind: currentKinds.get(item.localName) }))
  .sort((a, b) => a.localName.localeCompare(b.localName)));

export const sameKindLexicalMatches = Object.freeze(
  lexicalMatches.filter((item) => item.v1Kind === item.v2Kind),
);

export const changedKindLexicalMatches = Object.freeze(
  lexicalMatches.filter((item) => item.v1Kind !== item.v2Kind),
);

const evidence = {
  current: { label: 'Current ontology reference', href: '/ontology' },
  currentProvenance: { label: 'Current ontology provenance', href: '/ontology/provenance' },
  currentSchema: { label: 'Current schema reference', href: '/schema' },
  currentMapping: { label: 'Current RML mapping', href: '/mapping' },
  currentProfiles: { label: 'Current overlay profiles', href: '/ontology/profiles' },
  v2Overview: { label: 'Property Pack candidate overview', href: '/spdtf-2/property-pack' },
  v2Contexts: { label: 'Property Pack contextual boundaries', href: '/spdtf-2/property-pack/contexts' },
  v2Coverage: { label: 'Property Pack source coverage', href: '/spdtf-2/property-pack/coverage' },
  v2Resources: { label: 'Property Pack ontology resources', href: '/spdtf-2/property-pack/resources' },
  v2Shapes: { label: 'Property Pack SHACL shapes', href: '/spdtf-2/property-pack/shapes' },
  v2Vocabularies: { label: 'Property Pack controlled vocabularies', href: '/spdtf-2/property-pack/vocabularies' },
  v2Standards: { label: 'Property Pack standards profile', href: '/spdtf-2/property-pack/standards' },
  v2Validation: { label: 'Property Pack validation evidence', href: '/spdtf-2/property-pack/validation' },
  scopeDecision: { label: 'ADR-0066 · closed Property Pack scope', href: '/modelling/adr/adr-0066' },
  architectureDecision: { label: 'ADR-0067 · context-owned candidate', href: '/modelling/adr/adr-0067' },
};

export const comparisonDimensions = Object.freeze([
  {
    id: 'starting-question',
    label: 'Starting question',
    v1: 'How can the established PDTF JSON schemas, glossaries and form overlays be expressed and checked as linked data?',
    v2: 'What semantic model is needed to represent the 451 required Property Pack data points correctly?',
    implication: 'Property Pack changes the modelling premise. It is not a mechanical refresh of V1.',
    evidence: [evidence.currentSchema, evidence.scopeDecision],
  },
  {
    id: 'business-scope',
    label: 'Business-data scope',
    v1: 'Broad PDTF v3 baseline spanning the transaction schema and form overlays.',
    v2: 'Closed initial scope of exactly 451 workbook rows marked Required.',
    implication: 'Property Pack has complete source-to-candidate trace coverage for its 451-item scope, not complete coverage of the broader V1/PDTF scope.',
    evidence: [evidence.currentSchema, evidence.v2Coverage],
  },
  {
    id: 'source-authority',
    label: 'Source authority',
    v1: 'Schema, glossary, dictionary, ODR and council evidence all shaped the published graph.',
    v2: 'The 451 rows fix coverage; domain evidence establishes meaning. V1 and the JSON schemas are attributed evidence, not silent semantic seeds.',
    implication: 'Resources, relationships, identities and constraints are open to re-decision rather than inherited by default.',
    evidence: [evidence.currentProvenance, evidence.scopeDecision],
  },
  {
    id: 'architecture',
    label: 'Architecture',
    v1: 'One PDTF namespace organised into seven concern modules: foundation, property, agent, transaction, claim, governance and descriptive.',
    v2: 'A separate candidate namespace with six bounded contexts, a deliberately small Common boundary and a DBT Smart Data scheme context.',
    implication: 'V1 modules and Property Pack semantic homes are different organising concepts, even though both are graph models.',
    evidence: [evidence.current, evidence.v2Contexts],
  },
  {
    id: 'context-ownership',
    label: 'Context ownership',
    v1: 'Industry contexts are perspectives derived across the shared model and overlay profiles.',
    v2: 'Every OPDA-defined resource and every source item has exactly one proposed semantic home.',
    implication: 'Property Pack makes domain accountability explicit while preserving differences between contexts.',
    evidence: [evidence.currentProfiles, evidence.architectureDecision],
  },
  {
    id: 'field-treatment',
    label: 'From fields to meaning',
    v1: 'The published index is property-heavy: 41 classes, 75 object properties and 205 datatype properties.',
    v2: 'The candidate consolidates repeated source paths into 53 classes, 77 object properties and 29 datatype properties.',
    implication: 'Property Pack leans more heavily on resources and relationships, but the count change is not a quality score because the scopes differ.',
    evidence: [evidence.current, evidence.v2Resources],
  },
  {
    id: 'common-meaning',
    label: 'Common meaning',
    v1: 'A shared namespace is interpreted through concern modules and industry-context views.',
    v2: 'Only meaning evidenced as genuinely shared belongs in the Common boundary; current cross-domain mappings remain unasserted.',
    implication: 'Frequent reuse no longer makes a term common automatically.',
    evidence: [evidence.v2Contexts, evidence.architectureDecision],
  },
  {
    id: 'controlled-vocabularies',
    label: 'Controlled vocabularies',
    v1: 'The indexed corpus contains 48 SKOS schemes and 319 concepts across the broader schema-derived scope.',
    v2: 'Fourteen value schemes contain 85 curated concepts; a separate source-topic layer contains 413 concepts.',
    implication: 'Property Pack separates values used in data from topics used to organise source questions.',
    evidence: [evidence.current, evidence.v2Vocabularies],
  },
  {
    id: 'validation',
    label: 'Validation',
    v1: 'The indexed corpus contains 402 SHACL shapes, 31 form-overlay profiles and 17 diagnostic exemplars.',
    v2: 'The candidate contains 45 target-class node shapes and 100 emitted property constraints, plus deterministic candidate checks.',
    implication: 'These totals count different shape populations. Neither total establishes semantic correctness.',
    evidence: [evidence.currentProfiles, evidence.v2Shapes, evidence.v2Validation],
  },
  {
    id: 'traceability',
    label: 'Traceability',
    v1: 'Term-level provenance and RML connect ontology resources back to their schema locations.',
    v2: 'Stable Property Pack item IDs trace all 451 source points to candidate constructs, with direct and structural evidence distinguished.',
    implication: 'Property Pack strengthens source-versus-proposal separation; it does not yet provide a sanctioned V1-to-Property Pack migration map.',
    evidence: [evidence.currentMapping, evidence.v2Coverage],
  },
  {
    id: 'outputs',
    label: 'Outputs and compatibility',
    v1: 'OWL, SKOS, SHACL, RML, overlays, exemplars and dereferenceable documentation support the established JSON-schema ecosystem.',
    v2: 'OWL, SKOS, SHACL, glossary, dictionary, coverage and validation artefacts form the current candidate package. JSON Schema and form projections are later outputs.',
    implication: 'Existing implementers should not replace current schemas with Property Pack. Compatibility work requires an explicit migration decision.',
    evidence: [evidence.currentMapping, evidence.v2Standards],
  },
  {
    id: 'authority-status',
    label: 'Authority and status',
    v1: 'Published PDTF 1.0 implementation and canonical reference for its corpus, while the site still marks the derived model draft and under review.',
    v2: 'Public review candidate: 0.1.0-draft, machine-proposed and non-normative. Human review and recorded disposition remain required.',
    implication: 'Publication makes Property Pack reviewable; it does not approve it or replace V1.',
    evidence: [evidence.current, evidence.v2Overview, evidence.v2Validation],
  },
]);

export const continuityPoints = Object.freeze([
  'V1 remains useful implementation, provenance, mapping and migration evidence.',
  'The linked-data standards family continues: RDF, RDFS, OWL, SKOS, SHACL, Dublin Core and provenance vocabularies.',
  'Existing definitions and design decisions can support a Property Pack decision when they are cited and reviewed.',
  'The build, validation and documentation lessons from V1 are reused without silently importing its semantic structure.',
]);

export const interpretationLimits = Object.freeze([
  'A smaller or larger term count does not demonstrate better modelling: the business scopes and counting rules differ.',
  'Lexical matches do not establish identity, equivalence or a migration mapping between the two namespaces.',
  'Passing parser, SHACL and regeneration checks establishes technical integrity, not domain approval.',
  'Covering all 451 required Property Pack data points does not cover every V1 concept, schema field or overlay.',
]);

export const evidenceLinks = Object.freeze([
  evidence.current,
  evidence.currentProvenance,
  evidence.currentMapping,
  evidence.scopeDecision,
  evidence.architectureDecision,
  evidence.v2Coverage,
  evidence.v2Validation,
]);
