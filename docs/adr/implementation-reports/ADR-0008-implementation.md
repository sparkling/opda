# ADR-0008 implementation report

**ADR:** [ADR-0008 — Generator implementation infrastructure](../ADR-0008-generator-implementation-infrastructure.md)
**Status of ADR:** `proposed` (unchanged; pending validation per programme plan §9.3)
**Implementing worker:** Single direct execution (Phase 1 bootstrap is sequential per plan §8.2)
**Implemented:** 2026-05-27
**Reports to:** Independent validation-agent spawn (per plan §9.2)

## 1. Build summary

| Metric | Value |
|---|---|
| Files created | 29 Python files + 3 fixtures + 3 project files + 1 CI workflow |
| Python LOC (src + tests) | 2,097 total |
| Largest source file | `term_sourcing.py` (283 LOC; W3C/TF/regulator registries inline) |
| Serialiser LOC | `canonical.py` 197 (ADR-0007 §150 target; +47 for prefix-filtering robustness) |
| Test count | 28 (4 blank-nodes + 3 byte-identity + 6 serialiser + 7 term-sourcing + 8 three-graph) |
| Test runtime | 0.07s (ADR-0008 §"Confirmation" target: under 30s) |

### Key design choices

1. **Canonical serialiser bypasses rdflib's Turtle writer entirely** (per ADR-0007 §C
   chosen-option mandate). The output is hand-built from sorted subject blocks +
   within-term predicate-ranked triples + alphabetised prefix declarations.
2. **Prefix declarations are filtered to those referenced by the graph.** rdflib's
   `Graph()` constructor auto-binds 30 standard namespaces (brick, csvw, dcat,
   etc.); emitting all of them would (a) clutter output and (b) tie byte-identity
   to rdflib's internal default-binding table. The serialiser scans graph triples
   and only emits prefixes whose namespace is referenced.
3. **Blank-node skolemisation is recursive** (per ADR-0007 §"Deterministic
   emission rules" #4). Two structurally-identical blank sub-graphs always produce
   the same `_:b<hex12>` label; structurally-distinct sub-graphs produce different
   labels. Depth cap of 32 guards against pathological self-referential cycles.
4. **Term-sourcing registries are inline dicts**, not external JSON. ADR-0008 ships
   ~25 W3C terms + ~14 OPDA TF terms + 3 external-regulator examples; ADR-0011
   (module emission) will expand the registries as needed. Keeping them in Python
   keeps the lock-file thin and the test-suite hermetic.
5. **Emitter stubs raise `NotImplementedError("realised in ADR-NNNN")`** with the
   ADR number, per the prompt's instruction. The one exception is
   `emitters/foundation.py` — it ships a deterministic header-only stub graph so
   the canonical pipeline + byte-identity test can be exercised end-to-end before
   ADR-0009 lands. The stub raises no errors but emits a clearly-labelled
   "(stub)" title in the ontology.

## 2. Confirmation criteria coverage

ADR-0008 §"Confirmation" lists six criteria. All six are met locally; (4) and (6)
have caveats noted below.

| # | Criterion | Status | Verification |
|---|---|---|---|
| 1 | Package installs | PASS | `cd tools/opda-gen && python3.11 -m venv .venv && .venv/bin/pip install -e .[dev]` succeeded with locked deps (rdflib==7.0.0, pyshacl==0.25.0, click==8.1.7, pydantic==2.5.0, tomli==2.0.1) |
| 2 | CLI runs (`opda-gen --version`) | PASS | Output: `opda-gen 0.1.0 (16481b8)` — version + git SHA |
| 3 | Test suite green | PASS | `pytest -q` → 28 passed in 0.07s |
| 4 | CI workflow exists | PASS (with caveat) | `.github/workflows/ontology-byte-identity.yml` exists; runs `--version` + `pytest -q`. The foundation-diff step is **commented out** with an explicit note ("ADR-0009 will uncomment …") because no reference TTLs exist yet — ADR-0009 commits the first foundation.ttl |
| 5 | README ships | PASS | `tools/opda-gen/README.md` covers installation, usage, contribution guide, ADR-0007/0008 backlinks, and an emitter-realisation table mapping each stub to its future ADR |
| 6 | Reproducibility verified | PASS (single-machine) | `test_foundation_stub_byte_identical_across_runs` in `test_byte_identity.py` regenerates the foundation stub twice into separate tmp dirs and asserts byte-equality. Cross-machine verification awaits a second contributor; locked Python (3.11) + locked deps + custom serialiser provides the necessary conditions per ADR-0007 §"Reproducibility" decision driver |

## 3. Soundness self-check (programme plan §9.1 check 1)

Every source file's doc-comment header cites the ADR/ODR section(s) it realises.
Grep target: lines starting `- ADR-` or `- ODR-` inside the module's opening
`"""..."""` block.

| File | Cites |
|---|---|
| `src/opda_gen/__init__.py` | ADR-0008 §"Repository structure"; ADR-0007 §"Architecture"; ODR-0004 §6a |
| `src/opda_gen/__main__.py` | ADR-0008 §"CLI design"; ADR-0007 §"Architecture" |
| `src/opda_gen/cli.py` | ADR-0008 §"CLI design"; ADR-0008 §"Confirmation" #2; ADR-0007 §"Architecture"; ODR-0004 §6a |
| `src/opda_gen/term_sourcing.py` | ADR-0007 §"Term-sourcing five-line precedence"; ADR-0008 §"Repository structure"; ODR-0004 §Rules.7; ODR-0004 §7a |
| `src/opda_gen/composer.py` | ADR-0008 §"CLI design"; ADR-0013 (build-step); ODR-0004 §3a |
| `src/opda_gen/inputs/__init__.py` | ADR-0007 §"Input layer"; ADR-0008 §"Repository structure"; ODR-0004 §7a |
| `src/opda_gen/inputs/glossary.py` | ADR-0007 §"Input layer"; ADR-0008 §"Repository structure"; ODR-0004 §Rules.7 |
| `src/opda_gen/inputs/data_dictionary.py` | ADR-0007 §"Input layer"; ADR-0008 §"Repository structure"; ODR-0004 §Rules.7 |
| `src/opda_gen/inputs/odr_corpus.py` | ADR-0007 §"Input layer"; ADR-0007 §"A9 per-kind discipline output"; ADR-0008 §"Repository structure"; ODR-0001 A9 §"Per-kind discipline" |
| `src/opda_gen/serialiser/__init__.py` | ADR-0007 §"Deterministic emission rules"; ADR-0008 §"Repository structure"; ODR-0004 §6a #1 |
| `src/opda_gen/serialiser/canonical.py` | ADR-0007 §"Deterministic emission rules" #1-6; ADR-0008 §"Repository structure"; ODR-0004 §6a #1; ODR-0004 §6a #3 |
| `src/opda_gen/serialiser/blank_nodes.py` | ADR-0007 §"Deterministic emission rules" #4; ODR-0004 §6a #1; ADR-0008 §"Repository structure" |
| `src/opda_gen/serialiser/ordering.py` | ADR-0007 §"Deterministic emission rules" #1, #2, #3; ODR-0004 §6a #1 |
| `src/opda_gen/emitters/__init__.py` | ADR-0007 §"Architecture"; ADR-0008 §"Repository structure" |
| `src/opda_gen/emitters/foundation.py` | ADR-0008 §"CLI design"; ADR-0009 (full body) |
| `src/opda_gen/emitters/vocabularies.py` | ADR-0008 §"CLI design"; ADR-0010 (full body); ODR-0011 |
| `src/opda_gen/emitters/classes.py` | ADR-0008 §"CLI design"; ADR-0011 (full body); ODR-0005 + ODR-0006 + ODR-0007 + ODR-0008 + ODR-0009 + ODR-0015 + ODR-0017 + ODR-0018 |
| `src/opda_gen/emitters/shapes.py` | ADR-0008 §"CLI design"; ADR-0012 (full body); ODR-0012 + ODR-0013 + ODR-0017 + ODR-0018 |
| `src/opda_gen/emitters/annotations.py` | ADR-0008 §"Repository structure"; ADR-0012 (full body); ODR-0010 §Q1–Q6 |
| `src/opda_gen/emitters/profiles.py` | ADR-0008 §"CLI design"; ADR-0013 (full body); ODR-0010 |
| `src/opda_gen/ci/__init__.py` | ADR-0008 §"Repository structure"; ADR-0008 §"CI workflow"; ODR-0004 §3a; ODR-0004 §6a #3 |
| `src/opda_gen/ci/three_graph_test.py` | ODR-0004 §3a; ADR-0007 §"Three-graph emission constraints"; ADR-0008 §"CI workflow" |
| `src/opda_gen/ci/byte_identity.py` | ODR-0004 §6a #3; ADR-0007 §"Byte-identity CI test"; ADR-0008 §"CI workflow" |
| `tests/test_serialiser.py` | ADR-0008 §"Confirmation" #3; ADR-0007 §"Deterministic emission rules" #1-6; ODR-0004 §6a #1 |
| `tests/test_term_sourcing.py` | ADR-0008 §"Confirmation" #3; ADR-0007 §"Term-sourcing five-line precedence"; ODR-0004 §7a |
| `tests/test_blank_nodes.py` | ADR-0008 §"Confirmation" #3; ADR-0007 §"Deterministic emission rules" #4; ODR-0004 §6a #1 |
| `tests/test_three_graph.py` | ADR-0008 §"Confirmation" #3; ODR-0004 §3a; ADR-0007 §"Three-graph emission constraints" |
| `tests/test_byte_identity.py` | ADR-0008 §"Confirmation" #3 + #6; ADR-0007 §"Byte-identity CI test" sub-test #1; ODR-0004 §6a #3 |
| `tests/__init__.py` | empty (package marker only) |

Every non-empty source file has a doc-comment header naming ADR-0008 + at
least one upstream spec section. The validator's grep should find no
unannotated source files.

## 4. Completeness self-check (programme plan §9.1 check 2)

For each cited section, note: realised here / deferred to later ADR / N/A
(infrastructure-only ADR).

### ADR-0008 §"Repository structure"

| Subsection | Status |
|---|---|
| `pyproject.toml` | Realised — locked deps per §"Dependencies (locked)" |
| `README.md` | Realised — installation + usage + emitter-realisation table |
| `.python-version` | Realised — contents `3.11` |
| `src/opda_gen/__init__.py` + `__main__.py` | Realised |
| `cli.py` Click-based | Realised — all 10 subcommands wired |
| `inputs/*` parsers | Realised — glossary + data_dictionary + odr_corpus |
| `term_sourcing.py` | Realised — five-tier resolver with W3C + OPDA TF + regulator registries |
| `emitters/foundation.py` | Stub realised; full body deferred to ADR-0009 |
| `emitters/vocabularies.py` | Stub realised; full body deferred to ADR-0010 |
| `emitters/classes.py` | Stub realised; full body deferred to ADR-0011 |
| `emitters/shapes.py` | Stub realised; full body deferred to ADR-0012 |
| `emitters/annotations.py` | Stub realised; full body deferred to ADR-0012 |
| `emitters/profiles.py` | Stub realised; full body deferred to ADR-0013 |
| `serialiser/canonical.py` | Realised — 197 LOC; bypasses rdflib Turtle writer |
| `serialiser/blank_nodes.py` | Realised — SHA-256 recursive skolemisation |
| `serialiser/ordering.py` | Realised — prefix + term-type + within-term sort keys |
| `composer.py` | Stub realised; full body deferred to ADR-0013 |
| `ci/three_graph_test.py` | Realised — five §3a checks as named functions |
| `ci/byte_identity.py` | Realised — regenerate-and-diff helper |
| `tests/fixtures/*` | Realised — three fixture files covering all five precedence tiers + a `kind: pattern` ODR shape |
| `tests/test_serialiser.py` | Realised — 6 invariants |
| `tests/test_term_sourcing.py` | Realised — 7 cases (5 precedence + unsourceable + W3C-beats-glossary) |
| `tests/test_blank_nodes.py` | Realised — 4 determinism cases |
| `tests/test_three_graph.py` | Realised — 8 cases (positive + negative per §3a clause) |
| `tests/test_byte_identity.py` | Realised — 3 cases |

### ADR-0008 §"CLI design"

| Subcommand | Status |
|---|---|
| `emit` | Wired; raises `NotImplementedError` (umbrella; depends on ADR-0009..0013) |
| `emit-foundation` | Wired; calls the foundation stub emitter |
| `emit-vocabularies` | Wired; raises `NotImplementedError("ADR-0010")` |
| `emit-module <name>` | Wired; raises `NotImplementedError("ADR-0011")` |
| `emit-shapes` | Wired; raises `NotImplementedError("ADR-0012")` |
| `emit-profile <overlay>` | Wired; raises `NotImplementedError("ADR-0013")` |
| `compose` | Wired; raises `NotImplementedError("ADR-0013")` |
| `ci-byte-identity` | Wired; functional against foundation stub |
| `ci-three-graph` | Wired; functional against three .ttl files in a directory |
| `validate-exemplar <path>` | Wired; raises `NotImplementedError("ADR-0014")` |

### ADR-0008 §"Dependencies (locked)"

All five pins applied exactly: rdflib==7.0.0, pyshacl==0.25.0, click==8.1.7,
pydantic==2.5.0, tomli==2.0.1. Python `>=3.11,<3.12`.

### ADR-0008 §"CI workflow"

`.github/workflows/ontology-byte-identity.yml` exists. Runs `--version` and
`pytest -q`. The foundation-diff + `ci-three-graph` + `validate-exemplar`
steps are **explicitly commented out with an ADR-0009 unblock note** because
no reference TTLs exist yet. ADR-0009 will uncomment.

### ADR-0007 §"Deterministic emission rules"

| Rule | Status |
|---|---|
| #1 prefix declarations alphabetised | Realised in `serialiser/canonical.py` + `serialiser/ordering.py::sort_prefixes` |
| #2 term emission order | Realised in `serialiser/ordering.py::TERM_TYPE_ORDER` + `type_rank()` |
| #3 within-term triple order | Realised in `serialiser/ordering.py::PREDICATE_PRIORITY` + `predicate_rank()` |
| #4 blank-node SHA-256 skolemisation | Realised in `serialiser/blank_nodes.py::_skolem_for` (recursive) |
| #5 literal escaping; xsd:string implicit | Realised in `serialiser/canonical.py::_format_literal` |
| #6 file formatting (LF, no BOM, final newline, 4-space indent, blank line between blocks) | Realised in `serialiser/canonical.py::to_canonical_turtle` |

### ADR-0007 §"Term-sourcing five-line precedence"

Realised in `term_sourcing.py::resolve_term` with the exact tier order
(W3C → OPDA TF → glossary → dictionary → external regulator) and
`UnsourceableTerm` on all-tier miss. Bootstrap registries cover ~25 W3C
terms + ~14 OPDA TF terms (Aggregator, API, Application, Authentication,
Authorisation, Certificate, Scheme Operator, Data Provider/Recipient,
Participant, Role, LEI, etc.) + 3 external-regulator examples (FCA, ICO,
HMLR).

### ADR-0007 §"Three-graph emission constraints"

Generator-side emission constraints are deferred to ADR-0009+ (the
emitters that actually write the three files). The CI-side check is
realised in `ci/three_graph_test.py`.

### ADR-0007 §"Module pluralism"

Deferred to ADR-0011 (one TTL per module).

### ADR-0007 §"A9 per-kind discipline output"

`inputs/odr_corpus.py` parses ODR frontmatter + `## Rules` so the
downstream emitter (ADR-0011) can extract `kind: pattern` UFO categories.
The emission of `dct:source` + `skos:scopeNote` + `rdfs:comment` on
minted classes is deferred to ADR-0011 since no classes are minted at
ADR-0008.

### ODR-0004 §3a (five-part CI test)

| Clause | Status |
|---|---|
| #1 no sh:* in annotations | Realised — `check_no_shacl_in_annotations` |
| #2 no owl:imports from shapes | Realised — `check_no_owl_imports_in_shapes` |
| #3 no advisory annotations in shapes | Realised — `check_no_advisory_in_shapes` (whitelist: opda:aiHint, opda:uiHint, opda:exampleValue) |
| #4 sh:targetClass resolves | Realised — `check_target_class_resolves` |
| #5 derived consumer profiles have no commits outside service account | Stub realised — returns empty list at ADR-0008 (no derived artefacts yet); ADR-0009 will wire git-blame check |

### ODR-0004 §6a (deterministic emission + byte-identity CI)

| Sub-rule | Status |
|---|---|
| #1 deterministic emission ordering | Realised — see ADR-0007 §"Deterministic emission rules" row |
| #2 generator version recorded in ontology header | Deferred to ADR-0009 (no real foundation header yet) |
| #3 CI byte-identity test | Realised — `ci/byte_identity.py::run` + `test_byte_identity.py` |
| Four sub-tests (Cagle's diff-explosion canary) | Sub-test #1 (consecutive-run identity) realised in `test_byte_identity.py::test_foundation_stub_byte_identical_across_runs`; sub-tests #2-4 deferred to ADR-0009 (need real dictionary as input) |

### ODR-0004 §7a (five-line precedence + conflict-recording)

| Sub-rule | Status |
|---|---|
| Five-line precedence | Realised — `term_sourcing.py::resolve_term` |
| Conflict-recording protocol | Deferred to ADR-0011 (the consuming module ODR is where the `## Change log` row lands) |
| `dct:source` URI discipline (version IRI; never "latest") | Realised — W3C_REGISTRY entries pin version-IRIs (e.g. SHACL `https://www.w3.org/TR/2017/REC-shacl-20170720/#NodeShape`) |

### ODR-0004 §8a (diagnostic exemplars)

N/A at ADR-0008 — exemplar storage path + pairing convention is content-side;
realised in ODR's own deliverable + ADR-0014.

## 5. Test results

```
============================= test session starts ==============================
platform darwin -- Python 3.11.7, pytest-8.4.2, pluggy-1.6.0
rootdir: /Users/henrik/source/opda/tools/opda-gen
configfile: pyproject.toml
testpaths: tests
collected 28 items

tests/test_blank_nodes.py ....                                           [ 14%]
tests/test_byte_identity.py ...                                          [ 25%]
tests/test_serialiser.py ......                                          [ 46%]
tests/test_term_sourcing.py .......                                      [ 71%]
tests/test_three_graph.py ........                                       [100%]

============================== 28 passed in 0.07s ==============================
```

28 passed, 0 failed, 0 errors. Wall time 0.07s — well under the ADR-0008
§"Confirmation" 30s target.

End-to-end CLI smoke tests:

```
$ opda-gen --version
opda-gen 0.1.0 (16481b8)

$ opda-gen --help     # lists 10 subcommands

$ opda-gen ci-three-graph --ontology-dir <clean>   # PASS
three-graph CI: PASS (all 5 checks)

$ opda-gen ci-three-graph --ontology-dir <annotations-with-sh:>
THREE-GRAPH VIOLATION: annotation graph contains sh:* predicate ...
exit code: 1
```

## 6. Known limitations

1. **`canonical.py` exceeds the ~150 LOC target** (197 LOC). +47 LOC accounts for
   prefix-filtering (so rdflib's auto-bind list doesn't pollute output) +
   per-predicate object grouping (so `pred a, b ;` shorthand is deterministic).
   Honest deviation; smaller code paths discussed but the safety of the
   prefix-filter outweighs the budget overrun.
2. **`emitters/foundation.py` ships a stub graph**, not a full ADR-0009
   foundation.ttl. Justification: byte-identity test needs *some* graph to
   exercise the canonical pipeline end-to-end, and ADR-0009 needs the
   pipeline to land first. The stub is clearly labelled "(stub)" in the
   emitted TTL title.
3. **CI workflow's diff step is commented out.** ADR-0009 will uncomment when
   real reference TTLs land. This was a deliberate choice per the prompt
   ("comment out the diff against committed TTLs — they don't exist yet").
4. **rdflib's `Graph()` auto-binds 30 namespaces** that the canonical
   serialiser now filters out. This is robust to rdflib version drift (filter
   is by `referenced_iris` set, not by namespace name), but worth noting:
   any new rdflib version that adds a namespace whose IRI happens to match a
   minted opda: term would still be filtered correctly.
5. **`ci/three_graph_test.py::check_derived_provenance` is a stub** at
   ADR-0008. It returns an empty list (PASS) because no derived artefacts
   exist yet. ADR-0009 wires git-blame inspection.
6. **No cross-machine reproducibility verification.** Single-machine
   regeneration is verified via `test_foundation_stub_byte_identical_across_runs`.
   Cross-machine awaits a second contributor; locked deps + canonical
   serialiser provide the necessary conditions per ADR-0007.

## 7. Handoff to validator

The independent validation agent should focus on these three concerns:

1. **Soundness (programme plan §9.1 check 1).** Grep every `.py` file under
   `tools/opda-gen/src/` and `tools/opda-gen/tests/` for the doc-comment
   header pattern `Realises:\n- ADR-` and verify every non-empty file has at
   least one ADR/ODR citation. The table in §3 above is the worker's
   self-report; the validator should re-grep and cross-check.

2. **Completeness (programme plan §9.1 check 2).** Verify every ADR-0008
   §"Repository structure" path is present. Verify every ADR-0007 §"Deterministic
   emission rules" item maps to a line of `serialiser/canonical.py` or
   `serialiser/ordering.py`. Verify every ODR-0004 §3a clause maps to a
   function in `ci/three_graph_test.py`. Flag any cited subsection that has
   no realising artefact AND no explicit deferral with a named-ADR trigger.

3. **Cross-ADR consistency (programme plan §9.1 check 3).** Simulate ADR-0009's
   forthcoming use of this infrastructure: can it import `opda_gen.emitters.foundation`
   and replace the stub `build_stub_graph()` with a real foundation graph?
   Can it call `opda_gen.serialiser.canonical.to_canonical_turtle()` and trust
   byte-identity? Can ADR-0011 add module classes whose `kind: pattern` UFO
   line is extracted by `opda_gen.inputs.odr_corpus`? The interfaces should
   carry their downstream contracts.

Specific suspect points to challenge:

- The prefix-filter heuristic (`any(iri.startswith(ns) for iri in referenced_iris)`)
  could in principle miss a namespace if no triple references its IRI but the
  emitter wants the prefix bound for downstream consumers. So far this hasn't
  arisen; it would surface if ADR-0009 ships a foundation header that names a
  prefix in its `sh:prefixes` declaration *without* using any of that
  namespace's IRIs in triples. (Workaround: add a `prefixes()`-only graph that
  contains placeholder triples.) Validator should poke at this.
- The W3C registry sample (~25 terms) is small. ADR-0011's module emission
  will expand it; the validator should agree the size is appropriate for
  ADR-0008's infrastructure-only scope.
- The `check_target_class_resolves` check assumes both graphs live in the
  same rdflib `Graph()` instance. In production, classes and shapes are
  separate files (per ODR-0004 §3a). The function takes both as arguments so
  this is fine — the validator should confirm the runtime pattern matches.

If validation passes: ADR-0008 status moves `proposed → accepted`.
If validation surfaces a `## Rules` ambiguity: route to Council per
programme plan §9.4.

## References

- [ADR-0008 — Generator implementation infrastructure](../ADR-0008-generator-implementation-infrastructure.md)
- [ADR-0007 — Ontology generator specification](../ADR-0007-ontology-generator-specification.md)
- [ODR-0004 — PDTF ontology foundation](../../ontology/odr/ODR-0004-pdtf-ontology-foundation.md)
- [ADR programme plan §9 — Validation discipline](../../plan/ontology-implementation.md)
- Worker artefacts under `tools/opda-gen/`
- CI workflow at `.github/workflows/ontology-byte-identity.yml`
