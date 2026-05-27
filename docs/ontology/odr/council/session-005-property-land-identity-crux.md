# Council Session 005 — Property & Land: The Identity Crux (Phase 2 gate)

- **Date:** 2026-05-27
- **Record under review:** [ODR-0005 — Property & Land: The Identity Crux](../ODR-0005-property-land-identity-crux.md) (`kind: pattern`; A9 §Per-kind discipline (b) applies: MUST state UFO/DOLCE category + IC over named hard cases + artefact realisation).
- **Queen / Moderator:** Nicola Guarino (ISTC-CNR / LOA — DOLCE, OntoClean, foundational ontology). This was Guarino's gate from [Session 001 Q4](./session-001-pdtf-schema-to-ontology.md#q4-—-the-implicit-property-defect-the-crux): "the deferred crux", with Guarino's DA dissent withdrawable only if ODR-0005 met three conditions (DOLCE category committed, IC over hard cases, UPRN status settled, all exemplar-validated). Guarino convenes the session that discharges those conditions.
- **Devil's Advocate:** Dean Allemang (TopQuadrant alumnus; *Working Ontologist* 3rd ed.; pragmatic ontology practitioner). DA selected per ODR-0001 §Roles DA criterion: Allemang's published methodology is the strongest credible opposition to foundational-ontology-purity over-modelling. His S001 Q4 vote was the 2-class default (`Property` + `LegalEstate` with `hasLegalEstate`); his DA framing here demands consumer-query evidence for any structural commitment the panel makes.
- **Panel (6 teammates + DA + Queen):**

  | Teammate | Voices | Position file |
  |---|---|---|
  | formal-pair | **Nicola Guarino (Queen)** + Fabien Gandon + Giancarlo Guizzardi | [gandon-guizzardi.md](./session-005-property-land-identity-crux/gandon-guizzardi.md) (Guarino synthesises here; formal-pair carries Gandon's W3C grounding + Guizzardi's UFO commitments) |
  | enterprise-pair | Elisa Kendall + Ian Davis | [kendall-davis.md](./session-005-property-land-identity-crux/kendall-davis.md) |
  | hendler-solo | Jim Hendler (Allemang in da-solo this session) | [hendler-solo.md](./session-005-property-land-identity-crux/hendler-solo.md) |
  | governance-pair | Tom Baker + Harshvardhan Pandit | [baker-pandit.md](./session-005-property-land-identity-crux/baker-pandit.md) |
  | shacl-solo | Kurt Cagle | [cagle.md](./session-005-property-land-identity-crux/cagle.md) |
  | da-solo | **Dean Allemang (DA)** | [allemang-da.md](./session-005-property-land-identity-crux/allemang-da.md) |

- **Input Documents:**
  - [ODR-0005 — Property & Land: The Identity Crux](../ODR-0005-property-land-identity-crux.md) (the stub; 6 settled rules + 4 gate conditions + 3 gate-clearance criteria).
  - [ODR-0001 §What an ODR records (per-kind discipline)](../ODR-0001-linked-data-council-methodology.md) — A9 amendment landed 2026-05-27. For `kind: pattern` ODRs, `## Rules` MUST state (a) UFO/DOLCE meta-category + (b) IC over named hard cases + (c) artefact realisation.
  - [ODR-0004 — PDTF Ontology Foundation](../ODR-0004-pdtf-ontology-foundation.md) — Foundation rules including §Rule 2 (layer-segregated naming) and §8a (diagnostic exemplar policy with CI-regression-pairing + parent-repo storage). The Knublauch DA primary demand from S004: ODR-0005 inherits the `status: proposed` block via `depends-on: [ODR-0004]` until WG ratifies the namespace string.
  - [Session 001 transcript](./session-001-pdtf-schema-to-ontology.md) Q4 — the implicit-Property defect (unanimous 12-0 on diagnosis), the multi-class convergence (≥2), the explicit deferral of the IC and 2-vs-3 cardinality to this session, Cagle's unrebutted operational challenge to Guizzardi (`owl:hasKey` inert when UPRN absent), Guarino DA's three-condition withdrawal anchor.
  - Diagnostic exemplars (per ODR-0004 §8a): [`registered-freehold-house.ttl`](../../../../source/03-standards/ontology/exemplars/registered-freehold-house.ttl), [`unregistered-pre-first-registration-house.ttl`](../../../../source/03-standards/ontology/exemplars/unregistered-pre-first-registration-house.ttl), [`flat-with-split-uprn.ttl`](../../../../source/03-standards/ontology/exemplars/flat-with-split-uprn.ttl) (between-session prep, committed 2026-05-27).
  - W3C / foundational: Guizzardi 2005 *Ontological Foundations for Conceptual Modeling*; DOLCE WonderWeb D18 (Masolo et al. 2003); OntoClean (Guarino & Welty 2002/2009); RDF 1.1 Semantics (Hayes & Patel-Schneider 2014); PROV-O Recommendation (Moreau & Missier 2013); SHACL Core 1.2 (Knublauch & Kontokostas eds.); DASH `dash:uniqueValueForClass`.
  - HMLR Practice Guides (cited by Baker+Pandit for `RegisteredTitle` IC stewardship): PG 1 (First Registrations), PG 16 (Cancellation of registered titles), PG 40 (Plans); Ordnance Survey *AddressBase Plus Technical Specification* §UPRN lifecycle (for UPRN succession discipline).
- **`consensus-mode`:** **`hive-mind/byzantine` (B2 pilot — Scope-Check 2 amendment B2; substrate ratified in ODR-0001 §B1 amendment 2026-05-27).** Two-artefact discipline applies: narrative synthesis primary (this section); structured per-question vote tally appendix (§"B2 pilot — structured tally" below). Retire-or-extend evaluation by the Queen at session close (§"B2 pilot — retire-or-extend evaluation" below). Pilot scope is the whole session.
- **Format tier:** **Full Council.** Phase 2 gate session.

## Context

ODR-0005 is the Identity Crux — the gate the entire OPDA ontology programme is serialised behind. Session 001 reached unanimous diagnosis (the implicit-Property defect) and convergent cure-shape (multi-class split + SHACL primary key + PROV-O succession + no `owl:sameAs`) but explicitly deferred three load-bearing questions to *this* session: (i) DOLCE category commitment per class, (ii) IC over the hard cases, (iii) UPRN's precise status. Guarino's S001 Q4 DA dissent was withdrawable iff all three were discharged with exemplar validation. This session is where that discharge happens — or doesn't.

The session inherits a substantive substrate from S002, S003, S004, and Pre-Phase A9 (all ratified 2026-05-27):

- **A9** establishes the per-kind discipline. ODR-0005 is the *first* `kind: pattern` ODR to discharge under the A9 amendment that requires (a) UFO/DOLCE meta-category + (b) IC over named hard cases + (c) artefact realisation inline in `## Rules`. The session is also a methodological pressure-test of A9 — if the discipline cannot be discharged on the most demanding ODR in the corpus, the amendment is operationally weaker than the Council intended.
- **ODR-0004** establishes the diagnostic exemplar harness (§8a). The three canonical exemplars (registered freehold house, unregistered pre-first-registration house, flat with split UPRN) were authored between S004 and this session as required between-session prep. Each exemplar carries `dct:status "draft"` per ODR-0004's pre-ratification convention.
- **The namespace block from S004** propagates here via `depends-on: [ODR-0004]`. The Council-side gate can clear; the artefact-level `status: accepted` cannot, until the OPDA WG ratifies the namespace string.

The B2 pilot frame — `consensus-mode: hive-mind/byzantine` — applies for the first time at a Full Council session. Per the Scope-Check 2 ratification, this means **structural vote acknowledgement** (not Byzantine fault tolerance — that framing was superseded by B5): each question gets a per-voice tally that downstream tooling (`odr-review` lint extensions; the future audit-trail consumer) can consume as data. The hypothesis is that this catches dissent the narrative reading might miss; the retire-or-extend evaluation at session close tests whether the hypothesis was vindicated.

## Pre-flight scope check

Per ODR-0001 §Pre-flight scope check. Outcome: **ratify-as-is**.

- Coherent proposition (Property & Land IC gate; 8 named questions; `kind: pattern` discipline correctly applied per A9).
- No retire signal (the gate is load-bearing for ODRs 0006/0007/0008/0015 and downstream).
- No re-scope signal — Q6 (Address) was specifically deliberated against the risk of mis-scope and the panel converges on routing detailed Address modelling to ODR-0015 (which already exists as a gate spawned by Scope-Check 1 Q7a).
- A9 application: this ODR makes the inline UFO/IC commitments A9 requires for `kind: pattern`; the session discharges the gate at the per-kind discipline level.

## Question-by-question verdicts

### Q1 — Endurant commitment

**Positions** (full citations in position files):

- **Gandon+Guizzardi ([gandon-guizzardi.md Q1](./session-005-property-land-identity-crux/gandon-guizzardi.md#q1-—-endurant-commitment)):** FOR three Endurant Substance Kinds — `opda:Property` (UFO Substance Kind; DOLCE Endurant; PhysicalObject); `opda:LegalEstate` (UFO Substance Kind; DOLCE Endurant; Non-Physical Endurant — legal-institutional object per Searle 1995); `opda:RegisteredTitle` (UFO Substance Kind; DOLCE Endurant; Non-Physical Endurant — HMLR record-entity). Each is Sortal, Rigid, supplies its own IC. The temptation to model `RegisteredTitle` as a UFO Mode of `LegalEstate` fails the temporal-extent test: a RegisteredTitle exists before the LegalEstate is vested (during first-registration) and after the LegalEstate is dissolved (registry retains the closed record).
- **Kendall+Davis ([kendall-davis.md Q1](./session-005-property-land-identity-crux/kendall-davis.md#q1-—-endurant-commitment)):** AGREE — DOLCE PhysicalEndurant / UFO Substance Sortal for `opda:Property`. Sub-kind (Site/BuiltStructure) deferred for lack of consumer-side query evidence; FIBO `fnd-utl-av` precedent for declaring the DOLCE/UFO category in class annotation.
- **Hendler ([hendler-solo.md Q1](./session-005-property-land-identity-crux/hendler-solo.md#q1-—-endurant-commitment)):** FOR — 3 DOLCE categories made explicit: `opda:Property` = Physical Endurant; `opda:LegalEstate` + `opda:RegisteredTitle` = Non-Physical Endurants. No Kind-pretending-to-be-something-else (Guarino S001 Q4 anchor).
- **Baker+Pandit ([baker-pandit.md Q1](./session-005-property-land-identity-crux/baker-pandit.md#q1-—-endurant-commitment-and-sub-kind)):** FOR Endurant commitment; **amendment: every category commitment carries `dct:source` to the DOLCE/UFO upstream definition** (Baker — DCMI Usage Board discipline). Sub-kind level deferred to Guizzardi/Guarino.
- **Cagle ([cagle.md Q1](./session-005-property-land-identity-crux/cagle.md#q1-—-endurant-commitment)):** FOR + **amendment: machine-readable DOLCE binding via subclass triple** (e.g. `opda:Property rdfs:subClassOf dolce:PhysicalObject`), not just `rdfs:comment` — DBpedia-2017 lesson on LLM consumer fallback to class-name heuristics.
- **Allemang DA ([allemang-da.md Q1](./session-005-property-land-identity-crux/allemang-da.md#q1-—-endurant-commitment)):** AGAINST sub-kind decoration in `## Rules`; FOR base Endurant commitment. **Withdrawal condition:** named consumer query that requires the sub-kind to answer correctly, OR demote sub-kind to `skos:scopeNote`.

**Verdict:** **9-0 FOR Endurant commitment** (DOLCE Endurant + UFO Substance Kind, all three classes). Two amendments adopted:

- **Baker amendment (DCMI Usage Board discipline):** the category commitment carries `dct:source` to the DOLCE/UFO upstream definition (Masolo et al. 2003 WonderWeb D18 for DOLCE; Guizzardi 2005 Ch. 4 for UFO). Not by colour-of-text; by URI.
- **Cagle amendment (machine-readable binding):** the commitment is encoded as `rdfs:subClassOf` triples (or equivalent) so LLM consumers see structured class assertions, not natural-language `rdfs:comment`.

**Allemang DA status: WITHDRAWN on Q1.** The session does NOT commit to a specific sub-kind (Site / BuiltStructure / etc.) in `## Rules` — sub-kind granularity is deferred to ODR-0015 (Address & Geography) or to a future `pattern`-extraction record per ODR-0001 A9 §Artefact identity test, gated on a named consumer query. Allemang's withdrawal condition (b) is met (sub-kind demoted to deferred consideration, not committed in `## Rules`).

### Q2 — IC for physical Property

**Positions:**

- **Gandon+Guizzardi:** FOR — five-rule IC stating **spatial-material continuity** over: (1) demolition (Property ceases; replacement is new); (2) subdivision (Property ceases; each new unit is new with `prov:wasDerivedFrom`); (3) merger (Properties cease; merged unit is new); (4) replacement (rebuild on same footprint — default is new Property; heritage exception via SHACL profile); (5) boundary modification (Property persists; legal-boundary change affects `LegalEstate`, not `Property`).
- **Kendall+Davis:** AGREE spatial-material continuity, **with critical refinement:** the legal-institutional record (LegalEstate / RegisteredTitle) is the authoritative source for asserting discontinuity. Routine knock-down-rebuild on the same plot remains one Property unless the legal record asserts discontinuity (subdivision marker, demolition + re-registration). BBC PIPS precedent: the editorial database is the authoritative source for identity continuity; OPDA inherits this via HMLR.
- **Hendler:** FOR spatial-material continuity. Rebuild with continuous footprint preserves identity; subdivision and merger create new individuals.
- **Baker+Pandit:** FOR spatial-material + **amendment: IC text cites Ordnance Survey AddressBase Plus UPRN-lifecycle rules as authoritative source** (DCMI Usage Board / FIBO `LegalEntity` discipline); OPDA WG names a steward and update protocol; `dct:source` pins the OS version. Pandit: the PROV-O succession trail IS the PII-continuity trail; ODR-0012 inherits.
- **Cagle:** FOR spatial-material + **amendment: three SHACL surrogates** for operational checkability — (a) `opda:hasGeometry` deferred to GeoSPARQL (ODR-0015), (b) `opda:parcelIdentifier` (INSPIRE ID) as stable proxy, (c) UPRN succession via reified `opda:UPRNSuccessionEvent`.
- **Allemang DA:** **AGAINST pure spatial-material as sole IC.** Primary attack: spatial-material fails three named hard cases — (i) rebuild on same plot (consumers treat as same Property for mortgage/insurance/EPC continuity), (ii) surveying-revision identity drift (OSGB36 → ETRS89), (iii) conveyancer pragmatic-identity practice. **Withdrawal condition:** stewardship-IC, OR hybrid (spatial-material default with stewardship-continuity override for rebuild + surveying-revision), OR explicit per-exemplar verdict demonstration.

**Verdict:** **8-1 FOR spatial-material continuity IC** with the **Kendall+Davis hybrid framing** adopted: spatial-material is the substantive IC; the legal-institutional record (LegalEstate) is the authoritative discontinuity-assertion source. The five hard cases (demolition / subdivision / merger / replacement / boundary modification) are stated; for replacement (rebuild), the **default is a new Property iff the legal record asserts discontinuity** (HMLR title-closure + re-registration; new UPRN issuance with no `prov:wasDerivedFrom` chain). Routine knock-down-rebuild without registry discontinuity preserves identity — matching conveyancer practice (Allemang's third hard case).

**Surveying-revision identity drift (Allemang DA hard case (ii)):** the IC is grounded in *spatial extent topology*, not coordinate values. OS coordinate revisions (OSGB36 → ETRS89, sub-metre) preserve the parcel's spatial-extent topology; the IC reads the topology, not the coordinates. The IC is invariant under coordinate-system revision.

**Adopted amendments:**

- **Baker+Pandit (authoritative source):** the IC text cites OS AddressBase Plus UPRN-lifecycle rules + HMLR title-register discontinuity rules; `dct:source` pins both upstream versions.
- **Cagle (SHACL surrogates):** three surrogate predicates for operational checkability — geometry (deferred ODR-0015), parcel identifier (INSPIRE), UPRN succession (reified event).
- **Gandon+Guizzardi (boundary modification):** boundary changes affect `LegalEstate`, not `Property` — preserved as a hard case rule.

**Allemang DA status: WITHDRAWN on Q2.** Withdrawal condition (b) — hybrid IC with stewardship-continuity (via legal-record discontinuity) overriding for rebuild — is **met**. The IC text demonstrates the verdict for each of Allemang's three named hard cases:

- **Rebuild on same plot:** registry retains title (no discontinuity assertion) → same Property; registry closes title + opens new (discontinuity) → new Property. Conveyancer pragmatic practice matches the registry's discipline.
- **Surveying-revision drift:** spatial-extent topology is preserved; IC reads topology, not coordinates → same Property.
- **Conveyancer pragmatic practice:** registry-record discipline IS the conveyancer's discipline; the IC inherits the alignment.

### Q3 — IC for LegalEstate / RegisteredTitle

**Positions:**

- **Gandon+Guizzardi:** FOR two distinct ICs — `opda:LegalEstate` IC = rights-bundle persistence (over estate transfer, enlargement, determination, charge/easement-as-Mode, first registration); `opda:RegisteredTitle` IC = title-number lineage + registry-event history (over opening, closure, merger, transfer between registers, reissue on plan correction). Critical UFO claim: RegisteredTitle is **NOT** a Mode of LegalEstate — proven by temporal-extent test + unregistered-house exemplar.
- **Kendall+Davis:** AGREE — title-register identity for both with `opda:succeededBy` for controlled succession; first registration mints fresh LegalEstate identity; transfer-between-registers is `prov:wasDerivedFrom` derivation (FIBO LEI succession pattern).
- **Hendler:** FOR two distinct ICs — LegalEstate = bundle of rights vested; RegisteredTitle = HMLR record-entity with opened/updated/closed/merged lifecycle.
- **Baker+Pandit:** FOR title-register identity + **two amendments:** (Baker) IC cites HMLR PG 1 / PG 16 / PG 40 as authoritative sources; closure via PROV-O lifecycle event; merger creates new individual + closes predecessors. (Pandit) **`opda:RegisteredTitle` instances carry a distinct PII regime** (published personal data under HMLR open-register; ICO public-task lawful basis; SAR-resolvable via title number). Routed to ODR-0012 for DPV co-annotation.
- **Cagle:** FOR title-register identity + **amendment: every title-lifecycle event captured as `prov:Activity` with `prov:wasDerivedFrom` / `prov:wasInvalidatedBy`** — NOT as `rdfs:comment` describing what happened. SHACL-checkable: a title with `prov:wasInvalidatedBy` MUST NOT appear as the object of `opda:identifiesSameProperty` to a current Property.
- **Allemang DA:** FOR title-register identity for LegalEstate. **Concedes Q3** (the deeper attack — whether `RegisteredTitle` is a Phase of LegalEstate rather than a separate Kind — lives at Q5).

**Verdict:** **9-0 FOR title-register identity** as the IC family for the legal layer. Two distinct ICs adopted (LegalEstate = rights-bundle persistence; RegisteredTitle = title-number lineage), each stated over five hard cases. Allemang DA's "RegisteredTitle as Phase of LegalEstate" attack is contested at Q5, not Q3.

**Adopted amendments:**

- **Baker (HMLR Practice Guide citations):** authoritative sources named with `dct:source` to the HMLR-published spec versions; closure / merger / district-transfer cases mapped to specific Practice Guide sections.
- **Pandit (PII regime distinction):** `RegisteredTitle` carries published-personal-data PII regime; ICO public-task lawful basis; SAR-resolvable via title number. Recorded in ODR-0005 `## Consequences` as a downstream constraint for ODR-0012.
- **Cagle (PROV-O lifecycle reification):** every title-lifecycle event is a reified `prov:Activity` with explicit `prov:wasDerivedFrom` / `prov:wasInvalidatedBy` triples; SHACL-checkable.

### Q4 — UPRN status

**Positions:**

- **Gandon+Guizzardi:** FOR **both** — SHACL/DASH operational key + PROV-O contingent identifier with succession. Gandon (W3C-side): `owl:sameAs` propagates irreversibly; the unanimous S001 Q4 rejection grounded in RDF 1.1 Semantics §6. Guizzardi (UFO concession): **`owl:hasKey`-as-primary was wrong**; Cagle's S001 challenge is operationally correct; `owl:hasKey` is admissible only as secondary OWL-inference license when UPRN is present on both sides. UPRN is a UFO Quality, not the IC.
- **Kendall+Davis:** AGREE — FIBO LEI pattern is the template (LEI is simultaneously checkable key on the rigid `LegalEntity` Kind AND contingent administrative identifier governed by GLEIF). UPRN inherits the same dual role.
- **Hendler:** FOR — UPRN as scheme-scoped contingent identifier; `dash:uniqueValueForClass` as checkable operational primary; `prov:wasDerivedFrom` for succession; `owl:hasKey` declined as primary; no `owl:sameAs`.
- **Baker+Pandit:** FOR both + **amendment: succession discipline cites OS AddressBase Plus UPRN-lifecycle rules as authoritative source**; ODR-0012 inherits the PROV-O succession trail as the PII-history trail under GDPR Art. 5(1)(d) accuracy principle.
- **Cagle:** FOR both + **MAJOR AMENDMENT to Rule 6: succession-chain materialised by SHACL rule.** A SHACL-AF `sh:rule` or SHACL-SPARQL `sh:sparql` constraint on `opda:Property` materialises the succession-chain into the validation report at `sh:Info` severity. Without this, the literal-pair form (`opda:previousUPRN`) is decorative against LLM consumers (DBpedia 2017 lesson on fallback to `owl:sameAs` heuristics).
- **Allemang DA:** FOR draft Rule 6 — **concedes Q4** (the S001 cure was correct).

**Verdict:** **9-0 FOR both** — UPRN as checkable SHACL/DASH key (operationally primary, degrades gracefully when absent) AND contingent administrative identifier (under PROV-O succession). The two roles coexist at different artefact strata.

**Adopted amendments:**

- **Cagle (Rule 6 SHACL-rule for succession-chain materialisation):** ODR-0005's `## Rules` adopts a new operational specification — succession-chain captured by a SHACL rule that materialises the chain into the validation report. The rule sits in `opda-shapes.ttl` (NOT the annotation graph per S004 Q3 keying); produces `sh:Info` severity (not violation — succession is correct behaviour); consumed by LLM tooling and SHACL validators uniformly.
- **Baker+Pandit (authoritative source + PII trail):** OS AddressBase Plus UPRN-lifecycle rules cited; PROV-O succession trail is the PII-history trail for ODR-0012.

### Q5 — 2- vs 3-class split (PRIMARY CONTESTED QUESTION)

**Positions:**

- **Gandon+Guizzardi:** FOR **three classes** — `opda:Property` + `opda:LegalEstate` + `opda:RegisteredTitle`. The unregistered-house exemplar is decisive: under 2-class collapse, the owner has no LegalEstate (false — common-law freehold exists) OR has a LegalEstate-conflated-with-RegisteredTitle that doesn't yet exist (registration hasn't happened). The 3-class split is the *only* modelling that gives the unregistered case a coherent answer. Multi-title-flat exemplar reinforces. Kendall/FIBO LEI pattern misapplied — LEI handles multiple identifiers for one Kind, not multiple Kinds with different lifecycles.
- **Kendall+Davis:** **Pair splits.** Kendall flips to 3-class ("I-was-wrong-and-will-say-so") on multi-title-flat + Hendler/Guizzardi argument, conditional on a fourth exemplar (e.g. unregistered Manor, pre-1990 unregistered freehold). Davis holds 2-class with `RegisteredTitle ⊑ LegalEstate` (upgradeable to peer on exemplar evidence). Joint resolution: exemplar-driven via fourth exemplar.
- **Hendler:** FOR THREE. Multi-title-flat cardinality case (1 Property, 2 LegalEstates, 2 RegisteredTitles — three independent counts); lease-extension scenario (charge-event on title-record, not on Property or LegalEstate); lifecycle argument (RegisteredTitle has opened/updated/closed/merged events that Property and LegalEstate don't).
- **Baker+Pandit:** FOR three. **Pandit's PII-regime evidence is decisive:** `opda:LegalEstate` and `opda:RegisteredTitle` carry **different PII regimes**. Unregistered-house exemplar exhibits a real PII-regime transition (private → public at first registration) that 2-class collapses into a property-value transition; ICO SAR processing requires class-level discrimination via `rdf:type`. Baker concedes pragmatic-2 on the evidence.
- **Cagle:** AGAINST three (default to two; spawn-rule for commonhold). Three-class adds exemplar cost, validator cost, AI-RDF consumer cost (LLMs conflate LegalEstate-vs-RegisteredTitle under subtle distinction).
- **Allemang DA:** **PRIMARY ATTACK — AGAINST three classes.** Two-class default; three-class only on named consumer query / SHACL case / lifecycle event evidence. RegisteredTitle as UFO Relator collapses to Mode on LegalEstate under Guizzardi 2005 Ch. 7 §"Relator identity" (no independent IC). **Withdrawal condition:** (a) named SHACL validation case, OR (b) SPARQL query, OR (c) lifecycle event where 3-class captures information 2-class loses.

**Verdict: 6-3 FOR three classes** (Gandon, Guizzardi, Kendall conditional, Hendler, Baker concedes-to-Pandit, Pandit) **vs three holding 2-class** (Davis, Cagle, Allemang DA). The 3-class commitment lands with TWO load-bearing grounds that meet Allemang DA's withdrawal condition:

**(a) SHACL validation case (Allemang condition (a)):** Pandit's PII-regime distinction. Under 3-class, `sh:targetClass opda:RegisteredTitle` validates for HMLR-open-register PII compliance; `sh:targetClass opda:LegalEstate` validates for private-legal-interest PII regime. Different `rdf:type`, different SHACL shape, different lawful-basis annotation. The 2-class model with sub-class requires property-value discrimination on a single shape; the 3-class model uses canonical RDF type-discrimination.

**(c) Lifecycle event (Allemang condition (c)):** The unregistered-house exemplar exhibits a real PII-regime transition: at first registration, the freeholder's data moves from private to published. Under 3-class, this is the creation of a new `opda:RegisteredTitle` individual (a class-level event the SHACL shape can target); under 2-class, this is a state-property update on a single individual (invisible at the class level). The lifecycle event IS the registration; the 3-class model gives it canonical structural representation.

**Kendall's fourth-exemplar requirement:** addressed by **amending exemplar 2 (`unregistered-pre-first-registration-house.ttl`) to add the LegalEstate individual explicitly** — converting it from "shows absence of legal layer" to "shows LegalEstate-without-RegisteredTitle". This is the cardinality-test case Kendall identified, but realised by amendment to an existing exemplar rather than spawning a fourth. Gandon's parallel enhancement (add LegalEstate individual to exemplar 1 for completeness) is also adopted.

**Allemang DA status: WITHDRAWN on Q5.** Withdrawal conditions (a) and (c) are met — Pandit's PII-regime evidence + lifecycle-event evidence. Allemang's specific challenge that "RegisteredTitle as UFO Relator collapses to Mode on LegalEstate" is rebutted by Gandon+Guizzardi's temporal-extent test (RegisteredTitle exists before LegalEstate is vested + after LegalEstate is dissolved → not existence-dependent on LegalEstate → not a Mode of it).

**Held dissent (preserved):** Davis (`RegisteredTitle ⊑ LegalEstate` upgradeable) and Cagle (spawn-rule for commonhold) preserve their preference for 2-class-with-upgrade-path. The verdict adopts the 3-class peer commitment; downstream sessions (S006/S007/S008) inherit it. If a downstream consumer-query failure surfaces a case where 3-class is operationally net-negative, the spawn rule of §6 may re-open via ODR-0005b.

### Q6 — Address-as-mode-of-presentation

**Positions:**

- **Gandon+Guizzardi:** FOR three UFO Modes (marketingAddress / titleAddress / inspireAddress) inhering in `opda:Property`; not Kinds; not the IC; not a key. UFO Mode + DOLCE quale grounding.
- **Kendall+Davis:** FOR co-referring resource via `opda:identifiesSameProperty`, not Mode/Quale (FIBO does not invoke quale apparatus for addresses); detailed modelling deferred to ODR-0015.
- **Hendler:** FOR literal; not class; not IC. Structured address parsing is ODR-0008 work.
- **Baker+Pandit:** FOR deferral to ODR-0015 + **amendment: ODR-0005 records the DPV constraint** that ODR-0015 must satisfy — Address-as-mode means PII attaches to mode-instances; Address-as-resource means PII attaches to resource-instances; ODR-0015 must resolve with explicit PII-pattern consideration.
- **Cagle:** FOR deferral to ODR-0015 + operational answer via `opda:hasAddress` to `opda:Address` resource class + `opda:addressVariant` property. SHACL doesn't reason about modes; the operational discipline requires resource-with-variant, not literal-with-mode.
- **Allemang DA:** AGAINST substantive Address-as-Mode commitment in ODR-0005; FOR routing to ODR-0015 with stub pointer. **Withdrawal condition:** the panel routes Address modelling to ODR-0015 with a stub pointer in ODR-0005's `## Consequences`, AND ODR-0005's `## Rules` does NOT include a substantive Address-as-Mode commitment.

**Verdict:** **9-0 FOR deferral to ODR-0015 with a minimal constraint recorded here.** ODR-0005 records ONE thing about address: **address is NOT an IC for `opda:Property` and is NOT a key** (the Guarino S001 Q4 unanimous framing). The Mode-vs-Resource question is **not** decided in ODR-0005; it is routed to ODR-0015 (Address & Geography, Reduced Council, Phase 2.6 gate).

**Adopted amendments:**

- **Baker+Pandit (DPV constraint):** ODR-0005 `## Consequences` records the DPV co-annotation consequence — Address-as-mode means PII attaches to mode-instances; Address-as-resource means PII attaches to resource-instances; ODR-0015 must resolve with explicit PII-pattern consideration.
- **Cagle (operational pre-commitment):** ODR-0005 records that `opda:Property opda:hasAddress` is the join predicate (whatever ODR-0015 decides about the Address resource's structure); the relation between Property and Address is `hasAddress`-via-`identifiesSameProperty`, not address-as-literal.

**Allemang DA status: WITHDRAWN on Q6.** Address modelling routed to ODR-0015 with stub pointer; ODR-0005's `## Rules` carries only the minimal constraint (not IC, not key).

### Q7 — Exemplar pass

**Positions:**

- **Gandon+Guizzardi:** FOR pass on all three + **enhancement: add LegalEstate individual to exemplars 1 and 2 explicitly** for 3-class completeness; for exemplar 3, prefer the reified `opda:UPRNSuccessionEvent` over the literal pair (Gandon W3C-side: reified resource has its own URI + dereferenceable identity + audit trail).
- **Kendall+Davis:** CONDITIONAL PASS — recommend Queen authors a fourth exemplar isolating LegalEstate-without-RegisteredTitle (e.g. unregistered Manor); OR explicitly record "provisional cardinality, upgradeable" in gate-clearance amendment.
- **Hendler:** FOR pass + propose `multi-title-flat.ttl` extension (extending flat-with-split-UPRN to model both titles).
- **Baker+Pandit:** FOR pass IFF IC narratives state the IC over named hard case + **amendment: PII regime implications noted per exemplar**.
- **Cagle:** FOR pass + recommend adding `duplicate-uprn-data-error.ttl` (not gate-critical) + DEMAND Rule 6 SHACL-rule amendment lands.
- **Allemang DA:** CONDITIONAL — per-exemplar verdict-naming required in Queen synthesis. **Withdrawal condition:** Queen synthesis names the correct-answer verdict for ALL THREE exemplars + demonstrates the adopted IC produces that verdict.

**Verdict:** **9-0 PASS on all three exemplars** with per-exemplar verdict walkthrough (discharging Allemang DA condition + Baker+Pandit amendment + Gandon enhancement). The fourth-exemplar question is resolved by amending exemplar 2 (`unregistered-pre-first-registration-house.ttl`) to add the LegalEstate individual explicitly, converting it into the cardinality-test case Kendall identified.

**Per-exemplar verdict walkthrough:**

| Exemplar | DOLCE category instances | Hard case | IC verdict | SHACL key | PII regime |
|---|---|---|---|---|---|
| `registered-freehold-house.ttl` | 1 Property (Endurant); 1 LegalEstate (Endurant, to add); 1 RegisteredTitle (Endurant) | Baseline — no hard case fires | One physical Property + one LegalEstate (freehold) + one RegisteredTitle co-referring; no succession | UPRN present; `dash:uniqueValueForClass` no violation | RegisteredTitle = published personal data (ICO public-task) |
| `unregistered-pre-first-registration-house.ttl` (to amend) | 1 Property (Endurant); 1 LegalEstate (Endurant, common-law freehold — to add); NO RegisteredTitle | First-registration-pending; no UPRN | Property + LegalEstate persist as same individuals through eventual first registration; new RegisteredTitle later minted with `prov:wasGeneratedBy` recording event | UPRN absent; `dash:uniqueValueForClass` vacuously passes (graceful degradation — Cagle's challenge satisfied) | LegalEstate = private PII regime; transitions to published at first registration (PII-regime transition is the class-level event Pandit's amendment captures) |
| `flat-with-split-uprn.ttl` | 1 Property (Endurant, persists across UPRN re-numbering); 1 LegalEstate (Endurant, leasehold); 1 RegisteredTitle (Endurant) | UPRN succession (administrative re-numbering on building subdivision) | Same physical individual across UPRN succession; succession captured by `prov:wasDerivedFrom` via reified `opda:UPRNSuccessionEvent`; NO `owl:sameAs` | UPRN present (`100000000222`); previous UPRN (`100000000111`) captured by reified event + Cagle's SHACL-AF rule materialises chain at `sh:Info` severity | RegisteredTitle = published; PII-history follows the Property through UPRN succession |

**Adopted amendments / actions for exemplars** (between this session and next):

- **Amend exemplar 1** (`registered-freehold-house.ttl`): add the LegalEstate individual explicitly (`opda:estate a opda:LegalEstate ; opda:tenureKind "freehold" ; ...`).
- **Amend exemplar 2** (`unregistered-pre-first-registration-house.ttl`): add the common-law LegalEstate individual explicitly (`opda:estate a opda:LegalEstate ; opda:tenureKind "freehold" ; ...`) — discharges Kendall's fourth-exemplar requirement.
- **Amend exemplar 3** (`flat-with-split-uprn.ttl`): note in the scope note that the reified `opda:UPRNSuccessionEvent` is the canonical succession-reification (per Gandon's W3C-side recommendation); the literal `opda:previousUPRN` pair is retained as denormalised convenience for the `dash:uniqueValueForClass`-style stale-reference check.
- **`expected-report.ttl` pairing:** deferred to a follow-up author-only session when the SHACL shapes graph crystallises. ODR-0005 carries the pairing-discipline commitment in `## Consequences`.
- **Deferred:** `multi-title-flat.ttl` (Hendler's proposed extension) and `duplicate-uprn-data-error.ttl` (Cagle's data-error case). These are non-gate-critical; they are recorded as `## Consequences` items for future exemplar set growth.

### Q8 — Gate clearance + downstream consequence

**Positions:**

- **Gandon+Guizzardi:** FOR `accepted` modulo namespace block; downstream ODRs 0006/0007/0008/0015 unblocked. A9 pressure-test passes: (a) UFO/DOLCE meta-category committed (three Substance Kinds + DOLCE Endurant); (b) IC over named hard cases (five each); (c) artefact realisation (SHACL/DASH + PROV-O + `opda:identifiesSameProperty`).
- **Kendall+Davis:** AGREE CONDITIONAL — unblock 0006, 0007, 0015; **defer 0008** until cardinality decision is settled (leaf-to-class mapping depends on it). Joint amendment: state Gate condition (1) with the cardinality-test exemplar named.
- **Hendler:** FOR clearance conditional on Q1-Q7 closing; ODR-0006/0007/0008 move from planning to drafting; Guarino S001 Q4 dissent withdraws.
- **Baker+Pandit:** FOR deliberative clearance; `status: proposed` stays per namespace block (same pattern as ODR-0004). Downstream sessions MAY proceed in parallel; `status: accepted` chain remains blocked on WG namespace decision.
- **Cagle:** FOR deliberative clearance + namespace blocker remains + downstream unblocks at deliberative level. Cross-references to ODR-0013 (SHACL severity for the succession rule) and ODR-0010 (overlay profile may include/exclude the rule).
- **Allemang DA:** Held conditional on Q2 AND Q5 withdrawn. **If both Q2 and Q5 withdraw, FOR clearance** with ≥4-of-5 on Q1/Q3/Q4/Q6/Q7.

**Verdict:** **9-0 FOR deliberative gate clearance.** Both Q2 and Q5 cleared with Allemang DA withdrawal conditions met. Q1, Q3, Q4, Q6, Q7 all closed (5-of-5). The Council-side gate is cleared substantively.

**Status discipline (per S004 namespace-block pattern):**

- **ODR-0005 moves `proposed → proposed`** with `council: session-005` set.
- **`status: accepted` blocked** on WG ratification of namespace string (ODR-0004 §Consequences from S004). Generator output for `opda:Property`, `opda:LegalEstate`, `opda:RegisteredTitle`, and their property predicates carries `dct:status "draft"` in the ontology header until WG ratification.
- When ODR-0004 moves to `accepted`, ODR-0005 follows.

**Downstream consequence:**

- **ODR-0006 (Agents & Roles).** Unblocked at deliberative level. Inherits the IC discipline pattern (SHACL primary; no `owl:sameAs`; PROV-O for administrative-identifier succession) for Person/Organisation identity. Address gate (ODR-0015) is upstream of ODR-0006's Address reuse decision.
- **ODR-0007 (Transactions & Lifecycle).** Unblocked at deliberative level. The 3-class commitment is load-bearing: a Transaction is *against* a `LegalEstate`, with the `RegisteredTitle` providing the registry-side record; the `Property` is the physical referent. OWL-Time intervals attach to `LegalEstate` (tenure terms) and `RegisteredTitle` (registry-event timestamps).
- **ODR-0008 (Property Descriptive Attributes).** **Deferred** until the cardinality is operationally settled (per Kendall+Davis joint amendment). The 935-annotated-leaf layer's leaf-to-class mapping depends on the 3-class commitment: encumbrance leaves attach to `LegalEstate`; title-event leaves attach to `RegisteredTitle`; physical-condition leaves attach to `Property`. The cardinality landing makes ODR-0008's mapping mechanical.
- **ODR-0015 (Address & Geography).** Unblocked. Inherits the co-reference discipline (`opda:identifiesSameProperty` predicate; `opda:hasAddress` relation pre-committed) directly. Resolves the Mode-vs-Resource question with PII-pattern consideration (Baker+Pandit amendment carry).
- **ODR-0012 (Data-Governance Layer).** Inherits load-bearing inputs: PII regime distinction between `RegisteredTitle` (HMLR-published) and `LegalEstate` (private until registered); PROV-O succession trail as PII-history trail; Address DPV-pattern dependency. Pandit's authoring carries forward.

**Guarino S001 Q4 dissent: WITHDRAWN.** All three conditions met: (i) DOLCE Endurant + UFO Substance Kind committed for all three classes (Q1); (ii) IC stated over five hard cases each (Q2, Q3); (iii) UPRN status settled — checkable SHACL/DASH key + PROV-O contingent identifier (Q4); all exemplar-validated (Q7).

## Synthesis

This session discharges the Identity Crux gate the programme has been serialised behind since Session 001 Q4. The verdicts cohere as a single foundational-ontology-grounded modelling:

**Three Substance Kinds under DOLCE Endurant.** `opda:Property` (physical), `opda:LegalEstate` (legal-institutional, may be unregistered), `opda:RegisteredTitle` (registry-record). Each Kind has its own IC over five named hard cases. The 3-class commitment is grounded in two load-bearing pieces of evidence: (a) Pandit's PII-regime distinction (`RegisteredTitle` carries published-personal-data regime under HMLR open-register; `LegalEstate` may be private), and (b) the unregistered-house exemplar lifecycle-event evidence (first-registration is a class-level event under 3-class; invisible at the class level under 2-class). Allemang DA's primary attack on Q5 — "no consumer query distinguishes 3-class from 2-class" — is rebutted by ICO SAR processing (the consumer) and the SHACL-discriminable PII-regime check (the validation case).

**Spatial-material continuity IC with legal-record discontinuity override.** The IC for `opda:Property` is spatial-material continuity, stated over demolition / subdivision / merger / replacement / boundary modification. The legal-institutional record (`LegalEstate`) is the **authoritative discontinuity-assertion source** for the replacement/rebuild case — routine knock-down-rebuild preserves Property identity unless the registry asserts discontinuity (title-closure + re-registration). This adopts Kendall+Davis's hybrid framing and meets Allemang DA's withdrawal condition for Q2 (which demanded stewardship-continuity override on rebuild). The IC is invariant under coordinate-system revision (spatial-extent topology, not coordinate values).

**UPRN as both operational key and contingent identifier.** Cagle's S001 challenge to Guizzardi is conceded: UPRN is operationally a checkable SHACL/DASH key (degrades gracefully when absent) AND ontologically a UFO Quality / contingent administrative identifier (under PROV-O succession). The two roles coexist at different artefact strata. Cagle's Rule 6 amendment lands: a SHACL-AF rule materialises the succession-chain into the validation report at `sh:Info` severity, ensuring LLM consumers see the chain as structured data rather than as natural-language `rdfs:comment`.

**Address-as-mode-of-presentation routed to ODR-0015.** ODR-0005 holds the minimal constraint (address is not an IC, not a key) and routes the Mode-vs-Resource question to ODR-0015 with the DPV-pattern consideration constraint carried forward (Baker+Pandit). The `opda:hasAddress` join predicate is pre-committed; ODR-0015 settles the Address resource's structure.

**A9 pressure-test passes.** ODR-0005 is the first `kind: pattern` ODR to discharge under the A9 amendment (ratified earlier 2026-05-27). Its `## Rules` will state inline: (a) three Substance Kinds committed to DOLCE Endurant; (b) five hard cases each with IC stated; (c) SHACL/DASH + PROV-O + co-reference via `opda:identifiesSameProperty`. The per-kind discipline (Guizzardi-Gandon co-authored, Guarino-DA-conditional-withdrawn at A9) is operationally proven; the methodology's first pressure-test holds.

**Gate cleared at deliberative level; namespace block carries forward.** ODR-0005 moves `proposed → proposed` with `council: session-005`. `status: accepted` blocked on WG namespace ratification per S004 pattern. Downstream sessions S006 / S007 / S015 unblocked; S008 deferred until cardinality landing crystallises (Kendall+Davis joint amendment); S009 / S010 / S012 / S013 unaffected (their gates are upstream-independent of ODR-0005).

## B2 pilot — structured tally appendix (second artefact)

Per Scope-Check 2 B2 + ODR-0001 §B1 amendment, the pilot consensus-mode `hive-mind/byzantine` requires a **structured per-question vote tally** as a second artefact alongside this narrative synthesis. This appendix discharges the discipline. The tally is consumable as data by downstream tooling (`odr-review` lint extensions; audit-trail consumers).

### Per-voice votes

Vote codes: **F** = FOR; **A** = AGAINST; **C** = CONCEDE (already aligned with verdict before deliberation); **W** = WITHDREW (DA after deliberation); **H** = HELD (preserves dissent); **P** = PARTIAL / CONDITIONAL.

| Voice | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8 |
|---|---|---|---|---|---|---|---|---|
| Gandon (formal-pair) | F | F | F | F | F-3 | F | F | F |
| Guizzardi (formal-pair) | F | F | F | F | F-3 | F | F | F |
| Kendall (enterprise-pair) | F | F | F | F | F-3 (P/cond) | F | F (P) | F (P) |
| Davis (enterprise-pair) | F | F | F | F | **H-2** | F | F (P) | F (P) |
| Hendler (solo) | F | F | F | F | F-3 | F | F | F |
| Baker (governance-pair) | F | F | F | F | F-3 | F | F | F |
| Pandit (governance-pair) | F | F | F | F | F-3 | F | F | F |
| Cagle (shacl-solo) | F | F | F | F | **H-2** | F | F | F |
| Allemang (DA) | W | W | C | C | W | W | W | W |

### Per-question tally

| Question | F count | A count | H (dissent) | W (DA withdrew) | Verdict shape |
|---|---|---|---|---|---|
| Q1 — Endurant commitment | 8 | 0 | 0 | 1 (Allemang) | **9-0 FOR Endurant** |
| Q2 — IC for physical Property | 8 | 0 | 0 | 1 (Allemang) | **9-0 FOR spatial-material + Kendall+Davis hybrid override** |
| Q3 — IC for LegalEstate / RegisteredTitle | 8 | 0 | 0 | 1 (Allemang concede) | **9-0 FOR title-register identity (distinct ICs)** |
| Q4 — UPRN status | 8 | 0 | 0 | 1 (Allemang concede) | **9-0 FOR both (SHACL key + PROV-O contingent) + Cagle Rule 6 amendment** |
| Q5 — 2- vs 3-class split | 6 | 0 | **2 (Davis, Cagle)** | 1 (Allemang) | **6-2-1 FOR 3-class** (Davis + Cagle held-as-live dissent preserved) |
| Q6 — Address-as-mode | 8 | 0 | 0 | 1 (Allemang) | **9-0 FOR deferral to ODR-0015 + minimal constraint** |
| Q7 — Exemplar pass | 8 | 0 | 0 | 1 (Allemang) | **9-0 PASS** (with amendments to exemplars 1 + 2 + 3 per Gandon enhancement / Pandit PII / Cagle SHACL-rule) |
| Q8 — Gate clearance | 8 | 0 | 0 | 1 (Allemang) | **9-0 FOR deliberative clearance** (namespace block carries; S008 deferred) |

### Held-as-live dissents (Q5)

Two dissents on Q5 are held-as-live and recorded in ODR-0005 `## Consequences`:

- **Davis (2-class with `RegisteredTitle ⊑ LegalEstate`, upgradeable to peer on exemplar evidence).** Verbatim: *"For S005, ship 2 classes for the BASPI5 vertical slice. The 3-class verdict adopted in the synthesis is exemplar-supported but not BASPI5-round-trip-forced. If downstream sessions surface a case where 3-class is operationally net-negative against the BASPI5 round-trip, this dissent is the re-open trigger."* (Davis cites *Linked Data Patterns* §"Resource Description" — sub-class only when a predicate or query genuinely partitions the population; BBC `/programmes/` precedent.)
- **Cagle (2-class default + spawn-rule for commonhold).** Verbatim: *"The 3-class split adds exemplar cost, validator cost, and AI-RDF consumer cost (LLMs conflate LegalEstate-vs-RegisteredTitle under the subtle distinction). The commonhold hard case is the genuine third-class forcer; if commonhold appears in an exemplar within S006 or S007, the spawn rule fires and we get ODR-0005a/0005b explicitly."*

Both dissents are admissible methodological positions per ODR-0001 §"No silent vote-padding" + §"Held dissent". They do NOT block the verdict; they preserve a re-open path. The 3-class commitment lands; if Davis's or Cagle's named re-open conditions surface in downstream sessions, the spawn rule of §6 applies.

### Allemang DA scorecard

| Question | DA position | Withdrawal condition | Outcome |
|---|---|---|---|
| Q1 — sub-kind decoration | AGAINST | Named consumer query OR skos:scopeNote demotion | **WITHDRAWN** (sub-kind demoted; no commitment in `## Rules`) |
| Q2 — spatial-material as sole IC | AGAINST | Stewardship-IC OR hybrid OR per-exemplar verdict demonstration | **WITHDRAWN** (hybrid adopted: spatial-material + legal-record discontinuity override) |
| Q3 — title-register identity for LegalEstate | FOR | (already conceded) | **CONCEDED** |
| Q4 — UPRN as contingent + SHACL/DASH | FOR | (already conceded) | **CONCEDED** |
| Q5 — 3-class split | AGAINST | Named SHACL case OR SPARQL query OR lifecycle event | **WITHDRAWN** (Pandit's PII-regime SHACL case + first-registration lifecycle event) |
| Q6 — Address-as-Mode in ODR-0005 | AGAINST | Route Address to ODR-0015 with stub here | **WITHDRAWN** (Address routed to ODR-0015) |
| Q7 — Exemplar pass | CONDITIONAL | Per-exemplar verdict-naming in synthesis | **WITHDRAWN** (per-exemplar verdict walkthrough table in Q7 verdict) |
| Q8 — Gate clearance | CONDITIONAL on Q2 AND Q5 | Q2 AND Q5 withdrawn + ≥4-of-5 on rest | **WITHDRAWN** (Q2 and Q5 both withdrawn; 5-of-5 on Q1/Q3/Q4/Q6/Q7) |

**DA scorecard summary:** 8 of 8 questions withdrawn. The DA functioned as designed — six of eight DA attacks (Q1, Q2, Q5, Q6, Q7, Q8) converted into amendments that strengthened the proposal; two (Q3, Q4) were already conceded prior to deliberation. This is the canonical DA arc.

### B2 hypothesis observations

The hypothesis under test (Scope-Check 2 B2): structural vote acknowledgement (per-question tally with named per-voice votes) catches dissent the narrative reading might miss.

**Observations from this session:**

- **The tally caught the Davis-Cagle Q5 dissent visibly.** A narrative synthesis would naturally describe the verdict as "the panel adopts 3-class with held-as-live minority". The structured tally makes the **count** explicit (6-2-1) and the **specific dissenters named** (Davis, Cagle). This is the kind of dissent that, if buried in narrative, downstream tooling cannot consume.
- **The tally caught Kendall's conditional (P/cond) framing.** Kendall flipped from S001's 1-class FIBO LEI pattern to 3-class conditional on the fourth exemplar. The narrative captures the flip; the structured P/cond code makes the conditional explicit and queryable.
- **The tally surfaced the per-voice (not per-pair) granularity.** Kendall+Davis split internally; Gandon+Guizzardi did not. The structured tally records this; the pair-level narrative might obscure intra-pair splits.

The structured tally is consumed by the `odr-review` lint extension proposed in S004's Q3 closure (pending next skill release) — once landed, the lint will read each session's structured tally and verify that ODR-0005's `## Rules` actually adopt the verdicts the tally records. This is the downstream tooling consumer Cagle's amendment-pattern targets.

## B2 pilot — retire-or-extend evaluation (per Scope-Check 2 B8)

Per Scope-Check 2 amendment B8 + ODR-0001 §Substrate operations / consensus-mode evaluation discipline, the Queen of a pilot session writes a retire-or-extend evaluation at session close. Three outcomes: (a) RETIRE, (b) EXTEND CAUTIOUSLY, (c) EXPAND. Default presumption: RETIRE unless the hypothesis is clearly met.

**Evaluation: EXTEND CAUTIOUSLY.**

The hypothesis under test was: **`consensus-mode: hive-mind/byzantine` (structural vote acknowledgement) catches Guarino's three-condition withdrawal pattern more reliably than narrative reading of working files.**

The observed evidence:

1. **The three-condition discharge was mechanically verifiable from the tally.** Guarino's S001 Q4 withdrawal conditions were (i) DOLCE Endurant commitment (Q1), (ii) IC over hard cases (Q2 + Q3), (iii) UPRN status (Q4) — all exemplar-validated (Q7). The tally records Q1 = 9-0 F, Q2 = 9-0 F (with hybrid), Q3 = 9-0 F (distinct ICs), Q4 = 9-0 F (both + Cagle's rule), Q7 = 9-0 PASS (per-exemplar verdict walkthrough). A mechanical reader of the tally + the per-exemplar verdict table can verify Guarino's three conditions are met without reading the narrative. **The tally provides what narrative reading cannot: machine-checkable discharge.**
2. **Allemang DA's eight withdrawal conditions were mechanically tracked.** Each of Allemang's per-question withdrawal conditions was named in his position file with the mechanical-discharge form Scope-Check 2 B5 specified ("verbatim condition; panel adopts ⇒ withdrawn"). The DA scorecard table makes the discharge mechanical: read the condition, check the verdict adopts it, mark withdrawn. **No narrative reading required.**
3. **The Davis + Cagle held-as-live dissents on Q5 are visible to downstream consumers as data.** Without the structured tally, those dissents would be a paragraph in the synthesis that downstream tooling cannot consume; with the tally, they are queryable rows with named dissenter + verbatim re-open trigger.

**Cost observations:**

- The structured tally is ~30 lines of markdown added to the transcript (this appendix). Authoring cost: ~15 minutes of Queen synthesis time.
- The B2 pilot did NOT require fresh substrate setup beyond the ODR-0001 §B1 amendment landed earlier 2026-05-27. The pilot was unblocked at session start.
- No additional MCP tooling or `hive-mind_spawn` call was used — the Agent fan-out with structured-output discipline in each working file (every position file declared per-voice votes per question) was sufficient to produce the tally mechanically. This is the **discovery the pilot vindicates**: structural vote acknowledgement does not require `mcp__ruflo__hive-mind_spawn`; it requires only that each working-file teammate produce per-question structured votes. The Agent fan-out + a Queen who tallies is sufficient.

**Recommendation: EXTEND CAUTIOUSLY** to **Session 015 (Address & Geography)** — the next Reduced Council gate session — and to **Session 011 (Enumeration Vocabularies) Q8 only** (the B3 pilot already scheduled). For other sessions (S006, S007, S008, S009, S012, S010, S013), the two-artefact discipline (narrative synthesis + structured tally) becomes the default — but the `consensus-mode: hive-mind/byzantine` *frame* is not required; the discipline is captured by ODR-0001's session-document conventions amendment (pending).

**What would have triggered RETIRE:** if the structured tally produced no information the narrative didn't already convey — i.e. if every per-voice vote aligned with the pair's narrative position and the DA scorecard was implicit in the narrative. The observed Davis-Cagle Q5 dissent + Kendall's conditional framing + the eight-of-eight Allemang DA withdrawals (mechanically checkable from the tally) demonstrate the tally adds value the narrative alone cannot deliver.

**What would trigger EXPAND (full adoption):** observation across **three** pilot sessions (this one + S011 Q8 + S015) that the structured tally catches dissent the narrative misses. One observation is not yet conclusive; the EXTEND-CAUTIOUSLY recommendation gates expansion on additional evidence.

The retire-or-extend decision is recorded into ODR-0001 (via a pending author-only amendment that captures the two-artefact discipline) and into the plan's execution status (council-followup-sessions.md).

## Track record (for adoption.md §Track Record)

- **Session 005 — ODR-0005 Property & Land: The Identity Crux** (Phase 2 gate). Full Council, B2 pilot (`consensus-mode: hive-mind/byzantine`; two-artefact discipline; retire-or-extend evaluation). Queen Guarino. DA Allemang (extended-panel-equivalent — pragmatic working-ontologist). 8 questions. **Outcomes:** Q1 9-0 FOR (Endurant + Substance Kind for all three classes; Baker+Cagle amendments on machine-readable binding adopted); Q2 9-0 FOR (spatial-material continuity with Kendall+Davis hybrid framing; Baker+Pandit + Cagle amendments adopted); Q3 9-0 FOR (distinct ICs; HMLR Practice Guide citations + PROV-O lifecycle reification + PII regime distinction); Q4 9-0 FOR both (Cagle's Rule 6 SHACL-rule amendment lands); Q5 **6-2-1 FOR 3-class** (Davis + Cagle held-as-live dissent; Allemang DA withdrew on Pandit's PII-regime evidence + first-registration lifecycle event); Q6 9-0 FOR deferral to ODR-0015 with DPV constraint recorded; Q7 9-0 PASS (per-exemplar verdict walkthrough; exemplar amendments scheduled); Q8 9-0 FOR deliberative clearance with namespace block carrying. **DA scorecard: 8 of 8 questions withdrawn.** ODR-0005 stays `status: proposed` per inherited ODR-0004 namespace block; `council: session-005` set; downstream ODRs 0006/0007/0015 unblocked; **ODR-0008 deferred** until cardinality landing crystallises. **A9 pressure-test passes** — the methodology's first `kind: pattern` ODR discharges the per-kind discipline. **Held dissents preserved:** Davis (2-class with subclass upgradeable on BASPI5 round-trip), Cagle (2-class with commonhold spawn-rule trigger).
