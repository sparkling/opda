---
entityUri: opda:AssuranceLevel
kind: entity
module: claim
sourceTtl: source/03-standards/ontology/opda-claim.ttl
tier: logical
title: Assurance Level
---

# Assurance Level

## Summary

Quality judgement on a [Claim](./claim.md)'s verification — eIDAS Level of Assurance (Low / Substantial / High) per OIDC trust tiering, plus the OPDA-specific PDTF-Standard intermediate level per ODR-0009 §Q3. [Quale-in-Region; UFO Quale-in-Region]. Backed by [AssuranceLevelScheme](./enumerations/assurance-level-scheme.md). Local term per S009 5-residue (PROV-O carries no notion of assurance grading).
[Concept tier →](../../concept/claim/assurance-level.md)

## Attributes

This entity is itself a Quale-in-Region — its instances are the four scheme members (Low / Substantial / High / PDTF-Standard). It declares no module-local datatype properties beyond those inherited from the scheme members (`skos:notation`, `skos:prefLabel`, etc.).

## Relationships

This entity declares no module-local object properties. The binding from a Claim to its AssuranceLevel uses the inherited `skos:related` / overlay-profile-specific predicates rather than a core-tier predicate.

## Identity key

Identity = scheme-member notation (one of `Low`, `Substantial`, `High`, `PDTF-Standard`). Each member is identified by its URI fragment within `AssuranceLevelScheme`.

## Constraints

No SHACL Violation/Warning shapes emitted on AssuranceLevel itself at this tier. Vouch-only Evidence caps the AssuranceLevel at `Low` regardless of voucher quality (S009 Q3 hard rule; enforced at the overlay-profile level).

## Derived attributes

None.

## ER diagram

![assurancelevel--entity-relationship-diagram](diagrams/assurance-level/assurancelevel--entity-relationship-diagram.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
erDiagram
    accTitle: AssuranceLevel — Entity-Relationship Diagram
    accDescr: AssuranceLevel Quale-in-Region — bound to Claim via assuranceLevel and member of AssuranceLevelScheme (eIDAS + PDTF-Standard).

    Claim }o--|| AssuranceLevel : "assuranceLevel"
    AssuranceLevel }o--|| AssuranceLevelScheme : "skos:inScheme"
```

</details>

## Source ODR + ADR

- [ODR-0009 — Claims + Evidence + Verification](/modelling/odr/odr-0009), §Q3 AssuranceLevel
- [ADR-0010 — SKOS vocabulary emission](/modelling/adr/adr-0010) — scheme implementation
- [ADR-0011 — Module TBox emission](/modelling/adr/adr-0011) — class declaration
