---
status: accepted
date: 2026-09-05
updated: 2026-09-05
tags: [semantic-modelling, modelling-method]
supersedes: []
amends: []
depends-on: [ODR-0046, ODR-0048, ODR-0050, ODR-0052, ODR-0063]
implements: []
---

# Temporal state, validity and recorded history

## Context and Problem Statement

When a property-related state applies and when it was recorded are different facts. A vocabulary hierarchy cannot express transition order, and replacing current state loses evidence of change.

This is an OPDA method decision adapted from source record 0071j at revision
`67174057e6384b79d0b28b7736fe70a66e112895`. Its number is local to this repository.
The decision adopts the scoped method, not the originating implementation or its approval history.

## Decision Drivers

- Preserve accountable meaning across independently evolving property contexts.
- Keep semantic commitments, validation and implementation evidence distinguishable.
- Make the adopted rules usable by practitioners and implementers in this repository.

## Considered Options

- Store only a current state and timestamp.
- Use SKOS hierarchy as a state machine.
- Represent immutable transitions and bounded OWL-Time intervals with optional snapshots.

## Decision Outcome

Use canonical OWL-Time terms without owl:imports and a governed local transition profile. Valid time and recorded time remain distinct.

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

### Time vocabulary

Select Instant, Interval, ProperInterval and DateTimeInterval; inXSDDateTimeStamp, hasBeginning, hasEnd, before, after, intervalDuring and intervalMeets. Additional interval relations require a concrete query and profile extension. Do not import the entire temporal ontology merely to use those IRIs.

### Immutable transition records

A transition record is an immutable prov:Entity identifying the subject, previous state, new state and effective instant. Optional prov:generatedAtTime records transaction time on that entity; wasGeneratedBy identifies the activity that recorded it. Activities have their own start/end times.

### State values and adjacency

Use state concepts in a locally closed StateSpace concept scheme. previous/new state values must be distinct and belong to the same typed state space. Allowed one-step successors use a dedicated local relationship. skos:broader/narrower retain conceptual hierarchy and must not encode permitted transitions.

### Snapshots

The transition chain is primary. Snapshot resources are optional computed views with subject and instant; explicit supersession can represent snapshot version chains. Do not require snapshots when the transition query already answers the need.

### Core validation

Require transition subject, prior/new states and effective time. Require state-space typing and explicit closure; a useful state space normally has at least two states, recorded as advisory. Instants require xsd:dateTimeStamp values. Proper intervals require beginning and end with end later than beginning. Snapshots require subject and time.

### Declaration validation

Temporal declarations must document their OWL-Time use via a canonical term reference, the Recommendation URL, a property’s time-class constraint or a truthful vocabulary relationship. Definitions and ontology ownership are also required. Domain inheritance from an upper ontology remains prohibited by the more specific foundational rule.

### Deferred consistency

Do not silently reinstate the source’s removed overlapping-interval StateConsistencyShape. Any broader temporal consistency layer needs an activating requirement and scoped implementation. The named six-surface source profile is a target boundary, not evidence of six OPDA validators.

### Scope

Temporal state is about domain change. Extraction time belongs to provenance; a calendar period is ordinary domain data using temporal terms. The omitted process-modelling category is not imported through a triggeredBy property. A causative activity may be referenced through the retained provenance profile.

### Preserved correction

The 28 August amendment places generatedAtTime on the transition entity and introduces dedicated state adjacency. Earlier recordedAt shortcuts, timestamps on the wrong resource, and SKOS-as-transition conventions are not adopted.

## More Information

- [ODR-0046](ODR-0046-ontology-modelling-category-framework.md) — related local method decision.
- [ODR-0048](ODR-0048-cat2-vocabulary-taxonomy-pipeline-adoption.md) — related local method decision.
- [ODR-0050](ODR-0050-cat7-validation-constraints-pipeline-adoption.md) — related local method decision.
- [ODR-0052](ODR-0052-cat9-extraction-provenance-prov-o-adoption.md) — related local method decision.
- [ODR-0063](ODR-0063-no-foundational-grounding-by-subsumption.md) — related local method decision.

The source identifier and revision are retained for traceability in
[the method adoption crosswalk](./method-adoption-crosswalk.json).
References to unadopted source decisions are not links to same-numbered local records:
their relevant limits are restated here, and they confer no wider adoption.

## Amendments

- 2026-09-05 — Rewritten and renumbered for OPDA; selected normative rules and applicable
  amendment precedence preserved. Source-specific examples, organisation identifiers,
  operational paths, votes and implementation receipts were not transferred.
