---
status: proposed
date: 2026-05-28
tags: [physical-ontology, governance, module]
---

# Governance module

The Governance module emits 2 OWL classes (DPVMappingRecord meta-record class + SpecialCategoryScheme placeholder) and 3 `opda:DPVMappingRecord` instances (Claim / Organisation / Person mappings).

## Files

| File | Role | Source |
|---|---|---|
| `opda-governance.ttl` | 2 OWL classes + 2 ObjectProperties + 3 DPVMappingRecord instances | [opda-governance.ttl](../../../../source/03-standards/ontology/opda-governance.ttl) |
| `opda-governance-shapes.ttl` | 1 identity-key shape | [opda-governance-shapes.ttl](../../../../source/03-standards/ontology/opda-governance-shapes.ttl) |
| `opda-governance-annotations.ttl` | Header-only (meta-records carry no DPV baseline) | [opda-governance-annotations.ttl](../../../../source/03-standards/ontology/opda-governance-annotations.ttl) |

## Ontology header

```turtle
<https://w3id.org/opda/governance/>
    rdf:type owl:Ontology ;
    dct:references <https://w3id.org/dpv/pd> ;
    dct:title "OPDA Governance Module"@en ;
    owl:imports <https://w3id.org/opda/1.0.0/>, <https://w3id.org/opda/vocabularies/> ;
    owl:versionIRI <https://w3id.org/opda/governance/1.0.0/> .
```

## Import chain

- `<https://w3id.org/opda/1.0.0/>` — foundation
- `<https://w3id.org/opda/vocabularies/>` — SKOS substrate

External vocabularies referenced (not imported):
- `dpv-pd:` — cited via `dct:references` on the module header + per-instance `opda:baselineCategory` triples
- `skos:ConceptScheme` — `opda:SpecialCategoryScheme rdfs:subClassOf skos:ConceptScheme`

## Classes (2)

| Class | Role |
|---|---|
| `opda:DPVMappingRecord` | Meta-record class declaring DPV baseline + variant refinements for a Kind |
| `opda:SpecialCategoryScheme` | Class declaration for GDPR Art 10 special-category scheme (members deferred per ODR-0011) |

See [`classes.md`](./classes.md) for per-class blocks.

## SHACL shapes (1)

| Shape | Severity | Category |
|---|---|---|
| `opda:DPVMappingRecordIdentityKeyShape` | Violation | Cat 1 |

See [`shapes.md`](./shapes.md) for per-shape blocks.

## DPV annotations

Header-only. Governance classes (`DPVMappingRecord`, `SpecialCategoryScheme`) are meta-records declaring the DPV regime; they themselves carry no DPV class-level baseline. See [`annotations.md`](./annotations.md).

## Source ODR + ADR

- [ODR-0012 — SHACL + DPV annotation emission](../../../ontology/odr/ODR-0012-shacl-and-dpv-annotation-emission.md)
- [ODR-0018 — DPV co-annotation pattern](../../../ontology/odr/ODR-0018-dpv-co-annotation-pattern.md)
- [ODR-0011 — Enumeration vocabularies (SpecialCategoryScheme deferral)](../../../ontology/odr/ODR-0011-enumeration-vocabularies.md)
- [ADR-0011 — Module TBox emission](../../../adr/ADR-0011-module-tbox-emission.md)
- [ADR-0012 — SHACL + DPV annotation emission](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)
