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
  entry('Candidate register', '/spdtf-2/candidates', 'Status of context-owned candidates, owners and immutable diffs', ['PDTF']),
  entry('Open questions and changes', '/spdtf-2/questions', 'Competency questions grouped by semantic owner', ['PDTF']),
  entry('Outputs and validation evidence', '/spdtf-2/outputs', 'Versioned semantic package and projection status', ['PDTF']),
  entry('Why ontologies', '/spdtf-2/ontologies/why-ontologies', 'Why SPDTF uses graph-based semantic modelling', ['PDTF']),
  entry('Six-part semantic package', '/spdtf-2/ontologies/semantic-package', 'Glossary, dictionary, taxonomies, vocabularies, resources and relationships', ['PDTF']),
  entry('Coverage crosswalk', '/spdtf-2/ontologies/coverage', 'Six outputs, eleven workshop themes and eight formal concerns', ['PDTF']),
  entry('Standards profile', '/spdtf-2/ontologies/standards', 'Bounded standards, versions, mechanisms, owners and decisions', ['PDTF']),
  entry('PDTF 1.0', '/pdtf-1', 'Published schema implementation and status-labelled derived artefacts', ['PDTF'], true),
  entry('PDTF 1.0 modelling material', '/modelling', 'Previous schema-led modelling documentation', ['PDTF'], true),
  entry('PDTF 1.0-derived model', '/model', 'Structured views derived from the published implementation', ['PDTF'], true),
  entry('PDTF 1.0-derived ontology', '/ontology', 'Draft semantic corpus derived from PDTF 1.0 evidence', ['PDTF'], true),
  entry('PDTF 1.0 RML schema–ontology verification', '/mapping', 'Legacy bidirectional verification mapping', ['PDTF', 'mapping'], true),
  entry('PDTF 1.0 JSON Schema', '/schema', 'Published JSON Schema and overlay implementation', ['PDTF'], true),
  entry('PDTF 1.0 implementation guidance', '/implementation', 'Implementation material for the published schema', ['PDTF'], true),
  entry('PDTF 1.0 adoption evidence', '/adoption', 'Implementation and adoption records', ['PDTF'], true),
  entry('Governance', '/governance', 'Authority, status, lifecycle and decisions', ['PDTF', 'SPDTF']),
  entry('Resources', '/resources', 'Source registry, glossary and machine-readable manifests', ['PDTF', 'SPDTF']),
]);

export function searchEntries(query) {
  const needle = String(query ?? '').trim().toLocaleLowerCase('en-GB');
  if (!needle) return SITE_SEARCH_ENTRIES;
  return SITE_SEARCH_ENTRIES.filter((record) => [record.title, record.summary, ...record.aliases]
    .some((value) => value.toLocaleLowerCase('en-GB').includes(needle)));
}
