---
date: 2026-05-28
entityUri: opda:Annotations
kind: entity
module: descriptive
sourceTtl: source/03-standards/ontology/opda-descriptive-annotations.ttl
status: proposed
tags:
- physical-ontology
- descriptive
- annotations
- dpv
tier: physical-ontology
title: Descriptive annotations
---

# Descriptive annotations

Mixed: 1 class with DPV baseline (`EPCCertificate`), 4 without baseline (PII flows transitively via linked `opda:Property`). Emitted into `opda-descriptive-annotations.ttl`.

## Header

```turtle
<https://opda.org.uk/pdtf/graph/descriptive-annotations>
    rdf:type owl:Ontology ;
    dct:references <https://w3id.org/dpv/pd> ;
    dct:title "OPDA Descriptive Annotations"@en ;
    opda:targetsClassGraph <https://opda.org.uk/pdtf/harness/release/1.0.0/> .
```

## EPCCertificate — class-level baseline

```turtle
opda:EPCCertificate
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0018/section-Rule1> ;
    dpv-pd:hasPersonalDataCategory dpv-pd:PostalAddress .
```

EPCs carry `dpv-pd:PostalAddress` baseline (the EPC includes the property address).

## Transitive no-baseline classes (4)

### opda:Comparable

```turtle
opda:Comparable
    rdfs:comment "No DPV class-level baseline; PII coverage flows transitively via the linked opda:Property (which carries the postal-address baseline). Per ODR-0018 §Rule 1: only direct PII-bearing Kinds declare a baseline; transitively-linked Kinds do not duplicate the upstream baseline."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0018/section-Rule1> .
```

### opda:Search

```turtle
opda:Search
    rdfs:comment "No DPV class-level baseline; PII coverage flows transitively via the linked opda:Property (which carries the postal-address baseline). Per ODR-0018 §Rule 1: only direct PII-bearing Kinds declare a baseline; transitively-linked Kinds do not duplicate the upstream baseline."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0018/section-Rule1> .
```

### opda:Survey

```turtle
opda:Survey
    rdfs:comment "No DPV class-level baseline; PII coverage flows transitively via the linked opda:Property (which carries the postal-address baseline). Per ODR-0018 §Rule 1: only direct PII-bearing Kinds declare a baseline; transitively-linked Kinds do not duplicate the upstream baseline."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0018/section-Rule1> .
```

### opda:Valuation

```turtle
opda:Valuation
    rdfs:comment "No DPV class-level baseline; PII coverage flows transitively via the linked opda:Property (which carries the postal-address baseline). Per ODR-0018 §Rule 1: only direct PII-bearing Kinds declare a baseline; transitively-linked Kinds do not duplicate the upstream baseline."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0018/section-Rule1> .
```

## Source ODR + ADR

- [ODR-0018 §Rule 1 — DPV co-annotation pattern (no transitive duplication)](/modelling/odr/odr-0018)
- [ADR-0012 — SHACL + DPV annotation emission](/modelling/adr/adr-0012)
