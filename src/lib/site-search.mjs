const entry = (title, url, summary, aliases = [], historicalName = false) => Object.freeze({
  title, url, summary, aliases: Object.freeze(aliases), historicalName,
});

export const SITE_SEARCH_ENTRIES = Object.freeze([
  entry('Programme', '/programme', 'Purpose, continuation, roadmap and UK Smart Data context', ['PDTF', 'SPDTF']),
  entry('SPDTF 2.0 Development', '/spdtf-2', 'Current domain-led, evidence-up semantic modelling work', ['PDTF', 'ontology']),
  entry('Property Pack ontology', '/spdtf-2/property-pack', 'Accelerated SPDTF 2.0 component awaiting Technical Working Group determination', ['Property Pack', 'PDTF', 'ontology']),
  entry('Property Pack definition and scope', '/spdtf-2/property-pack/definition-and-scope', 'Interactive catalogue of all 451 required source items and candidate dispositions', ['Property Pack', 'data dictionary']),
  entry('PDTF 1.0 to Property Pack lineage', '/spdtf-2/property-pack/pdtf-1-lineage', 'Schema coverage and the incomplete ontology semantic crosswalk', ['Property Pack', 'PDTF', 'crosswalk']),
  entry('Property Pack technical determination', '/spdtf-2/property-pack/technical-working-group-determination', 'End-of-September 2026 Technical Working Group milestone and pending decision record', ['Property Pack', 'Technical Working Group']),
  entry('Working groups', '/spdtf-2/working-groups', 'Canonical participant workspaces and review routes', ['PDTF', 'participants']),
  entry('Working-group member guide', '/spdtf-2/working-groups/member-guide', 'How members join, discuss, share evidence, attend meetings and review models', ['Teams', 'SharePoint', 'participants']),
  entry('Getting started in a working group', '/spdtf-2/working-groups/member-guide/getting-started', 'Membership, access, roles and the first-day checklist', ['Teams', 'SharePoint', 'invitation']),
  entry('Teams and working-group discussions', '/spdtf-2/working-groups/member-guide/teams-and-discussions', 'Channels, threads, page comments, email and discussion etiquette', ['Microsoft Teams', 'comments']),
  entry('Source material and SharePoint', '/spdtf-2/working-groups/member-guide/source-material-and-sharepoint', 'Private organisation intake, evidence formats, provenance and submission boundaries', ['evidence', 'upload', 'SharePoint']),
  entry('Meetings and records', '/spdtf-2/working-groups/member-guide/meetings-and-records', 'Preparing for meetings, asynchronous follow-up, transcripts and durable records', ['minutes', 'transcripts', 'feedback']),
  entry('Model review and decisions', '/spdtf-2/working-groups/member-guide/model-review-and-decisions', 'How members review candidates and how human authority differs from AI assistance', ['candidate', 'review', 'decisions']),
  entry('Candidate register', '/spdtf-2/candidates', 'Status of context-owned candidates, owners and immutable diffs', ['PDTF']),
  entry('Open questions and changes', '/spdtf-2/questions', 'Competency questions grouped by semantic owner', ['PDTF']),
  entry('Outputs and validation evidence', '/spdtf-2/outputs', 'Versioned semantic package and projection status', ['PDTF']),
  entry('Semantic modelling', '/spdtf-2/ontologies', 'Choose a plain-language ontology guide or the SPDTF 2.0 implementation documentation', ['PDTF', 'ontology', 'ontologies and semantic modelling', 'RDF', 'OWL', 'SKOS', 'SHACL', 'SPARQL', 'upper ontology']),
  entry('Understand ontologies', '/spdtf-2/ontologies/why-ontologies', 'What an ontology is and why SPDTF uses connected semantic modelling', ['PDTF', 'ontology']),
  entry('How to read the model', '/spdtf-2/ontologies/reading-the-model', 'Identifiers, resources, classes, properties, values, shapes and provenance', ['ontology']),
  entry('How we model SPDTF 2.0', '/spdtf-2/ontologies/modelling-method', 'Evidence-up modelling, competency questions, review and authority boundaries', ['PDTF', 'ontology', 'method']),
  entry('Six-part semantic package', '/spdtf-2/ontologies/semantic-package', 'Glossary, dictionary, taxonomies, vocabularies, resources and relationships', ['PDTF', 'ontology', 'RDF', 'OWL', 'SKOS', 'SHACL']),
  entry('Contexts and common boundary', '/spdtf-2/ontologies/bounded-contexts', 'Semantic homes, context ownership, interoperability and the Property Pack profile', ['ontology', 'bounded context', 'bounded contexts', 'context map', 'taxonomy', 'taxonomies']),
  entry('Modelling rules and lenses', '/spdtf-2/ontologies/modelling-rules', 'Identity, classes, values, relationships, reuse and candidate upper-ontology methods', ['ontology', 'upper ontology', 'UFO', 'gUFO', 'OntoClean']),
  entry('Coverage checklist', '/spdtf-2/ontologies/coverage', 'Six outputs, eleven workshop themes, eight formal concerns and four dispositions', ['PDTF', 'ontology']),
  entry('Standards profile', '/spdtf-2/ontologies/standards', 'Actual implementation, specification maturity, targets, candidates and deferred options', ['PDTF', 'ontology', 'RDF', 'RDFS', 'OWL', 'SKOS', 'SHACL', 'SPARQL', 'upper ontology']),
  entry('Evidence and qualified mappings', '/spdtf-2/ontologies/evidence-and-mappings', 'Competency questions, provenance, traceability and five distinct mapping meanings', ['ontology']),
  entry('Validation, review and projections', '/spdtf-2/ontologies/validation', 'SHACL, competency queries, semantic review, governance and generated outputs', ['ontology']),
  entry('PDTF 1.0', '/pdtf-1', 'Published schema implementation and status-labelled derived artefacts', ['PDTF'], true),
  entry('Original PDTF 1.0 standard', '/pdtf-1/original-standard', 'JSON Schemas, overlays, data dictionary, business glossary, implementation and adoption evidence', ['PDTF', 'JSON Schema', 'data dictionary', 'business glossary'], true),
  entry('PDTF 1.0 modelling material', '/pdtf-1/extracted-ontology/lineage-provenance-and-verification/historical-modelling', 'Previous schema-led modelling documentation', ['PDTF'], true),
  entry('Model views by audience', '/pdtf-1/extracted-ontology/model-views-by-audience', 'PDTF 1.0-derived concept, logical, ontology, deployment and relational presentations', ['PDTF', 'derived model'], true),
  entry('PDTF 1.0-derived ontology', '/pdtf-1/extracted-ontology', 'Draft semantic corpus derived from PDTF 1.0 evidence', ['PDTF'], true),
  entry('Lineage, provenance and verification', '/pdtf-1/extracted-ontology/lineage-provenance-and-verification', 'How the PDTF 1.0-derived ontology was modelled, traced and checked against the schema', ['PDTF', 'RML', 'provenance'], true),
  entry('Concepts and architecture', '/pdtf-1/extracted-ontology/concepts-and-architecture', 'Identity, semantic contexts, foundations and modelling frameworks in the PDTF 1.0-derived ontology', ['PDTF', 'ontology contexts'], true),
  entry('PDTF 1.0-derived ontology contexts', '/pdtf-1/extracted-ontology/concepts-and-architecture/contexts', 'Context modules in the draft ontology extracted from PDTF 1.0 evidence', ['PDTF', 'bounded contexts'], true),
  entry('Terms and model resources', '/pdtf-1/extracted-ontology/terms-and-model-resources', 'Classes, properties, datatypes, vocabularies and the generated term reference', ['PDTF', 'ontology terms'], true),
  entry('Validation and examples', '/pdtf-1/extracted-ontology/validation-and-examples', 'SHACL shapes, overlay profiles and diagnostic exemplars for the PDTF 1.0-derived ontology', ['PDTF', 'SHACL'], true),
  entry('Trust, governance and limitations', '/pdtf-1/extracted-ontology/trust-governance-and-limitations', 'Claims, evidence, governance, PII and known limitations of the draft derived ontology', ['PDTF', 'ontology governance'], true),
  entry('Use and tooling', '/pdtf-1/extracted-ontology/use-and-tooling', 'Namespaces, consumption guidance and tool compatibility evidence', ['PDTF', 'ontology tools'], true),
  entry('PDTF 1.0 RML schema–ontology verification', '/pdtf-1/extracted-ontology/lineage-provenance-and-verification/schema-to-ontology-verification', 'Legacy bidirectional verification mapping', ['PDTF', 'mapping'], true),
  entry('PDTF 1.0 JSON Schema', '/pdtf-1/original-standard/schema', 'Published JSON Schema and overlay implementation', ['PDTF'], true),
  entry('PDTF 1.0 implementation guidance', '/pdtf-1/original-standard/implementation', 'Implementation material for the published schema', ['PDTF'], true),
  entry('PDTF 1.0 adoption evidence', '/pdtf-1/original-standard/adoption', 'Implementation and adoption records', ['PDTF'], true),
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
