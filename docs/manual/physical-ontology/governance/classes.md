---
date: 2026-05-28
entityUri: opda:Classes
kind: entity
module: governance
sourceTtl: source/03-standards/ontology/opda-governance.ttl
status: proposed
tags:
- physical-ontology
- governance
- classes
- owl
tier: physical-ontology
title: Governance classes
---

# Governance classes

Two OWL classes + 3 `opda:DPVMappingRecord` instances emitted by `opda-gen` into `opda-governance.ttl`.

## Classes

### opda:DPVMappingRecord

```turtle
opda:DPVMappingRecord
    rdf:type owl:Class ;
    rdfs:label "DPV Mapping Record"@en ;
    rdfs:comment "Mapping record from an OPDA Kind class to its DPV baseline personal-data category and optional variant-conditional refinements. UFO Information Particular. Per ODR-0018 §Rule 4 + ODR-0012 §Evidence co-annotation, ODR-0012 is the authoring authority — this module emits the mapping records; ADR-0012 emits the resulting DPV co-annotation triples into opda-annotations.ttl (three-graph separation)."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0018/section-Rule4> ;
    skos:scopeNote "UFO: Information Particular (Guizzardi 2005 Ch. 4 §4.7). Mapping-record-as-resource pattern per ODR-0018 §3a."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://opda.org.uk/pdtf/harness/odr/ODR-0018/section-Rule4>` | [ODR-0018 §Rule 4](../../../ontology/odr/ODR-0018-dpv-co-annotation-pattern.md) |
| `skos:scopeNote @en` | "UFO: Information Particular. Mapping-record-as-resource pattern per ODR-0018 §3a." | Guizzardi 2005 |
| `rdfs:comment @en` | "Mapping record from an OPDA Kind class to its DPV baseline personal-data category…" | ODR-0018 §Rule 4 + ODR-0012 |

#### Targeting shapes

- [`opda:DPVMappingRecordIdentityKeyShape`](./shapes.md#opdadpvmappingrecordidentitykeyshape) — Cat 1 (Violation)

#### Cross-tier links

- [Concept tier →](../../concept/governance/dpv-mapping-record.md)
- [Logical tier →](../../logical/governance/dpv-mapping-record.md)
- [Physical-Database tier (deployment) →](../../physical-database/README.md)

#### Source ODR + ADR

- [ODR-0018 §Rule 4](../../../ontology/odr/ODR-0018-dpv-co-annotation-pattern.md)
- [ODR-0012 — Evidence co-annotation](../../../ontology/odr/ODR-0012-shacl-and-dpv-annotation-emission.md)
- [ADR-0012 — SHACL + DPV annotation emission](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

### opda:SpecialCategoryScheme

```turtle
opda:SpecialCategoryScheme
    rdf:type owl:Class ;
    rdfs:label "Article 10 Special Category Personal Data Scheme"@en ;
    rdfs:comment "GDPR Article 10 / DPA 2018 special-category personal-data scheme — flags PII categories with elevated lawful-basis discipline (caution-or-conviction; AML-result; etc.). Per S012 Q3 (Baker) the scheme structure is class-declared here; the scheme instance + members emit via ADR-0010 SKOS substrate when downstream demand materialises. Currently a class declaration only — member emission deferred per ODR-0011 §Operational specifications (no S012 Q3 enum currently scoped)."@en ;
    dct:source <https://gdpr-info.eu/art-10-gdpr/> ;
    rdfs:subClassOf skos:ConceptScheme ;
    skos:scopeNote "Subclass of skos:ConceptScheme (W3C SKOS REC §3.1). Members enumerated per GDPR Article 10 special-category list when ADR-0010 scope-expansion activates the scheme."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://gdpr-info.eu/art-10-gdpr/>` | GDPR Article 10 |
| `skos:scopeNote @en` | "Subclass of skos:ConceptScheme. Members enumerated per GDPR Article 10 special-category list when activated." | W3C SKOS REC §3.1 |
| `rdfs:comment @en` | "GDPR Article 10 / DPA 2018 special-category personal-data scheme. Members deferred." | ODR-0012 §Q3 (Baker) |

#### Targeting shapes

None (class declaration only; member emission deferred).

#### Subclass / equivalent-class relationships

- `rdfs:subClassOf skos:ConceptScheme`

#### Cross-tier links

- [Concept tier →](../../concept/governance/special-category-scheme.md)

#### Source ODR + ADR

- [ODR-0012 §Q3 (Baker)](../../../ontology/odr/ODR-0012-shacl-and-dpv-annotation-emission.md)
- [ODR-0011 §Operational specifications (member emission deferral)](../../../ontology/odr/ODR-0011-enumeration-vocabularies.md)
- [ADR-0010 — SKOS vocabulary emission](../../../adr/ADR-0010-skos-vocabulary-emission.md)
- [ADR-0011 — Module TBox emission](../../../adr/ADR-0011-module-tbox-emission.md)

## DPVMappingRecord instances (3)

### opda:ClaimDPVMapping

```turtle
opda:ClaimDPVMapping
    rdf:type opda:DPVMappingRecord ;
    rdfs:label "Claim DPV mapping"@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0018/section-Rule4> ;
    opda:baselineCategory dpv-pd:OfficialID ;
    opda:targetsKind opda:Claim .
```

### opda:OrganisationDPVMapping

```turtle
opda:OrganisationDPVMapping
    rdf:type opda:DPVMappingRecord ;
    rdfs:label "Organisation DPV mapping"@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0012/section-evidence-co-annotation> ;
    opda:targetsKind opda:Organisation .
```

Organisation mapping carries `opda:targetsKind` but no `opda:baselineCategory` — Organisations are not data subjects per ODR-0006 §Q6.

### opda:PersonDPVMapping

```turtle
opda:PersonDPVMapping
    rdf:type opda:DPVMappingRecord ;
    rdfs:label "Person DPV mapping"@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0018/section-Rule4> ;
    opda:baselineCategory dpv-pd:Name ;
    opda:targetsKind opda:Person .
```

## ObjectProperties

```turtle
opda:baselineCategory
    rdf:type owl:ObjectProperty ;
    rdfs:label "baseline category"@en ;
    rdfs:comment "Reference to a DPV-PD category that all instances of the target Kind bear by default. Per ODR-0018 §Rule 1, every PII-bearing Kind declares its baseline. Per ODR-0012 §Reference-not-import + ODR-0018 §Rule 4, the DPV URI is cited but DPV is NOT imported."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0018/section-Rule4> ;
    rdfs:domain opda:DPVMappingRecord .

opda:targetsKind
    rdf:type owl:ObjectProperty ;
    rdfs:label "targets kind"@en ;
    rdfs:comment "DPV mapping record → OPDA Kind class. The Kind is the class whose instances bear the personal-data category named by opda:baselineCategory (with optional variant refinements)."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0018/section-Rule4> ;
    rdfs:domain opda:DPVMappingRecord ;
    rdfs:range owl:Class .
```
