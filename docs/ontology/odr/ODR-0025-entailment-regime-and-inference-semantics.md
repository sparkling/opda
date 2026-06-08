---
status: accepted
date: 2026-06-01
kind: architecture
tags: [entailment, inference, owl-rl, rdfs, shacl, rdf-1.2, jena]
scope: []
supersedes: []
depends-on: [ODR-0002, ODR-0004, ODR-0005, ODR-0008, ODR-0010, ODR-0013, ODR-0017]
implements: [ODR-0003]
---

# Entailment Regime and Inference Semantics

## Context and Problem Statement

opda's ontology is emitted as three separated graphs — classes / shapes / annotations (ODR-0004 §3a) — and loaded into Apache Jena Fuseki by `scripts/fuseki-load.mjs`. Today that loader performs a plain Graph Store Protocol upload with **no inference step**: the live triplestore holds only asserted triples. The only entailment anywhere in the pipeline is the `inference="rdfs"` flag passed per call to pyshacl inside the BASPI5 round-trip harness (ADR-0014) — an implicit, validator-local behaviour, not a declared regime.

ODR-0002 admitted OWL 2 as a vocabulary and pinned RDF 1.2 and SHACL 1.2 by name, but committed to **no OWL profile and no entailment regime**, explicitly leaving that to a follow-up. opda therefore has no answer to a basic operational question: *when data is loaded, which triples are entailed, and by what rules?* The gap is not benign — ODR-0010 already warns that "loaded = active" is documentation-and-tooling, "silently incorrect with no reasoner to catch it," and the round-trip's correctness silently depends on RDFS entailment being switched on inside one validator.

A sibling project (`~/source/hm/semantic-modelling`) solved the same problem and ratified the result across three council sessions (103/104/105). Its model — replicated here — is deliberately **not** full OWL: it materialises a small, curated, *safe* subset of OWL 2 RL at load time, keeps inference and SHACL validation as strictly separate stages, and runs SHACL on Apache Jena because pyshacl cannot validate SHACL 1.2. This ODR records the *semantic* decision (what entailments opda commits to, and what it deliberately refuses). The mechanisms are specified separately: load-time inference in ADR-0035, SHACL-1.2-via-Jena validation in ADR-0036.

## Considered Options

* **Option A (chosen) — Bounded entailment regime: RDFS + OWL 2 RL-safe rule subset, materialised at load time, full OWL DL out of scope.** SHACL 1.2 via Jena as the constraint layer, kept strictly separate from inference; RDF 1.2 adopted in full on a Jena toolchain.
* **Option B — Full OWL 2 DL classification (HermiT/Pellet/Konclude), the dormant `opda-inference.ttl` path.** Rejected: unsound identity-merging and triple explosion in a master-data ontology, computationally heavy, explicitly out of the directed scope, and never built.
* **Option C — Live Jena `ja:reasoner` (InfModel) at query time, as the primary mechanism.** Rejected: Jena 6's assembler cannot wrap an InfModel around a multi-graph TDB2 dataset without losing named-graph GSP upload (the sibling project hit exactly this and disabled its live reasoner), and it loses asserted-vs-inferred provenance.
* **Option D — No entailment regime (status quo) — rely on per-call pyshacl `inference="rdfs"`.** Rejected: leaves "which triples are entailed?" undefined, couples entailment to one validator's flag, and applies a broader (domain/range-including) RDFS than is safe.
* **Option E — Full RDFS, including `rdfs:domain`/`range` entailment.** Rejected: multi-domain properties mis-type individuals (R2); this is the direct cause of the EPCCertificate false positive.
* **Option F — Defer RDF 1.2 triple-term syntax to stay `rdflib`-parseable (the sibling's path).** Rejected: it lets the weaker tool dictate the data model. opda already standardises on Jena (`riot` parses triple terms; `jena-shacl` validates SHACL 1.2), so the `rdflib` gap is not a constraint opda accepts.

## Decision Outcome

Chosen option: "Option A — Bounded entailment regime: RDFS + OWL 2 RL-safe rule subset, materialised at load time", because a small monotonic rule set yields the useful entailments — hierarchy, inverses, transitivity — that consuming queries and SHACL targets rely on, while refusing the OWL constructs that cause unsound identity-merging and triple explosion in a master-data setting.

opda adopts a **bounded entailment regime**: RDFS plus a curated **OWL 2 RL-*safe*** rule subset, **materialised at Jena load time** into a dedicated derived graph, with **full OWL DL classification explicitly out of scope**; SHACL 1.2 (via Jena) is the constraint/validation layer, kept strictly separate from inference; and RDF 1.2 is adopted **in full** — vocabulary *and* triple-term concrete syntax — on an Apache Jena toolchain that reads and writes it natively, so the standard drives the tooling rather than a parser's limitations driving the standard. The justification: a small monotonic rule set yields the useful entailments — hierarchy, inverses, transitivity — that consuming queries and SHACL targets rely on, while refusing the OWL constructs (`sameAs`, Functional/InverseFunctional, `equivalentClass`/`Property`, `domain`/`range` typing) that cause unsound identity-merging and triple explosion in a master-data setting.

### Consequences

* `scripts/fuseki-load.mjs` gains a load-time materialisation step (ADR-0035); the `opda` dataset then holds asserted + entailed triples in separate graphs.
* opda's RDF toolchain standardises on Apache Jena — `riot` for parse/serialise, `jena-shacl` for validation (ADR-0036); `rdflib`/pyshacl are **retired** from the parse/validate path (not retained as a crutch), with the cut-over gated on demonstrated parity against the ODR-0010 capability floor.
* Statement-level annotation may use RDF 1.2 triple-term syntax going forward; the BASPI5 round-trip harness (ADR-0014) and any `rdflib` use in `opda-gen` migrate to Jena. opda does not downgrade the data model to remain `rdflib`-parseable — the anti-pattern documented for the sibling in `docs/hm-handoff-rdf-1.2-triple-term-jena-fix.md`.
* A new rule-contract artefact `config/opda-owl-rl-safe.rules` becomes a governed file.
* **ODR-0004 §3a requires amendment** to reflect R6 (the `opda-inference.ttl` re-scope) — a directing-authority edit (greenfield: no WG ratification gate), not a blocker on this ODR.
* The BASPI5 round-trip (ADR-0014) must validate against the R1 closure rather than ad-hoc full RDFS (R7); the EPCCertificate emitter mismatch should be fixed at source.
* ODR-0008 §Q6a's "reasoner-independence test" baseline (written for entailment-off endpoints) must be re-read against a defined closure: hierarchy-admission queries now have a declared entailment to test against.
* Consuming SPARQL must expect symmetric/inverse/transitive duplicates from the closure and use `DISTINCT` / `FILTER NOT EXISTS` where appropriate.
* No emitted IRIs change and no new ontology terms are minted — this *activates* already-committed RDFS/OWL vocabulary; it does not extend the ontology.

## More Information

- Refines: [ODR-0002](ODR-0002-ontology-language-adoption.md) — ontology language adoption (OWL 2 / RDF 1.2 / SHACL 1.2 pins).
- Bounds the "safe" set: [ODR-0005](ODR-0005-property-land-identity-crux.md) §R5 (no `owl:sameAs`), [ODR-0017](ODR-0017-shacl-af-quality-rules-pattern.md) §R6 (no `sameAs` materialisation; SHACL-AF pattern).
- Re-scopes: [ODR-0004](ODR-0004-pdtf-ontology-foundation.md) §3a (three-graph separation; `opda-inference.ttl` projection row) — see R6.
- Validation contract: [ODR-0013](ODR-0013-shacl-validation-and-severity.md), [ODR-0010](ODR-0010-overlay-profile-mechanism.md) (overlay mechanism; pyshacl capability floor; "loaded ≠ entailed").
- Perturbs baseline: [ODR-0008](ODR-0008-property-descriptive-attributes.md) §Q6a (reasoner-independence test).
- Realised by: ADR-0035 (load-time inference materialisation), ADR-0036 (SHACL 1.2 via Jena).
- Prior art (replicated): `~/source/hm/semantic-modelling` — hm ODR-0036 (SHACL rules & OWL inferencing), hm ODR-0014 (domain/range as documentation), council sessions 103/104/105 (Jena entailment architecture); `config/hm-owl-rl-safe.rules`; hm ADR-0022 (entailed-graph export), hm ADR-0147 (Jena SHACL 1.2).
- Implementation context: `scripts/fuseki-load.mjs`, `docs/manual/physical-database/derived-profiles/opda-inference.md`.

## Rules

### R1 — The enabled set: RDFS + OWL 2 RL-safe

The load-time closure materialises exactly these constructs (the "Safe Group"). Each is monotonic and polynomial; together they are a strict subset of OWL 2 RL.

| # | Construct | Entailment |
|---|---|---|
| 1 | `rdfs:subClassOf` transitivity | `(?x subClassOf ?y), (?y subClassOf ?z)` → `(?x subClassOf ?z)` |
| 2 | `rdfs:subClassOf` type propagation | `(?v a ?x), (?x subClassOf ?y)` → `(?v a ?y)` |
| 3 | `rdfs:subPropertyOf` transitivity | `(?p subPropertyOf ?q), (?q subPropertyOf ?r)` → `(?p subPropertyOf ?r)` |
| 4 | `rdfs:subPropertyOf` value propagation | `(?p subPropertyOf ?q), (?x ?p ?y)` → `(?x ?q ?y)` |
| 5 | `owl:inverseOf` (both directions) | `(?p inverseOf ?q), (?x ?p ?y)` → `(?y ?q ?x)` |
| 6 | `owl:TransitiveProperty` | `(?p a TransitiveProperty), (?x ?p ?y), (?y ?p ?z)` → `(?x ?p ?z)` |
| 7 | `owl:SymmetricProperty` | `(?p a SymmetricProperty), (?x ?p ?y)` → `(?y ?p ?x)` |

The canonical rule contract lives at `config/opda-owl-rl-safe.rules` (ADR-0035), expressed in Jena `GenericRuleReasoner` syntax even though the load step hand-translates it to SPARQL `INSERT`. The rules file is the source of truth for *which* rules are safe. A disjointness consistency *check* (`owl:disjointWith` violation detection) is permitted but is a validation gate, not an entailment — it produces no domain triples (see ADR-0035).

### R2 — The excluded set (this is the definition of "not full OWL")

The following are **forbidden** from the load-time closure. The first three are already normative anti-patterns in opda's own corpus:

| Construct | Why excluded | Anchor |
|---|---|---|
| `owl:sameAs` materialisation | Irreversible identity propagation; catastrophic in master data | ODR-0005 R5, ODR-0017 R6 |
| `owl:FunctionalProperty` / `owl:InverseFunctionalProperty` | Trigger `owl:sameAs` identity-merge | ODR-0005 R5 (inherited) |
| `owl:equivalentClass` / `owl:equivalentProperty` | Uncontrolled bidirectional propagation + transitive explosion | hm ODR-0036 (S32b) |
| `rdfs:domain` / `rdfs:range` type entailment | Multi-domain intersection mis-types individuals: a property with N declared domains infers each subject is all N classes at once | hm ODR-0014 (domain/range as documentation) |
| `owl:Restriction`, `owl:unionOf`/`intersectionOf`/`complementOf`, cardinality, `owl:oneOf`, `owl:hasKey` | DL classification; existential/universal reasoning; outside RL | — |

This is what makes the regime *RL-safe* rather than RL or DL: no identity merging, no equivalence, no domain/range classification, no restriction reasoning.

### R3 — Inference and validation are separate stages ("materialise, then validate — never mix")

Load-time inference (R1) produces triples. SHACL (ADR-0036) consumes triples. The two MUST NOT be conflated: opda does **not** front SHACL with an OWL reasoner, and SHACL constraints are **not** expressed as OWL axioms (ODR-0004 R3 already fixes this — `sh:minCount 1` is not `owl:minCardinality`). Where a constraint needs a derived triple that R1 does not produce, use a SHACL-AF `sh:rule` to pre-materialise *only that triple* (ODR-0017), never an OWL construct.

### R4 — Materialisation target: a derived entailed graph, never a canonical source

Entailed triples are written to a dedicated derived named graph `https://opda.org.uk/pdtf/graph/inferred/entailment`, sibling to the per-module graphs. They MUST NOT be written back into `opda-classes.ttl`, `opda-shapes.ttl`, or `opda-annotations.ttl` (ODR-0004 §3a three-graph invariant and its CI tests). The entailed graph is **derived, rebuilt on every load, never hand-edited** — consistent with §3a's "consumer profiles are generated, never hand-edited." It is an ABox+TBox **closure** graph (entailing instance types and relations), distinct from the §3a `opda-inference.ttl` classes-alone TBox *projection* — see R6.

### R5 — RDF 1.2: adopted in full, on a Jena toolchain

ODR-0002 pins RDF 1.2. This ODR realises that pin **in full**: opda adopts the RDF 1.2 reification **vocabulary** (`rdf:Reifier`, `rdf:reifies`), the **triple-term concrete syntax** `<<( s p o )>>` and annotation syntax `{| … |}` for statement-level annotation, and SPARQL 1.2 query features. Statement-level annotation (provenance, confidence, attribution carried on a specific triple) uses RDF 1.2 triple terms — **not** an OWL-2 annotation-axiom (`owl:annotatedSource`/`Property`/`Target`) or reification work-around adopted to placate a parser.

**The toolchain follows the standard, not the reverse.** opda standardises on **Apache Jena** (`riot` for parse/serialise, `jena-shacl` for validation — ADR-0036), which reads and writes RDF 1.2 natively. opda does **not** take a dependency on a library that cannot parse RDF 1.2 — notably Python `rdflib`, which through its current (7.x) releases cannot parse triple-term syntax. Any opda step that today parses or serialises RDF via `rdflib`/pyshacl — the BASPI5 round-trip harness (ADR-0014), and any `rdflib` use inside `opda-gen` — migrates to Jena (ADR-0036). This deliberately **reverses the sibling project's path**: hm adopted RDF 1.2, then *retired* the triple-term syntax from its live tree (migrating to OWL-2 annotation axioms / SSSOM) to stay `rdflib`-parseable — letting the weaker tool dictate the data model. opda treats that as the anti-pattern to avoid; the corrective hand-off is `docs/hm-handoff-rdf-1.2-triple-term-jena-fix.md`.

SHACL 1.2 validation does not *require* RDF 1.2 data (the two are separable), but both ride the same Jena toolchain — so adopting Jena for one removes the only excuse for deferring the other.

### R6 — Partial re-scope of ODR-0004 §3a: the `opda-inference.ttl` projection

ODR-0004 §3a defines a derived profile `opda-inference.ttl = classes alone → OWL reasoners` (HermiT / Pellet / Konclude TBox classification). That profile targets the **full OWL DL classification this ODR places out of scope**, and it was never built (`opda-inference.md`: "spec only; directory does not yet exist"). This ODR **proposes** to supersede the DL-classification *intent* of that §3a row: opda's inference is the load-time OWL-RL-safe closure (R1/R4), not external DL reasoning.

> **Ratification (directing authority, 2026-06-01).** This re-scope amends a council-ratified clause of ODR-0004. Disposition **(a) supersede the DL-classification intent** is adopted: opda does not run full OWL DL reasoners (HermiT/Pellet/Konclude); the load-time OWL-RL-safe closure (R1/R4) is opda's only inference. ODR-0004 §3a and `docs/manual/physical-database/derived-profiles/opda-inference.md` are amended accordingly (the `opda-inference.ttl` row is re-pointed from "DL-reasoner input" to "the OWL-RL-safe closure / a classes-alone export retained only as an optional artefact for third-party DL tooling, never built by opda's pipeline"). Dispositions (b) retain-as-optional-export and (c) re-scope-the-name are folded into (a): the name is retained, the *intent* superseded.

### R7 — Interaction with the BASPI5 round-trip and the EPCCertificate defect

opda's declared closure is **narrower** than the `inference="rdfs"` setting the round-trip currently passes to pyshacl (ADR-0014): the Safe Group **excludes `rdfs:domain`/`range` entailment** (R2). Consequently:

- Under opda's regime, an `opda:EPCCertificate` carrying `opda:currentEnergyRating` (whose `rdfs:domain` is `opda:Property`) is **not** inferred to be a `Property`. The known EPCCertificate defect (handover 2026-06-01 §8) does **not** manifest in the R1 closure.
- The defect manifests **only** under the broader `inference="rdfs"` validator setting. ADR-0036 MUST therefore align the validator's entailment with the R1 closure — validate against the materialised R1 graph, not an ad-hoc full-RDFS inference. The underlying emitter mismatch (a `Property`-domain predicate bound on a non-`Property` subject) SHOULD still be fixed at source (ADR-0035), but it ceases to be a correctness landmine once domain entailment is excluded.

