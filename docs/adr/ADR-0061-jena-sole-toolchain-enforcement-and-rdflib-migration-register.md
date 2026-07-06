---
status: accepted
date: 2026-07-06
tags: [toolchain, jena, rdflib, conformance, technical-debt, ci-gate]
supersedes: []
depends-on: [ADR-0037, ADR-0036, ADR-0035, ADR-0014]
implements: []
---

# Jena-Sole-Toolchain Enforcement and the rdflib Migration Register

## Context and Problem Statement

ADR-0037 made Apache Jena opda's **sole** RDF/SHACL/SPARQL 1.2 toolchain and
**prohibited `rdflib` and `pyshacl`** from every parse/serialise/validate/infer/query
path. Its `### Confirmation` section promised "a CI dependency-scan gate: fail if
`rdflib` or `pyshacl` appears in the requirements of any RDF parse/validate path."

That gate was never built, and the prohibition was only **partially** realised. A
repo-wide audit (2026-07-06) finds:

- **pyshacl is genuinely retired** — SHACL validation runs on the Jena `shacl` CLI
  (`opda_gen.jena_shacl`, ADR-0036). No `import pyshacl` / `import owlrl` exists
  anywhere in opda's own toolchain. Good.
- **`rdflib` is NOT retired.** It is a declared hard runtime dependency
  (`rdflib==7.0.0` in `tools/opda-gen/pyproject.toml`) and is imported by **~55
  Python files**: the entire `opda-gen` ontology generator (emitters build and
  serialise the corpus through `rdflib.Graph`, not "as text"), all of its CI
  gates, the BASPI5 round-trip harness, the RML harness, and — notably — even
  `opda_gen.jena_shacl` itself parses Jena's `sh:ValidationReport` output *back
  into an `rdflib.Graph`*. So `rdflib` persists inside the very module ADR-0037
  points to as "the Jena path."

The audit was triggered by a **confirmed live violation**: the RML provenance
extractor `source/03-standards/rml/harness/build_provenance_index.py` parsed
`public/ontology/artefacts/opda-merged.ttl` via `from rdflib import Graph, URIRef`
and walked classes/properties/`dct:source` in-memory with `rdflib` — a textbook
prohibited parse/query path, sitting one directory away from three sibling scripts
(`jena_query.py`, `validate_provenance.py`, `audit_dct_source.py`) that already do
the identical work correctly through the Jena `arq` CLI.

The question this ADR settles: given that a full same-session flip of the ~55-file
`rdflib` surface is neither safe (the generator core is byte-identity-frozen) nor
in scope, **how do we (a) stop the specific confirmed leak, (b) prevent new leaks,
and (c) record the remaining surface as tracked debt rather than letting ADR-0037
quietly rot into a rule nobody enforces?**

## Decision Drivers

* ADR-0037's prohibition is binding and already accepted; this ADR enforces it, it
  does not re-litigate it.
* The confirmed `build_provenance_index.py` leak is real, low-risk, and has a
  proven sibling pattern to copy (`jena_query.py::sparql_select`) — fix it now.
* The `opda-gen` generator core is **byte-identity-gated** (`make verify-ontology`):
  re-serialising it through Jena `riot` instead of the current canonical `rdflib`
  serialiser is a large, high-blast-radius migration that must not be attempted
  speculatively or bundled into an enforcement ADR.
* ADR-0037 *itself* already gated the BASPI5 round-trip migration on the ADR-0036
  parity check — precedent for staging `rdflib` removal rather than doing it all at
  once.
* A rule with no automated gate silently degrades back to a split toolchain — the
  exact failure mode ADR-0037 was written to prevent.

## Considered Options

* **A — Flip the entire ~55-file `rdflib` surface to Jena now, zero exceptions.**
* **B — Reaffirm Jena-sole; fix the one confirmed harness leak now; register the
  rest as a tracked, staged migration; and add the missing CI dependency-scan gate
  scoped to *new* parse/query paths.**
* **C — Amend ADR-0037 to formally *exempt* `opda-gen`'s `rdflib` graph-building as
  a sanctioned in-memory model.**

## Decision Outcome

Chosen option: **B**. ADR-0037's Jena-sole rule stands and is reaffirmed for all
RDF/SHACL/SPARQL work repo-wide. Concretely:

1. **Fixed now (this ADR):** `build_provenance_index.py` is migrated to the Jena
   `arq` CLI (mirroring `jena_query.py::sparql_select` — `arq` parses + queries,
   results read back as CSV via the stdlib `csv` module, zero `rdflib`). It emits
   **byte-identical** `provenance-index.json` / `.md` output versus the previous
   `rdflib` implementation (verified — see `### Confirmation`).
2. **Register (below):** every remaining `rdflib` site is enumerated with a
   disposition. None are silently left undocumented (mirrors ADR-0005's deferred-
   work-register discipline).
3. **Deferred, not blessed:** the `opda-gen` generator core, its CI gates, the
   BASPI5 harness, and the test suites remain on `rdflib` **as tracked debt to be
   paid**, not as a sanctioned exemption. Option C is explicitly rejected: blessing
   `rdflib` graph-building would legitimise the silent RDF-1.2 conformance
   degradation ODR-0025/ADR-0037 forbid.
4. **Gate to build:** the never-implemented ADR-0037 CI dependency-scan gate must
   be created, scoped to fail on **new** `rdflib`/`pyshacl` imports in non-test RDF
   parse/serialise/validate/infer/query paths, with the register below as its
   grandfather allowlist — so the debt can only shrink, never grow.

Option A is rejected: re-serialising the byte-identity-frozen corpus through `riot`
is a large, high-risk migration out of this ADR's scope and not requested.

### rdflib migration register

Dispositions: **fixed-now** / **deferred**. All paths repo-relative.

| # | Site(s) | Uses `rdflib` for | Disposition |
|---|---|---|---|
| 1 | `source/03-standards/rml/harness/build_provenance_index.py` | parse merged TTL + walk classes/props/`dct:source` (query path) | **fixed-now** → Jena `arq` |
| 2 | `source/03-standards/rml/harness/check_completeness.py:157` | parse materialised `.nt`, collect predicate IRIs (`rml-complete` runtime gate) | **deferred** — low-risk fast-follow: one `SELECT DISTINCT ?p WHERE {?s ?p ?o}` via `arq` reproduces `{str(p) …}`; same harness, same proven pattern |
| 3 | `tools/opda-gen/src/opda_gen/` (23 files: `emitters/*`, `emitters/modules/*`, `serialiser/{canonical,blank_nodes,ordering}.py`, `inputs/{glossary,leaf_resolver}.py`, `namespaces.py`, `cli.py`, **`jena_shacl.py`**) | **build + serialise** the ontology corpus via `rdflib.Graph`; `jena_shacl.py` parses Jena's `sh:ValidationReport` back into `rdflib` | **deferred** — byte-identity-frozen generator core (`make verify-ontology`); high blast radius; migrate the report-parse in `jena_shacl.py` first (smallest, isolates the "Jena path still imports rdflib" case) |
| 4 | `tools/opda-gen/src/opda_gen/ci/` (11 gate files) | parse emitted TTL + SPARQL/graph assertions in CI gates | **deferred** — parse/query paths; migrate alongside #3 |
| 5 | `tools/opda-gen/tests/` (21 test files) | assert over emitted TTL via `rdflib` | **deferred** — test-only; lower risk; migrate after #3/#4 stabilise |
| 6 | `tests/baspi5_round_trip/` (6 files: `test_round_trip.py`, `compare_reports.py`, `translators.py`, `conftest.py`, `test_traceability.py`, `test_exemplar_regression.py`) | BASPI5 JSON↔RDF round-trip translation + comparison | **deferred** — **already gated by ADR-0037/ADR-0014** on the ADR-0036 parity check; this ADR does not change that gate |
| 7 | `source/03-standards/rml/tests/test_rml_mapping.py` | lazy `rdflib` imports asserting over mapped output | **deferred** — test-only |
| 8 | `tools/opda-gen/pyproject.toml` (`rdflib==7.0.0`) | declares the dependency | **deferred** — cannot be dropped until #2–#7 land; its presence is the concrete evidence ADR-0037's dependency-scan gate never ran |

Out of scope (not opda's own toolchain): the `pyshacl advanced=True` recipes in
`src/pages/ontology/*.astro` and `src/pages/mapping/how-it-works.astro` are
**consumer-facing guidance** for external validators, not opda's build path. No
change; noted for completeness.

### Consequences

* Good, because the one confirmed prohibited parse/query path is closed, with
  byte-identical output proving the Jena logic matches the retired `rdflib` logic.
* Good, because the full remaining `rdflib` surface is now enumerated and tracked
  instead of implicitly forgotten — ADR-0037 becomes enforceable rather than
  aspirational.
* Good, because scoping the CI gate to *new* imports (with the register as
  grandfather list) means the debt can only shrink.
* Bad, because `rdflib` remains in the build for the generator core, its CI gates,
  and the test suites — ADR-0037 is not yet fully satisfied, and this ADR is honest
  that it is a staging step, not the finish line.
* Neutral, because the deferred sites are load-bearing but stable (byte-identity
  gates already protect the corpus); the risk of leaving them is low, the cost of
  flipping them speculatively is high.

### Confirmation

* **build_provenance_index.py migration verified byte-identical.** Running the
  migrated (Jena `arq`) script produces output byte-for-byte equal to the previous
  `rdflib` script's output (`diff` == empty on both `provenance-index.json` and
  `.md`). The regenerated files *do* differ from the previously committed index,
  but only by a **pre-existing staleness refresh** unrelated to this migration:
  commits `167d523` / `a1d1cda` removed `opda:UPRNSuccessionEvent`,
  `opda:AssuranceLevel`, and `opda:inspireFeatureId` from the ontology (43→41
  classes, new `sha256`) without re-running the extractor. The `rdflib` script
  reproduces the *same* 41-class refresh, confirming the diff is data drift, not a
  logic change. Multi-valued `rdfs:domain`/`rdfs:range` on the UFO connectives
  (`opda:plays`/`playedBy`/`hasAddress`/`founds`/`concerns`/`hasParticipant`) are
  picked as `MIN(STR(?x))` — which equals `rdflib` `g.value`'s first-in-parse pick,
  because the canonical serialiser emits those objects sorted.
* **Downstream Jena gates pass** against the regenerated index/ontology:
  `make provenance-test` (exit 0) and `make dct-audit` (exit 0) from
  `source/03-standards/rml/`.
* **The Jena-sole rule is enforced going forward** by the CI dependency-scan gate
  mandated in item 4 above (to be implemented), which fails on new
  `rdflib`/`pyshacl` imports in non-test RDF paths.

## More Information

- Enforces (does not supersede): ADR-0037 (Apache Jena as opda's sole
  RDF/SHACL/SPARQL 1.2 toolchain) — specifically its unbuilt `### Confirmation`
  dependency-scan gate.
- Related applications of the same toolchain: ADR-0035 (inference via ARQ),
  ADR-0036 (SHACL via `jena-shacl`), ADR-0014 (BASPI5 round-trip — its `rdflib`
  removal is gated on the ADR-0036 parity check; register item #6).
- Canonical Jena-`arq` pattern reused by the fix: `jena_query.py::sparql_select`;
  ADR-0057 established the same "port `rdflib` prototype → Jena `arq`, verify
  byte-identical" move for the RML validator.
- First surfaced by: ADR-0060, which flagged the `build_provenance_index.py`
  `rdflib` violation as a known, pre-existing issue and explicitly declined to use
  it as precedent — this ADR is the closure of that flag.
- Deferred-work-register discipline mirrors ADR-0005.
