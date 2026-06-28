---
entityUri: opda:Survey
kind: entity
module: descriptive
sourceTtl: source/03-standards/ontology/opda-descriptive.ttl
tier: logical
title: Survey
---

# Survey

## Summary

Authority-retrieved professional survey report. [Substance Kind (informational); UFO Substance Kind / DOLCE NonPhysicalEndurant / PROV-O Entity]. Identity criterion: distinct provenance chain per S008 Q4 three-criterion test (authority-retrieved provenance via `prov:wasGeneratedBy` chain to professional-issued activity; distinct lifecycle — issued / superseded / re-issued / withdrawn). Hard cases: re-survey; supersession; withdrawal.
[Concept tier →](../../concept/descriptive/survey.md)

## Attributes

This entity declares no module-local datatype properties. Survey-specific facets (survey type, surveyor identity, report URL etc.) are emitted via overlay profiles or via the inherited PROV-O qualified-attribution chain.

## Relationships

This entity declares no module-local object properties. The class-promotion IC requires that each Survey carries `prov:wasGeneratedBy` to its issuing activity (typically a professional-survey Activity).

## Identity key

Identity key = `prov:wasGeneratedBy` to the issuing activity. The Activity carries the (surveyor, timestamp, professional-registration) tuple that disambiguates Survey instances. Cross-reference: Concept-tier [Survey IC narrative](../../concept/descriptive/survey.md#identity-criterion).

## Constraints

- Survey MUST carry `prov:wasGeneratedBy` to its issuing activity per ODR-0008 §Q4a three-criterion test (`Violation`, `SurveyIdentityKeyShape`)

## Derived attributes

None.

## ER diagram

![survey--entity-relationship-diagram](diagrams/survey/survey--entity-relationship-diagram.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
erDiagram
    accTitle: Survey — Entity-Relationship Diagram
    accDescr: Survey — concerns a Property and carries PROV-O wasGeneratedBy to its issuing professional-survey Activity.

    Survey }o--|| Property : "concerns"
    Survey }o--|| Activity : "prov:wasGeneratedBy"
```

</details>

## Lifecycle state-transition diagram

Survey lifecycle per S008 Q4 three-criterion test — issued, superseded by re-survey, re-issued (corrected), withdrawn.

![survey--lifecycle-state-transition-diagram](diagrams/survey/survey--lifecycle-state-transition-diagram.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
stateDiagram-v2
    accTitle: Survey — Lifecycle State-Transition Diagram
    accDescr: Survey lifecycle states — Issued by a professional-survey Activity, Superseded on re-survey, Reissued for correction, Withdrawn on rescission.

    [*] --> Issued : professional-survey Activity completes
    Issued --> Superseded : re-survey (new Survey supersedes prior)
    Issued --> Reissued : correction (same Survey identity)
    Reissued --> Superseded : re-survey
    Issued --> Withdrawn : withdrawal
    Superseded --> [*]
    Withdrawn --> [*]
```

</details>

## Source ODR + ADR

- [ODR-0008 — Descriptive attributes](/modelling/odr/odr-0008), §Q4a three-criterion class-promotion test
- [ADR-0011 — Module TBox emission](/modelling/adr/adr-0011) — implementation
- [ADR-0012 — SHACL + DPV annotation emission](/modelling/adr/adr-0012) — IdentityKey shape
