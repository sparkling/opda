---
date: 2026-05-28
entityUri: opda:Annotations
kind: entity
module: agent
sourceTtl: source/03-standards/ontology/opda-agent-annotations.ttl
status: proposed
tags:
- physical-ontology
- agent
- annotations
- dpv
tier: physical-ontology
title: Agent annotations
---

# Agent annotations

DPV co-annotations + 2 variant refinements, emitted into `opda-agent-annotations.ttl`. Per ODR-0018 §Rule 3, DPV is **referenced** via `dct:references` (NOT imported via `owl:imports`).

## Header

```turtle
<https://opda.org.uk/pdtf/graph/agent-annotations>
    rdf:type owl:Ontology ;
    dct:references <https://w3id.org/dpv/pd> ;
    dct:title "OPDA Agent Annotations"@en ;
    opda:targetsClassGraph <https://opda.org.uk/pdtf/harness/release/1.0.0/> .
```

## Class-level baselines

### opda:Person

```turtle
opda:Person
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0006/section-Q1> ;
    dpv-pd:hasPersonalDataCategory dpv-pd:Name .
```

Person instances carry `dpv-pd:Name` PII baseline.

### opda:Organisation

```turtle
opda:Organisation
    rdfs:comment "No DPV class-level PII baseline for opda:Organisation per ODR-0006 §Q6 + ODR-0018 §Rule 4. Organisations are not data subjects; the sole-trader / individual-director surface produces an opda:Person co-annotation (linked via the actor's ownership / control relationship), not an Organisation co-annotation."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0006/section-Q6> .
```

No baseline — Organisations are not data subjects per ODR-0018 §Rule 4.

## Variant refinements

### opda:PersonDateOfBirthRefinement

```turtle
opda:PersonDateOfBirthRefinement
    rdf:type opda:DPVMappingRefinement ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0018/section-3a> ;
    dct:references <https://ico.org.uk/for-organisations/guide-to-data-protection/> ;
    opda:lawfulBasis dpv-pd:DateOfBirth ;
    opda:targetsKind opda:Person ;
    opda:variantPredicate opda:hasDateOfBirth ;
    opda:variantValue "dob" .
```

Person date-of-birth refinement — `dpv-pd:DateOfBirth` category (ICO guidance).

### opda:PersonEmailRefinement

```turtle
opda:PersonEmailRefinement
    rdf:type opda:DPVMappingRefinement ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0018/section-3a> ;
    dct:references <https://ico.org.uk/for-organisations/guide-to-data-protection/> ;
    opda:lawfulBasis dpv-pd:EmailAddress ;
    opda:targetsKind opda:Person ;
    opda:variantPredicate opda:hasEmail ;
    opda:variantValue "email" .
```

Person email refinement — `dpv-pd:EmailAddress` category (ICO guidance).

## Source ODR + ADR

- [ODR-0006 §Q1 + §Q6 — Agents and roles](/modelling/odr/odr-0006)
- [ODR-0018 §3a + §Rule 4 — DPV co-annotation pattern](/modelling/odr/odr-0018)
- [ADR-0012 — SHACL + DPV annotation emission](/modelling/adr/adr-0012)
