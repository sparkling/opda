---
status: accepted
date: 2026-09-05
updated: 2026-09-05
tags: [semantic-modelling, modelling-method]
supersedes: []
amends: []
depends-on: [ODR-0037, ODR-0046, ODR-0048, ODR-0050, ODR-0052, ODR-0053, ODR-0057]
implements: []
---

# Sensitivity classification and bounded policy modelling

## Context and Problem Statement

Classifying confidential or personal information helps people judge intended use, but such annotations do not enforce access or establish legal compliance. Policy objects and runtime enforcement require separate commitments.

This is an OPDA method decision adapted from source record 0071k at revision
`67174057e6384b79d0b28b7736fe70a66e112895`. Its number is local to this repository.
The decision adopts the scoped method, not the originating implementation or its approval history.

## Decision Drivers

- Preserve accountable meaning across independently evolving property contexts.
- Keep semantic commitments, validation and implementation evidence distinguishable.
- Make the adopted rules usable by practitioners and implementers in this repository.

## Considered Options

- Treat sensitivity as an extra generic data-type facet.
- Import a broad privacy ontology as the domain model.
- Use local classifications mapped to DPV, with staged qualified policy adoption.

## Decision Outcome

Adopt a bounded DPV-oriented classification profile. Reuse reviewed canonical concepts through mappings, retain staged implementation, and qualify ODRL only through its explicitly adopted DPV profile.

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

### Classification areas

The initial semantic areas are sensitivity, personal-data flag/category, applicable regulation, processing purpose, lawful basis, residency/transfer and access level. Sensitivity is orthogonal to master/reference/transactional data classification. It is not an eighth general facet.

### Vocabulary ownership

Govern sensitivity levels, personal-data categories, regulations, lawful bases, retention actions, residency/transfer values and access levels as distinct schemes. A jurisdiction, transfer basis and purpose do not become interchangeable because they appear in one interface. Map only reviewed applicable concepts to canonical DPV/DPV-PD/legal concepts; no blanket exactMatch.

### Applicability and semantics

Annotations classify local classes and properties without imposing DPV processing-activity semantics on those classes. Use exclusive applicability mechanisms for alternative class/property targets. Local purpose/lawful-basis bindings must use the amended governed scheme/object representation where applicable, rather than blindly retaining historical free-text fields.

### Phase boundaries

Start with classification metadata. Introduce retention schedules, access policies and purpose declarations when qualified assertion use is required. Machine-executable policy is conditional under ODR-0057. Neither this staging nor a populated annotation authorises runtime access decisions.

### Reified classification integrity

A qualified sensitivity classification requires exactly one subject IRI and one level in the sensitivity scheme; classification time and actor have scoped cardinality/provenance requirements. A personal-data binding requires one property IRI and one boolean flag; true requires a category, and every provided category must belong to the proper scheme.

### Boundary and meta-shapes

The selected surface comprises those two qualified assertion profiles, the DPV/ODRL boundary validator, scheme completeness and explicit annotation-property documentation/ownership targeting. Targets must catch absent ownership bindings, not select only already-bound subjects. Preserve advisory provenance/documentation severity and structural Violation severity.

### Deferred enforcement

Regulation-to-lawful-basis conditionals, retention and access-policy completeness, and sensitivity-escalation checks remain staged pending a scoped decision. Do not claim the historical six named shapes exist: the later five-surface decomposition replaced it, with explicit deferred obligations.

### Scope limits

Governance ownership/approval, generic SHACL infrastructure and operational access enforcement remain separate. This record does not adopt the excluded governance ontology through a reference to policy. Named-graph segregation can support operational separation but is not itself authorisation enforcement.

### Preserved amendments

Carry the 28 August applicability correction, the reified-binding membership corrections, explicit metadata targets, and the ODRL conditional human-curation boundary. Organisation-specific scheme members, source runtime paths and historical implementation claims are not adopted.

## More Information

- [ODR-0037](ODR-0037-domain-range-as-documentation.md) — related local method decision.
- [ODR-0046](ODR-0046-ontology-modelling-category-framework.md) — related local method decision.
- [ODR-0048](ODR-0048-cat2-vocabulary-taxonomy-pipeline-adoption.md) — related local method decision.
- [ODR-0050](ODR-0050-cat7-validation-constraints-pipeline-adoption.md) — related local method decision.
- [ODR-0052](ODR-0052-cat9-extraction-provenance-prov-o-adoption.md) — related local method decision.
- [ODR-0053](ODR-0053-cat10-temporal-state-history-adoption.md) — related local method decision.
- [ODR-0057](ODR-0057-odrl-cat11-dpv-profile.md) — related local method decision.

The source identifier and revision are retained for traceability in
[the method adoption crosswalk](./method-adoption-crosswalk.json).
References to unadopted source decisions are not links to same-numbered local records:
their relevant limits are restated here, and they confer no wider adoption.

## Amendments

- 2026-09-05 — Rewritten and renumbered for OPDA; selected normative rules and applicable
  amendment precedence preserved. Source-specific examples, organisation identifiers,
  operational paths, votes and implementation receipts were not transferred.
