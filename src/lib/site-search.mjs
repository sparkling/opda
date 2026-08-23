function facetFor(url) {
  if (url === '/spdtf/inputs/pdtf-schema' || url.startsWith('/spdtf/inputs/pdtf-schema/schema-and-supporting-material')) {
    return 'PDTF schema';
  }
  if (url.startsWith('/spdtf/inputs/pdtf-schema/schema-derived-ontology')) return 'Schema-derived ontology';
  if (url === '/spdtf' || url.startsWith('/spdtf/')) return 'SPDTF';
  return 'Cross-programme';
}

const entry = (title, url, summary, aliases = []) => Object.freeze({
  title, url, summary, aliases: Object.freeze(aliases), facet: facetFor(url),
});

export const SITE_SEARCH_ENTRIES = Object.freeze([
  entry('Programme', '/programme', 'Purpose, schema-to-scheme progression, roadmap and UK Smart Data context', ['PDTF', 'SPDTF']),
  entry('SPDTF', '/spdtf', 'First collaboratively authored scheme draft, using domain-led and evidence-up semantic modelling', ['PDTF', 'ontology']),
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
  entry('Semantic modelling', '/spdtf/ontologies', 'Choose a plain-language ontology guide or the SPDTF implementation documentation', ['PDTF', 'ontology', 'ontologies and semantic modelling', 'RDF', 'OWL', 'SKOS', 'SHACL', 'SPARQL', 'upper ontology']),
  entry('Understand ontologies', '/spdtf/ontologies/why-ontologies', 'What an ontology is and why SPDTF uses connected semantic modelling', ['PDTF', 'ontology']),
  entry('How to read the model', '/spdtf/ontologies/reading-the-model', 'Identifiers, resources, classes, properties, values, shapes and provenance', ['ontology']),
  entry('How we model SPDTF', '/spdtf/ontologies/modelling-method', 'Evidence-up modelling, competency questions, review and authority boundaries', ['PDTF', 'ontology', 'method']),
  entry('Six-part semantic package', '/spdtf/ontologies/semantic-package', 'Glossary, dictionary, taxonomies, vocabularies, resources and relationships', ['PDTF', 'ontology', 'RDF', 'OWL', 'SKOS', 'SHACL']),
  entry('Contexts and common boundary', '/spdtf/ontologies/bounded-contexts', 'Semantic homes, context ownership, interoperability and the Property Pack profile', ['ontology', 'bounded context', 'bounded contexts', 'context map', 'taxonomy', 'taxonomies']),
  entry('Modelling rules and lenses', '/spdtf/ontologies/modelling-rules', 'Identity, classes, values, relationships, reuse and candidate upper-ontology methods', ['ontology', 'upper ontology', 'UFO', 'gUFO', 'OntoClean']),
  entry('Coverage checklist', '/spdtf/ontologies/coverage', 'Six outputs, eleven workshop themes, eight formal concerns and four dispositions', ['PDTF', 'ontology']),
  entry('Standards profile', '/spdtf/ontologies/standards', 'Actual implementation, specification maturity, targets, candidates and deferred options', ['PDTF', 'ontology', 'RDF', 'RDFS', 'OWL', 'SKOS', 'SHACL', 'SPARQL', 'upper ontology']),
  entry('Evidence and qualified mappings', '/spdtf/ontologies/evidence-and-mappings', 'Competency questions, provenance, Category 8 cross-context mapping, SKOS predicates and the deferred SSSOM candidate', ['ontology', 'ontology mapping', 'cross-context mapping', 'cross-domain mapping', 'SKOS mapping', 'SSSOM', 'SEMAPV', 'Category 8']),
  entry('Validation, review and projections', '/spdtf/ontologies/validation', 'SHACL, competency queries, semantic review, governance and generated outputs', ['ontology']),
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

export function searchEntries(query) {
  const needle = String(query ?? '').trim().toLocaleLowerCase('en-GB');
  if (!needle) return SITE_SEARCH_ENTRIES;
  return SITE_SEARCH_ENTRIES.filter((record) => [record.title, record.summary, ...record.aliases]
    .some((value) => value.toLocaleLowerCase('en-GB').includes(needle)));
}
