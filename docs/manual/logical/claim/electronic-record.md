# Electronic Record

## Summary

Short-name alias for [ElectronicRecordEvidence](./electronic-record-evidence.md) retained for exemplar compatibility. [Substance Kind (informational; alias)]. `owl:equivalentClass` binding ensures one OWL identity; downstream shapes + annotations target the long name.
[Concept tier →](../../concept/claim/electronic-record.md)

## Attributes

Inherits all attributes from `ElectronicRecordEvidence` via `owl:equivalentClass` binding.

## Relationships

Inherits all relationships from `ElectronicRecordEvidence` via `owl:equivalentClass` binding.

## Identity key

Same identity as `ElectronicRecordEvidence`.

## Constraints

Inherits all constraints from `ElectronicRecordEvidence`.

## Derived attributes

None.

## ER diagram

![electronicrecord--entity-relationship-diagram](diagrams/electronic-record/electronicrecord--entity-relationship-diagram.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
erDiagram
    accTitle: ElectronicRecord — Entity-Relationship Diagram
    accDescr: Short-name alias view — ElectronicRecord is owl:equivalentClass of ElectronicRecordEvidence.

    ElectronicRecordEvidence ||--|| ElectronicRecord : "owl:equivalentClass"
```

</details>

## Source ODR + ADR

- [ODR-0009 — Claims + Evidence + Verification](../../../ontology/odr/ODR-0009-claims-evidence-verification.md), §Q1 + ADR-0011 short-name alias pattern (option b)
- [ADR-0011 — Module TBox emission](../../../adr/ADR-0011-module-tbox-emission.md) — implementation
