---
status: proposed
date: 2026-06-30
tags: [ontology, generator, object-properties, prov-o, residue-register, ci-gate, regeneration]
supersedes: []
depends-on: [ODR-0034, ODR-0032, ODR-0009, ODR-0008d, ODR-0013, ADR-0048, ADR-0035]
implements: [ODR-0034]
---

# Relationship-residue emission — declare `partOfTransaction`/`concerns`, register aboutness/chain, extend the coverage gate

## Context and Problem Statement

[ODR-0034](../ontology/odr/ODR-0034-relationship-residue-completion.md) (council [session-051](../ontology/odr/council/session-051-relationship-residue-completion.md)) adjudicated the relationship residue the session-047 spine left: it **GATES** two exemplar-attested-but-TBox-undeclared predicates (`opda:partOfTransaction`, `opda:concerns`), **reuses PROV** for the provenance-native relations (no `opda:` mint), **registers** the aboutness + chain edges RESIDUE-PENDING, and **value-slots** the −I endpoints. The generator does not yet implement any of this: `opda:partOfTransaction` and `opda:concerns` occur only as instance predicates in `exemplars/simple-transaction-with-milestones.ttl` / `chain-of-transactions.ttl`, undeclared in the gated TBox and invisible to `ci-object-property-coverage`; the residue register has no entries for `opda:aboutProperty` or the now-un-stale chain pair.

This ADR is the engineering that realises ODR-0034 — the object-property analogue of how [ADR-0048](./ADR-0048-relationship-emission-walk-and-object-property-coverage-gate.md) realised ODR-0032. It is `proposed`; the operator ratifies before the regeneration runs.

## Decision Drivers

* **Generated, not hand-edited.** Every TTL header says `DO NOT HAND-EDIT`; the two new declarations + SHACL shapes MUST live in `opda-gen` emitters and be regenerated.
* **Type-pin per ODR-0034 §R1 / ODR-0032 §R1 (S050).** Documentary `rdfs:domain`/`rdfs:range` (AI-signal, **never entailed** — ADR-0035 zero-domain/range-triple proof obligation) **and** a SHACL `sh:class` value-shape + subject-guard.
* **Coverage-by-test.** Each GATED edge ships **one worked SPARQL competency query**; each RESIDUE-PENDING entry a named disposition + reason + auto-gate condition (empty/"TODO" fails the gate).
* **Reuse, don't shadow.** Do not emit any `opda:` predicate that duplicates a PROV-O term (ODR-0034 §R2/§R5).
* **Determinism / byte-identity.** New triples emitted deterministically; the corpus, `ontology-model.json`, graph, and exemplar expected-reports re-pinned.

## Considered Options

* **Option A (chosen) — Emit the two GATED declarations + SHACL shapes + competency queries; extend the residue register; extend `ci-object-property-coverage`; regenerate + re-pin.**
* **Option B — Hand-add the declarations to the corpus TTLs.** Rejected: generator output (`DO NOT HAND-EDIT`); overwritten on next emit; breaks byte-identity.
* **Option C — Gate the aboutness/chain edges now.** Rejected by ODR-0034 §R3 (bar (b) unmet — zero info-object exemplars; no committed chain-recursion query).

## Implementation Plan

Phased; each phase regenerates and keeps the gates green.

1. **Declare the two GATED edges (emitters).**
   - `opda:partOfTransaction` — `a owl:ObjectProperty`; `rdfs:domain opda:Milestone`; `rdfs:range opda:Transaction`; `rdfs:comment`/`skos:definition`; emitted in the transaction module. SHACL `MilestonePartOfTransactionShape`: `sh:targetClass opda:Milestone; sh:property [ sh:path opda:partOfTransaction; sh:class opda:Transaction; sh:maxCount 1; sh:nodeKind sh:IRI ]` + a subject-guard confining subjects to `opda:Milestone`.
   - `opda:concerns` — `a owl:ObjectProperty`; `rdfs:domain opda:Transaction`; `rdfs:range opda:LegalEstate`; distinct from `opda:concernsProperty` (→`opda:Property`). SHACL `TransactionConcernsShape`: `sh:targetClass opda:Transaction; sh:property [ sh:path opda:concerns; sh:class opda:LegalEstate; sh:minCount 1 ]`. (Both predicates already appear on exemplar instances; declaring them makes the existing ABox conformant + navigable.)
   - Keep documentary domain/range consistent with ADR-0035: re-verify the load-time closure adds **zero** domain/range triples after emission.
2. **Commit the two worked competency queries** (the bar-(b) artefacts) under `src/api/queries/` (or the council-query store): "milestones of transaction T" (traverses `partOfTransaction`) and "the estate transaction T conveys" (traverses `concerns`).
3. **Reuse-PROV (no emission of opda synonyms).** Confirm the ODR-0009/0008d-designed PROV edges are present on the exemplars: VerificationActivity `prov:used`→Evidence/AttachedDocument + `prov:qualifiedAttribution`→Agent; Comparable `prov:wasInformedBy`→Valuation; NameChangeEvent `prov:wasRevisionOf`; UPRNSuccessionEvent `prov:wasDerivedFrom`. Add any the design specified but the exemplars omit. **Do not declare any `opda:` predicate for these.**
4. **Extend the residue register (ODR-0032 / ODR-0034 §R3).** Add, with named disposition + reason + auto-gate condition: `opda:aboutProperty` (Survey/Search/Comparable/NearbyFacility→Property — "warranted, PROV-silent; zero info-object exemplars"); `opda:dependsOnTransaction`/`opda:chainMembers` ("exemplar exists; await recursion query" — correct the stale S047 "no exemplar"); `opda:appliesTo`/`opda:updatesRegistryRecord` ("exemplified-but-undeclared; await competency query").
5. **Extend `ci-object-property-coverage`.** Recognise the two new GATED edges (declared + type-pinned + competency-covered); validate the new register entries are well-formed (non-empty disposition + reason + condition); keep the class-graph dead-edge check separate from the shapes-graph bearer check (ODR-0013). Add unit tests: a regression that leaves `partOfTransaction`/`concerns` undeclared-but-used FAILs; an empty register disposition FAILs.
6. **Regenerate + re-pin.** `opda-gen emit` → re-pin byte-identity (TTLs + shapes); `emit-exemplar-reports` → re-pin expected-reports; regenerate `src/data/ontology-model.json` + `public/data/ontology-graph-elements.json` (the deploy model-drift gate); bump `opda_gen.__version__` + affected `owl:versionIRI`; verify `make ci` + repo-root baspi5 + a clean `build:data`.

### Consequences

* Good, because the two ungoverned ABox predicates become declared, type-pinned, query-covered edges — the model answers "milestones of a transaction" and "estate a transaction conveys" as data.
* Good, because the residue register is current (no stale "no exemplar" chain entry) and the aboutness edge is named for auto-promotion.
* Bad, because it is a byte-identity-affecting regeneration (2 declarations + 2 SHACL shapes + 2 queries + register + regenerated model/graph/expected-reports) requiring a generator version bump.
* Neutral, because no PROV-native relation changes (reuse, not mint) — the verification/comparable/event edges are already PROV.

### Confirmation

`opda-gen ci-object-property-coverage --strict` PASS (the 2 new GATED edges competency-covered; register well-formed); `make verify-ontology` byte-identical after re-pin; repo-root `tests/baspi5_round_trip/` + opda-gen pytest + JS suite green; `build:data` regenerates `ontology-model.json` + graph; the diagnostic exemplars conform to the new SHACL shapes. Wired into `make ci-ontology` + `ontology-byte-identity.yml` + `deploy-aws.yml`.

## More Information

* **Realises:** [ODR-0034](../ontology/odr/ODR-0034-relationship-residue-completion.md) (§R1 GATED edges, §R2 reuse-PROV, §R3 register, §R5 aboutness/provenance boundary).
* **Engineering precedent:** [ADR-0048](./ADR-0048-relationship-emission-walk-and-object-property-coverage-gate.md) (the relationship-emission walk + gate this extends), [ADR-0035](./ADR-0035-load-time-owl-rl-safe-inference-materialisation.md) (the zero-domain/range-triple proof the documentary axioms rely on).
* **Diagram companion:** ADR-0055 (the `rdfs:subClassOf` render layer + the shipped cross-section links — the *visualization* half of session-051; this ADR is the *emission* half).
* Status `proposed`; the operator ratifies before regeneration.
