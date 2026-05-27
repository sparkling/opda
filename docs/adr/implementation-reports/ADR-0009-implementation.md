# ADR-0009 Implementation Report

**Implementing worker:** general-purpose agent (Claude Code)
**Date:** 2026-05-27
**ADR:** [ADR-0009 — Foundation TTL emission](../ADR-0009-foundation-ttl-emission.md)
**Status at submission:** `proposed` (independent validation pending per programme plan §9.3)

## 1. Emitted artefacts

Four TTL files under `source/03-standards/ontology/`:

| File | LOC | Triples | Content summary |
|---|---|---|---|
| `foundation.ttl` | 34 | 15 | Ontology header per ADR-0009 template lines 41-79. 8 prefixes bound (dct, opda, owl, rdf, sh, vann, xsd — skos + rdfs filtered out as unreferenced). `<https://w3id.org/opda/>` typed as `owl:Ontology` with `dct:title/description/creator/issued/modified/license`, `vann:preferredNamespacePrefix/Uri`, `owl:versionIRI <https://w3id.org/opda/0.1.0/>`, `owl:versionInfo`, `opda:generatorVersion`, `sh:declare` blank node carrying `sh:prefix "opda"` + `sh:namespace "https://w3id.org/opda/#"^^xsd:anyURI`. |
| `opda-classes.ttl` | 30 | 10 | Two foundation classes per ADR-0009 §"opda-classes.ttl". `opda:DiagnosticExemplar` (cites ODR-0004 §8a) + `opda:GeneratorRun` (cites ODR-0004 §6a). Both carry full A9 per-kind discipline output (`rdf:type owl:Class` + `rdfs:label` + `rdfs:comment` + `skos:scopeNote` + `dct:source`). |
| `opda-shapes.ttl` | 21 | 3 | Header-only per ADR-0009 §"opda-shapes.ttl". `<https://w3id.org/opda/shapes>` typed `owl:Ontology` + `dct:title` + `opda:targetsClassGraph <https://w3id.org/opda/0.1.0/>`. No `sh:*` triples; no `owl:imports`. |
| `opda-annotations.ttl` | 21 | 3 | Header-only per ADR-0009 §"opda-annotations.ttl". `<https://w3id.org/opda/annotations>` typed `owl:Ontology` + `dct:title` + `opda:targetsClassGraph`. No `sh:*`, `owl:Class`, `opda:aiHint/uiHint/exampleValue` triples. |

**Total: 106 LOC across 4 files; 31 triples.** Per-graph generator-comment headers include opda-gen version, source-commit sentinel (`pinned-by-ADR-0009` — see Surfaced ambiguity below), emission date `2026-05-27`, and the three ADR backlinks per the template.

Python files **modified** for this ADR:

| File | Change |
|---|---|
| `tools/opda-gen/src/opda_gen/emitters/foundation.py` | Replaced ADR-0008 stub with full ADR-0009 implementation (366 LOC). Builds four graphs via rdflib + serialises via `to_canonical_turtle`; prepends generator-comment headers. |
| `tools/opda-gen/src/opda_gen/cli.py` | Wired `emit-foundation` body to `emit_foundation()`; wired `emit` umbrella to call same; added `_default_ontology_dir()` resolver (walks up looking for `.git` + `source/03-standards/`); made `--output`/`--reference`/`--ontology-dir` flags optional with sensible defaults. |
| `tools/opda-gen/src/opda_gen/serialiser/canonical.py` | G2: extended `referenced_iris` set to include Literal lexical values that start with `http://` or `https://`, preserving the "only emit referenced" prefix-filter while accommodating ADR-0009's `sh:namespace "..."^^xsd:anyURI` literal pattern. |
| `tools/opda-gen/src/opda_gen/ci/three_graph_test.py` | G3: implemented `check_derived_provenance` via `git log --format=%ae`; added `_service_account_allowlist()` reading `OPDA_DERIVED_SERVICE_ACCOUNTS` env var with empty-list default. Updated `Realises:` header to add ADR-0009 + G3 follow-up references. |
| `tools/opda-gen/src/opda_gen/ci/byte_identity.py` | Updated import to use new `emit_foundation()` function name; updated `Realises:` header to add ADR-0009 §Confirmation #2. |
| `.github/workflows/ontology-byte-identity.yml` | Activated ADR-0009 steps (regenerate corpus + byte-identity diff + ci-three-graph against real corpus). G4: split comment block so ADR-0014 `validate-exemplar` step has its own activation marker. |
| `tools/opda-gen/README.md` | Updated status table to mark `emit-foundation` as landed; added new module entries for `emitters/foundation.py` and noted ADR-0009 G2/G3 follow-ups in module-realises table. |

Python files **added**: none (foundation.py already existed as stub; all changes are edits).

Tests **added** (6 new, total 28 → 34):

| Test | File | Purpose |
|---|---|---|
| `test_literal_iri_lexical_value_retains_prefix` | `test_serialiser.py` | G2 positive: Literal lexical value matching a namespace string causes prefix retention. |
| `test_non_iri_literals_do_not_pollute_prefix_set` | `test_serialiser.py` | G2 negative: plain string Literal that doesn't look like an IRI does NOT trigger spurious prefix retention. |
| `test_check_derived_provenance_missing_dir_passes` | `test_three_graph.py` | G3 baseline: missing/None derived dir returns PASS. |
| `test_check_derived_provenance_clean_history_passes` | `test_three_graph.py` | G3 positive: derived TTL committed by service-account author → PASS. Uses tmp git repo fixture. |
| `test_check_derived_provenance_non_service_commit_fails` | `test_three_graph.py` | G3 negative: derived TTL committed by non-service-account author → violation reports author + filename. |
| `test_check_derived_provenance_env_var_allowlist` | `test_three_graph.py` | G3 env-var path: `OPDA_DERIVED_SERVICE_ACCOUNTS` comma-separated list resolves. |

Existing tests **modified** (1):

| Test file | Change |
|---|---|
| `test_byte_identity.py` | Renamed `test_foundation_stub_*` → `test_foundation_*`; added assertion that all four expected filenames are emitted; expanded sanity test to check both `foundation.ttl` and `opda-classes.ttl` contents. |

## 2. Confirmation criteria coverage (ADR-0009 §Confirmation)

| # | Criterion | Verification | Verdict |
|---|---|---|---|
| 1 | First emission lands — `opda-gen emit-foundation` produces 4 TTLs in `source/03-standards/ontology/` | `tools/opda-gen/.venv/bin/opda-gen emit-foundation` → 4 files emitted to canonical path; verified with `ls source/03-standards/ontology/`. | **PASS** |
| 2 | Byte-identity CI green — subsequent regeneration produces zero diff | `tools/opda-gen/.venv/bin/opda-gen emit --output /tmp/ontology-ci && diff -rq /tmp/ontology-ci source/03-standards/ontology --exclude=exemplars --exclude=derived` → exit 0, no output. Also `opda-gen ci-byte-identity` → `byte-identity: PASS`. | **PASS** |
| 3 | Three-graph CI test green (ODR-0004 §3a five-part) | `tools/opda-gen/.venv/bin/opda-gen ci-three-graph` → `three-graph CI: PASS (all 5 checks)`. Five clauses each PASS: no `sh:*` in annotations; no `owl:imports` in shapes; no advisory predicates in shapes; every `sh:targetClass` resolves (vacuously true — no shapes yet); `check_derived_provenance` returns `[]` (no `derived/` dir exists at ADR-0009). | **PASS** |
| 4 | `vann:` header resolves — rdflib parses without error; `vann:preferredNamespacePrefix` + `vann:preferredNamespaceUri` present | `rdflib.Graph().parse('source/03-standards/ontology/foundation.ttl', format='turtle')` → 15 triples, no errors. `grep -c "vann:preferredNamespace"` foundation.ttl → 2 matches. | **PASS** |
| 5 | Diagnostic exemplars still validate — 15 .ttl files in `exemplars/` parse against foundation without "undefined class" for `opda:DiagnosticExemplar` | Ran rdflib parse-test across all 15 exemplars + foundation + opda-classes: 15/15 PASS, 0 errors. Confirmed `opda:DiagnosticExemplar` resolves to `owl:Class` declaration. | **PASS** |

**Manual `rapper -i turtle foundation.ttl` test:** `rapper` is **not installed** on the worker's macOS environment; this test was skipped. The rdflib parse-test (Confirmation #4) provides functionally-equivalent coverage (rdflib is a strict parser; any Turtle syntax error would surface). If a `rapper` run is required for the validation gate, it can be performed by a validator with raptor2 installed.

## 3. Soundness self-check

### Emitted Turtle artefacts — `dct:source` provenance

- `opda:DiagnosticExemplar` in `opda-classes.ttl` carries `dct:source <https://w3id.org/opda/odr/ODR-0004#section-8a-diagnostic-exemplars>` → resolves to ODR-0004 §8a (lines 115-124 of the ratified ODR).
- `opda:GeneratorRun` in `opda-classes.ttl` carries `dct:source <https://w3id.org/opda/odr/ODR-0004#section-6a-generator-first>` → resolves to ODR-0004 §6a (lines 84-99 of the ratified ODR).
- `foundation.ttl`, `opda-shapes.ttl`, and `opda-annotations.ttl` contain only ontology-header triples (no minted terms); the headers themselves cite ADR-0009/0008/0007 in their generator-comment block.

### Modified Python files — `Realises:` doc-comment headers

All five modified files have their `Realises:` headers updated to add ADR-0009 sections newly realised:

| File | New citations added |
|---|---|
| `emitters/foundation.py` | ADR-0009 §"foundation.ttl/opda-classes.ttl/opda-shapes.ttl/opda-annotations.ttl"; ADR-0007 §"Deterministic emission rules" + §"A9 per-kind discipline output"; ADR-0008 §"CLI design"; ODR-0004 §3a/§6a/§7a/§8a. |
| `cli.py` | ADR-0009 §"Confirmation" #1/#2. |
| `serialiser/canonical.py` | ADR-0009 §"foundation.ttl — ontology header" (G2 follow-up resolution). |
| `ci/three_graph_test.py` | ODR-0004 §3a clause #5 (G3 follow-up resolution); ADR-0009 (first ADR to commit real corpus). |
| `ci/byte_identity.py` | ADR-0009 §"Confirmation" #2 (first ADR to commit real reference TTLs). |

Test files added/modified have analogous `Realises:` updates citing the G2 + G3 follow-ups.

## 4. Completeness self-check

### ADR-0009 cited sections

| Subsection | Realisation |
|---|---|
| ADR-0009 §"foundation.ttl — ontology header" template | Realised in `emitters/foundation.py:build_foundation_graph()` — all 8 prefixes bound; all 12 ontology-IRI triples emitted; `sh:declare` blank-node body present. |
| ADR-0009 §"opda-classes.ttl — initial class graph" template | Realised in `emitters/foundation.py:build_classes_graph()` — both classes emitted with full A9 per-kind triple set. |
| ADR-0009 §"opda-shapes.ttl — initial shapes graph" template | Realised in `emitters/foundation.py:build_shapes_graph()` — header-only as specified. |
| ADR-0009 §"opda-annotations.ttl — initial annotations graph" template | Realised in `emitters/foundation.py:build_annotations_graph()` — header-only as specified. |
| ADR-0009 §Confirmation #1–5 | All five PASS (see §2 above). |

### ADR-0007 cited sections

| Subsection | Realisation |
|---|---|
| ADR-0007 §"Deterministic emission rules" #1-6 | Realised end-to-end through `serialiser/canonical.py` + `serialiser/ordering.py` + `serialiser/blank_nodes.py`; verified by `test_serialiser_determinism_100_runs` (still passing). |
| ADR-0007 §"A9 per-kind discipline output" | Realised: both emitted classes carry `dct:source` + `skos:scopeNote` + `rdfs:comment`. |
| ADR-0007 §"Three-graph emission constraints" | Realised at emission-time: `build_classes_graph` emits no `sh:*` triples; `build_shapes_graph` emits no `owl:Class` or `owl:imports`; `build_annotations_graph` emits no `sh:*`/`opda:aiHint`/`opda:uiHint`/`opda:exampleValue`. Verified by `ci-three-graph` PASS. |

### ODR-0004 cited sections

| Subsection | Realisation |
|---|---|
| §3a (three-graph separation; five-part CI) | Realised — three source files emitted in parallel; five-part CI test passes against the real corpus (clause #5 PASSES vacuously — no `derived/` dir exists yet). |
| §6a (generator-first + byte-identity CI) | Realised — output produced by canonical serialiser; second-run regeneration byte-identical; `owl:versionIRI <https://w3id.org/opda/0.1.0/>` + `opda:generatorVersion "opda-gen-0.1.0"` recorded in foundation.ttl header. |
| §6a sub-rule #2 (generator version in header) | Realised — `opda:generatorVersion "opda-gen-0.1.0"` triple in `foundation.ttl`. |
| §6a Cagle sub-tests #2-4 | DEFERRED to ADR-0010+ (need real dictionary as input; foundation has no dictionary-driven content). |
| §7a (term-sourcing five-line precedence) | N/A for foundation emission — only authored classes (no inputs from glossary/dictionary). Term-sourcing resolver in `term_sourcing.py` still untouched by this ADR. |
| §8a (diagnostic exemplars) | Realised — `opda:DiagnosticExemplar` class minted; 15 existing exemplars under `source/03-standards/ontology/exemplars/` parse cleanly against the emission. |

### Explicit deferrals

- **Per-module classes beyond DiagnosticExemplar + GeneratorRun** → ADR-0011 (named trigger: "module TBox emission").
- **SHACL shapes content** → ADR-0012 (shapes file header-only at ADR-0009).
- **DPV/annotations content** → ADR-0012 (annotations file header-only at ADR-0009).
- **SKOS schemes** → ADR-0010.
- **Overlay profiles** → ADR-0013.
- **Cagle byte-identity sub-tests #2-4** → ADR-0010+ (need dictionary-driven input).
- **Service-account allowlist persistence** → Future ADR (currently env-var; TODO comment in `_service_account_allowlist` points to a config-file extension point).

## 5. G2 + G3 follow-up resolution

### G2 — Prefix-filter heuristic refinement

**Status: PASS (option (a) chosen).** Per the worker brief, option (a) preserves the "only emit referenced" discipline.

**Implementation:** `serialiser/canonical.py` lines 134-138 — the `referenced_iris` collection loop now also scans `Literal` lexical values that start with `http://` or `https://` (treating them as IRI-shaped strings). This satisfies the foundation header's `sh:namespace "https://w3id.org/opda/#"^^xsd:anyURI` pattern: the literal's lexical value `"https://w3id.org/opda/#"` joins the referenced-IRI set, so the `opda` prefix is retained for any header-only graph whose only opda-namespaced reference is via a literal.

**Tests added:** `test_literal_iri_lexical_value_retains_prefix` (positive: bind opda + use only via literal → prefix retained); `test_non_iri_literals_do_not_pollute_prefix_set` (negative: plain string literal like `"opda"` does NOT trigger prefix retention).

**Operational evidence:** for the actual foundation emission, the `opda` prefix is in fact also referenced by `opda:generatorVersion` and `opda:targetsClassGraph` URIRef predicates — so the filter behaviour change wasn't strictly needed for the emitted corpus to be correct. The fix is preventive: any future header-only graph (or graph that binds a namespace only for `sh:declare` purposes) is covered.

### G3 — `check_derived_provenance` git-blame implementation

**Status: PASS.**

**Implementation:** `ci/three_graph_test.py` lines 134-228 — three new helpers:

- `_service_account_allowlist()` reads `OPDA_DERIVED_SERVICE_ACCOUNTS` env var (comma-separated emails) with empty-list fallback. TODO comment names a future config-file plug-in extension point.
- `_git_authors_for_file(path)` runs `git log --format=%ae -- <file>` and returns author emails, tolerating missing git / not-a-repo / no-history cases by returning `[]`.
- `check_derived_provenance(derived_dir, *, service_accounts=None)` walks `derived_dir/**/*.ttl` and emits a violation string for each non-service-account author per file.

**Tests added:** four total covering missing-dir baseline, positive (service-account author only), negative (non-service-account author → violation), and env-var allowlist path. Tests use a tmp git repo fixture (`_init_temp_git_repo`) that pins author identity for deterministic commit history.

**Operational evidence:** at ADR-0009 there is no `derived/` dir, so the live `ci-three-graph` invocation hits the missing-dir branch and returns `[]` (PASS). The new test cases exercise the full code paths.

## 6. Test results

```
============================= test session starts ==============================
platform darwin -- Python 3.11.7, pytest-8.4.2, pluggy-1.6.0
rootdir: /Users/henrik/source/opda/tools/opda-gen
configfile: pyproject.toml
testpaths: tests
collected 34 items

tests/test_blank_nodes.py ....                                           [ 11%]
tests/test_byte_identity.py ...                                          [ 20%]
tests/test_serialiser.py ........                                        [ 44%]
tests/test_term_sourcing.py .......                                      [ 64%]
tests/test_three_graph.py ............                                   [100%]

============================== 34 passed in 0.18s ==============================
```

**28 → 34 tests** (added 6 new: 2 for G2 + 4 for G3). Existing tests all still pass after the foundation.py rewrite and the canonical.py prefix-filter extension. Test suite runtime: 0.18s (well under the ADR-0008 30s target).

Live CLI verifications:

```
$ tools/opda-gen/.venv/bin/opda-gen --version
opda-gen 0.1.0 (0f1b546)

$ tools/opda-gen/.venv/bin/opda-gen emit-foundation
emitted: /Users/henrik/source/opda/source/03-standards/ontology/foundation.ttl
emitted: /Users/henrik/source/opda/source/03-standards/ontology/opda-annotations.ttl
emitted: /Users/henrik/source/opda/source/03-standards/ontology/opda-classes.ttl
emitted: /Users/henrik/source/opda/source/03-standards/ontology/opda-shapes.ttl

$ tools/opda-gen/.venv/bin/opda-gen ci-three-graph
three-graph CI: PASS (all 5 checks)

$ tools/opda-gen/.venv/bin/opda-gen ci-byte-identity
byte-identity: PASS

$ tools/opda-gen/.venv/bin/opda-gen emit --output /tmp/ontology-ci
emitted: /tmp/ontology-ci/foundation.ttl
emitted: /tmp/ontology-ci/opda-annotations.ttl
emitted: /tmp/ontology-ci/opda-classes.ttl
emitted: /tmp/ontology-ci/opda-shapes.ttl

$ diff -rq /tmp/ontology-ci source/03-standards/ontology --exclude=exemplars --exclude=derived
(empty output → exit 0)
```

## 7. Surfaced ambiguity

### Ambiguity 1: pinned `Source commit:` sentinel vs live HEAD SHA (worker-flagged)

ADR-0009 §"foundation.ttl — ontology header" template line 50 shows `# Source commit: <git-sha>`. The literal intent is "fill in the current HEAD SHA at emission time". But this conflicts with ADR-0009 §Confirmation #2 byte-identity: the live HEAD SHA changes on every unrelated commit, which would cause the next regeneration to differ from the committed file → byte-identity CI fails.

**Worker's decision (NOT a silent reconciliation):** the worker pinned the `Source commit:` field to a sentinel string `"pinned-by-ADR-0009"`. The constant `_FOUNDATION_SOURCE_COMMIT` is documented and advances when a future ADR materially mutates the foundation content. Human readers can still recover the live SHA via `git log -- source/03-standards/ontology/foundation.ttl`.

**Why this is not a silent rule-interpretation:** byte-identity CI (ADR-0009 §Confirmation #2; ODR-0004 §6a #3) is a hard MUST. The template's `<git-sha>` placeholder cannot be a live SHA AND satisfy byte-identity simultaneously — these are operationally incompatible. The pinned-sentinel approach preserves the provenance intent (each emitted file declares which ADR ratified its content) while satisfying the harder constraint. The same reasoning applies to `dct:modified` (also pinned to `_FOUNDATION_LAST_MODIFIED = "2026-05-27"`).

**Recommendation for the validator:** confirm this resolution is acceptable. If a different approach is preferred (e.g. post-emission rewrite step that injects the commit SHA after commit, or omitting the line entirely), it requires a re-emission. The current sentinel is documented inline at `emitters/foundation.py` lines 76-84.

**Not routed to Council (yet):** this is an operational tension between two ADRs (ADR-0009 template ↔ ADR-0009 §Confirmation #2) rather than a Council-Rules disagreement. Per programme plan §9.4 the route only opens for `## Rules` ambiguities. The template syntax is illustrative — the worker has resolved it within ADR-0009 scope. If the validator disagrees, the ADR text can be amended to clarify the template at validation-fix-up time without Council involvement.

### Ambiguity 2: None encountered in G2/G3 implementation

The G2 (prefix-filter) and G3 (git-blame) follow-ups were unambiguous: the validator's recommendation in [ADR-0008 validation report §"Named follow-ups"](../validation/ADR-0008-validation-report.md) plus the ADR-0009 brief's specification of choice (a) for G2 left no genuine interpretive ambiguity. Both follow-ups were implemented exactly as scoped.

## 8. Handoff to validator

**Focus points for independent validation:**

1. **Pinned-sentinel commit SHA (Ambiguity 1 above).** Is the worker's resolution acceptable, or does the validator want a different approach? Recommend confirming before invoking the validation gate — a different resolution path would require re-emission.

2. **G2 prefix-filter behaviour.** Confirm the Literal-IRI scan doesn't introduce unintended prefix retention for the existing test corpus. The negative test `test_non_iri_literals_do_not_pollute_prefix_set` guards against the obvious regression, but the validator may want to audit the actual prefix list emitted by each of the four foundation TTLs.

3. **G3 service-account allowlist semantics.** The empty-list default means **any author triggers a violation** if a derived TTL is committed. This is the safe-by-default posture but is operationally aggressive if the env var isn't set. Validator may want to confirm this matches the intended ODR-0004 §3a clause #5 interpretation.

4. **Cross-ADR consistency probe for ADR-0010.** ADR-0010 (SKOS vocabulary emission) needs `skos:Concept` classes referencing foundation prefixes. Verify that the prefix-filter change (G2) doesn't break ADR-0010's emission contract.

5. **`vann:preferredNamespaceUri` literal pattern.** ADR-0009 template line 70 shows `vann:preferredNamespaceUri "https://w3id.org/opda/#"^^xsd:anyURI`. The worker emitted exactly this. Confirm rdflib's `vann:` semantics treat this as authoritative (some validators expect URIRef, not Literal).

6. **Soundness check Python-file provenance.** All 5 modified files have updated `Realises:` headers; the validator's existing soundness-grep tooling should re-scan and verify each cited section exists.

7. **Completeness check ODR-0004 §6a #2.** Generator version in header is now realised; validator can verify `grep "opda:generatorVersion" foundation.ttl` → 1 match.

## References

- [ADR-0009 — Foundation TTL emission](../ADR-0009-foundation-ttl-emission.md)
- [ADR-0008 — Generator implementation infrastructure](../ADR-0008-generator-implementation-infrastructure.md) (commit `0f1b546`)
- [ADR-0008 validation report](../validation/ADR-0008-validation-report.md) (G2 + G3 follow-ups are this ADR's responsibility)
- [ADR-0005 §G — Ontology implementation programme deferred work](../ADR-0005-deferred-work-register.md)
- [ADR-0007 — Ontology generator specification](../ADR-0007-ontology-generator-specification.md)
- [ODR-0004 — PDTF ontology foundation](../../ontology/odr/ODR-0004-pdtf-ontology-foundation.md)
- [Programme plan §9 — Validation discipline](../../plan/ontology-implementation.md)
