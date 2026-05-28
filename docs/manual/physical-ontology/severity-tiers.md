---
status: proposed
date: 2026-05-28
tags: [physical-ontology, severity-tiers, shacl, governance]
---

# Severity tiers

Per [ODR-0013 §Q1](../../ontology/odr/ODR-0013-shacl-validation-and-severity.md), every emitted SHACL shape carries an explicit `sh:severity`. The framework has four tiers; `sh:Violation` is further partitioned into 5 named subcategories.

## Severity-tier landscape

![severity-tier-framework--4-tiers-5-violation-subcategories-and-every-emitted-shape-grouped-as-a-leaf](diagrams/severity-tiers/severity-tier-framework--4-tiers-5-violation-subcategories-and-every-emitted-shape-grouped-as-a-leaf.png)

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
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#FFCDD2", "primaryTextColor": "#B71C1C", "primaryBorderColor": "#C62828", "lineColor": "#37474F"}}}%%
flowchart LR
    accTitle: Severity tier framework — 4 tiers, 5 Violation subcategories, and every emitted shape grouped as a leaf
    accDescr: Shows the four sh:severity tiers (Violation, Warning, Info, Pass) with the five Violation subcategories per ODR-0013 Q1, and each emitted SHACL shape attached to its category.

    %% @prefix opda: <https://w3id.org/opda/#>
    %% @prefix sh: <http://www.w3.org/ns/shacl#>

    classDef violation fill:#FFCDD2,stroke:#C62828,stroke-width:2px,color:#B71C1C
    classDef warning fill:#FFF9C4,stroke:#F9A825,stroke-width:2px,color:#F57F17
    classDef info fill:#BBDEFB,stroke:#1565C0,stroke-width:2px,color:#0D47A1
    classDef pass fill:#C8E6C9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    classDef shape fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C

    Root[sh:severity tiers]
    V[sh:Violation<br/>blocking]:::violation
    W[sh:Warning<br/>non-blocking elevated]:::warning
    I[sh:Info<br/>informative only]:::info
    P["(Pass)<br/>no triple emitted"]:::pass

    Root --> V
    Root --> W
    Root --> I
    Root --> P

    C1[Cat 1 — Identity-key]:::violation
    C2[Cat 2 — IC breach]:::violation
    C3[Cat 3 — No-identity-override]:::violation
    C4[Cat 4 — Special-category PII]:::violation
    C5[Cat 5 — Meta-shape drift]:::violation

    V --> C1
    V --> C2
    V --> C3
    V --> C4
    V --> C5

    C1 --> SC1["15 identity-key shapes<br/>Property / Address / LegalEstate<br/>Person / Organisation<br/>Milestone / Transaction<br/>Claim / Evidence<br/>Comparable / EPC / Search<br/>Survey / Valuation<br/>DPVMappingRecord"]:::shape
    C2 --> SC2["opda:PropertyICBreachShape<br/>opda:UnprovenancedClaimShape"]:::shape
    C3 --> SC3["opda:NoIdentityOverride_MetaShape"]:::shape
    C4 --> SC4["opda:SpecialCategoryPIIWithoutLawfulBasisShape"]:::shape
    C5 --> SC5["opda:MetaShapeOverShapeGraphMetaShape<br/>opda:ShInSemantics_MetaShape<br/>opda:ShViolationFloor_MetaShape"]:::shape

    W --> WC1["opda:PIIWithoutDPVCoAnnotationRule<br/>(ADR-0012 explicit override)"]:::shape

    I --> IC1["9 SHACL-AF rules<br/>UPRN / INSPIRE / Deprecation<br/>Identifier / Capacity<br/>LeaseTerm / Milestone<br/>PROVO-Claims / Verification"]:::shape

    P --> PC1["Conforming case<br/>(every other instance)"]:::shape
```

</details>

## 4-tier framework

| Tier | `sh:severity` IRI | Semantics | Typical use |
|---|---|---|---|
| Violation | `sh:Violation` | Blocking; instance is non-conformant | Identity-key violations, IC breaches, anti-pattern detection, special-category PII without lawful basis |
| Warning | `sh:Warning` | Non-blocking but elevated | PII-without-DPV-co-annotation, deprecation-without-successor |
| Info | `sh:Info` | Informative materialisation only | SHACL-AF succession rules (UPRN / INSPIRE / lease-term / verification chains) |
| (Pass) | — | Shape did not fire | The conforming case; no triple emitted in the report |

## 5 `sh:Violation` subcategories

Per ODR-0013 §Q1, every `sh:Violation` shape sits in exactly one of five named categories:

| Category | Pattern | Examples |
|---|---|---|
| **Cat 1 — Identity-key missing / wrong-type** | `sh:datatype` + `sh:maxCount 1` on the identity-key path | `PropertyIdentityKeyShape`, `AddressIdentityKeyShape`, `PersonIdentityKeyShape` |
| **Cat 2 — IC breach (anti-pattern detection)** | `sh:nodeKind` on co-reference predicates; `sh:minCount` on `prov:wasDerivedFrom` | `PropertyICBreachShape` (no `owl:sameAs`), `UnprovenancedClaimShape` |
| **Cat 3 — No-identity-override meta-shape** | SPARQL select detecting overlay-shape attempts to suppress identity property | `NoIdentityOverride_MetaShape` |
| **Cat 4 — Special-category PII without lawful basis** | SPARQL select for `hasSpecialCategoryData true` lacking `dpv:hasLegalBasis` | `SpecialCategoryPIIWithoutLawfulBasisShape` |
| **Cat 5 — Meta-shape-over-shape-graph drift** | SPARQL select for meta-shape on `sh:NodeShape` lacking `opda:metaShapeJustification` | `MetaShapeOverShapeGraphMetaShape`, `ShInSemantics_MetaShape`, `ShViolationFloor_MetaShape` |

## Shapes grouped by severity

### Cat 1 — Identity-key shapes (Violation)

| Shape | Module | Target |
|---|---|---|
| `opda:AddressIdentityKeyShape` | property | `opda:Address` |
| `opda:LegalEstateIdentityKeyShape` | property | `opda:LegalEstate` |
| `opda:PropertyIdentityKeyShape` | property | `opda:Property` |
| `opda:PersonIdentityKeyShape` | agent | `opda:Person` |
| `opda:OrganisationIdentityKeyShape` | agent | `opda:Organisation` |
| `opda:MilestoneIdentityKeyShape` | transaction | `opda:Milestone` |
| `opda:TransactionIdentityKeyShape` | transaction | `opda:Transaction` |
| `opda:ClaimIdentityKeyShape` | claim | `opda:Claim` |
| `opda:EvidenceIdentityKeyShape` | claim | `opda:Evidence` |
| `opda:ComparableIdentityKeyShape` | descriptive | `opda:Comparable` |
| `opda:EPCCertificateIdentityKeyShape` | descriptive | `opda:EPCCertificate` |
| `opda:SearchIdentityKeyShape` | descriptive | `opda:Search` |
| `opda:SurveyIdentityKeyShape` | descriptive | `opda:Survey` |
| `opda:ValuationIdentityKeyShape` | descriptive | `opda:Valuation` |
| `opda:DPVMappingRecordIdentityKeyShape` | governance | `opda:DPVMappingRecord` |

### Cat 2 — IC-breach shapes (Violation)

| Shape | Module | Target |
|---|---|---|
| `opda:PropertyICBreachShape` | property | `opda:Property` |
| `opda:UnprovenancedClaimShape` | claim | `opda:Claim` |

### Cat 3 — No-identity-override meta-shape (Violation)

| Shape | Target |
|---|---|
| `opda:NoIdentityOverride_MetaShape` | `sh:NodeShape` (SPARQL constraint) |

### Cat 4 — Special-category PII shape (Violation)

| Shape | Module | Target |
|---|---|---|
| `opda:SpecialCategoryPIIWithoutLawfulBasisShape` | agent | `opda:Person` (SPARQL constraint on `opda:hasSpecialCategoryData true`) |

### Cat 5 — Meta-shape-over-shape-graph (Violation)

| Shape | Justification |
|---|---|
| `opda:MetaShapeOverShapeGraphMetaShape` | "ODR-0013 §Q1 Category 5 + ODR-0017 §2a: meta-shapes targeting sh:NodeShape using sh:Violation severity must justify their elevation above the ODR-0017 sh:Info default." |
| `opda:ShInSemantics_MetaShape` | "ODR-0010 three-rule interface contract Rule 1: overlay sh:in MUST be a subset of base sh:in (which itself unions into the SKOS scheme members per ODR-0011)." |
| `opda:ShViolationFloor_MetaShape` | "ODR-0010 three-rule interface contract Rule 2: no overlay shape may set sh:severity to sh:Warning or sh:Info on a property where the base shape declared sh:Violation." |

### Warning-tier shapes

| Shape | Module | Why Warning vs Violation |
|---|---|---|
| `opda:PIIWithoutDPVCoAnnotationRule` | foundation (cross-cutting) | Silent PII leakage is high-impact even though the rule is SHACL-AF-pattern-shaped (ADR-0012 explicit override) |

### Info-tier shapes (all SHACL-AF rules)

| Shape | Module | Materialises |
|---|---|---|
| `opda:DeprecationChainRule` | foundation | `opda:hasDeprecationStatus`, `opda:hasSuccessor` |
| `opda:UPRNSuccessionRule` | property | `opda:hasUPRNSuccessionStatus` |
| `opda:INSPIRESuccessionRule` | property | `opda:hasINSPIRESuccessionStatus` |
| `opda:IdentifierSuccessionRule` | agent | `opda:hasIdentifierSuccessionEvent` |
| `opda:CapacityAuthorityMatchRule` | agent | `opda:hasCapacityAuthorityMatchStatus` |
| `opda:LeaseTermSuccessionRule` | transaction | `opda:hasLeaseTermSuccessionStatus` |
| `opda:MilestoneVarianceRule` | transaction | `opda:hasVarianceStatus`, `opda:hasVarianceDays` |
| `opda:PROVOClaimsRule` | claim | `opda:hasProvenanceChainStatus` |
| `opda:VerificationActivitySuccessionRule` | claim | `opda:hasVerificationSuccessionStatus` |

## BASPI5 overlay shapes (Violation)

The BASPI5 profile shapes inherit the Violation floor per the three-rule interface contract (overlay cannot weaken base severity). Every `Baspi5_*Shape` carries `sh:severity sh:Violation`. See [`profiles/baspi5.md`](./profiles/baspi5.md).

## Source ADR + ODR

- [ODR-0013 §Q1 — SHACL validation and severity (4-tier framework + 5 Violation categories)](../../ontology/odr/ODR-0013-shacl-validation-and-severity.md)
- [ODR-0017 — SHACL-AF quality rules pattern (`sh:Info` default)](../../ontology/odr/ODR-0017-shacl-af-quality-rules-pattern.md)
- [ADR-0012 — SHACL + DPV annotation emission](../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md)
