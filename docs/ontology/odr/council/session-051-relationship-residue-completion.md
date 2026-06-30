# Council Session 051 — Relationship-residue completion (orphan-class connectivity)

- **Date:** 2026-06-30
- **Record(s) under review:** [ODR-0032](../ODR-0032-relationship-layer-object-properties.md) §R1/§R2 + residue register. **Produces [ODR-0034](../ODR-0034-relationship-residue-completion.md)** (modelling verdict); feeds ADR-0055 (diagram) + ADR-0056 (emission).
- **Queen:** Elisa Kendall (OMG/EDM Council; FIBO relationship-as-first-class; Queen at S047/S050).
- **Devil's Advocate:** Ian Davis (BBC `/programmes/` + UK-Gov publish-first / defer-until-concrete-consumer) — genuinely opposed to gating un-consumed edges; recorded ODR-0007 defer dissent; DA at S047/S049.
- **Panel:** Luc Moreau (W3C PROV-O editor — **pivotal**, the orphans are `prov:Activity`/`prov:Entity`), Giancarlo Guizzardi (UFO events/relators/qua-individuals), Nicola Guarino (DOLCE/OntoClean — author of the §R1 endpoint-IC rekey), Dean Allemang (pragmatic / coverage-by-test), Kurt Cagle (SHACL / facet design — **Q6 lead**).
- **Input Documents:** ODR-0032 §R1/§R2 + residue register; [ADR-0048](../../../adr/ADR-0048-relationship-emission-walk-and-object-property-coverage-gate.md) §As-built (the "left as-is" undeclared predicates `partOfTransaction`/`concerns`); ODR-0008d (Information Objects); ODR-0009 (Claims/Evidence/PROV-O backbone); ODR-0005 (bounded-context identity); ODR-0027 (classification-over-inheritance); ODR-0026/0029 + ADR-0035 (documentary-not-entailed regime); the `/ontology/classes` diagram review (this session's trigger). **Convener corpus re-verification** at `source/03-standards/ontology/exemplars/*.ttl` and the gated TBox. Working files: `working/session-051/{kendall,davis,moreau,guizzardi,guarino,allemang,cagle}.md`.
- **`consensus-mode`:** `agent-fan-out` (per-question votes independent; no cross-question conditionality). Cross-talk transport: **`SendMessage` via Agent Teams** (team `council-051`); one opening + one rebuttal round; every exchange mirrored to the working files.
- **Format:** Full Council.

## Context

ODR-0032 (council S047) built the **relationship spine** (the agent/transaction/role/property object properties) and a three-disposition **residue register** — every source association resolves to **GATED** (both endpoints +I and a worked SPARQL competency query motivates it → emit a typed `owl:ObjectProperty`), **VALUE-SLOT** (a −I endpoint → datatype/`sh:in`), or **RESIDUE-PENDING** (endpoint IC undecided upstream → register + defer). A review of the `/ontology/classes` diagrams (2026-06-30) found **18 of 40 classes render disconnected** because the diagram draws only object-property class→class edges. The connectable orphans — perdurant **events** (Milestone, LeaseExtensionEvent, UPRNSuccessionEvent, NameChangeEvent), **Information Objects** (Survey, Search, Comparable, NearbyFacility, AttachedDocument), **VerificationActivity**, **LeaseTerm**, and the **chain** predicates — were never adjudicated against §R1 (S047 lacked a PROV-O voice). This session closes that residue.

**Convener-verified corpus fact (load-bearing, established before deliberation closed).** `opda:partOfTransaction` (Milestone→Transaction), `opda:concerns` (Transaction→LegalEstate), `opda:dependsOnTransaction`, `opda:chainMembers`, `opda:chainStatus`, `opda:appliesTo`, `opda:updatesRegistryRecord` are **used in committed diagnostic exemplars but NONE is declared `owl:ObjectProperty` in the gated TBox** (`opda:concernsProperty` — the S047-GATED Transaction→Property edge — is distinct, and *is* declared). This is the ADR-0048 §As-built "undeclared orphan predicates, left as-is" situation. The decision is therefore **declare + gate an existing-but-undeclared exemplar predicate**, not "mint from scratch" — and the chain exemplar **exists**, so S047's "DEFERRED: no exemplar yet" rationale is **stale**. The five info-object subject classes (Survey/Search/Comparable/NearbyFacility/AttachedDocument) appear in **zero** exemplars.

## Question 1 — Perdurant events → their bearers

Do Milestone / LeaseExtensionEvent / UPRNSuccessionEvent / NameChangeEvent pass §R1 to gate an inter-entity edge, or stay PROV/VALUE-SLOT?

**Guizzardi:** events are first-class perdurants with identity (ER 2013 §3), so §R1(a) passes; `Milestone partOfTransaction Transaction` is genuine event-mereology (ER 2013 §4) and exemplar-attested → GATE. **Moreau:** `prov:wasRevisionOf`/`wasDerivedFrom` (PROV-O §3) already carry NameChange→Person and LeaseExtension/UPRNSuccession→prior-entity, so USE-EXISTING-PROV there; but PROV-DM §5.3 has **no part-of-activity**, so Milestone→Transaction needs a bespoke partonomic predicate. **Guarino:** DOLCE perdurants are +I endpoints (D18 §4.4), but the event↔subject ties are already PROV; only Milestone clears bar (b) once the exemplar+query is committed. **Allemang:** `partOfTransaction` fires five times in `simple-transaction-with-milestones.ttl` and "milestones of this transaction" is committable against existing triples — bar (b) met. **Kendall (Queen):** GATE Milestone (declare the undeclared predicate); NameChange name stays −I VALUE-SLOT. **Davis (DA):** **WITHDREW to GATE** on Milestone — "the exemplar+query bar I folded back in at S047 is met; I cannot demand it then reject it"; HOLDS the other three for VALUE-SLOT/RESIDUE-PENDING.

**Vote Q1 (Milestone→Transaction `partOfTransaction`): 7–0–0 GATED.** Declare as `owl:ObjectProperty`, documentary `rdfs:domain opda:Milestone` + `rdfs:range opda:Transaction`, SHACL `sh:class` pin + subject-guard, commit the competency query.
**NameChangeEvent:** name is −I **VALUE-SLOT** (reaffirms S047's struck `hasName`); the Person tie rides existing `prov:wasRevisionOf`/`wasAssociatedWith` — no opda mint. **LeaseExtensionEvent / UPRNSuccessionEvent:** **RESIDUE-PENDING** — the `appliesTo`/`updatesRegistryRecord` predicates are exemplified-but-undeclared and `prov:wasDerivedFrom` carries lineage, but no committed competency query yet (Allemang held GATE; the panel majority lands RESIDUE-PENDING on the bar-(b) discipline).

## Question 2 — Information Objects → Property

GATE a bespoke `opda:` aboutness edge, or is the relation PROV-native?

This was the session's live split. **Moreau (decisive):** "PROV is **silent on aboutness**." `prov:wasDerivedFrom` is causal derivation; `prov:wasInformedBy` links two activities; `prov:specializationOf` (PROV-O §3) is entity→more-general-entity. None says "this Survey *is about* Property X." Per class: a Survey is *generated by* an inspection Activity, not *derived from* the Property, so `prov:wasDerivedFrom Property` would be a **false provenance claim**; PROV-DM §5 has no topic term. So `opda:aboutProperty` is **not** a PROV duplicate. **Kendall (Queen) conceded by name:** "I conflated two edges; aboutness is its own first-class relation, not a provenance refinement (Kendall & McGuinness Ch.3)." **Allemang conceded** he'd mis-applied his own bar: coverage-by-test (*SWWO* Ch.12) requires a *committed* query over a *committed* exemplar, and there are **zero** info-object exemplars. **Guarino / Davis:** bar (b) structurally unmet → do not gate. The convergence threads both: the predicate is *warranted* (Moreau) but *unexercised* (Davis/Guarino), so the disposition is **RESIDUE-PENDING**, not bare DEFERRED — name it in the register so it is not silently dropped.

**Vote Q2: RESIDUE-PENDING (register `opda:aboutProperty`).** Survey / Search / Comparable / NearbyFacility → Property: one subject-guarded predicate `opda:aboutProperty` (Cagle's `sh:targetSubjectsOf` + `sh:or` recipe), reason "about-relation warranted (PROV silent); no committed exemplar+query"; **auto-promote to GATED on the first committed exemplar + worked query.** **Comparable→Valuation: USE-EXISTING `prov:wasInformedBy`** (ODR-0008d Rule 3 — already designed; render, don't mint). **NearbyFacility:** Guarino notes its proximity tie is `opda:distanceInMiles` (−I) — a VALUE-SLOT; only an explicit "near *this* Property" edge is RESIDUE-PENDING. **AttachedDocument→Property** folds into the same `aboutProperty` register entry.

## Question 3 — LeaseTerm

**Unanimous.** `opda:LeaseTerm rdfs:subClassOf time:ProperInterval` is a DOLCE temporal/quality-region (−I; D18 §4.2; Guizzardi 2005 §4.2); §R1 names `time:Interval` explicitly as a value path. The `opda:leaseTerm` join from LegalEstate is a datatype/value path (`time:hasBeginning`/`hasEnd`, OWL-Time §4), not an inter-entity edge.
**Vote Q3: 7–0–0 VALUE-SLOT.**

## Question 4 — VerificationActivity + AttachedDocument

**Convergence: emit the ODR-0009-designed PROV edges; mint no bespoke `opda:` predicate.** VerificationActivity is a +I perdurant; the canonical pattern is `prov:used` (Activity→Evidence/Document, PROV-O §2) + `prov:qualifiedAttribution`/`wasAssociatedWith` (→Agent, §3) — ODR-0009 designed exactly this and it already appears in three committed exemplars (`claim-with-document-evidence.ttl`). **Moreau / Kendall / Allemang / Guizzardi / Cagle:** emit/declare-usage and render the PROV edges. **Davis (HOLD) / Guarino (DEFERRED):** PROV already navigates it — a bespoke `opda:` would be redundant; Guarino adds that AttachedDocument's evidentiary tie is already `opda:evidenceType` role-classification (ODR-0027 §R6 / ODR-0024 R7), not a new edge. Substantively unanimous: **the navigation is PROV-native; no `opda:` mint.**
**Vote Q4: USE-EXISTING-PROV** — VerificationActivity `prov:used` → Evidence/AttachedDocument, `prov:qualifiedAttribution` → Agent (the verifier organisation). Ensure emitted in exemplars (done) and **rendered** (ADR-0055). AttachedDocument's evidence role stays `opda:evidenceType`.

## Question 5 — Transaction → LegalEstate (`concerns`) + chain

**`concerns`:** Transaction is a +I Relator, LegalEstate/RegisteredTitle +I non-physical endurants (ODR-0005; D18 §4.2); `opda:concerns` is founded participation (Guizzardi 2005 §4.3.2); it is exemplar-attested (`simple-transaction-with-milestones.ttl:82`, `chain-of-transactions.ttl:46`) but TBox-undeclared, and "the estate this transaction conveys" is trivially committable. **Davis WITHDREW to GATE.**
**Chain (`dependsOnTransaction`/`chainMembers`/`chainStatus`):** Davis's own S047 "no exemplar yet" defer is **verified stale** — these are live in `chain-of-transactions.ttl:52,64,65`. Kendall, Davis, Allemang move DEFERRED → **RESIDUE-PENDING** (exemplar present; the sole remaining bar is the committed recursion query); Guarino/Guizzardi held DEFERRED at opening on the missing query.
**Vote Q5:** Transaction→LegalEstate (`concerns`) **7–0–0 GATED** (declare undeclared predicate; documentary domain/range + SHACL). Chain **RESIDUE-PENDING** (correct the stale rationale; auto-gate on the committed chain-recursion query). `concernsProperty` (Transaction→Property) confirmed already-GATED.

## Question 6 (architecture — feeds ADR-0055) — render `rdfs:subClassOf`?

**Unanimous FOR.** All seven hold that the 18 "disconnected" classes are taxonomic citizens (`prov:Activity`, `prov:Entity`, `time:ProperInterval`, Substance-Kinds), connected by subsumption the diagram never draws. **Cagle (lead):** ODR-0027 forbids *building* coded facets as subclass trees; it says nothing against *depicting* the handful of authored `subClassOf` edges + external supers — "drawing a documented super-edge is description, not a modelling commitment" ("Taxonomies are not class hierarchies"). It is documentary, never entailed (ODR-0026 §R2; ADR-0035), so it cannot distort the closure. **Davis:** FOR rendering; AGAINST any minting motivated by a renderer. **Decision:** render `rdfs:subClassOf` as a **distinct, muted, optional/toggleable layer**, `isA` visually separated from association edges. Realised in ADR-0055.

## Synthesis (Queen — Kendall)

The session closes the relationship residue under one coherent rule, with **full convergence and no held-as-live dissent**:

- **Declare-and-gate** where a predicate is already *used* in a committed exemplar but undeclared in the TBox: **`opda:partOfTransaction`** (Milestone→Transaction) and **`opda:concerns`** (Transaction→LegalEstate) — both 7–0 GATED. These are the `founds`/`mediates` rangeless defect in another guise (Guarino); leaving them undeclared is the worse outcome. Documentary `rdfs:domain`/`rdfs:range` (S050) + SHACL `sh:class` + subject-guard + one committed competency query each.
- **Use-existing-PROV** where PROV-O already names the relation: VerificationActivity `prov:used`/`qualifiedAttribution` (Q4); Comparable `prov:wasInformedBy` Valuation (Q2); NameChangeEvent `prov:wasRevisionOf`, UPRNSuccessionEvent `prov:wasDerivedFrom` (Q1). **No parallel `opda:` predicate is minted for a relation PROV already carries** (Moreau's parsimony; Davis's reuse precedent). The fix for their apparent disconnection is *rendering* (Q6), not modelling.
- **Register-and-defer (RESIDUE-PENDING)** where the relation is ontologically warranted but bar (b) is unmet: **`opda:aboutProperty`** (info-objects→Property — Moreau's load-bearing finding that PROV is silent on aboutness, conceded by Kendall) and the **chain** predicates (stale defer corrected). Named in the register with an auto-gate condition (first committed exemplar + worked query); never silently dropped.
- **Value-slot** for −I endpoints: **LeaseTerm** (`time:ProperInterval`, 7–0), the **name** in NameChangeEvent (reaffirms S047), and NearbyFacility **proximity** (`distanceInMiles`).
- **Render `rdfs:subClassOf`** (7–0) as a muted optional layer — the honest fix for the "18 disconnected" symptom.

The DA reached full convergence: WITHDRAWN-to-GATE on Q1-Milestone and Q5-`concerns` (conditions met); HELD-for-DEFER on Q2/Q4 with named re-open triggers that the RESIDUE-PENDING register satisfies; accepted RESIDUE-PENDING on chain once his own "no exemplar" rationale was shown stale. **Downstream:** ODR-0034 records the modelling verdict (kind: pattern); ADR-0056 the emission engineering (declare `partOfTransaction`/`concerns`, extend the residue register + `ci-object-property-coverage`); ADR-0055 the diagram (`rdfs:subClassOf` layer + the shipped cross-section links). Per the OPDA governance handoff, ODR-0034 stays `proposed` until the Modelling Sub-Committee draft-adopts.

## Tally appendix

Per-voice final disposition (G = GATED · P = USE-EXISTING-PROV · R = RESIDUE-PENDING · V = VALUE-SLOT · D = DEFERRED · F = FOR):

| Voice | Q1 Milestone | Q1 other events | Q2 aboutProperty | Q2 Comparable→Valn | Q3 LeaseTerm | Q4 VerifAct | Q5 concerns | Q5 chain | Q6 |
|---|---|---|---|---|---|---|---|---|---|
| Kendall (Queen) | G | V/R/D | R | P | V | G(via-PROV) | G | R | F |
| Moreau | G | P | R | P | V | P | G | G/R | F |
| Guizzardi | G | R/V | R | P | V | P | G | R | F |
| Guarino | G | V/D | R (NearbyFac V) | P | V | D (PROV suffices) | G | D | F |
| Allemang | G | G/D | R | P | V | P | G | R | F |
| Cagle | G | R | R | P | V | P | G | R | F |
| Davis (DA) | **G (withdrew)** | V/R (hold) | R/D (hold) | P | V | D (hold) | **G (withdrew)** | R | F |
| **Verdict** | **GATED 7–0** | RESIDUE/VALUE-SLOT | **RESIDUE-PENDING** | **USE-PROV** | **VALUE-SLOT 7–0** | **USE-PROV** | **GATED 7–0** | **RESIDUE-PENDING** | **FOR 7–0** |

### DA scorecard (Davis)

| Question | Opening | Withdrawal condition | Outcome |
|---|---|---|---|
| Q1 Milestone→Transaction | AGAINST (no worked query) | "worked query over a committed exemplar PROV can't answer" | **WITHDRAWN** — condition met (exemplar + part-of query; PROV has no part-of-activity) |
| Q1 other events | AGAINST | committed query needing an `opda:` hop PROV can't serve | **HELD** → VALUE-SLOT/RESIDUE-PENDING; re-open trigger recorded |
| Q2 info-objects | DEFER | committed exemplar instantiates class AND query traverses aboutness | **HELD** → RESIDUE-PENDING (register satisfies "named, not dropped") |
| Q3 LeaseTerm | concede | none reachable (−I interval) | **CONCEDED** — VALUE-SLOT |
| Q4 VerificationActivity | DEFER | an attachment PROV genuinely cannot express | **HELD** → USE-EXISTING-PROV (no opda mint) |
| Q5 concerns | AGAINST | exemplar + "estate conveyed" query | **WITHDRAWN** — condition met |
| Q5 chain | RESIDUE | committed recursive cascade query | **HELD at RESIDUE-PENDING** (stale defer corrected) |
| Q6 render subClassOf | FOR | rendering needs zero ontology change | **FOR** |

**Held-as-live unconditional dissent: none.** All holds carry named re-open triggers discharged by the RESIDUE-PENDING register.
