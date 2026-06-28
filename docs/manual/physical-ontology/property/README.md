---
status: proposed
date: 2026-05-28
tags: [physical-ontology, property, module]
---

# Property module

The Property module emits 7 OWL classes covering the physical-property identity crux (Property, LegalEstate, RegisteredTitle, Address), the two reified PROV-O succession activities (UPRNSuccessionEvent, LeaseExtensionEvent), and the OWL-Time LeaseTerm interval.

## Files

| File | Role | Source |
|---|---|---|
| `opda-property.ttl` | 7 OWL classes + 24 DatatypeProperties + 3 ObjectProperties | [opda-property.ttl](../../../../source/03-standards/ontology/opda-property.ttl) |
| `opda-property-shapes.ttl` | 4 identity-key shapes + 1 IC-breach shape + 2 SHACL-AF rules | [opda-property-shapes.ttl](../../../../source/03-standards/ontology/opda-property-shapes.ttl) |
| `opda-property-annotations.ttl` | 3 DPV class-level co-annotations + 3 variant refinements | [opda-property-annotations.ttl](../../../../source/03-standards/ontology/opda-property-annotations.ttl) |

## Ontology header

```turtle
<https://opda.org.uk/pdtf/graph/property>
    rdf:type owl:Ontology ;
    dct:title "OPDA Property Module"@en ;
    owl:imports <https://opda.org.uk/pdtf/harness/release/1.0.0/>, <https://opda.org.uk/pdtf/scheme/> ;
    owl:versionIRI <https://opda.org.uk/pdtf/harness/release/property/1.0.0/> .
```

## Import chain

- `<https://opda.org.uk/pdtf/harness/release/1.0.0/>` — foundation TBox (Relator / Role / RoleMixin / ValidationContext / DiagnosticExemplar / GeneratorRun)
- `<https://opda.org.uk/pdtf/scheme/>` — 23 SKOS schemes (BuiltForm, OwnershipType, TenureKind, AddressVariant, etc.)

External vocabularies referenced (not imported):
- `vcard:Address` — `opda:Address rdfs:subClassOf vcard:Address`
- `time:ProperInterval` — `opda:LeaseTerm rdfs:subClassOf time:ProperInterval`
- `prov:Activity` — superclass of `opda:LeaseExtensionEvent` + `opda:UPRNSuccessionEvent`

## Module class hierarchy

![property-module--class-hierarchy](diagrams/README/property-module--class-hierarchy.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E1BEE7", "primaryTextColor": "#4A148C", "primaryBorderColor": "#6A1B9A", "lineColor": "#37474F"}}}%%
classDiagram
    accTitle: Property module — class hierarchy
    accDescr: Seven OWL classes covering physical property, legal estate, registered title, address, the two reified PROV-O succession events, and the OWL-Time LeaseTerm. External superclasses shown for vcard:Address, time:ProperInterval, prov:Activity.

    class vcardAddress["vcard_Address (external)"]
    class timeProperInterval["time_ProperInterval (external)"]
    class provActivity["prov_Activity (external)"]

    class Property["opda_Property"] {
        owl_Class
        UFO Substance Kind
        DOLCE Endurant or PhysicalObject
    }
    class LegalEstate["opda_LegalEstate"] {
        owl_Class
        UFO Substance Kind
        DOLCE NonPhysicalEndurant
    }
    class RegisteredTitle["opda_RegisteredTitle"] {
        owl_Class
        UFO Substance Kind informational
    }
    class Address["opda_Address"] {
        owl_Class
        UFO Substance Kind
    }
    class LeaseTerm["opda_LeaseTerm"] {
        owl_Class
        Information Particular
    }
    class UPRNSuccessionEvent["opda_UPRNSuccessionEvent"] {
        owl_Class
        UFO Event particular
    }
    class LeaseExtensionEvent["opda_LeaseExtensionEvent"] {
        owl_Class
        UFO Event particular
    }

    vcardAddress <|-- Address : rdfs_subClassOf
    timeProperInterval <|-- LeaseTerm : rdfs_subClassOf
    provActivity <|-- UPRNSuccessionEvent : rdfs_subClassOf
    provActivity <|-- LeaseExtensionEvent : rdfs_subClassOf
```

</details>

## Module shape-target graph

![property-shapes-and-their-target-classes](diagrams/README/property-shapes-and-their-target-classes.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
---
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E8F5E9", "primaryTextColor": "#1B5E20", "primaryBorderColor": "#2E7D32", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: Property shapes and their target classes
    accDescr: Each SHACL shape in opda-property-shapes.ttl points to the Kind it targets via sh:targetClass. Identity-key shapes use Cat 1 severity; the IC-breach shape is Cat 2; the two SHACL-AF rules emit derived predicates at Info severity.

    %% @prefix opda: <https://opda.org.uk/pdtf/>
    %% @prefix sh: <http://www.w3.org/ns/shacl#>

    classDef shape fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,stroke-dasharray:5 5,color:#1B5E20
    classDef cls fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef rule fill:#E1F5FE,stroke:#0277BD,stroke-width:2px,color:#01579B

    S1[opda:AddressIdentityKeyShape]:::shape
    S2[opda:LegalEstateIdentityKeyShape]:::shape
    S3[opda:PropertyIdentityKeyShape]:::shape
    S4[opda:PropertyICBreachShape]:::shape
    R1[opda:UPRNSuccessionRule]:::rule
    R2[opda:INSPIRESuccessionRule]:::rule

    C1[opda:Address]:::cls
    C2[opda:LegalEstate]:::cls
    C3[opda:Property]:::cls

    S1 -->|sh:targetClass| C1
    S2 -->|sh:targetClass| C2
    S3 -->|sh:targetClass| C3
    S4 -->|sh:targetClass| C3
    R1 -->|sh:targetClass| C3
    R2 -->|sh:targetClass| C1
```

</details>

## Module DPV co-annotation graph

![property-module--dpv-personal-data-co-annotations](diagrams/README/property-module--dpv-personal-data-co-annotations.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
---
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#E0F2F1", "primaryTextColor": "#004D40", "primaryBorderColor": "#00695C", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: Property module — DPV personal-data co-annotations
    accDescr: PII-bearing classes in the Property module and their dpv-pd:hasPersonalDataCategory baselines, plus the three Address variant refinements that scope lawful basis to title / marketing / inspire variants.

    %% @prefix opda: <https://opda.org.uk/pdtf/>
    %% @prefix dpv-pd: <https://w3id.org/dpv/pd#>
    %% @prefix dpv: <https://w3id.org/dpv#>

    classDef pii fill:#E0F2F1,stroke:#00695C,stroke-width:2px,color:#004D40
    classDef dpv fill:#F8BBD9,stroke:#AD1457,stroke-width:2px,color:#880E4F
    classDef refinement fill:#FFE0B2,stroke:#E65100,stroke-width:2px,color:#BF360C

    A[opda:Address]:::pii
    P[opda:Property]:::pii
    T[opda:RegisteredTitle]:::pii

    PA[dpv-pd:PostalAddress]:::dpv
    PD[dpv-pd:PublicData]:::dpv

    A -->|dpv-pd:hasPersonalDataCategory| PA
    P -->|dpv-pd:hasPersonalDataCategory| PA
    T -->|dpv-pd:hasPersonalDataCategory| PD

    R1[AddressVariantTitleRefinement<br/>opda:lawfulBasis dpv:PublicTask]:::refinement
    R2[AddressVariantMarketingRefinement<br/>opda:lawfulBasis dpv:Consent]:::refinement
    R3[AddressVariantInspireRefinement<br/>opda:lawfulBasis dpv:PublicTask]:::refinement

    R1 -->|opda:targetsKind| A
    R2 -->|opda:targetsKind| A
    R3 -->|opda:targetsKind| A
```

</details>

## Classes (7)

- `opda:Address` — Substance Kind (Royal Mail / OS AddressBase / HMLR / INSPIRE locator); subclass of `vcard:Address`
- `opda:LeaseExtensionEvent` — Event particular (reified PROV-O Activity for statutory lease extension)
- `opda:LeaseTerm` — Information particular (OWL-Time ProperInterval)
- `opda:LegalEstate` — Substance Kind (legal rights-bundle vested in a Property)
- `opda:Property` — Substance Kind (physical property; spatial-material continuity IC)
- `opda:RegisteredTitle` — Substance Kind, informational (HMLR title-register record)
- `opda:UPRNSuccessionEvent` — Event particular (reified PROV-O Activity for UPRN re-numbering)

See [`classes.md`](./classes.md) for per-class blocks.

## SHACL shapes (6 + 2 rules)

| Shape | Severity | Category |
|---|---|---|
| `opda:AddressIdentityKeyShape` | Violation | Cat 1 |
| `opda:LegalEstateIdentityKeyShape` | Violation | Cat 1 |
| `opda:PropertyIdentityKeyShape` | Violation | Cat 1 |
| `opda:PropertyICBreachShape` | Violation | Cat 2 |
| `opda:UPRNSuccessionRule` | Info | SHACL-AF |
| `opda:INSPIRESuccessionRule` | Info | SHACL-AF |

See [`shapes.md`](./shapes.md) for per-shape blocks.

## DPV annotations

3 class-level annotations + 3 variant refinements. See [`annotations.md`](./annotations.md).

## Source ODR + ADR

- [ODR-0005 — Property and land identity crux](/modelling/odr/odr-0005)
- [ODR-0015 — Address and geography](/modelling/odr/odr-0015)
- [ODR-0007 §Q5 — Lease term as interval](/modelling/odr/odr-0007)
- [ODR-0008 §Q5a — BASPI5 attribute discipline](/modelling/odr/odr-0008)
- [ADR-0011 — Module TBox emission](/modelling/adr/adr-0011)
- [ADR-0012 — SHACL + DPV annotation emission](/modelling/adr/adr-0012)
