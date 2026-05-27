# ADR-0008 Validation Report

**Validation agent:** independent-validator-adr-0008
**Validated:** 2026-05-27
**Implementing worker:** general-purpose agent (commit 2ac4ce2)
**Cited ODRs:** ODR-0004
**Cited prior ADRs:** ADR-0007

## Soundness check

Every emitted Python source file traces to a clause in a cited ADR/ODR via its doc-comment header. The validator independently grepped every non-empty `.py` file under `tools/opda-gen/src/` and `tools/opda-gen/tests/`, then verified each cited section exists in the cited document.

- [x] `src/opda_gen/__init__.py` — cites ADR-0008 §"Repository structure", ADR-0007 §"Architecture", ODR-0004 §6a — verified ADR-0008:47-117 (Repository structure), ADR-0007:48-106 (Architecture), ODR-0004:84-99 (§6a). PASS
- [x] `src/opda_gen/__main__.py` — cites ADR-0008 §"CLI design", ADR-0007 §"Architecture" — both sections exist. PASS
- [x] `src/opda_gen/cli.py` — cites ADR-0008 §"CLI design" (lines 119-142), ADR-0008 §"Confirmation" #2 (line 220), ADR-0007 §"Architecture", ODR-0004 §6a — all sections exist. 10 subcommands wired. PASS
- [x] `src/opda_gen/term_sourcing.py` — cites ADR-0007 §"Term-sourcing five-line precedence" (lines 130-156), ADR-0008 §"Repository structure", ODR-0004 §Rules.7 (lines 42-49), ODR-0004 §7a (lines 101-114). Header explicitly notes the ADR-0007 ↔ ODR-0004 §7a re-ordering and rationalises tier-3-as-glossary (see Surfaced ambiguity below). PASS-with-flag
- [x] `src/opda_gen/composer.py` — cites ADR-0008 §"CLI design", ADR-0013 (build-step), ODR-0004 §3a. PASS
- [x] `src/opda_gen/inputs/__init__.py` — cites ADR-0007 §"Input layer", ADR-0008 §"Repository structure", ODR-0004 §7a. PASS
- [x] `src/opda_gen/inputs/glossary.py` — cites ADR-0007 §"Input layer", ADR-0008 §"Repository structure", ODR-0004 §Rules.7. PASS
- [x] `src/opda_gen/inputs/data_dictionary.py` — cites ADR-0007 §"Input layer", ADR-0008 §"Repository structure", ODR-0004 §Rules.7. PASS
- [x] `src/opda_gen/inputs/odr_corpus.py` — cites ADR-0007 §"Input layer", ADR-0007 §"A9 per-kind discipline output" (ADR-0007:180-198), ADR-0008 §"Repository structure", ODR-0001 A9 §"Per-kind discipline". PASS
- [x] `src/opda_gen/serialiser/__init__.py` — cites ADR-0007 §"Deterministic emission rules", ADR-0008 §"Repository structure", ODR-0004 §6a #1. PASS
- [x] `src/opda_gen/serialiser/canonical.py` — cites ADR-0007 §"Deterministic emission rules" #1-6 (verified against ADR-0007:110-128), ADR-0008 §"Repository structure", ODR-0004 §6a #1, ODR-0004 §6a #3. PASS
- [x] `src/opda_gen/serialiser/blank_nodes.py` — cites ADR-0007 §"Deterministic emission rules" #4, ODR-0004 §6a #1, ADR-0008 §"Repository structure". PASS
- [x] `src/opda_gen/serialiser/ordering.py` — cites ADR-0007 §"Deterministic emission rules" #1, #2, #3, ODR-0004 §6a #1. PASS
- [x] `src/opda_gen/emitters/__init__.py` — cites ADR-0007 §"Architecture", ADR-0008 §"Repository structure". PASS
- [x] `src/opda_gen/emitters/foundation.py` — cites ADR-0008 §"CLI design", ADR-0009. Stub correctly named-deferred. PASS
- [x] `src/opda_gen/emitters/vocabularies.py` — cites ADR-0008 §"CLI design", ADR-0010, ODR-0011. PASS
- [x] `src/opda_gen/emitters/classes.py` — cites ADR-0008 §"CLI design", ADR-0011, ODR-0005 + ODR-0006 + ODR-0007 + ODR-0008 + ODR-0009 + ODR-0015 + ODR-0017 + ODR-0018. PASS
- [x] `src/opda_gen/emitters/shapes.py` — cites ADR-0008 §"CLI design", ADR-0012, ODR-0012 + ODR-0013 + ODR-0017 + ODR-0018. PASS
- [x] `src/opda_gen/emitters/annotations.py` — cites ADR-0008 §"Repository structure", ADR-0012, ODR-0010 §Q1–Q6. PASS
- [x] `src/opda_gen/emitters/profiles.py` — cites ADR-0008 §"CLI design", ADR-0013, ODR-0010. PASS
- [x] `src/opda_gen/ci/__init__.py` — cites ADR-0008 §"Repository structure", ADR-0008 §"CI workflow", ODR-0004 §3a, ODR-0004 §6a #3. PASS
- [x] `src/opda_gen/ci/three_graph_test.py` — cites ODR-0004 §3a (verified lines 74-80 of ODR-0004 — five ASK/SELECT checks present), ADR-0007 §"Three-graph emission constraints", ADR-0008 §"CI workflow". PASS
- [x] `src/opda_gen/ci/byte_identity.py` — cites ODR-0004 §6a #3, ADR-0007 §"Byte-identity CI test", ADR-0008 §"CI workflow". PASS
- [x] `tests/test_serialiser.py` — cites ADR-0008 §"Confirmation" #3, ADR-0007 §"Deterministic emission rules" #1-6, ODR-0004 §6a #1. PASS
- [x] `tests/test_term_sourcing.py` — cites ADR-0008 §"Confirmation" #3, ADR-0007 §"Term-sourcing five-line precedence", ODR-0004 §7a. PASS
- [x] `tests/test_blank_nodes.py` — cites ADR-0008 §"Confirmation" #3, ADR-0007 §"Deterministic emission rules" #4, ODR-0004 §6a #1. PASS
- [x] `tests/test_three_graph.py` — cites ADR-0008 §"Confirmation" #3, ODR-0004 §3a, ADR-0007 §"Three-graph emission constraints". PASS
- [x] `tests/test_byte_identity.py` — cites ADR-0008 §"Confirmation" #3 + #6, ADR-0007 §"Byte-identity CI test" sub-test #1, ODR-0004 §6a #3. PASS
- [x] `tests/__init__.py` — empty (package marker only). PASS (no cite needed)

**Soundness verdict: 28/28 PASS** (one PASS-with-flag for `term_sourcing.py` — see Surfaced ambiguity). Every non-empty source file declares its ADR/ODR provenance; every cited section was verified to exist in the cited document.

## Completeness check

### ADR-0008 §Confirmation criteria (six)

- [x] §Confirmation #1 — package installs — realised via `pyproject.toml` (locked deps), `.python-version` (3.11), verified by `.venv/bin/pip install -e .[dev]` — PASS
- [x] §Confirmation #2 — CLI runs (`opda-gen --version`) — verified `opda-gen 0.1.0 (2ac4ce2)` — PASS
- [x] §Confirmation #3 — test suite green — `pytest -v` → 28 passed in 0.07s (independently re-run) — PASS
- [x] §Confirmation #4 — CI workflow exists — `.github/workflows/ontology-byte-identity.yml` (48 lines, runs `--version` + `pytest -q`; diff steps explicitly commented with ADR-0009 unblock note) — PASS (with honest deferral)
- [x] §Confirmation #5 — README ships — `tools/opda-gen/README.md` covers installation, usage, contribution guide, ADR-0007/0008 backlinks, emitter-realisation table — PASS
- [x] §Confirmation #6 — reproducibility verified — `test_foundation_stub_byte_identical_across_runs` exercises consecutive-run identity; locked deps + custom serialiser provide the necessary conditions for cross-machine identity; cross-machine verification deferred to a second contributor — PASS (single-machine; deferred cross-machine to first ADR-0009 PR run)

### ADR-0007 §"Deterministic emission rules" (six rules)

- [x] Rule #1 (prefix declarations alphabetised) — `serialiser/canonical.py:142` calls `sort_prefixes` from `ordering.py:73` — PASS
- [x] Rule #2 (term emission order: `owl:Ontology` → `owl:Class` → `owl:DatatypeProperty` → `owl:ObjectProperty` → `sh:NodeShape` → `sh:PropertyShape` → `skos:Concept`) — `ordering.py:23-31` `TERM_TYPE_ORDER` + `type_rank()` — PASS
- [x] Rule #3 (within-term order: `rdf:type` → label → comment → `dct:source` → predicate-lex) — `ordering.py:56-68` `PREDICATE_PRIORITY` + `predicate_rank()` — PASS
- [x] Rule #4 (blank nodes SHA-256 skolemised, recursive, prefix `_:b<hex12>`) — `serialiser/blank_nodes.py:61-75` `_skolem_for` recursive (depth cap 32) — PASS
- [x] Rule #5 (string literal escaping; `xsd:string` implicit; `@en` explicit) — `serialiser/canonical.py:61-78` `_format_literal` — PASS
- [x] Rule #6 (LF endings; no trailing whitespace; no BOM; final newline; 4-space indent; blank line between blocks) — `serialiser/canonical.py:194-197` + per-block-blank at line 191 — PASS

### ADR-0007 §"Term-sourcing five-line precedence"

- [PASS-with-ambiguity] Realised in `term_sourcing.py:246-283` `resolve_term` with the five-tier order — PASS but see Surfaced ambiguity (ADR-0007 ↔ ODR-0004 §7a order misalignment).

### ADR-0007 §"Three-graph emission constraints"

- [DEFERRED] Generator-side emission constraints (no `sh:` in `opda-classes.ttl`, no `owl:imports` in `opda-shapes.ttl`, etc. at emission time) — deferred to ADR-0009+ (the emitters that actually write the three files). ADR-0008 wires only the CI-side detection.
- [x] CI-side check in `ci/three_graph_test.py` — five functions cover all five MUST-NOT/MUST checks — PASS

### ADR-0007 §"Module pluralism"

- [DEFERRED] Per-module emission — deferred to ADR-0011 with explicit trigger ("module TBox emission"). PASS

### ADR-0007 §"A9 per-kind discipline output"

- [PARTIAL] `inputs/odr_corpus.py` parses ODR frontmatter + `## Rules` so the downstream emitter (ADR-0011) can extract `kind: pattern` UFO categories — realised. Actual class emission with `dct:source` + `skos:scopeNote` + `rdfs:comment` deferred to ADR-0011 (no classes are minted at ADR-0008). PASS (deferred with trigger)

### ODR-0004 §3a five-part CI test

- [x] Clause #1 (no `sh:*` in annotations) — `check_no_shacl_in_annotations` (lines 38-51) + positive+negative tests (test_three_graph.py lines 30-41) — PASS
- [x] Clause #2 (no `owl:imports` from shapes) — `check_no_owl_imports_in_shapes` (lines 57-68) + positive+negative tests (lines 44-56) — PASS
- [x] Clause #3 (no advisory annotations in shapes) — `check_no_advisory_in_shapes` (lines 81-96) with explicit whitelist [`aiHint`, `uiHint`, `exampleValue`] + positive+negative tests (lines 59-69) — PASS
- [x] Clause #4 (every `sh:targetClass` resolves) — `check_target_class_resolves` (lines 102-125) + positive+negative tests (lines 72-86) — PASS
- [DEFERRED] Clause #5 (derived consumer profiles have no commits outside service account) — `check_derived_provenance` (lines 132-147) is a stub returning empty; deferred to ADR-0009 (git-blame check needed; no derived artefacts exist yet at ADR-0008). No regression test exists for clause #5. PASS with deferred trigger to ADR-0009.

### ODR-0004 §6a (deterministic emission + byte-identity CI)

- [x] Sub-rule #1 (deterministic emission ordering) — realised (see ADR-0007 §"Deterministic emission rules" rows above) — PASS
- [DEFERRED] Sub-rule #2 (generator version recorded in ontology header) — deferred to ADR-0009 with explicit trigger (no real foundation header yet at ADR-0008). PASS-deferred
- [x] Sub-rule #3 (CI byte-identity test) — `ci/byte_identity.py:29-48` `run()` + `test_byte_identity.py` 3 tests — PASS
- [x] Cagle's sub-test #1 (consecutive-run identity) — `test_foundation_stub_byte_identical_across_runs` — PASS
- [DEFERRED] Cagle's sub-tests #2-4 (committed-reference SHA match; +1-comment → +1-diff; +1-leaf → +1-block) — deferred to ADR-0009 with explicit trigger (need real dictionary as input). PASS-deferred

### ODR-0004 §7a (five-line precedence + conflict-recording)

- [PASS-with-ambiguity] Five-line precedence — realised but with ADR-0007 ↔ ODR-0004 §7a order misalignment (see Surfaced ambiguity).
- [DEFERRED] Conflict-recording protocol — deferred to ADR-0011 with explicit trigger (the consuming module ODR is where `## Change log` row lands). PASS-deferred
- [x] `dct:source` URI discipline (version IRI; never "latest") — W3C_REGISTRY entries pin version-IRIs (e.g. SHACL `https://www.w3.org/TR/2017/REC-shacl-20170720/#NodeShape` at line 136 of term_sourcing.py) — PASS

### ODR-0004 §8a (diagnostic exemplars)

- [N/A] Exemplar storage path + pairing convention is content-side — realised in ODR's own deliverable + ADR-0014. Not in scope for ADR-0008's infrastructure. PASS

**Completeness verdict: 23 PASS + 8 DEFERRED (each with a named downstream ADR trigger) + 1 N/A.** No silent gaps. One PASS-with-ambiguity item flagged in Surfaced Ambiguity.

## Cross-ADR consistency check

For each downstream ADR whose `depends-on:` cites ADR-0008, verify the emitted infrastructure supports the downstream's confirmation criteria.

- [x] **ADR-0009 foundation emission supported.** ADR-0009 needs: (a) `opda_gen.emitters.foundation` module with a replaceable `build_stub_graph()`; (b) `opda_gen.serialiser.canonical.to_canonical_turtle()` with byte-identity contract; (c) three-graph CI test runnable on emitted output. All three present (`emitters/foundation.py:30-47` stub; `serialiser/canonical.py:108-197`; `ci/three_graph_test.py:run_all`). Foundation stub's deterministic header exercises the pipeline end-to-end. PASS
- [x] **ADR-0010 vocabulary emission supported.** ADR-0010 needs `emit-vocabularies` subcommand + a slot for SKOS scheme + concept emission. `emitters/vocabularies.py:emit` (raises NotImplementedError pointing to ADR-0010) + `ordering.py:TERM_TYPE_ORDER` includes `SKOS.Concept` at index 6 + `cli.py:emit_vocabularies` wired. PASS
- [x] **ADR-0011 module emission supported.** Per ADR-0011 lines 18-21, each module needs: (a) one TTL file per module; (b) `owl:imports` of `opda-classes.ttl` AND `opda-vocabularies.ttl` (multi-import); (c) `owl:versionIRI` per module; (d) A9 per-kind discipline output (`dct:source` + `skos:scopeNote` + `rdfs:comment` per class). All four supported: (a) `emitters/classes.py:emit_module(name, output_dir)` signature accepts module name; (b) canonical serialiser's per-predicate object-grouping (canonical.py:173-179) handles `pred obj1, obj2 ;` shorthand for multiple `owl:imports`; (c) `owl:versionIRI` is a regular triple — no special handling needed; (d) within-class ordering rdf:type → label → comment → dct:source → (skos:scopeNote in default tier alphabetised) matches ADR-0007 §A9 example exactly. PASS
- [x] **ADR-0012 shapes + annotations supported.** Per ADR-0012 lines 33-35, the emitters need: (a) `sh:NodeShape`/`sh:PropertyShape` term-ordering; (b) annotation-graph isolation. Both present: (a) `ordering.py:TERM_TYPE_ORDER` indices 4 + 5 (NodeShape, PropertyShape); (b) `ci/three_graph_test.py:check_no_shacl_in_annotations` + `check_no_advisory_in_shapes` enforce isolation. `emitters/shapes.py` + `emitters/annotations.py` stubs wired. PASS
- [x] **ADR-0013 profile emission supported.** Per ADR-0013, `emit-profile <overlay>` needs a string-arg subcommand + composer hook. `cli.py:emit_profile` (lines 148-160) takes `overlay` arg + composer.py stub realised. PASS
- [x] **ADR-0014 round-trip MVP supported.** Per ADR-0014, `validate-exemplar <path>` needs a path-arg subcommand. `cli.py:validate_exemplar` (lines 216-222) wired with NotImplementedError pointing to ADR-0014. PASS

Additional cross-ADR consistency probes:

- [x] **Multi-namespace prefix emission.** ADR-0011 requires modules to declare `opda:`, `owl:`, `rdfs:`, `skos:`, `dct:`, `xsd:`, `prov:`, `time:` prefixes (per ADR-0011 lines 68-75). Canonical serialiser will emit any prefix bound to the graph that has a referenced IRI. For an ADR-0011 module that uses all eight namespaces, all eight will be emitted alphabetised. PASS
- [x] **Term-type ordering verification.** ADR-0011 modules will have `owl:Ontology` (header) + `owl:Class` + `owl:DatatypeProperty` + `owl:ObjectProperty` blocks. `TERM_TYPE_ORDER` puts these at indices 0/1/2/3 — correct order. PASS
- [x] **Determinism sources audit.** `set()` iteration in `canonical.py:121-141` only feeds `any()` membership tests (order-independent). `set()` iteration in `blank_nodes.py:85` feeds a deterministic per-node hash computation (order-independent output). No other `set` / `frozenset` usage in `serialiser/`. Python 3.11+ dicts are ordered; `PYTHONHASHSEED` is not relevant for `sorted()` calls. PASS
- [x] **Test coverage non-triviality.** Independently re-read all 5 test files (147 + 100 + 83 + 86 + 62 = 478 LOC). Tests exercise: 100-run determinism loop (test_serialiser.py:59-64); positive AND negative cases for each §3a check (test_three_graph.py); precedence priority including W3C-beats-glossary (test_term_sourcing.py:88-100); recursive nested-blank determinism (test_blank_nodes.py:64-83); end-to-end byte-identity across two tmp dirs (test_byte_identity.py:25-37). No trivial smoke tests. PASS

**Cross-ADR consistency verdict: 6/6 PASS for required downstream ADRs + 4/4 PASS for additional probes.**

## Surfaced ambiguity (worker-flagged)

**Prefix-filter heuristic in `serialiser/canonical.py:138`:**

```python
if not any(iri.startswith(ns_str) for iri in referenced_iris):
    continue
```

A namespace bound to the graph but referenced by no triple is filtered out. The worker noted this could in principle miss a namespace if an emitter wants to bind a prefix for `sh:prefixes` on the ontology header WITHOUT triples that use the namespace's IRIs.

- **Independent assessment: theoretical-only at ADR-0008+0009+0010+0011+0012+0013.** ADR-0009's foundation header per its template lines 41-50 builds the `sh:prefixes` declaration as a blank node graph (`_:b sh:declare _:c; sh:namespace "https://..."^^xsd:anyURI`), so the namespace IRI WILL appear as an object literal — the filter's `referenced_iris.add(str(o.datatype))` at line 130 covers literal datatypes, and the namespace IRI itself appears as a Literal object of `sh:namespace`. The string-IRI literal IS captured by `referenced_iris.add(str(o))` at line 128 if `o` is a URIRef, or by the lexical content otherwise. Wait — the worker's concern is correct only if `sh:namespace` carries a Literal (not URIRef) and `startswith` matching fails. **Sub-risk identified:** The filter checks `iri.startswith(ns_str)` against `referenced_iris` which collects URIRef-str only (not Literal-str). If `sh:namespace` is a Literal as ADR-0009 template line 51 suggests (`"https://w3id.org/opda/#"^^xsd:anyURI`), the namespace IRI string is NOT in `referenced_iris`. ADR-0009 implementation will need to either bind only namespaces actually used in triples, OR add a `prefixes()`-only graph that contains placeholder triples to force binding, OR adjust the filter to also scan Literal lexical values for IRI-shaped strings.
- **Recommendation:** Flag this as a known limitation in ADR-0009's implementation report. The remediation is small (add Literal-value scanning to `referenced_iris` collection) and can land in ADR-0009 alongside the foundation header. NOT a blocker for ADR-0008's acceptance; ADR-0008's infrastructure is correct for the scope it claims.

## Additional findings (not worker-flagged)

### Finding 1: ADR-0007 ↔ ODR-0004 §7a term-sourcing precedence misalignment

This is a **specification-vs-rules misalignment in upstream ADR-0007 / ODR-0004**, not introduced by ADR-0008's implementation. ODR-0004 §7a (the ratified `## Rules` text, lines 101-114) reads:

1. W3C / external spec — authoritative
2. OPDA Trust Framework — authoritative
3. **Other regulatory authorities (FCA, ICO, HMLR) — contextual, not authoritative**
4. **OPDA business glossary — project-internal**
5. Schema-leaf annotation — lowest-trust

But ADR-0007 §"Term-sourcing five-line precedence" pseudocode (lines 134-153) re-orders these as:

1. W3C
2. OPDA TF
3. **Business glossary**
4. **Data dictionary**
5. External regulator (contextual)

ADR-0008's `term_sourcing.py` correctly implements ADR-0007's pseudocode (the spec it was tasked with implementing). The doc-comment (lines 12-18) acknowledges the discrepancy and rationalises: "downstream emitters emit `skos:scopeNote` for tier-5 contextual sources per the programme plan's authoritative/contextual distinction" — preserving the contextual/authoritative distinction even though the lookup tier numbers differ.

- **Impact assessment:** The semantic outcome is roughly equivalent: regulators emit as `skos:scopeNote` (contextual) regardless of which tier number they get. But the **tier-3 mention in ODR-0004 §7a** is "Other regulatory authorities (contextual, not authoritative)" — ADR-0008's tier 3 is "business glossary (authoritative)". A future emitter that branches on `tier == 3` will be wrong if it expects "regulator (contextual)" semantics.
- **Council route per programme plan §9.4:** This is a genuine `## Rules` ambiguity (two ratified documents — ODR-0004 §7a and ADR-0007 §"Term-sourcing" — disagree). Engineering does NOT silently reconcile. Recommend an Author-only Council amendment per ODR-0001 §"Self-amendment process" to either (a) re-order ODR-0004 §7a to match ADR-0007's resolver order, OR (b) amend ADR-0007 pseudocode to match ODR-0004 §7a's regulator-as-tier-3 ordering. **NOT a blocker for ADR-0008 acceptance**; the implementation is consistent with ADR-0007 which is what it was tasked to implement.

### Finding 2: ODR-0004 §3a clause #5 has no regression test

`check_derived_provenance` (`ci/three_graph_test.py:132-147`) is honestly stubbed (returns `[]`). No test in `test_three_graph.py` covers clause #5 (8 tests cover clauses 1-4 with positive+negative cases). The worker noted this in the implementation report §4. Acceptable as DEFERRED-to-ADR-0009 with named trigger ("git-blame check needed when derived artefacts ship"). Recommend a follow-up issue or named ADR-0009 confirmation criterion.

### Finding 3: CI workflow comment-block lacks reactivation triggers per step

`.github/workflows/ontology-byte-identity.yml` lines 31-49 commented out four steps with a single ADR-0009 unblock note. Three of the four steps activate at ADR-0009 (foundation diff + ci-three-graph against real corpus), but `validate-exemplar` activates at ADR-0014, not ADR-0009. **Minor:** the comment block should differentiate. Recommend splitting the comment block:
- Steps 35-44 (regenerate corpus, byte-identity diff, ci-three-graph): "Activated by ADR-0009"
- Steps 46-48 (validate-exemplar): "Activated by ADR-0014"

NOT a blocker; cosmetic.

### Finding 4: `pip install -e .[dev]` deviation from ADR-0008 §"CI workflow"

ADR-0008 §"CI workflow" line 190 shows `run: pip install -e .` (no dev extras). The actual workflow at line 21 uses `pip install -e .[dev]` (with dev extras). This is because pytest is in `[project.optional-dependencies] dev` per `pyproject.toml:21-22`, not in the main `dependencies` list. The deviation is functionally necessary (otherwise `pytest -q` at line 29 would fail). **NOT a blocker**; ADR-0008 §"CI workflow" pseudocode was illustrative; the implementation matches what's actually needed.

### Finding 5: Worker report version-output discrepancy

The worker's implementation report §2 row #2 shows `opda-gen 0.1.0 (16481b8)` but independent re-run yields `opda-gen 0.1.0 (2ac4ce2)`. This is expected — the worker generated the version output BEFORE committing (HEAD was `16481b8`), and the commit itself moved HEAD to `2ac4ce2`. The git_sha resolves to current HEAD at runtime. **Not a defect**; explanatory note.

## Verdict

**PASS-WITH-FOLLOW-UPS**

ADR-0008 honourably realises every implementation criterion in scope. The infrastructure correctly supports the downstream ADR-0009..0014 contracts. All 28 tests pass; the canonical serialiser pipeline is deterministic (verified independently across 100 runs via `test_serialiser_determinism_100_runs`); all 10 CLI subcommands are wired; all 5 ODR-0004 §3a CI checks are implemented (with clause #5 honestly stubbed and named-deferred); doc-comment provenance covers every non-empty Python file.

**Recommendation:** ADR-0008 status moves `proposed → accepted` subject to the four follow-ups below being explicitly named-and-queued (not silent).

### Named follow-ups

1. **Council Author-only amendment (programme plan §9.4) — term-sourcing precedence misalignment between ODR-0004 §7a and ADR-0007 §"Term-sourcing five-line precedence".** Two ratified documents disagree on whether tier 3 is "glossary" or "regulator". Engineering route: open an Author-only Council session per ODR-0001 §"Self-amendment process" to reconcile. Until reconciled, ADR-0008's implementation (consistent with ADR-0007) stands.

2. **ADR-0009 follow-up — prefix-filter heuristic refinement.** The canonical serialiser's prefix filter excludes namespaces bound to the graph but not referenced by any URIRef in any triple. ADR-0009's foundation header may need to either (a) bind only used namespaces, OR (b) scan Literal lexical values for IRI-shaped strings to capture `sh:namespace "https://..."^^xsd:anyURI` style declarations, OR (c) add explicit `prefixes()`-only triples. Decision belongs in ADR-0009's implementation report.

3. **ADR-0009 follow-up — `check_derived_provenance` (§3a clause #5) git-blame implementation + regression test.** Currently a stub returning `[]`. ADR-0009 wires git-blame inspection + adds a test (positive: clean commit history; negative: commit from non-service-account author). Named in the implementation report §4.

4. **Minor cosmetic — split the CI workflow comment block** into "Activated by ADR-0009" (steps 35-44) and "Activated by ADR-0014" (step 47-48). Non-blocking; can land in ADR-0009 or ADR-0014.

### Acceptance criteria post-follow-up

ADR-0008 moves to `status: accepted` once:
- Follow-up 1 is named in the Council backlog (programme plan §9.4 trigger fired);
- Follow-ups 2-4 are explicitly queued against their target ADRs.

The implementation itself does not require further changes for acceptance.

## References

- [ADR-0008 — Generator implementation infrastructure](../ADR-0008-generator-implementation-infrastructure.md)
- [ADR-0007 — Ontology generator specification](../ADR-0007-ontology-generator-specification.md)
- [ODR-0004 — PDTF ontology foundation](../../ontology/odr/ODR-0004-pdtf-ontology-foundation.md)
- [Programme plan §9 — Validation discipline](../../plan/ontology-implementation.md)
- [Implementation report](../implementation-reports/ADR-0008-implementation.md)
- Worker commit: 2ac4ce29f0fcefc9cda2b027078fac737896a27a
