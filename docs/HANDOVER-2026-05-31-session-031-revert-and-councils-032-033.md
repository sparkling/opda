# Handover — session-031 revert, the outstanding-work plan, CI green, and Councils 032 + 033 (2026-05-31)

**Author:** Henrik (with Claude). **Scope:** one long session that (1) **reverted a mistaken council record** (`session-031`) and corrected the misunderstanding behind it, (2) **kept** the WG-gate removal but **reverted ODR-0016 → proposed** after a flip-audit, (3) authored the **outstanding-work-and-modelling plan**, (4) **greened two pre-existing red CI workflows**, and (5) **ran the two owed councils — session-032 (ODR-0007) and session-033 (ODR-0012)** — one at a time via `agent-fan-out`. **Status: ~13 commits on `main`, ALL pushed (HEAD `ddca9da`); the two previously-red CI workflows are now GREEN; opda-gen gates green (267–268 tests).**

> Continues [HANDOVER-2026-05-31-g-walk-execution-council-028-remediation.md](./HANDOVER-2026-05-31-g-walk-execution-council-028-remediation.md). That session ended at the curated-G walk 239/239 + ODR-0024; this session began as a "resolve all the deferred triggers" request and turned into a **cleanup + two councils**.

---

## TL;DR

A "resolve all triggers / do all changes" request was taken too far: I authored **`session-031` ("schema-accommodation scope")** which recast the corpus's *consumer-driven / YAGNI* deferrals as **"wait-for-a-future-PDTF-schema-version" gates** — a framing that exists nowhere in the records. The directing authority caught it, and the **root cause was a wrong mental model of overlays.** The corrected understanding (now load-bearing for everything): **overlays are JSON-Schema form artefacts modelled as SHACL profile graphs over a *fixed* `opda:` TBox — they constrain, they do not declare; class-per-overlay was rejected *unanimously* at S001; there is no "overlay" concept in the ontology; the form-detail layer is deliberately subtractive (ODR-0021).** session-031 was **reverted** in full (file deleted; all ripple edits across ODR-0003/0008/0016/0023/0024 + ADR-0005/0034 expunged; `git grep session-031` → 0). The **WG-gate removal was kept** (greenfield, no WG — your directive), but a **flip-audit** found **ODR-0016** was wrongly flipped (it is a deferred-named *stub*, not a WG-gated complete record) and **reverted it to `proposed`** — the only over-reach among the 17 flips. The **gUFO typing pass (ADR-0034)** was kept but **re-grounded on session-029** (its real authority). Two **pre-existing red CI workflows** were fixed. Then the two owed councils ran: **session-032** (ODR-0007 status grain → **single scheme**, clean 5–0–0) and **session-033** (ODR-0012 governance class-vocab → **REVISE/reconcile a stale record**, with a **live DA dissent** and **three verified emission defects** found). The **[outstanding-work plan](./plan/outstanding-work-and-modelling.md)** (§A–F) is the new living register.

---

## What shipped — ~13 commits on `main` (all pushed; HEAD `ddca9da`)

| Commit | What |
|---|---|
| `281d892` | WG-gate removal (17 records `proposed→accepted` + "no WG" reframing) + **session-031** + G25/**ADR-0034** gUFO typing *(session-031 parts later reverted; WG + gUFO kept)* |
| `c7923fb` | ODR-0003 retirement-criterion nuance *(later reverted)* |
| `8fbe0b1` | **CI fix** — BASPI5 G19 anchor (`A1.1.5.uprn`→`A1.1.5`) + G3 sanctioned-shared-ref + data-dict test-skip |
| `519207e` | record the BASPI5 G19-vs-G3 reconciliation (ADR-0005 §G, per §G1) |
| `394a63e` | **revert session-031** — delete + expunge all schema-evolution-gate ripple edits |
| `6be5bb8` | **plan doc** — `docs/plan/outstanding-work-and-modelling.md` (§A modelling / §B engineering / §C deferred-by-discipline / §D decisions) |
| `6b6f1a9` | plan §E (council convening + swarm config) + §F (execution plan) |
| `992eda0` | **revert ODR-0016 → `proposed`** + audit of all 17 WG-flips (only over-reach) |
| `d16113e` / `18766a0` | **Council session-032** (ODR-0007 status grain) + the DA-disposition correction |
| `5bf3d95` / `a9de0ef` | **Council session-033** (ODR-0012 governance class-vocab) + a link-depth fix |
| `ddca9da` | plan: mark A1/A2 resolved + add **B4** (governance-emission-fix work item) |

---

## ⚠ Things a reader MUST know

1. **`session-031` was a mistake and is fully reverted. Do NOT resurrect the "schema-accommodation scope" / "wait-for-a-future-schema-version" framing.** The corpus's deferrals are **consumer-driven / YAGNI** (a named query, a SHACL validator, an identity fact) — *not* future-data gates. The accurate register is [the plan doc](./plan/outstanding-work-and-modelling.md).
2. **Overlays are SHACL-only form-profiles over a fixed TBox** ([ODR-0010](./ontology/odr/ODR-0010-overlay-profile-mechanism.md); class-per-overlay rejected unanimously at S001). There is **no overlay entity / no "overlay" concept** in the ontology, and the form-detail layer is **deliberately subtractive** ("the SHACL overlay IS the form; stop wrapping it" — [ODR-0021](./ontology/odr/ODR-0021-deferred-form-profile-layer-enhancements.md)). The 30 thin overlay profiles are the *decided baseline + a tracked rollout* (ADR-0029 / plan **B1**), **not** "skipped models." Memory: [[opda-greenfield-no-wg-gate]].
3. **WG-gate removal kept; ODR-0016 is the lone exception.** All 17 flipped records are correctly `accepted` *except* **ODR-0016**, which is back to **`proposed`** — it is a deferred-named *stub* (its `## Rules` are placeholder until Session 016 runs), so its `proposed` was never a WG gate. The flip-audit confirmed it was the only over-reach.
4. **gUFO typing (ADR-0034) stands on session-029 Q5 (6–0–0), NOT session-031.** It asserts `rdf:type gufo:Quality` on the 5 uncontested Quale-in-Region Property leaves in `opda-descriptive-annotations.ttl` (annotation graph only). ADR-0005 §G25 closed.
5. **session-033 carries a LIVE DA dissent (Allemang, HELD)** — unlike session-032's clean full-withdrawal. The deferral of anything beyond the emitted reference-not-import lawful-basis floor is held-as-live with re-open triggers. Don't read session-033 as a clean AFFIRM.
6. **Three verified governance-emission defects (plan B4 / ADR-0005 §G)** — concrete bugs in the *accepted, emitted* surface: **D1** the lawful-basis SHACL gate binds `dpv-pd:` but queries core `dpv:hasLegalBasis` (checks a non-existent predicate); **D2** `opda:lawfulBasis` is overloaded (PD-categories in agent annotations); **D3 (highest value)** `opda:isPIIBearing` is asserted on **zero** classes, so the Phase-1 PII-co-annotation rule fires on the empty set — **the PII floor is currently UNENFORCED**. A generator fix, independent of any new class vocab.
7. **AgentDB re-index is PENDING (plan B3).** The `ruflo` MCP was disconnected for most of the session, then **killed for this project mid-session and reconnected by the user via `/mcp`** (the other project's `ruflo-patch` MCP was left untouched). session-032/033, ADR-0034, ODR-0016, and the amended records still need `adr-index`/`odr-index`. Records were authored directly; file + frontmatter edges are authoritative in the interim. Memory: [[opda-odr-format-vs-skills]].
8. **Councils ran as `agent-fan-out` via Agent Teams** (`TeamCreate council-007b` / `council-012b`, `SendMessage` cross-talk), **not hive-mind** — correct per the [ODR-0023](./ontology/odr/ODR-0023-descriptive-layer-follow-on-council-roadmap.md) escalation rule (neither verdict was conditional or typed-output). Memory: [[opda-avoid-hive-mind-cost]]. The teams are deleted (cleaned up).

---

## The two councils (this session's substantive output)

**[session-032](./ontology/odr/council/session-032-status-scheme-grain.md) — ODR-0007 status-machine grain.** Q: one status state-machine across the transaction + all roles, or per-role? **AFFIRM single scheme, 5–0–0** on all three questions. DA **Kendall** (FIBO per-role lifecycle) ran a genuine case, set a falsifiable condition, tested it on the corpus, and **fully WITHDREW** (the four envelope states `Proposed|Invited|Active|Removed` are the *whole* participant-status surface; the milestone straddler test failed too). Refinement adopted: **two distinct Phase-bearers** (milestone-Phase → `opda:Transaction`; participantStatus-Phase → the role-play). **Routed:** ODR-0007 OPEN item resolved + **freeze gate lifted**; ODR-0011 records one `ParticipantStatusScheme` + one `MilestoneScheme` (role views via `skos:Collection`, never per-role schemes) + the SET-test re-open trigger.

**[session-033](./ontology/odr/council/session-033-governance-class-vocab.md) — ODR-0012 lawful-basis/consent/purpose class vocab.** A split (per-question **3–2**), **stale-record-dominated** session. Pre-flight surfaced that **session-012 already ruled this 10-0** (lawful-basis via reference-not-import; Pandit vindicated) while **ODR-0012's body still said "open"** — a stale-record defect. DA **Allemang**'s decisive (verified) point: reference-not-import gives OPDA *references + SHACL*, **not** a model-constraining lattice (that would need `owl:import DPV`, out of scope). **Routed:** ODR-0012 §"Live question" + §Consequences **reconciled**; consent/policy *instances* + any import-lattice → Phase-2; the **`opda:PurposeScheme` model ratified** (ODR-0011 §8a) with **emission gated on its first driver**; DA dissent held-as-live; **3 emission defects** logged (B4 above).

---

## What's open / next steps (suggested order)

1. **B3 — AgentDB re-index** (`adr-index` / `odr-index`): now the MCP is reconnected and the doc churn has settled. Registers session-032/033, ADR-0034, and the amended records. Quick.
2. **B4 — the governance-emission fix** (D1/D2/D3 above): a generator fix to the ODR-0012/0018 emitter. **D3 is the highest-value action in the whole governance question** — it activates Phase-1 PII enforcement that is currently a no-op. Byte-identity-affecting (regenerate + re-pin + tests).
3. **B1 — overlay-profile leaf-enumeration rollout** ([ADR-0029](./adr/ADR-0029-overlay-profile-emitter-generalisation-and-rollout.md)): 30 thin profiles → enumerate each form's leaves into SHACL; refactor baspi5's bespoke builder → generic `_build_profile`. Largely unblocked (Category-G walk landed). The biggest single piece; may surface A4 descriptive-council triggers.
4. **B2 — BASPI5 MVP round-trip demonstration** (ODR-0003 retirement signal 1). Depends on B1.
5. **A3 — ODR-0016 VC/DID binding council**: trigger-gated (3 named triggers) — runs as **hive-mind/byzantine** (plan §E) only when a trigger fires or on a deliberate go. The purpose-scheme emission also gates on its first driver (ODR-0009 worked examples).
6. **Programme retirement check** (ODR-0003): MVP round-trip closes (B2) AND every linked ODR `accepted` — note ODR-0016 is back to `proposed` (deferred-named stub).

---

## Key pointers

- **The living register:** [plan/outstanding-work-and-modelling.md](./plan/outstanding-work-and-modelling.md) — §A modelling · §B engineering (incl. B4) · §C deferred-by-discipline · §D cleanup decisions · §E council convening + swarm config · §F execution plan.
- **The councils:** [session-032](./ontology/odr/council/session-032-status-scheme-grain.md) (+ working/session-032/kendall-da.md) · [session-033](./ontology/odr/council/session-033-governance-class-vocab.md). **Routed into:** ODR-0007, ODR-0011, ODR-0012, ADR-0005 §G.
- **The gUFO work:** [ADR-0034](./adr/ADR-0034-gufo-property-typing-pass.md) (grounded on session-029 Q5); emitter `tools/opda-gen/src/opda_gen/emitters/annotations.py::build_descriptive_annotations`.
- **The CI fixes:** `tools/opda-gen/src/opda_gen/emitters/profiles.py` (real `baspi5Ref`), `ci/descriptive_roundtrip_test.py` (`_SCHEMA_SANCTIONED_SHARED_REFS`), `tests/test_leaf_categoriser.py` (dict-skip). Both previously-red workflows (`Ontology byte-identity`, `BASPI5 round-trip MVP gate`) are now GREEN.
- **Run the gates:** `cd tools/opda-gen && .venv/bin/python -m pytest -q` (267–268 pass) and `.venv/bin/python -m opda_gen {ci-byte-identity | ci-three-graph | ci-dup-declaration | ci-category-g-coverage | ci-profile-contract | ci-descriptive-roundtrip}`. Coverage/roundtrip need the **gitignored** data dictionary (local-only).
- **The `council` skill:** user-level `~/.claude/skills/council/`; convene via Agent Teams + `agent-fan-out`. Escalate to hive-mind only on the ODR-0023 trigger (A3 is the candidate).

## Memory

Touched/relevant: [[opda-greenfield-no-wg-gate]] (overlays-are-SHACL-only correction worth folding in), [[opda-avoid-hive-mind-cost]] (councils ran fan-out), [[opda-council-rerun-after-failure]] (session-031 was a mistaken record; the successful deliverable is the revert + the two real councils), [[opda-odr-format-vs-skills]] (B3 re-index pending). **Not yet written** (MCP was down/killed most of the session): a memory capturing "session-031 reverted; overlays = SHACL-only form-profiles, no overlay entities" is worth saving next session.

## State

~13 commits on `main`, **all pushed** (HEAD `ddca9da`; `main == origin/main`). Working tree clean. Both previously-red CI workflows green; opda-gen 267–268 tests pass; byte-identity clean. `git grep session-031` → 0. Two councils recorded + routed; plan register current; B3 re-index + B4 defect-fix are the cleanest next actions.
