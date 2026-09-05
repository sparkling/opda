---
status: accepted
date: 2026-09-05
tags: [modelling-method, classification, metadata]
supersedes: []
amends: []
depends-on: [ODR-0036, ODR-0037, ODR-0049]
implements: []
---

# Dublin Core annotations alongside classification metadata

## Context and Problem Statement

Business classification and administrative description answer different questions.
A classification says which subject area, sensitivity or lifecycle facet applies.
A record also needs a title, originator and dates. Reusing a standard for those
administrative facts avoids inventing a parallel metadata language, but must not
replace the classification model with superficially similar Dublin Core terms.

## Considered Options

- Adopt a bounded Dublin Core Terms annotation layer alongside the facet model.
- Use concept labels alone, leaving authorship and publication dates unspecified.
- Admit the entire Dublin Core vocabulary or invent equivalent local properties.

## Decision Outcome

Adopt the bounded annotation layer. Classification remains governed by
[ODR-0049](ODR-0049-cat5-classification-metadata-pipeline-adoption.md).
Dublin Core describes the classification record; it does not supply an alternative
business classification system.

### Consequences

- Good, because administrative metadata is recognisable to linked-data consumers.
- Good, because a small profile preserves the distinction between record and meaning.
- Bad, because publishers must validate both metadata and classification completeness.
- Neutral, because other Dublin Core uses need their own explicit scope and decision.

### Confirmation

Accepted as OPDA modelling method, not a claim that candidate exports already
implement these shapes. Delivery requires positive and negative fixtures for every
cardinality, datatype and classification obligation below. No source-system council
vote, implementation receipt or catalogue deployment is claimed as OPDA evidence.

## Rules

### R1: Orthogonal layers

The seven-facet framework remains authoritative for classification. A Dublin Core
property MUST NOT displace subject area, data classification, governance tier,
volatility, regulatory relevance, lifecycle stage or value-chain position. Titles
and creators describe a record, not an additional classification axis.

### R2: Bounded terms

| Term | Local requirement | Validation consequence |
| --- | --- | --- |
| `dct:title` | Exactly one language-tagged title | Violation |
| `dct:creator` | One or more originators | Warning when absent |
| `dct:issued` | Exactly one first-publication date, `xsd:date` | Warning |
| `dct:modified` | Exactly one last-modification date, `xsd:date` | Warning |
| `dct:identifier` | At most one stable external identifier, IRI or literal | Informational completeness check |

`dct:subject` MAY be added on an explicit modeller request, only to reference the
SKOS ConceptScheme backing the subject-area facet. Other terms are not implicitly
adopted for Category 5; additions require an amendment. This is a local restriction,
not a statement that other Dublin Core terms are invalid in the standard.

### R3: Reference without importing

Use canonical `http://purl.org/dc/terms/` IRIs. Do not emit `owl:imports` to obtain
the vocabulary. Local SHACL contracts enforce cardinality, dates and language-tagged
titles. Referencing an external IRI and loading its entire ontology are different acts.

### R4: Catalogue boundary

The upstream decision coupled its delivery to a separate DCAT adoption. OPDA's
selected scope does not adopt that catalogue decision or a data-product concern.
Consequently this local record does not require an out-of-scope DCAT implementation.
If a catalogue profile is adopted later, its metadata dependencies must be delivered
coherently; this record cannot be cited as approval for that profile.

### R5: Both layers are required

Every resource claiming the Category 5 profile MUST have its title and the complete
seven-facet annotation set. A title without facets, or facets without a title, fails
that profile. Validate the administrative layer and the facet layer separately so
one cannot mask omissions in the other. The seventh facet is value-chain position.

### R6: Applicability is not validation

Apply [ODR-0037](ODR-0037-domain-range-as-documentation.md) to local property
applicability. Its later correction governs: standard RDFS domain and range retain
their entailment semantics. Inclusion hints do not behave as RDFS constraints, and
switching a reasoner off does not redefine any vocabulary. SHACL supplies the local
delivery-validation contract.

## More Information

- [Dublin Core Terms](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/)
- Source-method record: ODR-0086, pinned revision `67174057e6384b79d0b28b7736fe70a66e112895`.

## Amendments

- **2026-09-05 — OPDA adaptation.** Renumbered and rewritten for the selected
  modelling scope. Preserved the five-term profile, conditional subject term,
  orthogonality and seven-facet requirements. Removed unrelated catalogue delivery
  coupling and source-specific execution history; applied the later property
  applicability correction rather than carrying forward its obsolete explanation.
