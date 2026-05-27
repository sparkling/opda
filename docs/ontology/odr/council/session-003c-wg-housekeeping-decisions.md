# Council Session 003c — WG Housekeeping Decisions (instance-URI + hash-vs-slash + TF scope)

- **Date:** 2026-05-27
- **Records under review:** [ODR-0004 — PDTF Ontology Foundation](../ODR-0004-pdtf-ontology-foundation.md) (carries the three open items)
- **Queen / Moderator:** Henrik Pettersen (acting on behalf of the OPDA Working Group)
- **Devil's Advocate:** None convened (Author-only tier; three small WG decisions; no fresh deliberation; precedent already established at S004 + S003b)
- **Panel:** None (Author-only)
- **Input Documents:**
  - [ODR-0004 — PDTF Ontology Foundation](../ODR-0004-pdtf-ontology-foundation.md) — §Rules.5 (don't ship URIs you don't serve); §Consequences (reopening trigger; namespace string resolved); §References (open questions)
  - [Session 003b](./session-003b-namespace-wg-decision.md) — namespace-string resolution; Item 3 flagged instance-URI as separate decision; Item 4 noted reopening-trigger as housekeeping
  - [Session 004](./session-004-pdtf-ontology-foundation.md) — Q4 five-line term-sourcing precedence (OPDA TF authoritative within scope; other regulators contextual)
  - [ADR-0006](../../../adr/ADR-0006-w3id-opda-ontology-namespace.md) — w3id.org redirect engineering realisation
  - [Council follow-up plan §"Open WG decisions"](../../plan/council-followup-sessions.md) — three items routed forward
- **`consensus-mode`:** `none` (Author-only)
- **Format tier:** **Author-only.** Three small WG decisions, each grounded in already-ratified precedent. No fresh deliberation claimed.

## Context

Three WG items survived the Session 003b namespace ratification as small open housekeeping decisions:

1. **Instance-URI namespace** — the `opda-x:` prefix used in exemplars currently expands to `https://opda.uk/data/exemplar/<name>/`. With the TBox namespace ratified at `https://w3id.org/opda/#`, the instance-URI placeholder needs a decision: keep it institutional (on the correct OPDA domain), route through w3id.org redirect, or drop the prefix entirely.
2. **Hash-vs-slash reopening trigger** — ODR-0004 §Consequences names this as a WG-owned recordkeeping item. The threshold prevents silently painting the programme into a corner.
3. **OPDA Trust Framework authoritative scope** — S004 Q4's five-line term-sourcing precedence places the OPDA TF as authoritative within scope; other regulators (FCA, ICO, HMLR, eIDAS) are contextual. The WG SHOULD ratify the TF's authoritative scope in writing for the audit trail (already operationally honoured in ODR-0009 Q5 + ODR-0012 Q2).

This Author-only session records the three WG decisions.

## Pre-flight scope check

Outcome: **ratify-as-is**. Three small operational decisions; all grounded in already-ratified precedent. Author-only tier justified per ODR-0001 §Format tiers.

## Items recorded (not deliberated)

### Item 1 — Instance-URI namespace decision

**Chosen:** `opda-x:` expands to `https://openpropdata.org.uk/data/exemplar/<exemplar-slug>/` (institutional, on OPDA's actual web domain — same root as the TBox redirect target).

**Selection rationale:**

1. **Instance data is not vocabulary.** Exemplar instances are test/illustrative data, not the persistent vocabulary terms that the W3C PICG persistence guarantee was designed for. DPV precedent: `w3id.org/dpv/` is the vocabulary; instance data published by data publishers lives under their own namespaces.
2. **Institutional persistence is appropriate for test data.** Test exemplars don't carry the same long-term consumer-discovery problem as vocabulary URIs; if `openpropdata.org.uk/data/exemplar/` later changes, the impact is on internal CI test fixtures, not external consumers.
3. **Same root as TBox redirect target** keeps URI families consistent — easier to mentally trace OPDA-published content.
4. **Decoupled from w3id.org** — no need to register a separate redirect for instance-URI patterns; w3id.org PICG namespace stays focused on vocabulary.

**Operational implication:**

- Existing exemplar `@prefix opda-x:` declarations (currently `<https://opda.uk/data/exemplar/<name>/>`) MUST be flipped to `<https://openpropdata.org.uk/data/exemplar/<name>/>` in a follow-up sweep. Mechanical edit. ~14 files in `source/03-standards/ontology/exemplars/`.
- The change is deferred to a follow-up commit (not bundled with this Author-only transcript) to keep this session focused on the *decision*, not the execution.

**Source:** [Session 003b Item 3](./session-003b-namespace-wg-decision.md); [ODR-0004 §Rules.5](../ODR-0004-pdtf-ontology-foundation.md); DPV precedent.

### Item 2 — Hash-vs-slash reopening trigger (concrete threshold)

**Chosen:** Reopen the hash-vs-slash decision when **either** condition holds:

1. **Volume threshold.** Any single OPDA ontology file (`foundation.ttl`, `opda-classes.ttl`, etc.) exceeds **1,000 terms** in active dereference traffic, measured monthly from `openpropdata.org.uk/ontology/` access logs. (The "1,000 terms in one file" threshold approximates the practical limit at which fetching the whole hash-namespaced document for one fragment becomes a perceptible cost.)
2. **Consumer demand.** A **named consumer** (not speculation) requests per-term content negotiation — e.g. a wallet that wants `application/ld+json` per term, a SPARQL endpoint that needs HEAD-then-GET dispatch, a documentation crawler that requires `text/html` per term.

**Mechanism on trigger:** Convene a Reduced Council session (Queen: Gandon; DA: any standing-panel voice; ~3 agents) to re-deliberate hash-vs-slash against the named consumer or volume evidence. The DPV precedent (six ecosystem-months to switch slash→hash) sets the cost frame.

**Suggested precedent:** match DPV's own published threshold pattern — they switched at a comparable volume + named-consumer combination.

**Source:** [ODR-0004 §Consequences "Reopening trigger for hash-vs-slash"](../ODR-0004-pdtf-ontology-foundation.md); [ADR-0006](../../../adr/ADR-0006-w3id-opda-ontology-namespace.md); DPV 2019 transition.

### Item 3 — OPDA Trust Framework authoritative scope ratification

**Chosen:** The **OPDA Trust Framework is authoritative** within its declared scope (UK residential property transaction data; lawful basis under UK GDPR; identity assurance per OPDA TF specification). **Other regulatory authorities** (FCA — financial conduct; ICO — data protection; HMLR — land registration; EU eIDAS — electronic identification; UK Money Laundering Regulations 2017) are **contextual** — cited via `skos:scopeNote` and `dct:source` references but not normative for OPDA-issued claims.

**Operational implication (recorded; already honoured):**

- ODR-0009 Q5 already implements the precedence: `dct:conformsTo` to `opda:TrustFramework` as primary; `skos:scopeNote` for cross-regulator alignment.
- ODR-0012 Q2 already implements DPV reference-not-import per this precedence: DPV TBox external (reference); mapping tables OPDA-authored (authoritative within OPDA TF scope).
- S004 §7a five-line term-sourcing precedence: W3C-spec > OPDA Trust Framework > business glossary > schema text > external regulator (contextual). The TF sits second only to W3C standards.

**This ratification is a formal recording of an operational practice already in place.** No code or schema changes triggered. The audit trail now contains an explicit WG ratification.

**Source:** [Session 004 Q4 transcript](./session-004-pdtf-ontology-foundation.md); [ODR-0009 Q5](../ODR-0009-claims-evidence-provenance.md); [ODR-0012 Q2](../ODR-0012-data-governance-layer.md).

## Synthesis

Three small WG decisions ratified into the audit trail:

1. **`opda-x:` instance-URI** → `https://openpropdata.org.uk/data/exemplar/<name>/`
2. **Hash-vs-slash reopening trigger** → 1,000-term-per-file volume OR named-consumer per-term-conneg request
3. **OPDA TF authoritative scope** → primary within UK residential property transaction data; other regulators contextual

Follow-up engineering: bulk-update `opda-x:` declarations across 14 exemplars (mechanical sed pass, scheduled for the next sweep).

ODR-0004 §Consequences amended to record Items 2 and 3 (Item 1 lives in the exemplars subtree rather than ODR-0004).

## References

- **Anchor record:** [ODR-0004](../ODR-0004-pdtf-ontology-foundation.md) — Rules.5 (don't ship URIs you don't serve); Consequences (reopening trigger; TF scope).
- **Precedent session:** [Session 003b](./session-003b-namespace-wg-decision.md) — TBox namespace ratification; Items 3 + 4 flagged these decisions.
- **Precedent session:** [Session 004 Q4 + Q7](./session-004-pdtf-ontology-foundation.md) — term-sourcing precedence (Q4) and namespace string deliberation (Q7).
- **Engineering ADR:** [ADR-0006](../../../adr/ADR-0006-w3id-opda-ontology-namespace.md) — w3id.org redirect mechanics.
- **Operational vindication:** ODR-0009 Q5 (`dct:conformsTo` to OPDA TF); ODR-0012 Q2 (Pandit's reference-not-import per OPDA TF authoritative scope); S004 §7a (five-line term-sourcing precedence).
- **DPV precedent (Items 1 + 2):** [`https://w3id.org/dpv/`](https://w3id.org/dpv/) vocabulary vs publisher-controlled instance namespaces; DPV 2019 slash→hash transition cost.
