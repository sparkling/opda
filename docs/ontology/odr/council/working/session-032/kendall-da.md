# Kendall — Devil's Advocate position on S032 (single vs per-role status state-machine)

**Role:** DEVIL'S ADVOCATE. Mandate: argue the STRONGEST case FOR per-role status state-machines (i.e. AGAINST Proposition P). Concede only if the single-scheme case genuinely defeats mine; if I hold, state the re-open trigger.

**Proposition P (under attack):** PDTF status = a SINGLE status state-machine over the `opda:Transaction` Relator — `participantStatus` + `milestones` as anti-rigid Phases, ONE shared participant-status scheme + ONE milestone scheme; NO per-role schemes.

---

## 0. The procedural fact I must surface first (DA duty of candour)

The convening framing presents S032 as the live adjudication of ODR-0007 §Rules' OPEN item ("single status state-machine across the transaction and all roles, or one per role — deferred to this ODR's own follow-up council session"). It is. But two upstream moves have already **pre-supposed** the answer without ever **arguing** it, and the Council must not mistake a pre-supposition for a settled question:

1. **ODR-0011 §8a** typed the single JSON enum `participantStatus` as ONE "Phase label" scheme — "Labels for intra-Kind phases a Substance Kind passes through", SHACL-targeted at "Kind-in-phase (Participant)". That is a *per-scheme UFO-category typing of one enum*. It is NOT a finding that a Buyer's lifecycle and a Conveyancer's lifecycle are the same state-machine. It typed the enum that the schema happens to carry; it did not ask whether the schema's single `participantStatus` enum is itself an under-modelling.
2. **Session-006 Q7** voted 10-0 to **CONCEDE** to ODR-0011 §8a — and the enterprise-pair (my own S006 position, with Davis) wrote the concession explicitly as "S006 consumes the scheme **without re-deciding**." A concession-without-re-deciding is the *opposite* of an adjudication. S006 deferred; it did not decide.

So the live question is genuinely open, and the burden on P is to show the single scheme is *correct*, not merely *inherited*. I will now argue it is not — that per-role lifecycle distinctions are real, queryable, and lost under one scheme.

---

## Q1 (core): single vs per-role state-machine?

**VERDICT: REVISE** — toward a **two-tier** model: one transaction-milestone Phase scheme (P is right there) PLUS **per-role participant-status schemes** keyed to the role each participant plays. A flat single `participantStatus` scheme over "Participant" loses real lifecycle structure.

**Rationale.** In FIBO, a party-in-role is not a bearer with a generic status; it is a `Party` playing a specific `PartyInRole` whose *lifecycle is defined by the role's relationship*, not by the bearer. FIBO models distinct relationship lifecycles per role precisely because "in force / proceeding / terminated" means different operational things for a `Borrower` (loan drawn, servicing), a `Lender` (committed, disbursed), and a `Guarantor` (contingently liable, called). PDTF's `participantStatus` enum (`Proposed | Invited | Active | Removed`) is a thin *engagement-of-a-party-record* state — it tracks whether a person has been **added to the transaction data-sharing envelope**, which is genuinely role-independent. But that is NOT the lifecycle the convening question is about, and it is NOT the lifecycle a conveyancing or AML consumer needs. A Conveyancer's *operational* lifecycle (instructed → ID-verified → searches-ordered → exchange-ready → completed → file-closed) and a Buyer's *operational* lifecycle (offer-made → offer-accepted → mortgage-offered → exchanged → completed) are distinct state-machines with distinct transitions, distinct guards, and distinct terminal states. Collapsing them into one `Proposed|Invited|Active|Removed` scheme does not unify them — it *throws them away* and keeps only the envelope-membership status.

**Citation.** FIBO Foundations, *Parties and Roles* (`fibo-fnd-pty-rl`) and FIBO-BE *Functional Entities* — `PartyInRole` is the relationship-realisation construct; lifecycle states attach to the *relationship a role realises*, not to a shared party-status enum. Kendall & McGuinness, *Ontology Engineering* (2019), Ch. on roles and relationships: the identity of a party is rigid; the *states it occupies* are properties of the relationships it enters, which differ by relationship type.

---

## Q2 (Phase identity — my strongest ground): is "Active" role-independent or role-specific?

**VERDICT: REJECT P** — "Active" is **role-specific**. This is the load-bearing defect in P.

**Rationale.** UFO Phases partition the instances of a Kind by a *contingent intrinsic property* — they are entered and left as that property changes (Guizzardi 2005, Ch. 4). The single-scheme proposal makes "Active" a Phase of *the Transaction* (or of an undifferentiated "Participant"). But ask the partition question UFO demands: **Active with respect to what contingent property?** For a Buyer, "Active" = *an accepted offer is proceeding* (the offer-acceptance fact holds). For a Conveyancer, "Active" = *instructed and working the file* (the engagement fact holds, and ID/AML checks have cleared so work may proceed). For a Lender, "Active" = *a mortgage offer is live and not yet drawn*. These are **different contingent properties**, hence — on UFO's own partition criterion — **different Phases that happen to share an English label**. A single SKOS concept `:Active` with one `skos:definition` cannot carry three mutually-inconsistent definitions; per ODR-0011 §2a (Pandit PII-strict amendment), `skos:definition @en` is *exactly 1* and is `sh:Violation`-severity for PII-bearing schemes — and a participant-status scheme IS PII-bearing (§8a flags `participantStatus` with "DPV processing-event trigger"). So the single-scheme model is forced either to (a) write one vacuous definition ("the participant is active") that is useless to a conveyancing or AML consumer, or (b) violate its own cardinality rule. Per-role schemes dissolve the problem: `:buyerActive`, `:conveyancerActive`, `:lenderActive` each carry one precise, regulator-sourceable definition.

This is exactly the move S005 made for identity (distinct ICs for `LegalEstate` vs `RegisteredTitle` rather than one conflated scheme) and S006 Q1 made for Person-vs-Organisation IC. The Council has repeatedly held that **a shared label across distinct contingent criteria is an under-modelling**. "Active" is the status-layer instance of the same defect.

**Citation.** Guizzardi (2005) *Ontological Foundations for Conceptual Modeling*, Ch. 4 — a Phase is founded on a contingent intrinsic property; the partition is *by that property*. Guizzardi, Wagner, Guarino & van Sinderen (2004) "An Ontologically Well-Founded Profile for UML Conceptual Models" — phase-partitions are criterion-relative. ODR-0011 §2a (this corpus) — `skos:definition @en` exactly-1, `sh:Violation` for PII schemes: a single `:Active` cannot carry role-divergent definitions without breaching it.

---

## Q3 (SKOS realisation): one scheme vs per-role schemes?

**VERDICT: REVISE** — per-role `skos:ConceptScheme`s for **participant status**, federated by a shared abstract status scheme via `skos:broader` / `skos:exactMatch` where states genuinely align; ONE scheme for **transaction milestones** (milestones ARE properties of the Transaction Relator, so P is correct for that half).

**Rationale.** ODR-0011's own machinery makes per-role schemes the *low-cost* option, not a proliferation cost. The §8a framework already types schemes per-UFO-category; §1a already mandates "every enum a scheme" with no floor ("no floor: ... PII-sensitive enums need the scheme-IRI to land DPV co-annotations on"). A per-role status scheme is simply the recognition that the PDTF `participantStatus` enum is *one serialisation* of what are really N role-indexed lifecycles — the same way S023 found that one JSON enum often unpacks into multiple SKOS value-sets (378 enums → 54 value-sets, but also the converse: collapsed enums that *hide* distinctions). Cross-scheme alignment is exactly what SKOS `skos:broader`/`skos:exactMatch` is *for* (ODR-0011 §External-schemes rule). Concretely: mint `opda:participantEngagementStatusScheme` (the role-independent envelope-membership states — `Proposed|Invited|Active|Removed`, genuinely shared, P's scheme) AND per-role *operational* lifecycle schemes (`opda:conveyancerLifecycleScheme`, `opda:buyerLifecycleScheme`, …) where a regulated/conveyancing consumer needs them; align the abstract states with `skos:broader`. The data dictionary's *single* `participantStatus` enum maps to the engagement scheme; the operational lifecycles are the modelling *gain* the ontology adds over the flat schema (the whole point of this programme per ODR-0003).

**Citation.** W3C SKOS Reference (Miles & Bechhofer 2009) §8 (`skos:broader`/`narrower` for hierarchy) + §4 (mapping properties for cross-scheme alignment). ODR-0011 §1a (every-enum-a-scheme, no floor) + §External-schemes-reused rule. FIBO relationship-lifecycle precedent (per Q1).

---

## DA disposition per question — FINAL (after testing my own withdrawal conditions against the corpus)

A fair DA checks its own trigger before holding. I did. **Corpus evidence (decisive):**

- `source/03-standards/schemas/src/schemas/v3/pdtf-transaction.json` (canonical PDTF v3 transaction): **exactly one** `participantStatus` enum — `Proposed | Invited | Active | Removed` — on the participant element, structurally identical across all 12 `role` values. Role-independent in the data: one field, one value-set, every role.
- Full-corpus grep (base + all 10 overlays): **zero** per-role status/stage/lifecycle enums. Other `status`-named leaves are unrelated (search status; `movementStatus`/`porchMovementStatus` = subsidence movement, not participant lifecycle).
- Live consumer usage (`ConveyancingDiligence.jsx`, `SellerConsentManagement.jsx`): reads `participantStatus` as one flat value across all participant rows regardless of role.
- Emitted scheme already exists: `source/03-standards/ontology/opda-vocabularies.ttl:2188` — four concepts, one `skos:definition` each.
- **Milestone straddler test (run on Guizzardi's "transaction-qua-sale vs -remortgage" prompt):** the milestone set (`pdtf-transaction.json:37106`) is a **single fixed phase-universe** — listed → legalForms → soldSubjectToContract → searches → enquiries → exchangeOfContracts → completion — with NO variant keyed to `propertyDependencyType` (`Sale|Purchase|Remortgage`, `:21746`). The chain element carries only a dependency-type label + dependent-property address, no milestone sub-machine. A remortgage is a *related Transaction* (ODR-0007 Chain-as-relation-between-Transactions), not a Transaction with a divergent phase-set. **Both** straddler tests (participant-status AND milestone) fail conclusively.

**UFO grounding accepted (Guizzardi, conceded as correct rationale — not mere Occam):** the bearer of `participantStatus` is the **role-play qua-individual** (the Mode by which a Person participates in THIS `opda:Transaction`), existentially dependent on the single Relator. One Relator unifies all role-plays ⇒ one shared phase-space instantiated per role-play, NOT a state-machine per role *type*. "Active-qua-this-buyer-play" and "Active-qua-that-seller-play" are the same Phase universal at two bearers; role-relativity of the *bearer* ≠ role-relativity of the *scheme* (Guizzardi 2005 §4.x qua-individuals; Almeida et al. gUFO 2019 `gufo:Role`). This is *why* the carve-out cannot be earned absent a divergent phase-universe, and none exists.

This **meets the Q2 withdrawal condition I stated.** The role-divergent "Active" senses I posited are real in the conveyancing *world* but are NOT data PDTF records — `participantStatus` carries only envelope-membership, univocally. Modelling a per-role state-machine the source lacks would be speculative over-modelling (ODR-0008 / S023 "import what the data carries" discipline forbids it).

| Q | FINAL disposition | Basis |
|---|---|---|
| Q1 (single vs per-role) | **WITHDRAWN → AFFIRM P** | Per-role status is latent/unexercised in the corpus (S026 Room/Building disposition). One participant-status scheme + one milestone scheme. |
| Q2 ("Active" identity) | **WITHDRAWN → AFFIRM** | "Active" is role-independent *as the schema records it* — one contingent property (engaged-member-of-envelope). Univocal definition correct at PDTF's granularity, not vacuous. My opening attack was the test P had to pass; it passed. |
| Q3 (SKOS realisation) | **AFFIRM P** | One `participantStatus` scheme + one milestone scheme per ODR-0011 §8a (already emitted). No federation needed. Milestone half conceded from the outset. |

**Net DA stance: WITHDRAWN on all three.** The single-scheme proposition survives because the source data carries a single role-independent status surface, not because the abstract universal-vs-specific argument was won. P passed the test.

**One refinement I do NOT concede (a tightening, not a hold):** P's framing flattens participant-status and milestones into "Phases of the Transaction." They are different Phase-*bearers*: **milestone**-Phase bears on `opda:Transaction` (Marketing→UnderOffer→Exchanged→Completed); **participantStatus**-Phase bears on a *participant's role-play within* the Relator (ODR-0011 §8a targets it "Kind-in-phase (Participant)", NOT the Transaction). ODR-0007 §Rules already hedges correctly ("Phases of the Transaction **or of a participant's role-play**"). Synthesis should state crisply: *single scheme each, but two distinct Phase-bearers.* Consistent with full AFFIRM; tightens §8a SHACL targeting.

**Re-open trigger (recorded per §Consequences template; confirmed verbatim with Queen):** *Re-open per-role participant-status schemes when a future PDTF schema version or named consumer (AML onboarding / conveyancing case-management / lender) introduces role-specific operational lifecycle states beyond the four envelope values `Proposed|Invited|Active|Removed`.* Until such data/query exists, P stands and per-role schemes would be modelling fiction.

**Disposition class (precision for the scorecard):** WITHDRAWN, **not** held-as-live. I do not disagree with P; the recorded re-open trigger is a future-evidence *watch*, not a live dissent. S032 is therefore a **clean full-DA-withdrawal** session (cf. Gandon S011, Knublauch S004): Q1 WITHDRAWN / Q2 WITHDRAWN / Q3 AFFIRM (no contest), zero held-as-live dissents.

## Anticipated rebuttals I must answer (Guizzardi / Guarino / Allemang defending P)

- **"'Active' is one universal Phase; role differences are sub-phases or distinct *properties*, not distinct schemes."** — Reply: a sub-phase partition IS a per-role scheme by another name (the sub-phases are role-indexed and carry role-divergent definitions); and "distinct properties" concedes my point — if the Buyer's proceeding-offer and the Conveyancer's instructed-and-working are *distinct properties*, they are distinct Phase-foundations (Guizzardi 2005 Ch.4), so one `:Active` concept is the wrong granularity. Either way the flat single scheme loses the distinction.
- **"PDTF only records `Proposed|Invited|Active|Removed` — you're modelling a lifecycle the data doesn't carry."** — This is the strongest counter and it is exactly my Q2 *withdrawal condition*. The empirical question routes to the corpus: do the conveyancing overlays (LPE1/TA-forms/CON29 workflow states) or AML/onboarding states surface role-specific lifecycle data? If genuinely no, I concede Q2 and withdraw Q1 to a deferred trigger. If yes (and conveyancer-instruction / ID-verification / searches-ordered states are commonly present operationally), per-role status is load-bearing and P under-models.
- **"Per-role schemes proliferate; ODR-0011 favours economy."** — Reply: ODR-0011 §1a is explicitly *no-floor* ("every enum a scheme"); per-role schemes federated by `skos:broader` are *more* idiomatic SKOS, not less. The cost is generator emission, which is mechanical (ODR-0004 §6a).
