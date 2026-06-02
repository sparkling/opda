---
date: 2026-05-28
entityUri: opda:Annotations
kind: entity
module: claim
sourceTtl: source/03-standards/ontology/opda-claim-annotations.ttl
status: proposed
tags:
- physical-ontology
- claim
- annotations
- dpv
tier: physical-ontology
title: Claim annotations
---

# Claim annotations

DPV co-annotation + 3 evidence refinements, emitted into `opda-claim-annotations.ttl`.

## Header

```turtle
<https://opda.org.uk/pdtf/graph/claim-annotations>
    rdf:type owl:Ontology ;
    dct:references <https://w3id.org/dpv/pd> ;
    dct:title "OPDA Claim Annotations"@en ;
    opda:targetsClassGraph <https://opda.org.uk/pdtf/harness/release/1.0.0/> .
```

## Class-level baseline

### opda:Claim

```turtle
opda:Claim
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q6> ;
    dpv-pd:hasPersonalDataCategory dpv-pd:OfficialID .
```

Claims carry `dpv-pd:OfficialID` baseline (claims typically embed official identifiers).

## Evidence refinements

### opda:DocumentEvidenceRefinement

```turtle
opda:DocumentEvidenceRefinement
    rdf:type opda:DPVMappingRefinement ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q6> ;
    dct:references <https://ico.org.uk/for-organisations/guide-to-data-protection/> ;
    opda:lawfulBasis dpv:PublicTask ;
    opda:targetsKind opda:DocumentEvidence ;
    opda:variantPredicate rdf:type ;
    opda:variantValue "document-evidence" .
```

Document-evidence (court-issued) uses `dpv:PublicTask` lawful basis.

### opda:ElectronicRecordEvidenceRefinement

```turtle
opda:ElectronicRecordEvidenceRefinement
    rdf:type opda:DPVMappingRefinement ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q6> ;
    dct:references <https://ico.org.uk/for-organisations/guide-to-data-protection/> ;
    opda:lawfulBasis dpv:LegitimateInterest ;
    opda:targetsKind opda:ElectronicRecordEvidence ;
    opda:variantPredicate rdf:type ;
    opda:variantValue "electronic-record-evidence" .
```

Electronic-record evidence (HMRC tax API etc.) uses `dpv:LegitimateInterest` lawful basis.

### opda:VouchEvidenceRefinement

```turtle
opda:VouchEvidenceRefinement
    rdf:type opda:DPVMappingRefinement ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q6> ;
    dct:references <https://ico.org.uk/for-organisations/guide-to-data-protection/> ;
    opda:lawfulBasis dpv:Consent ;
    opda:targetsKind opda:VouchEvidence ;
    opda:variantPredicate rdf:type ;
    opda:variantValue "vouch-evidence" .
```

Vouch evidence (regulated-professional attestation) uses `dpv:Consent` lawful basis.

## Source ODR + ADR

- [ODR-0009 §Q6 — DPV co-annotation per evidence type](../../../ontology/odr/ODR-0009-claims-evidence-and-provenance.md)
- [ODR-0018 — DPV co-annotation pattern](../../../ontology/odr/ODR-0018-dpv-co-annotation-pattern.md)
- [ADR-0012 — SHACL + DPV annotation emission](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)
