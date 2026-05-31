# Council Session 032 — Status state-machine grain: single scheme vs per-role (ODR-0007 OPEN item)

- **Date:** 2026-05-31
- **Records:** Resolves the [ODR-0007](../ODR-0007-transactions-and-lifecycle.md) §Rules **"Single-scheme-vs-per-role status (OPEN)"** item and **lifts ODR-0007's TBox freeze gate** on it; confirms the SKOS scheme grain in [ODR-0011](../ODR-0011-enumeration-vocabularies.md). Plan item **A1** ([outstanding-work register §A1/§E/§F](../../../plan/outstanding-work-and-modelling.md)).
- **Queen / lead voice:** Guizzardi (UFO; framing + synthesis, co-signed with Guarino). **Devil's Advocate:** Kendall (FIBO — argued FOR per-role lifecycles). **Panel:** Guarino (OntoClean), Allemang (working-ontologist pragmatism), Isaac (SKOS).
- **`consensus-mode`:** `agent-fan-out` (Agent Teams `council-007b` + `SendMessage` cross-talk). **Format:** Reduced→Full Council (ran Full — 5 expert voices). No hive-mind: a single standalone per-question tally, neither conditional nor typed-output ([ODR-0023](../ODR-0023-descriptive-layer-follow-on-council-roadmap.md) escalation rule).

## Context

[ODR-0007](../ODR-0007-transactions-and-lifecycle.md) §Rules left OPEN whether PDTF status is "one status state-machine across the transaction and all roles, or one per role", and made it a **freeze-gate condition**. Session-007 Q3 (10–0) had *conceded* single-subject schemes without re-deciding; this session adjudicates the OPEN item explicitly on the UFO Phase question, with a genuine DA per-role attack.

## Proposition P

PDTF status is a **single** status state-machine over the `opda:Transaction` Relator — `participantStatus` (`Proposed|Invited|Active|Removed`) and `milestones` (listed/started/completed/legalForms) are anti-rigid UFO **Phases** backed by **one** participant-status SKOS scheme + **one** milestone scheme ([ODR-0011](../ODR-0011-enumeration-vocabularies.md)); **no** per-role status state-machines.

## Questions + verdicts

- **Q1 — single vs per-role?** **AFFIRM (single). 5–0–0.**
- **Q2 — Phase identity: role-independent (→ single) or role-specific (→ per-role)?** **AFFIRM (role-independent). 5–0–0.**
- **Q3 — SKOS realization: one scheme each (+ `skos:Collection` for role views) vs per-role schemes?** **AFFIRM (one scheme each). 5–0–0.**

## Dialectic

**The per-role case (Kendall, DA).** Opened strongly: the flat 4-state enum captures only *envelope-membership*, not the *operational lifecycle* a Conveyancer/Buyer/Lender traverses; "Active" is role-specific (different contingent properties per role) and one `skos:definition` per concept cannot carry the divergent senses; FIBO `fibo-fnd-pty-rl` attaches lifecycle to the relationship a role realises, per relationship type. She **HELD** Q1/Q2/Q3 on a falsifiable withdrawal condition: *concede iff `Proposed|Invited|Active|Removed` is provably the whole participant-status surface across base + overlays* — i.e. iff the role-divergent "Active" senses are absent from the PDTF data.

**The single-scheme case.**
- **Guizzardi** — the bearer of `participantStatus` is the role-PLAY (qua-individual/Mode), existentially dependent on and individuated by the *single* `opda:Transaction` Relator; the Relator supplies one unity criterion, so its role-plays' phases occupy ONE phase-space. "Active" is one Phase universal under many bearers. (Guizzardi 2005 Ch.4; gUFO 2019.)
- **Guarino** — corrected Q2's framing: a Phase (−R) carries *no* identity of its own; the real test is bearer-count + OntoClean partition admissibility — a single backbone holds iff every member has uniform definedness with no straddler. `Active/Removed/Proposed/Invited` are defined uniformly across all role-plays → sound single backbone. (Guarino & Welty, OntoClean 2009.)
- **Allemang** — reasoner-independence: any "lifecycle of role X" query is served by a role-FILTER (`?p opda:participantStatus ?s ; opda:role ?r . FILTER …`) or an `sh:in`/`sh:qualifiedValueShape` over one scheme; per-role schemes change no answer → decorative → must not be minted. (SWWO 3e 2020.)
- **Isaac** — per-role schemes would mint duplicate `Invited` concepts and **violate ODR-0011 §1a's one-primary-scheme integrity constraint** (`skos:inScheme` exactly 1); role subsets belong in `skos:Collection` (`skos:member`, non-exclusive), not new schemes. (SKOS Reference 2009 §S27–S31, §S40–S46.)

**Queen's empirical adjudication (the hinge).** Kendall asked the panel to meet her on the data. The Queen searched the full PDTF v3 schema (base `pdtf-transaction.json` + all overlays) + `data-dictionary-canonical.json`: the participant/role status surface is **`participantStatus` only**, enum exactly `Proposed|Invited|Active|Removed`, one un-role-discriminated field across all 12 `role` values; **zero** per-role status/stage/lifecycle enums exist; the other `*status` fields (`movementStatus`/`conservatoryMovementStatus`/`porchMovementStatus`) are building structural-movement (subsidence), not participant lifecycle. **Kendall independently verified the same** (incl. live UI usage reading `participantStatus` as one flat value across roles) and **WITHDREW on all three**: the role-divergent "Active" senses are real in the conveyancing world but are **not data PDTF records** — modelling a per-role machine the source lacks is exactly the speculative over-modelling the Council forbids (the S026 latent/unexercised disposition). A **second** straddler test (raised via Guizzardi's qua-relator framing) also failed: the milestone phase-set is a single fixed universe with no variant keyed to `propertyDependencyType`, and a remortgage/transfer is a *related* Transaction (ODR-0007 Chain-as-relation), not a divergent phase-universe — so **neither** the participant-status nor the milestone backbone has a nameable straddler.

## Tally appendix

| Voice | Q1 single | Q2 role-independent | Q3 one-scheme |
|---|---|---|---|
| Guizzardi (lead) | AFFIRM | AFFIRM | AFFIRM |
| Guarino | AFFIRM | AFFIRM | AFFIRM |
| Allemang | AFFIRM | AFFIRM | AFFIRM |
| Isaac | AFFIRM | AFFIRM | AFFIRM |
| Kendall (DA) | AFFIRM (conceded) | AFFIRM (conceded) | AFFIRM (conceded) |
| **Count** | **5–0–0** | **5–0–0** | **5–0–0** |

**DA scorecard (Kendall):** Q1 **WITHDRAWN** (withdrawal condition met — corpus carries no role-specific lifecycle data) · Q2 **WITHDRAWN** ("Active" univocal as the schema records it) · Q3 **WITHDRAWN** (one scheme; no federation needed). Milestone-half conceded from the outset. Her opening per-role attack stands as the **test P had to pass, and passed** — a clean full-withdrawal session, zero held-as-live dissents.

## Refinement adopted (improves the model — Kendall, concurred Guizzardi/Guarino)

Single scheme **each**, but **two distinct Phase-bearers** — do not flatten both onto "the Transaction":

- **Milestone-Phase** bears on `opda:Transaction` (the Relator): Marketing→UnderOffer→Exchanged→Completed.
- **participantStatus-Phase** bears on the **participant's role-play** (qua-individual within the Relator), per ODR-0011 §8a target "Kind-in-phase (Participant)" — **not** on the Transaction directly.

This tightens the §8a SHACL targeting and is fully consistent with the AFFIRM.

## Re-open triggers (future-evidence watches — NOT held-as-live dissents)

**S032 is a clean full-withdrawal session: ZERO held-as-live dissents on Q1/Q2/Q3.** The DA (Kendall) is **fully WITHDRAWN** on the evidence — she named no straddler because none exists in schema OR emitted TTL. Per [ODR-0001](../ODR-0001-linked-data-council-methodology.md) §DA-discipline a **WITHDRAWN-with-re-open-trigger is a *future-evidence watch*, distinct from a live dissent** (cf. Gandon S011, Knublauch S004 full withdrawals). The two triggers below bind no one unless future evidence fires them.

1. **Participant-status (the SET-test + Isaac's three-branch routing).** The single-scheme commitment itself re-opens **only** on genuine **definitional divergence** — a role for which a status value's *definition* differs (Isaac's case 3) — which is **absent in both the schema and the emitted TTL** (`opda-vocabularies.ttl` defines all four states participant↔Transaction, zero role-reference). Lesser future variation does **not** reopen it and routes elsewhere: a role-specific **subset** of states (case 1) → `skos:Collection` + overlay `sh:in` (ODR-0010), never a scheme split (which would breach the §1a one-primary-scheme IC); role-specific **transitions** (case 2) → a role-keyed SHACL-AF rule (ODR-0013/0017), since a scheme enumerates nodes, not the transition graph. *Illustration:* a Conveyancer "Disinstructed" reopens nothing unless its definition is irreducible to `Removed`. (Co-signed Guizzardi/Guarino/Isaac/Kendall.)
2. **Milestone-scheme subkind scope** (Guizzardi's narrow watch; does NOT touch participant-status). Current evidence closes this too: the milestone phase-set is a **single fixed universe** (`pdtf-transaction.json` — no variant keyed to `propertyDependencyType`), and a Remortgage/Transfer is a **related Transaction** (ODR-0007 Chain-as-relation), not a Transaction with a divergent phase-set — so the milestone straddler test also fails today. Watch: a future remortgage/transfer-only exemplar surfacing a genuinely divergent milestone phase-set → a subkind-scoped `skos:Collection`/overlay on the **milestone** scheme (never participant-status).

## A9 note

No new `kind: pattern` ODR is produced — the verdict resolves an OPEN item in ODR-0007 and confirms the scheme grain whose UFO category (Phase) + identity framework is already owned by [ODR-0011](../ODR-0011-enumeration-vocabularies.md) §8a (Phase-label; `participantStatus`). No fresh identity criterion is minted; the only sharpening is the **bearer** clarification (milestone → `opda:Transaction`; participantStatus → role-play). A9 relaxed (amendment, not a new IC).

## Consequences / dispositions

- **ODR-0007 §Rules** — the OPEN "Single-scheme-vs-per-role status" item is **resolved: single scheme each**; the **freeze gate on this item is lifted** (the ODR-0005 identity gate having already cleared). The two-bearer refinement is recorded. `council:` adds session-032.
- **ODR-0011** — confirm **one** `opda:ParticipantStatusScheme` (Phase-label; bearer = participant role-play) + **one** `opda:MilestoneScheme` (Phase-label; bearer = `opda:Transaction`); role views via `skos:Collection`, never per-role schemes (the §1a one-primary-scheme IC forbids the duplication). The SET-test re-open trigger is recorded.
- Greenfield first-cut — no WG; the directing authority + Council ratify (proposed→accepted handled by the records' own status).

## References

- [ODR-0007](../ODR-0007-transactions-and-lifecycle.md) §Rules (the OPEN item + freeze gate); [ODR-0011](../ODR-0011-enumeration-vocabularies.md) §8a (Phase-label category; `participantStatus`); [ODR-0006](../ODR-0006-agents-and-roles.md) (RoleMixins founded by the Transaction Relator); session-007 Q3 (the prior 10–0 concession this re-decides explicitly).
- Methodology: [ODR-0001](../ODR-0001-linked-data-council-methodology.md). Plan: [outstanding-work-and-modelling §A1/§E/§F](../../../plan/outstanding-work-and-modelling.md).
- Grounding sources cited by the panel: Guizzardi, *Ontological Foundations for Structural Conceptual Models* (2005) Ch.4 + Almeida et al. gUFO (2019); Guarino & Welty, "An Overview of OntoClean" (2009); Allemang, Hendler & Gandon, *Semantic Web for the Working Ontologist* (3e 2020); W3C *SKOS Reference* (2009); FIBO `fibo-fnd-pty-rl` (PartyInRole).
