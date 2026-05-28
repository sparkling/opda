---
status: proposed
date: 2026-05-28
tags: [physical-ontology, exemplars, address]
---

# listed-building-divergent-addresses

## Summary

Three divergent address surfaces (title / marketing / INSPIRE) on one physical Property. Tests S015 Q6 co-reference SHACL shape across address presentations. Under S015 Q1 Kind commitment: three `opda:Address` Kind instances co-referring via `opda:identifiesSameProperty`.

Cross-link: [Concept tier — Address hard cases](../../concept/property/address.md#hard-cases).

## Exemplar Turtle

```turtle
# Diagnostic exemplar — ODR-0004 §8a, IC-only — input to ODR-0015 (Address & Geography).
# Situation: a Grade II-listed building with three divergent address presentations —
# the title address (as on the HMLR register), the marketing address (as on Rightmove),
# and the INSPIRE-derived cadastral address. All three identify the same physical Property.
# Status: ratified. Namespace: https://w3id.org/opda/# (Session 003b + ADR-0006).
# ODR-0004 status: accepted (council: session-004; wg-decision: session-003b).
# ODR-0005 status: proposed (council: session-005); ODR-0015 status: proposed (council: session-015).
# This exemplar was authored under the Kind reading natively (S015 Q1 Substance Kind verdict);
# the structure matches the ratified ODR-0015 §3b class with property shapes.
# Amended 2026-05-27 post-S015 close: added opda:hasAddress join predicate from Property side
# (S005 §6b + S015 Q3 — opda:hasAddress is the canonical Property→Address join).

@prefix opda:    <https://w3id.org/opda/#> .
@prefix opda-x:  <https://openpropdata.org.uk/data/exemplar/listed-building-divergent-addresses/> .
@prefix dct:     <http://purl.org/dc/terms/> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix skos:    <http://www.w3.org/2004/02/skos/core#> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .

opda-x:exemplar
    a opda:DiagnosticExemplar ;
    dct:title "Listed building with divergent title / marketing / INSPIRE addresses" ;
    dct:status "ratified" ;
    dct:references <ODR-0015> , <ODR-0005> , <ODR-0004> ;
    skos:scopeNote
        "Tests Address co-reference. One physical opda:Property (Q5 3-class from S005); one opda:LegalEstate (freehold); one opda:RegisteredTitle (HMLR title NK123456); three divergent address surfaces — title-address ('The Old Rectory, Glebe Lane, Stamford'), marketing-address ('The Old Rectory, near Wothorpe'), INSPIRE-derived cadastral address. The Q1 UFO category answer dictates the modelling: if Address is a Mode of presentation (Guarino's S001 Q4 framing carried), the three are three modes on one Property; if Address is a Kind (INSPIRE feature-as-class position), the three are three Kind instances co-referring via opda:identifiesSameProperty (S005's predicate). The Q6 SHACL co-reference shape must validate that the three agree on UPRN + postcode + first-line-prefix; disagreement is a data-quality finding, not modelling failure." .

# Physical Property
opda-x:property
    a opda:Property ;
    rdfs:label "Grade II-listed rectory at the Glebe Lane site" ;
    opda:uprn "100070888000" ;
    opda:inspireId "urn:opda:inspire:OS:200099876" ;
    opda:listedStatus "Grade II" .

# Three address presentations — the structure each takes is the S015 Q3 question
opda-x:title-address
    a opda:Address ;
    rdfs:label "Title address (as recorded on HMLR title NK123456)" ;
    opda:addressVariant "title" ;
    opda:line1 "The Old Rectory" ;
    opda:line2 "Glebe Lane" ;
    opda:postTown "Stamford" ;
    opda:postcode "PE9 2RW" ;
    opda:country "GB" .

opda-x:marketing-address
    a opda:Address ;
    rdfs:label "Marketing address (estate agent's Rightmove listing)" ;
    opda:addressVariant "marketing" ;
    opda:line1 "The Old Rectory" ;
    opda:line2 "near Wothorpe" ;
    opda:postTown "Stamford" ;
    opda:postcode "PE9 2RW" ;
    opda:country "GB" .

opda-x:inspire-address
    a opda:Address ;
    rdfs:label "INSPIRE-cadastral-derived address (from OS AddressBase via inspireId)" ;
    opda:addressVariant "inspire" ;
    opda:line1 "The Old Rectory" ;
    opda:postTown "Stamford" ;
    opda:postcode "PE9 2RW" ;
    opda:country "GB" .

# Co-reference: all three Address resources identify the same physical Property
# (S015 Q1 Kind commitment; Q2 IC rule 3 — cross-variant identity-claim never collapses).
opda-x:title-address opda:identifiesSameProperty opda-x:property .
opda-x:marketing-address opda:identifiesSameProperty opda-x:property .
opda-x:inspire-address opda:identifiesSameProperty opda-x:property .

# Property→Address join via opda:hasAddress (S005 §6b pre-commitment; S015 Q3).
opda-x:property opda:hasAddress opda-x:title-address , opda-x:marketing-address , opda-x:inspire-address .

# Note: under the S015 Q6 two-tier co-reference SHACL shape, opda:line2 disagreement
# across variants (title: "Glebe Lane" vs marketing: "near Wothorpe") fires sh:Info
# (cross-variant disagreement is legitimate per Q2 IC rule 3); no sh:Warning, no sh:Violation.
```

## Expected report Turtle

```turtle
# listed-building-divergent-addresses-expected-report.ttl
@prefix dct: <http://purl.org/dc/terms/> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<https://w3id.org/opda/data/exemplar-reports/report>
    rdf:type sh:ValidationReport ;
    dct:source <https://openpropdata.org.uk/data/exemplar/listed-building-divergent-addresses> ;
    sh:conforms "true"^^xsd:boolean .
```

## SHACL outcome

`sh:conforms true`. All three Address instances satisfy `opda:AddressIdentityKeyShape`. The `opda:INSPIRESuccessionRule` materialises `opda:hasINSPIRESuccessionStatus "inspire-primary"` on the inspire-variant Address (no `prov:wasDerivedFrom`).

## Source ODR + ADR

- [ODR-0004 §8a](../../../ontology/odr/ODR-0004-pdtf-ontology-foundation.md)
- [ODR-0015 §3a + §3b (Q1 + Q3 + Q6)](../../../ontology/odr/ODR-0015-address-and-geography.md)
- [ADR-0014](../../../adr/ADR-0014-baspi5-round-trip-mvp-harness.md)
