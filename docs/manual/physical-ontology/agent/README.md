---
status: proposed
date: 2026-05-28
tags: [physical-ontology, agent, module]
---

# Agent module

The Agent module emits 7 OWL classes: 2 Substance Kinds (Person, Organisation), 3 anti-rigid Roles/RoleMixins (Seller, Buyer, Proprietor), 1 Relator (Proprietorship), and 1 reified PROV-O Event (NameChangeEvent).

## Files

| File | Role | Source |
|---|---|---|
| `opda-agent.ttl` | 7 OWL classes + DatatypeProperty/ObjectProperty | [opda-agent.ttl](../../../../source/03-standards/ontology/opda-agent.ttl) |
| `opda-agent-shapes.ttl` | 2 identity-key + 2 SHACL-AF rules + 1 Cat 4 PII shape | [opda-agent-shapes.ttl](../../../../source/03-standards/ontology/opda-agent-shapes.ttl) |
| `opda-agent-annotations.ttl` | DPV class-level + 2 variant refinements | [opda-agent-annotations.ttl](../../../../source/03-standards/ontology/opda-agent-annotations.ttl) |

## Ontology header

```turtle
<https://opda.org.uk/pdtf/graph/agent>
    rdf:type owl:Ontology ;
    dct:title "OPDA Agent Module"@en ;
    owl:imports <https://opda.org.uk/pdtf/harness/release/1.0.0/>, <https://opda.org.uk/pdtf/scheme/> ;
    owl:versionIRI <https://opda.org.uk/pdtf/harness/release/agent/1.0.0/> .
```

## Import chain

- `<https://opda.org.uk/pdtf/harness/release/1.0.0/>` — foundation (Role, RoleMixin, Relator meta-classes)
- `<https://opda.org.uk/pdtf/scheme/>` — SKOS schemes (RoleScheme, OwnerType, SellersCapacity)

External vocabularies referenced (not imported):
- `org:Organization` — `opda:Organisation rdfs:subClassOf org:Organization`
- `prov:Activity` — superclass of `opda:NameChangeEvent`

## Classes (7)

| Class | UFO category | Bearer |
|---|---|---|
| `opda:Buyer` | RoleMixin | Person OR Organisation |
| `opda:NameChangeEvent` | Event particular | (event; no bearer) |
| `opda:Organisation` | Substance Kind | (independent; subclass of `org:Organization`) |
| `opda:Person` | Substance Kind | (independent) |
| `opda:Proprietor` | Role | Person (or Organisation under named specialisation) |
| `opda:Proprietorship` | Relator | Property + Proprietors + RegisteredTitle |
| `opda:Seller` | RoleMixin | Person OR Organisation |

See [`classes.md`](./classes.md) for per-class blocks.

## Module class hierarchy

![agent-module--class-hierarchy](diagrams/README/agent-module--class-hierarchy.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
classDiagram
    accTitle: Agent module — class hierarchy
    accDescr: Seven OWL classes. Person and Organisation are Substance Kinds. Seller and Buyer are RoleMixins (cross-sortal). Proprietor is a Role (sortal). Proprietorship is a Relator. NameChangeEvent is a reified PROV-O Activity. External superclasses shown.

    class orgOrganization["org_Organization (external)"]
    class provActivity["prov_Activity (external)"]
    class RoleMixin["opda_RoleMixin"]
    class Role["opda_Role"]
    class Relator["opda_Relator"]

    class Person["opda_Person"] {
        owl_Class
        UFO Substance Kind
        DOLCE Endurant Agent
    }
    class Organisation["opda_Organisation"] {
        owl_Class
        UFO Substance Kind
    }
    class Seller["opda_Seller"] {
        owl_Class
        UFO RoleMixin
    }
    class Buyer["opda_Buyer"] {
        owl_Class
        UFO RoleMixin
    }
    class Proprietor["opda_Proprietor"] {
        owl_Class
        UFO Role
    }
    class Proprietorship["opda_Proprietorship"] {
        owl_Class
        UFO Relator
    }
    class NameChangeEvent["opda_NameChangeEvent"] {
        owl_Class
        UFO Event particular
    }

    orgOrganization <|-- Organisation : rdfs_subClassOf
    RoleMixin <|-- Seller : rdfs_subClassOf
    RoleMixin <|-- Buyer : rdfs_subClassOf
    Role <|-- Proprietor : rdfs_subClassOf
    Relator <|-- Proprietorship : rdfs_subClassOf
    provActivity <|-- NameChangeEvent : rdfs_subClassOf
```

</details>

## Module shape-target graph

![agent-shapes-and-their-target-classes](diagrams/README/agent-shapes-and-their-target-classes.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
---
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E8F5E9", "primaryTextColor": "#1B5E20", "primaryBorderColor": "#2E7D32", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: Agent shapes and their target classes
    accDescr: Two identity-key shapes plus one Cat-4 PII shape plus two SHACL-AF rules; all five target opda:Person or opda:Organisation.

    %% @prefix opda: <https://opda.org.uk/pdtf/>
    %% @prefix sh: <http://www.w3.org/ns/shacl#>

    classDef shape fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,stroke-dasharray:5 5,color:#1B5E20
    classDef cls fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef rule fill:#E1F5FE,stroke:#0277BD,stroke-width:2px,color:#01579B
    classDef violation fill:#FFCDD2,stroke:#C62828,stroke-width:2px,stroke-dasharray:5 5,color:#B71C1C

    S1[opda:OrganisationIdentityKeyShape]:::shape
    S2[opda:PersonIdentityKeyShape]:::shape
    S3[opda:SpecialCategoryPIIWithoutLawfulBasisShape]:::violation
    R1[opda:IdentifierSuccessionRule]:::rule
    R2[opda:CapacityAuthorityMatchRule]:::rule

    C1[opda:Person]:::cls
    C2[opda:Organisation]:::cls

    S1 -->|sh:targetClass| C2
    S2 -->|sh:targetClass| C1
    S3 -->|sh:targetClass via sh:sparql| C1
    R1 -->|sh:targetClass| C1
    R2 -->|sh:targetClass| C1
```

</details>

## Module DPV co-annotation graph

![agent-module--dpv-personal-data-co-annotations](diagrams/README/agent-module--dpv-personal-data-co-annotations.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
---
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E0F2F1", "primaryTextColor": "#004D40", "primaryBorderColor": "#00695C", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: Agent module — DPV personal-data co-annotations
    accDescr: Person carries dpv-pd:Name baseline. Organisation carries no class-level baseline per ODR-0006 Q6 plus ODR-0018 Rule 4. Two variant refinements scope lawful basis for dateOfBirth and email predicates.

    %% @prefix opda: <https://opda.org.uk/pdtf/>
    %% @prefix dpv-pd: <https://w3id.org/dpv/pd#>

    classDef pii fill:#E0F2F1,stroke:#00695C,stroke-width:2px,color:#004D40
    classDef dpv fill:#F8BBD9,stroke:#AD1457,stroke-width:2px,color:#880E4F
    classDef refinement fill:#FFE0B2,stroke:#E65100,stroke-width:2px,color:#BF360C
    classDef note fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#263238

    P[opda:Person]:::pii
    O["opda:Organisation<br/>no class-level baseline"]:::note

    Name[dpv-pd:Name]:::dpv
    DOB[dpv-pd:DateOfBirth]:::dpv
    Email[dpv-pd:EmailAddress]:::dpv

    P -->|dpv-pd:hasPersonalDataCategory| Name

    R1[PersonDateOfBirthRefinement]:::refinement
    R2[PersonEmailRefinement]:::refinement

    R1 -->|opda:targetsKind| P
    R1 -->|opda:lawfulBasis| DOB
    R2 -->|opda:targetsKind| P
    R2 -->|opda:lawfulBasis| Email
```

</details>

## SHACL shapes (5 + 2 rules)

| Shape | Severity | Category |
|---|---|---|
| `opda:OrganisationIdentityKeyShape` | Violation | Cat 1 |
| `opda:PersonIdentityKeyShape` | Violation | Cat 1 |
| `opda:SpecialCategoryPIIWithoutLawfulBasisShape` | Violation | Cat 4 |
| `opda:CapacityAuthorityMatchRule` | Info | SHACL-AF |
| `opda:IdentifierSuccessionRule` | Info | SHACL-AF |

See [`shapes.md`](./shapes.md) for per-shape blocks.

## DPV annotations

Class-level + 2 variant refinements. See [`annotations.md`](./annotations.md).

## Source ODR + ADR

- [ODR-0006 — Agents and roles](../../../ontology/odr/ODR-0006-agents-and-roles.md)
- [ODR-0012 — SHACL + DPV annotation emission](../../../ontology/odr/ODR-0012-shacl-and-dpv-annotation-emission.md) (Cat 4)
- [ODR-0017 — SHACL-AF quality rules pattern](../../../ontology/odr/ODR-0017-shacl-af-quality-rules-pattern.md)
- [ADR-0011 — Module TBox emission](../../../adr/ADR-0011-module-tbox-emission.md)
- [ADR-0012 — SHACL + DPV annotation emission](../../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)
