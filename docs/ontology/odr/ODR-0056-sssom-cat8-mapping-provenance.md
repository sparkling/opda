---
status: accepted
date: 2026-09-05
tags: [modelling-method, mappings, sssom]
supersedes: []
amends: []
depends-on: [ODR-0051, ODR-0052, ODR-0058, ODR-0059, ODR-0064]
implements: []
---

# SSSOM provenance for cross-context mappings

## Context and Problem Statement

A SKOS correspondence tells a consumer how two meanings relate. It does not by
itself identify the versions examined, the matching process or the date of the
decision. Free-text notes and generic production provenance cannot provide a
consistent, exchangeable mapping record. Internal mappings need this evidence as
much as mappings to external vocabularies.

## Considered Options

- Add a bounded SSSOM profile over retained SKOS mapping statements.
- Keep narrative notes as the only mapping evidence.
- Invent a mapping vocabulary from generic provenance annotations.

## Decision Outcome

Adopt SSSOM 1.0 as additive mapping metadata. SKOS remains the correspondence
predicate layer. SEMAPV supplies matching-process values, not a rival set of
mapping attributes. Store named RDF 1.2 reifiers under
[ODR-0058](ODR-0058-cat8-reification-rdf12-triple-terms.md).

### Consequences

- Good, because existing SKOS queries and evidence-aware consumers can coexist.
- Good, because mapping decisions carry explicit source and release boundaries.
- Bad, because canonical storage needs demonstrated RDF 1.2 triple-term support.
- Neutral, because generic activity provenance remains a separate concern.

### Confirmation

This is the required method, not an assertion of existing OPDA mapping coverage.
Implementation must demonstrate retained assertions, reifier identity, all required
slots, negative fixtures, version pinning and deterministic exports. Empty mapping
sets do not defer the method or constitute positive conformance evidence.

## Rules

### R1: Preserve the correspondence

Retain every approved `skos:exactMatch`, `skos:closeMatch`, `skos:broadMatch`,
`skos:narrowMatch` or `skos:relatedMatch` assertion. Its SSSOM record supplements
it; a reified description alone is not an assertion. Predicate choice must follow
[ODR-0059](ODR-0059-cross-context-identity-criterion-protocol.md), not a confidence threshold.

### R2: Canonical vocabulary and local profile

Reference `https://w3id.org/sssom/` and `https://w3id.org/semapv/` directly, without
`owl:imports`. Local SHACL validates the profile. Its strengthened requirements
below are OPDA requirements, not misstatements of SSSOM's general cardinalities.

### R3: Mapping-record contract

| Field | Local requirement |
| --- | --- |
| Subject, predicate, object | Exactly one non-literal mapping statement identified through `rdf:reifies` |
| `sssom:subject_source` | Exactly one vocabulary or identifier-system IRI |
| `sssom:subject_source_version` | Exactly one pinned source version |
| `sssom:object_source` | Exactly one vocabulary or identifier-system IRI |
| `sssom:object_source_version` | Exactly one pinned source version |
| `sssom:mapping_set_id` | Exactly one versioned mapping-set release identifier |
| `sssom:mapping_justification` | Exactly one admitted SEMAPV matching-process class |
| `sssom:mapping_date` | Exactly one `xsd:date` |
| `sssom:confidence` | Optional single `xsd:double`, inclusive range 0–1 |
| `sssom:mapping_tool` | Optional single tool/algorithm name; omit when none generated the mapping |
| `sssom:predicate_modifier` | Optional single value, only `Not` |
| `sssom:comment` | Optional single curation note |

Missing required structure, invalid cardinalities, out-of-range confidence and an
invalid modifier are violations. Missing confidence or tool metadata is informational,
not a reason to fabricate values. `subject_id`, `predicate_id` and `object_id` are
SSSOM model slots; do not invent same-named canonical RDF predicates. The released
OWL binding uses `owl:annotatedSource`, `owl:annotatedProperty` and
`owl:annotatedTarget`; our canonical carrier uses the triple term instead.

A source IRI names the vocabulary or identifier system, not a bounded-context label
and not necessarily an endpoint's lexical namespace. Within strategic context-map
applicability it must resolve to the governed identifier-system object required by
[ODR-0064](ODR-0064-sparql-queryable-ddd-context-maps.md).

The admitted SEMAPV process values are `MappingReview`, `ManualMappingCuration`,
`LogicalReasoning`, `LexicalMatching`, `CompositeMatching`, `UnspecifiedMatching`,
`SemanticSimilarityThresholdMatching`, `LexicalSimilarityThresholdMatching`,
`MappingChaining`, `MappingInversion`, `StructuralMatching`, `InstanceBasedMatching`
and `BackgroundKnowledgeBasedMatching`, under the canonical SEMAPV namespace.

The profile excludes `sssom:author_id`, including from shapes and derived exports.
This preserves the 30 August amendment: the standard's optional author slot still
exists, but the selected profile does not invent an agent merely to populate it.
Human accountability is not removed. Tool names are not substitute authors or PROV
agents. Endpoint labels, similarity scores, reviewer metadata, licence, tool versions
and other unselected slots must not be silently invented or presented as asserted.

### R4: Named statement identity

Every mapping has a stable named reifier IRI and exactly one `rdf:reifies` arc to
its statement. Blank-node reifiers and independent hand-edited duplicate carriers
are not the canonical form. Keep the SKOS assertion alongside the reifier.
OWL annotation-axiom and TSV representations are generated views.

### R5: Mapping confidence is not production provenance

Use `sssom:confidence` for mapping confidence. A generic local extraction-confidence
property must not duplicate it. Category 9 may separately describe the production
activity, its agents and derivations. Matching justification classifies the process;
it does not identify a software agent or certify truth.

### R6: One authoritative representation

Canonical Turtle is the input. `.sssom.tsv` may support review or interchange but
must be regenerable, not a second committed input. Exporters preserve endpoint
identity, source versions, release, date, justification and permitted optional fields.

### R7: Concern boundary

Endpoints, correspondence, matching process and mapping curation belong in Category
8. How an artefact was produced belongs in Category 9. Neither profile is a shortcut
around the other's validation or an excuse to apply generic lineage to strategic
records whose history is specifically restricted.

## More Information

- [SSSOM](https://w3id.org/sssom/)
- [SEMAPV](https://w3id.org/semapv/)
- Source-method record: ODR-0087, revision `67174057e6384b79d0b28b7736fe70a66e112895`.

## Amendments

- **2026-09-05 — OPDA adaptation.** Preserves the active 25 and 30 August profile
  corrections, named-carrier amendment and Category 8/9 separation. Source votes,
  migration receipts and runtime installation claims are not OPDA evidence.
