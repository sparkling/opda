---
status: proposed
date: 2026-05-28
tags: [physical-ontology, exemplars, claim, evidence]
---

# claim-with-document-evidence

## Summary

PR claim of authority to sell, supported by a grant of probate document (HMCTS). Tests PROV-O qualified attribution, document-evidence type, eIDAS Substantial-tier assurance for court-issued instrument, and trust-framework conformance.

Cross-link: [Concept tier — Claim hard cases](../../concept/claim/claim.md#hard-cases).

## Exemplar Turtle

```turtle
# Diagnostic exemplar — ODR-0004 §8a, IC-only — input to ODR-0009 (Claims, Evidence & Provenance).
# Situation: a Personal Representative claim of authority to sell, supported by a grant of probate
# document. Tests PROV-O qualified attribution; document-evidence type; eIDAS Substantial-tier
# assurance for a court-issued instrument; trust-framework conformance.
# Status: ratified. Namespace: https://w3id.org/opda/# (Session 003b + ADR-0006).
# ODR-0004 status: accepted (council: session-004; wg-decision: session-003b).
# ODR-0009 status: proposed (S009 to ratify).

@prefix opda:    <https://w3id.org/opda/#> .
@prefix opda-x:  <https://openpropdata.org.uk/data/exemplar/claim-with-document-evidence/> .
@prefix prov:    <http://www.w3.org/ns/prov#> .
@prefix dct:     <http://purl.org/dc/terms/> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix skos:    <http://www.w3.org/2004/02/skos/core#> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .

opda-x:exemplar
    a opda:DiagnosticExemplar ;
    dct:title "Claim with document evidence — grant of probate supporting sellersCapacity" ;
    dct:status "ratified" ;
    dct:references <ODR-0009> , <ODR-0006> , <ODR-0005> , <ODR-0004> ;
    skos:scopeNote
        "Tests PROV-O backbone for claims supported by document evidence. A Personal Representative (sellersCapacity from S011 Method/plan code scheme) claims authority to sell on behalf of a deceased proprietor; the evidence is a grant of probate issued by HMCTS. Under S009 Q1's 80%-PROV-O / 5-residue split: prov:wasAttributedTo (claim to claimant) + prov:wasGeneratedBy (claim from probate verification activity) + prov:used (activity used the probate document). The opda:assuranceLevel (S011 Quality Region scheme) is 'Substantial' under eIDAS — court-issued instruments meet the criterion. Q5 trust_framework conformance: dct:conformsTo <opda:UKPropertyDataTrustFramework>." .

# The claim — a Personal-Representative-acts-on-behalf assertion
opda-x:claim
    a opda:Claim ;
    rdfs:label "PR claim: Patricia Smith acts as Personal Representative for Estate of Henry Smith (deceased)" ;
    opda:claimType "sellersCapacity" ;
    opda:claimContent "Personal Representative" ;
    opda:assuranceLevel "Substantial" ;
    dct:conformsTo <opda:UKPropertyDataTrustFramework> .

# The verification activity (PROV-O backbone)
opda-x:verification-activity
    a prov:Activity , opda:VerificationActivity ;
    rdfs:label "Probate verification activity (conveyancer's office, 2024-03-12)" ;
    prov:atTime "2024-03-12T11:30:00Z"^^xsd:dateTime ;
    prov:used opda-x:probate-document ;
    opda:verificationMethod "document-inspection" .

# The probate document (the evidence)
opda-x:probate-document
    a opda:Document , prov:Entity ;
    rdfs:label "Grant of probate HMCTS reference 2024-PB-09876" ;
    opda:documentType "grant-of-probate" ;
    opda:issuerAuthority <opda:HMCTS> ;
    opda:documentReference "2024-PB-09876" ;
    opda:issuedOn "2024-02-18"^^xsd:date .

# Qualified attribution — claim attributed to claimant via the verification activity
opda-x:claim-attribution
    a prov:Attribution ;
    prov:agent opda-x:patricia-smith ;
    prov:hadRole opda:PersonalRepresentativeRole .

opda-x:claim prov:qualifiedAttribution opda-x:claim-attribution .
opda-x:claim prov:wasGeneratedBy opda-x:verification-activity .

# The claimant
opda-x:patricia-smith
    a opda:Person ;
    rdfs:label "Patricia Smith (claimant; Personal Representative)" ;
    opda:dateOfBirth "1967-02-14"^^xsd:date .

# Cryptographic digest of the claim (S009 Q4 — local opda:digest, not PROV signature)
opda-x:claim
    opda:digest "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" .
```

## Expected report Turtle

```turtle
# claim-with-document-evidence-expected-report.ttl — paired SHACL validation report
@prefix dct: <http://purl.org/dc/terms/> .
@prefix prov: <http://www.w3.org/ns/prov#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<https://w3id.org/opda/data/exemplar-reports/report>
    rdf:type sh:ValidationReport ;
    dct:source <https://openpropdata.org.uk/data/exemplar/claim-with-document-evidence> ;
    sh:conforms "false"^^xsd:boolean ;
    sh:result <https://w3id.org/opda/data/exemplar-reports/result-b4d6c0b2bc71> .

<https://w3id.org/opda/data/exemplar-reports/result-b4d6c0b2bc71>
    rdf:type sh:ValidationResult ;
    sh:focusNode <https://openpropdata.org.uk/data/exemplar/claim-with-document-evidence/claim> ;
    sh:resultMessage "Claim MUST carry prov:wasDerivedFrom (or be explicitly marked unverified per Moreau S009 amendment). ODR-0013 §Severity tiering Cat 2: unprovenanced Claims are a Violation-tier IC breach."@en ;
    sh:resultPath prov:wasDerivedFrom ;
    sh:resultSeverity sh:Violation ;
    sh:sourceConstraintComponent sh:MinCountConstraintComponent .
```

## SHACL outcome

`sh:conforms false`. The shape that fires is [`opda:UnprovenancedClaimShape`](../claim/shapes.md#opdaunprovenancedclaimshape) (Cat 2 — IC breach):

- `sh:focusNode`: `opda-x:claim`
- `sh:resultPath`: `prov:wasDerivedFrom`
- `sh:resultSeverity`: `sh:Violation`
- `sh:sourceConstraintComponent`: `sh:MinCountConstraintComponent`

The exemplar uses `prov:wasGeneratedBy` (verification activity) + `prov:used` (document) but NOT `prov:wasDerivedFrom` (claim → evidence). The Council's S009 ratification may amend; in the current shapes graph, the missing predicate is a Violation. This exemplar exercises the gate.

The `opda:ClaimIdentityKeyShape` is satisfied (single `opda:digest`); the `opda:PROVOClaimsRule` materialises `opda:hasProvenanceChainStatus "chain-present"` (because `prov:wasGeneratedBy` is bound).

## Source ODR + ADR

- [ODR-0004 §8a](../../../ontology/odr/ODR-0004-pdtf-ontology-foundation.md)
- [ODR-0009 §Q1 + §Q2 + §Q3 + §Q5 — Claims, evidence and provenance](../../../ontology/odr/ODR-0009-claims-evidence-and-provenance.md)
- [ODR-0013 §Q1 Cat 2 — unprovenanced Claims](../../../ontology/odr/ODR-0013-shacl-validation-and-severity.md)
- [ADR-0014](../../../adr/ADR-0014-baspi5-round-trip-mvp-harness.md)
