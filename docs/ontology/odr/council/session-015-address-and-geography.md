# Council Session 015 — Address & Geography (Phase 2.6 gate)

- **Date:** 2026-05-27
- **Record under review:** [ODR-0015 — Address & Geography](../ODR-0015-address-and-geography.md) (`kind: pattern`; A9 §Per-kind discipline (b) applies).
- **Queen / Moderator:** **Giancarlo Guizzardi** (UFO/OntoUML — Substance Kind / Role / Phase / Relator / Mode / Quale taxonomy). Per the ODR-0015 §Convening constraints, Queen is Guizzardi (UFO category framing decisive) or Gandon (URI architecture framing decisive); the convening resolves to Guizzardi because Q1 is the gate and UFO Substance-Kind-vs-Mode-vs-Quale is the decision Guizzardi's published methodology is the right authority for. Guizzardi sits inside the formal-pair (with Gandon) per ODR-0001's "Queen sits inside her standing-panel pair" rule.
- **Devil's Advocate:** Dean Allemang (TopQuadrant alumnus, *Working Ontologist* 3rd ed.). DA selected per ODR-0001 §Roles DA criterion: Allemang's published methodology pushes back hardest against UFO over-modelling on Address — his S005 Q6 framing was "Address-as-Mode is theoretical Guarino-purity that has no SHACL operationalisation"; he is the strongest credible opposition to the Kind reading.
- **Panel (2 teammates + DA + Queen; Reduced Council):**

  | Teammate | Voices | Position file |
  |---|---|---|
  | formal-pair | **Giancarlo Guizzardi (Queen)** + Fabien Gandon | [gandon-guizzardi.md](./session-015-address-and-geography/gandon-guizzardi.md) |
  | da-solo | **Dean Allemang (DA)** | [allemang-da.md](./session-015-address-and-geography/allemang-da.md) |

- **Input Documents:**
  - [ODR-0015 — Address & Geography](../ODR-0015-address-and-geography.md) (the stub; 8 questions; Reduced Council convening).
  - [ODR-0005 — Property & Land Identity Crux](../ODR-0005-property-land-identity-crux.md) — §6b routes Address modelling here with `opda:hasAddress` pre-committed; Baker+Pandit Q6 DPV-pattern constraint carried forward.
  - [ODR-0001 §What an ODR records (per-kind discipline)](../ODR-0001-linked-data-council-methodology.md) — A9 amendment landed 2026-05-27. For `kind: pattern` ODRs, `## Rules` MUST state (a) UFO/DOLCE meta-category, (b) IC over named hard cases, (c) artefact realisation. ODR-0015 is the *second* `kind: pattern` ODR to discharge under A9.
  - [ODR-0004 — PDTF Ontology Foundation](../ODR-0004-pdtf-ontology-foundation.md) §8a (exemplar discipline); §Rule 2 (layer-segregated naming).
  - [Session 001 transcript](./session-001-pdtf-schema-to-ontology.md) Q4 — Guarino's "address is a mode of presentation, not a bearer" framing (refined here as `opda:addressVariant` Quality on a Kind, not as a UFO Mode in the technical OntoUML sense).
  - [Scope-Check 1 transcript](./scope-check-1-programme.md) Q7a — the 8-1 spawn deliberation; Davis's withdraw-conditional position closest to Allemang DA's framing.
  - Diagnostic exemplars (per ODR-0004 §8a; authored 2026-05-27 between-session prep):
    - [`source/03-standards/ontology/exemplars/flat-no-uprn-newly-converted.ttl`](../../../../source/03-standards/ontology/exemplars/flat-no-uprn-newly-converted.ttl) — Address without UPRN; subdivision case.
    - [`source/03-standards/ontology/exemplars/listed-building-divergent-addresses.ttl`](../../../../source/03-standards/ontology/exemplars/listed-building-divergent-addresses.ttl) — three divergent address surfaces on one Property.
    - [`source/03-standards/ontology/exemplars/rural-plot-inspire-no-uprn.ttl`](../../../../source/03-standards/ontology/exemplars/rural-plot-inspire-no-uprn.ttl) — INSPIRE-only locatedness.
  - W3C / foundational: Guizzardi 2005 *Ontological Foundations* Ch. 4; DOLCE WonderWeb D18 §4.2; Searle 1995 *Construction of Social Reality*; SHACL Core 1.2; PROV-O Recommendation; INSPIRE Directive Annex I (Theme: Addresses); W3C vCard Ontology (Iannella & McKinney eds. 2014); OS *AddressBase Plus Technical Specification* §address lifecycle.
- **`consensus-mode`:** `agent-fan-out` with **two-artefact discipline** (narrative synthesis + structured per-question tally appendix). Per ODR-0005 §Consequences B2-pilot EXTEND-CAUTIOUSLY recommendation, S015 is the second pilot site for the two-artefact discipline; S011 Q8 is the third. Three-pilot threshold required for full EXPAND adoption.
- **Format tier:** **Reduced Council.** Phase 2.6 gate session; ~3 agent runs.

## Context

ODR-0015 was spawned by Scope-Check 1 Q7a (vote 8-1 mandatory) on grounds that Address is the most-reused entity in the PDTF v3 corpus (≥5 distinct contexts: property identification with UPRN/INSPIRE, participant contact, evidence-document issuer, chain transactions, EPC certificate) and that no current ODR declared it. Scope-Check 1 routed it out of S006/S008 into its own gate; ODR-0005 §6b pre-committed the join predicate (`opda:hasAddress`); S005 ratified the 3-class Property/LegalEstate/RegisteredTitle commitment that ODR-0015 inherits.

The session inherits a substantive substrate from the recently-ratified S005 (closed earlier 2026-05-27):

- **3-class Property commitment** — Address relates to `opda:Property` (the physical referent). `opda:LegalEstate` and `opda:RegisteredTitle` may bear their own address-flavour properties (e.g. the title-register's "location-of-land" descriptor), but the canonical Address resource attaches to Property.
- **`opda:hasAddress` predicate pre-committed** (ODR-0005 §6b) — whatever Address resource structure S015 ratifies, the join predicate is fixed.
- **DPV-pattern consideration constraint** (Baker+Pandit S005 Q6 amendment) — ODR-0015 MUST resolve the Address modelling with explicit PII-pattern consideration; whichever choice (Mode vs Resource) is made determines whether DPV co-annotations attach to mode-instances or to resource-instances.
- **A9 per-kind discipline operationally proven by S005** — the second `kind: pattern` ODR to discharge inherits the template (UFO/DOLCE category + IC over named hard cases + artefact realisation, all in `## Rules`).

The B2 pilot EXTEND-CAUTIOUSLY recommendation from S005 §Consequences applies: S015 uses the two-artefact discipline (narrative synthesis + structured tally), not the full `consensus-mode: hive-mind/byzantine` substrate. The pilot evaluates whether the structured tally adds value at a Reduced Council scale; if it does, S011 Q8 becomes the third confirmation and EXPAND (full adoption across all sessions) is on the table.

## Pre-flight scope check

Per ODR-0001 §Pre-flight scope check. Outcome: **ratify-as-is**.

- Coherent proposition (Address modelling; 8 named questions; `kind: pattern` discipline correctly applied per A9; gate before S006 and S008).
- No retire signal (Address is the most-reused entity in PDTF v3; the gate is load-bearing).
- No re-scope signal — the alternatives in §Alternatives (Address-in-Foundation per Davis; Address-routed-to-S006/S008) were rejected by Scope-Check 1 Q7a; we ratify the spawn decision by deliberating in this scope.
- A9 application: this ODR makes the inline UFO/IC commitments A9 requires for `kind: pattern`; the session discharges the gate at the per-kind discipline level.

## Question-by-question verdicts

### Q1 — UFO meta-category for `opda:Address` (the gate)

**Positions:**

- **Gandon+Guizzardi (Queen) ([gandon-guizzardi.md Q1](./session-015-address-and-geography/gandon-guizzardi.md#q1-—-ufo-meta-category-for-opdaaddress-the-gate)):** FOR `opda:Address` as **UFO Substance Kind / DOLCE NonPhysicalEndurant** — Sortal, Rigid, supplies own IC; `opda:addressVariant` property tags context-of-presentation as a UFO Quality particularising the instance within the Kind. **Revises the S005 Q6 Mode-only stance on exemplar evidence** (rural-plot-INSPIRE-only case decisive against pure Mode reading) + external-standards alignment (INSPIRE Annex I / vCard / OS AddressBase all model Address with resource identity). The Guarino S001 Q4 "mode of presentation, not a bearer" framing is preserved as the *semantic content* of the variant tag, not as the UFO meta-category.
- **Allemang DA ([allemang-da.md Q1](./session-015-address-and-geography/allemang-da.md#q1-—-ufo-meta-category)):** AGAINST Kind reading; FOR **Quale-in-a-Region** (structured datatype, no identity, no co-reference) OR Mode-as-tagged-literal-bundle. **Withdrawal conditions:** (a) named consumer query of the form "find all addresses where X" required by a real PDTF v3 BASPI5 consumer; OR (b) named SHACL validation case requiring `rdf:type opda:Address` discrimination.

**Verdict:** **2-1 FOR Kind** with Allemang DA's withdrawal conditions **MET** — the panel pair named five consumer queries that fail under structured-datatype, three of which match the DA's condition (a):

1. **DPV co-annotation query** ("Find all Addresses tagged `dpv-pd:Address` under `dpv:hasLawfulBasis dpv:PublicTask`"). Required by ODR-0012 DPV co-annotation pattern (Baker+Pandit S005 Q6 amendment carry).
2. **INSPIRE feature query** ("For Address A with `addressVariant 'inspire'`, return INSPIRE feature ID"). The INSPIRE Identifier is an Address-side identifier under Kind; collapses to a Property-side identifier under structured-datatype, conflating the spatial-feature pointer with the postal-locator.
3. **Authority-succession query** ("Trace this Address's lineage back through OS AddressBase row-replacements"). Under structured-datatype, succession is impossible — the literal has no graph identity to chain via PROV-O.

The DA's condition (b) is also met — DPV class-level annotations on `opda:Address` require `rdf:type opda:Address` to dispatch the annotation. Either condition is sufficient; multiple are met.

**Allemang DA status: WITHDRAWN on Q1.** Per the DA scorecard discipline (S005 pattern), the synthesis records withdrawal mechanically: "Allemang DA withdrew on Q1 on condition (a) met: three named consumer queries (DPV co-annotation; INSPIRE feature query; authority-succession) of the form 'find all addresses where X' required by real PDTF v3 BASPI5 / ODR-0012 consumers AND condition (b) met: DPV class-level annotation dispatch requires `rdf:type opda:Address` discrimination."

**Adopted:** `opda:Address` commits to UFO Substance Kind / DOLCE NonPhysicalEndurant; `opda:addressVariant` property tags context-of-presentation as UFO Quality within the Kind. The Guarino S001 Q4 framing is preserved as the variant tag's semantic content, not as the UFO meta-category.

### Q2 — Identity criterion for `opda:Address`

**Positions:**

- **Gandon+Guizzardi:** FOR five-rule IC — **structural composition + context-tag-scoped persistence**, over hard cases: (1) cosmetic re-format (same authority, same record-lineage, different presentation → same individual); (2) authority-internal succession (`prov:wasDerivedFrom` to predecessor); (3) cross-variant identity-claim (different `addressVariant` values never collapse, even on byte-identical structural fields); (4) Property-side change (subdivision/merger triggers new Address individuals per authority's lifecycle judgement); (5) INSPIRE-only locatedness (Property with INSPIRE Identifier but no postal address has one `opda:Address` instance with `addressVariant "inspire"`). DOLCE NonPhysicalEndurant grounding (Masolo et al. 2003 §4.2 + Searle 1995). Artefact-encoding requirement: IC stated as `rdfs:comment` on `opda:Address` with `dct:source` to ODR-0015; exemplars wired as CI regression tests per ODR-0004 §8a.
- **Allemang DA:** CONDITIONAL — AGAINST IC commitment unless Q1 = Kind. **Withdrawal condition for the Kind path:** five named hard cases discharged per A9 §(b).

**Verdict:** **2-1 FOR five-rule IC.** Allemang DA's Q2 conditional discharges by Q1 landing on Kind + the formal-pair providing five named hard cases (the count matching A9 §(b) minimum). The Kind verdict makes Q2 load-bearing; the five hard cases meet the discipline.

**Allemang DA status: WITHDRAWN on Q2.** Condition met: "five-hard-case A9 discipline over named authority-administrative changes" — the five rules cover cosmetic-reformat / authority-succession / cross-variant-distinction / Property-side-change / INSPIRE-only-locatedness, which substantively cover Royal Mail PAF revisions, OS AddressBase row-replacements, HMLR title-plan corrections, council street renamings, building-numbering changes (each maps to one of the five rules).

### Q3 — `opda:Address` class structure

**Positions:**

- **Gandon+Guizzardi:** FOR **class with property shapes** — `opda:Address` as `owl:Class` with SHACL `sh:NodeShape` constraining structural fields (`opda:line1` / `opda:line2` / `opda:postTown` / `opda:postcode` / `opda:country`) + variant tag + Property co-reference. All structural fields `sh:minCount 0` (accommodate INSPIRE-only-locatedness cases); MUST-have predicates are `opda:addressVariant` (one of `"title" | "marketing" | "inspire"`) and `opda:identifiesSameProperty` (every Address must locate some Property). Reject structured-datatype as primary; admissible only as derived denormalised convenience for downstream consumers (`opda:formattedString` computed from structural fields).
- **Allemang DA:** **FOR structured datatype** (PRIMARY ATTACK). Five structural fields as literals on `opda:Property` (or address-bearing Person/Org in ODR-0006); three variants as parallel literal-bundles (`opda:titleAddress`, `opda:marketingAddress`, `opda:inspireAddress`); no Address class registered; no shape on Address-as-resource. **Withdrawal condition:** named multi-Property-shared-Address case from PDTF v3 where one Address instance serves multiple `opda:Property` individuals.

**Verdict:** **2-1 FOR class with property shapes, with Allemang DA held-as-live dissent preserved on Q3.**

The DA's specific Q3 withdrawal condition (multi-Property-shared-Address from PDTF v3) is **not literally met** — the panel pair did not name such a case from PDTF v3 (the multi-title-flat exemplar has one flat with two LegalEstates, not two flats sharing an Address). However, Q3 is **logically entailed by Q1's Kind verdict**: a Substance Kind requires its own URI (Gandon's W3C-side argument from Q1); the URI cannot be a literal; therefore class-with-property-shapes follows. The Q1 cure forces Q3 by necessity.

**Held-as-live dissent:** Allemang DA preserves the structured-datatype position with the named re-open trigger: **"if 18 months of downstream sessions produce zero multi-Property-shared-Address cases from PDTF v3, AND no consumer query is named that genuinely requires Address-as-resource graph identity beyond what S015 Q1 already established, the Q3 structured-datatype reading becomes a re-open consideration."** This dissent is recorded in ODR-0015 §Consequences alongside the Q1 verdict; the re-open trigger preserves the path Allemang argues for.

### Q4 — External alignment (INSPIRE / vCard / OS AddressBase Plus)

**Positions:**

- **Gandon+Guizzardi:** FOR three alignments — INSPIRE Identifier as contingent identifier (re-instantiating ODR-0005 §6a UPRN-as-Quality pattern via `opda:inspireFeatureId`); `opda:Address rdfs:subClassOf vcard:Address` for personal-contact reuse (ODR-0006 territory); OS AddressBase Plus resolved via `dct:source` with version-pin per ODR-0004 §7a. SHACL-AF rule from ODR-0005 §6a re-used for INSPIRE/AddressBase succession — second citing site; if S006 produces a third, extract to a shared `pattern` ODR per ODR-0001 A9 §Artefact identity test.
- **Allemang DA:** **CONCEDED.** All four sub-alignments (INSPIRE via `opda:inspireId` already in ODR-0005; vCard ODR-0006 territory; AddressBase via UPRN succession already in ODR-0005 §6a; ISO 19160 as `dct:source`) uncontested.

**Verdict:** **3-0 FOR external-alignment commitments.** No DA attack.

### Q5 — GeoSPARQL deferral

**Positions:**

- **Gandon+Guizzardi:** FOR `opda:hasGeometry` as interface predicate; defer GeoSPARQL encoded geometries. Four named triggers for admitting encoded geometries (any one fires): (1) title-extents enter scope (ODR-0007 / ODR-0008 commits to materialising); (2) LLC1 / Local Land Charges searches enter scope; (3) INSPIRE polygon-feed direct ingest; (4) search-radius queries on Property.
- **Allemang DA:** **CONCEDED.** No DA attack. ODR-0002's GeoSPARQL Conditional adoption carries forward; `opda:hasGeometry` interface matches Cagle's S005 §3a surrogate-predicate pattern.

**Verdict:** **3-0 FOR GeoSPARQL deferral with interface predicate + four named admission triggers.**

### Q6 — Co-reference SHACL shape

**Positions:**

- **Gandon+Guizzardi:** FOR **two-tier shape** — `sh:Info` severity for cross-variant disagreement (legitimate per Q2 IC rule 3 — different `addressVariant` values never collapse); `sh:Warning` severity for same-variant disagreement (same authority cannot consistently say two contradictory things). Both tiers in `opda-shapes.ttl` (per ODR-0004 §3a, not annotation graph); SHACL severity ratified by ODR-0013. `pattern`-extraction candidate (alongside ODR-0005 §6a) for a shared "non-blocking-data-quality-rules" pattern record.
- **Allemang DA:** CONDITIONAL FOR — tractable shape under Kind (≤30 lines, no inverse-property gymnastics).

**Verdict:** **3-0 FOR two-tier shape.** The formal-pair's shape is ~15-line SHACL-SPARQL for cross-variant + ~30-line for same-variant; uses sibling traversal via `?a1 / ?a2 opda:identifiesSameProperty $this` (not inverse-property gymnastics — direct property traversal from Address instances back to Property is the canonical pattern, not a SPARQL-side `^` inversion). Allemang DA's condition (≤30 lines, no inverse-property gymnastics) met.

**Allemang DA status: WITHDRAWN on Q6.** Condition met: tractable shape with direct property traversal.

### Q7 — PII tagging (DPV co-annotation handoff to ODR-0012)

**Positions:**

- **Gandon+Guizzardi:** FOR class-level `dpv-pd:Address` baseline + variant-conditional refinements routed to ODR-0012. Q1's Substance Kind verdict resolves Baker+Pandit's S005 Q6 constraint: PII attaches to resource-instances. Three variant-conditional refinements identified: `addressVariant "title"` bears `dpv:hasLawfulBasis dpv:PublicTask` (HMLR open-register); `addressVariant "marketing"` bears `dpv:Consent | dpv:LegitimateInterest`; `addressVariant "inspire"` bears `dpv:PublicTask` (INSPIRE Directive open-data). ODR-0012 owns instance-level authoring.
- **Allemang DA:** **CONCEDED** routing to ODR-0012.

**Verdict:** **3-0 FOR class-level `dpv-pd:Address` baseline + ODR-0012 routing.** Q1 verdict's resource-identity commitment resolves Baker+Pandit's S005 Q6 constraint at the Q1 level; variant-conditional refinements tracked at instance authoring (ODR-0012 territory).

### Q8 — Exemplar pass

**Positions:**

- **Gandon+Guizzardi:** FOR pass on all three exemplars + two amendments scheduled (refactor exemplar 1 from literal `opda:postalAddress` to `opda:Address` resource shape; add explicit `opda:Address` instance with `addressVariant "inspire"` to exemplar 3 to manifest the INSPIRE-only-locatedness case). Exemplar 2 already authored correctly under Q1 Kind commitment.
- **Allemang DA:** CONDITIONAL on Q1+Q3 settling consistently AND per-exemplar verdict walkthrough in synthesis.

**Verdict:** **3-0 PASS on all three exemplars** with per-exemplar verdict walkthrough (discharging Allemang DA condition + S005 Q7 discipline).

**Per-exemplar verdict walkthrough:**

| Exemplar | Class instantiation | Hard case | IC verdict | SHACL key | PII regime |
|---|---|---|---|---|---|
| `flat-no-uprn-newly-converted.ttl` | 2 `opda:Property` (5A + 5B) with `prov:wasDerivedFrom` to predecessor; one `opda:Address` per Property with `addressVariant "marketing"` (to amend from literal `opda:postalAddress`) | UPRN absent + subdivision succession | Each new Address is a new individual (authority = listing agent); IC §rule 2 (authority-internal succession not applicable — no predecessor at marketing-variant level) | UPRN absent on Property AND on Address; `dash:uniqueValueForClass` vacuously passes (graceful degradation per ODR-0005 §6a); Q6 co-reference shape silent (one Address per Property) | `addressVariant "marketing"` bears `dpv:Consent`/`dpv:LegitimateInterest` (ODR-0012 instance-level decision) |
| `listed-building-divergent-addresses.ttl` | **Already authored under Kind commitment** — 3 `opda:Address` instances with variant tags; co-referring via `opda:identifiesSameProperty` | Three variants on one Property; cross-variant non-agreement on `opda:line2` | Q2 IC rule 3 makes the disagreement legitimate; each Address is its own individual | UPRN present on Property; `dash:uniqueValueForClass` no violation; Q6 shape fires `sh:Info` for cross-variant `line2` disagreement | `addressVariant "title"` = `dpv:PublicTask` (HMLR); `"marketing"` = `dpv:Consent`; `"inspire"` = `dpv:PublicTask` (INSPIRE) |
| `rural-plot-inspire-no-uprn.ttl` (amendment scheduled) | `opda:Property` with `opda:inspireId`; one `opda:Address` instance to add with `addressVariant "inspire"` + `opda:inspireFeatureId` populated + structural fields empty/sparse | Q2 IC rule 5 (INSPIRE-only locatedness) fires directly | One Address with `addressVariant "inspire"`; no marketing/title variants (those authorities do not assert continuity here); `opda:hasGeometry` interface live (Q5 deferral honoured) | UPRN absent on Property AND on Address; `opda:inspireFeatureId` Q4 operational key fires no violation; Q6 shape silent (one Address) | `addressVariant "inspire"` bears `dpv:PublicTask` (INSPIRE Directive) |

**Exemplar amendments scheduled** (next author-only follow-up session — non-blocking):

- **Refactor exemplar 1** to `opda:Address` resource shape (drop literal `opda:postalAddress` on Property; add `opda:Address` instance with `addressVariant "marketing"`).
- **Add `opda:Address` instance to exemplar 3** with `addressVariant "inspire"` + `opda:inspireFeatureId` + `opda:identifiesSameProperty` linkage.
- **`expected-report.ttl` pairing** deferred to a follow-up author-only session when the SHACL shapes graph crystallises (same pattern as S005).

**Allemang DA status: WITHDRAWN on Q8.** Condition met: per-exemplar verdict walkthrough provided (table above); Q1 and Q3 settled consistently (Q1 = Kind; Q3 = class with property shapes following from Q1 by necessity; Q3 held-as-live dissent preserved separately).

## Synthesis

This session ratifies **`opda:Address` as a UFO Substance Kind / DOLCE NonPhysicalEndurant** with `opda:addressVariant` as a UFO Quality particularising the context-of-presentation, structural fields as SHACL property shapes (all `sh:minCount 0`), INSPIRE alignment via `opda:inspireFeatureId` (re-instantiating ODR-0005 §6a UPRN-as-Quality pattern), vCard alignment via `rdfs:subClassOf vcard:Address`, OS AddressBase Plus alignment via `dct:source`, and class-level `dpv-pd:Address` baseline with variant-conditional refinements routed to ODR-0012.

**Three load-bearing moves:**

1. **The S005 Q6 Mode-only stance is revised on exemplar evidence.** The Mode-only reading fails the rural-plot INSPIRE-only-locatedness case (a Property with INSPIRE Identifier but no postal address has no Mode-of-Address to inhere; the Mode reading is silent on cadastral-only surfaces). The Kind reading handles it natively. The Guarino S001 Q4 "mode of presentation" framing is preserved as the *semantic content* of the variant tag, not as the UFO meta-category.

2. **External-standards alignment drives the Kind verdict.** INSPIRE Annex I treats Address as a feature with its own identifier; vCard treats it as a class; OS AddressBase Plus is record-based with row-level identifiers. All three model Address with resource identity; the Kind reading aligns; the Mode and Quale-in-Region readings would force one-sided alignment stories.

3. **The DPV co-annotation pattern requires resource identity.** Per Baker+Pandit's S005 Q6 amendment, ODR-0015 MUST resolve with explicit PII-pattern consideration. Class-level `dpv-pd:Address` on `opda:Address` Kind is operationally cleaner than property-level annotations on `opda:hasAddress` predicates — and DPV class-level dispatch requires `rdf:type opda:Address` discrimination (Allemang DA Q1 condition (b) met).

**A9 pressure-test passes (second `kind: pattern` ODR).** ODR-0015 discharges A9 §Per-kind discipline: (a) UFO Substance Kind / DOLCE NonPhysicalEndurant for `opda:Address`; (b) IC over five named hard cases (cosmetic-reformat / authority-succession / cross-variant-distinction / Property-side-change / INSPIRE-only-locatedness); (c) artefact realisation via class with property shapes + variant-tag SHACL + co-reference shape + DPV co-annotation handoff. The methodology continues to operate as designed.

**Gate cleared at deliberative level; namespace block carries forward.** ODR-0015 moves `proposed → proposed` with `council: session-015`. `status: accepted` blocked on WG namespace ratification per inherited ODR-0004 block. Downstream: **ODR-0006 (Agents & Roles) and ODR-0008 (Property descriptive attributes) unblocked** at deliberative level (per ODR-0015 §"MUST clear before Sessions 006 and 008"). ODR-0012 (Data-Governance Layer) inherits the class-level DPV co-annotation pattern + three variant-conditional refinements as load-bearing input.

**`pattern`-extraction candidate flagged for follow-up.** PROV-O succession patterns now appear in ODR-0005 §6a (UPRN succession), ODR-0009 (Claims/Evidence — Moreau S001 Q6), and ODR-0015 §Q4 (INSPIRE/AddressBase succession via re-instantiated SHACL-AF rule). Per ODR-0001 A9 §Artefact identity test, this satisfies the third-citing-site criterion; a shared "contingent-identifier-succession" pattern record may materialise. **If ODR-0006 (Phase 3a) produces a fourth citing site (e.g. NI-number succession; passport-renumbering), spawn the pattern record per §6 spawn rule.**

## B2 pilot — structured tally appendix (second artefact)

Per Scope-Check 2 B2 + ODR-0001 §B1 amendment, the two-artefact discipline (narrative synthesis + structured per-question vote tally) applies. This appendix discharges the discipline at Reduced Council scale.

### Per-voice votes

Vote codes: **F** = FOR; **A** = AGAINST; **C** = CONCEDE; **W** = WITHDREW; **H** = HELD; **P** = PARTIAL / CONDITIONAL.

| Voice | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8 |
|---|---|---|---|---|---|---|---|---|
| Guizzardi (formal-pair, Queen) | F | F | F | F | F | F | F | F |
| Gandon (formal-pair) | F | F | F | F | F | F | F | F |
| Allemang (DA) | W | W | **H** | C | C | W | C | W |

### Per-question tally

| Question | F count | A count | H (dissent) | W/C (DA withdrew/conceded) | Verdict shape |
|---|---|---|---|---|---|
| Q1 — UFO meta-category | 2 | 0 | 0 | 1 W | **3-0 FOR Kind** (Substance Kind / DOLCE NonPhysicalEndurant) |
| Q2 — IC | 2 | 0 | 0 | 1 W | **3-0 FOR five-rule IC** |
| Q3 — Class structure | 2 | 0 | **1 H (Allemang)** | 0 | **2-1 FOR class with property shapes**; Allemang DA held-as-live with named re-open trigger |
| Q4 — External alignment | 2 | 0 | 0 | 1 C | **3-0 FOR three alignments** |
| Q5 — GeoSPARQL deferral | 2 | 0 | 0 | 1 C | **3-0 FOR interface + four triggers** |
| Q6 — Co-reference SHACL | 2 | 0 | 0 | 1 W | **3-0 FOR two-tier shape** |
| Q7 — PII tagging | 2 | 0 | 0 | 1 C | **3-0 FOR class-level baseline + ODR-0012 routing** |
| Q8 — Exemplar pass | 2 | 0 | 0 | 1 W | **3-0 PASS** with per-exemplar walkthrough + amendments scheduled |

### Held-as-live dissent (Q3)

**Allemang DA (structured datatype on Q3).** Verbatim: *"Address-as-class is unsupported by the source schema. PDTF v3 models `propertyPack.titleAddress` and `propertyPack.marketingAddress` as parallel structured-object leaves at the JSON level — they were never references to a shared Address resource. The minimum-change move to RDF is structured-literal-bundles on Property; the over-modelling move is to invent an `opda:Address` class."*

**Named re-open trigger:** "If 18 months of downstream sessions produce zero multi-Property-shared-Address cases from PDTF v3, AND no consumer query is named that genuinely requires Address-as-resource graph identity beyond what S015 Q1 already established, the Q3 structured-datatype reading becomes a re-open consideration."

This dissent is admissible per ODR-0001 §"No silent vote-padding" + §"Held dissent". It does NOT block the verdict (Q3 follows Q1 by logical entailment); it preserves a re-open path tied to a falsifiable trigger.

### Allemang DA scorecard

| Question | DA position | Withdrawal condition | Outcome |
|---|---|---|---|
| Q1 — Kind reading | AGAINST | Named consumer query OR SHACL `rdf:type` discrimination | **WITHDRAWN** (3 named consumer queries match condition (a); DPV class-level dispatch matches condition (b)) |
| Q2 — IC commitment | CONDITIONAL on Q1 | Q1 = Quale OR Kind with 5-hard-case A9 discipline | **WITHDRAWN** (Q1 = Kind + 5 named hard cases discharge A9) |
| Q3 — class structure | FOR structured datatype | Named multi-Property-shared-Address from PDTF v3 | **HELD** (condition not literally met; held-as-live dissent with named re-open trigger) |
| Q4 — external alignment | FOR | (already conceded) | **CONCEDED** |
| Q5 — GeoSPARQL deferral | FOR | (already conceded) | **CONCEDED** |
| Q6 — co-reference SHACL | CONDITIONAL FOR | Tractable shape (≤30 lines, no inverse-property gymnastics) | **WITHDRAWN** (~15-line + ~30-line shapes; direct traversal, no `^` inversion) |
| Q7 — PII routing | FOR | (already conceded) | **CONCEDED** |
| Q8 — exemplar pass | CONDITIONAL | Per-exemplar walkthrough + Q1+Q3 consistent | **WITHDRAWN** (walkthrough table + Q1 + Q3 entailment) |

**DA scorecard summary:** 5 of 8 withdrawn, 3 conceded, **1 held-as-live (Q3)**. Allemang DA is functioning as designed — six of seven contested questions converted into amendments or alignment; the held-as-live Q3 preserves a falsifiable re-open path. This is *not* a full-withdrawal session (S005 was 8-of-8); the Q3 held dissent is the substantive carry forward and ODR-0015 §Consequences records it.

### B2 pilot observations (second pilot site after S005)

The two-artefact discipline applied to a Reduced Council with only 3 voices:

- **Pair-internal alignment was high** (Guizzardi + Gandon agreed on all 8 questions). The structured tally captures this cleanly; a narrative reading might over-emphasise pair-pair tensions that didn't materialise.
- **The Q3 held-as-live dissent is the load-bearing data the tally captures.** A narrative reading might describe the verdict as "the panel adopts Kind / class with property shapes with DA partial dissent". The structured tally makes the count explicit (2-1 with named dissenter + verbatim re-open trigger) — downstream tooling can consume this as data.
- **DA scorecard mechanical-check pattern carries forward from S005.** Each withdrawal condition was verbatim from the DA position file; the synthesis mechanically marked withdrawn/held/conceded against the conditions. No vague "DA aligned with majority"; alignment traces to specific named conditions.
- **Cost:** ~15-20 lines of markdown for the tally appendix (this section). Authoring cost: ~10 minutes of Queen synthesis time at Reduced Council scale.

**Carry-over to S011 Q8 (third pilot site):** the two-artefact discipline is unambiguously usable at both Full Council (S005) and Reduced Council (S015) scale. The third pilot site (S011 Q8) is the EXPAND threshold — if S011 Q8's structured tally also captures dissent the narrative reading might bury, the recommendation for full adoption is supported. **Preliminary signal: EXTEND CAUTIOUSLY recommendation from S005 holds; awaiting S011 Q8 for the third confirmation.**

## Track record (for adoption.md §Track Record)

- **Session 015 — ODR-0015 Address & Geography** (Phase 2.6 gate). Reduced Council (3 runs: 1 formal-pair teammate + 1 DA + 1 Queen synthesis). Two-artefact discipline (narrative + structured tally) per B2-pilot EXTEND-CAUTIOUSLY recommendation from S005. Queen Guizzardi. DA Allemang. 8 questions. **Outcomes:** Q1 3-0 FOR Kind (UFO Substance Kind / DOLCE NonPhysicalEndurant; `opda:addressVariant` as UFO Quality within Kind); **revises S005 Q6 Mode-only stance on exemplar evidence + external-standards alignment**; Allemang DA withdrew on 3 named consumer queries + DPV class-level dispatch SHACL case. Q2 3-0 FOR five-rule IC (cosmetic-reformat / authority-succession / cross-variant-distinction / Property-side-change / INSPIRE-only-locatedness). Q3 **2-1 FOR class with property shapes**; **Allemang DA held-as-live dissent preserved** with named re-open trigger (18 months / zero multi-Property-shared-Address cases / no new consumer query). Q4 3-0 FOR three alignments (INSPIRE-as-contingent-identifier; vCard superclass; OS AddressBase via `dct:source`). Q5 3-0 FOR GeoSPARQL deferral with `opda:hasGeometry` interface + four named admission triggers. Q6 3-0 FOR two-tier SHACL co-reference shape (`sh:Info` cross-variant; `sh:Warning` same-variant). Q7 3-0 FOR class-level `dpv-pd:Address` baseline + variant-conditional refinements routed to ODR-0012. Q8 3-0 PASS with per-exemplar verdict walkthrough + two amendments scheduled (refactor exemplar 1; manifest exemplar 3's `addressVariant "inspire"` instance). **DA scorecard: 5 withdrawn / 3 conceded / 1 held-as-live (Q3).** ODR-0015 amended: §Decision rewritten for Kind commitment; new §Operational specifications discharging A9 (a)/(b)/(c) inline; §Consequences updated for downstream inheritance (ODR-0006/0008 unblocked; ODR-0012 inherits class-level baseline + variant-conditional refinements). Council:session-015 set; **status:proposed retained** per inherited ODR-0004 namespace block. **B2 pilot second site:** structured tally observation supports EXTEND-CAUTIOUSLY recommendation from S005; awaiting S011 Q8 for third-site confirmation toward EXPAND threshold. **A9 pressure-test passes (second `kind: pattern` ODR to discharge).** **`pattern`-extraction candidate flagged:** PROV-O succession (S005 §6a + S009 + S015 Q4) reaches third-site count; if S006 produces fourth, spawn shared `contingent-identifier-succession` pattern record per §6 spawn rule.
