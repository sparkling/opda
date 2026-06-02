---
date: 2026-05-28
entityUri: opda:Annotations
kind: entity
module: transaction
sourceTtl: source/03-standards/ontology/opda-transaction-annotations.ttl
status: proposed
tags:
- physical-ontology
- transaction
- annotations
- dpv
tier: physical-ontology
title: Transaction annotations
---

# Transaction annotations

Header-only. Per ODR-0012 §Phase-1: Transactions, Milestones, and TransactionChains are UFO Relators and event particulars — they are not personal data themselves. PII co-annotations attach to the participating Person / Organisation roles (see [`../agent/annotations.md`](../agent/annotations.md)) and to the Property side (see [`../property/annotations.md`](../property/annotations.md)).

## Header

```turtle
<https://opda.org.uk/pdtf/graph/transaction-annotations>
    rdf:type owl:Ontology ;
    rdfs:comment "Transactions, Milestones, and TransactionChains are UFO Relators and event particulars — they are not personal data themselves. DPV co-annotations attach to the participating Person / Organisation roles (see opda-agent-annotations.ttl) and to the Property side (see opda-property-annotations.ttl)."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0012/section-Phase-1> ;
    dct:references <https://w3id.org/dpv/pd> ;
    dct:title "OPDA Transaction Annotations"@en ;
    opda:targetsClassGraph <https://opda.org.uk/pdtf/harness/release/1.0.0/> .
```

No class-level baselines emitted in this module.

## Source ODR + ADR

- [ODR-0012 §Phase-1 — SHACL + DPV annotation emission](../../../ontology/odr/ODR-0012-shacl-and-dpv-annotation-emission.md)
- [ADR-0012 — SHACL + DPV annotation emission](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)
