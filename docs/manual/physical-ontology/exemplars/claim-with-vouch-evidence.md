---
status: proposed
date: 2026-05-28
tags: [physical-ontology, exemplars, claim, evidence]
---

# claim-with-vouch-evidence

## Summary

Residency claim supported by SRA-regulated solicitor vouch (eIDAS Low regardless of voucher quality). Q2 `prov:hadRole opda:Voucher` for the voucher's qualified attribution alongside the subject's attribution.

Cross-link: [Concept tier — Vouch evidence hard cases](../../concept/claim/vouch-evidence.md#hard-cases).

## Exemplar Turtle

```turtle
# Diagnostic exemplar — ODR-0004 §8a, IC-only — input to ODR-0009 (Claims, Evidence & Provenance).
# Situation: a residency claim supported by a vouch from a professional adviser (regulated
# solicitor) — qualitatively weaker than document or electronic-record evidence; eIDAS Low.
# Tests vouch-evidence type; Q2 prov:qualifiedAttribution with prov:hadRole for the voucher;
# Q3 assurance-level downgrade for vouch-only evidence.
# Status: ratified. Namespace: https://w3id.org/opda/# (Session 003b + ADR-0006).
# ODR-0004 status: accepted (council: session-004; wg-decision: session-003b).
# ODR-0009 status: proposed (S009 to ratify).

@prefix opda:    <https://w3id.org/opda/#> .
@prefix opda-x:  <https://openpropdata.org.uk/data/exemplar/claim-with-vouch-evidence/> .
@prefix prov:    <http://www.w3.org/ns/prov#> .
@prefix dct:     <http://purl.org/dc/terms/> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix skos:    <http://www.w3.org/2004/02/skos/core#> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .

opda-x:exemplar
    a opda:DiagnosticExemplar ;
    dct:title "Claim with vouch evidence — SRA-regulated solicitor vouches for residency" ;
    dct:status "ratified" ;
    dct:references <ODR-0009> , <ODR-0006> , <ODR-0004> ;
    skos:scopeNote
        "Tests vouch-evidence type — a person's professional-regulator-licensed adviser confirms the claim via formal attestation. Under S009 Q1 the PROV-O backbone applies but the assurance-level downgrades: vouch-only evidence is eIDAS 'Low' (Q3 SKOS scheme; S011 Quality Region) regardless of voucher quality — confirmation by a regulated professional is corroborative, not authoritative. Q2 qualified attribution: prov:qualifiedAttribution + prov:hadRole opda:Voucher captures the voucher's role. Q7 SHACL-over-PROV: the `sh:xone` dispatch on evidence-type validates voucher-specific properties (regulator-licence-number, attestation-date) without firing for document or electronic-record." .

# The claim — residency assertion
opda-x:claim
    a opda:Claim ;
    rdfs:label "Residency claim: Aaron Patel is resident at 22 Maple Court" ;
    opda:claimType "residency" ;
    opda:claimContent "Aaron Patel resident at 22 Maple Court, Bristol, BS1 5RT for >12 months" ;
    opda:assuranceLevel "Low" ;
    dct:conformsTo <opda:UKPropertyDataTrustFramework> .

# The verification activity (PROV-O backbone)
opda-x:verification-activity
    a prov:Activity , opda:VerificationActivity ;
    rdfs:label "Solicitor vouch verification activity (2024-06-04)" ;
    prov:atTime "2024-06-04T15:42:00Z"^^xsd:dateTime ;
    prov:used opda-x:vouch-attestation ;
    opda:verificationMethod "vouch" .

# The vouch (the evidence) — a formal attestation by a regulated professional
opda-x:vouch-attestation
    a opda:Vouch , prov:Entity ;
    rdfs:label "Solicitor vouch of residency for Aaron Patel (signed 2024-06-04)" ;
    opda:voucherRegulator <opda:SRA> ;
    opda:voucherLicenseNumber "SRA-541234" ;
    opda:attestationDate "2024-06-04"^^xsd:date ;
    opda:attestationStatement "I confirm that Aaron Patel has resided at 22 Maple Court, Bristol, BS1 5RT for over 12 months." .

# Qualified attribution — claim attributed via the verifier with explicit voucher Role
opda-x:claim-attribution
    a prov:Attribution ;
    prov:agent opda-x:aaron-patel ;
    prov:hadRole opda:VerifiedResidencySubjectRole .

opda-x:vouch-attribution
    a prov:Attribution ;
    prov:agent opda-x:solicitor-andrea-kessler ;
    prov:hadRole opda:VoucherRole .

opda-x:claim prov:qualifiedAttribution opda-x:claim-attribution , opda-x:vouch-attribution .
opda-x:claim prov:wasGeneratedBy opda-x:verification-activity .

# The claim subject + the voucher
opda-x:aaron-patel
    a opda:Person ;
    rdfs:label "Aaron Patel (claim subject)" .

opda-x:solicitor-andrea-kessler
    a opda:Person ;
    rdfs:label "Andrea Kessler (voucher; SRA-regulated solicitor)" .

# Cryptographic digest (S009 Q4)
opda-x:claim
    opda:digest "sha256:b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9" .
```

## Expected report Turtle

```turtle
# claim-with-vouch-evidence-expected-report.ttl
@prefix dct: <http://purl.org/dc/terms/> .
@prefix prov: <http://www.w3.org/ns/prov#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<https://w3id.org/opda/data/exemplar-reports/report>
    rdf:type sh:ValidationReport ;
    dct:source <https://openpropdata.org.uk/data/exemplar/claim-with-vouch-evidence> ;
    sh:conforms "false"^^xsd:boolean ;
    sh:result <https://w3id.org/opda/data/exemplar-reports/result-d134591d192d> .

<https://w3id.org/opda/data/exemplar-reports/result-d134591d192d>
    rdf:type sh:ValidationResult ;
    sh:focusNode <https://openpropdata.org.uk/data/exemplar/claim-with-vouch-evidence/claim> ;
    sh:resultMessage "Claim MUST carry prov:wasDerivedFrom (or be explicitly marked unverified per Moreau S009 amendment). ODR-0013 §Severity tiering Cat 2: unprovenanced Claims are a Violation-tier IC breach."@en ;
    sh:resultPath prov:wasDerivedFrom ;
    sh:resultSeverity sh:Violation ;
    sh:sourceConstraintComponent sh:MinCountConstraintComponent .
```

## SHACL outcome

`sh:conforms false`. Same Violation as the document-evidence + electronic-record-evidence exemplars — [`opda:UnprovenancedClaimShape`](../claim/shapes.md#opdaunprovenancedclaimshape) fires on the missing `prov:wasDerivedFrom`. The three claim exemplars all exercise the same gate; their evidence-type discrimination (`sh:xone` per S009 Q7) is exercised when `prov:wasDerivedFrom` is added.

## Source ODR + ADR

- [ODR-0004 §8a](../../../ontology/odr/ODR-0004-pdtf-ontology-foundation.md)
- [ODR-0009 §Q1 + §Q2 + §Q3 — Claims (vouch-evidence type; eIDAS Low cap)](../../../ontology/odr/ODR-0009-claims-evidence-and-provenance.md)
- [ODR-0013 §Q1 Cat 2](../../../ontology/odr/ODR-0013-shacl-validation-and-severity.md)
- [ADR-0014](../../../adr/ADR-0014-baspi5-round-trip-mvp-harness.md)
