---
date: 2026-05-28
entityUri: opda:EvidenceMethod
kind: scheme
sourceTtl: source/03-standards/ontology/opda-vocabularies.ttl
status: proposed
tags:
- physical-ontology
- vocabularies
- skos
- evidence-method
tier: physical-ontology
title: opda:EvidenceMethodScheme
---

# opda:EvidenceMethodScheme

## Summary

Quality Values for the method by which identity evidence was obtained, per the OIDC4IDA `evidence` taxonomy. See also: [Concept tier](../../concept/claim/evidence.md) | [Logical tier](../../logical/claim/evidence.md).

## Scheme header

```turtle
opda:EvidenceMethodScheme
    rdf:type skos:ConceptScheme ;
    skos:prefLabel "Evidence Method"@en ;
    skos:definition "Quality Values for the method by which identity evidence was obtained, per the OIDC4IDA `evidence` taxonomy."@en ;
    dct:source <https://openid.net/specs/openid-connect-4-identity-assurance-1_0.html> ;
    dct:title "Identity-evidence method (OIDC4IDA)"@en ;
    skos:scopeNote "UFO: Quality Value (Masolo D18 §4.3 — DOLCE Quality Region). Members inherited verbatim from OpenID Connect for Identity Assurance 1.0 `evidence` type per ODR-0011 §4a regulator-citation discipline."@en ;
    opda:hasSteward "Moreau (S009 Q3)"@en ;
    opda:ufoCategory "Quality Value" .
```

## Members

| URI | prefLabel | notation |
|---|---|---|
| `opda:evidenceMethod/Document` | "Document" | Document |
| `opda:evidenceMethod/Electronic-Record` | "Electronic-Record" | Electronic-Record |
| `opda:evidenceMethod/Vouch` | "Vouch" | Vouch |

### Member Turtle

```turtle
<https://w3id.org/opda/#evidenceMethod/Document>
    rdf:type skos:Concept ;
    skos:prefLabel "Document"@en ;
    skos:definition "OIDC4IDA Document evidence: identity evidence obtained by inspecting a physical or digital identity document (passport, driving licence, identity card, etc.)."@en ;
    dct:source <https://openid.net/specs/openid-connect-4-identity-assurance-1_0.html> ;
    skos:inScheme opda:EvidenceMethodScheme ;
    skos:notation "Document" .

<https://w3id.org/opda/#evidenceMethod/Electronic-Record>
    rdf:type skos:Concept ;
    skos:prefLabel "Electronic-Record"@en ;
    skos:definition "OIDC4IDA ElectronicRecord evidence: identity evidence obtained from a verified electronic record held by an authoritative source."@en ;
    dct:source <https://openid.net/specs/openid-connect-4-identity-assurance-1_0.html> ;
    skos:inScheme opda:EvidenceMethodScheme ;
    skos:notation "Electronic-Record" .

<https://w3id.org/opda/#evidenceMethod/Vouch>
    rdf:type skos:Concept ;
    skos:prefLabel "Vouch"@en ;
    skos:definition "OIDC4IDA Vouch evidence: identity evidence obtained through attestation by a trusted third party."@en ;
    dct:source <https://openid.net/specs/openid-connect-4-identity-assurance-1_0.html> ;
    skos:inScheme opda:EvidenceMethodScheme ;
    skos:notation "Vouch" .
```

## Scheme membership graph

![opdaevidencemethodscheme-membership-graph](diagrams/evidence-method/opdaevidencemethodscheme-membership-graph.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
  elk:
    mergeEdges: false
    nodePlacementStrategy: BRANDES_KOEPF
---
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: opda:EvidenceMethodScheme membership graph
    accDescr: 3 skos:Concept members bound to the scheme via skos:inScheme.

    %% @prefix opda: <https://w3id.org/opda/#>
    %% @prefix skos: <http://www.w3.org/2004/02/skos/core#>

    classDef scheme fill:#F8BBD9,stroke:#AD1457,stroke-width:2px,color:#880E4F
    classDef concept fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C

    S[opda:EvidenceMethodScheme]:::scheme
    C1[opda:evidenceMethod/Document]:::concept
    C2[opda:evidenceMethod/Electronic-Record]:::concept
    C3[opda:evidenceMethod/Vouch]:::concept

    C1 -->|skos:inScheme| S
    C2 -->|skos:inScheme| S
    C3 -->|skos:inScheme| S
```

</details>

## Referenced by

- Per-overlay profile bindings (BASPI5 does not surface evidence method in MVP — claims tier deferred)

## Source ODR + ADR

- [ODR-0009 §Q3 — Claims, evidence and provenance](../../../ontology/odr/ODR-0009-claims-evidence-and-provenance.md)
- [ODR-0011 §4a](../../../ontology/odr/ODR-0011-enumeration-vocabularies.md)
- [ADR-0010](../../../adr/ADR-0010-skos-vocabulary-emission.md)
