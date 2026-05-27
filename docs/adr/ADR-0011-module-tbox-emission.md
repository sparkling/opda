---
status: proposed
date: 2026-05-27
tags: [ontology, modules, tbox, emission, property, agent, transaction, claim, address, descriptive]
supersedes: []
depends-on: [ADR-0009, ADR-0010, ODR-0005, ODR-0006, ODR-0007, ODR-0008, ODR-0009, ODR-0015]
implements: [ADR-0008]
---

# Module TBox emission

## Context and Problem Statement

The ratified ODR corpus declares six `kind: pattern` module ODRs and supporting cross-cutting ODRs. This ADR ratifies the **engineering emission** of each module's TBox as a per-module `.ttl` file in `source/03-standards/ontology/`.

Per [ADR-0007 §"Module pluralism"](./ADR-0007-ontology-generator-specification.md), the generator emits **one TTL file per ratified module ODR** in addition to the foundation. Each module file:

- Declares only the classes + properties scoped to that module's ratified ODR.
- Imports `opda-classes.ttl` (foundation) + `opda-vocabularies.ttl` (SKOS substrate) via `owl:imports`.
- Carries `owl:versionIRI` pinned to the ratifying ODR's date + generator version.
- Pairs with `opda-<module>-shapes.ttl` + `opda-<module>-annotations.ttl` (three-graph separation preserved per module — ADR-0012 emits shapes + annotations).

Six modules in scope (covering all ratified `kind: pattern` ODRs that mint classes):

| Module file | Source ODR(s) | UFO Kinds emitted |
|---|---|---|
| `opda-property.ttl` | ODR-0005 + ODR-0015 + ODR-0008 | Property; LegalEstate; RegisteredTitle; Address; Building (held); Room (held) |
| `opda-agent.ttl` | ODR-0006 | Person; Organisation; Seller; Buyer; Proprietor; Proprietorship (Relator) |
| `opda-transaction.ttl` | ODR-0007 | Transaction (Relator); Milestone; TransactionChain; LeaseTerm |
| `opda-claim.ttl` | ODR-0009 | Claim; Evidence; VerificationActivity; AssuranceJudgement; TrustFramework |
| `opda-governance.ttl` | ODR-0012 + ODR-0018 | (mainly mapping tables; classes via reference-not-import to DPV) |
| `opda-descriptive.ttl` | ODR-0008 + S008 Q4 | Survey; EPCCertificate; Search; Valuation; Comparable; (Building/Room held) |

Plus the supporting pattern ODRs:

- ODR-0017 (SHACL-AF non-blocking quality rules) — pattern; no classes emit here; rules emit into shapes graph per ADR-0012.
- ODR-0018 (DPV class-level co-annotation) — pattern; mapping tables emit into `opda-governance.ttl`; co-annotations themselves emit into annotation graph per ADR-0012.

## Decision Drivers

* **A9 per-kind discipline** ([ODR-0001 §What an ODR records](../ontology/odr/ODR-0001-linked-data-council-methodology.md)) MUST output: UFO/DOLCE category + IC over named hard cases + artefact realisation, per emitted class. Per ADR-0007 §"A9 per-kind discipline output", the generator emits these as `dct:source` + `skos:scopeNote` + `rdfs:comment` triples on each minted class.
* **Three-graph separation per module** ([ODR-0004 §3a](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md)). Each module emits three files (classes / shapes / annotations); ADR-0012 emits the shapes + annotations sides. This ADR scopes the **classes** side.
* **3-class commitment is load-bearing** (S005 Q5 6-2-1 verdict). Property + LegalEstate + RegisteredTitle are three distinct Substance Kinds with three distinct ICs.
* **RoleMixin / Role distinction** (S006 Q2) MUST emit as `opda:RoleMixin` + per-role sub-classes (Seller, Buyer, Proprietor) — the UFO anti-rigid pattern.
* **Transaction-as-Relator** (S007 Q1) MUST emit with `prov:Activity` reification for founding event + IC over 5 hard cases.
* **PROV-O Plan-vs-Activity** (S007 Q6) emission discipline — Plans are separate resources from Activities, linked via `prov:qualifiedAssociation`.
* **80%/5-residue PROV-O coverage** (S009 Q1) — `Claim` / `Evidence` / `VerificationActivity` map to `prov:Entity` / `prov:Entity` / `prov:Activity` respectively.
* **Reference-not-import for DPV** (S002 + S012 + ODR-0018) — `opda-governance.ttl` does NOT import DPV's TBox; it cites DPV terms via `dct:source`.

## Considered Options

* **A — One monolithic `opda-modules.ttl`.** Pro: simpler imports. Con: violates module separation; ratified ODRs are per-module; per-module amendment cycles can't target one module's TTL.
* **B — Per-module files, one TTL per module (chosen).** Pro: per-module amendment surgery; reviewers see one module's TBox in isolation; downstream consumers can import only what they need.
* **C — Per-class files** (one TTL per class). Pro: maximum granularity. Con: ~30+ files for the initial corpus; cognitive overhead far exceeds the benefit.

## Decision Outcome

Chosen option: **B — One TTL file per ratified module ODR**, emitted into `source/03-standards/ontology/`. Each module file is a self-contained class + property declaration scoped to its ratifying ODR.

### Module emission template (applies to every module)

```turtle
# opda-<module>.ttl — OPDA <Module> Module
# Generator: opda-gen <version>; DO NOT HAND-EDIT.
# Ratifying ODR(s): <list of ODR-NNNN>
# Source data dictionary leaves: <count> / <annotated count>

@prefix opda:    <https://w3id.org/opda/#> .
@prefix owl:     <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix skos:    <http://www.w3.org/2004/02/skos/core#> .
@prefix dct:     <http://purl.org/dc/terms/> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .
@prefix prov:    <http://www.w3.org/ns/prov#> .
@prefix time:    <http://www.w3.org/2006/time#> .

<https://w3id.org/opda/<module>/>
    a owl:Ontology ;
    dct:title "OPDA <Module> Module"@en ;
    owl:imports <https://w3id.org/opda/0.1.0/> ;          # foundation
    owl:imports <https://w3id.org/opda/vocabularies/> ;   # SKOS substrate
    owl:versionIRI <https://w3id.org/opda/<module>/0.1.0/> ;
    .

# Class declarations follow (deterministic order per ADR-0007):
#   owl:Class blocks alphabetised by URI
#   owl:DatatypeProperty alphabetised
#   owl:ObjectProperty alphabetised
```

### Per-module detail

#### `opda-property.ttl` (ODR-0005 + ODR-0015 + ODR-0008)

Mints Property + LegalEstate + RegisteredTitle (3-class per S005 Q5) + Address (S015 Q1 Substance Kind) + held-Building/Room conditional emissions.

```turtle
opda:Property
    a owl:Class ;
    rdfs:label "Property"@en ;
    rdfs:comment "Physical property; UFO Substance Kind; DOLCE Endurant. IC: spatial-material continuity with Kendall+Davis legal-record-discontinuity-override hybrid. Hard cases: demolition; subdivision; merger; replacement; first-registration; flat with split UPRN."@en ;
    skos:scopeNote "DOLCE: Endurant. UFO: Substance Kind. (Guizzardi 2005 Ch. 4; Masolo D18 §4.1)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0005#section-2a> ;
    .

opda:LegalEstate
    a owl:Class ;
    rdfs:label "Legal Estate"@en ;
    rdfs:comment "Legal rights-bundle vested in a Property; UFO Substance Kind; DOLCE NonPhysicalEndurant. IC: rights-bundle persistence — same individual through grant, transfer, registration, and discharge events; distinguishable from coexisting RegisteredTitle and physical Property by extension of property rights. Hard cases: tenure change; lease grant; lease termination; commonhold conversion."@en ;
    skos:scopeNote "DOLCE: NonPhysicalEndurant. UFO: Substance Kind. (Guizzardi 2005 §5; Masolo D18 §4.2)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0005#section-3b> ;
    .

opda:RegisteredTitle
    a owl:Class ;
    rdfs:label "Registered Title"@en ;
    rdfs:comment "HMLR title record; UFO Substance Kind (informational); DOLCE NonPhysicalEndurant. IC: title-number lineage with PROV-O lifecycle reification per S005 §3c. Hard cases: first-registration; title closure; title merger; register transfer."@en ;
    skos:scopeNote "DOLCE: NonPhysicalEndurant. UFO: Substance Kind (informational)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0005#section-3c> ;
    .

opda:Address
    a owl:Class ;
    rdfs:subClassOf <http://www.w3.org/2006/vcard/ns#Address> ;  # S015 Q4 alignment
    rdfs:label "Address"@en ;
    rdfs:comment "Address resource shape; UFO Substance Kind; DOLCE NonPhysicalEndurant. IC: five-rule (cosmetic-reformat / authority-succession / cross-variant-distinction / Property-side-change / INSPIRE-only-locatedness). Per S015 Q1 commitment, NOT a Mode."@en ;
    skos:scopeNote "DOLCE: NonPhysicalEndurant (Searle 1995 institutional fact grounding). UFO: Substance Kind."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0015#section-2a> ;
    .

# Property descriptive attributes per ODR-0008 §Operational specifications Q5a binding table
opda:builtForm
    a owl:DatatypeProperty ;
    rdfs:domain opda:Property ;
    rdfs:range xsd:string ;
    rdfs:label "built form"@en ;
    rdfs:comment "Property built-form classification per opda:BuiltFormScheme. UFO Quale-in-Region. SKOS scheme membership via skos:notation."@en ;
    dct:source <https://w3id.org/opda/data-dictionary#builtForm> ;
    dct:source <https://w3id.org/opda/data-dictionary/baspi5#B1.3.2> ;  # spanning-leaf overlay source
    .

# … (per ODR-0008 §Operational specifications Q5a binding table — full leaf set)

# Property predicates
opda:hasUPRN
    a owl:DatatypeProperty ;
    rdfs:domain opda:Property ;
    rdfs:range xsd:string ;
    rdfs:label "has UPRN"@en ;
    rdfs:comment "Unique Property Reference Number — OS AddressBase identifier. Per ODR-0005 §6a, contingent identifier (PROV-O succession); not load-bearing IC key."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0005#section-6a> ;
    .

opda:hasAddress
    a owl:ObjectProperty ;
    rdfs:domain opda:Property ;
    rdfs:range opda:Address ;
    rdfs:label "has Address"@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0015#section-3a> ;
    .

opda:identifiesSameProperty
    a owl:ObjectProperty ;
    rdfs:domain opda:RegisteredTitle ;  # Generalised: also LegalEstate, Address
    rdfs:range opda:Property ;
    rdfs:label "identifies same property"@en ;
    rdfs:comment "Co-reference predicate. NEVER owl:sameAs (ODR-0005 Rule 5 anti-pattern)."@en ;
    .

opda:recordsEstate
    a owl:ObjectProperty ;
    rdfs:domain opda:RegisteredTitle ;
    rdfs:range opda:LegalEstate ;
    .
```

Conditional emissions (Davis HELD-AS-LIVE per S008 Q4): `opda:Building`, `opda:Room`. The generator emits these as commented stubs:

```turtle
# Held conditional per Davis S008 Q4 dissent — re-open on first named BASPI5 round-trip query.
# opda:Building
#     a owl:Class ;
#     ...
```

#### `opda-agent.ttl` (ODR-0006)

```turtle
opda:Person
    a owl:Class ;
    rdfs:label "Person"@en ;
    rdfs:comment "Natural person. UFO Substance Kind. IC: FIBO multi-identifier persistence (DOB + state-issued ID + name)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0006#section-Q1> ;
    .

opda:Organisation
    a owl:Class ;
    rdfs:subClassOf <http://www.w3.org/ns/org#Organization> ;  # S006 Q6 9-1 verdict (Allemang held-as-live)
    rdfs:label "Organisation"@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0006#section-Q1> ;
    .

opda:Seller
    a opda:RoleMixin ;  # S006 Q2 RoleMixin
    rdfs:label "Seller"@en ;
    rdfs:comment "UFO RoleMixin (anti-rigid; cross-sortal — Person OR Organisation). Borne in the context of a Transaction Relator."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0006#section-Q2> ;
    .

opda:Buyer
    a opda:RoleMixin ;
    rdfs:label "Buyer"@en ;
    .

opda:Proprietor
    a opda:Role ;  # Distinct from RoleMixin per UFO discipline
    rdfs:label "Proprietor"@en ;
    .

opda:Proprietorship
    a opda:Relator ;  # S006 Q3 UFO Relator
    rdfs:label "Proprietorship"@en ;
    rdfs:comment "UFO Relator mediating Property + Proprietor instances. Founding event recorded via prov:wasGeneratedBy."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0006#section-Q3> ;
    .

# Capacity vs Authority — two-predicate seam per S006 Q4
opda:hasAssertedCapacity
    a owl:DatatypeProperty ;
    rdfs:domain opda:Seller ;
    rdfs:range xsd:string ;
    rdfs:comment "Sellers-capacity per opda:SellersCapacityScheme. Bounded-context seam between Sales and Conveyancing per S006 Q4 (Evans+Vernon load-bearing)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0006#section-Q4> ;
    .

opda:hasEvidencedAuthority
    a owl:ObjectProperty ;
    rdfs:domain opda:Seller ;
    rdfs:range opda:Claim ;  # Conveyancing-side claim
    .
```

#### `opda-transaction.ttl` (ODR-0007)

```turtle
opda:Transaction
    a opda:Relator ;  # S007 Q1
    rdfs:label "Transaction"@en ;
    rdfs:comment "UFO Relator. FIBO Arrangement precedent. IC: 5-tuple (LegalEstate-concerned, Sellers-set, Buyers-set, transaction-id-lineage). Hard cases: party-substitution; estate-change; transaction-id reissuance; chain-link-break; aborted-transaction."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0007#section-Q1> ;
    .

opda:Milestone
    a owl:Class ;
    rdfs:label "Milestone"@en ;
    rdfs:comment "Transaction lifecycle milestone. Hybrid PROV-O: prov:atTime for instant milestones (offer-accepted, exchange); prov:startedAtTime + prov:endedAtTime for interval milestones (completion-process, registration-process). S007 Q2."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0007#section-Q2> ;
    .

opda:TransactionChain
    a owl:Class ;
    rdfs:label "Transaction Chain"@en ;
    rdfs:comment "Aggregate of dependent transactions. S007 Q4 dual-mechanism (recursive predicate + Aggregate). Chain-length cap: sh:maxInclusive 7 per CLC data."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0007#section-Q4> ;
    .

# PROV-O Plan-vs-Activity per S007 Q6 — Plans are separate resources
# (see opda-x:milestone-completion-plan in simple-transaction-with-milestones.ttl)
opda:plannedAtTime
    a owl:DatatypeProperty ;
    rdfs:domain prov:Plan ;
    rdfs:range xsd:dateTime ;
    dct:source <https://w3id.org/opda/odr/ODR-0007#section-Q6> ;
    .
```

#### `opda-claim.ttl` (ODR-0009)

Per S009 80%/5-residue (Moreau): Claim/Evidence/VerificationActivity map onto PROV-O backbone.

```turtle
opda:Claim
    a owl:Class ;
    rdfs:subClassOf prov:Entity ;
    rdfs:label "Claim"@en ;
    rdfs:comment "Verifiable claim entity. PROV-O Entity. Hard cases: contested assertion; multi-method verification; assurance-level downgrade."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0009#section-Q1> ;
    .

opda:Evidence
    a owl:Class ;
    rdfs:subClassOf prov:Entity ;
    rdfs:label "Evidence"@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0009#section-Q1> ;
    .

opda:DocumentEvidence
    a owl:Class ;
    rdfs:subClassOf opda:Evidence ;
    rdfs:label "Document Evidence"@en ;
    .

opda:ElectronicRecordEvidence
    a owl:Class ;
    rdfs:subClassOf opda:Evidence ;
    .

opda:VouchEvidence
    a owl:Class ;
    rdfs:subClassOf opda:Evidence ;
    .

opda:VerificationActivity
    a owl:Class ;
    rdfs:subClassOf prov:Activity ;
    rdfs:label "Verification Activity"@en ;
    .

opda:AssuranceLevel
    a owl:Class ;  # Backed by opda:AssuranceLevelScheme SKOS scheme
    rdfs:label "Assurance Level"@en ;
    .

opda:TrustFramework
    a owl:Class ;
    rdfs:label "Trust Framework"@en ;
    rdfs:comment "Trust framework citation. Authoritative within scope per Session 003c Item 3 (OPDA TF authoritative scope)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0009#section-Q5> ;
    .

opda:digest
    a owl:DatatypeProperty ;
    rdfs:range xsd:string ;
    rdfs:comment "Cryptographic digest per S009 Q4. Algorithm SKOS scheme: opda:DigestAlgorithmScheme."@en ;
    .
```

#### `opda-governance.ttl` (ODR-0012 + ODR-0018)

Primarily mapping tables to DPV (reference-not-import per Kendall S012 DA condition):

```turtle
# DPV class-level co-annotation mapping table per ODR-0018
# Each row: opda Kind → dpv-pd category baseline + variant refinements
# (consumed by ODR-0012 generator at annotation-graph emission per ADR-0012)

opda:PersonDPVMapping
    a opda:DPVMappingRecord ;
    opda:targetsKind opda:Person ;
    opda:baselineCategory <https://w3id.org/dpv/pd#Name> ;  # Reference-not-import
    opda:variantRefinements (
        [ opda:identifier "email" ; opda:category <https://w3id.org/dpv/pd#EmailAddress> ]
        [ opda:identifier "dob" ; opda:category <https://w3id.org/dpv/pd#DateOfBirth> ]
    ) ;
    dct:source <https://w3id.org/opda/odr/ODR-0018#section-Rule4> ;
    .

opda:SpecialCategoryScheme
    a skos:ConceptScheme ;  # Baker S012 Q3 amendment
    skos:prefLabel "Article 10 Special Category Personal Data"@en ;
    dct:source <https://gdpr-info.eu/art-10-gdpr/> ;
    .
```

#### `opda-descriptive.ttl` (ODR-0008 + S008 Q4 class promotions)

```turtle
opda:Survey
    a owl:Class ;
    rdfs:subClassOf prov:Entity ;
    rdfs:label "Survey"@en ;
    rdfs:comment "Authority-retrieved professional survey report. UFO Substance Kind (informational). IC: distinct provenance chain per S008 Q4 three-criterion test. Hard cases: re-survey; supersession; withdrawal."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0008#section-Q4a> ;
    .

opda:EPCCertificate
    a owl:Class ;
    rdfs:subClassOf prov:Entity ;
    rdfs:label "EPC Certificate"@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0008#section-Q4a> ;
    .

opda:Search
    a owl:Class ;
    rdfs:subClassOf prov:Entity ;
    rdfs:label "Search"@en ;
    .

opda:Valuation
    a owl:Class ;
    rdfs:subClassOf prov:Entity ;
    rdfs:label "Valuation"@en ;
    .

opda:Comparable
    a owl:Class ;
    rdfs:subClassOf prov:Entity ;
    rdfs:label "Comparable"@en ;
    .

# Descriptive datatype properties per ODR-0008 §Operational specifications Q5a
# (Quale-in-Region SKOS schemes referenced; per-property bindings emit here)
opda:currentEnergyRating
    a owl:DatatypeProperty ;
    rdfs:domain opda:Property ;
    rdfs:range xsd:string ;
    skos:scopeNote "Constrained to opda:CurrentEnergyRatingScheme via SHACL sh:in"@en ;
    .

# … (full per-leaf binding per ODR-0008 §Q5a table — built-form, councilTaxBand, tenureKind, etc.)
```

### Consequences

* Good, because each ratified module ODR maps 1:1 to one emitted TTL file; per-module amendment cycles can target one file.
* Good, because A9 per-kind discipline output is mechanical and uniform across modules — every class carries `dct:source` + `skos:scopeNote` + `rdfs:comment` per ADR-0007.
* Good, because S008 Q5a binding table maps descriptive attributes onto SKOS schemes from `opda-vocabularies.ttl` — no per-attribute deliberation at emission time.
* Good, because RoleMixin / Role / Relator distinction emits with UFO type discrimination (`a opda:RoleMixin` vs `a opda:Role` vs `a opda:Relator`), enabling downstream SHACL checks on UFO ontology violations.
* Good, because reference-not-import for DPV keeps `opda-governance.ttl` lean — mapping tables not import-cascades.
* Good, because held-as-live conditional Class promotions (Davis Building/Room) emit as commented stubs — explicit absence with named re-open triggers.
* Bad, because per-module imports of foundation + vocabularies mean each module fetches the substrate; mitigation: rdflib caches; build-step composer (ADR-0012) merges for derived profiles.
* Bad, because descriptive-attributes binding table (S008 Q5a) is large (~50 leaf bindings) — large emission file. Mitigation: split into multiple sub-files if exceeds 1,500 lines per ODR-0011 (recursive application of programme rule).
* Neutral, because some classes (`opda:Building`, `opda:Room`) emit as commented stubs awaiting consumer-query trigger; the absence is explicit.

### Confirmation

The ADR is honoured when all seven hold:

1. **All six modules emit.** `opda-gen emit-module property/agent/transaction/claim/governance/descriptive` produces six `.ttl` files in `source/03-standards/ontology/`.
2. **Byte-identity CI green** per module.
3. **A9 discipline output verified.** Every emitted `owl:Class` from a `kind: pattern` module ODR carries `dct:source` + `skos:scopeNote` + `rdfs:comment` per ADR-0007 §"A9 per-kind discipline output".
4. **Three-graph isolation verified.** No `sh:*` triples in any module classes file; no advisory annotation predicates; no `owl:imports` to DPV (reference-not-import).
5. **Per-module `owl:versionIRI` pins to generator version.** `<https://w3id.org/opda/property/0.1.0/>` etc.
6. **Diagnostic exemplars validate** against the emitted classes. Every exemplar's `a opda:X` typing resolves to a declared class.
7. **`opda:Property hasUPRN`, `opda:identifiesSameProperty`, `opda:hasAddress`** — the core join predicates from S005 + S015 — emit and validate.

Manual test: `opda-gen emit-module property && pyshacl -s opda-shapes.ttl -d opda-property.ttl` (after ADR-0012 emits shapes) returns no shape-target-unresolved errors.

**Programme-wide validation gate** (per [ADR programme plan §9 — Validation discipline](./plan/ontology-implementation.md)). In addition to the ADR-specific criteria above, this ADR moves `proposed → accepted` only when **all four** of the following hold (independent of the worker that implemented this ADR):

- **(a) Soundness check PASS** — every emitted artefact traces to a cited ODR/ADR `## Rules` or `## Operational specifications` clause via `dct:source` (for Turtle) or code-comment provenance header (for Python). The validation agent extracts emitted-artefact provenance and verifies each resolves to a ratified section.
- **(b) Completeness check PASS** — every cited ODR's `## Rules` and `## Operational specifications` subsection is realised by an emitted artefact OR explicitly deferred with a named follow-up trigger. The validation agent enumerates cited subsections and checks coverage.
- **(c) Cross-ADR consistency check PASS** — every downstream ADR's confirmation criteria can be met given this ADR's emission (e.g. classes emitted here are referenceable by downstream shapes; shapes here are composable by downstream profiles). The validation agent simulates the downstream contract against this ADR's output.
- **(d) Validation report committed** at `docs/adr/validation/ADR-0011-validation-report.md`, produced by an **independent validation-agent spawn** (NOT the implementing worker; mirrors the Council Devil's Advocate independence per [ODR-0001 §Roles for every session](../ontology/odr/ODR-0001-linked-data-council-methodology.md); see ADR programme plan §8 swarm orchestration topology).

A FAIL on any of (a)–(d) blocks `accepted` status; the implementing worker amends and validation re-runs. Two consecutive validation failures on the same ADR escalate to a Council mini-session per [ODR-0001 §Self-amendment process](../ontology/odr/ODR-0001-linked-data-council-methodology.md) — engineering does not re-deliberate; surfaced `## Rules` ambiguity routes to Council ratification.

## More Information

* **Ratified ODRs realised:** [ODR-0005](../ontology/odr/ODR-0005-property-land-identity-crux.md); [ODR-0006](../ontology/odr/ODR-0006-agents-and-roles.md); [ODR-0007](../ontology/odr/ODR-0007-transactions-and-lifecycle.md); [ODR-0008](../ontology/odr/ODR-0008-property-descriptive-attributes.md); [ODR-0009](../ontology/odr/ODR-0009-claims-evidence-provenance.md); [ODR-0012](../ontology/odr/ODR-0012-data-governance-layer.md); [ODR-0015](../ontology/odr/ODR-0015-address-and-geography.md); [ODR-0018](../ontology/odr/ODR-0018-dpv-class-level-coannotation-pattern.md).
* **Predecessor ADRs:** [ADR-0009 — Foundation TTL emission](./ADR-0009-foundation-ttl-emission.md); [ADR-0010 — SKOS vocabulary emission](./ADR-0010-skos-vocabulary-emission.md). Foundation + substrate land before modules.
* **Successor ADR:** [ADR-0012 — SHACL shapes + DPV annotation emission](./ADR-0012-shacl-and-dpv-annotation-emission.md). Shapes + annotations side of each module's three-graph triple.
* **Held-as-live tracking:** Davis Q4 Building/Room class-promotion (commented stubs in `opda-property.ttl`; re-open trigger 18-month or named BASPI5 round-trip query); Kendall Q2 four-way sub-module alternative (re-open trigger encumbrance-cardinality evidence).
* **Out of scope for this ADR:**
  - SHACL shapes (ADR-0012).
  - DPV co-annotation triples (ADR-0012).
  - Overlay profile shapes (ADR-0013).
  - SHACL-AF rule emission (ADR-0012 emits rules into shapes graph).
