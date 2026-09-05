---
status: accepted
date: 2026-09-05
updated: 2026-09-05
tags: [semantic-modelling, modelling-method]
supersedes: []
amends: []
depends-on: [ODR-0037, ODR-0046, ODR-0050, ODR-0051, ODR-0058]
implements: []
---

# Provenance, attribution and extraction quality

## Context and Problem Statement

The property model must distinguish a statement’s meaning from who extracted it, which evidence supports it and how confidently that extraction was made. Resource-wide attribution can become misleading when statements have mixed origins.

This is an OPDA method decision adapted from source record 0071i at revision
`67174057e6384b79d0b28b7736fe70a66e112895`. Its number is local to this repository.
The decision adopts the scoped method, not the originating implementation or its approval history.

## Decision Drivers

- Preserve accountable meaning across independently evolving property contexts.
- Keep semantic commitments, validation and implementation evidence distinguishable.
- Make the adopted rules usable by practitioners and implementers in this repository.

## Considered Options

- Use only editorial text.
- Reify every statement unconditionally.
- Use canonical PROV-O with resource attribution and selective statement qualification.

## Decision Outcome

Adopt a bounded canonical-IRI PROV-O profile without owl:imports. Use resource-level provenance only under the stated uniformity/immutability condition, and qualify mixed-origin statements selectively.

### Consequences

- Good, because the selected rules provide an explicit contract for reviewing property-model proposals.
- Good, because local decision links make the applicable method available with the website.
- Bad, because authors and implementers must maintain the distinctions and evidence described below.
- Neutral, because accepting this method does not establish conformance of an existing candidate or runtime.

### Confirmation

Implementation pending. This record is accepted as the selected modelling method.
No source validation result, completed checklist, council vote or delivered artefact is
transferred as evidence that OPDA has implemented it.

- [ ] Identify the local ontology/profile artefacts that implement each applicable rule.
- [ ] Record positive and negative conformance evidence against the selected package.
- [ ] Review domain examples and any introduced vocabulary with the responsible working group.
- [ ] Record exclusions, conditional activations and remaining implementation gaps explicitly.

## Rules

### R1 — Core model

Use PROV Entity, Activity and Agent/SoftwareAgent resources for generated information, extraction activities and tools. Preserve activity-to-qualified-association-to-plan grouping where the qualified pattern is used; do not impose single-association or single-plan cardinality without a separate decision. Represent repository/commit specialisation as provenance entities with proper location resources.

### R2 — Source file correction

A source-file path is a literal-valued local datatype property, independent of prov:atLocation. It cannot be a subproperty of that object-valued predicate. Document Activity/Entity intended subjects with schema:domainIncludes, and constrain the string with SHACL. This preserves the 28 August correction.

### R3 — Local metadata

Confidence is a decimal annotation between 0 and 1; line number is an integer annotation tied to the source revision; tool version is a descriptive datatype property on the software agent. These are local terms, not PROV-O terms. Their OPDA declarations and applicability waivers must be governed before emission.

### R4 — Hybrid granularity

Resource-level attribution is permitted when all statements share origin and confidence and the resource is created and validated as an immutable unit. Divergent attribution or confidence triggers statement-level RDF 1.2 reification. Do not add manually authored statements later while retaining an inaccurate uniform attribution.

### R5 — Additional vocabularies

Do not adopt PAV or a full DQV measurement model for a single extraction-confidence value. If additional quality dimensions justify a richer model, adopt a scoped compatible representation explicitly. Never create a cross-kind subproperty assertion merely as a convenient mapping.

### R6 — Four questions

Keep causal extraction origin, editorial modelling history, mapping-decision provenance and discovery-system origin distinct. A resource may carry all four, but a source-system name is not an extractor, and attribution is not proof of truth.

### R7 — Validation surface

The selected starting surface checks attributed resources, extraction activities and software agents. Validate generated/attributed links, confidence bounds, activity start and associated agent, agent label and optional tool version. The source’s reified-provenance, pipeline-completeness, qualified-association, plan and repository expansion shapes remain deferred pending an activating local decision; no delivered source count is an OPDA implementation claim.

### R8 — Conditional qualified generation

Generation-event qualification is conditional. If source-file, line or location details vary such that entity attribution is inadequate, activate prov:qualifiedGeneration through a reviewed local amendment. Retain wasGeneratedBy and entity attribution; move generation-event attributes to prov:Generation and revise shapes/applicability together. Existing resources require no automatic retroactive migration.

### Two independent qualifications

Statement reification handles mixed statement evidence; qualified generation handles attributes of the generation event. They can coexist. Activating one does not eliminate the other or silently activate deferred validation shapes.

## More Information

- [ODR-0037](ODR-0037-domain-range-as-documentation.md) — related local method decision.
- [ODR-0046](ODR-0046-ontology-modelling-category-framework.md) — related local method decision.
- [ODR-0050](ODR-0050-cat7-validation-constraints-pipeline-adoption.md) — related local method decision.
- [ODR-0051](ODR-0051-cat8-cross-domain-mappings-pipeline-adoption.md) — related local method decision.
- [ODR-0058](ODR-0058-cat8-reification-rdf12-triple-terms.md) — related local method decision.

The source identifier and revision are retained for traceability in
[the method adoption crosswalk](./method-adoption-crosswalk.json).
References to unadopted source decisions are not links to same-numbered local records:
their relevant limits are restated here, and they confer no wider adoption.

## Amendments

- 2026-09-05 — Rewritten and renumbered for OPDA; selected normative rules and applicable
  amendment precedence preserved. Source-specific examples, organisation identifiers,
  operational paths, votes and implementation receipts were not transferred.
