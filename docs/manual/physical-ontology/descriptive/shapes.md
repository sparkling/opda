---
status: proposed
date: 2026-05-28
tags: [physical-ontology, descriptive, shacl, shapes]
---

# Descriptive shapes

5 SHACL shapes, all sharing the same property-shape blank node (`_:b218dcfc815ed`) which enforces `prov:wasGeneratedBy` per the three-criterion class-promotion test. Emitted into `opda-descriptive-shapes.ttl`.

## Header

```turtle
<https://w3id.org/opda/descriptive-shapes/>
    rdf:type owl:Ontology ;
    dct:title "OPDA Descriptive Shapes"@en ;
    opda:targetsClassGraph <https://w3id.org/opda/1.0.0/> .
```

## Shared property shape

The 5 identity-key shapes below all reference the same blank-node property shape:

```turtle
_:b218dcfc815ed
    sh:message "Class-promoted descriptive Kind MUST carry prov:wasGeneratedBy to its issuing activity per ODR-0008 §Q4a three-criterion test (authority-retrieved provenance is the IC discriminator for class-promotion)."@en ;
    sh:minCount "1"^^xsd:integer ;
    sh:path prov:wasGeneratedBy ;
    sh:severity sh:Violation .
```

The property shape requires at least one `prov:wasGeneratedBy` triple on every class-promoted descriptive Kind. This is the IC discriminator that justifies class-promotion per the three-criterion test (authority-retrieved provenance).

## opda:ComparableIdentityKeyShape

```turtle
opda:ComparableIdentityKeyShape
    rdf:type sh:NodeShape ;
    dct:source <https://w3id.org/opda/odr/ODR-0008#section-Q4a> ;
    sh:property _:b218dcfc815ed ;
    sh:targetClass opda:Comparable .
```

#### Severity tier

`sh:Violation` (Cat 1 — identity-key via `prov:wasGeneratedBy`)

#### Target

`sh:targetClass opda:Comparable`; property `prov:wasGeneratedBy`

#### Validation behaviour

Every `opda:Comparable` instance MUST carry at least one `prov:wasGeneratedBy` triple naming the Land Registry / VOA source activity.

#### Source ODR + ADR

- [ODR-0008 §Q4a](../../../ontology/odr/ODR-0008-descriptive-attributes.md)
- [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

## opda:EPCCertificateIdentityKeyShape

```turtle
opda:EPCCertificateIdentityKeyShape
    rdf:type sh:NodeShape ;
    dct:source <https://w3id.org/opda/odr/ODR-0008#section-Q4a> ;
    sh:property _:b218dcfc815ed ;
    sh:targetClass opda:EPCCertificate .
```

#### Severity tier

`sh:Violation` (Cat 1 — identity-key via `prov:wasGeneratedBy`)

#### Target

`sh:targetClass opda:EPCCertificate`; property `prov:wasGeneratedBy`

#### Validation behaviour

Every `opda:EPCCertificate` instance MUST carry at least one `prov:wasGeneratedBy` triple naming the DESNZ register activity (the EPC issuance / re-issuance).

#### Source ODR + ADR

- [ODR-0008 §Q4a](../../../ontology/odr/ODR-0008-descriptive-attributes.md)
- [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

## opda:SearchIdentityKeyShape

```turtle
opda:SearchIdentityKeyShape
    rdf:type sh:NodeShape ;
    dct:source <https://w3id.org/opda/odr/ODR-0008#section-Q4a> ;
    sh:property _:b218dcfc815ed ;
    sh:targetClass opda:Search .
```

#### Severity tier

`sh:Violation` (Cat 1 — identity-key via `prov:wasGeneratedBy`)

#### Target

`sh:targetClass opda:Search`; property `prov:wasGeneratedBy`

#### Validation behaviour

Every `opda:Search` instance MUST carry at least one `prov:wasGeneratedBy` triple naming the local-authority issuance activity (CON29R / LLC1 / environmental search).

#### Source ODR + ADR

- [ODR-0008 §Q4a](../../../ontology/odr/ODR-0008-descriptive-attributes.md)
- [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

## opda:SurveyIdentityKeyShape

```turtle
opda:SurveyIdentityKeyShape
    rdf:type sh:NodeShape ;
    dct:source <https://w3id.org/opda/odr/ODR-0008#section-Q4a> ;
    sh:property _:b218dcfc815ed ;
    sh:targetClass opda:Survey .
```

#### Severity tier

`sh:Violation` (Cat 1 — identity-key via `prov:wasGeneratedBy`)

#### Target

`sh:targetClass opda:Survey`; property `prov:wasGeneratedBy`

#### Validation behaviour

Every `opda:Survey` instance MUST carry at least one `prov:wasGeneratedBy` triple naming the professional issuance activity (RICS-regulated survey).

#### Source ODR + ADR

- [ODR-0008 §Q4a](../../../ontology/odr/ODR-0008-descriptive-attributes.md)
- [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

## opda:ValuationIdentityKeyShape

```turtle
opda:ValuationIdentityKeyShape
    rdf:type sh:NodeShape ;
    dct:source <https://w3id.org/opda/odr/ODR-0008#section-Q4a> ;
    sh:property _:b218dcfc815ed ;
    sh:targetClass opda:Valuation .
```

#### Severity tier

`sh:Violation` (Cat 1 — identity-key via `prov:wasGeneratedBy`)

#### Target

`sh:targetClass opda:Valuation`; property `prov:wasGeneratedBy`

#### Validation behaviour

Every `opda:Valuation` instance MUST carry at least one `prov:wasGeneratedBy` triple naming the RICS-regulated valuation activity (or AVM model run).

#### Source ODR + ADR

- [ODR-0008 §Q4a](../../../ontology/odr/ODR-0008-descriptive-attributes.md)
- [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)
