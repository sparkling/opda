export const STANDARDS_PROFILE_VERSION = '0.2-development';
export const STANDARDS_MECHANISMS = Object.freeze(['reuse', 'reference', 'map', 'mint']);

const LAST_CHECKED = '2026-08-20';
const specification = (
  specificationMaturity,
  exactSnapshot,
  source,
  implementationStatus,
  implementationEvidence,
  candidateSnapshot = 'No implementation snapshot pinned',
  profileSource = source,
) => (
  Object.freeze({ specificationMaturity, exactSnapshot, source, implementationStatus, implementationEvidence, candidateSnapshot, profileSource, lastChecked: LAST_CHECKED })
);

const SPECIFICATION_EVIDENCE = Object.freeze({
  'SPDTF context-owned terms': specification('Internal governance decision', 'ADR-0074 · 2026-08-20', 'https://opda.org.uk/modelling/adr/adr-0074', 'governed terms not yet minted', 'No governed SPDTF namespace term exists; machine-proposed Property Pack IRIs exist only in its isolated candidate namespace'),
  'RDF 1.2 Basic': specification('W3C Candidate Recommendation Snapshot', '2026-04-07', 'https://www.w3.org/TR/rdf12-concepts/', 'used and tested in Property Pack 0.1', 'Turtle declares VERSION 1.2-basic and passes Jena RIOT parsing', 'RDF Concepts CR snapshot · 2026-04-07'),
  'RDF 1.2 Turtle': specification('W3C Working Draft', '2026-08-12', 'https://www.w3.org/TR/rdf12-turtle/', 'used and tested in Property Pack 0.1', 'Every candidate graph is emitted as Turtle and passes Jena RIOT parsing', 'Turtle Working Draft · 2026-05-28'),
  'RDFS 1.2': specification('W3C Working Draft', '2026-03-28', 'https://www.w3.org/TR/rdf12-schema/', 'used in Property Pack 0.1', 'Labels, hierarchies, domains and ranges are emitted; no entailment-profile receipt'),
  'OWL 2': specification('W3C Recommendation', '2012-12-11', 'https://www.w3.org/TR/owl2-overview/', 'used in Property Pack 0.1', 'Bounded OWL vocabulary surface is emitted; no OWL-profile conformance claim'),
  'XML Schema datatypes': specification('W3C Recommendation', '2012-04-05', 'https://www.w3.org/TR/xmlschema11-2/', 'used in Property Pack 0.1', 'Candidate datatype properties use bounded XSD literal datatypes'),
  SKOS: specification('W3C Recommendation', '2009-08-18', 'https://www.w3.org/TR/skos-reference/', 'used in Property Pack 0.1', 'Concept schemes, concepts, labels, definitions, notations and inScheme are emitted'),
  'SPARQL 1.2': specification('W3C Working Draft', '2026-08-20', 'https://www.w3.org/TR/sparql12-query/', 'used and ARQ-tested in Property Pack 0.1', 'Four ASK competency queries using basic graph patterns pass ARQ 6.1.0; cross-engine portability is not demonstrated', 'SPARQL Query Working Draft · 2026-06-05'),
  'SHACL 1.2 Core': specification('W3C Working Draft', '2026-08-03', 'https://www.w3.org/TR/shacl12-core/', 'used and exercised in Property Pack 0.1', 'The complete shape graph runs against one conforming and one non-conforming fixture; no per-feature, cross-processor, Union, AF or SPARQL conformance claim', 'SHACL Core Working Draft · 2026-05-16'),
  'SHACL Advanced Features': specification('W3C Working Group Note', '2017-06-08', 'https://www.w3.org/TR/shacl-af/', 'not used', 'No SHACL-AF feature occurs in Property Pack 0.1'),
  DASH: specification('Community vocabulary', 'version not selected', 'https://datashapes.org/dash', 'not used', 'No DASH term occurs in Property Pack 0.1'),
  'Dublin Core Terms': specification('DCMI Recommendation', '2020-01-20', 'https://www.dublincore.org/specifications/dublin-core/dcmi-terms/', 'used in Property Pack 0.1', 'dcterms:description, dcterms:source and dcterms:PhysicalResource are emitted'),
  'DCAT 3': specification('W3C Recommendation', '2024-08-22', 'https://www.w3.org/TR/vocab-dcat-3/', 'not used', 'No DCAT term occurs in Property Pack 0.1'),
  'PROV-O': specification('W3C Recommendation', '2013-04-30', 'https://www.w3.org/TR/prov-o/', 'not used; prefix declaration only', 'No PROV-O predicate or class occurs in Property Pack 0.1'),
  'Data Quality Vocabulary (DQV)': specification('W3C Working Group Note', '2016-12-16', 'https://www.w3.org/TR/vocab-dqv/', 'not used', 'No DQV term occurs in Property Pack 0.1'),
  'OWL-Time': specification('W3C Candidate Recommendation Draft', '2022-11-15', 'https://www.w3.org/TR/owl-time/', 'not used', 'No OWL-Time term occurs in Property Pack 0.1', 'No implementation snapshot pinned', 'https://www.w3.org/TR/2017/REC-owl-time-20171019/'),
  'Data Privacy Vocabulary 2.0': specification('Final Community Group Report — not a W3C Standard', '2.3 · 2026-02-25', 'https://w3id.org/dpv/', 'not used', 'No DPV term occurs in Property Pack 0.1', 'No implementation snapshot pinned', 'https://w3id.org/dpv/2.0'),
  'DPV Personal Data 2.0': specification('Final Community Group Report — not a W3C Standard', '2.3 · 2026-02-25', 'https://w3id.org/dpv/pd', 'not used', 'No DPV-PD term occurs in Property Pack 0.1', 'No implementation snapshot pinned', 'https://w3id.org/dpv/2.0/pd'),
  'DPV Legal 2.0': specification('Final Community Group Report — not a W3C Standard', '2.3 · 2026-02-25', 'https://w3id.org/dpv/legal', 'not used', 'No DPV-LEGAL term occurs in Property Pack 0.1', 'No implementation snapshot pinned', 'https://w3id.org/dpv/2.0/legal'),
  'ODRL 2.2': specification('W3C Recommendation', '2018-02-15', 'https://www.w3.org/TR/odrl-model/', 'not used', 'No ODRL term occurs in Property Pack 0.1'),
  SSSOM: specification('Community specification', '1.0', 'https://mapping-commons.github.io/sssom/1.0/', 'not used', 'Cross-context mapping set is empty pending evidence'),
  FIBO: specification('EDM Council / OMG production ontology', 'release not selected', 'https://spec.edmcouncil.org/fibo/index.html', 'not used or imported', 'No FIBO term or import occurs in Property Pack 0.1'),
  GeoSPARQL: specification('OGC Standard', '1.1 · OGC 22-047r1', 'https://www.ogc.org/standards/geosparql/', 'not used or imported', 'No GeoSPARQL term or import occurs in Property Pack 0.1'),
  'Schema.org': specification('Community vocabulary', 'version not selected', 'https://schema.org/docs/releases.html', 'not used or imported', 'No Schema.org term or import occurs in Property Pack 0.1'),
  'W3C Verifiable Credentials Data Model 2.0': specification('W3C Recommendation', '2025-05-15', 'https://www.w3.org/TR/vc-data-model-2.0/', 'not used', 'No VC term occurs in Property Pack 0.1'),
  'W3C DID Core 1.0': specification('W3C Recommendation', '2022-07-19', 'https://www.w3.org/TR/did-core/', 'not used', 'No DID term occurs in Property Pack 0.1'),
  'W3C Organization Ontology': specification('W3C Recommendation', '2014-01-16', 'https://www.w3.org/TR/vocab-org/', 'not used', 'No ORG term occurs in Property Pack 0.1'),
  'ISO 23386': specification('ISO International Standard', 'ISO 23386:2020', 'https://www.iso.org/standard/75401.html', 'not used as an ontology dependency', 'Candidate glossary and dictionary governance method only'),
  UFO: specification('Design-time analytical framework', 'edition not selected', 'https://doi.org/10.3233/AO-150157', 'not used or imported', 'PDTF 1.0 precedent only; no SPDTF 2.0 selection'),
  gUFO: specification('OWL implementation of UFO', '1.0.0', 'https://nemo-ufes.github.io/gufo/', 'not used or imported', 'No gUFO term or import occurs in Property Pack 0.1'),
  OntoClean: specification('Design-quality method', 'method profile not selected', 'https://doi.org/10.1145/503124.503150', 'not used as a runtime dependency', 'PDTF 1.0 precedent only; no SPDTF 2.0 selection'),
  DOLCE: specification('Foundational ontology', 'edition not selected', 'https://www.loa.istc.cnr.it/dolce/overview.html', 'not used or imported', 'PDTF 1.0 comparison only; no SPDTF 2.0 disposition'),
});

function item(name, versionBoundary, purpose, conformance, mechanism, status, owner, evidence, reopenTrigger) {
  const specificationEvidence = SPECIFICATION_EVIDENCE[name];
  if (!specificationEvidence) throw new Error(`Missing specification evidence: ${name}`);
  return Object.freeze({
    name, versionBoundary, purpose, conformance, mechanism, status,
    governanceStatus: status, owner, evidence, reopenTrigger, ...specificationEvidence,
  });
}

export const STANDARDS_PROFILE = Object.freeze([
  item('SPDTF context-owned terms', 'Namespace and identifier policy unresolved; minting is blocked until recorded', 'Terms for reviewed meaning not supplied by a suitable governed source', 'Immutable candidate identifier, semantic owner and evidence required', 'mint', 'Blocked pending namespace governance and a working-group candidate', 'Owning domain group with Governance', 'Information architecture unresolved decision 1', 'A reviewed candidate needs a term that cannot be reused'),
  item('RDF 1.2 Basic', 'RDF 1.2 Basic profile named by ADR-0067', 'Graph data model and serialisation substrate', 'Basic profile only; every extra feature needs a receipt', 'reference', 'Accepted SPDTF modelling target; not a release claim', 'Interoperability', 'ADR-0067 §5.4', 'A required RDF feature outside the Basic profile'),
  item('RDF 1.2 Turtle', 'Turtle syntax snapshot pinned by each candidate package', 'Human-readable exchange syntax for candidate RDF graphs', 'Parsing proves syntactic compatibility, not semantic correctness', 'reference', 'Accepted serialisation target; snapshot is package-specific', 'Interoperability', 'ADR-0067 §5.4 and Property Pack candidate manifest', 'The candidate needs syntax outside the tested Turtle snapshot'),
  item('RDFS 1.2', 'RDF Schema 1.2 vocabulary used within the RDF 1.2 target', 'Labels and documentary class/property hierarchies', 'Vocabulary surface only; no RDFS entailment or inference receipt', 'reuse', 'Candidate feature boundary', 'Interoperability', 'ADR-0067 and candidate validation receipt', 'A competency question requires additional entailment'),
  item('OWL 2', 'W3C Recommendation, 11 December 2012', 'Context-owned classes, properties and ontology metadata', 'Vocabulary surface only; no OWL profile, consistency, entailment or reasoner receipt', 'reuse', 'Accepted bounded target', 'Interoperability with each domain owner', 'ADR-0067 §5.4', 'A required construct falls outside the tested profile'),
  item('XML Schema datatypes', 'XML Schema Definition Language 1.1 Part 2', 'Literal datatype identifiers used by RDF and SHACL', 'Only datatypes emitted by a candidate package', 'reuse', 'Actual supporting use; bounded per candidate', 'Interoperability with Validation maintainers', 'Property Pack 0.1 generator and ontology corpus', 'A reviewed value needs a datatype outside the declared set'),
  item('SKOS', 'W3C Recommendation, 18 August 2009', 'Controlled vocabularies, taxonomies and mapping relations', 'Plain SKOS; SKOS-XL is not selected', 'reuse', 'Accepted bounded target', 'Vocabulary owner with Interoperability', 'ADR-0063/0067', 'Label modelling requires a separately governed lexical model'),
  item('SPARQL 1.2', 'Portable-design SPARQL 1.2 subset; feature manifest required per package', 'Competency and conformance queries', 'ASK with basic graph patterns; Property Pack 0.1 is tested only with ARQ 6.1.0', 'reference', 'Accepted portable design target; cross-engine portability is not yet demonstrated', 'Validation maintainers', 'ADR-0067 §5.4; Property Pack competency-query receipt', 'A query requires a feature outside the portable design subset'),
  item('SHACL 1.2 Core', 'SHACL 1.2 Core target named by ADR-0067', 'Structural and business-rule validation', 'Current run fails on missing tools or failed checks; unsupported-feature rejection needs a future allow-list receipt', 'reuse', 'Accepted bounded target', 'Validation maintainers and domain owner', 'ADR-0067 §5.4; package validation receipt', 'A confirmed rule cannot be expressed in the Core subset'),
  item('SHACL Advanced Features', '2017 W3C Note; no SPDTF feature profile selected', 'Possible rules, functions and advanced targets beyond Core', 'Not selected; cannot appear without an exact feature receipt', 'reference', 'Deferred / unselected', 'Validation maintainers with domain owner', 'ADR-0063 candidate list; absent from Property Pack 0.1', 'An accepted rule cannot be expressed in the tested Core subset'),
  item('DASH', 'Community vocabulary; version not selected', 'Possible reusable SHACL UI and constraint patterns', 'Not selected and no conformance claim', 'reference', 'Deferred / unselected', 'Validation maintainers', 'ADR-0063 candidate list; absent from Property Pack 0.1', 'A governed UI or validation requirement selects an exact DASH term'),
  item('Dublin Core Terms', 'DCMI Terms namespace; version 2020-01-20', 'Source, title, dates and administrative metadata', 'Reuse only the terms named by the package profile', 'reuse', 'Candidate by concern', 'Provenance owner', 'ADR-0067; PDTF 1.0 adoption catalogue', 'A required metadata meaning is absent or mismatched'),
  item('DCAT 3', 'W3C Recommendation, 22 August 2024', 'Dataset and distribution catalogue metadata', 'No catalogue conformance claimed until a publishing use case exists', 'reference', 'Conditional candidate', 'Resources and Governance', 'PDTF 1.0 adoption catalogue; ADR-0067', 'A governed dataset catalogue or external registration is required'),
  item('PROV-O', 'W3C Recommendation, 30 April 2013', 'Attribution, derivation, activity and agent provenance', 'Concern-specific reuse; no complete PROV profile claimed', 'reuse', 'Candidate by concern', 'Provenance owner', 'ADR-0067; PDTF 1.0 evidence', 'A provenance competency question cannot be answered'),
  item('Data Quality Vocabulary (DQV)', 'W3C Note, 16 December 2016', 'Quality measures, annotations and evidence', 'Reference candidate; no conformance claim', 'reference', 'Candidate by concern', 'Quality owner', 'ADR-0063 coverage framework', 'A reviewed quality measure needs reusable semantics'),
  item('OWL-Time', 'W3C Recommendation, 19 October 2017', 'Valid time, recorded time, intervals and temporal relations', 'Concern-specific reuse only', 'reuse', 'Candidate by concern', 'Temporal concern owner', 'ADR-0067', 'A reviewed temporal question needs an unsupported construct'),
  item('Data Privacy Vocabulary 2.0', 'DPV 2.0 final specification, 1 August 2024', 'Purpose, processing and privacy semantics', 'Semantic description only; no runtime authorisation claim', 'reference', 'Candidate by concern', 'DBT Smart Data group with Governance', 'ADR-0067; PDTF 1.0 adoption catalogue', 'Legal or participant review selects a bounded DPV profile'),
  item('DPV Personal Data 2.0', 'DPV-PD 2.0 final specification, 1 August 2024', 'Personal-data categories', 'Reference only until reviewed categories are recorded', 'reference', 'Candidate by concern', 'DBT Smart Data group with Governance', 'ADR-0067; PDTF 1.0 adoption catalogue', 'A reviewed sensitivity question selects a category'),
  item('DPV Legal 2.0', 'DPV-LEGAL 2.0 final specification, 1 August 2024', 'Jurisdictional legal concepts', 'No legal conclusion or statutory authority implied', 'reference', 'Conditional/deferred candidate', 'Governance with legal review', 'ADR-0067; PDTF 1.0 adoption catalogue', 'Legal review identifies an exact applicable profile'),
  item('ODRL 2.2', 'W3C Recommendation, 15 February 2018', 'Policy, permission and prohibition semantics', 'Reference only; no policy instances or enforcement claim', 'reference', 'Conditional/deferred candidate', 'DBT Smart Data group with Governance', 'ADR-0067; PDTF 1.0 adoption catalogue', 'A reviewed policy-authoring use case is accepted'),
  item('SSSOM', 'Version not selected; selection is a precondition to use', 'Mapping metadata, justification and confidence', 'No SSSOM conformance claimed', 'reference', 'Deferred candidate', 'Interoperability', 'PDTF 1.0 adoption catalogue; ADR-0067', 'A cross-vocabulary mapping set is approved for authoring'),
  item('FIBO', 'Version not selected; selection is a precondition to use', 'Comparison with finance-domain meanings', 'No import or conformance', 'reference', 'Reference candidate only', 'Finance and Banking', 'PDTF 1.0 rejection register', 'A finance competency question would otherwise reinvent a FIBO concept'),
  item('GeoSPARQL', 'Version not selected; selection is a precondition to use', 'Geometry and spatial-query semantics', 'No reuse or conformance', 'reference', 'Conditional/deferred candidate', 'Property Data Services', 'PDTF 1.0 rejection register', 'Title extents, search polygons or radius queries enter scope'),
  item('Schema.org', 'Version not selected; selection is a precondition to use', 'Possible publication mapping for open-web consumers', 'Publication mapping only; never ontology authority', 'map', 'Deferred candidate', 'Property Technology with Interoperability', 'PDTF 1.0 rejection register', 'A concrete open-web publication use case is approved'),
  item('W3C Verifiable Credentials Data Model 2.0', 'W3C Recommendation, 15 May 2025', 'Portable credential presentation and verification semantics', 'Reference only; no wallet or trust-scheme conformance', 'reference', 'Deferred candidate', 'DBT Smart Data group', 'PDTF 1.0 adoption catalogue', 'A real wallet or credential consumer enters scope'),
  item('W3C DID Core 1.0', 'W3C Recommendation, 19 July 2022', 'Decentralised identifier resolution reference', 'No DID method selected and no resolution claim', 'reference', 'Deferred candidate', 'DBT Smart Data group', 'PDTF 1.0 adoption catalogue', 'A governed credential ecosystem requires DID resolution'),
  item('W3C Organization Ontology', 'W3C Recommendation, 16 January 2014', 'Organisational structures and roles', 'Reference candidate; exact reused terms must be declared', 'reference', 'Candidate by concern', 'Relevant domain owner', 'PDTF 1.0 evidence; ADR-0067', 'A participant or organisation competency question selects terms'),
  item('ISO 23386', 'ISO 23386:2020', 'Data-dictionary definition and governance method', 'Method reference; no ISO certification claim', 'reference', 'Method candidate', 'Governance and glossary owners', 'ADR-0063 methodology candidate', 'The glossary process adopts or rejects its governance pattern'),
  item('UFO', 'No edition selected; design-time analytical framework only', 'Identity, roles, relators and category distinctions', 'No import, runtime dependency or conformance claim', 'reference', 'method candidate — not adopted', 'Ontology facilitators with domain review', 'PDTF 1.0 methodology evidence; ADR-0074 non-inheritance rule', 'A governance decision selects a bounded analytical profile'),
  item('gUFO', 'Version 1.0.0 is available; no term-level profile selected', 'Possible OWL implementation of selected UFO distinctions', 'Deferred; no import or term reuse', 'reference', 'deferred — not adopted', 'Ontology facilitators with Interoperability', 'PDTF 1.0 annotation precedent only', 'A selected UFO method requires reviewed reusable terms'),
  item('OntoClean', 'No method profile selected', 'Rigidity, identity and valid subsumption checks', 'Design-quality method only; no runtime dependency', 'reference', 'method candidate — not adopted', 'Ontology facilitators with domain review', 'PDTF 1.0 methodology evidence; ADR-0074 non-inheritance rule', 'A governance decision selects a bounded quality method'),
  item('DOLCE', 'No edition selected', 'Historical comparison for foundational distinctions', 'No SPDTF 2.0 disposition, import or conformance claim', 'reference', 'historical PDTF 1.0 reference only', 'Ontology facilitators', 'PDTF 1.0 methodology evidence', 'A new competency question justifies a separately reviewed comparison'),
]);

export function standardAnchor(record) {
  return `standard-${record.name.toLocaleLowerCase('en-GB')
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '')}`;
}

export function validateStandardsProfile() {
  const required = [
    'name', 'versionBoundary', 'purpose', 'conformance', 'mechanism', 'status',
    'governanceStatus', 'owner', 'evidence', 'reopenTrigger', 'implementationStatus',
    'specificationMaturity', 'exactSnapshot', 'source', 'implementationEvidence',
    'candidateSnapshot', 'profileSource', 'lastChecked',
  ];
  if (new Set(STANDARDS_PROFILE.map(({ name }) => name)).size !== STANDARDS_PROFILE.length) throw new Error('Standards profile names must be unique');
  if (new Set(STANDARDS_PROFILE.map(standardAnchor)).size !== STANDARDS_PROFILE.length) throw new Error('Standards profile anchors must be unique');
  for (const record of STANDARDS_PROFILE) {
    if (required.some((field) => !record[field])) throw new Error(`Incomplete standards record: ${record.name}`);
    if (!STANDARDS_MECHANISMS.includes(record.mechanism)) throw new Error(`Invalid standards mechanism: ${record.mechanism}`);
  }
  return true;
}
