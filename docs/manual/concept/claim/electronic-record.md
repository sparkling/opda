---
entityUri: opda:ElectronicRecord
kind: entity
module: claim
sourceTtl: source/03-standards/ontology/opda-claim.ttl
tier: concept
title: Electronic Record
---

# Electronic Record

Electronic Record is the **short-name alias** for [Electronic Record Evidence](./electronic-record-evidence.md). The two names refer to the same OWL identity — Electronic Record exists so worked-example data (the diagnostic exemplar set) can use the short form without losing alignment with the long-name canonical form that downstream shapes and annotations target.

## Why it matters

OPDA's exemplar set uses short names (Document, Electronic Record, Vouch) for compactness; OPDA's SHACL shapes and DPV annotations target the long names (Document Evidence, Electronic Record Evidence, Vouch Evidence). If you read an exemplar and see `:ElectronicRecord`, treat it as identical to `:ElectronicRecordEvidence`.

## Hard cases

- **Mixed use within one consumer.** Same situation as for [Document](./document.md) — the OWL equivalence binding lets short and long names coexist.

## Identity Criterion

See [Electronic Record Evidence](./electronic-record-evidence.md) — Electronic Record inherits the same IC by OWL equivalence binding. See the [Logical tier →](../../logical/claim/electronic-record.md) for the typed structure.

## Related Kinds

- [Electronic Record Evidence](./electronic-record-evidence.md) — the canonical long-name form

### Related-Kinds graph

![electronic-record-short-name-alias-related-kinds-neighbourhood-graph](diagrams/electronic-record/electronic-record-short-name-alias-related-kinds-neighbourhood-graph.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base"}}%%
flowchart LR
    accTitle: Electronic Record short-name alias related-Kinds neighbourhood graph
    accDescr: Electronic Record as the OWL-equivalent short-name alias for Electronic Record Evidence; used by worked-example data while SHACL shapes and DPV annotations target the long-name form.

    classDef centre fill:#FFF9C4,stroke:#F57F17,stroke-width:3px,color:#E65100
    classDef cls fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B

    ERec["ElectronicRecord<br/>(alias)"]:::centre
    ERecEv["ElectronicRecordEvidence<br/>(canonical)"]:::cls

    ERec ===|"owl:equivalentClass"| ERecEv
```

</details>

## Source ODR

[ODR-0009 — Claims, evidence, provenance §Q1](/modelling/odr/odr-0009)
