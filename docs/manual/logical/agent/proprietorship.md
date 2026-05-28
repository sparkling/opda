# Proprietorship

## Summary

UFO Relator (relational endurant) mediating [Property](../property/property.md) + [Proprietor](./proprietor.md) instances against a [RegisteredTitle](../property/registered-title.md). [Relator; UFO Relator]. Identity criterion = the `(Title, Persons-set)` tuple per S006 Q3. Joint-tenancy vs tenants-in-common is a property of the Relator, NOT of the Roles. Founding event recorded via `prov:wasGeneratedBy` on the registration activity.
[Concept tier →](../../concept/agent/proprietorship.md)

## Attributes

This entity declares no module-local datatype properties. The joint-tenancy / tenants-in-common discriminator is carried as a property of the Relator instance via the inherited PROV-O qualified-form predicates (`prov:qualifiedAssociation` → `prov:Association` → `prov:hadRole`).

## Relationships

This entity declares no module-local object properties beyond the meta-class `Relator` predicates. The Proprietorship binds a RegisteredTitle (carries the title-record context) and founds Proprietor Roles (the bearer set).

## Identity key

Identity key = `(RegisteredTitle, Persons-set)` tuple per ODR-0006 §Q3. The Relator's identity is independent of any single Proprietor Role's identity but is parasitic on the title-record and the founding-event context. Cross-reference: Concept-tier [Proprietorship IC narrative](../../concept/agent/proprietorship.md#identity-criterion).

## Constraints

No SHACL Violation/Warning shapes emitted on Proprietorship at this tier. The meta-class `Relator` discipline (mediates ≥2 bearers; founded by an event) is enforced by inspection of the bearer set + founding-event link rather than by an emitted shape.

## Derived attributes

None at this tier.

## ER diagram

![proprietorship--entity-relationship-diagram](diagrams/proprietorship/proprietorship--entity-relationship-diagram.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
erDiagram
    accTitle: Proprietorship — Entity-Relationship Diagram
    accDescr: Direct-neighbour view of Proprietorship Relator — binds RegisteredTitle, founds Proprietor Roles, mediates Property.

    Proprietorship }o--|| RegisteredTitle : "bindsTitle"
    Proprietorship ||--o{ Proprietor : "founds"
    Proprietorship }o--|| Property : "mediates"
```

</details>

## Source ODR + ADR

- [ODR-0006 — Agent + Roles + Relators](../../../ontology/odr/ODR-0006-agent-roles-relators.md), §Q3 Proprietorship Relator
- [ADR-0011 — Module TBox emission](../../../adr/ADR-0011-module-tbox-emission.md) — implementation
