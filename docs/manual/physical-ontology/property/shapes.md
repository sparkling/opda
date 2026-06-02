---
date: 2026-05-28
entityUri: opda:Shapes
kind: entity
module: property
sourceTtl: source/03-standards/ontology/opda-property-shapes.ttl
status: proposed
tags:
- physical-ontology
- property
- shacl
- shapes
tier: physical-ontology
title: Property shapes
---

# Property shapes

Six SHACL shapes (4 identity-key + 1 IC-breach + 1 INSPIRE rule) plus 1 UPRN succession SHACL-AF rule, emitted into `opda-property-shapes.ttl`.

## Header

```turtle
<https://opda.org.uk/pdtf/graph/property-shapes>
    rdf:type owl:Ontology ;
    dct:title "OPDA Property Shapes"@en ;
    opda:targetsClassGraph <https://opda.org.uk/pdtf/harness/release/1.0.0/> .
```

### opda:AddressIdentityKeyShape

```turtle
opda:AddressIdentityKeyShape
    rdf:type sh:NodeShape ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0015/section-Rule-6> ;
    sh:property _:b89b6f844e401 ;
    sh:targetClass opda:Address .

_:b89b6f844e401
    sh:datatype xsd:string ;
    sh:maxCount "1"^^xsd:integer ;
    sh:message "Address addressVariant MUST be a single xsd:string value (one of 'title' | 'marketing' | 'inspire') per ODR-0015 §Rule 6. Distinguishes the authority lifecycle borne by the Address instance."@en ;
    sh:path opda:addressVariant ;
    sh:severity sh:Violation .
```

#### Severity tier

`sh:Violation` (Cat 1 — identity-key missing/wrong-type)

#### Target

`sh:targetClass opda:Address`; property `opda:addressVariant`

#### Validation behaviour

For every `opda:Address` instance, pyshacl checks that `opda:addressVariant` is at most one xsd:string value. Multi-value or non-string violations produce the message above. Exemplar [`listed-building-divergent-addresses`](../exemplars/listed-building-divergent-addresses.md) demonstrates valid multi-address-instance pattern (three separate Address instances, each with one variant).

#### Source ODR + ADR

- [ODR-0015 §Rule 6 — Address and geography](../../../ontology/odr/ODR-0015-address-and-geography.md)
- [ADR-0012 — SHACL + DPV annotation emission](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

### opda:LegalEstateIdentityKeyShape

```turtle
opda:LegalEstateIdentityKeyShape
    rdf:type sh:NodeShape ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-3b> ;
    sh:property _:bdd41e84ee3f5 ;
    sh:targetClass opda:LegalEstate .

_:bdd41e84ee3f5
    sh:datatype xsd:string ;
    sh:maxCount "1"^^xsd:integer ;
    sh:message "LegalEstate identity surface: tenureKind (Freehold / Leasehold / Commonhold) MUST be a single xsd:string value when present. The full rights-bundle IC per ODR-0005 §3b is enforced by the registered-title binding via opda:recordsEstate."@en ;
    sh:path opda:tenureKind ;
    sh:severity sh:Violation .
```

#### Severity tier

`sh:Violation` (Cat 1 — identity-key)

#### Target

`sh:targetClass opda:LegalEstate`; property `opda:tenureKind`

#### Validation behaviour

For every `opda:LegalEstate` instance, `opda:tenureKind` MUST be at most one xsd:string. The full rights-bundle IC is enforced via the registered-title binding (`opda:recordsEstate`), not at this shape. Exemplar [`registered-freehold-house`](../exemplars/registered-freehold-house.md) demonstrates conforming usage.

#### Source ODR + ADR

- [ODR-0005 §3b](../../../ontology/odr/ODR-0005-property-and-land-identity-crux.md)
- [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

### opda:PropertyIdentityKeyShape

```turtle
opda:PropertyIdentityKeyShape
    rdf:type sh:NodeShape ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-6a> ;
    sh:property _:ba17cdd559a14 ;
    sh:targetClass opda:Property .

_:ba17cdd559a14
    sh:datatype xsd:string ;
    sh:maxCount "1"^^xsd:integer ;
    sh:message "Property hasUPRN, when present, MUST be a single xsd:string value. Absence is admissible (UPRN is a contingent administrative identifier per ODR-0005 §6a); succession is tracked by the UPRNSuccessionRule SHACL-AF rule below."@en ;
    sh:path opda:hasUPRN ;
    sh:severity sh:Violation .
```

#### Severity tier

`sh:Violation` (Cat 1 — identity-key)

#### Target

`sh:targetClass opda:Property`; property `opda:hasUPRN`

#### Validation behaviour

For every `opda:Property` instance, `opda:hasUPRN` MUST be at most one xsd:string. Absence is admissible (UPRN is contingent per ODR-0005 §6a). Multi-UPRN cases violate; succession across re-numbering is tracked by `opda:UPRNSuccessionRule` (Info severity). Exemplars [`unregistered-pre-first-registration-house`](../exemplars/unregistered-pre-first-registration-house.md) (UPRN absent) and [`flat-with-split-uprn`](../exemplars/flat-with-split-uprn.md) (succession event) both demonstrate conforming usage.

#### Source ODR + ADR

- [ODR-0005 §6a](../../../ontology/odr/ODR-0005-property-and-land-identity-crux.md)
- [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

### opda:PropertyICBreachShape

```turtle
opda:PropertyICBreachShape
    rdf:type sh:NodeShape ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-Rule-5> ;
    sh:property _:b6a1eb5c7e44d ;
    sh:targetClass opda:Property .

_:b6a1eb5c7e44d
    sh:message "Property co-reference MUST use opda:identifiesSameProperty (an IRI-valued ObjectProperty); owl:sameAs is forbidden per ODR-0005 Rule 5 because it propagates identity-collapse across contexts under reasoning."@en ;
    sh:nodeKind sh:IRI ;
    sh:path opda:identifiesSameProperty ;
    sh:severity sh:Violation .
```

#### Severity tier

`sh:Violation` (Cat 2 — IC breach / anti-pattern)

#### Target

`sh:targetClass opda:Property`; property `opda:identifiesSameProperty`

#### Validation behaviour

For every `opda:Property` instance, `opda:identifiesSameProperty` MUST be IRI-valued (not a literal). This is the gentle reminder that co-reference uses the OPDA-specific predicate; the harder anti-pattern (using `owl:sameAs`) is rejected upstream by CI (Rule 5). Exemplar [`registered-freehold-house`](../exemplars/registered-freehold-house.md) uses `opda:identifiesSameProperty` correctly between title, estate, and property.

#### Source ODR + ADR

- [ODR-0005 §Rule 5 — Anti-pattern §5 (NEVER `owl:sameAs`)](../../../ontology/odr/ODR-0005-property-and-land-identity-crux.md)
- [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

### opda:UPRNSuccessionRule

```turtle
opda:UPRNSuccessionRule
    rdf:type sh:NodeShape ;
    rdfs:comment "UPRN succession rule (ODR-0005 §6a; SHACL-AF citing site #1). Materialises opda:hasUPRNSuccessionStatus on every Property with a UPRN: 'succession-tracked' when prov:wasDerivedFrom names a predecessor with a different UPRN; 'primary-uprn' otherwise. Per ODR-0017 §1a non-blocking-quality-rule pattern."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-6a> ;
    sh:rule _:b16e82da2b31c ;
    sh:severity sh:Info ;
    sh:targetClass opda:Property .

_:b16e82da2b31c
    rdf:type sh:SPARQLRule ;
    sh:construct "PREFIX opda: <https://opda.org.uk/pdtf/>\nPREFIX prov: <http://www.w3.org/ns/prov#>\nCONSTRUCT {\n  ?property opda:hasUPRNSuccessionStatus ?status .\n}\nWHERE {\n  ?property a opda:Property ;\n            opda:hasUPRN ?currentUPRN .\n  OPTIONAL { ?property prov:wasDerivedFrom ?predecessor .\n             ?predecessor opda:hasUPRN ?priorUPRN .\n             FILTER (?currentUPRN != ?priorUPRN) }\n  BIND (IF(BOUND(?priorUPRN), \"succession-tracked\", \"primary-uprn\") AS ?status)\n}" .
```

#### Derives

`opda:hasUPRNSuccessionStatus` ("succession-tracked" | "primary-uprn")

#### Citing site

[ODR-0005 §6a — UPRN as contingent identifier](../../../ontology/odr/ODR-0005-property-and-land-identity-crux.md) (citing site #1)

#### Severity

`sh:Info`

#### Source ODR + ADR

- [ODR-0005 §6a](../../../ontology/odr/ODR-0005-property-and-land-identity-crux.md)
- [ODR-0017 §1a](../../../ontology/odr/ODR-0017-shacl-af-quality-rules-pattern.md)
- [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

### opda:INSPIRESuccessionRule

```turtle
opda:INSPIRESuccessionRule
    rdf:type sh:NodeShape ;
    rdfs:comment "INSPIRE Identifier / OS AddressBase succession rule (ODR-0015 §4a; SHACL-AF citing site #3). Materialises opda:hasINSPIRESuccessionStatus on inspire-variant Address instances. Per ODR-0017 §1a."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0015/section-4a> ;
    sh:rule _:becbeff0baa17 ;
    sh:severity sh:Info ;
    sh:targetClass opda:Address .

_:becbeff0baa17
    rdf:type sh:SPARQLRule ;
    sh:construct "PREFIX opda: <https://opda.org.uk/pdtf/>\nPREFIX prov: <http://www.w3.org/ns/prov#>\nCONSTRUCT {\n  ?address opda:hasINSPIRESuccessionStatus ?status .\n}\nWHERE {\n  ?address a opda:Address ;\n           opda:addressVariant \"inspire\" .\n  OPTIONAL { ?address prov:wasDerivedFrom ?prior .\n             ?prior opda:addressVariant \"inspire\" }\n  BIND (IF(BOUND(?prior), \"inspire-re-issued\", \"inspire-primary\") AS ?status)\n}" .
```

#### Derives

`opda:hasINSPIRESuccessionStatus` ("inspire-re-issued" | "inspire-primary")

#### Citing site

[ODR-0015 §4a — INSPIRE Identifier succession](../../../ontology/odr/ODR-0015-address-and-geography.md) (citing site #3)

#### Severity

`sh:Info`

#### Source ODR + ADR

- [ODR-0015 §4a](../../../ontology/odr/ODR-0015-address-and-geography.md)
- [ODR-0017 §1a](../../../ontology/odr/ODR-0017-shacl-af-quality-rules-pattern.md)
- [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)
