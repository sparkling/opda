# Session 008 — Working notes: Guizzardi + Baker

> Two voices. **Giancarlo Guizzardi** (NEMO / UniLu — UFO; OntoUML; Kind/Role/Phase/Relator; Quale-in-Region; Mode) and **Tom Baker** (DCMI; Dublin Core; SKOS governance; reference-not-import ratification in ODR-0002 §Reference-not-import). The two voices align more than they split: where Guizzardi supplies the meta-category, Baker supplies the catalogue discipline that operationalises it. The vote columns mark separate signatures.

Inputs read: [ODR-0008](../../../ODR-0008-property-descriptive-attributes.md) (stub) · [ODR-0005 §2a/§3a/§3b/§3c](../../../ODR-0005-property-land-identity-crux.md) (3-class commitment) · [ODR-0011 §8a](../../../ODR-0011-enumeration-vocabularies.md) (seven-category UFO framework) · [ODR-0002](../../../ODR-0002-ontology-language-adoption.md) (catalogue + `### Reference-not-import (normative)`) · [ODR-0004 §7a / §8a](../../../ODR-0004-pdtf-ontology-foundation.md) (five-line term-sourcing + exemplar pairing) · [council-followup-sessions.md §S008](../../../../plan/council-followup-sessions.md#session-008--odr-0008-property-descriptive-attributes) · [data-dictionary.md](../../../../../source/00-deliverables/semantic-models/data-dictionary.md) (1,556 unique leaves; 935 annotated).

S005's 3-class cardinality is now operationally crystallised across S006/S007/S009/S010/S013 (cite: [adoption track record](../../adoption.md#track-record)); the descriptive layer can attach Modes/Qualities to real Kinds.

---

## Q1 — Spanning-leaf threshold N

**Framing.** Spanning leaves recur across overlays (e.g. `propertyPack` ×18; `energyEfficiency`/`heating`/`typeOfConstruction`/`listingAndConservation` ×9; `mainsWater`/`drainage`/`electricity` ×9–10). At what count N does a leaf earn `opda:` declaration as a Module-level attribute rather than overlay-local synonym?

**Guizzardi.** N is a red herring. The ontological cut is not frequency; it is intrinsic-property-of-Property vs Mode-particularising-context. A leaf describing the physical building (e.g. `builtForm`, `constructionType`, `yearOfBuild`) is an intrinsic Quality of `opda:Property` (Guizzardi 2005 Ch. 4 — Quality / Quale-in-Region taxonomy). A leaf describing a context-specific judgement (e.g. `marketingTenure`, `priceQualifier`, `riskIndicator`) is a Mode existentially-dependent on a Relator (sales engagement, valuation episode) — UFO Mode per Guizzardi 2005 §6.2. A leaf that appears in *one* overlay but expresses an intrinsic Property quality still warrants a single `opda:` declaration; a leaf that appears in *eighteen* overlays but expresses an episode-particular judgement should be authored as a Mode in the relevant module (S007 Transaction; S009 ValuationActivity), not collapsed into Property attributes. The frequency table is a sorting aid for drafting order — not the cut itself.

**Baker.** Endorse Guizzardi's cut and add catalogue hygiene: every reconciled `opda:` property MUST carry a `skos:scopeNote` (or equivalent `rdfs:comment`) that distinguishes the context-of-use. DCMI Usage Board discipline (Baker, Bechhofer, Isaac, Miles 2013, *DCMI Usage Board Process and Tools*): one definition is non-negotiable; multiple contexts-of-use are recorded as scope notes, never as parallel definitions. This converts S001 Q3's "form ergonomics is not ontology" rule into a sourceable artefact: spanning leaves get one `opda:` term + N scope notes (one per overlay where the leaf surfaces with material context variation), each with `dct:source` per [ODR-0004 §7a](../../../ODR-0004-pdtf-ontology-foundation.md#7a-term-sourcing--five-line-precedence--conflict-recording-protocol-s004-q4). Frequency is not the trigger; presence of material context variation across overlays is.

| Voice | Vote |
|---|---|
| Guizzardi | **FOR** — reject N-as-threshold; adopt intrinsic-vs-Mode cut |
| Baker | **FOR** — couple with scope-note-per-context-variation discipline |

---

## Q2 — Sub-module split

**Framing.** ODR-0008 stub flags sub-module candidates (built-form / energy / searches / encumbrances). When should the module split, and on what axis?

**Guizzardi.** Split by UFO meta-category, not by domain bucket. Three natural sub-modules fall out of S005's 3-class + S011 §8a seven-category framework:

| Sub-module | UFO meta-category | Example leaves | Attaches to |
|---|---|---|---|
| `opda:property-qualities` | UFO Quality / Quale-in-Region (Guizzardi 2005 Ch. 4; Masolo et al. 2003 D18 §4.3) | `currentEnergyRating` (EPC band A-G); `councilTaxBand`; `builtForm`; `internalArea`/`area` | `opda:Property` (physical Substance Kind) |
| `opda:property-modes` | UFO Mode (Guizzardi 2005 §6.2) — existentially-dependent particulars | `marketingTenure`; `priceQualifier`; `valuationComparisonData`; `listingType`; `confidenceBand` | A Relator (sales engagement; valuation episode) — NOT `opda:Property` directly |
| `opda:legal-estate-attributes` | UFO Substance-Kind-borne attributes per S005 §3b | `tenureKind` (Freehold/Leasehold/Commonhold); `lengthOfLeaseInYears`; `annualGroundRent`; restriction codes | `opda:LegalEstate` |

Search/encumbrance leaves split across the three by their UFO commitment: a `localLandCharge` is a Mode inhering in `opda:LegalEstate` (it constrains the rights-bundle); `floodRisk` is a Quality of `opda:Property` (physical-extent-derived); `councilTax` annual charge is a Mode inhering in a Council-tax Relator (which is itself a Relator between Property and local authority — provisionally; OWL-Time interval on the assessment-period side).

**Baker.** Endorse Guizzardi's UFO-axis split and add governance discipline: each sub-module needs a **named steward** per [ODR-0011 §1a](../../../ODR-0011-enumeration-vocabularies.md#1a-every-json-enum-becomes-a-skosconceptscheme--steward-declaration-s011-q1) precedent (FIBO precedent — one named expert with deputy; DCMI Usage Board precedent). Without per-sub-module stewardship the descriptive layer fractures the same way `propertyPack` fractured — three parallel authoring centres with no resolution authority for cross-sub-module synonymy. Steward proposals (Baker indicative; module-owner-proposes per [ODR-0002 §Profile-pinning ownership](../../../ODR-0002-ontology-language-adoption.md#profile-pinning-ownership)): Allemang on property-qualities (his S008 Queen role makes this natural); Guizzardi or Pandit on property-modes (Modes route through Pandit's PII-trigger work in [ODR-0012](../../../ODR-0012-data-governance-layer.md)); Kendall on legal-estate-attributes (FIBO experience).

**Note on deferral.** ODR-0008 is currently DEFERRED per S005 §8a until cardinality crystallises. With S006/S007/S009/S010/S013 now closed, the cardinality landing is operational. This session can ratify the sub-module *axis* even if individual sub-modules wait on the 935-leaf-to-class mapping work.

| Voice | Vote |
|---|---|
| Guizzardi | **FOR** — three sub-modules split by UFO meta-category (Quality / Mode / Substance-Kind-attribute) |
| Baker | **FOR** — provided each sub-module declares a named steward at first commit |

---

## Q3 — Data dictionary citation grain

**Framing.** Per-property vs per-class vs per-module `dct:source` — at what granularity does the citation to `data-dictionary.md` land?

**Guizzardi.** Per-property `dct:source` is the only granularity that survives the UFO Quality / Mode split. A class-level citation collapses the Quality-vs-Mode distinction (the leaf, not the class, carries the UFO commitment). [ODR-0004 §7a](../../../ODR-0004-pdtf-ontology-foundation.md#7a-term-sourcing--five-line-precedence--conflict-recording-protocol-s004-q4) already settled this for terms; spanning leaves inherit the same discipline — the differing per-overlay `dct:source` references attach to the single `opda:` property (ODR-0008 stub §Rules / Cross-context reconciliation).

**Baker.** Per-property `dct:source` per ODR-0004 §7a is the right primary citation. DCMI adds a second-layer pattern: **describe-an-attribute-by-its-source-record**. Each `opda:` property carries `dct:source` to the canonical leaf path; for spanning leaves, *also* carry `dct:source` to each overlay leaf where the property surfaces with material context variation (an array, not a single value). This makes the cross-overlay reconciliation auditable in two directions — one cited canonical source per term (the data-dictionary `pdtf-transaction.json` leaf) + N cited per-overlay sources for the contexts the term spans. Lossless audit, mechanical regeneration from the dictionary preserved per [ODR-0004 §6a](../../../ODR-0004-pdtf-ontology-foundation.md#6a-generator-first--deterministic-emission--byte-identity-ci-s004-q5).

| Voice | Vote |
|---|---|
| Guizzardi | **FOR** — per-property citation; class-level would collapse the Quality/Mode split |
| Baker | **FOR** — primary citation per-property + array of per-overlay sources for spanning leaves |

---

## Q4 — Granularity floor (when does a leaf become a Class, not a property?)

**Framing.** When does a structured leaf (e.g. `building`, `rooms`, `localAuthoritySearches`, `valuations`) earn its own `opda:` Class rather than remain a structured `opda:DatatypeProperty`?

**Guizzardi.** A leaf becomes a Class when it bears its **own UFO Kind/Sortal IC**. Two clean cases drop out of the dictionary:

1. **Physical Kinds with their own ICs.** `Building` (sub-structure of a Property — a built structure may persist when Property identity changes per S005 §3a hard-case 4 "Replacement"); `Room` (sub-structure of Building with its own spatial-material IC). Both are Substance Kinds per UFO; both inherit the spatial-material continuity discipline from S005 (Guizzardi 2005 Ch. 4). Cite to OS AddressBase sub-UPRN guidance for `Building`; cite to IFC building-element taxonomy or LANDMAP for `Room`.

2. **Informational Kinds with `prov:wasDerivedFrom` lineage.** `Survey` and `Search` are informational Substance Kinds (NonPhysicalEndurant; Masolo et al. 2003 D18 §4.2) — each survey/search is an individual record with its own lifecycle, its own date, its own author, its own derivation chain from underlying source data. `Survey1 prov:wasDerivedFrom InspectionVisit1 prov:wasGeneratedBy SurveyActivity1`. Same `dct:source` discipline as S005 §3c for RegisteredTitle: title-lifecycle events captured as reified `prov:Activity` per Cagle's S005 Q4 amendment.

`Valuation` and `Comparable` (from `valuationComparisonData`) similarly earn class status — each is an informational record. `LocalAuthoritySearch` becomes a class; the search *results* (a CON29R record) is a structured datatype on the class. Single-shot leaves with no internal lifecycle (`yearOfBuild`, `internalArea`) stay datatype properties.

**Baker.** Endorse Guizzardi's UFO Kind/IC test and add the DCMI counterpart: a leaf becomes a Class when **the substructure has its own `skos:prefLabel` and definition source**. The Survey example holds: a Survey has a `prefLabel` ("Homebuyer Report"), a `definition` (RICS-published), a `notation` ("Level 2"), and a `dct:source` to the regulator. That same triad applies to `Comparable`, `LocalAuthoritySearch`, `Valuation`, `Building`, `Room`. Leaves like `yearOfBuild` carry a `prefLabel` for the *attribute* but not for any substructure — the attribute is the terminus. The two tests (UFO IC + DCMI prefLabel-bearing substructure) coincide cleanly in the cases the dictionary surfaces.

Single load-bearing caveat from DCMI's domain-narrowing experience (DCMI 2008 Singapore Framework + Nilsson, Baker, Johnston *Description Set Profiles* — cite [ODR-0002 §Profile-pinning ownership](../../../ODR-0002-ontology-language-adoption.md#profile-pinning-ownership)): minting a Class is asymmetric — the URI is permanent and downstream consumers will dereference. Default should be `xsd:` datatype property + `sh:datatype` constraint; class-mint is the reasoned move when both tests fire.

| Voice | Vote |
|---|---|
| Guizzardi | **FOR** — class when leaf bears its own UFO Kind/Sortal IC (Building, Room, Survey, Search, Valuation, Comparable) |
| Baker | **FOR** — coupled with DCMI test (substructure has its own `prefLabel` + definition source); default to datatype property |

---

## Q5 — Datatype vs SKOS scheme (category-like attributes)

**Framing.** Some leaves are categorical (`builtForm` ∈ {Detached, Semi-detached, ...}; `currentEnergyRating` ∈ {A...G}); some are bounded strings (`emailAddress`); some are open strings (`description`). When is SKOS the right model vs `xsd:string + sh:pattern`?

**Guizzardi.** This is exactly what [ODR-0011 §8a](../../../ODR-0011-enumeration-vocabularies.md#8a-ufo-meta-category-per-scheme--seven-category-framework-s011-q8--b3-pilot-typed-output) seven-category framework adjudicates — and the ODR-0008 stub already delegates ("Descriptive enumerations are SKOS concept schemes owned by ODR-0011"). The framework binds:

| ODR-0008 leaf | UFO category (ODR-0011 §8a) | SHACL targeting |
|---|---|---|
| `currentEnergyRating` (A-G) | **Quale-in-Region** | banded; Quality of `opda:Property` |
| `councilTaxBand` (A-I) | **Quale-in-Region** | banded; Quality of `opda:Property` |
| `builtForm` (Detached / Semi / Mid-terrace / End-terrace / Other) | **Quale-in-Region** | Quality of `opda:Property` |
| `ownershipType` (Freehold / Commonhold / Leasehold / Other) | **Quale-in-Region** | LegalEstate's ownership-structure quale |
| `tenureKind` (Freehold / Leasehold / Commonhold) | **Substance Kind label** | sub-Kind via `skos:exactMatch` (NEVER `owl:sameAs` per ODR-0005 Anti-pattern §5) |
| `centralHeatingFuelType` (Mains gas / Electricity / Oil / LPG / Biomass / Other) | **Quale-in-Region** (open-ended; "Other" is the open-extension marker) | Quality of `opda:Property`'s heating system |
| `heatingType` (Central / Communal / Room-only / None) | **Quale-in-Region** | Quality of `opda:Property` |
| `priceQualifier`, `marketingTenure` | **Mode** (Quality Value per §8a, particularising a sales-engagement Relator) | Quality Value of the listing Relator (S007 territory) |

All categorical schemes become SKOS per ODR-0011 — no debate; the framework is settled. ODR-0008's contribution is the *per-leaf table* above (or its extension), not re-litigation of the SKOS-vs-bare-string question.

**Baker.** Endorse the ODR-0011 binding and add the DCMI cut for *non*-categorical leaves: SKOS is for closed sets with cross-vocabulary mapping potential (`skos:exactMatch` to a regulator's published list — e.g. EPC bands to BEIS published register; council-tax bands to VOA published register per ODR-0011 §4a verbatim-citation discipline). `xsd:string + sh:pattern` is for one-shot strings with format constraints but no semantics — `emailAddress` (`xsd:string` + email pattern); `postcode` (`xsd:string` + UK postcode pattern); `notation` strings like HMLR `classOfTitleCode` (`xsd:string + sh:pattern "^[1-9][0-9]$"` per [ODR-0011 §7a](../../../ODR-0011-enumeration-vocabularies.md#7a-notation-typing--xsdstring--shpattern-default-s011-q7)). Truly free text (`description`, `summary`, `additionalAssumptions`) stays plain `xsd:string` with no constraint — describing intent in a SHACL pattern adds nothing.

The DCMI test: does the value-space have an external authoritative list against which OPDA's scheme would map (`skos:exactMatch`)? If yes → SKOS. If the value-space is a regex over a lexical surface with no semantics → `xsd:string` + `sh:pattern`. If neither → plain `xsd:string`.

| Voice | Vote |
|---|---|
| Guizzardi | **FOR** — per-scheme UFO category per ODR-0011 §8a; ODR-0008 inherits, does not re-litigate |
| Baker | **FOR** — SKOS for closed sets with cross-vocabulary mapping potential; `xsd:string + sh:pattern` for one-shot lexical surfaces; plain `xsd:string` for free text |

---

## Q6 — Sub-property hierarchies (`rdfs:subPropertyOf`)

**Framing.** Should descriptive properties form hierarchies (e.g. `opda:heatingFuelType rdfs:subPropertyOf opda:fuelType`; `opda:bedrooms rdfs:subPropertyOf opda:roomCount`)?

**Guizzardi.** Hierarchies should reflect **part-whole or specialisation relationships, not just naming convenience**. A sub-property assertion has semantic teeth — under OWL it propagates inferences (every `heatingFuelType` triple becomes a `fuelType` triple). The justified cases drop out of UFO:

1. **Specialisation of a Quality region.** `opda:currentEnergyRating` is a specialisation of a general `opda:energyRating` Quality? Only if `opda:energyRating` is a real abstract concept some downstream consumer queries over — otherwise the parent is invented machinery (Allemang's S001 push-back applies). The seven-category framework does NOT manufacture parent-Qualities for taxonomic neatness.

2. **Part-of via OBO-RO-style mereology** (deferred per [ODR-0002 §Change log row 2026-05-27 Q11](../../../ODR-0002-ontology-language-adoption.md#change-log) — Kendall + Guizzardi joint position to ratify CONDITIONAL admission was held-as-live; routing to S005 IC discipline). For descriptive attributes, hierarchies expressing "this room is part of this building" are part-whole relations between Class instances, NOT `rdfs:subPropertyOf` between properties.

In short: NO general sub-property hierarchies in ODR-0008 by default; per-case justification required, citing the consumer query the hierarchy enables.

**Baker.** Endorse Guizzardi's conservatism on `rdfs:subPropertyOf` and translate to SKOS where applicable: SKOS `skos:broader`/`skos:narrower` is the hierarchical machinery for value-space concepts (`fttp skos:broader fibre skos:broader fixed-line-broadband` per ODR-0011 §Rules). For *predicates* (datatype/object properties), DPV's discipline applies — DPV deliberately avoids deep `rdfs:subPropertyOf` chains, expressing hierarchical refinement through DPV's class-level taxonomy + property re-use (Pandit, Polleres 2019 *DPV documentation* §Property-design). OPDA inherits this discipline: SKOS hierarchy for value-spaces (per [ODR-0011 §Rules](../../../ODR-0011-enumeration-vocabularies.md) — broadband `typeOfConnection`, transport `transportType`); flat predicates with named-scope-note distinguishing sibling predicates (e.g. `opda:internalArea` vs `opda:grossExternalArea` — two sibling predicates with scope notes citing IPMS 2 / IPMS 3 respectively; NOT one parent + two children).

| Voice | Vote |
|---|---|
| Guizzardi | **FOR** — `rdfs:subPropertyOf` only for genuine part-whole or specialisation; no neatness hierarchies |
| Baker | **FOR** — SKOS broader/narrower for value-spaces; flat predicates with scope-notes for predicate siblings (DPV discipline) |

---

## Q7 — Overlay-form variation

**Framing.** Same `opda:` property surfaces in multiple overlays with per-form variation (some forms require it, some don't; some constrain to subset enum members, some don't). Where does the variation live?

**Guizzardi.** ODR-0008 stub §Rules already commits the answer: "per-form required/enum variation MUST be authored as SHACL profile shapes ([ODR-0010](../../../ODR-0010-overlay-profile-mechanism.md))". Reaffirm — variation is shapes-graph (closed-world constraint), not class-graph (open-world semantics). Anything else fractures spanning concepts back into per-form synonyms (the S001 Q3 defect). The `opda:` term carries the UFO Quality / Mode commitment universally; overlay profiles attach `sh:minCount`/`sh:in` per-form.

**Baker.** Endorse the routing to ODR-0010 and add the module-owner-proposes rule from [ODR-0002 §Profile-pinning ownership](../../../ODR-0002-ontology-language-adoption.md#profile-pinning-ownership) (the rule I authored at S002 Q5): ODR-0008's module steward(s) — per Q2 above — propose which overlays load each profile slice. ODR-0010 records (per-overlay profile artefact); ODR-0008 owns the underlying class graph and the spanning-leaf reconciliation table. Cross-module conflicts (e.g. BASPI5 requires `currentEnergyRating` `sh:minCount 1` for marketing whereas LPE1 doesn't) default to union per the catalogue rule — but here "union of pinned slices" cashes out as "each profile authors its own `sh:minCount`; the property is `0..1` in the base shapes graph; overlay sharpens to `1..1`". Standard SHACL profile composition.

Three-rule SHACL interface contract carried from [Scope-Check 1 Q6](../scope-check-1-programme.md) and ratified at [S010 Q8 / S013 Q7](../session-013-shacl-validation-and-severity.md): `sh:in` semantics; `sh:Violation` floor; no-identity-override gate — ODR-0008's overlay-variation handoff to ODR-0010 inherits all three.

| Voice | Vote |
|---|---|
| Guizzardi | **FOR** — variation in SHACL profile shapes (ODR-0010), never in class graph |
| Baker | **FOR** — module-owner-proposes per ODR-0002 §Profile-pinning ownership; union default for cross-module conflicts |

---

## Summary

| Question | Guizzardi | Baker |
|---|---|---|
| Q1 Spanning-leaf threshold N | FOR (reject N; intrinsic-vs-Mode cut) | FOR (scope-note-per-context discipline) |
| Q2 Sub-module split | FOR (three sub-modules by UFO meta-category) | FOR (named steward per sub-module) |
| Q3 Citation grain | FOR (per-property) | FOR (per-property + per-overlay array) |
| Q4 Granularity floor | FOR (UFO Kind/IC test → Building/Room/Survey/Search/Valuation as Classes) | FOR (DCMI prefLabel-bearing-substructure test; default datatype) |
| Q5 Datatype vs SKOS | FOR (inherit ODR-0011 §8a binding) | FOR (SKOS for cross-vocab-mappable; xsd:string + pattern for lexical; plain string for free text) |
| Q6 Sub-property hierarchies | FOR (conservative — only for genuine part-whole / specialisation) | FOR (SKOS broader/narrower for values; flat predicates + scope notes per DPV) |
| Q7 Overlay-form variation | FOR (route to ODR-0010 profile shapes) | FOR (module-owner-proposes; ODR-0010 records) |

**No held-as-live dissents between the two voices.** Where the cut is sharp (Q1, Q2, Q4) Guizzardi supplies the meta-category and Baker supplies the catalogue test that operationalises it; where the policy is already settled upstream (Q5, Q7) both voices endorse inheritance rather than re-litigation.

**Pre-commitments for downstream synthesis:**

- ODR-0008 §Decision should explicitly call out **three sub-modules by UFO meta-category** (Q2) — this is the operational delivery shape, not the stub's per-domain-bucket framing.
- ODR-0008 §Operational specifications (the A9 §Per-kind discipline §3a/§3b equivalents) should land the **per-leaf UFO category table** (Q5) extending the ODR-0011 §8a binding into ODR-0008's specific scope.
- ODR-0008 §References must cite the three-rule SHACL interface contract on the ODR-0010 side (Q7) — the cross-cite ratified at Scope-Check 1 Q6.
- The Q4 Building/Room/Survey/Search/Valuation/Comparable class-mint list is candidate `pattern`-extraction territory if downstream sessions (S015 follow-ups; ODR-0010 overlay catalogue) re-cite the UFO Kind/IC + DCMI prefLabel-substructure dual test (A9 §Artefact identity test fourth-citing-site threshold; spawn-rule per [ODR-0001](../../../ODR-0001-linked-data-council-methodology.md#what-an-odr-records-per-kind-discipline)).

**Cited published sources** (per ODR-0004 §7a five-line term-sourcing precedence):

- Guizzardi 2005 *Ontological Foundations for Conceptual Modeling with Applications* Ch. 4 / §6.2 (UFO Quality, Mode, Substance Kind taxonomy) — line 1 (W3C-equivalent foundational ontology source per OntoUML lineage).
- Masolo, Borgo, Gangemi, Guarino, Oltramari 2003 *WonderWeb Library D18* §4.2 / §4.3 (DOLCE NonPhysicalEndurant, Quality Region) — line 1.
- W3C SKOS Reference 2009 (Miles & Bechhofer eds.) §§S14 / S15 — line 1.
- DCMI Singapore Framework 2008 + Nilsson, Baker, Johnston *Description Set Profiles* (Pandit-cite via [ODR-0002 §Profile-pinning ownership](../../../ODR-0002-ontology-language-adoption.md#profile-pinning-ownership)) — line 1.
- Baker, Bechhofer, Isaac, Miles 2013 *DCMI Usage Board Process and Tools* — line 1.
- Pandit, Polleres 2019 *DPV documentation* §Property-design — line 1.
- [ODR-0011 §8a seven-category UFO framework](../../../ODR-0011-enumeration-vocabularies.md#8a-ufo-meta-category-per-scheme--seven-category-framework-s011-q8--b3-pilot-typed-output) (Council-authored SKOS-binding) — line 2 (OPDA-internal authoritative).
- [ODR-0005 §3a/§3b/§3c IC discipline](../../../ODR-0005-property-land-identity-crux.md) — line 2.
- [ODR-0004 §7a term-sourcing five-line precedence](../../../ODR-0004-pdtf-ontology-foundation.md#7a-term-sourcing--five-line-precedence--conflict-recording-protocol-s004-q4) — line 2.
- [ODR-0002 §Reference-not-import (normative)](../../../ODR-0002-ontology-language-adoption.md#reference-not-import-normative) — line 2.
