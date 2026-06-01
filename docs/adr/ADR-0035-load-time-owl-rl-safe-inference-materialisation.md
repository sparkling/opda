---
status: accepted
date: 2026-06-01
tags: [inference, entailment, jena, fuseki, owl-rl, sparql, materialisation]
supersedes: []
depends-on: [ODR-0025, ODR-0004, ADR-0021, ADR-0014]
implements: []
---

# Load-Time OWL-RL-Safe Inference Materialisation in Jena/Fuseki

## Context and Problem Statement

ODR-0025 commits opda to a bounded entailment regime — RDFS plus a curated OWL 2 RL-*safe* rule subset, materialised at Jena load time. opda has no such mechanism today: `scripts/fuseki-load.mjs` performs a plain Graph Store Protocol `PUT` of each module TTL into `https://w3id.org/opda/graph/<module>` and counts triples. There is no reasoner, no ruleset, and no entailed graph; the live triplestore holds only asserted triples.

This ADR specifies *how* opda materialises the ODR-0025 R1 closure at load time. The reference implementation is the sibling project's `~/source/hm/semantic-modelling/scripts/fuseki-load-ontology.sh`. Its council (sessions 103/104/105) chose **explicit SPARQL-`INSERT` materialisation** over a live Jena `ja:reasoner` after the Jena 6 assembler proved unable to wrap an `InfModel` around a multi-graph TDB2 dataset without losing the named-graph GSP upload its loader depends on — and because materialisation preserves queryable asserted-vs-inferred provenance.

## Decision Drivers

* Must realise exactly the ODR-0025 R1 enabled set and produce **no** R2-excluded entailment (no `owl:sameAs`, Functional/InverseFunctional, equivalence, or `rdfs:domain`/`range` typing).
* Must write entailed triples to a derived graph only — never pollute `opda-classes.ttl` / `opda-shapes.ttl` / `opda-annotations.ttl` (ODR-0004 §3a, CI-enforced).
* Must preserve asserted-vs-inferred provenance (distinguishable by graph).
* Must not require a Java build and must not fight the Jena-6 InfModel/named-graph limitation.
* Must extend the existing Node loader (`fuseki-load.mjs`) and remain compatible with ADR-0021's Fuseki/GRLC read path.
* Must keep inference and SHACL validation as separate stages (ODR-0025 R3).

## Considered Options

* **A — SPARQL-`INSERT` fixpoint at load** — port the sibling's shell fixpoint to a `materializeEntailments()` step in `fuseki-load.mjs`: one idempotent `INSERT … WHERE … FILTER NOT EXISTS` per safe rule, looped to a fixpoint, writing to a dedicated inferred named graph.
* **B — Live Jena `ja:reasoner` (InfModel) assembler** — a `config/opda-fuseki-assembler.ttl` with a `GenericRuleReasoner` reading `config/opda-owl-rl-safe.rules`, computing entailment in-memory at query time.
* **C — External batch reasoner** — run a Jena `GenericRuleReasoner` offline (Java CLI), write `entailed.ttl`, load it as a graph.
* **D — Keep entailment validator-local** — no triplestore materialisation; rely on pyshacl `inference="rdfs"` per validation call (status quo).

## Decision Outcome

Chosen option: **A — SPARQL-`INSERT` fixpoint at load**, because it needs no Java build, sidesteps the Jena-6 `InfModel`/named-graph limitation, yields queryable asserted-vs-inferred provenance, and is proven across the sibling's three council sessions. **B is retained as a documented fallback** if scale (≳500K triples) ever makes the fixpoint loop too slow; the rule contract (`config/opda-owl-rl-safe.rules`) is deliberately authored to drive *both* A and B, so the A→B switch is cheap. C adds an offline Java step for no provenance benefit over A. D is what ODR-0025 supersedes.

The entailed graph IRI is `https://w3id.org/opda/graph/inferred/entailment` (sibling of the per-module graphs). The `opda` dataset is set `tdb2:unionDefaultGraph true` so inferred triples are visible to un-GRAPH-qualified queries and the export CONSTRUCT for free.

### Consequences

* Good, because the "inference step during loading" ODR-0025 mandates becomes real and self-contained in `fuseki-load.mjs` — no new service, no Java toolchain.
* Good, because asserted and inferred triples stay in separate graphs — provenance is queryable and the three-graph invariant (ODR-0004 §3a) is preserved.
* Good, because the rule contract is shared with the fallback (B), so scaling later does not invalidate this decision.
* Bad, because a fixpoint of SPARQL `INSERT`s is single-threaded and O(passes × rules × triples) — fine at opda's scale, but not a long-term answer at very large ABox sizes (mitigated by the documented B path).
* Bad, because it adds a governed config file (`config/opda-owl-rl-safe.rules`) and load-step surface that must be kept in sync with ODR-0025 R1/R2.
* Neutral, because `unionDefaultGraph` flips to `true` for the `opda` dataset — a change from the current implied behaviour (the loader counts via `GRAPH ?g {}` today), but aligned with ADR-0021's read path.

### Confirmation

A new CI gate (suggested `ci-inference-closure`) asserts, after a load:

1. the inferred graph is non-empty;
2. a known `rdfs:subClassOf` instance gains its parent type, a known `owl:inverseOf` is materialised in both directions, a known `owl:TransitiveProperty` chain closes;
3. **no R2-excluded triple appears** — no `owl:sameAs`, and (the regression guard) no spurious `opda:EPCCertificate rdf:type opda:Property`;
4. the post-load consistency gate exits non-zero on any `owl:disjointWith` violation;
5. the existing byte-identity and three-graph gates stay green (the inferred graph is derived; canonical sources are untouched).

## Pros and Cons of the Options

### A — SPARQL-`INSERT` fixpoint at load

* Good, because pure SPARQL UPDATE over the existing endpoint; no Java, no assembler surgery.
* Good, because idempotent (`FILTER NOT EXISTS`) and provenance-preserving (dedicated graph).
* Bad, because forward-chaining-by-shell-loop is the least performant materialiser at large scale.

### B — Live Jena `ja:reasoner` (InfModel)

* Good, because inference is automatic and always current; no loader changes.
* Bad, because Jena 6's assembler cannot wrap an `InfModel` over a multi-graph TDB2 dataset without losing named-graph GSP upload (the exact wall the sibling hit and documented as a `TODO`); loses asserted-vs-inferred provenance; recomputed on every restart.

### C — External batch reasoner

* Good, because a real reasoner (full GenericRuleReasoner) with better performance characteristics.
* Bad, because adds an offline Java build/run step and an `entailed.ttl` artefact to manage, for no provenance gain over A.

### D — Validator-local entailment (status quo)

* Good, because zero new machinery.
* Bad, because "which triples are entailed?" stays undefined, coupled to one validator's flag, and applies a *broader* (domain/range-including) RDFS than ODR-0025 permits — the source of the EPCCertificate false positive.

## Rules

### The rule contract — `config/opda-owl-rl-safe.rules`

A new governed file, adapted from the sibling's `config/hm-owl-rl-safe.rules`. The rules reference only `rdfs:`/`owl:`/`rdf:` vocabulary, so they are domain-agnostic — only the header/namespace comments change for opda. It is the source of truth for the **enabled set** (ODR-0025 R1) and carries the **excluded set** (R2) as commented-out blocks with rationale, for auditability. Expressed in Jena `GenericRuleReasoner` syntax even though option A hand-translates each rule to a SPARQL `INSERT` (this keeps the A→B fallback viable).

### Materialisation — `materializeEntailments()` in `scripts/fuseki-load.mjs`

Runs after the upload loop, before the final triple count, on **both** `--clear` and incremental loads (the inferred graph is always rebuilt fresh):

1. `DROP GRAPH <https://w3id.org/opda/graph/inferred/entailment>` — idempotent rebuild; the graph is derived, never hand-edited.
2. Fixpoint loop (guard ≤ 10 passes): each pass runs the 7 R1 `INSERT`s in dependency order — schema closure first (`subClassOf` transitivity → `subPropertyOf` transitivity), then propagation (`subPropertyOf` value → `subClassOf` type), then data rules (`inverseOf` ×2 → symmetric → transitive); count total triples each pass; break when a pass adds 0.
3. Each `INSERT` targets the inferred graph and uses `FILTER NOT EXISTS` to stay monotonic and idempotent; sent via `Content-Type: application/sparql-update` with the loader's existing `BASIC_AUTH` header.

Representative (R1 rule #2, `subClassOf` type propagation):

```sparql
INSERT { GRAPH <https://w3id.org/opda/graph/inferred/entailment> { ?v a ?y } }
WHERE  { ?v a ?x . ?x rdfs:subClassOf ?y
         FILTER(?x != ?y) FILTER NOT EXISTS { ?v a ?y } }
```

The seven `INSERT` bodies are the sibling's verbatim (they cite only `rdfs:`/`owl:`/`rdf:` terms); none reference an opda IRI, so none need editing.

### Dataset config — `unionDefaultGraph`

Set the `opda` TDB2 dataset `tdb2:unionDefaultGraph true` so the inferred named graph is visible to un-GRAPH-qualified queries and the export CONSTRUCT without a `GRAPH` clause. (The sibling's `/learn` dataset uses `false` to *force* GRAPH discipline — a different dataset for a different purpose; do not conflate. opda's ontology dataset wants union-default to match the materialisation + export model and ADR-0021's read path.)

### Entailed-graph export (optional — only if a consumer needs it)

A CONSTRUCT over the (union) default graph, adapted from the sibling's ADR-0022 export, swapping the namespace allow-list to `https://w3id.org/opda/`:

```sparql
CONSTRUCT { ?s ?p ?o } WHERE {
  { ?s ?p ?o
    FILTER(STRSTARTS(STR(?s), "https://w3id.org/opda/"))
    FILTER(!STRSTARTS(STR(?p), "http://jena.hpl.hp.com/")) }
  UNION
  { ?s ?p ?o FILTER(isBlank(?s))
    ?parent <http://www.w3.org/ns/shacl#property> ?s
    FILTER(STRSTARTS(STR(?parent), "https://w3id.org/opda/")) }
}
```

The `http://jena.hpl.hp.com/` filter strips Jena rule-engine bookkeeping (e.g. `rb:violation` diagnostics from the disjointness check); the blank-node `UNION` arm preserves SHACL `sh:property` blank-node shapes that a subject-namespace filter alone would drop.

### Post-load consistency gate

After materialisation, COUNT-query checks fail the load (`process.exit(1)`) on any non-zero result: pairwise `owl:disjointWith` violations, and — if opda declares them — `owl:FunctionalProperty`/`owl:InverseFunctionalProperty` cardinality breaches. This *validates* the R2-disabled identity constructs without *entailing* them (the "disjointness as validation, not materialisation" split).

### EPCCertificate emitter fix — precondition

Per ODR-0025 R7, opda's safe set excludes domain/range entailment, so this load-time closure does **not** mis-type `opda:EPCCertificate`. The mismatch is still latent at source: `Baspi5_EPCCertificateShape` binds `opda:currentEnergyRating` (whose `rdfs:domain` is `opda:Property`) onto `opda:EPCCertificate`. Fix at source — give `EPCCertificate` its own rating predicate, or scope the shape — before relying on any broader RDFS entailment elsewhere. The ADR-0014 JSON→RDF translator carries the same mismatch. Tracked as a precondition for ADR-0036's validator alignment.

## More Information

- Realises: ODR-0025 (bounded entailment regime) §R1/R4/R7.
- Respects: ODR-0004 §3a (three-graph separation; derived-graph discipline).
- Extends: ADR-0021 (Fuseki + grlc SPARQL API; the `scripts/fuseki-load.mjs` loader and its `entailment:` decorator convention).
- Affects: ADR-0014 (BASPI5 round-trip — the `inference="rdfs"` assumption and EPCCertificate defect).
- Validation stage: ADR-0036 (SHACL 1.2 via Jena) — the separate, downstream consumer of the materialised graph.
- Prior art (replicated): `~/source/hm/semantic-modelling/scripts/fuseki-load-ontology.sh` (the fixpoint loop), `config/hm-owl-rl-safe.rules` (the contract), `config/fuseki-config.ttl` (`unionDefaultGraph`), ADR-0022 (entailed-graph export), council sessions 103/104/105 (SPARQL-`INSERT` over live `ja:reasoner`).
