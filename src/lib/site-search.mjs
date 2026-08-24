import { GLOBAL_DESTINATIONS, getActiveDestination } from './site-ia.mjs';

const destinationTitles = new Map(GLOBAL_DESTINATIONS.map(({ key, title }) => [key, title]));
const destinationKeys = new Set(destinationTitles.keys());

function facetFor(url) {
  if (url === '/spdtf/inputs/pdtf-schema' || url.startsWith('/spdtf/inputs/pdtf-schema/schema-and-supporting-material')) {
    return 'PDTF schema';
  }
  if (url.startsWith('/spdtf/inputs/pdtf-schema/schema-derived-ontology')) return 'Schema-derived ontology';
  return destinationTitles.get(getActiveDestination(url)) ?? 'Resources';
}

const entry = (title, url, summary, aliases = []) => {
  const destination = getActiveDestination(url);
  if (!destinationKeys.has(destination)) throw new Error(`Search entry has no canonical destination: ${url}`);
  return Object.freeze({
    title,
    url,
    summary,
    aliases: Object.freeze(aliases),
    facet: facetFor(url),
    destination,
  });
};

export const SITE_SEARCH_ENTRIES = Object.freeze([
  entry('Programme', '/programme', 'Purpose, schema-to-scheme progression, roadmap and UK Smart Data context', ['PDTF', 'SPDTF']),
  entry('SPDTF Development', '/spdtf', 'First collaboratively authored scheme draft, using domain-led and evidence-up semantic modelling', ['SPDTF', 'PDTF', 'ontology']),
  entry('Property Pack ontology', '/spdtf/property-pack', 'Accelerated SPDTF component awaiting Technical Working Group determination', ['Property Pack', 'PDTF', 'ontology']),
  entry('Property Pack definition and scope', '/spdtf/property-pack/definition-and-scope', 'Interactive catalogue of all 451 required source items and candidate dispositions', ['Property Pack', 'data dictionary']),
  entry('PDTF schema to Property Pack lineage', '/spdtf/property-pack/pdtf-schema-lineage', 'Schema coverage and the incomplete ontology semantic crosswalk', ['Property Pack', 'PDTF', 'crosswalk']),
  entry('Property Pack technical determination', '/spdtf/property-pack/technical-working-group-determination', 'End-of-September 2026 Technical Working Group milestone and pending decision record', ['Property Pack', 'Technical Working Group']),
  entry('Working groups', '/spdtf/working-groups', 'Canonical participant workspaces and review routes', ['PDTF', 'participants']),
  entry('Working-group member guide', '/spdtf/working-groups/member-guide', 'How members join, discuss, share evidence, attend meetings and review models', ['Teams', 'SharePoint', 'participants']),
  entry('Getting started in a working group', '/spdtf/working-groups/member-guide/getting-started', 'Membership, access, roles and the first-day checklist', ['Teams', 'SharePoint', 'invitation']),
  entry('Teams and working-group discussions', '/spdtf/working-groups/member-guide/teams-and-discussions', 'Channels, threads, page comments, email and discussion etiquette', ['Microsoft Teams', 'comments']),
  entry('Source material and SharePoint', '/spdtf/working-groups/member-guide/source-material-and-sharepoint', 'Private organisation intake, evidence formats, provenance and submission boundaries', ['evidence', 'upload', 'SharePoint']),
  entry('Meetings and records', '/spdtf/working-groups/member-guide/meetings-and-records', 'Preparing for meetings, asynchronous follow-up, transcripts and durable records', ['minutes', 'transcripts', 'feedback']),
  entry('Model review and decisions', '/spdtf/working-groups/member-guide/model-review-and-decisions', 'How members review candidates and how human authority differs from AI assistance', ['candidate', 'review', 'decisions']),
  entry('Candidate register', '/spdtf/candidates', 'Status of context-owned candidates, owners and immutable diffs', ['PDTF']),
  entry('Open questions and changes', '/spdtf/questions', 'Competency questions grouped by semantic owner', ['PDTF']),
  entry('Outputs and validation evidence', '/spdtf/outputs', 'Versioned semantic package and projection status', ['PDTF']),
  entry('Semantic modelling', '/semantic-modelling', 'Choose a plain-language ontology guide or the SPDTF implementation documentation', ['PDTF', 'ontology', 'ontologies and semantic modelling', 'RDF', 'OWL', 'SKOS', 'SHACL', 'SPARQL', 'upper ontology']),
  entry('Understand ontologies', '/semantic-modelling/why-ontologies', 'What an ontology is and why SPDTF uses connected semantic modelling', ['PDTF', 'ontology']),
  entry('How to read the model', '/semantic-modelling/reading-the-model', 'Identifiers, resources, classes, properties, values, shapes and provenance', ['ontology']),
  entry('How we model SPDTF', '/semantic-modelling/modelling-method', 'Evidence-up modelling, competency questions, review and authority boundaries', ['PDTF', 'ontology', 'method']),
  entry('Six-part semantic package', '/semantic-modelling/semantic-package', 'Glossary, dictionary, taxonomies, vocabularies, resources and relationships', ['PDTF', 'ontology', 'RDF', 'OWL', 'SKOS', 'SHACL']),
  entry('Contexts and common boundary', '/semantic-modelling/bounded-contexts', 'Semantic homes, context ownership, interoperability and the Property Pack profile', ['ontology', 'bounded context', 'bounded contexts', 'context map', 'taxonomy', 'taxonomies']),
  entry('Modelling rules and lenses', '/semantic-modelling/modelling-rules', 'Identity, classes, values, relationships, reuse and candidate upper-ontology methods', ['ontology', 'upper ontology', 'UFO', 'gUFO', 'OntoClean']),
  entry('Coverage checklist', '/semantic-modelling/coverage', 'Six outputs, eleven workshop themes, eight formal concerns and four dispositions', ['PDTF', 'ontology']),
  entry('Standards profile', '/semantic-modelling/standards', 'Actual implementation, specification maturity, targets, candidates and deferred options', ['PDTF', 'ontology', 'RDF', 'RDFS', 'OWL', 'SKOS', 'SHACL', 'SPARQL', 'upper ontology']),
  entry('Evidence and qualified mappings', '/semantic-modelling/evidence-and-mappings', 'Competency questions, provenance, Category 8 cross-context mapping, SKOS predicates and the deferred SSSOM candidate', ['ontology', 'ontology mapping', 'cross-context mapping', 'cross-domain mapping', 'SKOS mapping', 'SSSOM', 'SEMAPV', 'Category 8']),
  entry('Validation, review and projections', '/semantic-modelling/validation', 'SHACL, competency queries, semantic review, governance and generated outputs', ['ontology']),
  entry('Third-party inputs', '/spdtf/inputs', 'Sources considered as evidence, compatibility material or modelling input; inclusion does not imply adoption or authority', ['inputs', 'evidence']),
  entry('PDTF schema', '/spdtf/inputs/pdtf-schema', 'Third-party Digital Property Pack schema input; inclusion does not confer OPDA endorsement or SPDTF authority', ['PDTF', 'third-party input']),
  entry('PDTF schema and supporting material', '/spdtf/inputs/pdtf-schema/schema-and-supporting-material', 'Third-party JSON Schemas, overlays, data dictionary and business glossary, with separately attributed implementation and usage evidence', ['PDTF', 'JSON Schema', 'data dictionary', 'business glossary']),
  entry('Schema-derived ontology modelling material', '/spdtf/inputs/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification/historical-modelling', 'Historical modelling documentation for the ontology derived from the PDTF schema', ['PDTF']),
  entry('Model views by audience', '/spdtf/inputs/pdtf-schema/schema-derived-ontology/model-views-by-audience', 'Schema-derived concept, logical, ontology, deployment and relational presentations', ['PDTF', 'derived model']),
  entry('Schema-derived ontology', '/spdtf/inputs/pdtf-schema/schema-derived-ontology', 'OPDA-produced non-normative technical derivation of the third-party PDTF schema input', ['PDTF', 'derived evidence']),
  entry('Lineage, provenance and verification', '/spdtf/inputs/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification', 'How the schema-derived ontology was modelled, traced and checked against the schema', ['PDTF', 'RML', 'provenance']),
  entry('Concepts and architecture', '/spdtf/inputs/pdtf-schema/schema-derived-ontology/concepts-and-architecture', 'Identity, semantic contexts, foundations and modelling frameworks in the schema-derived ontology', ['PDTF', 'ontology contexts']),
  entry('Schema-derived ontology contexts', '/spdtf/inputs/pdtf-schema/schema-derived-ontology/concepts-and-architecture/contexts', 'Context modules in the draft ontology extracted from PDTF schema evidence', ['PDTF', 'bounded contexts']),
  entry('Terms and model resources', '/spdtf/inputs/pdtf-schema/schema-derived-ontology/terms-and-model-resources', 'Classes, properties, datatypes, vocabularies and the generated term reference', ['PDTF', 'ontology terms']),
  entry('Validation and examples', '/spdtf/inputs/pdtf-schema/schema-derived-ontology/validation-and-examples', 'SHACL shapes, overlay profiles and diagnostic exemplars for the schema-derived ontology', ['PDTF', 'SHACL']),
  entry('Trust, governance and limitations', '/spdtf/inputs/pdtf-schema/schema-derived-ontology/trust-governance-and-limitations', 'Claims, evidence, governance, PII and known limitations of the draft derived ontology', ['PDTF', 'ontology governance']),
  entry('Use and tooling', '/spdtf/inputs/pdtf-schema/schema-derived-ontology/use-and-tooling', 'Namespaces, consumption guidance and tool compatibility evidence', ['PDTF', 'ontology tools']),
  entry('PDTF schema RML schema–ontology verification', '/spdtf/inputs/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification/schema-to-ontology-verification', 'Bidirectional verification mapping between the schema and the derived ontology', ['PDTF', 'mapping']),
  entry('PDTF schema JSON Schema', '/spdtf/inputs/pdtf-schema/schema-and-supporting-material/schema', 'Published JSON Schema and overlay implementation', ['PDTF']),
  entry('PDTF schema implementation guidance', '/spdtf/inputs/pdtf-schema/schema-and-supporting-material/implementation', 'Implementation material for the existing schema', ['PDTF']),
  entry('PDTF schema usage and implementation evidence', '/spdtf/inputs/pdtf-schema/schema-and-supporting-material/adoption', 'Attributed implementation, pilot and usage records', ['PDTF']),
  entry('Governance', '/governance', 'Authority, status, lifecycle and decisions', ['PDTF', 'SPDTF']),
  entry('UK initiative context', '/governance/uk-initiative', 'Legislation, public bodies and steering arrangements around property-data reform', ['government', 'policy']),
  entry('OPDA organisation', '/governance/opda-organisation', 'Member firms and the Trust Framework Sandbox', ['governance', 'members']),
  entry('Standards landscape', '/governance/standards-landscape', 'External trust-framework alignment and strategic context', ['ToIP', 'governance']),
  entry('OPDA rules', '/governance/opda-rules', 'Current, draft and proposed rules with their own status', ['lifecycle', 'conformance', 'risk']),
  entry('Operating Model', '/governance/operating-model', 'Stewardship, meetings, engagement and attachment handling', ['governance', 'decision rights']),
  entry('Quality and security', '/governance/quality-and-security', 'Data-quality and data-security framework records', ['assurance', 'controls']),
  entry('Resources', '/resources', 'Source registry, glossary and machine-readable manifests', ['PDTF', 'SPDTF']),
]);

function normalizeSearchText(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .toLocaleLowerCase('en-GB')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function relevance(record, query) {
  const phrase = normalizeSearchText(query);
  if (!phrase) return 0;

  const tokens = phrase.split(/\s+/u);
  const title = normalizeSearchText(record.title);
  const aliases = record.aliases.map(normalizeSearchText);
  const summary = normalizeSearchText(record.summary);
  const destination = normalizeSearchText(destinationTitles.get(record.destination));
  const facet = normalizeSearchText(record.facet);
  const url = normalizeSearchText(record.url);
  const corpus = [title, ...aliases, summary, destination, facet, url].join(' ');
  if (!tokens.every((token) => corpus.includes(token))) return null;

  if (title === phrase) return 0;
  if (title.startsWith(phrase)) return 10;
  if (title.includes(phrase)) return 20;
  if (aliases.some((alias) => alias === phrase)) return 30;
  if (aliases.some((alias) => alias.startsWith(phrase))) return 40;

  return 50 + tokens.reduce((score, token) => {
    if (title.startsWith(token)) return score;
    if (title.includes(token)) return score + 2;
    if (aliases.some((alias) => alias.includes(token))) return score + 4;
    if (facet.includes(token) || destination.includes(token)) return score + 6;
    return score + 8;
  }, 0);
}

export function searchEntries(query, destination = '') {
  const selectedDestination = destinationKeys.has(destination) ? destination : '';
  return SITE_SEARCH_ENTRIES
    .map((record, index) => ({ record, index, score: relevance(record, query) }))
    .filter(({ record, score }) => score !== null
      && (!selectedDestination || record.destination === selectedDestination))
    .sort((left, right) => left.score - right.score || left.index - right.index)
    .map(({ record }) => record);
}
