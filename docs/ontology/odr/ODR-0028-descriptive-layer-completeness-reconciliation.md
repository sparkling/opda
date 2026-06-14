---
status: accepted
date: 2026-06-14
kind: programme
tags: [descriptive-layer, category-g, monetary, overlay-profiles, reconciliation, coverage-gate, status-attestation]
scope: [pdtf-v3:propertyPack.residentialPropertyFeatures, pdtf-v3:propertyPack.nearbyFacilities, pdtf-v3:propertyPack.ownership, pdtf-v3:propertyPack.localSearches, pdtf-v3:propertyPack.priceInformation, pdtf-v3:overlays]
supersedes: []
depends-on: [ODR-0003, ODR-0008d, ODR-0010, ODR-0021, ODR-0022, ODR-0024, ADR-0014, ADR-0029, ADR-0031, ADR-0032]
implements: [ODR-0003]
---

# Descriptive-Layer Conversion — Completeness Reconciliation

## Context and Problem Statement

A status review of the PDTF JSON-Schema → OPDA ontology conversion found that the most recent programme narrative — the `What's left` section of `docs/HANDOVER-2026-06-02-namespace-migration-executed.md` — reported the descriptive layer as substantially unfinished: "the Category-G curated walk … ~188 descriptive-concept permanent IRIs are still held/not-emitted; per-form profiles stay thin" and "Held monetary walk — no `opda:MonetaryAmount` value type yet." Taken at face value, that framing implies the largest remaining ontology build is still ahead.

Verification against the emitted corpus and the CI gates contradicts that framing on every point. The "held" text was stale — carried forward from the ADR-0031 *plan* state and never updated after the walk was executed. Because programme decisions (what to build next, whether the programme can retire) are taken off that narrative, the drift is decision-bearing and must be reconciled to ground truth in the authoritative corpus, not left to a handover that downstream readers will mis-trust.

## Decision Drivers

* The emitted TTL corpus and the `opda-gen` CI gates are the ground truth; prose handovers are secondary and may drift.
* ODR-0003 programme-retirement reasoning depends on an accurate completion state.
* Stale "held / not-emitted" framing already cost one full re-investigation; it must not recur.
* A reconciliation must record *what was verified and how* (re-runnable evidence), not merely assert "done".

## Considered Options

* **Option A (chosen) — Record a programme-completeness reconciliation ODR.** Attest the verified state of the three descriptive-layer work-streams against named gates/commits, adopt the coverage gates as the standing definition of done, and log the one genuine residual defect as a tracked known-issue.
* **Option B — Only edit the stale handover.** Rejected: a handover is not the authoritative record; the correction would itself drift and the verified state would have no durable home in the ODR corpus that ODR-0003 retirement reasoning consults.
* **Option C — Open a fresh council session.** Rejected: nothing here is contested. The walks were already deliberated (session-028 → ODR-0024) and the profile scope already ratified (session-034); this is an author-level state attestation, not a new modelling decision.

## Decision Outcome

Chosen option: "Record a programme-completeness reconciliation ODR", because the verified state belongs in the authoritative corpus and the residual work is a small, named set — not the large build the stale narrative implied.

The three descriptive-layer work-streams the prior narrative listed as outstanding are **complete and gated green** as of 2026-06-14 (working tree clean for `source/03-standards/ontology/` and `tools/opda-gen/`):

1. **Category-G curated walk — COMPLETE (239/239).** `ci-category-g-coverage` reports `239/239 candidate-G leaves emitted-or-collapsed (224 minted, 15 collapsed, 0 uncovered) — PASS`. Executed across commits `ce7de50` (185/188 + bearer classes) → `37fef4a` (ODR-0024 / session-028 remediation R3–R11) → `12a4bb4` (monetary walk G22 + R5 follow-on, 179→236/239) → `6e5f6d1` (rooms as `opda:RoomDimension`, →239/239). Dispositions are ratified in ODR-0024.
2. **Monetary walk — COMPLETE.** `opda:MonetaryAmount` exists as a value-type class with its own SHACL shape (`opda-descriptive-shapes.ttl`) mandating exactly one `opda:amount` (xsd:decimal) per ODR-0024 R3; price-like leaves emit as object properties ranging on it. The prior "single shared `opda:price`, no value type" framing is obsolete.
3. **Overlay profile binding — COMPLETE and ratified (session-034).** The B1 leaf-enumeration rollout bound every *bindable* (Category-G) leaf and emitted an honest per-form gap register: **224 bound / 1095 GAPped across 28 forms** (`ci-profile-contract` PASS; 240 `sh:path opda:` bindings on disk). Thin profiles are the **ratified outcome**, not a defect: most overlay leaves are A/B/C/D/E/F treatments (collapse/reuse/scheme/class) that take no per-leaf `sh:path` binding (ODR-0022 §Rules.1), and `oc1`/`llc1` are held thin by design (ODR-0008d register extracts, not human-filled forms; session-034 Q2, Davis DA HELD with a re-open trigger).

This ODR adopts those gates — `ci-category-g-coverage`, `ci-profile-contract`, `ci-descriptive-roundtrip`, `ci-baspi5-roundtrip` — as the **standing definition of done** for the descriptive layer: a green gate suite supersedes any prose "held" claim. It does not re-open any ratified mapping or modelling decision (ODR-0022 / ODR-0024 / ODR-0008d remain scope-fenced).

### Consequences

* Good, because the authoritative corpus now records the true completion state; ODR-0003 retirement reasoning no longer rests on a stale narrative.
* Good, because the re-runnable gate commands are the evidence — future status checks run a command, not re-read prose.
* Good, because the one genuine residual modelling defect (EPC-certificate inference cross-trip) is now tracked in the ODR corpus rather than buried in a single handover note.
* Neutral, because this records already-shipped work; it changes no emitted artefact.
* Bad, because a reconciliation ODR is itself a point-in-time snapshot — if the gates change, this record must be read alongside the live gate output, not in place of it.

### Confirmation

Re-runnable from `tools/opda-gen/` (`.venv/bin/python -m opda_gen <gate>`):

* `ci-category-g-coverage` → `239/239 … PASS`
* `ci-profile-contract` → `PASS (all 3 rules)`
* Class presence: `grep -r 'opda:MonetaryAmount' source/03-standards/ontology/*.ttl` resolves to a typed value-structure with its `opda:amount` shape.
* Profile bindings: `grep -rhoE 'sh:path opda:[A-Za-z]+' source/03-standards/ontology/profiles/*.ttl | wc -l` → 240.

## Rules

### R1 — Gate output supersedes prose completion claims

For the descriptive layer, a green `ci-category-g-coverage` + `ci-profile-contract` + `ci-descriptive-roundtrip` + `ci-baspi5-roundtrip` suite is the authoritative statement of completion. Any handover, plan, or comment asserting descriptive-layer work is "held" / "not-emitted" / "thin (pending terms)" is **superseded by a green gate** and MUST be corrected on sight (as the 2026-06-02 handover was, this session). Do not schedule a "Category-G walk" or "monetary walk" as future work — they are closed.

### R2 — Thin overlay profiles are conformant, not gaps

A profile binding zero or few `sh:path` shapes is **not** evidence of incomplete work. Per session-034 / ODR-0022 §Rules.1, only Category-G substantive attributes bind as per-leaf profile shapes; A/B/C/D/E/F leaves are carried by `dct:subject` + JSON-pointer `dct:source` and are GAP-registered, never fabricated. `oc1`/`llc1` stay thin until their ODR-0008d re-open trigger fires (a named consumer issues a worked SPARQL query against a register leaf).

### R3 — Tracked known-issue: EPC-certificate inference cross-trip (corrected; disposed by ODR-0029 R4)

> **Wording correction (2026-06-14, Council session-039 / ODR-0029 R4c).** The original R3 text asserted that `Baspi5_EPCCertificateShape` *binds* `opda:currentEnergyRating` onto `opda:EPCCertificate`. Verified against the emitted corpus, that is **not** what the SHACL does: `Baspi5_EPCCertificateShape` is a **bare, empty `sh:targetClass opda:EPCCertificate`** node shape with **no `sh:property`**; the rating (`opda:currentEnergyRating`) and the `opda:hasEPCCertificate` join are both bound on `Baspi5_PropertyShape`, whose `sh:targetClass` matches their `rdfs:domain opda:Property`. The model and the emitted SHACL are therefore **correct**. The text below is the corrected account.

The real exposure is **not** in the emitted shapes but in two edges: **(a)** the ADR-0014 round-trip validates the merged graph under a full `inference="rdfs"`-style closure (TBox-merge), *wider* than OPDA's own materialised Safe-Group closure — which excludes `rdfs:domain`/`range` (ODR-0025 §R2/§R7); under that broad RDFS, an `EPCCertificate` reached through the join could be mis-typed; **(b)** the **dangling** `Baspi5_EPCCertificateShape` (a `sh:targetClass` with no constraints) earns its keep nowhere. OPDA's own load-time closure does **not** produce the cross-trip (the Safe Group never entails `EPCCertificate ⊑ Property` — `ci-inference-closure` clause 3b guards exactly this).

* **Disposition:** SUPERSEDED by [ODR-0029](ODR-0029-inference-validation-boundary-and-entailment-regime-disposition.md) R4. The model is correct; do **not** re-home the rating onto the certificate and do **not** add a `recordsRating`. The fixes are: point the ADR-0014 round-trip at the materialised Safe-Group closure (not full RDFS); resolve the dangling `Baspi5_EPCCertificateShape` (drop it, or populate it with certificate-intrinsic constraints only — never the Property rating); and add the `domain`/`range`-as-SHACL-constraint layer (ODR-0029 R3) so any genuine off-domain use is *validated*.
* **Workaround in place:** the B2 conformant exemplar models the rating on the `opda:Property` (where the domain places it) and documents the context in its header.
* **Surfaced by:** Council session-034 (handover note #8, 2026-06-01); re-located and disposed by Council session-039 (ODR-0029).

## More Information

* Evidence narrative: `docs/HANDOVER-2026-05-31-g-walk-execution-council-028-remediation.md` (walk execution + honest accounting), `docs/HANDOVER-2026-06-01-B4-B1-B2-and-council-034.md` (profile binding rollout + ratified scope), `docs/HANDOVER-2026-06-02-namespace-migration-executed.md` (now carries a 2026-06-14 correction note for the stale "What's left").
* Ratified dispositions this ODR attests against: [ODR-0024](ODR-0024-curated-category-g-walk-dispositions.md) (Category-G + monetary), [council/session-034](council/session-034-overlay-leaf-enumeration-discipline.md) (overlay leaf-enumeration discipline), [ODR-0021](ODR-0021-deferred-form-profile-layer-enhancements.md) (form-profile enhancement boundary), [ODR-0008d](ODR-0008d-authority-retrieved-artefacts.md) (oc1/llc1 register extracts).
* Engineering records: [ADR-0031](../../adr/ADR-0031-category-g-curated-walk-execution-plan.md), [ADR-0032](../../adr/ADR-0032-category-g-walk-emission-and-coverage-gate.md), [ADR-0029](../../adr/ADR-0029-overlay-profile-emitter-generalisation-and-rollout.md), [ADR-0014](../../adr/ADR-0014-baspi5-round-trip-mvp-harness.md).
* Programme context: [ODR-0003](ODR-0003-pdtf-ontology-programme.md) (the descriptive-layer conversion is one of its work-streams; this reconciliation discharges the "held" descriptive items, leaving ODR-0016 `proposed` as the remaining retirement holdout).
