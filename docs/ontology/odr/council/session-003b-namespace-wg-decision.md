# Council Session 003b — WG Namespace Ratification (`opda:` → `https://w3id.org/opda/#`)

- **Date:** 2026-05-27
- **Record under review:** [ODR-0004 — PDTF Ontology Foundation](../ODR-0004-pdtf-ontology-foundation.md)
- **Queen / Moderator:** Henrik Pettersen (acting on behalf of the OPDA Working Group per the WG decision protocol in [ODR-0003 §Rules "Status discipline"](../ODR-0003-pdtf-ontology-programme.md) and [adoption record §Real-world Governance Handoff](./adoption.md#real-world-governance-handoff))
- **Devil's Advocate:** None convened (Author-only tier per [ODR-0001 §Format tiers](../ODR-0001-linked-data-council-methodology.md)). Ian Davis was nominated as the standing DA for any Session 003b amendment, but the namespace ratification is a recording of a WG-owned decision deliberated extensively at S004 Q7 — not a fresh deliberation or sequencing surprise. The DA's role at S004 (Knublauch — extended) carried the operationally-strongest alternative (`w3id.org/opda/`) through to full withdrawal; this session ratifies that alternative.
- **Panel:** None (Author-only).
- **Input Documents:**
  - [ODR-0004 — PDTF Ontology Foundation](../ODR-0004-pdtf-ontology-foundation.md) — Rules.1 (single hash namespace; WG-owned literal string), §Consequences (`w3id.org/opda/` as named alternative + namespace-as-blocker on `status: accepted`).
  - [Session 004 transcript](./session-004-pdtf-ontology-foundation.md) — Q7 (namespace string + version scheme; 9-0 vote; full Knublauch DA withdrawal; W3C PICG persistence argument carried). Three candidates ratified for WG consideration: `https://opda.uk/ns/` (institutional default; 7 voices); **`https://w3id.org/opda/` (Knublauch DA primary demand; W3C PICG persistence)**; `https://trust.propdata.org.uk/ontology/` (rejected on programme-namespace-coupling grounds).
  - [ADR-0006 — Ontology namespace at w3id.org/opda/ via W3C PICG redirect](../../../adr/ADR-0006-w3id-opda-ontology-namespace.md) — engineering realisation: redirect mechanics, hosting target, deploy-pipeline implications, five-criterion confirmation gate.
  - [Council follow-up plan §"Open WG decisions"](../../../plan/council-followup-sessions.md) — namespace string named as the gating WG decision blocking `status: accepted` on all 13 ratified ODRs in the `depends-on:[ODR-0004]` chain.
  - DPV precedent: Pandit (W3C DPV CG chair) chose `https://w3id.org/dpv/` for the same persistence reasons; pattern referenced verbatim at S004 by Knublauch.
- **`consensus-mode`:** `none` (Author-only — no panel to coordinate).
- **Format tier:** **Author-only.** Per ODR-0001 §Format tiers: "Recording a decision the methodology or precedent has already settled; sequencing/index work; no panel split expected." The Council ratified three candidates and the operationally-strongest argument at S004; the WG selects from that ratified set.

## Context

ODR-0004 §Rules.1 commits the OPDA ontology to a **single `opda:` HASH namespace** but defers the literal base URI to OPDA Working Group ratification. Session 004 named three candidates (Q7) and ratified the WG framework but left the choice to the WG per the methodology's separation of concerns: the Council ratifies the *policy*; the WG ratifies the *string* (per [adoption record §Real-world Governance Handoff](./adoption.md#real-world-governance-handoff)).

Knublauch (S004 DA, extended panel) named `https://w3id.org/opda/` as the **operationally-strongest alternative** and made it his primary attack on the bare `opda.uk` default. The argument: W3C Permanent Identifier Community Group (PICG) provides namespace persistence independent of OPDA's organisational lifecycle; survives consortium re-brand; lowers OPDA-side maintenance commitment. Knublauch cited DPV's adoption of `https://w3id.org/dpv/` (Pandit's principal-author choice) as the closest precedent. The DPV slash→hash transition in 2019 took approximately six ecosystem-months to propagate — the consumer-discovery problem is unsolvable post-publication; namespace cannot be deferred.

The OPDA WG took the decision on 2026-05-27: **adopt `https://w3id.org/opda/`** with the hash suffix preserved per ODR-0004's §Rules.1 hash commitment. The literal prefix declaration in all OPDA TTL artefacts is therefore:

```turtle
@prefix opda: <https://w3id.org/opda/#> .
```

This Author-only session records the WG decision into ODR-0004's `## Rules`, lands the engineering realisation as [ADR-0006](../../../adr/ADR-0006-w3id-opda-ontology-namespace.md), and triggers the status sweep on the 13 ODRs whose `depends-on:[ODR-0004]` chain has been holding `status: proposed` pending namespace ratification.

## Pre-flight scope check

Per [ODR-0001 §Pre-flight scope check](../ODR-0001-linked-data-council-methodology.md) and [follow-up plan §11](../../../plan/council-followup-sessions.md#11-pre-flight-scope-check--opda-candidates). Outcome: **ratify-as-is**.

- **Coherent proposition.** Recording the WG namespace decision into ODR-0004 §Rules.1 is a single coherent decision, scoped to one rule.
- **No retire signal.** Session 004 affirmed the hash policy 9-0; the WG choice is among the ratified alternatives.
- **No re-scope signal.** The literal string lands in ODR-0004 §Rules.1 (correct location per Session 004's Q7 deliberation).
- **Author-only tier justified.** Per [ODR-0001 §Format tiers](../ODR-0001-linked-data-council-methodology.md): "Recording a decision the methodology or precedent has already settled" — Session 004 ratified the framework and named the alternatives; this session records the WG selection. No fresh deliberation; no panel split plausible.

## Items recorded (not deliberated)

### Item 1 — WG namespace selection

**Chosen:** `https://w3id.org/opda/` with hash suffix per ODR-0004 §Rules.1 hash commitment. Literal prefix:

```turtle
@prefix opda: <https://w3id.org/opda/#> .
```

**Selection rationale (cited from Session 004 Q7):**

1. **W3C PICG persistence guarantee** — survives OPDA organisational lifecycle changes (rebrand, consortium dissolution, domain loss). DPV precedent: Pandit's principal-author choice for DPV (`w3id.org/dpv/`) for exactly this reason.
2. **Lower OPDA-side maintenance** — the redirect is a single line in the W3C-managed `perma-id/w3id.org` repository; only changes if the hosting target moves. OPDA does not commit to keeping any single domain resolving forever.
3. **Knublauch DA primary demand met** — Knublauch's S004 attack on bare `opda.uk` carried the operationally-strongest alternative through to full withdrawal. WG selection honours the deliberation.
4. **Decouples URI policy from hosting decisions** — future hosting moves (CDN, alternate domain) are deploy-side concerns; consumers never see the redirect target change.

**Engineering realisation:** [ADR-0006](../../../adr/ADR-0006-w3id-opda-ontology-namespace.md) records the W3C PICG PR mechanics, hosting target (`https://openpropdata.org.uk/ontology/`), CI test, and five-criterion confirmation gate.

**Source:** [Session 004 transcript Q7](./session-004-pdtf-ontology-foundation.md); [ADR-0006](../../../adr/ADR-0006-w3id-opda-ontology-namespace.md); DPV precedent (Pandit 2019).

### Item 2 — Status sweep across the `depends-on:[ODR-0004]` chain

With the namespace block cleared, the following ODRs move `status: proposed → accepted` mechanically through the dependency chain — each was Council-cleared and held `proposed` solely because of the namespace block:

| ODR | Status before | Status after | Council provenance |
|---|---|---|---|
| ODR-0002 | proposed | accepted | session-002 |
| ODR-0004 | proposed | accepted | session-004 + session-003b (namespace) |
| ODR-0005 | proposed | accepted | session-005 |
| ODR-0006 | proposed | accepted | session-006 |
| ODR-0007 | proposed | accepted | session-007 |
| ODR-0009 | proposed | accepted | session-009 |
| ODR-0010 | proposed | accepted | session-010 |
| ODR-0011 | proposed | accepted | session-011 |
| ODR-0012 | proposed | accepted | session-012 |
| ODR-0013 | proposed | accepted | session-013 |
| ODR-0015 | proposed | accepted | session-015 |
| ODR-0017 | proposed | accepted | session-011 (Author-only spawn) |
| ODR-0018 | proposed | accepted | session-009 (Author-only spawn) |

**Not flipped** (deliberately):

- **ODR-0001** — already `accepted` (methodology; self-amended).
- **ODR-0003** — already `accepted` (session-003).
- **ODR-0008** — stays `proposed`: deferred on cardinality per Kendall+Davis S005 Q5+Q8 joint amendment, not on namespace.
- **ODR-0014** — stays `superseded` (retired by Scope-Check 1 Q4; folded into ODR-0002's `## Change log`).
- **ODR-0016** — stays `proposed`: deferred-until-trigger per Scope-Check 1 Q7c; namespace clearance does not fire any of the three named triggers.

The `council-cleared, namespace-blocked` tags on the flipped ODRs are now vestigial — `status: accepted` carries the same signal. Tags removed at the same time as the status flip.

**Source:** [ODR-0004 §Consequences "Namespace string is a blocker on `status: accepted`"](../ODR-0004-pdtf-ontology-foundation.md); [follow-up plan §"Open WG decisions"](../../../plan/council-followup-sessions.md).

### Item 3 — Exemplar bulk namespace update

The 14 diagnostic exemplars in `source/03-standards/ontology/exemplars/` currently declare `@prefix opda: <https://opda.uk/ns/#> .` as placeholder (the institutional candidate before WG selection). This session triggers a mechanical bulk-replace to the ratified string `https://w3id.org/opda/#`. The instance-URI placeholder `opda-x:` (currently `https://opda.uk/data/exemplar/<name>/`) is **out of scope** for this session — instance-URI namespace is a separate decision (ODR-0004 §Rules.5 declares the pattern but defers instance minting). Flagged for follow-up.

**Source:** [ODR-0004 §Rules.1 + §Rules.5](../ODR-0004-pdtf-ontology-foundation.md).

### Item 4 — Reopening trigger (housekeeping)

ODR-0004 §Consequences names the hash-vs-slash reopening criterion as WG-owned. This session does not change the hash decision; it records that the WG will define a concrete reopening threshold in a follow-up record when the threshold becomes operationally relevant. Suggested threshold (carried from S004): any single ontology file exceeds 1,000 terms in active dereference traffic OR a named consumer requests per-term content negotiation.

**Source:** [ODR-0004 §Consequences "Reopening trigger for hash-vs-slash"](../ODR-0004-pdtf-ontology-foundation.md).

## Synthesis

ODR-0004 §Rules.1 amendment lands:

> **1. Single hash namespace.** All foundational TBox terms are minted under one `opda:` HASH namespace. No per-form / per-overlay namespaces. Overlays are SHACL profiles (ODR-0010), not vocabularies. **The literal base URI is `https://w3id.org/opda/#` (W3C PICG-redirected to `https://openpropdata.org.uk/ontology/`; engineering realisation in [ADR-0006](../../../adr/ADR-0006-w3id-opda-ontology-namespace.md))**. WG-ratified 2026-05-27 ([Session 003b](./council/session-003b-namespace-wg-decision.md)) per Knublauch S004 DA primary demand + DPV precedent. Versioning scheme (calendar vs semantic) remains a WG-owned open question.

ODR-0004 `status` moves `proposed → accepted` with `council: session-004; wg-decision: session-003b` recorded.

13 downstream ODRs move `proposed → accepted` per Item 2.

ADR-0006 stays `status: proposed` until the perma-id/w3id.org PR merges (community-paced asynchronous). Its five-criterion confirmation gate is the closing condition.

**Programme state after this session:** Council Phase 1 + Phase 2 + Phase 2.5 + Phase 2.6 + Phase 3a + Phase 3b + Phase 4 + Phase 5 + Phase 6 are all **substantively closed and formally ratified**. Outstanding work:

- **S008** — deferred until S005's 3-class commitment crystallises into the leaf-to-class mapping.
- **S016** — deferred until any of the three named triggers fires.
- **Phase-3.5 audit** — Q3 cross-vocabulary mapping deferral from S011 + SSSOM re-open trigger from S002 Q11.
- **w3id.org redirect PR** — engineering follow-up per ADR-0006.
- **BASPI5 round-trip MVP gate** — implementation milestone; closes the programme per [ODR-0003 §Rules "Programme retirement criterion"](../ODR-0003-pdtf-ontology-programme.md).

The plan is no longer namespace-blocked.

## References

- **Engineering realisation:** [ADR-0006 — Ontology namespace at w3id.org/opda/ via W3C PICG redirect](../../../adr/ADR-0006-w3id-opda-ontology-namespace.md).
- **Council deliberation provenance:** [Session 004 transcript Q7](./session-004-pdtf-ontology-foundation.md). Three candidates ratified; Knublauch DA primary demand carried the operationally-strongest alternative through to full withdrawal.
- **Foundation record amended:** [ODR-0004 §Rules.1](../ODR-0004-pdtf-ontology-foundation.md).
- **Programme anchor + status discipline:** [ODR-0003 §Rules "Status discipline (bidirectional-update protocol)"](../ODR-0003-pdtf-ontology-programme.md).
- **Methodology:** [ODR-0001 §Format tiers](../ODR-0001-linked-data-council-methodology.md) (Author-only tier criteria).
- **Adoption record:** [OPDA Council adoption record §Track Record](./adoption.md#track-record) — this session row appended.
- **Follow-up plan:** [Council follow-up sessions](../../../plan/council-followup-sessions.md) §"Open WG decisions" — namespace string blocker cleared.
- **DPV precedent:** W3C Data Privacy Vocabulary at [`https://w3id.org/dpv/`](https://w3id.org/dpv/) — Pandit's principal-author choice for identical persistence reasons.
- **W3C PICG repository:** [`https://github.com/perma-id/w3id.org`](https://github.com/perma-id/w3id.org) — PR submission target.
