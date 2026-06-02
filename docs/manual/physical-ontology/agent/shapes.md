---
date: 2026-05-28
entityUri: opda:Shapes
kind: entity
module: agent
sourceTtl: source/03-standards/ontology/opda-agent-shapes.ttl
status: proposed
tags:
- physical-ontology
- agent
- shacl
- shapes
tier: physical-ontology
title: Agent shapes
---

# Agent shapes

5 SHACL shapes (2 identity-key + 1 Cat 4 PII + 2 SHACL-AF rules), emitted into `opda-agent-shapes.ttl`.

## Header

```turtle
<https://opda.org.uk/pdtf/graph/agent-shapes>
    rdf:type owl:Ontology ;
    dct:title "OPDA Agent Shapes"@en ;
    opda:targetsClassGraph <https://opda.org.uk/pdtf/harness/release/1.0.0/> .
```

### opda:OrganisationIdentityKeyShape

```turtle
opda:OrganisationIdentityKeyShape
    rdf:type sh:NodeShape ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0006/section-Q4> ;
    sh:property _:b2ea199d949d8 ;
    sh:targetClass opda:Organisation .

_:b2ea199d949d8
    sh:datatype xsd:string ;
    sh:maxCount "1"^^xsd:integer ;
    sh:message "Organisation identity-key surface: hasAssertedCapacity MUST be a single xsd:string value when present. Full IC per ODR-0006 §Q6 borne by the registration-record (LEI / Companies House number); subclass relationship to org:Organization preserves cross-vocabulary identity."@en ;
    sh:path opda:hasAssertedCapacity ;
    sh:severity sh:Violation .
```

#### Severity tier

`sh:Violation` (Cat 1 — identity-key)

#### Target

`sh:targetClass opda:Organisation`; property `opda:hasAssertedCapacity`

#### Validation behaviour

For every `opda:Organisation` instance, `opda:hasAssertedCapacity` MUST be at most one xsd:string when present. The full Organisation IC (LEI / Companies House number) is borne by the registration record; cross-vocabulary identity preserved by `rdfs:subClassOf org:Organization`. Exemplar [`organisation-with-merger`](../exemplars/organisation-with-merger.md) demonstrates merger with `prov:wasDerivedFrom` chain (predecessors dissolve; successor minted).

#### Source ODR + ADR

- [ODR-0006 §Q4 + §Q6](../../../ontology/odr/ODR-0006-agents-and-roles.md)
- [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

### opda:PersonIdentityKeyShape

```turtle
opda:PersonIdentityKeyShape
    rdf:type sh:NodeShape ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0006/section-Q1> ;
    sh:property _:bf660b84eaa1e ;
    sh:targetClass opda:Person .

_:bf660b84eaa1e
    sh:datatype xsd:string ;
    sh:maxCount "1"^^xsd:integer ;
    sh:message "Person identity-key surface: hasAssertedCapacity MUST be a single xsd:string value when present. The full Person IC per ODR-0006 §Q1 is borne by the identifier-bundle (NI number / passport / driving-licence); succession is tracked by the IdentifierSuccessionRule SHACL-AF rule below."@en ;
    sh:path opda:hasAssertedCapacity ;
    sh:severity sh:Violation .
```

#### Severity tier

`sh:Violation` (Cat 1 — identity-key)

#### Target

`sh:targetClass opda:Person`; property `opda:hasAssertedCapacity`

#### Validation behaviour

For every `opda:Person` instance, `opda:hasAssertedCapacity` MUST be at most one xsd:string when present. The full Person IC (NI number / passport / driving-licence) borne by identifier-bundle; succession tracked by `opda:IdentifierSuccessionRule` (Info). Exemplar [`person-with-name-change`](../exemplars/person-with-name-change.md) demonstrates name-change with PROV-O continuity (one Person individual, NOT two).

#### Source ODR + ADR

- [ODR-0006 §Q1](../../../ontology/odr/ODR-0006-agents-and-roles.md)
- [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

### opda:SpecialCategoryPIIWithoutLawfulBasisShape

```turtle
opda:SpecialCategoryPIIWithoutLawfulBasisShape
    rdf:type sh:NodeShape ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0012/section-Q3> ;
    sh:message "Special-category PII (GDPR Article 10) MUST have an associated dpv:hasLegalBasis triple. ODR-0012 Phase 1 + ODR-0013 §Q1 Category 4: lawful-basis-elevated PII is a Violation-tier breach."@en ;
    sh:severity sh:Violation ;
    sh:sparql _:b1ced501bb698 ;
    sh:targetClass opda:Person .

_:b1ced501bb698
    sh:select "PREFIX opda: <https://opda.org.uk/pdtf/>\nPREFIX dpv: <https://w3id.org/dpv/pd#>\nSELECT $this ?path WHERE {\n  $this opda:hasSpecialCategoryData true .\n  FILTER NOT EXISTS { $this dpv:hasLegalBasis ?basis }\n  BIND (opda:hasSpecialCategoryData AS ?path)\n}" .
```

#### Severity tier

`sh:Violation` (Cat 4 — special-category PII without lawful basis)

#### Target

`sh:targetClass opda:Person`; SPARQL constraint on `opda:hasSpecialCategoryData true` lacking `dpv:hasLegalBasis`.

#### Validation behaviour

For every `opda:Person` instance carrying `opda:hasSpecialCategoryData true`, pyshacl runs the SPARQL select to verify `dpv:hasLegalBasis` is present. Missing lawful basis on Article 10 special-category PII fires the shape. The predicate `opda:hasSpecialCategoryData` is declared at foundation scope per ADR-0014 G14; S012 Q3 may rename it.

#### Source ODR + ADR

- [ODR-0012 §Q3 — Special-category PII discipline](../../../ontology/odr/ODR-0012-shacl-and-dpv-annotation-emission.md)
- [ODR-0013 §Q1 Category 4](../../../ontology/odr/ODR-0013-shacl-validation-and-severity.md)
- [ADR-0014 — BASPI5 round-trip MVP harness (G14)](../../../adr/ADR-0014-baspi5-round-trip-mvp-harness.md)

### opda:IdentifierSuccessionRule

```turtle
opda:IdentifierSuccessionRule
    rdf:type sh:NodeShape ;
    rdfs:comment "Person identifier-succession rule (ODR-0006 §Q1; SHACL-AF citing site #5). Materialises opda:hasIdentifierSuccessionEvent for downstream audit when a NameChangeEvent (or subclass: passport-renewal, NI-renumbering) names the Person via prov:wasAssociatedWith. Per ODR-0017 §1a."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0006/section-Q1> ;
    sh:rule _:b04ddc2ae8a10 ;
    sh:severity sh:Info ;
    sh:targetClass opda:Person .

_:b04ddc2ae8a10
    rdf:type sh:SPARQLRule ;
    sh:construct "PREFIX opda: <https://opda.org.uk/pdtf/>\nPREFIX prov: <http://www.w3.org/ns/prov#>\nCONSTRUCT {\n  ?person opda:hasIdentifierSuccessionEvent ?event .\n}\nWHERE {\n  ?person a opda:Person .\n  ?event a opda:NameChangeEvent ;\n         prov:wasAssociatedWith ?person .\n}" .
```

#### Derives

`opda:hasIdentifierSuccessionEvent` (IRI of the succession event)

#### Citing site

[ODR-0006 §Q1 — Person IC over name-change](../../../ontology/odr/ODR-0006-agents-and-roles.md) (citing site #5)

#### Severity

`sh:Info`

#### Source ODR + ADR

- [ODR-0006 §Q1](../../../ontology/odr/ODR-0006-agents-and-roles.md)
- [ODR-0017 §1a](../../../ontology/odr/ODR-0017-shacl-af-quality-rules-pattern.md)
- [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)

### opda:CapacityAuthorityMatchRule

```turtle
opda:CapacityAuthorityMatchRule
    rdf:type sh:NodeShape ;
    rdfs:comment "Capacity-authority match rule (ODR-0006 §Q4; SHACL-AF citing site #6). Materialises opda:hasCapacityAuthorityMatchStatus to surface Persons declaring a capacity (e.g. 'Director', 'Trustee') without an evidenced authority triple. Status value 'unevidenced-capacity' is a hook for downstream-tooling escalation per ODR-0017 §2a without-substantive-succession discipline."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0006/section-Q4> ;
    sh:rule _:bcd856a2c693b ;
    sh:severity sh:Info ;
    sh:targetClass opda:Person .

_:bcd856a2c693b
    rdf:type sh:SPARQLRule ;
    sh:construct "PREFIX opda: <https://opda.org.uk/pdtf/>\nCONSTRUCT {\n  ?agent opda:hasCapacityAuthorityMatchStatus ?status .\n}\nWHERE {\n  ?agent opda:hasAssertedCapacity ?cap .\n  OPTIONAL { ?agent opda:hasEvidencedAuthority ?auth }\n  BIND (IF(BOUND(?auth), \"matched\", \"unevidenced-capacity\") AS ?status)\n}" .
```

#### Derives

`opda:hasCapacityAuthorityMatchStatus` ("matched" | "unevidenced-capacity")

#### Citing site

[ODR-0006 §Q4 — Capacity / authority split](../../../ontology/odr/ODR-0006-agents-and-roles.md) (citing site #6)

#### Severity

`sh:Info`

#### Source ODR + ADR

- [ODR-0006 §Q4](../../../ontology/odr/ODR-0006-agents-and-roles.md)
- [ODR-0017 §1a + §2a](../../../ontology/odr/ODR-0017-shacl-af-quality-rules-pattern.md)
- [ADR-0012](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)
