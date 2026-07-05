# The Linked-Data Model Architecture

> Part of the OPDA Linked-Data Initiative knowledgebase. Legend: ✅ built · 🟡 partial · 🔵 planned.
>
> Builds on [`_research-synthesis.md`](./_research-synthesis.md), [`_external-research.md`](./_external-research.md),
> and [`_fact-sheet.md`](./_fact-sheet.md). Every structural claim here is verified against the
> **emitted Turtle** in `source/03-standards/ontology/`, not just against the prose ODRs.

## TL;DR

- The ontology is **one flat term namespace** (`opda: → https://opda.org.uk/pdtf/`) split into **six editorial module files by ontological *concern*** — not by JSON page, not by industry form. Each module is its own `owl:Ontology` graph that `owl:imports <https://opda.org.uk/pdtf/>`; the file split is for human stewardship, the namespace stays flat so one concept is never scattered across many prefixes. ✅
- **The identity crux (ODR-0005)** is the flagship win: PDTF's single implicit "property" — a UPRN floating across four leaf paths with zero schema-level joins — becomes **three classes with distinct DOLCE/UFO identity criteria** (`opda:Property`, `opda:LegalEstate`, `opda:RegisteredTitle`). UPRN is demoted to a *contingent* identifier; `owl:sameAs` is forbidden; uniqueness is SHACL/DASH-checkable. ✅
- People and organisations are **rigid Kinds** (`opda:Person`, `opda:Organisation`) that *play* **anti-rigid roles** (`opda:Seller`/`opda:Buyer` as RoleMixins, `opda:Proprietor`/`opda:Conveyancer` as Roles), founded by a `opda:Transaction` **Relator**. Roles are never keyed and never subclassed onto their bearers. ✅
- The descriptive layer was **deliberately collapsed**: of ~1,493 annotated base leaves, only **~181 (~12%)** are genuine descriptive concepts; ~88% are form-ergonomics (`yesNo` recurs ~1,135× in source; the emitted `YesNoScheme` carries the note "Used by ~276 BASPI5 discriminator questions"). The AI did **not** transliterate 1:1 — it binned A–G and minted ~5 patterns + ~56 SKOS schemes instead of ~900 form-slot IRIs. ✅
- A PDTF **form IS a DCMI Application Profile (DCAP)**: its SHACL overlay shapes are a Description Set Profile, the data dictionary is a DCTAP, and the six industry contexts ship as a `skos:ConceptScheme` (ODR-0019/0020) — DDD bounded contexts modelled as a *perspective*, never as a namespace. ✅
- **Verified emitted counts:** **40 `owl:Class`** · **226 `owl:DatatypeProperty`** · **30 `owl:ObjectProperty`** · **47 SKOS `ConceptScheme`** · **308 SKOS `Concept`** · **90 SHACL `NodeShape`** (52 module + 38 profile) · severities **287 Violation / 28 Info / 1 Warning**. (The synthesis quotes "41 classes"; the byte-exact emitted figure is 40 — see [Built vs planned](#built-vs-planned).)

---

## 1. Why partition by ontological concern, not by JSON page

PDTF v3 is delivered as JSON Schema organised by **form and payload** — `propertyPack`, `verifiedClaims`, `chain`, plus a dozen statutory-form overlays (BASPI5, TA6/7/10, NTS2, LPE1, CON29R/DW, LLC1, FME1, PIQ). That partition answers "what does this form transport?" It is the **wrong altitude** for a TBox, which must answer "what *kinds of thing* exist and what makes each the same one over time?"

So the ontology re-partitions along **ontological concern** — a FIBO-style modular method reconciled with UFO layering ([ODR-0004](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md)). There are **six module files**:

| Module file | Concern | Ratifying ODR(s) | Anchor classes (emitted) |
|---|---|---|---|
| `opda-property.ttl` | Physical property, legal estate, registry record, address | ODR-0005 + ODR-0015 + ODR-0008 | `Property`, `LegalEstate`, `RegisteredTitle`, `Address`, `LeaseTerm`, `UPRNSuccessionEvent` |
| `opda-agent.ttl` | People, organisations, roles, capacity/authority | ODR-0006 | `Person`, `Organisation`, `Seller`, `Buyer`, `Proprietor`, `Proprietorship` |
| `opda-transaction.ttl` | The transaction relator, milestones, chains | ODR-0007 | `Transaction`, `Milestone`, `TransactionChain` |
| `opda-claim.ttl` | Claims, evidence, provenance, assurance | ODR-0009 | `Claim`, `Evidence`, `VerificationActivity`, `AssuranceLevel`, `AttachedDocument` |
| `opda-descriptive.ttl` | Per-property/estate facts; search/EPC/survey artefacts | ODR-0008 (+ ODR-0008d, ODR-0022) | `EPCCertificate`, `RiskAssessment`, `Search`, `Survey`, `Valuation`, `Comparable` |
| `opda-governance.ttl` | DPV/PII mapping records, special-category scheme | ODR-0012 + ODR-0018 | `DPVMappingRecord`, `SpecialCategoryScheme` |

The decisive point is that **module-of-file is not module-of-namespace**. Every module declares its own graph IRI and imports the single flat ontology — verified identically across all six:

```turtle
# opda-property.ttl (and agent / transaction / claim / descriptive / governance, identically)
<https://opda.org.uk/pdtf/graph/property>
    rdf:type owl:Ontology ;
    dct:title "OPDA Property Module"@en ;
    owl:imports <https://opda.org.uk/pdtf/> ;                       # ← the one flat ontology
    owl:versionIRI <https://opda.org.uk/pdtf/harness/release/property/1.0.0/> .
```

Every minted term — in any module — is `opda:Something` under `https://opda.org.uk/pdtf/`. The six `…/pdtf/graph/<concern>` IRIs are *editorial homes for stewardship and emission*, not URL segments a term resolves under. This is the same discipline ODR-0019 enforces for bounded contexts: **partition the files by concern; keep the identifiers flat** — so `opda:Address`, which is used across ~10 contexts and referenced from property, agent and descriptive concerns alike, has exactly one IRI and never needs `owl:sameAs` to re-link copies. (✅ — `rdfs:isDefinedBy` to the owning graph is the module-of-origin axis; it is "always-emitted module hygiene," currently 0× in the corpus but reserved.)

---

## 2. The identity crux (ODR-0005) — the flagship win

### The defect

PDTF v3 **has no `Property` class.** The thing every transaction is *about* is reconstructed at read time from scattered surfaces with **zero schema-level joins**. UPRN — the obvious join key — appears in **four** leaf paths and is never reconciled:

- `propertyPack.uprn`
- `energyEfficiency.certificate.uprn`
- `chain.onwardPurchase[].uprn`
- `valuationComparisonData.propertyDetails[].uprn`

Address adds many more surfaces; INSPIRE ID and title-linked address add still more. The data dictionary defines `uprn` only as "a unique identifier for the property." In ontological terms this is **a missing class with no identity criterion** — what the council named the *implicit-Property defect*. As Guarino's framing puts it (cited in [Session 005](../ontology/odr/ODR-0005-property-land-identity-crux.md)): an ontology whose central endurant has no identity criterion is "not an ontology — it is a schema with RDF syntax."

### The cure — three Substance Kinds, three identity criteria

Council Session 001 (Q4) confirmed the diagnosis **12-0** and converged on a split; Session 005 (Queen Guarino; Devil's Advocate Allemang, who withdrew on all 8 questions) ratified the **three-class pattern** (Q5: 6-2-1 FOR three classes, with Davis + Cagle dissents preserved as named re-open triggers). Each class is a **UFO Substance Kind** committed to **DOLCE Endurant**, supplying its **own** identity criterion (IC):

| Class | UFO / DOLCE | Identity criterion (IC) | Hard cases it answers |
|---|---|---|---|
| `opda:Property` | Substance Kind / Endurant · PhysicalObject | **spatial-material continuity** with legal-record discontinuity override | demolition, subdivision, merger, rebuild, split-UPRN |
| `opda:LegalEstate` | Substance Kind / NonPhysicalEndurant (Searle institutional object) | **rights-bundle persistence** (survives transfer, charges, easements) | transfer, enlargement, determination, first registration |
| `opda:RegisteredTitle` | Substance Kind / NonPhysicalEndurant (HMLR record-entity) | **title-number lineage + registry-event history** | title opening/closure/merger, transfer between registers, reissue |

This is exactly what is emitted (`opda-property.ttl`):

```turtle
opda:Property
    rdf:type owl:Class ;
    rdfs:label "Property"@en ;
    rdfs:comment "Physical property. UFO Substance Kind; DOLCE Endurant / PhysicalObject. IC: spatial-material continuity with Kendall+Davis legal-record-discontinuity-override hybrid (ODR-0005 §3a). Hard cases: demolition; subdivision; merger; replacement; first-registration; flat with split UPRN."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-2a> ;
    skos:scopeNote "DOLCE: Endurant / PhysicalObject (Masolo et al. 2003 D18 §4.1). UFO: Substance Kind (Guizzardi 2005 Ch. 4 §4.2 — Sortal, Rigid, supplies own IC)."@en .

opda:LegalEstate
    rdf:type owl:Class ;
    rdfs:comment "Legal rights-bundle vested in a Property. UFO Substance Kind; DOLCE NonPhysicalEndurant (Searle 1995 legal-institutional object). IC: rights-bundle persistence … "@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-3b> .

opda:RegisteredTitle
    rdf:type owl:Class ;
    rdfs:comment "HMLR title-register record. UFO Substance Kind (informational); DOLCE NonPhysicalEndurant. IC: title-number lineage + registry-event history (every lifecycle event captured as a reified prov:Activity with explicit prov:wasDerivedFrom / prov:wasInvalidatedBy triples). … "@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0005/section-3c> .
```

### UPRN as a *contingent* identifier — not the IC

The subtle, load-bearing move: **UPRN is demoted.** It is a UFO Quality on `opda:Property`, an administratively-contingent scheme-scoped identifier — **not** the identity criterion. Five rules follow (all normative, all emitted or SHACL-enforced):

1. **Operational key is SHACL/DASH uniqueness.** `dash:uniqueValueForClass true` on `opda:uprn` is the *primary, checkable* mechanism — it fires a `sh:Violation` on duplicate UPRN and **degrades gracefully** (no violation) when UPRN is absent. This is the cure for the new-build / pre-first-registration case the JSON schema cannot express.
2. **`owl:hasKey` is optional/secondary** — a semantic annotation valid only where UPRN is truly identifying; **never on a Role**.
3. **No `owl:sameAs`** across the UPRN surfaces (unanimous — irreversible inference propagation under RDF semantics). Joins use the key + SHACL co-reference, or a controlled `opda:identifiesSameProperty`.
4. **UPRN succession is reified.** Retire/split/merge/re-issue is modelled by `opda:UPRNSuccessionEvent` (a `prov:Activity` subclass) with `prov:wasDerivedFrom`, materialised into the validation report by a **SHACL-AF rule at `sh:Info` severity**. The reified event is canonical (Gandon's W3C-side recommendation — dereferenceable, audit-trailed); a denormalised `opda:previousUPRN` literal pair is retained only as a convenience for stale-reference checks.

The forbidden anti-patterns are recorded explicitly so the discipline is falsifiable:

> `owl:sameAs` between any two UPRN-bearing nodes · `owl:hasKey (opda:uprn)` as the *sole* identity mechanism (inert when UPRN absent) · a keyed Role · treating UPRN or address as the IC · treating `RegisteredTitle` as a UFO *Mode* of `LegalEstate` (fails the temporal-extent test — the title exists before the estate is vested and after it is dissolved).

### Why three, and why this is checkable, not hand-waved

Three exemplars discharge the gate and become CI regressions ([ODR-0004](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md) §8a): a baseline `registered-freehold-house.ttl` (all three classes co-referring), an `unregistered-pre-first-registration-house.ttl` (a `LegalEstate` with **no** `RegisteredTitle`, UPRN absent — the case the 2-class collapse cannot answer), and a `flat-with-split-uprn.ttl` (one `Property` persisting across UPRN succession). The three-part operational test is literally stated and machine-runnable: duplicate-UPRN → `sh:Violation`; missing-UPRN → no violation; succession-chain → SPARQL-traversable with the `sh:Info` rule firing.

The PII payoff is real and downstream: only `RegisteredTitle` carries the HMLR open-register **published-personal-data** regime (ICO public-task lawful basis), so the three-class split gives the registry record a class-level discriminator for Subject Access processing — something a single conflated "property" entity structurally cannot do. (✅ — classes, ICs, exemplars and the succession rule all emitted; the `dash:uniqueValueForClass` and SHACL-AF succession shapes live in `opda-property-shapes.ttl` / `opda-shapes.ttl`.)

---

## 3. Transactions & lifecycle (ODR-0007) — the Transaction as Relator

A transaction is **not** a Kind and **not** a mere event — it is a **UFO Relator**: a relational endurant that mediates two or more bearers and is *founded by an external event*, carrying its own identity (the mediated-bearers + founding-event tuple) and bearing properties that belong to no single party. The foundation module declares `opda:Relator` once; the transaction module subclasses it:

```turtle
opda:Transaction
    rdf:type owl:Class ;
    rdfs:comment "Property-transaction Relator. UFO Relator (relational endurant). FIBO Arrangement precedent. Founds opda:Seller and opda:Buyer RoleMixins (ODR-0006 §Q2). IC: 5-tuple (LegalEstate-concerned, Sellers-set, Buyers-set, transaction-id-lineage, founding-event). Hard cases per S007 Q1: party-substitution; estate-change; transaction-id reissuance; chain-link-break; aborted-transaction. … "@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0007/section-Q1> ;
    rdfs:subClassOf opda:Relator .
```

Three structural pieces hang off it:

- **`opda:Milestone`** — lifecycle milestones as `prov:Activity`. Hybrid PROV-O typing (S007 Q2): *instant* milestones (instruction, offerAccepted, exchange) carry `prov:atTime`; *interval* milestones (completion-process, registration-process) carry `prov:startedAtTime` + `prov:endedAtTime`. Each may pair with a `prov:Plan` carrying `opda:plannedAtTime`, so an `opda:MilestoneVarianceRule` materialises expected-vs-actual variance into the validation report (`sh:Info` under 14 days, `sh:Warning` over).
- **`opda:TransactionChain`** — modelled two ways on purpose (S007 Q4), because both shapes appear in real chain queries: a recursive `opda:dependsOnTransaction` predicate *and* an `opda:chainMembers` aggregate, with a `sh:maxInclusive 7` chain-length cap from CLC data. Chain status is *derived* (any-blocked → chain-blocked).
- **Status / participant lifecycle** — drawn from SKOS schemes (e.g. a `ParticipantStatusScheme`: Proposed/Invited/Active/Removed — note PDTF v3.4 itself replaced `isRemoved` with `participantStatus`, which the ontology mirrors as a controlled vocabulary rather than a boolean).

Note the deliberate **dual-typing seam**: a `opda:LeaseExtensionEvent` is both a property-lifecycle event (it mutates a `LeaseTerm`) and may co-type as a `opda:Transaction` — "the dual typing reflects the property-lifecycle vs relator perspectives on the same event." The ontology lets one node wear both hats rather than forcing a false choice. ✅

---

## 4. Claims, evidence & provenance (ODR-0009) — PROV-O backbone + eIDAS envelope

PDTF carries its assurance story in a **separate envelope** — `pdtf-verified-claims.json`, an OIDC4IDA / eIDAS-shaped structure. This is the seam where PDTF "stops being a property-data form and becomes a *Trust* Framework," and an opaque-JSON envelope cannot participate in the W3C VC / DID ecosystem the business glossary already names. (Standards depth — the full eIDAS/OIDC4IDA mapping — lives in **KB doc 03**; this section gives the model shape.)

The decision: a **PROV-O backbone (~80% of the envelope, native) plus a thin assurance layer** for the residue PROV-O cannot express. Canonically:

- `opda:Claim rdfs:subClassOf prov:Entity` — each asserted claim is an entity; the *verified* claim (claim + verification bundle) is a **derived** entity via `prov:wasDerivedFrom` (the load-bearing edge).
- `opda:VerificationActivity rdfs:subClassOf prov:Activity` — the OIDC4IDA single `time` → `prov:endedAtTime`; the verifier is bound via the **qualified form** (`prov:qualifiedAttribution → prov:Attribution → prov:hadRole`) so `validation_method`/`verification_method` are not discarded.
- The **five exceptions** that get modelled *around* PROV: `trust_framework` → `dct:conformsTo`; validation-vs-verification → sub-plans / SKOS method; cryptographic `digest` → local `opda:digest`; assurance level → SKOS-coded `opda:AssuranceLevel` (the eIDAS Low/Substantial/High + a PDTF-Standard intermediate); `txn` → `dct:identifier`.

### Evidence as classification, not inheritance (the S036 doctrine in action)

ODR-0009 originally proposed `opda:DocumentEvidence` / `…ElectronicRecordEvidence` / `…VouchEvidence` subclasses. The **classification-over-inheritance** rule (ODR-0027) later retired that subclass tree. The emitted reality: **`opda:Evidence` is a `RoleMixin`**, and the evidence *kind* is a **coded classifier** (`opda:evidenceType` over the OIDC4IDA value-space Document / Electronic-Record / Vouch), validated **value-keyed** by SHACL — never as a subclass:

```turtle
opda:Evidence
    rdf:type owl:Class, opda:RoleMixin ;                            # ← Kind-class AND a UFO RoleMixin
    rdfs:comment "Evidence supporting a Claim. UFO RoleMixin (anti-rigid, cross-categorial — a bearer is evidence only qua a VerificationActivity using it) … Evidence KIND is a coded isMemberOf classification — opda:evidenceType over opda:EvidenceMethodScheme … NOT a subclass tree (ODR-0027 §R6; the former …Evidence subclasses are retired, since 'evidence is a role a document plays' and a Role is never rdfs:subClassOf a Kind). … per-kind obligations are validated VALUE-KEYED by opda:EvidenceFacetShape (sh:targetSubjectsOf opda:evidenceType + sh:or material implication)."@en ;
    rdfs:subClassOf prov:Entity .

opda:AttachedDocument                                              # the one genuine document Kind
    rdf:type owl:Class ;
    rdfs:subClassOf prov:Entity ;
    rdfs:comment "… A NEUTRAL document Kind — NOT evidence … A document BECOMES evidence by playing the evidence role (opda:evidenceType 'Document'), NOT by an rdfs:subClassOf into evidence."@en .
```

This is the heart of the model's RBAC/authority story too: a document is a *thing*; "evidence" is a *role it plays* in a verification activity. Enforcement is therefore keyed on the **value** of `opda:evidenceType`, not on the class — exactly the pattern recorded in [[opda-classification-over-inheritance]] and [[opda-session-034-overlay-enumeration]]. (The agent/role layer's depth — Person/Organisation Kinds bearing anti-rigid roles, the capacity/authority split — lives in **KB doc 05**; section 5 below gives the overview.) ✅

---

## 5. The agent / role layer (overview — depth in KB doc 05)

The agent module applies the same Kind-vs-Role discipline to people and organisations:

- **Bearers are rigid Kinds.** `opda:Person` (DOLCE Endurant/Agent, FIBO-style multi-identifier IC over name-change / gender-recognition / death) and `opda:Organisation` (`rdfs:subClassOf org:Organization` per S006 Q6 9-1; FIBO LegalEntity multi-identifier pattern over merger / demerger / dissolution). FOAF was evaluated and ruled out in favour of `prov:Agent` + W3C Org + `dct:` + `opda:`.
- **Roles are anti-rigid and externally founded.** `opda:Seller` and `opda:Buyer` are **RoleMixins** (cross-sortal — borne by Person *or* Organisation, founded by the `opda:Transaction` Relator); `opda:Proprietor` is a **Role** (sortal — borne by Person, founded by a `opda:Proprietorship` Relator). A Role **never** supplies its own identity and is **never keyed** — it borrows identity from its bearer (the ODR-0005 anti-pattern, reused here).
- **The capacity/authority split** is the closest thing to authorisation logic, and it is a genuine modelling insight: PDTF collapses *asserted* and *evidenced* authority into free text; the ontology separates them across the sales/conveyancing seam:

```turtle
opda:hasAssertedCapacity                                          # sales-side: a SKOS-typed claim
    rdf:type owl:DatatypeProperty ;
    rdfs:domain opda:Seller ; rdfs:range xsd:string ;
    rdfs:comment "Seller-side asserted capacity … The assertion lives on the Sales side; the evidence link lives on the Conveyancing side via opda:hasEvidencedAuthority."@en .

opda:hasEvidencedAuthority                                        # conveyancing-side: → an opda:Claim
    rdf:type owl:ObjectProperty ;
    rdfs:domain opda:Seller ; rdfs:range opda:Claim ;
    rdfs:comment "Conveyancing-side seam linking a Seller's asserted capacity to an opda:Claim of authority (e.g. probate, power of attorney)."@en .
```

Honest scope: this is a **role + capacity + authority-evidence** substrate (UFO roles + SKOS vocabularies + SHACL), **not** an ODRL permission-policy layer — there are **zero `odrl:` triples** emitted. Machine-readable authorisation policies are an adopted-but-deferred Phase-2 layer that plugs into this substrate. 🟡 / 🔵

---

## 6. The descriptive-layer collapse (ODR-0022 / ODR-0008d) — AI restraint, not transliteration

This is the section that best refutes "the AI just translated JSON to RDF." The 2026-05-30 build pass proved the naive walk is *not* mechanical: there is no leaf→term map, and naive last-segment naming collapses **1,521 distinct leaves into ~351 colliding, permanent, unreversible IRIs**. The empirical reality (reproducible from `data-dictionary-canonical.json`):

- **56% (840) of leaves are ~16 generic recurring tail-segments** — `details`×269, `price`×99, `comments`×96, `isIncludedExcludedOrNone`×89…
- 378 enum leaves carry only **54 distinct value-sets**; the project's own `audit.json` flags **`yesNo` "referenced 1,135 times — not 1,135 unique concepts."**
- Only **~181 distinct names (~12%)** are genuine descriptive concepts.

So ODR-0022 classifies every annotated leaf into **one of seven categories (A–G)**, each with a fixed treatment:

| Cat | What it is | ~Leaves | Treatment (instead of 1:1 minting) |
|---|---|---|---|
| **A** | free-text disclosure tails (`details`, `comments`) | ~407 | **one** reusable `opda:disclosureDetail`; the question is carried by subject + `dct:source` |
| **B** | evidence / attachment envelope | (arrays) | **reuse** ODR-0009 `Evidence` + PROV-O; mint nothing |
| **C** | reused status enums (Yes/No, Included/Excluded/None) | 378 → **54 value-sets** | **one SKOS scheme per value-set**, reused by ONE shared property; per-form `sh:in` |
| **D** | fixtures checklist items | ~315 (≈89×3) | one `FixtureItemScheme` + ~3 shared props; **inclusion is a Mode/Relator of the sale**, not a Quality of the brick |
| **E** | repeated search/risk result structures | ~200 | **one `opda:RiskAssessment` class** + a peril SKOS scheme — *"NOT 12 subclasses and NOT 72 datatype properties"* |
| **F** | identity/address/contact/geo sub-fields | ~133 | **reuse** ODR-0015 (Address) / ODR-0006 (Agents); never re-mint |
| **G** | genuine per-property/estate facts | **~181** | **the curated per-leaf walk** — one dereferenceable `opda:` term per concept |

The Category-A collapse, emitted literally as a single property:

```turtle
opda:disclosureDetail
    rdf:type owl:DatatypeProperty ;
    rdfs:range xsd:string ;
    rdfs:comment "Reusable free-text elaboration slot for a disclosure question (the generic `details` / `comments` / `summary` tail). rdfs:comment-grade — NOT a domain entity and carries no identity criterion (ODR-0022 §Rules.1 Category A). The question being elaborated is carried by the subject node and the instance-level dct:source pointing at that question's schema leaf path; a per-question detail property is NEVER minted (ODR-0022 §Rules.6)."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0022/section-Rules-1> .
```

And the Category-E promotion — one class, instantiated per peril, with an activity-grounded IC — captured in the emitted comment:

```turtle
opda:RiskAssessment
    rdf:type owl:Class ;
    rdfs:subClassOf prov:Entity ;
    rdfs:comment "Per-peril authority-retrieved search / environmental result … UFO Information Object … IC (Rule 1b): individuated by the tuple ⟨generating activity (prov:wasGeneratedBy), source peril/dataset, subject property, generation time⟩ … One class instantiated per peril, NOT 12 subclasses and NOT 72 datatype properties."@en ;
    dct:source <https://opda.org.uk/pdtf/harness/odr/ODR-0008d/section-Rule-1> .
```

The collapse is **ratified behind three enforceable gates** that convert the Devil's-Advocate completeness dissent into acceptance criteria, not a veto: **G1** path-aware binning (must place `priceInformation.price` in G but `fixturesAndFittings.*.price` in D — name-only rules mis-bin permanently); **G2** `dct:source` to the *schema leaf path*, not the deciding ODR; **G3** coverage-by-test (BASPI5 round-trip on the collapsed TBox + a worked SPARQL retrieval). Net effect: ~5 patterns + ~56 schemes + ~2 classes replace ~750 flat properties, and the expensive WG operation shrinks ~80% — *"mint two plainly-named terms, write two `rdfs:comment`s, stop."* ✅

---

## 7. Controlled vocabularies — SKOS schemes as a first-class layer

Every reused enum becomes a `skos:ConceptScheme`, but in a **dedicated `opda-v:` prefix** (`https://opda.org.uk/pdtf/scheme/`) so the vocabulary layer is cleanly separable from the term layer. **46 schemes / 304 concepts** are emitted. Each scheme is annotated with a **steward** and an explicit **UFO meta-category**, and each concept traces to a regulator or schema leaf via `dct:source`:

```turtle
opda-v:EvidenceMethodScheme
    rdf:type skos:ConceptScheme ;
    skos:prefLabel "Evidence Method"@en ;
    dct:source <https://openid.net/specs/openid-connect-4-identity-assurance-1_0.html> ;   # OIDC4IDA
    opda:ufoCategory "Quality Value" .

<https://opda.org.uk/pdtf/scheme/evidenceMethod/Document>
    rdf:type skos:Concept ;
    skos:prefLabel "Document"@en ;
    skos:definition "OIDC4IDA Document evidence: identity evidence obtained by inspecting a physical or digital identity document (passport, driving licence, identity card, etc.)."@en ;
    dct:source <https://openid.net/specs/openid-connect-4-identity-assurance-1_0.html> ;
    skos:inScheme opda-v:EvidenceMethodScheme ;
    skos:notation "Document" .
```

The `YesNoScheme` is the form-ergonomics collapse made visible in one place — its own scope note records *"Used by ~276 BASPI5 discriminator questions; emitted as a shared scheme per ODR-0011 §1a one-scheme-per-enum discipline."* One scheme, ~276 reuse sites; the alternative was ~276 boolean form-slot properties. ✅

---

## 8. Bounded contexts & DDD (ODR-0019 / ODR-0020) — a form IS a DCAP

The UK transaction is modelled as DDD **bounded contexts**, with PDTF as their **Published Language**. Two representation questions were settled 7-0 across two council rounds:

1. **Contexts are a SKOS scheme, never a namespace.** Because a single entity (`opda:Address`) belongs to *many* contexts and an IRI inhabits exactly one namespace string, per-context namespaces would force duplication or the forbidden `owl:sameAs`. So the six industry contexts ship as a `skos:ConceptScheme` (anti-rigid, perspectival — *not* `owl:Class`):

```turtle
opda:BoundedContextScheme
    rdf:type skos:ConceptScheme ;
    rdfs:label "PDTF Bounded Contexts"@en ;
    skos:definition "The six industry bounded contexts of the UK PDTF, each owning a SHACL overlay profile (ODR-0010). … "@en .

opda:ConveyancingContext
    rdf:type skos:Concept ;
    skos:prefLabel "Conveyancing"@en ;
    skos:definition "Legal transfer of estate; overlays ta6/ta7/ta10/lpe1."@en ;
    skos:inScheme opda:BoundedContextScheme ;
    opda:hasSteward "Law Society; SRA; CLC; Society of Licensed Conveyancers; CILEx; CILEx Regulation."@en .
```

The six emitted contexts are **EstateAgency** (baspi5/nts2), **Conveyancing** (ta6/ta7/ta10/lpe1), **MortgageLending** (fme1), **Surveying** (piq), **PropertyDataServices** (con29R/con29DW/llc1/oc1/rds/sr24), and **PropertyTechnology** (the spanning orchestration layer). Upstream conformist authorities (HM Land Registry, Local Authority, MHCLG Material Information, DSIT/DIATF Identity, W3C Trust & VCs) are **not** members — they are linked via `opda:consumesFrom` (`rdfs:subPropertyOf prov:wasInfluencedBy`), the DDD *Conformist* relationship.

2. **Membership is a derived, on-demand query — never materialised.** The overlay a payload arrives through *is* its context, so `term → context` is derived from the SHACL profiles (the single source of truth), never hand-authored. The final S022 decision goes further: **no `opda:servesContext` / `opda:overlaysContext` / `opda:definedInContext` predicates are emitted at all** — membership is computed when asked. A bespoke `opda:definedInContext` predicate was minted and then **retired** when the council found it reinvented `rdfs:isDefinedBy` + `dct:source` + `dct:subject`.

This yields the initiative's sharpest conceptual reframing, recorded in [[opda-odr-format-vs-skills]]'s lineage and the synthesis: **a PDTF form *is* a DCMI Application Profile (DCAP)** — its SHACL overlay shapes are its Description Set Profile, and the data dictionary is a DCTAP. Homonyms (e.g. *charge*: `opda:LegalCharge` vs `opda:LocalLandCharge`) are disambiguated by **distinct local names in the one namespace** under an identity-criterion test — never by a distinct namespace, and never with `owl:sameAs`. ✅

---

## 9. Generator inputs — the data dictionary and business glossary

The generator's authoritative *input* is not the raw 37,224-line schema but two curated artefacts:

- **The data dictionary** (`data-dictionary-canonical.json`) — **1,557 unique leaves** across 8,458 path entries, **935 annotated**. This is the leaf inventory the A–G binner walks; each emitted term's `dct:source` points back to its **schema leaf path** (the G2 gate), e.g. `…/harness/data-dictionary/propertyPack.typeOfConstruction.buildingSafety.abilityToResideAtProperty`.
- **The business glossary** (`business-glossary.ttl`) — **54 terms** (trust-framework / VC / eIDAS vocabulary: Claim, Issuer, Holder, Verifier, Trust Framework). It supplies term semantics under the 5-line precedence (W3C spec > OPDA Trust Framework > glossary > schema text > regulator). It does **not** define the descriptive properties — their meaning is the schema `title` — which is exactly why the descriptive collapse leans on `dct:source`-to-leaf rather than glossary lookup.

Together these are the generator inputs the forward vision turns into JSON Schema / APIs / DDL / forms / UI / docs (🔵 — vision; what exists today is the byte-identity-gated TTL plus SPARQL-rendered entity pages). ✅ inputs · 🔵 downstream generation.

---

## Built vs planned

| Capability | State | Evidence |
|---|---|---|
| Six concern-modules, each `owl:imports` the one flat ontology | ✅ | `opda-{property,agent,transaction,claim,descriptive,governance}.ttl` — all import `https://opda.org.uk/pdtf/` |
| Three-class identity split (`Property`/`LegalEstate`/`RegisteredTitle`) with distinct ICs | ✅ | `opda-property.ttl`; [ODR-0005](../ontology/odr/ODR-0005-property-land-identity-crux.md) |
| UPRN as contingent identifier; `owl:sameAs` forbidden; `dash:uniqueValueForClass` + SHACL-AF succession | ✅ | `opda-property-shapes.ttl` / `opda-shapes.ttl`; ODR-0005 §6a |
| Transaction Relator + Milestones + dual-modelled Chain | ✅ | `opda-transaction.ttl`; [ODR-0007](../ontology/odr/ODR-0007-transactions-and-lifecycle.md) |
| PROV-O claim/evidence backbone + eIDAS assurance layer | ✅ | `opda-claim.ttl`; [ODR-0009](../ontology/odr/ODR-0009-claims-evidence-provenance.md) |
| Evidence as RoleMixin + value-keyed `opda:evidenceType` (no subclass tree) | ✅ | `opda-claim.ttl`; ODR-0027 |
| Agent Kinds + anti-rigid roles + capacity/authority split | ✅ | `opda-agent.ttl`; [ODR-0006](../ontology/odr/ODR-0006-agents-and-roles.md) |
| Descriptive A–G collapse (~5 patterns + ~56 schemes + ~2 classes vs ~900 flat props) | ✅ | `opda-descriptive.ttl`; [ODR-0022](../ontology/odr/ODR-0022-descriptive-layer-import-strategy.md), ODR-0008d |
| Bounded contexts as SKOS scheme; membership derived/never materialised | ✅ | `opda-contexts.ttl`; [ODR-0019](../ontology/odr/ODR-0019-bounded-context-representation.md), ODR-0020 |
| DPV/PII mapping records + special-category scheme (reference-not-import) | ✅ | `opda-governance.ttl`; ODR-0012/0018 |
| 47 SKOS schemes / 308 concepts under the `opda-v:` prefix, stewarded + UFO-typed | ✅ | `opda-vocabularies.ttl` |
| **Emitted counts: 40 class · 226 datatype-prop · 30 object-prop · 90 NodeShape** | ✅ | direct grep of emitted TTL (this pass) |
| ODRL permission/consent **policy instances** (machine-readable authorisation) | 🔵 | zero `odrl:` triples; Phase-2 layer over the role/authority substrate |
| W3C Verifiable Credentials / DID activation | 🔵 | ODR-0016 — fires on a real wallet/DID consumer |
| Model-driven downstream generation (JSON Schema / API / DDL / forms / UI) | 🔵 | vision; today = byte-identity TTL + SPARQL-rendered pages |
| `rdfs:isDefinedBy` module-of-origin axis populated | 🟡 | reserved/"always-emitted module hygiene"; currently 0× in corpus |

**Count reconciliation (honest):** the synthesis and fact-sheet quote **41 `owl:Class`**; a byte-exact `rdf:type owl:Class` dedup across the six modules + `opda-classes.ttl` this pass returns **40** distinct class subjects (the figure is sensitive to whether `opda:Evidence`'s dual `owl:Class, opda:RoleMixin` typing and the `rdfs:subClassOf skos:ConceptScheme` scheme-classes are counted). `226` datatype-properties, `30` object-properties, `47` schemes and `90` NodeShapes (52 module + 38 profile) reproduce exactly. Treat 40/41 as "~40"; do not over-precision it in slides.

---

## Talking points for the quarterly tech review

*(Audience: mixed senior decision-makers + data/technical leads, immediately after the v3.6 approval — "data schema feedback & next steps.")*

- **"JSON Schema names slots; it cannot say what has identity."** PDTF v3's single implicit property is a UPRN floating across four fields with **zero joins**. We split it into three precisely-distinguished things (physical property, legal estate, registry record), each with a stated identity criterion — and the split is *checkable* (duplicate-UPRN fires a SHACL violation; a missing UPRN degrades gracefully; the new-build case the JSON schema cannot express now has a coherent answer). This is the foundation under "fixing the data foundations."
- **The AI did not transliterate — it exercised restraint.** Of ~1,493 annotated leaves, ~88% are form-ergonomics (`yesNo` recurs ~1,135×). We collapsed them into ~5 reusable patterns + ~56 controlled vocabularies + ~2 classes instead of ~900 throwaway IRIs — and ratified that collapse behind three enforceable gates (path-aware binning, leaf-path provenance, round-trip-by-test). The expensive human-WG operation shrank ~80%.
- **Each statutory form is a DCMI Application Profile.** BASPI5, TA6, CON29, LPE1 become **SHACL overlay profiles** over **one** governed model; the data dictionary is a DCTAP. "PDFs → APIs" and "consent-based APIs" both want one machine-validated model that every system can dereference — that is exactly what this is.
- **Trust is modelled, not asserted.** Claims ride a PROV-O backbone with an eIDAS assurance layer; evidence is a *role a document plays* (value-keyed SHACL, not a class hierarchy); a seller's *asserted capacity* is cleanly separated from *evidenced authority* (probate, power of attorney). This is the substrate the lenders/gov constituency cares about — and the on-ramp to W3C Verifiable Credentials.
- **Honest roadmap, not gaps.** Two things we say plainly: machine-readable **authorisation policies (ODRL)** are adopted-but-deferred (we built the role/authority *substrate*, zero `odrl:` triples yet); and **OWL reasoning is real but shallow today** (flat hierarchy — only RDFS subclass entailment fires). Both are phased, defensible, and recorded.
- **Governed and reproducible.** ~40 classes / 226 datatype-properties / 90 SHACL shapes, every term tracing via `dct:source` to a schema leaf, glossary row, ODR section or regulator; emitted by a deterministic generator under a byte-identity CI gate; adjudicated by ~28 citable Ontology Decision Records and ~37 AI-council sessions with a human directing authority. This is a standard the ecosystem can extend, not a slide-deck model.

---

## Source files

**Emitted ontology (verified this pass — `source/03-standards/ontology/`):**
- `foundation.ttl`, `opda-classes.ttl` — ontology header, six foundation classes, three UFO meta-classes (`Relator`/`Role`/`RoleMixin`), `ValidationContext`, PII-floor predicates.
- `opda-property.ttl`, `opda-agent.ttl`, `opda-transaction.ttl`, `opda-claim.ttl`, `opda-descriptive.ttl`, `opda-governance.ttl` — the six concern-modules.
- `opda-contexts.ttl` — `BoundedContextScheme` (six concepts) + `consumesFrom`.
- `opda-vocabularies.ttl` — 47 SKOS schemes / 308 concepts under `opda-v:` (`https://opda.org.uk/pdtf/scheme/`).
- `opda-*-shapes.ttl` + `opda-shapes.ttl` + `profiles/*.ttl` — 90 SHACL NodeShapes (52 module + 38 profile); `exemplars/*.ttl` — diagnostic exemplars / CI regressions.

**Decision records (`docs/ontology/odr/`):**
- [ODR-0004](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md) (foundation / namespace / three-graph separation), [ODR-0005](../ontology/odr/ODR-0005-property-land-identity-crux.md) (the identity crux), [ODR-0006](../ontology/odr/ODR-0006-agents-and-roles.md) (agents & roles), [ODR-0007](../ontology/odr/ODR-0007-transactions-and-lifecycle.md) (transactions & lifecycle), [ODR-0008](../ontology/odr/ODR-0008-property-descriptive-attributes.md) + [ODR-0008d](../ontology/odr/ODR-0008d-authority-retrieved-artefacts.md) (descriptive attributes / authority-retrieved artefacts), [ODR-0009](../ontology/odr/ODR-0009-claims-evidence-provenance.md) (claims/evidence/provenance), [ODR-0019](../ontology/odr/ODR-0019-bounded-context-representation.md) + [ODR-0020](../ontology/odr/ODR-0020-bounded-context-scheme-and-mapping.md) (bounded contexts), [ODR-0022](../ontology/odr/ODR-0022-descriptive-layer-import-strategy.md) (descriptive import strategy), [ODR-0027](../ontology/odr/ODR-0027-classification-roles-inheritance-skos-doctrine.md) (classification over inheritance).

**Knowledgebase cross-references:** seed docs `_research-synthesis.md` / `_external-research.md` / `_fact-sheet.md`; standards depth (eIDAS / OIDC4IDA / VC) → KB doc 03; agent/role depth → KB doc 05.

**Generator (`tools/opda-gen/`):** `src/opda_gen/emitters/modules/{property,agent,transaction,claim,governance,descriptive}` (per-concern emitters); `src/opda_gen/ci/` (the CI gates incl. byte-identity).
