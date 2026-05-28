---
status: proposed
date: 2026-05-28
tags: [physical-ontology, descriptive, classes, owl]
---

# Descriptive classes

Five OWL classes emitted by `opda-gen` into `opda-descriptive.ttl`.

## opda:Comparable

```turtle
opda:Comparable
    rdf:type owl:Class ;
    rdfs:label "Comparable"@en ;
    rdfs:comment "Comparable-sale or comparable-rental record supporting a Valuation. UFO Substance Kind (informational); PROV-O Entity. Class-promoted per S008 Q4 three-criterion test (Land Registry or VOA sourced provenance; supports prov:wasInformedBy chains from Valuation to its underlying market data)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0008#section-Q4a> ;
    rdfs:subClassOf prov:Entity ;
    skos:scopeNote "UFO: Substance Kind, informational. Land Registry Price Paid Data + VOA records (regulator-cited per ODR-0011 §4a)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://w3id.org/opda/odr/ODR-0008#section-Q4a>` | [ODR-0008 §Q4a](../../../ontology/odr/ODR-0008-descriptive-attributes.md) |
| `skos:scopeNote @en` | "UFO: Substance Kind, informational. Land Registry Price Paid + VOA records." | Guizzardi 2005 / regulator citation |
| `rdfs:comment @en` | "Comparable-sale or rental record. Class-promoted per S008 Q4 three-criterion test." | ODR-0008 §Q4a |

#### Targeting shapes

- [`opda:ComparableIdentityKeyShape`](./shapes.md#opdacomparableidentitykeyshape) — Cat 1 (Violation)

#### Subclass / equivalent-class relationships

- `rdfs:subClassOf prov:Entity`

#### Cross-tier links

- [Concept tier →](../../concept/descriptive/comparable.md)
- [Logical tier →](../../logical/descriptive/comparable.md)
- [Physical-DB tier →](../../physical-database/descriptive/comparable.md)

#### Source ODR + ADR

- [ODR-0008 §Q4a](../../../ontology/odr/ODR-0008-descriptive-attributes.md)
- [ADR-0011](../../../adr/ADR-0011-module-tbox-emission.md)

## opda:EPCCertificate

```turtle
opda:EPCCertificate
    rdf:type owl:Class ;
    rdfs:label "EPC Certificate"@en ;
    rdfs:comment "Energy Performance Certificate — DESNZ-governed authority-retrieved artefact. UFO Substance Kind (informational); PROV-O Entity. Class-promoted per S008 Q4 three-criterion test: authority-retrieved provenance (DESNZ register); distinct lifecycle (10-year validity; supersession on re-assessment); distinct PII regime per ODR-0018 (address + owner-identifiable)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0008#section-Q4a> ;
    rdfs:subClassOf prov:Entity ;
    skos:scopeNote "UFO: Substance Kind, informational (Guizzardi 2005 Ch. 4). DESNZ Energy Performance Certificate Guidance (regulator-cited per ODR-0011 §4a)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://w3id.org/opda/odr/ODR-0008#section-Q4a>` | [ODR-0008 §Q4a](../../../ontology/odr/ODR-0008-descriptive-attributes.md) |
| `skos:scopeNote @en` | "UFO: Substance Kind, informational. DESNZ Energy Performance Certificate Guidance." | Guizzardi 2005 / DESNZ |
| `rdfs:comment @en` | "Energy Performance Certificate — DESNZ-governed authority-retrieved artefact. 10-year validity." | ODR-0008 §Q4a + ODR-0018 |

#### Targeting shapes

- [`opda:EPCCertificateIdentityKeyShape`](./shapes.md#opdaepccertificateidentitykeyshape) — Cat 1 (Violation)
- [`opda:Baspi5_EPCCertificateShape`](../profiles/baspi5.md) — BASPI5 overlay (Violation; energy rating constraint)

#### Subclass / equivalent-class relationships

- `rdfs:subClassOf prov:Entity`

#### Cross-tier links

- [Concept tier →](../../concept/descriptive/epc-certificate.md)
- [Logical tier →](../../logical/descriptive/epc-certificate.md)
- [Physical-DB tier →](../../physical-database/descriptive/epc-certificate.md)

#### Source ODR + ADR

- [ODR-0008 §Q4a](../../../ontology/odr/ODR-0008-descriptive-attributes.md)
- [ADR-0011](../../../adr/ADR-0011-module-tbox-emission.md)

## opda:Search

```turtle
opda:Search
    rdf:type owl:Class ;
    rdfs:label "Search"@en ;
    rdfs:comment "Local-authority or environmental search result (CON29R, LLC1, etc.). UFO Substance Kind (informational); PROV-O Entity. Class-promoted per S008 Q4 three-criterion test (local-authority issuance chain; distinct lifecycle: ordered / returned / superseded; not a flat datatype bag)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0008#section-Q4a> ;
    rdfs:subClassOf prov:Entity ;
    skos:scopeNote "UFO: Substance Kind, informational. Covers CON29R / LLC1 / environmental / flood / coal-mining searches per PDTF v3 propertyPack.localSearches."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://w3id.org/opda/odr/ODR-0008#section-Q4a>` | [ODR-0008 §Q4a](../../../ontology/odr/ODR-0008-descriptive-attributes.md) |
| `skos:scopeNote @en` | "UFO: Substance Kind, informational. Covers CON29R / LLC1 / environmental searches per PDTF v3." | Guizzardi 2005 / PDTF v3 |
| `rdfs:comment @en` | "Local-authority or environmental search result. Class-promoted per S008 Q4." | ODR-0008 §Q4a |

#### Targeting shapes

- [`opda:SearchIdentityKeyShape`](./shapes.md#opdasearchidentitykeyshape) — Cat 1 (Violation)

#### Subclass / equivalent-class relationships

- `rdfs:subClassOf prov:Entity`

#### Cross-tier links

- [Concept tier →](../../concept/descriptive/search.md)
- [Logical tier →](../../logical/descriptive/search.md)
- [Physical-DB tier →](../../physical-database/descriptive/search.md)

#### Source ODR + ADR

- [ODR-0008 §Q4a](../../../ontology/odr/ODR-0008-descriptive-attributes.md)
- [ADR-0011](../../../adr/ADR-0011-module-tbox-emission.md)

## opda:Survey

```turtle
opda:Survey
    rdf:type owl:Class ;
    rdfs:label "Survey"@en ;
    rdfs:comment "Authority-retrieved professional survey report. UFO Substance Kind (informational); PROV-O Entity. IC: distinct provenance chain per S008 Q4 three-criterion test (authority-retrieved provenance via prov:wasGeneratedBy chain to professional-issued activity; distinct lifecycle — issued / superseded / re-issued / withdrawn). Hard cases: re-survey; supersession; withdrawal."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0008#section-Q4a> ;
    rdfs:subClassOf prov:Entity ;
    skos:scopeNote "UFO: Substance Kind, informational (Guizzardi 2005 Ch. 4 §4.2). DOLCE: NonPhysicalEndurant (Masolo et al. 2003 D18 §4.2). PROV-O: Entity (W3C PROV-O REC §3.2)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://w3id.org/opda/odr/ODR-0008#section-Q4a>` | [ODR-0008 §Q4a](../../../ontology/odr/ODR-0008-descriptive-attributes.md) |
| `skos:scopeNote @en` | "UFO: Substance Kind, informational. DOLCE: NonPhysicalEndurant. PROV-O: Entity." | Guizzardi 2005 / Masolo D18 / W3C PROV-O |
| `rdfs:comment @en` | "Authority-retrieved professional survey report. Distinct lifecycle: issued / superseded / re-issued / withdrawn." | ODR-0008 §Q4a |

#### Targeting shapes

- [`opda:SurveyIdentityKeyShape`](./shapes.md#opdasurveyidentitykeyshape) — Cat 1 (Violation)

#### Subclass / equivalent-class relationships

- `rdfs:subClassOf prov:Entity`

#### Cross-tier links

- [Concept tier →](../../concept/descriptive/survey.md)
- [Logical tier →](../../logical/descriptive/survey.md)
- [Physical-DB tier →](../../physical-database/descriptive/survey.md)

#### Source ODR + ADR

- [ODR-0008 §Q4a](../../../ontology/odr/ODR-0008-descriptive-attributes.md)
- [ADR-0011](../../../adr/ADR-0011-module-tbox-emission.md)

## opda:Valuation

```turtle
opda:Valuation
    rdf:type owl:Class ;
    rdfs:label "Valuation"@en ;
    rdfs:comment "Property valuation — RICS-regulated professional or automated-model output. UFO Substance Kind (informational); PROV-O Entity. Class-promoted per S008 Q4 three-criterion test (RICS-regulated provenance chain; distinct lifecycle: instructed / delivered / superseded)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0008#section-Q4a> ;
    rdfs:subClassOf prov:Entity ;
    skos:scopeNote "UFO: Substance Kind, informational. RICS Red Book (regulator-cited per ODR-0011 §4a)."@en .
```

#### A9 per-kind discipline

| Triple | Value | Source |
|---|---|---|
| `dct:source` | `<https://w3id.org/opda/odr/ODR-0008#section-Q4a>` | [ODR-0008 §Q4a](../../../ontology/odr/ODR-0008-descriptive-attributes.md) |
| `skos:scopeNote @en` | "UFO: Substance Kind, informational. RICS Red Book." | Guizzardi 2005 / RICS Red Book |
| `rdfs:comment @en` | "Property valuation — RICS-regulated professional or automated-model output. Lifecycle: instructed / delivered / superseded." | ODR-0008 §Q4a |

#### Targeting shapes

- [`opda:ValuationIdentityKeyShape`](./shapes.md#opdavaluationidentitykeyshape) — Cat 1 (Violation)

#### Subclass / equivalent-class relationships

- `rdfs:subClassOf prov:Entity`

#### Cross-tier links

- [Concept tier →](../../concept/descriptive/valuation.md)
- [Logical tier →](../../logical/descriptive/valuation.md)
- [Physical-DB tier →](../../physical-database/descriptive/valuation.md)

#### Source ODR + ADR

- [ODR-0008 §Q4a](../../../ontology/odr/ODR-0008-descriptive-attributes.md)
- [ADR-0011](../../../adr/ADR-0011-module-tbox-emission.md)
