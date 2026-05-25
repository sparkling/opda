---
status: proposed
date: 2026-05-20
tags: [vocabulary, amendment, owl-time, dcat]
supersedes: [ONT-0002]
depends-on: []
implements: [ONT-0003]
---

# Vocabulary Catalogue Amendments

## Context and Problem Statement

[ONT-0002](./ONT-0002-ontology-language-adoption.md) established OPDA's vocabulary catalogue — a closed, three-tier set (Core / Conditional / Defer) with a canonical URI, role, and adoption pattern per entry — surveyed from the H&M programme before any PDTF-specific modelling had been attempted. Council Session 001 then scoped the PDTF-to-ontology work against that catalogue (Q2) and, in doing so, made several decisions that **change ONT-0002's tiering and reasoning** for specific entries. Those changes need to be recorded as a first-class amendment rather than silently editing ONT-0002, so that the provenance of each change — which Council session, which argument, which tally — is preserved.

The catalogue was authored as a survey baseline; the PDTF programme is its first real consumer. Two entries in particular were settled differently once a concrete modelling task pressed on them: **OWL-Time**, which ONT-0002 placed at Conditional ("use only where bitemporal/interval semantics genuinely needed") and which the PDTF brief had initially *excluded* outright; and the cluster of mapping/policy vocabularies (SSSOM, ODRL) whose Conditional status assumed use cases the data-model-only round does not yet present. The amendment must also record the questions the session *opened* — OBO RO (still open) and FOAF (subsequently ruled out) — so future modellers know they were asked.

The question: what precisely does Council Session 001 change in the ONT-0002 catalogue, what survives unchanged, and how is that partial supersession recorded so the catalogue's provenance stays intact?

## Decision Drivers

* **Preserve change provenance** — each tiering change must cite the Council session, the argument, and the tally, rather than being absorbed silently into ONT-0002.
* **Coherence of the temporal model** (Guizzardi/Gandon) — adopting PROV-O's `prov:atTime` (an *instant*) while proprietorship, lease-term, and claim-validity *intervals* go unmodelled is incoherent; the catalogue's temporal tier must match what the model actually needs.
* **Machinery must have a target** (Gandon/Knublauch) — a mapping vocabulary (SSSOM) earns its place only where there is something to map *to*; for single-source internal references `dct:source` to a form-question IRI suffices.
* **A policy vocabulary asserts nothing without instances** (Guarino) — ODRL is adoptable in catalogue, but authoring policies is premature in an instance-free round.
* **Honest open questions** — where the session reached no consensus (OBO RO; and FOAF, since ruled out), the catalogue records the outcome and routes it to its owning ODR, rather than forcing a premature tier.
* **Minimise disturbance to the survey baseline** — the entire Core tier, the adoption pattern, and the Defer-tier reasoning that the PDTF round did not test must survive unchanged.

## Considered Options

* **Edit ONT-0002 in place** — change the affected rows directly in the catalogue. Simplest, but it erases the provenance of *why* each tier moved and *which* deliberation moved it, collapsing two distinct authorship events into one undated table.
* **A fresh full catalogue ODR superseding ONT-0002 wholesale** — re-issue the entire catalogue with the changes folded in, marking ONT-0002 fully superseded. Clean single source, but it falsely implies the whole catalogue was re-deliberated when only a handful of entries were touched, and it discards ONT-0002's still-valid survey reasoning for the untouched tiers.
* **A partial-supersession amendment record** (chosen) — a dedicated ODR that carries `supersedes: [ONT-0002]` and a `### Supersession scope` subsection stating exactly which entries are amended and what survives, so the catalogue's provenance is layered (survey baseline + scoped amendment) rather than flattened or duplicated.

## Decision Outcome

Chosen option: **a partial-supersession amendment record**, because it records each tiering change with its Council provenance and tally while leaving ONT-0002's still-valid survey reasoning intact — the catalogue becomes a baseline plus a scoped, attributed amendment, not a silently-edited table or a misleadingly-wholesale re-issue.

The amendments Council Session 001 (Q2) made to the ONT-0002 catalogue:

| Vocabulary | ONT-0002 said | Session 001 decision | Rationale |
|---|---|---|---|
| **OWL-Time** | Conditional, "use only where bitemporal/interval semantics genuinely needed" — and the PDTF brief initially **excluded** it | **ADOPT (Conditional), in scope for this programme** — reverses the exclusion | Adopting PROV-O's `prov:atTime` (an instant) while proprietorship, lease terms, and claim-validity *intervals* go unmodelled is incoherent (Guizzardi/Gandon). **≈6-3** over an "await a concrete consumer" dissent (Allemang/Davis). |
| **DCAT 3** | Conditional | **Confirmed Conditional** (Davis wanted Core; Baker held Conditional) | Ontology-as-published-dataset + reference data; near-zero marginal cost over `dct:`. Not Core — no catalogue task this round. |
| **SSSOM / SEMAPV** | Conditional ("pair with `semapv:` for the process side") | **Deferred** for internal overlay refs; use `dct:source` to form-question IRIs now | SSSOM earns its place mapping to *external* vocabularies (FIBO, INSPIRE); for single-source internal refs it is machinery without a target (Gandon/Knublauch). **Cagle dissent recorded (≈5-4).** |
| **ODRL** | Conditional, "restrict to access-control layers" | **Vocabulary adopted; policy-authoring deferred** to Phase 2 | ODRL `Policy`/`Permission` bite only on *instances*, which this round forbids — an ODRL TBox alone asserts nothing (Guarino's contradiction). See [ONT-0012](./ONT-0012-data-governance-layer.md). |
| **DPV family** | Conditional | **Phase-1 annotation adopted; broader TBox class vocab is a live question** | See [ONT-0012](./ONT-0012-data-governance-layer.md) — Pandit's recorded dissent on the lawful-basis/consent/purpose class vocabulary. |
| **Dublin Core** | Core ("administrative metadata") | **Reclassified rationale: "commons substrate"** — no tier change | DCAT/PROV-O/SKOS/VANN all already depend transitively on `dct:` (Baker); adopting it merely formalises the implicit. Strengthened justification, same tier. |
| **BBO, ArchiMate** | Conditional/Defer | **Out for this programme** | No process- or capability-modelling task. Unanimous. |

OWL-Time moves into active scope for this programme, carrying ONT-0002's adoption pattern (canonical URI + local SHACL + no `owl:imports`); it is consumed by Transactions & Lifecycle ([ONT-0007](./ONT-0007-transactions-and-lifecycle.md)) for proprietorship/lease/claim-validity intervals.

**New open questions raised (not adopted, routed to owning ODRs):**

- **OBO RO** — Kendall proposed adding it for transitive part-of (flat → block → estate); Davis rejected it (biology-flavoured; use `dct:isPartOf`). **No consensus — left open**, routed to the Property & Land work ([ONT-0005](./ONT-0005-property-land-identity-crux.md)) where the part-of relation lives.
- **FOAF / W3C Org ontology** — Guarino: `prov:Agent` is deliberately thin (no person/organisation distinction, no name structure) for the participant model. Session 001 reopened FOAF as a live question; it has **since been ruled out** (programme decision — "No FOAF"). The Kind-layer choice routed to Agents & Roles ([ONT-0006](./ONT-0006-agents-and-roles.md)) is now **W3C Org ontology vs bespoke `opda:`**, with `prov:Agent` for the provenance role only. ONT-0002's Defer-row negative on FOAF therefore stands.

### Consequences

* Good, because each tiering change is recorded with its Council session, argument, and tally — the catalogue's provenance is layered (survey baseline + attributed amendment) rather than flattened by an in-place edit.
* Good, because the temporal tier now matches what the model needs: adopting OWL-Time intervals alongside PROV-O's instants removes the incoherence Guizzardi/Gandon identified.
* Good, because SSSOM and ODRL-policy deferral keeps unused machinery out of the round while leaving both adoptable the moment a target (external mappings; consent instances) arrives — neither is rejected.
* Good, because the OBO RO question is recorded as open and the FOAF question as decided (ruled out), each routed to its owning ODR, so neither is silently dropped or prematurely tiered.
* Bad, because the catalogue is now read across two records (ONT-0002 baseline + this amendment) until a future consolidation, so a reader must hold both to see the current tiering.
* Neutral, because Dublin Core's reclassification is a rationale change with no tier movement — it strengthens the justification without altering what the catalogue permits.

### Confirmation

- The amendment is confirmed against the Session 001 Q2 record: each row's tally (OWL-Time ≈6-3; SSSOM ≈5-4 with Cagle dissent) and argument matches the transcript ([session-001](./council/session-001-pdtf-schema-to-ontology.md) Q2).
- ONT-0002's affected rows are confirmed to carry a "Superseded in part by ONT-0014" note pointing here, and ONT-0002's Core tier, adoption pattern, and untouched Defer reasoning are confirmed unchanged.
- The OWL-Time adoption is confirmed downstream by its use in [ONT-0007](./ONT-0007-transactions-and-lifecycle.md) (interval modelling), carrying the canonical-URI + local-SHACL + no-`owl:imports` adoption pattern.
- The questions are confirmed routed: the Kind-layer-vocabulary question (FOAF ruled out; W3C Org vs bespoke `opda:`) appears in [ONT-0006](./ONT-0006-agents-and-roles.md); the OBO RO question in [ONT-0005](./ONT-0005-property-land-identity-crux.md)'s part-of treatment.

### Supersession scope

This record **partially supersedes** [ONT-0002](./ONT-0002-ontology-language-adoption.md) — it is an amendment, not a wholesale replacement. Per the DCAP supersession convention, the precise scope is:

**Amended (superseded in part) — these ONT-0002 catalogue entries are changed by this record:**

- **OWL-Time** — tier reasoning changed: from Conditional-but-PDTF-excluded to **Conditional and in active scope for this programme** (the exclusion is reversed; ≈6-3).
- **DCAT 3** — **firmed at Conditional** against a push to promote it to Core (the tier is unchanged, but the Core-promotion question is now closed for this round).
- **SSSOM / SEMAPV** — **deferred** for internal overlay references (was Conditional); `dct:source` is used instead, with SSSOM reserved for external-vocabulary mappings (Cagle dissent recorded).
- **ODRL** — **policy-authoring deferred** (the vocabulary remains adopted in catalogue; what changes is that authoring policies is held to Phase 2).
- **DPV family** — **Phase-1 annotation adopted; the broader lawful-basis/consent/purpose class vocabulary is recorded as a live question** ([ONT-0012](./ONT-0012-data-governance-layer.md)).
- **Dublin Core** — **rationale restated as "commons substrate"** with no tier change (it remains Core).
- **OBO RO** — **opened as a question** routed to [ONT-0005](./ONT-0005-property-land-identity-crux.md). **FOAF** — **ruled out** (programme decision); ONT-0002's "Defer / never, probably" negative stands. The remaining Kind-layer choice routed to [ONT-0006](./ONT-0006-agents-and-roles.md) is **W3C Org ontology vs bespoke `opda:`**, with `prov:Agent` for the provenance role only.

**Survives unchanged — this record does NOT touch:**

- The **entire Core tier** (RDF, RDFS, OWL 2, XSD, SHACL, SKOS, Dublin Core, VANN) — membership and canonical URIs stand; only Dublin Core's *rationale* is restated, with no tier change.
- The **adoption pattern** for every Conditional entry (canonical URI + local SHACL + no `owl:imports` + `vann:` header + recorded provenance).
- The **Defer-tier reasoning** for the entries the PDTF round did not test — **schema.org**, **DCAT-AP / DCAT-AP EU**, **FIBO**, and **SOSA/SSN, QUDT, GeoSPARQL** — all stand as ONT-0002 reasoned them.
- The **three-tier framing** (Core / Conditional / Defer) and the closed-set discipline (new admissions require a new ODR).

Per the DCAP supersession policy, this is a **partial** supersession: this record does **not** assume ONT-0002's `status` flips to `superseded` — ONT-0002 remains the standing catalogue for everything outside the amended scope above. Whether ONT-0002's frontmatter status changes is a judgement left to the validator (`odr-review`), and is flagged here as a soundness item rather than asserted by this record.

## Pros and Cons of the Options

### Edit ONT-0002 in place

* Good, because it yields a single, current catalogue with no cross-referencing.
* Bad, because it erases the provenance of each change — which Council session moved which tier, on what argument, by what tally — collapsing two authorship events into one undated table.

### A fresh full catalogue ODR superseding ONT-0002 wholesale

* Good, because it produces one clean current source.
* Bad, because it falsely implies the whole catalogue was re-deliberated when only a handful of entries were touched, and it discards ONT-0002's still-valid survey reasoning for the untouched tiers.

### A partial-supersession amendment record

* Good, because it records each change with full Council provenance while leaving the untouched baseline intact — the catalogue is a layered baseline-plus-amendment.
* Bad, because the current tiering must be read across two records until a future consolidation.

## More Information

- **Target versions**: this ODR targets **RDF 1.2** and **SHACL 1.2**, per the Core-tier pin in [ONT-0002](./ONT-0002-ontology-language-adoption.md).
- **Amends**: [ONT-0002](./ONT-0002-ontology-language-adoption.md) — the vocabulary catalogue. The affected rows gain a "Superseded in part by ONT-0014" note; the catalogue's `supersedes`-target relationship is carried in this record's frontmatter (`supersedes: [ONT-0002]`).
- **Downstream consumers of the amendments**: OWL-Time → Transactions & Lifecycle [ONT-0007](./ONT-0007-transactions-and-lifecycle.md); DPV Phase-1 + ODRL deferral → Governance [ONT-0012](./ONT-0012-data-governance-layer.md); SSSOM-vs-`dct:source` → Enumeration Vocabularies [ONT-0011](./ONT-0011-enumeration-vocabularies.md) and the overlay `dct:source` traceability in [ONT-0010](./ONT-0010-overlay-profile-mechanism.md).
- **Questions routed**: OBO RO → [ONT-0005](./ONT-0005-property-land-identity-crux.md) (transitive part-of, open); FOAF → **ruled out**; W3C Org ontology vs bespoke `opda:` → [ONT-0006](./ONT-0006-agents-and-roles.md) (Kind-layer vocabulary).
- **Deliverables (when fleshed out)**: edits to ONT-0002's Core/Conditional/Defer tables (the "superseded in part" notes); OWL-Time moved into active scope with its adoption pattern documented; the OBO-RO question tracked for its owning ODR; FOAF resolved (ruled out, not adopted).
- **Related**: anchor [ONT-0003](./ONT-0003-pdtf-ontology-programme.md). Council deliberation: [session-001](./council/session-001-pdtf-schema-to-ontology.md) Q2 (vocabulary set).

## Vote and Dissent

This amendment records the Council Session 001 Q2 outcomes it codifies:

- **OWL-Time** — **≈6-3 to adopt (Conditional, in scope)**, reversing the brief's exclusion. IN: Hendler, Guizzardi, Gandon (+ Guarino attacking the exclusion). Dissent (Allemang/Davis): "await a concrete consumer." Decisive argument: PROV-O-instant-vs-needed-intervals incoherence.
- **SSSOM / SEMAPV** — **≈5-4 to defer** for internal refs. Cagle pushes IN (per-leaf `baspi5Ref` *is* a mapping problem); Gandon + Knublauch defer (`dct:source` suffices for single-source internal refs; SSSOM earns its place on external mappings). **Cagle dissent recorded.**
- **DCAT** — firmed **Conditional** (Davis wanted Core; Baker held Conditional; others defer).
- **ODRL** — vocabulary adopted, **policy-authoring deferred** (Guarino's contradiction: ODRL bites only on instances).
- **DPV** — Phase-1 annotation adopted; **Pandit's broader-TBox dissent recorded as a live question** for [ONT-0012](./ONT-0012-data-governance-layer.md).
- **Dublin Core** — reclassified rationale to "commons substrate" (Baker, carried); no tier change.
- **BBO, ArchiMate** — **out** for this programme, unanimous.
- **OBO RO** — **opened, not adopted** (open); no consensus; routed to [ONT-0005](./ONT-0005-property-land-identity-crux.md). **FOAF** — **ruled out** (decided, not adopted); the Kind-layer vocabulary choice (W3C Org vs bespoke `opda:`) routed to [ONT-0006](./ONT-0006-agents-and-roles.md).
