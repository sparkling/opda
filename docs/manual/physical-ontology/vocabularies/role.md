---
status: proposed
date: 2026-05-28
tags: [physical-ontology, vocabularies, skos, role]
---

# opda:RoleScheme

## Summary

Role labels for the anti-rigid Roles a Person/Organisation plays as a Participant in a Transaction Relator. See also: [Concept tier](../../concept/agent/seller.md) | [Concept tier — buyer](../../concept/agent/buyer.md).

## Scheme header

```turtle
opda:RoleScheme
    rdf:type skos:ConceptScheme ;
    skos:prefLabel "Participant Role"@en ;
    skos:definition "Role labels for the anti-rigid Roles a Person/Organisation plays as a Participant in a Transaction Relator."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0011#section-8a-ufo-meta-category> ;
    dct:title "Transaction participant role label"@en ;
    skos:scopeNote "UFO: Role label (Guizzardi 2005 Ch. 4 — anti-rigid Roles in a Relator). DOLCE: Endurant-played-role (Masolo D18 §4)."@en ;
    opda:hasSteward "Guizzardi (RoleMixin steward per S006 Q2)"@en ;
    opda:ufoCategory "Role label" .
```

## Members (12)

| URI | prefLabel | notation |
|---|---|---|
| `opda:role/Buyer` | "Buyer" | Buyer |
| `opda:role/Buyers-Agent` | "Buyer's Agent" | Buyer's Agent |
| `opda:role/Buyers-Conveyancer` | "Buyer's Conveyancer" | Buyer's Conveyancer |
| `opda:role/Estate-Agent` | "Estate Agent" | Estate Agent |
| `opda:role/Landlord` | "Landlord" | Landlord |
| `opda:role/Lender` | "Lender" | Lender |
| `opda:role/Mortgage-Broker` | "Mortgage Broker" | Mortgage Broker |
| `opda:role/Prospective-Buyer` | "Prospective Buyer" | Prospective Buyer |
| `opda:role/Seller` | "Seller" | Seller |
| `opda:role/Sellers-Conveyancer` | "Seller's Conveyancer" | Seller's Conveyancer |
| `opda:role/Surveyor` | "Surveyor" | Surveyor |
| `opda:role/Tenant` | "Tenant" | Tenant |

### Member Turtle (sample)

```turtle
<https://w3id.org/opda/#role/Buyer>
    rdf:type skos:Concept ;
    skos:prefLabel "Buyer"@en ;
    skos:definition "Party acquiring legal title."@en ;
    dct:source <https://w3id.org/opda/data-dictionary#participants[].role.Buyer> ;
    skos:inScheme opda:RoleScheme ;
    skos:notation "Buyer" .

<https://w3id.org/opda/#role/Seller>
    rdf:type skos:Concept ;
    skos:prefLabel "Seller"@en ;
    skos:definition "Party transferring legal title."@en ;
    dct:source <https://w3id.org/opda/data-dictionary#participants[].role.Seller> ;
    skos:inScheme opda:RoleScheme ;
    skos:notation "Seller" .

# Remaining 10 roles (Buyer's Agent, Buyer's Conveyancer, Estate Agent, Landlord, Lender,
# Mortgage Broker, Prospective Buyer, Seller's Conveyancer, Surveyor, Tenant) follow the same pattern.
# See source: opda-vocabularies.ttl lines 865-959.
```

Full per-member Turtle: [`opda-vocabularies.ttl` lines 865–959](../../../../source/03-standards/ontology/opda-vocabularies.ttl).

## Scheme membership graph

![opdarolescheme-membership-graph](diagrams/role/opdarolescheme-membership-graph.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
---
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: opda:RoleScheme membership graph
    accDescr: 12 skos:Concept members bound to the scheme via skos:inScheme.

    %% @prefix opda: <https://w3id.org/opda/#>
    %% @prefix skos: <http://www.w3.org/2004/02/skos/core#>

    classDef scheme fill:#F8BBD9,stroke:#AD1457,stroke-width:2px,color:#880E4F
    classDef concept fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C

    S[opda:RoleScheme]:::scheme
    C1[opda:role/Buyer]:::concept
    C2[opda:role/Buyers-Agent]:::concept
    C3[opda:role/Buyers-Conveyancer]:::concept
    C4[opda:role/Estate-Agent]:::concept
    C5[opda:role/Landlord]:::concept
    C6[opda:role/Lender]:::concept
    C7[opda:role/Mortgage-Broker]:::concept
    C8[opda:role/Prospective-Buyer]:::concept
    C9[opda:role/Seller]:::concept
    C10[opda:role/Sellers-Conveyancer]:::concept
    C11[opda:role/Surveyor]:::concept
    C12[opda:role/Tenant]:::concept

    C1 -->|skos:inScheme| S
    C2 -->|skos:inScheme| S
    C3 -->|skos:inScheme| S
    C4 -->|skos:inScheme| S
    C5 -->|skos:inScheme| S
    C6 -->|skos:inScheme| S
    C7 -->|skos:inScheme| S
    C8 -->|skos:inScheme| S
    C9 -->|skos:inScheme| S
    C10 -->|skos:inScheme| S
    C11 -->|skos:inScheme| S
    C12 -->|skos:inScheme| S
```

</details>

## Referenced by

- `opda:Baspi5_BuyerShape` (overlay via `_:b78bd3625e376` + `_:b0654af6bc0f5` — subset: Buyer, Buyer's Conveyancer, Prospective Buyer, Buyer's Agent, Surveyor, Mortgage Broker, Lender, Landlord, Tenant, Estate Agent, Seller's Conveyancer)
- `opda:Baspi5_SellerShape` (overlay via `_:bd693afd83922` + `_:b145accbf4a97` — subset: Seller only)

## Source ODR + ADR

- [ODR-0006 §Q2 — Agents and roles (Role/RoleMixin distinction)](../../../ontology/odr/ODR-0006-agents-and-roles.md)
- [ODR-0011 §8a](../../../ontology/odr/ODR-0011-enumeration-vocabularies.md)
- [ADR-0010](../../../adr/ADR-0010-skos-vocabulary-emission.md)
