# Per-named-graph layout

One section per named graph the deployment exposes. Triple counts measured by `rdflib.Graph().parse(<file>)` against the committed TTLs at HEAD. Load order resolves `owl:imports` chains; graphs without `owl:Ontology` declarations (`opda-classes.ttl`, `opda-vocabularies.ttl`) participate in the default-graph union and have no `owl:imports` of their own.

## Load order summary

```mermaid
flowchart LR
    F[foundation.ttl<br/>https://w3id.org/opda/<br/>versionIRI 1.0.0/]
    V[opda-vocabularies.ttl<br/>https://w3id.org/opda/vocabularies/<br/>uses dct:references for DPV]
    C[opda-classes.ttl<br/>no ontology IRI<br/>class declarations]
    SH[opda-shapes.ttl<br/>https://w3id.org/opda/shapes<br/>foundation meta-shapes]
    AN[opda-annotations.ttl<br/>https://w3id.org/opda/annotations<br/>meta-annotations]
    P[opda-property/ + 5 other modules]
    PS[opda-property-shapes/ + 5 others]
    PA[opda-property-annotations/ + 5 others]
    B[profiles/baspi5.ttl<br/>https://w3id.org/opda/profiles/baspi5]
    F --> P
    V --> P
    P --> PS
    P --> PA
    F --> B
    V --> B
```

## Foundation graphs

### https://w3id.org/opda/

#### Source TTL(s)

- [`foundation.ttl`](../../../source/03-standards/ontology/foundation.ttl) ([Physical-Ontology tier →](../physical-ontology/foundation/))

#### Purpose

Default-graph entry point. Carries the `owl:Ontology` declaration for the OPDA namespace, the foundation metadata (creator, license, issued, modified, version), the `vann:preferredNamespacePrefix`, and the global `sh:declare` for the `opda:` prefix. This is the graph a consumer loads first.

#### Load order

- No `owl:imports`. Loaded first.

#### Triple count

15 triples (HEAD; bytes 1 851; sha256 `6e328d3acd24…`).

#### Version IRI

`https://w3id.org/opda/1.0.0/`. Bumped on every module-TBox or vocabulary release per [ADR-0013](../../adr/ADR-0013-overlay-profile-emission.md). Last bump: 1.0.0 (foundation + SKOS vocabularies + UFO meta-classes + module shapes + DPV annotations + overlay profiles + ValidationContext + hasSpecialCategoryData — ADR-0009..ADR-0014).

### (no ontology IRI — class graph)

#### Source TTL(s)

- [`opda-classes.ttl`](../../../source/03-standards/ontology/opda-classes.ttl) ([Physical-Ontology tier →](../physical-ontology/foundation/))

#### Purpose

The class graph carries the six foundation `owl:Class` declarations (DiagnosticExemplar, GeneratorRun, RoleMixin, Role, Relator, ValidationContext) plus the single ADR-0014 G14 `opda:hasSpecialCategoryData` `owl:DatatypeProperty`. Three-graph separation per [ODR-0004 §3a](../../ontology/odr/ODR-0004-pdtf-ontology-foundation.md) requires this file MUST NOT contain `sh:NodeShape` triples; those live in the matching `-shapes.ttl`.

#### Load order

- No `owl:imports`. Merges into the default-graph union alongside `foundation.ttl`.

#### Triple count

36 triples (HEAD; bytes 6 756; sha256 `7494bad0c6c9…`).

#### Version IRI

None at file level — class graph rides on the foundation `owl:versionIRI`.

### https://w3id.org/opda/shapes

#### Source TTL(s)

- [`opda-shapes.ttl`](../../../source/03-standards/ontology/opda-shapes.ttl) ([Physical-Ontology tier →](../physical-ontology/foundation/))

#### Purpose

Foundation SHACL meta-shapes (Cat 3 NoIdentityOverride, Cat 5 MetaShapeOverShapeGraph, three-rule interface contract: ShInSemantics + ShViolationFloor) plus two cross-cutting SHACL-AF rules (PIIWithoutDPVCoAnnotationRule per [ODR-0012](../../ontology/odr/) §Q5; DeprecationChainRule per ODR-0011 §5a). MUST NOT contain `owl:Class` or `owl:imports` triples per three-graph separation.

#### Load order

- No `owl:imports`. Loaded after foundation + class graphs for SHACL validation.

#### Triple count

51 triples (HEAD; bytes 7 493; sha256 `52f8442ba3ab…`).

#### Version IRI

None at file level.

### https://w3id.org/opda/annotations

#### Source TTL(s)

- [`opda-annotations.ttl`](../../../source/03-standards/ontology/opda-annotations.ttl) ([Physical-Ontology tier →](../physical-ontology/foundation/))

#### Purpose

Foundation meta-annotation graph (DPV co-annotation scaffolding). Minimal at MVP; per-module annotation graphs do the substantive work.

#### Load order

- No `owl:imports`.

#### Triple count

3 triples (HEAD; bytes 1 224; sha256 `cd0282bbfea1…`).

#### Version IRI

None at file level.

## Vocabulary graph

### (no ontology IRI — SKOS scheme aggregate)

#### Source TTL(s)

- [`opda-vocabularies.ttl`](../../../source/03-standards/ontology/opda-vocabularies.ttl) ([Physical-Ontology tier →](../physical-ontology/vocabularies/))

#### Purpose

The 23 SKOS Concept Schemes per [ODR-0011 §1a + §8a](../../ontology/odr/) seven-category UFO framework: AddressVariantScheme, AssuranceLevelScheme, and 21 others. References DPV via `dct:references` (reference-not-import per [ADR-0010](../../adr/ADR-0010-skos-vocabulary-emission.md)). The lifecycle SHACL-AF rule body for deprecated concepts lives in `opda-shapes.ttl`.

#### Load order

- No `owl:imports`. Pure SKOS-scheme aggregate. Loaded by every module TBox via the canonical `https://w3id.org/opda/vocabularies/` import.

#### Triple count

873 triples (HEAD; bytes 62 450; sha256 `bff1c21289dd…`).

#### Version IRI

None at file level; module imports cite `https://w3id.org/opda/vocabularies/` as the canonical import target (the redirect serves this file).

## Module-TBox graphs

Each module-TBox graph imports the foundation + vocabularies via canonical URLs. The composer rewrites these to local file paths during build; at deploy time the W3C PICG redirect resolves them.

### https://w3id.org/opda/property/

#### Source TTL(s)

- [`opda-property.ttl`](../../../source/03-standards/ontology/opda-property.ttl) ([Physical-Ontology tier →](../physical-ontology/property/))

#### Purpose

Property module TBox: physical Property, LegalEstate, RegisteredTitle, Address + variant-specific subclasses, Lease-Term, UPRNSuccessionEvent, LeaseExtensionEvent. The Identity-Criterion crux of OPDA.

#### Load order

- `owl:imports <https://w3id.org/opda/1.0.0/>` — foundation.
- `owl:imports <https://w3id.org/opda/vocabularies/>` — SKOS schemes.

#### Triple count

199 triples (HEAD; bytes 18 845; sha256 `5bb1f05454d5…`).

#### Version IRI

`https://w3id.org/opda/property/1.0.0/`.

### https://w3id.org/opda/agent/

#### Source TTL(s)

- [`opda-agent.ttl`](../../../source/03-standards/ontology/opda-agent.ttl) ([Physical-Ontology tier →](../physical-ontology/agent/))

#### Purpose

Agent module TBox: Person, Organisation, Proprietor + Proprietorship Relator, Seller / Buyer roles, NameChangeEvent.

#### Load order

- `owl:imports <https://w3id.org/opda/1.0.0/>`.
- `owl:imports <https://w3id.org/opda/vocabularies/>`.

#### Triple count

77 triples (HEAD; bytes 9 203; sha256 `e2e0841bbf80…`).

#### Version IRI

`https://w3id.org/opda/agent/1.0.0/`.

### https://w3id.org/opda/transaction/

#### Source TTL(s)

- [`opda-transaction.ttl`](../../../source/03-standards/ontology/opda-transaction.ttl) ([Physical-Ontology tier →](../physical-ontology/transaction/))

#### Purpose

Transaction module TBox: Transaction Relator, Milestone, TransactionChain.

#### Load order

- `owl:imports <https://w3id.org/opda/1.0.0/>`.
- `owl:imports <https://w3id.org/opda/vocabularies/>`.

#### Triple count

39 triples (HEAD; bytes 5 391; sha256 `fb85b3b680af…`).

#### Version IRI

`https://w3id.org/opda/transaction/1.0.0/`.

### https://w3id.org/opda/claim/

#### Source TTL(s)

- [`opda-claim.ttl`](../../../source/03-standards/ontology/opda-claim.ttl) ([Physical-Ontology tier →](../physical-ontology/claim/))

#### Purpose

Claim module TBox: Claim, three Evidence subtypes (Document, ElectronicRecord, Vouch), VerificationActivity, AssuranceLevel, TrustFramework.

#### Load order

- `owl:imports <https://w3id.org/opda/1.0.0/>`.
- `owl:imports <https://w3id.org/opda/vocabularies/>`.

#### Triple count

86 triples (HEAD; bytes 9 534; sha256 `93c577b0545e…`).

#### Version IRI

`https://w3id.org/opda/claim/1.0.0/`.

### https://w3id.org/opda/governance/

#### Source TTL(s)

- [`opda-governance.ttl`](../../../source/03-standards/ontology/opda-governance.ttl) ([Physical-Ontology tier →](../physical-ontology/governance/))

#### Purpose

Governance module TBox: DPV mapping records that link OPDA kinds to GDPR personal-data categories.

#### Load order

- `owl:imports <https://w3id.org/opda/1.0.0/>`.
- `owl:imports <https://w3id.org/opda/vocabularies/>`.

#### Triple count

42 triples (HEAD; bytes 4 424; sha256 `f1fae7ca0722…`).

#### Version IRI

`https://w3id.org/opda/governance/1.0.0/`.

### https://w3id.org/opda/descriptive/

#### Source TTL(s)

- [`opda-descriptive.ttl`](../../../source/03-standards/ontology/opda-descriptive.ttl) ([Physical-Ontology tier →](../physical-ontology/descriptive/))

#### Purpose

Descriptive module TBox: EPCCertificate, Search, Survey, Valuation, Comparable.

#### Load order

- `owl:imports <https://w3id.org/opda/1.0.0/>`.
- `owl:imports <https://w3id.org/opda/vocabularies/>`.

#### Triple count

35 triples (HEAD; bytes 4 457; sha256 `1c236b44a11d…`).

#### Version IRI

`https://w3id.org/opda/descriptive/1.0.0/`.

## Module-shape graphs

Each per-module shape graph carries Cat 1/2 identity + IC-breach shapes plus SHACL-AF non-blocking quality rules. None declare `owl:imports`; consumers load them alongside the matching TBox graph.

### https://w3id.org/opda/property-shapes/

#### Source TTL(s)

- [`opda-property-shapes.ttl`](../../../source/03-standards/ontology/opda-property-shapes.ttl) ([Physical-Ontology tier →](../physical-ontology/property/))

#### Purpose

Property identity-key shapes (e.g. UPRN-keyed identity), IC-breach (anti-pattern) shapes, SHACL-AF rules for property-level quality.

#### Load order

- No `owl:imports`. Loaded alongside `opda-property.ttl`.

#### Triple count

54 triples (HEAD; bytes 5 442; sha256 `60033df2aad7…`).

#### Version IRI

None at file level.

### https://w3id.org/opda/agent-shapes/

#### Source TTL(s)

- [`opda-agent-shapes.ttl`](../../../source/03-standards/ontology/opda-agent-shapes.ttl) ([Physical-Ontology tier →](../physical-ontology/agent/))

#### Purpose

Agent identity-key + IC-breach shapes.

#### Load order

- No `owl:imports`. Loaded alongside `opda-agent.ttl`.

#### Triple count

44 triples (HEAD; bytes 4 992; sha256 `03b3ef71747c…`).

#### Version IRI

None at file level.

### https://w3id.org/opda/transaction-shapes/

#### Source TTL(s)

- [`opda-transaction-shapes.ttl`](../../../source/03-standards/ontology/opda-transaction-shapes.ttl) ([Physical-Ontology tier →](../physical-ontology/transaction/))

#### Purpose

Transaction Relator and Milestone identity + IC-breach shapes; SHACL-AF rules for chain-overlap detection.

#### Load order

- No `owl:imports`. Loaded alongside `opda-transaction.ttl`.

#### Triple count

37 triples (HEAD; bytes 4 502; sha256 `92bdbecb9352…`).

#### Version IRI

None at file level.

### https://w3id.org/opda/claim-shapes/

#### Source TTL(s)

- [`opda-claim-shapes.ttl`](../../../source/03-standards/ontology/opda-claim-shapes.ttl) ([Physical-Ontology tier →](../physical-ontology/claim/))

#### Purpose

Claim, Evidence, VerificationActivity identity + IC-breach shapes.

#### Load order

- No `owl:imports`. Loaded alongside `opda-claim.ttl`.

#### Triple count

45 triples (HEAD; bytes 4 562; sha256 `87e46fd432a0…`).

#### Version IRI

None at file level.

### https://w3id.org/opda/governance-shapes/

#### Source TTL(s)

- [`opda-governance-shapes.ttl`](../../../source/03-standards/ontology/opda-governance-shapes.ttl) ([Physical-Ontology tier →](../physical-ontology/governance/))

#### Purpose

DPV mapping-record shapes.

#### Load order

- No `owl:imports`. Loaded alongside `opda-governance.ttl`.

#### Triple count

13 triples (HEAD; bytes 1 639; sha256 `2f3bd8a4b244…`).

#### Version IRI

None at file level.

### https://w3id.org/opda/descriptive-shapes/

#### Source TTL(s)

- [`opda-descriptive-shapes.ttl`](../../../source/03-standards/ontology/opda-descriptive-shapes.ttl) ([Physical-Ontology tier →](../physical-ontology/descriptive/))

#### Purpose

EPC / Search / Survey / Valuation / Comparable identity + IC-breach shapes.

#### Load order

- No `owl:imports`. Loaded alongside `opda-descriptive.ttl`.

#### Triple count

27 triples (HEAD; bytes 3 822; sha256 `4b8d458b7d49…`).

#### Version IRI

None at file level.

## Module-annotation graphs

Each per-module annotation graph carries DPV class-level baselines + variant-conditional refinement maps per [ODR-0018](../../ontology/odr/). Reference-not-import for DPV: DPV terms cited via `dct:references` and URIRef triples; no `owl:imports <https://w3id.org/dpv/pd>` per [ADR-0012](../../adr/ADR-0012-shacl-and-dpv-annotation-emission.md).

### https://w3id.org/opda/property-annotations/

#### Source TTL(s)

- [`opda-property-annotations.ttl`](../../../source/03-standards/ontology/opda-property-annotations.ttl) ([Physical-Ontology tier →](../physical-ontology/property/))

#### Purpose

DPV annotations for Property module: baseline categories per class + per-variant refinements.

#### Load order

- No `owl:imports`. Loaded alongside `opda-property.ttl` for UI / DPV consumers.

#### Triple count

31 triples (HEAD; bytes 2 837; sha256 `a6cfbd2e353c…`).

#### Version IRI

None at file level.

### https://w3id.org/opda/agent-annotations/

#### Source TTL(s)

- [`opda-agent-annotations.ttl`](../../../source/03-standards/ontology/opda-agent-annotations.ttl) ([Physical-Ontology tier →](../physical-ontology/agent/))

#### Purpose

DPV annotations for Agent module (Person PII baseline, etc.).

#### Load order

- No `owl:imports`. Loaded alongside `opda-agent.ttl`.

#### Triple count

22 triples (HEAD; bytes 2 551; sha256 `eecead55b8bc…`).

#### Version IRI

None at file level.

### https://w3id.org/opda/transaction-annotations/

#### Source TTL(s)

- [`opda-transaction-annotations.ttl`](../../../source/03-standards/ontology/opda-transaction-annotations.ttl) ([Physical-Ontology tier →](../physical-ontology/transaction/))

#### Purpose

DPV annotations for Transaction module.

#### Load order

- No `owl:imports`. Loaded alongside `opda-transaction.ttl`.

#### Triple count

6 triples (HEAD; bytes 1 617; sha256 `49007a05cd6a…`).

#### Version IRI

None at file level.

### https://w3id.org/opda/claim-annotations/

#### Source TTL(s)

- [`opda-claim-annotations.ttl`](../../../source/03-standards/ontology/opda-claim-annotations.ttl) ([Physical-Ontology tier →](../physical-ontology/claim/))

#### Purpose

DPV annotations for Claim module.

#### Load order

- No `owl:imports`. Loaded alongside `opda-claim.ttl`.

#### Triple count

27 triples (HEAD; bytes 2 558; sha256 `9903c726fd3e…`).

#### Version IRI

None at file level.

### https://w3id.org/opda/governance-annotations/

#### Source TTL(s)

- [`opda-governance-annotations.ttl`](../../../source/03-standards/ontology/opda-governance-annotations.ttl) ([Physical-Ontology tier →](../physical-ontology/governance/))

#### Purpose

DPV annotations for Governance module.

#### Load order

- No `owl:imports`. Loaded alongside `opda-governance.ttl`.

#### Triple count

6 triples (HEAD; bytes 1 706; sha256 `02bb7b14a288…`).

#### Version IRI

None at file level.

### https://w3id.org/opda/descriptive-annotations/

#### Source TTL(s)

- [`opda-descriptive-annotations.ttl`](../../../source/03-standards/ontology/opda-descriptive-annotations.ttl) ([Physical-Ontology tier →](../physical-ontology/descriptive/))

#### Purpose

DPV annotations for Descriptive module.

#### Load order

- No `owl:imports`. Loaded alongside `opda-descriptive.ttl`.

#### Triple count

14 triples (HEAD; bytes 2 938; sha256 `d36e42030ad4…`).

#### Version IRI

None at file level.

## Overlay-profile graph

### https://w3id.org/opda/profiles/baspi5

#### Source TTL(s)

- [`profiles/baspi5.ttl`](../../../source/03-standards/ontology/profiles/baspi5.ttl) ([Physical-Ontology tier →](../physical-ontology/profiles/baspi5.md))

#### Purpose

BASPI5 (British Association of Surveyors Property Information, version 5) overlay profile. Per-form cardinality, enum subsets, DASH UI rendering. Composes over the foundation + module TBox + base shapes per [ODR-0010](../../ontology/odr/). MVP gate per [ADR-0014](../../adr/ADR-0014-baspi5-round-trip-mvp-harness.md).

#### Load order

- `owl:imports <https://w3id.org/opda/1.0.0/>`.
- `owl:imports <https://w3id.org/opda/vocabularies/>`.
- Implicit: every per-module shape graph (consumers loading this profile typically merge with all 6 module-shape graphs for full validation).

#### Triple count

488 triples (HEAD; bytes 23 520; sha256 `c647c45e00ca…`).

#### Version IRI

`https://w3id.org/opda/profiles/baspi5/0.1.0/`. Form version 5.0.3 (per `opda:Baspi5ValidationContext`).
