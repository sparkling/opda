---
status: accepted
date: 2026-08-03
updated: 2026-08-19
tags: [ontology, property-pack, greenfield, provenance, toml, generation, semantic-modelling]
supersedes: []
depends-on: [ADR-0039]
implements: [scripts/property_pack_catalogue.py, scripts/property_pack_candidate.py, src/data/property-pack, source/03-standards/ontology-candidates/property-pack/0.1, src/pages/modelling/property-pack.astro]
---

# The 451 required Property Pack data points are the closed seed scope for a greenfield ontology

## Context and Problem Statement

The first OPDA ontology was generated from the existing JSON schemas and their form overlays.
That work proved the linked-data toolchain, but its semantic foundation inherited the source
tree's weaknesses: uneven domain engagement, form-driven additions, weak definitions, accidental
identity decisions, and a tendency to treat nested fields as if the nesting already described
resources and relationships.

OPDA now has a narrower, concrete starting point. A Property Pack workbook contains exactly 451
rows marked `Required`. Maria Harris described the intended core as “principally the c.450
‘required’ data fields” and asked OPDA to build consensus before taking a proposal to DPMSG.
These items give the work a closed coverage boundary without dictating the ontology structure.

The evidence is not semantically complete. Of the 451 rows, 283 are conditionally required, 133
traverse arrays, and 240 have no workbook description. The local v3.5 schema corroborates every
path and source datatype, but it is part of the legacy design and is not authority for the new
model's resources, relationships, attributes, identities or bounded-context ownership.

## Decision Drivers

- Start with a finite scope that stakeholders can verify and vote on.
- Preserve every source obligation without recreating a JSON tree as an ontology.
- Distinguish source facts, legacy corroboration, machine-drafted candidates and approved
  semantic decisions.
- Make conditional requiredness, repeatable contexts and missing constraints visible.
- Keep one maintained source and generate the JSON and web views deterministically.
- Retain the ontology-led direction of ADR-0039 while withdrawing full-schema round-trip as an
  acceptance condition for the greenfield model.
- Keep the current published ontology intact until a separately governed migration is ready.

## Considered Options

### A — Repair the existing schema-derived ontology in place

Rejected. It would preserve unreviewed structural assumptions and make it difficult to tell a
deliberate semantic decision from inherited schema topology.

### B — Generate 451 RDF properties, one for each workbook row

Rejected. Repeated terminal names, conditional branches and nested paths show that the workbook
is a document/profile view. A one-row/one-predicate transformation would simply restate the tree.

### C — Treat the 451 rows as a closed evidence scope and model their meaning afresh

Accepted. The list fixes coverage while leaving resource identity, relationships, attributes,
controlled vocabularies, constraints and bounded-context ownership open to explicit review.

## Decision Outcome

Build a new, greenfield ontology whose closed initial business-data scope is exactly the 451 rows
marked `Required` in the authoritative Property Pack workbook.

The previous ontology, full PDTF schema, optional fields and form overlays do **not** seed semantic
assertions in this model. They may be consulted for attributed audit, comparison and migration
analysis, but may not silently add a source field, term, restriction or vocabulary.

The 451 rows are source data points—not a mandate to emit exactly 451 RDF properties or entities.
Modelling may consolidate repeated fields or introduce the classes, relationships, shapes and
vocabulary concepts needed to represent their meaning correctly. Every business construct must
trace to at least one stable source-item identifier. Supporting technical constructs must trace
to a named foundational standard and record why they are necessary.

The Property Pack is an exchange/delivery profile spanning bounded contexts, not a universal
bounded context. Each source item must receive an owning context and may identify consuming
contexts. Cross-boundary terms and mappings require explicit interoperability review.

### Maintained source and projections

The enriched TOML catalogue is the single maintained source:

- [`catalogue.toml`](../../src/data/property-pack/catalogue.toml) records scope, provenance,
  checksums and fragment order;
- [`properties/*.toml`](../../src/data/property-pack/properties/) records all 451 items;
- [`required-properties.json`](../../src/data/property-pack/required-properties.json) is a
  deterministic generated projection, never an independently edited copy;
- [`validation-report.json`](../../src/data/property-pack/validation-report.json) is the
  deterministic validation receipt;
- [`candidate-model/`](../../src/data/property-pack/candidate-model/) is the separate maintained
  source for machine-proposed semantic decisions; it does not overwrite the evidence catalogue;
- [`ontology-candidates/property-pack/0.1/`](../../source/03-standards/ontology-candidates/property-pack/0.1/)
  is the deterministic, isolated RDF, SHACL, vocabulary, glossary, dictionary and trace projection;
- `/modelling/property-pack` reads the generated JSON and is a local working view, not an
  authorised publication of the revised modelling strategy.

Each TOML record must distinguish:

1. workbook source facts;
2. attributed legacy-schema corroboration;
3. machine-drafted labels and definitions;
4. unresolved or human-approved modelling decisions;
5. provenance, confidence, review and approval state.

The initial catalogue intentionally sets ontology role, owning context, resource, relationship,
attribute, vocabulary scheme and IRI to unresolved values. This is a safeguard, not missing data:
the old tree receives no semantic authority by default.

### Scope changes

No optional or additional business data point may enter the seed scope without a recorded change
decision and a regenerated validation baseline. Documents, discussions and AI councils may
explain, challenge and enrich the 451 items; they may not silently enlarge the source list.

## Validation and Acceptance Criteria

### Source integrity

- Exactly 451 unique stable IDs, full source paths and workbook rows.
- Every required workbook row is accounted for; no optional workbook row is included.
- Workbook, worksheet, checksums and extraction date are recorded.
- Duplicate paths, missing values and source/schema type conflicts fail validation.
- Maria's “c.450” email corroborates scope but is not substituted for the field list or cited as
  evidence of final approval.

### Semantic catalogue

- Every record exposes source and candidate definitions separately.
- Source datatype, candidate XSD datatype, relative cardinality, conditional requiredness,
  repeatable context, formats, ranges and permitted values are explicit or recorded unknowns.
- Ontology role, owning/consuming contexts, resource, relationship, attribute, IRI, vocabulary,
  sensitivity, quality and review state are explicit or recorded unresolved values.
- Conditional requirements are not flattened into unconditional `sh:minCount 1`.
- Controlled values are candidates for rationalisation, not automatically one scheme per field.

### Traceability and generation

- Every future ontology term or SHACL path traces to one or more source-item IDs.
- Nothing outside the closed list is represented as another Property Pack source item.
- TOML-to-JSON generation is deterministic and byte drift fails the test suite.
- A second generation is byte-identical.
- The local web view reports 451 items and clearly labels their review and approval status.

### Release governance

ADR-0067 now decides the candidate architecture, field-to-term split/consolidation rules and
context-home policy. The generated dispositions remain machine proposals: working groups must
review domain meaning, the Interoperability Working Group must review the common boundary and
mappings, and recorded human approval is still required before a semantic release.

## Consequences

- Good, because coverage is finite, testable and directly reconciles with Maria's “c.450” scope.
- Good, because the new ontology cannot accidentally inherit optional or overlay-driven scope.
- Good, because source evidence and semantic judgement remain visibly separate.
- Good, because the catalogue exposes uncertainty as a review queue rather than invented fact.
- Neutral, because the 451-item profile will distribute across several bounded contexts.
- Neutral, because the local web view is a modelling tool; publication remains separately
  governed and is not authorised by this ADR.
- Bad, because the initial catalogue contains unresolved model roles and low-confidence drafted
  definitions; substantial domain review is still required.
- Bad, because the greenfield model will not initially round-trip the full legacy PDTF schema.
- Bad, because the old published ontology and new candidate model must coexist until migration is
  explicitly approved.

## Implementation Status

| Slice | State | Evidence |
|---|---|---|
| Extract and reconcile the 451-row baseline | Complete | [Validation report](../../src/data/property-pack/validation-report.json) |
| TOML single source and deterministic JSON | Complete | [`property_pack_catalogue.py`](../../scripts/property_pack_catalogue.py) |
| Searchable local working view | Complete | `/modelling/property-pack` |
| Domain/context ownership candidates | Generated; human review pending | All 451 items have one proposed semantic home; common contains one source item |
| Resource/relationship/attribute classification | Generated; human review pending | Every item reaches one or more of 159 traced candidate resources |
| Vocabulary rationalisation and definition review | Generated; human review pending | 14 candidate SKOS schemes; definitions remain machine-proposed |
| New ontology, SHACL shapes and context map | Public review candidate | Isolated corpus; 56 deterministic checks pass; no cross-context equivalence asserted |
| Public migration/replacement of current pages | Not authorised | The separate V2 review section is published; replacing current pages still requires a migration decision |

## Evidence and Related Decisions

- [451-item evidence validation](../research/property-pack-451-evidence-validation.md)
- [ADR-0039 — Linked-data model as the foundation](./ADR-0039-linked-data-model-as-pdtf-standards-foundation.md)

## Amendments

- **2026-08-03 — Accepted by operator.** The operator selected the 451 required Property Pack
  items as the greenfield starting scope and explicitly rejected the previous ontology and schema
  topology as foundations for the new model.
- **2026-08-04 — Local candidate implemented.** Added a separate TOML semantic source, exact
  451-item trace projection, 159-resource ontology candidate, 14 controlled vocabularies,
  context-owned SHACL shapes and a fail-closed deterministic validation receipt. All semantic
  dispositions remain machine proposals pending human review.
- **2026-08-04 — Public review authorised.** The operator authorised publication of the isolated
  candidate under the V2 review section. Publication makes the candidate reviewable; it does not
  approve its semantics or replace the current ontology.
- **2026-08-19 — SPDTF 2.0 lineage and review sequence clarified by ADR-0075.** The `/v2/**`
  corpus is the Property Pack ontology within SPDTF 2.0, not an external development input. The
  original PDTF 1.0 schema contains the complete 451-item source scope and its extracted ontology
  is expected to contain corresponding semantic coverage, but a maintained item-to-ontology
  crosswalk must verify that expectation. The Technical Working Group makes the accelerated
  September determination; wider domain-group review and controlled revision follow later.
