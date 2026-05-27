---
status: accepted
date: 2026-05-27
tags: [ontology, emission, foundation, three-graph, ci]
supersedes: []
depends-on: [ADR-0008, ODR-0004]
implements: [ADR-0008]
---

# Foundation TTL emission

## Context and Problem Statement

[ADR-0008](./ADR-0008-generator-implementation-infrastructure.md) establishes the generator package infrastructure. This ADR ratifies the **first concrete emission** — the foundation Turtle files that every downstream module emission consumes:

- `foundation.ttl` — ontology header (`vann:preferredNamespacePrefix`; `owl:versionIRI`; `dct:title`/`creator`/`issued`/`modified`; `sh:prefixes` declaration node).
- `opda-classes.ttl` — initial OWL/RDFS class graph (the `opda:` namespace registered; foundation classes from ODR-0001 vocabulary).
- `opda-shapes.ttl` — initial SHACL shapes graph (empty body; header only; reserved for ADR-0012 module shapes).
- `opda-annotations.ttl` — initial advisory annotations graph (empty body; header only; reserved for ADR-0012 DPV co-annotations).

The decision is small in content but large in significance: it is the **first proof that ADR-0008's infrastructure produces byte-identical output** that passes [ODR-0004 §3a five-part CI test](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md). Every subsequent ADR (0010 through 0014) inherits the foundation emission's pattern.

## Decision Drivers

* **Three-graph separation must be enforceable from day one** (ODR-0004 §3a). The foundation emission MUST land with all three source files (classes / shapes / annotations) — even if shapes + annotations are header-only — so CI tests can run end-to-end.
* **Byte-identity CI must pass on the foundation alone** (ODR-0004 §6a; ADR-0007). Before any module work begins, the foundation emission proves the deterministic-emission contract is operationally honoured.
* **The `vann:` header pattern is non-trivial** — `vann:preferredNamespacePrefix`, `vann:preferredNamespaceUri`, `owl:versionIRI` (pinned to generator version + date) MUST resolve correctly for SHACL-SPARQL constraints (per ODR-0004 §Rules.4).
* **The Council vocabulary itself needs first-class classes** — every `kind: pattern` ODR declares classes that need foundation-level support (`opda:DiagnosticExemplar` already used in exemplars; `opda:ValidationContext` per S010 Q1; `opda:UPRNSuccessionEvent` per S005 Q4).
* **Header-only shapes and annotations files prevent silent absence** — if `opda-shapes.ttl` is missing, downstream `owl:imports` will break silently; emitting it empty-but-present is the right defensive default.

## Considered Options

* **A — One single `opda.ttl` with all three graphs merged** (chosen REJECT). Pro: simpler tooling. Con: violates ODR-0004 §3a three-graph separation; CI cannot enforce graph isolation; consumers cannot load TBox-only or shapes-only without parsing.
* **B — Two-graph: classes + shapes only; annotations deferred until first use** (chosen REJECT). Pro: smaller initial emission. Con: silent absence breaks downstream `owl:imports`; ADR-0012 cannot emit annotations atomically; three-graph CI test cannot run.
* **C — Three-graph source emission from day one with empty shapes + annotations bodies (chosen).** All three source files present; header + ontology-level metadata in each; module-level content lands in subsequent ADRs.

## Decision Outcome

Chosen option: **C — Three-graph source emission with all three source files present**, because it satisfies ODR-0004 §3a from the foundation onward without speculative content. Empty bodies are operationally honest (the three-graph CI test still runs; downstream emissions append, not create-or-replace).

### `foundation.ttl` — ontology header

**Sentinel pinning convention (ADR-0009 §G6 amendment, 2026-05-27).** The angle-bracket placeholders `<version>`, `<iso-date>`, `<git-sha>`, `<emission-date>` in the template below are **illustrative**, not live-substitution directives. The byte-identity CI contract (ODR-0004 §6a) requires that regeneration produce zero diff against the committed TTL — any field that varies between regenerations (live HEAD SHA, today's date, wall-clock time) would silently break that contract on every unrelated commit. Therefore the emitter pins these fields to stable sentinels:

- `<version>` → the locked `opda_gen.__version__` literal (e.g. `"opda-gen-0.3.0"`); bumps in lockstep with `owl:versionIRI`.
- `<git-sha>` → constant sentinel `"pinned-by-ADR-NNNN"` where NNNN is the ADR that last regenerated foundation (e.g. `"pinned-by-ADR-0011"` after the Phase 3 worker landed). The CI workflow's per-commit SHA is captured elsewhere (workflow logs; PR metadata) — not in the emitted TTL.
- `<iso-date>` and `<emission-date>` → constant sentinel `"2026-05-27"` (the foundation's `dct:issued` date; treated as the ontology's effective date, not the build's wall-clock date). The Council ratifies amendments via per-emission ADRs; each ADR's date provides the "what changed when" trail without needing the TTL to track build timestamps.

Engineering decision per programme plan §9.4 (within-engineering; not Council route — `## Rules` are unaffected). Independent validator concurred at ADR-0009 validation report (commit `8894eb9`).

```turtle
# foundation.ttl — OPDA ontology foundation
# Generated by opda-gen <version> at <iso-date>; DO NOT HAND-EDIT.
# Specification: https://openpropdata.org.uk/adr/ADR-0007-ontology-generator-specification
# Implementation: https://openpropdata.org.uk/adr/ADR-0008-generator-implementation-infrastructure
# This emission: https://openpropdata.org.uk/adr/ADR-0009-foundation-ttl-emission
# Generator version: opda-gen-0.1.0
# Source commit: <git-sha>   ← sentinel-pinned per §G6 convention above

@prefix opda:    <https://w3id.org/opda/#> .
@prefix owl:     <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dct:     <http://purl.org/dc/terms/> .
@prefix vann:    <http://purl.org/vocab/vann/> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .
@prefix skos:    <http://www.w3.org/2004/02/skos/core#> .

<https://w3id.org/opda/>
    a owl:Ontology ;
    dct:title "OPDA — Open Property Data Association Ontology"@en ;
    dct:description "Linked-data ontology for UK residential property transaction data; the Trust Framework's machine-readable vocabulary."@en ;
    dct:creator "OPDA Linked Data Council" ;
    dct:issued "2026-05-27"^^xsd:date ;
    dct:modified "<emission-date>"^^xsd:date ;   # ← sentinel-pinned per §G6 convention above
    dct:license <https://creativecommons.org/publicdomain/zero/1.0/> ;
    vann:preferredNamespacePrefix "opda" ;
    vann:preferredNamespaceUri "https://w3id.org/opda/#"^^xsd:anyURI ;
    owl:versionIRI <https://w3id.org/opda/0.1.0/> ;
    owl:versionInfo "0.1.0 — foundation skeleton (ADR-0009)" ;
    opda:generatorVersion "opda-gen-0.1.0" ;
    sh:declare [
        sh:prefix "opda" ;
        sh:namespace "https://w3id.org/opda/#"^^xsd:anyURI ;
    ] ;
    .
```

### `opda-classes.ttl` — initial class graph

Initial classes from the foundation are those needed before any module ratifies — primarily the Council apparatus classes from ODR-0001 + ODR-0004:

| Class | UFO/DOLCE category | Source ODR | Purpose |
|---|---|---|---|
| `opda:DiagnosticExemplar` | Informational endurant | ODR-0004 §8a | Diagnostic-exemplar IC-test harness type |
| `opda:GeneratorRun` | Information particular | ODR-0004 §6a | Provenance of emission |

Subsequent ADRs (0010 vocabularies; 0011 modules) add classes per their ratified scope; foundation stays minimal.

Per ADR-0007 §"A9 per-kind discipline output", each class emits with `dct:source` + `skos:scopeNote` + `rdfs:comment`:

```turtle
opda:DiagnosticExemplar
    a owl:Class ;
    rdfs:label "Diagnostic Exemplar"@en ;
    rdfs:comment "Informational endurant. IC: the named hard case — minimal Turtle exposing one IC-bearing surface as input to a Council session's identity-criterion validation. Hard cases: registered freehold house; unregistered house pre-first-registration; flat with split UPRN."@en ;
    skos:scopeNote "DOLCE: NonPhysicalEndurant. UFO: Substance Kind (informational)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0004#section-8a-diagnostic-exemplars> ;
    .
```

### `opda-shapes.ttl` — initial shapes graph (header only)

```turtle
# opda-shapes.ttl — OPDA SHACL shapes graph (foundation skeleton)
# Module shapes land via ADR-0012 and downstream module ADRs.
# This graph MUST NOT contain owl:Class or owl:imports triples
# (ODR-0004 §3a three-graph separation).

@prefix opda:    <https://w3id.org/opda/#> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dct:     <http://purl.org/dc/terms/> .

<https://w3id.org/opda/shapes>
    a owl:Ontology ;
    dct:title "OPDA SHACL Shapes Graph"@en ;
    opda:targetsClassGraph <https://w3id.org/opda/0.1.0/> ;
    .
# Module shapes intentionally empty here; appended by per-module emission.
```

### `opda-annotations.ttl` — initial annotations graph (header only)

```turtle
# opda-annotations.ttl — OPDA advisory annotations graph (foundation skeleton)
# Module annotations (DPV co-annotation per ODR-0018; LLM hints; UI hints)
# land via ADR-0012 and downstream module ADRs.
# This graph MUST NOT contain sh:* or owl:Class triples
# (ODR-0004 §3a three-graph separation).

@prefix opda:    <https://w3id.org/opda/#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dct:     <http://purl.org/dc/terms/> .

<https://w3id.org/opda/annotations>
    a owl:Ontology ;
    dct:title "OPDA Advisory Annotations Graph"@en ;
    opda:targetsClassGraph <https://w3id.org/opda/0.1.0/> ;
    .
# Annotations intentionally empty here; appended by per-module emission.
```

### Consequences

* Good, because three-graph CI test (ODR-0004 §3a) runs from the first emission, catching graph-leakage regressions immediately.
* Good, because byte-identity CI test runs against a real (non-trivial) artefact from day one, validating the canonical serialiser in production conditions.
* Good, because subsequent module emissions inherit a predictable foundation; no per-module decisions about header structure, version-IRI pattern, or `vann:` declarations.
* Good, because the `owl:versionIRI` is pinned to the generator version (`opda-gen-0.1.0` → `<https://w3id.org/opda/0.1.0/>`) — version-mismatch detection becomes mechanical.
* Good, because `sh:declare` for the `opda` prefix means SHACL-SPARQL constraints (ODR-0005 UPRN uniqueness check; downstream UFO category checks) resolve prefixes correctly.
* Bad, because empty-bodied shapes + annotations files read as "incomplete" to humans — mitigation: explanatory comments in the header.
* Bad, because version-IRI pinning to `<https://w3id.org/opda/0.1.0/>` requires w3id.org redirect setup (ADR-0006). If the redirect hasn't merged at first emission, the version-IRI dereferences to nothing — mitigation: emit anyway; redirect activates asynchronously.
* Neutral, because the foundation emission is small (~50 lines per file) — fast to generate, fast to review.

### Confirmation

The ADR is honoured when all five hold:

1. **First emission lands.** `opda-gen emit-foundation` produces `foundation.ttl`, `opda-classes.ttl`, `opda-shapes.ttl`, `opda-annotations.ttl` in `source/03-standards/ontology/`.
2. **Byte-identity CI green.** Subsequent regeneration produces zero diff.
3. **Three-graph CI test green** (ODR-0004 §3a five-part):
   - `ASK { GRAPH opda:annotations { ?s ?p ?o . FILTER(STRSTARTS(STR(?p), "http://www.w3.org/ns/shacl#")) } }` returns FALSE.
   - `ASK { GRAPH opda:shapes { ?s owl:imports ?g } }` returns FALSE.
   - `ASK { GRAPH opda:shapes { ?s opda:aiHint ?o } }` returns FALSE.
   - `SELECT ?c WHERE { ?s sh:targetClass ?c . FILTER NOT EXISTS { GRAPH opda:classes { ?c a owl:Class } } }` returns empty (vacuously true with no shapes yet).
   - Consumer-profile derivation produces consistent output across runs.
4. **`vann:` header resolves.** rdflib parses the ontology header without errors; `vann:preferredNamespacePrefix` and `vann:preferredNamespaceUri` are present.
5. **Diagnostic exemplar still validates.** Existing exemplars (15 .ttl files in `exemplars/`) parse against `foundation.ttl` + `opda-classes.ttl` without "undefined class" errors for `opda:DiagnosticExemplar`.

Manual test: `opda-gen emit-foundation && opda-gen ci-three-graph && rapper -i turtle source/03-standards/ontology/foundation.ttl` (rapper parses successfully).

**Programme-wide validation gate** (per [ADR programme plan §9 — Validation discipline](../plan/ontology-implementation.md)). In addition to the ADR-specific criteria above, this ADR moves `proposed → accepted` only when **all four** of the following hold (independent of the worker that implemented this ADR):

- **(a) Soundness check PASS** — every emitted artefact traces to a cited ODR/ADR `## Rules` or `## Operational specifications` clause via `dct:source` (for Turtle) or code-comment provenance header (for Python). The validation agent extracts emitted-artefact provenance and verifies each resolves to a ratified section.
- **(b) Completeness check PASS** — every cited ODR's `## Rules` and `## Operational specifications` subsection is realised by an emitted artefact OR explicitly deferred with a named follow-up trigger. The validation agent enumerates cited subsections and checks coverage.
- **(c) Cross-ADR consistency check PASS** — every downstream ADR's confirmation criteria can be met given this ADR's emission (e.g. classes emitted here are referenceable by downstream shapes; shapes here are composable by downstream profiles). The validation agent simulates the downstream contract against this ADR's output.
- **(d) Validation report committed** at `docs/adr/validation/ADR-0009-validation-report.md`, produced by an **independent validation-agent spawn** (NOT the implementing worker; mirrors the Council Devil's Advocate independence per [ODR-0001 §Roles for every session](../ontology/odr/ODR-0001-linked-data-council-methodology.md); see ADR programme plan §8 swarm orchestration topology).

A FAIL on any of (a)–(d) blocks `accepted` status; the implementing worker amends and validation re-runs. Two consecutive validation failures on the same ADR escalate to a Council mini-session per [ODR-0001 §Self-amendment process](../ontology/odr/ODR-0001-linked-data-council-methodology.md) — engineering does not re-deliberate; surfaced `## Rules` ambiguity routes to Council ratification.

## More Information

* **Predecessor ADR:** [ADR-0008 — Generator implementation infrastructure](./ADR-0008-generator-implementation-infrastructure.md). The package this ADR's first emission validates.
* **Specification ADR:** [ADR-0007 — Ontology generator specification](./ADR-0007-ontology-generator-specification.md). The emission rules this ADR concretises.
* **Council contracts:** [ODR-0004 §3a + §6a + §Rules.4](../ontology/odr/ODR-0004-pdtf-ontology-foundation.md). Three-graph separation; byte-identity CI; `vann:` header pattern.
* **Subsequent emission ADR:** [ADR-0010 — SKOS vocabulary emission](./ADR-0010-skos-vocabulary-emission.md). The substrate layer that lands on top of foundation.
* **Out of scope for this ADR:**
  - Per-module class additions (ADR-0011).
  - SHACL shapes content (ADR-0012).
  - DPV annotations content (ADR-0012).
  - SKOS vocabulary content (ADR-0010).
  - Overlay profile shapes (ADR-0013).

## Amendments

- **2026-05-27 — Implementation landed (commit `c5629e7`).** Four foundation TTLs emitted at `source/03-standards/ontology/{foundation,opda-classes,opda-shapes,opda-annotations}.ttl`; `opda-gen emit-foundation` wired; byte-identity CI green; three-graph CI green (all 5 checks); 15/15 diagnostic exemplars parse cleanly. Closed queued follow-ups G2 (prefix-filter Literal-IRI scan), G3 (`check_derived_provenance` git-blame impl + 4 regression tests), and G4 (CI workflow comment-block split). Test suite grew 28 → 34. Implementation report at [`docs/adr/implementation-reports/ADR-0009-implementation.md`](./implementation-reports/ADR-0009-implementation.md).
- **2026-05-27 — Independent validation PASS-WITH-FOLLOW-UPS (commit `8894eb9`).** Soundness 13/13, Completeness 23 PASS + 8 deferrals + 1 N/A, Cross-ADR 5/5 + 4/4 probes. All 5 §Confirmation criteria PASS verified independently. Validator concurred with worker's sentinel git-sha + dct:modified pinning decision (within-engineering, not Council-route) and queued two cosmetic follow-ups (G6 template documentation; G7 prefix-filter edge-case regression test for first URL-bearing rdfs:comment). Status moves `proposed → accepted`. Validation report at [`docs/adr/validation/ADR-0009-validation-report.md`](./validation/ADR-0009-validation-report.md).
