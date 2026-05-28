---
entityUri: opda:Vouch
kind: entity
module: claim
sourceTtl: source/03-standards/ontology/opda-claim.ttl
tier: concept
title: Vouch
---

# Vouch

Vouch is the **short-name alias** for [Vouch Evidence](./vouch-evidence.md). The two names refer to the same OWL identity — Vouch exists so worked-example data (the diagnostic exemplar set) can use the short form without losing alignment with the long-name canonical form that downstream shapes and annotations target.

## Why it matters

Same rationale as [Document](./document.md) and [Electronic Record](./electronic-record.md) — exemplars use short names; shapes and annotations target long names; OWL equivalence makes both equivalent.

## Hard cases

- **Mixed use within one consumer.** Same situation as for the other aliases — OWL equivalence binding handles it.

## Identity Criterion

See [Vouch Evidence](./vouch-evidence.md) — Vouch inherits the same IC by OWL equivalence binding. See the [Logical tier →](../../logical/claim/vouch.md) for the typed structure.

## Related Kinds

- [Vouch Evidence](./vouch-evidence.md) — the canonical long-name form

### Related-Kinds graph

![vouch-short-name-alias-related-kinds-neighbourhood-graph](diagrams/vouch/vouch-short-name-alias-related-kinds-neighbourhood-graph.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base"}}%%
flowchart LR
    accTitle: Vouch short-name alias related-Kinds neighbourhood graph
    accDescr: Vouch as the OWL-equivalent short-name alias for Vouch Evidence; used by worked-example data while SHACL shapes and DPV annotations target the long-name form.

    classDef centre fill:#FFF9C4,stroke:#F57F17,stroke-width:3px,color:#E65100
    classDef cls fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B

    Vouch["Vouch<br/>(alias)"]:::centre
    VouchEv["VouchEvidence<br/>(canonical)"]:::cls

    Vouch ===|"owl:equivalentClass"| VouchEv
```

</details>

## Source ODR

[ODR-0009 — Claims, evidence, provenance §Q1](../../../ontology/odr/ODR-0009-claims-evidence-provenance.md)
