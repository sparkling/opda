---
date: 2026-05-28
entityUri: opda:Annotations
kind: entity
module: governance
sourceTtl: source/03-standards/ontology/opda-governance-annotations.ttl
status: proposed
tags:
- physical-ontology
- governance
- annotations
- dpv
tier: physical-ontology
title: Governance annotations
---

# Governance annotations

Header-only. Per ODR-0012 + ODR-0018 §Rule 1: governance classes (`DPVMappingRecord`, `SpecialCategoryScheme`) are meta-records declaring the DPV regime; they themselves carry no DPV class-level baseline (the categories they declare appear in the per-Kind annotation files).

## Header

```turtle
<https://opda.org.uk/pdtf/graph/governance-annotations>
    rdf:type owl:Ontology ;
    rdfs:comment "Governance classes (DPVMappingRecord, SpecialCategoryScheme) are meta-records declaring the DPV regime; they themselves carry no DPV class-level baseline (the categories they declare appear in the per-Kind annotation files). Per ODR-0012 + ODR-0018 §Rule 1 — the DPV co-annotation pattern applies to PII-bearing Substance Kinds, not to the meta-records that describe the DPV scheme itself."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0012/section-Phase-1> ;
    dct:references <https://w3id.org/dpv/pd> ;
    dct:title "OPDA Governance Annotations"@en ;
    opda:targetsClassGraph <https://opda.org.uk/pdtf/harness/release/1.0.0/> .
```

No class-level baselines emitted in this module.

## Source ODR + ADR

- [ODR-0012 §Phase 1](../../../ontology/odr/ODR-0012-shacl-and-dpv-annotation-emission.md)
- [ODR-0018 §Rule 1](../../../ontology/odr/ODR-0018-dpv-co-annotation-pattern.md)
- [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)
