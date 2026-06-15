# Council Session 043 — Shared Brief

**Proposition.** Resolve two engineering follow-ups left after the 2026-06-15 deploy fix (commit `4905c6b`):
(A) **Transaction lifecycle phase** — should a Transaction carry a phase/status property, and if so over which value-space; (B) **ufoCategory dereferenceability** — should the inert annotation property `opda:ufoCategory` dereference at `/pdtf/ufoCategory` with its DOLCE disclosure, and how should the site model surface annotation properties.

## Verified findings (ground your own citations; these are the facts the panel verified)

**(A) Transaction phase.**
- `opda:status` has `rdfs:domain opda:Search` — Search-specific, source-backed (data-dictionary `localSearches…status`), comment flags polysemy. Three transaction exemplars wrongly borrowed it; the borrowed triples were removed in `4905c6b`.
- `opda:TransactionStatusScheme` **already exists** and is emitted (1 of 47 schemes; ADR-0010-named; each label `prov:wasDerivedFrom` its data-dictionary `status` enum): notations **Listed / Offered / Accepted / Exchanged / Completed**. **No property currently carries it.**
- `opda:ParticipantStatusScheme` also exists: **Proposed / Invited / Active / Removed** — a *different bearer*.
- **Session-032** (recorded in ODR-0007 §Rules) settled two distinct Phase-bearers: the **Milestone-Phase bears on `opda:Transaction`** (the Relator); **participantStatus bears on the participant's role-play** (qua-individual). One scheme per axis, never per-role. ODR-0007 models milestones + status as anti-rigid Phases.
- Exemplars (`source/03-standards/ontology/exemplars/`): `chain-of-transactions.ttl` (3 Transactions, each had `opda:status "active"`, **no milestones**); `lease-extension-transaction.ttl` (had `opda:status "completed"`, **no milestones**); `simple-transaction-with-milestones.ttl` (had `opda:status "completed"`, **has reified `opda:Milestone`/`prov:Activity` events**: instruction→offerAccepted→exchange→completion→registration). The removed exemplar tokens (`active`/`completed`; a comment said `proposed/active/exchanged/completed`) match **neither** existing scheme's notations exactly.

**(B) ufoCategory.**
- `opda:ufoCategory` is an `owl:AnnotationProperty` in `opda-annotations.ttl` (ADR-0045, ODR-0031): inert, **never reasoned**, referenced-not-imported to gUFO. It carries a 3-part DOLCE disclosure (`rdfs:comment` + `skos:scopeNote` "UFO-informed, not UFO-grounded…"); its value-space is the 9-concept `opda:UFOCategoryScheme` (closeMatch→gUFO + OntoClean signatures).
- **ODR-0030 Rule 7b** mandates the disclosure on the predicate AND a dereferenceable `/pdtf/ufoCategory` term page; **ODR-0031 §Confirmation** lists "the `/pdtf/ufoCategory` term page" as a confirmation criterion.
- The site model generator `scripts/ontology-model.mjs` extracts `owl:Class` / `owl:ObjectProperty` / `owl:DatatypeProperty` / `sh:NodeShape` / `skos:Concept` / `skos:ConceptScheme` — **NOT `owl:AnnotationProperty`**. So `ufoCategory` is absent from `src/data/ontology-model.json` and `allResources()` (`src/lib/ontology-model.ts`), and `/pdtf/ufoCategory` 404s. The deploy-fix added `hasResource()` guarding shape links so none dangle (the gate passes; the page is still missing).

## Constraints
- `opda-gen` is a deterministic, **byte-identity-gated** emitter; three-graph separation (ODR-0004); ODR-0027 classification-over-inheritance; ODR-0029 shallow entailment ("closed-world, not inferred"). Any decision must keep all gates green.
- Records produced stay **`proposed`** — OPDA WG / Modelling Sub-Committee ratifies adoption (the Council shapes proposals, not adoption).

## The five questions
- **Q1.** Should a Transaction carry a *direct lifecycle-phase property*, or is phase adequately modelled by reified `opda:Milestone` events (mint nothing)? (Note: chain-of-transactions and lease-extension have **no** milestones.)
- **Q2.** If a property: **reuse** `opda:TransactionStatusScheme` (Listed/Offered/Accepted/Exchanged/Completed) or **mint a new coarse scheme**? Confirm bearer = the Transaction Relator (Milestone-Phase, per S032), distinct from participant-status.
- **Q3.** Exemplar value-mapping: what canonical values do the removed `active` / `completed` map to?
- **Q4.** Should the inert, never-reasoned `opda:ufoCategory` **dereference** at `/pdtf/ufoCategory` with its 3-part DOLCE disclosure (ODR-0030 R7b) — or is a first-class-looking term page for an inert facet a category confusion / scope-creep?
- **Q5.** If it dereferences: **how** should the site model surface annotation properties (distinct `entryKind` + inert badge + the disclosure as the page's spine) so they are not mistaken for first-class reasoned terms?

## Input documents
`docs/ontology/odr/ODR-0007-transactions-and-lifecycle.md`; `docs/ontology/odr/ODR-0011-*.md` (§8a); `docs/ontology/odr/ODR-0030-foundational-ontology-choice.md` (R7b); `docs/ontology/odr/ODR-0031-ufocategory-upper-ontology-representation.md` (§Confirmation); `docs/adr/ADR-0045-*.md`; `docs/ontology/odr/council/session-011-enumeration-vocabularies.md`; `docs/ontology/odr/council/session-032-status-scheme-grain.md`; the three exemplars above; `scripts/ontology-model.mjs`; `src/lib/ontology-model.ts`; `source/03-standards/ontology/opda-annotations.ttl`.
