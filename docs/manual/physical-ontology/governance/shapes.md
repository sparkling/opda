---
status: proposed
date: 2026-05-28
tags: [physical-ontology, governance, shacl, shapes]
---

# Governance shapes

1 SHACL shape, emitted into `opda-governance-shapes.ttl`.

## Header

```turtle
<https://w3id.org/opda/governance-shapes/>
    rdf:type owl:Ontology ;
    dct:title "OPDA Governance Shapes"@en ;
    opda:targetsClassGraph <https://w3id.org/opda/1.0.0/> .
```

## opda:DPVMappingRecordIdentityKeyShape

```turtle
opda:DPVMappingRecordIdentityKeyShape
    rdf:type sh:NodeShape ;
    dct:source <https://w3id.org/opda/odr/ODR-0012#section-Phase-1> ;
    sh:property _:bf33f0b16c30f ;
    sh:targetClass opda:DPVMappingRecord .

_:bf33f0b16c30f
    sh:maxCount "1"^^xsd:integer ;
    sh:message "DPVMappingRecord MUST target exactly one Kind class via opda:targetsKind. ODR-0012 Phase 1 governance discipline (reference-not-import for DPV)."@en ;
    sh:minCount "1"^^xsd:integer ;
    sh:nodeKind sh:IRI ;
    sh:path opda:targetsKind ;
    sh:severity sh:Violation .
```

#### Severity tier

`sh:Violation` (Cat 1 — identity-key)

#### Target

`sh:targetClass opda:DPVMappingRecord`; property `opda:targetsKind`

#### Validation behaviour

For every `opda:DPVMappingRecord` instance, `opda:targetsKind` MUST be exactly one IRI value. Multi-target or missing-target records violate. Each record names the OPDA Kind class whose instances bear the PII baseline.

#### Source ODR + ADR

- [ODR-0012 §Phase 1 — Governance discipline](../../../ontology/odr/ODR-0012-shacl-and-dpv-annotation-emission.md)
- [ODR-0018 — DPV co-annotation pattern (reference-not-import)](../../../ontology/odr/ODR-0018-dpv-co-annotation-pattern.md)
- [ADR-0012 — SHACL + DPV annotation emission](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)
