---
date: 2026-05-28
entityUri: opda:Shapes
kind: entity
module: claim
sourceTtl: source/03-standards/ontology/opda-claim-shapes.ttl
status: proposed
tags:
- physical-ontology
- claim
- shacl
- shapes
tier: physical-ontology
title: Claim shapes
---

# Claim shapes

5 SHACL shapes (2 identity-key + 1 IC-breach + 2 SHACL-AF rules), emitted into `opda-claim-shapes.ttl`.

## Header

```turtle
<https://opda.org.uk/pdtf/graph/claim-shapes>
    rdf:type owl:Ontology ;
    dct:title "OPDA Claim Shapes"@en ;
    opda:targetsClassGraph <https://opda.org.uk/pdtf/harness/release/1.0.0/> .
```

### opda:ClaimIdentityKeyShape

```turtle
opda:ClaimIdentityKeyShape
    rdf:type sh:NodeShape ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q1> ;
    sh:property _:b2b18495da174 ;
    sh:targetClass opda:Claim .

_:b2b18495da174
    sh:datatype xsd:string ;
    sh:maxCount "1"^^xsd:integer ;
    sh:message "Claim digest MUST be a single xsd:string value when present. The digest hashes the (assertion-content, evidence-set, attestor) tuple per ODR-0009 §Q1."@en ;
    sh:path opda:digest ;
    sh:severity sh:Violation .
```

#### Severity tier

`sh:Violation` (Cat 1 — identity-key)

#### Target

`sh:targetClass opda:Claim`; property `opda:digest`

#### Validation behaviour

For every `opda:Claim` instance, `opda:digest` MUST be at most one xsd:string when present. The digest hashes the (assertion-content, evidence-set, attestor) tuple. Exemplar [`claim-with-document-evidence`](../exemplars/claim-with-document-evidence.md) demonstrates conforming usage with eIDAS Substantial assurance via court-issued document.

#### Source ODR + ADR

- [ODR-0009 §Q1](/modelling/odr/odr-0009)
- [ADR-0012](/modelling/adr/adr-0012)

### opda:EvidenceIdentityKeyShape

```turtle
opda:EvidenceIdentityKeyShape
    rdf:type sh:NodeShape ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q1> ;
    sh:property _:bd9c7ae50e511 ;
    sh:targetClass opda:Evidence .

_:bd9c7ae50e511
    sh:datatype xsd:string ;
    sh:maxCount "1"^^xsd:integer ;
    sh:message "Evidence digest MUST be a single xsd:string value when present. Provides content-addressable provenance per ODR-0009 §Q1."@en ;
    sh:path opda:digest ;
    sh:severity sh:Violation .
```

#### Severity tier

`sh:Violation` (Cat 1 — identity-key)

#### Target

`sh:targetClass opda:Evidence` (covers all three subtypes: `DocumentEvidence`, `ElectronicRecordEvidence`, `VouchEvidence`); property `opda:digest`

#### Validation behaviour

For every `opda:Evidence` instance (including subtypes), `opda:digest` MUST be at most one xsd:string when present. Provides content-addressable provenance.

#### Source ODR + ADR

- [ODR-0009 §Q1](/modelling/odr/odr-0009)
- [ADR-0012](/modelling/adr/adr-0012)

### opda:UnprovenancedClaimShape

```turtle
opda:UnprovenancedClaimShape
    rdf:type sh:NodeShape ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q1> ;
    sh:property _:bbf6f8958de90 ;
    sh:targetClass opda:Claim .

_:bbf6f8958de90
    sh:message "Claim MUST carry prov:wasDerivedFrom (or be explicitly marked unverified per Moreau S009 amendment). ODR-0013 §Severity tiering Cat 2: unprovenanced Claims are a Violation-tier IC breach."@en ;
    sh:minCount "1"^^xsd:integer ;
    sh:path prov:wasDerivedFrom ;
    sh:severity sh:Violation .
```

#### Severity tier

`sh:Violation` (Cat 2 — IC breach: unprovenanced claim)

#### Target

`sh:targetClass opda:Claim`; property `prov:wasDerivedFrom`

#### Validation behaviour

For every `opda:Claim` instance, at least one `prov:wasDerivedFrom` triple MUST be present (the claim must be derived from named evidence). Moreau S009 amendment allows an explicit "unverified" marker for the edge case. Exemplars [`claim-with-document-evidence`](../exemplars/claim-with-document-evidence.md), [`claim-with-electronic-record-evidence`](../exemplars/claim-with-electronic-record-evidence.md), and [`claim-with-vouch-evidence`](../exemplars/claim-with-vouch-evidence.md) all demonstrate `prov:wasDerivedFrom` chains.

#### Source ODR + ADR

- [ODR-0009 §Q1](/modelling/odr/odr-0009)
- [ODR-0013 §Q1 Cat 2](/modelling/odr/odr-0013)
- [ADR-0012](/modelling/adr/adr-0012)

### opda:PROVOClaimsRule

```turtle
opda:PROVOClaimsRule
    rdf:type sh:NodeShape ;
    rdfs:comment "PROV-O Claims/Evidence rule (ODR-0009 §Q7; SHACL-AF citing site #4). Materialises opda:hasProvenanceChainStatus to surface Claims with absent or partial PROV-O chains. Per ODR-0017 §1a; complements the UnprovenancedClaimShape (which is a Violation-tier shape; this is informative)."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q7> ;
    sh:rule _:bb11b45f9d7c0 ;
    sh:severity sh:Info ;
    sh:targetClass opda:Claim .

_:bb11b45f9d7c0
    rdf:type sh:SPARQLRule ;
    sh:construct "PREFIX opda: <https://opda.org.uk/pdtf/>\nPREFIX prov: <http://www.w3.org/ns/prov#>\nCONSTRUCT {\n  ?claim opda:hasProvenanceChainStatus ?status .\n}\nWHERE {\n  ?claim a opda:Claim .\n  OPTIONAL { ?claim prov:wasDerivedFrom ?source }\n  OPTIONAL { ?claim prov:wasGeneratedBy ?activity }\n  BIND (IF(BOUND(?source) || BOUND(?activity), \"chain-present\", \"chain-absent\") AS ?status)\n}" .
```

#### Derives

`opda:hasProvenanceChainStatus` ("chain-present" | "chain-absent")

#### Citing site

[ODR-0009 §Q7 — claims provenance chain](/modelling/odr/odr-0009) (citing site #4)

#### Severity

`sh:Info` (complements the Violation-tier `UnprovenancedClaimShape`; this is informative)

#### Source ODR + ADR

- [ODR-0009 §Q7](/modelling/odr/odr-0009)
- [ODR-0017 §1a](/modelling/odr/odr-0017)
- [ADR-0012](/modelling/adr/adr-0012)

### opda:VerificationActivitySuccessionRule

```turtle
opda:VerificationActivitySuccessionRule
    rdf:type sh:NodeShape ;
    rdfs:comment "VerificationActivity succession rule (ODR-0009 §Q7; SHACL-AF citing site #9). Materialises opda:hasVerificationSuccessionStatus to track re-verification chains via prov:wasInformedBy. Per ODR-0017 §1a."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0009/section-Q7> ;
    sh:rule _:b28ba9d05939d ;
    sh:severity sh:Info ;
    sh:targetClass opda:VerificationActivity .

_:b28ba9d05939d
    rdf:type sh:SPARQLRule ;
    sh:construct "PREFIX opda: <https://opda.org.uk/pdtf/>\nPREFIX prov: <http://www.w3.org/ns/prov#>\nCONSTRUCT {\n  ?activity opda:hasVerificationSuccessionStatus ?status .\n}\nWHERE {\n  ?activity a opda:VerificationActivity .\n  OPTIONAL { ?activity prov:wasInformedBy ?prior .\n             ?prior a opda:VerificationActivity }\n  BIND (IF(BOUND(?prior), \"re-verified\", \"initial-verification\") AS ?status)\n}" .
```

#### Derives

`opda:hasVerificationSuccessionStatus` ("re-verified" | "initial-verification")

#### Citing site

[ODR-0009 §Q7 — re-verification chains](/modelling/odr/odr-0009) (citing site #9)

#### Severity

`sh:Info`

#### Source ODR + ADR

- [ODR-0009 §Q7](/modelling/odr/odr-0009)
- [ODR-0017 §1a](/modelling/odr/odr-0017)
- [ADR-0012](/modelling/adr/adr-0012)
